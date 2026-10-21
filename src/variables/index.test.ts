import { beforeEach, describe, expect, it, vi } from 'vitest';
import { compositePriceCashbackCombinedWithComponentCashbacks } from '../__tests__/fixtures/price.samples';
import { tax19percent } from '../__tests__/fixtures/tax.samples';
import { computeAggregatedAndPriceTotals } from '../computations/compute-totals';
import {
  fixedCashbackCoupon,
  lowFixedCashbackCoupon,
  percentage10DiscountCoupon,
} from '../coupons/__tests__/coupon.fixtures';
import type { I18n, CompositePrice, PriceInputMappings, PriceItem } from '../shared/types';
import {
  orderWithCompositeItem,
  orderWithCompositeItemResults,
  orderWithMultiplePrices,
  orderWithMultiplePricesResults,
  initialOrderEntityData,
  priceWithCorrectQuantity,
  orderEntityDataWithEmptyLineItems,
  invalidOrderEntityData,
} from './__tests__/orders.fixtures';
import { processOrderTableData } from './process-order-table-data';
import type { PriceDisplayType } from './types';
import { getHiddenAmountString, getPriceDisplayInJourneys, getQuantity, unitAmountApproved } from './utils';

const mockI18n = {
  t: (key: string, fallback: string) => key || fallback,
  language: 'de',
} as I18n;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('processOrderTableData', () => {
  it('returns correctly', async () => {
    const result = await processOrderTableData(orderWithCompositeItem as any, mockI18n);
    expect(result.products.length).toBe(12);
    expect(result.products[0]).toEqual(
      expect.objectContaining({
        quantity: 1,
        price: expect.objectContaining({
          quantity: '1',
          quantity_billing_period: undefined,
        }),
      }),
    );
    expect(result.products[1]).toEqual(
      expect.objectContaining({
        quantity: 1,
        price: expect.objectContaining({
          quantity: '1',
          quantity_billing_period: undefined,
        }),
      }),
    );
    expect(result.products[2]).toEqual(
      expect.objectContaining({
        quantity: 1,
        price: expect.objectContaining({
          quantity: '75 ',
          quantity_billing_period: 'table_order.recurrences.billing_period.yearly',
        }),
      }),
    );
    expect(result.products[3]).toEqual(
      expect.objectContaining({
        quantity: 1,
        price: expect.objectContaining({
          quantity: '75 ',
          quantity_billing_period: undefined,
        }),
      }),
    );
    expect(result.products[4]).toEqual(
      expect.objectContaining({
        quantity: 1,
        price: expect.objectContaining({
          quantity: '---',
          quantity_billing_period: undefined,
        }),
      }),
    );
    expect(result.products[5]).toEqual(
      expect.objectContaining({
        quantity: 1,
        price: expect.objectContaining({
          quantity: '1',
          quantity_billing_period: undefined,
        }),
      }),
    );
    expect(result.products[8]).toEqual(
      expect.objectContaining({
        price: expect.objectContaining({
          unit_amount: 'show_as_on_request',
        }),
      }),
    );
    expect(result.products[11]).toEqual(
      expect.objectContaining({
        price: expect.objectContaining({
          unit_amount: 'show_as_on_request',
        }),
      }),
    );
    expect(result.total_details.recurrences).toEqual(orderWithCompositeItemResults.total_details.recurrences);
  });

  it('leaves the line item unit_amount_net as a raw numeric value (mirroring unit_amount_gross)', async () => {
    const result = await processOrderTableData(orderWithCompositeItem as any, mockI18n);

    const item = result.products[7];

    // The line item keeps the raw numeric net amount, it is NOT overwritten with a formatted string.
    expect(item.unit_amount_net).toBe(65000);
    expect(typeof item.unit_amount_net).toBe('number');

    // The formatted value is still exposed under price.unit_amount_net for templates that render it.
    expect(item.price.unit_amount_net).toBe('650,00\xa0€');
  });

  it('returns correctly the tax details', async () => {
    const result = await processOrderTableData(orderWithMultiplePrices as any, mockI18n);
    expect(result.total_details.recurrences).toEqual(orderWithMultiplePricesResults.total_details.recurrences);
  });

  it('returns correct data avoiding reprocessing of flatten items', async () => {
    // when
    const dataWithFlattenLineItems1 = await processOrderTableData(initialOrderEntityData as any, mockI18n);

    // then
    expect(dataWithFlattenLineItems1.products.length).toBe(12);
    expect(dataWithFlattenLineItems1.products[1].price).toEqual(expect.objectContaining(priceWithCorrectQuantity));

    // when
    const dataWithFlattenLineItems2 = await processOrderTableData(dataWithFlattenLineItems1 as any, mockI18n);

    // then
    expect(dataWithFlattenLineItems2.products.length).toBe(12);
    expect(dataWithFlattenLineItems2.products[1].price).toEqual(expect.objectContaining(priceWithCorrectQuantity));
  });

  it('return original data/skip processing if line items are empty', async () => {
    // when
    const data = await processOrderTableData(orderEntityDataWithEmptyLineItems as any, mockI18n);

    // then
    expect(data).toEqual(orderEntityDataWithEmptyLineItems);
  });

  it('return original data/skip processing if line items are invalid', async () => {
    // when
    const data = await processOrderTableData(invalidOrderEntityData as any, mockI18n);

    // then
    expect(data).toEqual(invalidOrderEntityData);
  });
});

describe('getQuantity', () => {
  const baseVariableItem = {
    price_id: 'price_id',
    _price: {
      pricing_model: 'per_unit',
      variable_price: true,
    },
  };

  const baseNotVariableItem = {
    price_id: 'price_id',
    _price: {
      pricing_model: 'per_unit',
      variable_price: false,
    },
  };

  const baseMappings = [{ price_id: 'price_id', value: 75 }];
  const zeroBaseMappings = [{ price_id: 'price_id', value: 0 }];
  const wrongBaseMappings = [{ price_id: 'price_id_1', value: 75 }];

  it.each`
    baseItem               | parentItem             | quantity     | parentQuantity | mappings             | expected
    ${baseNotVariableItem} | ${undefined}           | ${1}         | ${1}           | ${undefined}         | ${'1'}
    ${baseNotVariableItem} | ${undefined}           | ${2}         | ${2}           | ${undefined}         | ${'2'}
    ${baseNotVariableItem} | ${baseVariableItem}    | ${1}         | ${1}           | ${undefined}         | ${'1'}
    ${baseNotVariableItem} | ${baseVariableItem}    | ${2}         | ${2}           | ${undefined}         | ${'2 x 2'}
    ${baseVariableItem}    | ${undefined}           | ${1}         | ${1}           | ${undefined}         | ${'---'}
    ${baseVariableItem}    | ${undefined}           | ${2}         | ${2}           | ${undefined}         | ${'2 x ---'}
    ${baseVariableItem}    | ${undefined}           | ${1}         | ${1}           | ${baseMappings}      | ${'75 '}
    ${baseVariableItem}    | ${undefined}           | ${2}         | ${2}           | ${baseMappings}      | ${'2 x 75 '}
    ${baseVariableItem}    | ${baseVariableItem}    | ${1}         | ${1}           | ${undefined}         | ${'---'}
    ${baseVariableItem}    | ${baseVariableItem}    | ${2}         | ${2}           | ${undefined}         | ${'2 x ---'}
    ${baseVariableItem}    | ${baseVariableItem}    | ${1}         | ${1}           | ${baseMappings}      | ${'75 '}
    ${baseVariableItem}    | ${baseVariableItem}    | ${2}         | ${2}           | ${baseMappings}      | ${'2 x 75 '}
    ${baseVariableItem}    | ${baseVariableItem}    | ${2}         | ${2}           | ${wrongBaseMappings} | ${'2 x ---'}
    ${baseVariableItem}    | ${baseVariableItem}    | ${2}         | ${2}           | ${zeroBaseMappings}  | ${'2 x 0 '}
    ${baseVariableItem}    | ${baseVariableItem}    | ${undefined} | ${2}           | ${baseMappings}      | ${'2 x 75 '}
    ${baseNotVariableItem} | ${baseNotVariableItem} | ${6}         | ${2}           | ${undefined}         | ${'2 x 6'}
  `(
    'returns $expected for the inputs',
    async ({
      baseItem,
      parentItem,
      quantity,
      parentQuantity,
      mappings,
      expected,
    }: {
      baseItem: PriceItem;
      parentItem: PriceItem | undefined;
      quantity: number;
      parentQuantity: number;
      mappings: PriceInputMappings;
      expected: string;
    }) => {
      const mappedParentItem = parentItem && {
        ...parentItem,
        ...(parentQuantity && { quantity: parentQuantity }),
        ...(mappings && { price_mappings: mappings }),
      };

      const item = {
        ...baseItem,
        ...(quantity && { quantity }),
        ...(mappings && { price_mappings: mappings }),
      };

      const result = getQuantity(item, mappedParentItem);

      expect(result).toBe(expected);
    },
  );
});

describe('unitAmountApproved', () => {
  it('should return true when item._price.price_display_in_journeys is not "show_as_on_request"', async () => {
    const item = {
      _price: {
        price_display_in_journeys: 'show_price',
      },
    };
    expect(unitAmountApproved(item as any)).toBe(true);
  });

  it('should return true when item.is_composite_price is true and item_components has "show_price" price_display_in_journeys', async () => {
    const item = {
      is_composite_price: true,
      item_components: [
        {
          _price: {
            price_display_in_journeys: 'show_price',
          },
        },
        {
          _price: {
            price_display_in_journeys: 'show_price',
          },
        },
      ],
    };
    expect(unitAmountApproved(item as any)).toBe(true);
  });

  it('should return true when item.on_request_approved is true', async () => {
    const item = {
      on_request_approved: true,
    };
    expect(unitAmountApproved(item as any)).toBe(true);
  });

  it('should return true when item.parent_item.on_request_approved is true', async () => {
    const item = {
      parent_item: {
        on_request_approved: true,
      },
    };
    expect(unitAmountApproved(item as any)).toBe(true);
  });

  it('should return false when all conditions are false', async () => {
    const item = {
      _price: {
        price_display_in_journeys: 'show_as_on_request',
      },
      is_composite_price: true,
      item_components: [
        {
          _price: {
            price_display_in_journeys: 'show_as_on_request',
          },
        },
      ],
      on_request_approved: false,
      parent_item: {
        on_request_approved: false,
      },
    };
    expect(unitAmountApproved(item as any)).toBe(false);
  });
});

describe('getHiddenAmountString', () => {
  it('should return "---" for a composite price with no matching component', async () => {
    const priceItem = {
      is_composite_price: true,
      _price: {
        price_display_in_journeys: 'show_as_on_request',
      },
      item_components: [
        {
          _price: {
            price_display_in_journeys: 'other_value',
          },
        },
      ],
    } as CompositePrice;

    const result = getHiddenAmountString(mockI18n.t, getPriceDisplayInJourneys(priceItem));

    expect(result).toBe('show_as_on_request');
  });

  it('should return the translation for a composite price', async () => {
    const priceItem = {
      is_composite_price: true,
      _price: {
        price_display_in_journeys: 'show_as_on_request',
      },
      item_components: [
        {
          _price: {
            price_display_in_journeys: 'other_value',
          },
        },
        {
          _price: {
            price_display_in_journeys: 'show_as_starting_price',
          },
        },
      ],
    } as CompositePrice;

    const result = getHiddenAmountString(mockI18n.t, getPriceDisplayInJourneys(priceItem));

    expect(result).toBe('show_as_on_request');
  });

  it('should return the translation for a non-composite price with a parentItem', async () => {
    const priceItem = {
      pricing_model: 'per_unit',
      _price: {
        price_display_in_journeys: 'other_value' as PriceDisplayType,
        pricing_model: 'per_unit',
      },
      parent_item: {
        _price: {
          price_display_in_journeys: 'show_as_on_request',
        },
      },
    } as PriceItem;

    const result = getHiddenAmountString(mockI18n.t, getPriceDisplayInJourneys(priceItem));

    expect(result).toBe('show_as_on_request');
  });

  it('should return the translation for a non-composite price with NO parentItem', async () => {
    const priceItem = {
      _price: {
        price_display_in_journeys: 'show_as_on_request',
      },
    } as PriceItem;

    const result = getHiddenAmountString(mockI18n.t, getPriceDisplayInJourneys(priceItem));
    const resultWithAmount = getHiddenAmountString(mockI18n.t, getPriceDisplayInJourneys(priceItem), '€123.45');

    expect(result).toBe('show_as_on_request');
    expect(resultWithAmount).toBe('show_as_on_request');
  });

  it('should return the correct translations when price is starting at', async () => {
    const priceItem = {
      _price: {
        price_display_in_journeys: 'show_as_starting_price',
      },
    } as PriceItem;

    const resultWithFormattedString = getHiddenAmountString(
      mockI18n.t,
      getPriceDisplayInJourneys(priceItem),
      '€123.45',
    );
    const resultWithZeroNumber = getHiddenAmountString(mockI18n.t, getPriceDisplayInJourneys(priceItem), 0);
    const resultWithNumber = getHiddenAmountString(mockI18n.t, getPriceDisplayInJourneys(priceItem), 123);
    const resultWithUndefined = getHiddenAmountString(mockI18n.t, getPriceDisplayInJourneys(priceItem), undefined);

    expect(resultWithFormattedString).toBe('show_as_starting_price €123.45');
    expect(resultWithZeroNumber).toBe('show_as_starting_price 0');
    expect(resultWithNumber).toBe('show_as_starting_price 123');
    expect(resultWithUndefined).toBe('show_as_starting_price');
  });
});

describe('processOrderTableData line item amounts', () => {
  const buildPriceItem = (id: string, unitAmountDecimal: string, coupons?: PriceItem['_coupons']) => ({
    price_id: id,
    quantity: 2,
    taxes: [{ tax: tax19percent }],
    _price: {
      _id: id,
      unit_amount_currency: 'EUR',
      unit_amount_decimal: unitAmountDecimal,
      type: 'one_time' as const,
      is_tax_inclusive: true,
      pricing_model: 'per_unit' as const,
      tax: [tax19percent],
      description: `Price ${id}`,
    },
    _product: { name: `Product ${id}`, type: 'product' },
    ...(coupons && { _coupons: coupons }),
  });

  /* Builds the order table data the same way an order is built from computed prices */
  const processOrder = (priceItems: Parameters<typeof computeAggregatedAndPriceTotals>[0]) => {
    const totals = computeAggregatedAndPriceTotals(priceItems);

    return processOrderTableData({ ...totals, line_items: totals.items }, mockI18n);
  };

  /* Formatted amounts may use non-breaking spaces */
  const normalizeSpaces = (value: unknown) => (typeof value === 'string' ? value.replace(/\s/g, ' ') : value);

  type DisplayedProduct = { name?: string; is_composite_component?: boolean; price: Record<string, unknown> };

  const getDisplayedAmounts = (product: DisplayedProduct) => ({
    name: product.name,
    unit_amount: normalizeSpaces(product.price.unit_amount),
    unit_amount_net: normalizeSpaces(product.price.unit_amount_net),
    amount_subtotal: normalizeSpaces(product.price.amount_subtotal),
    amount_tax: normalizeSpaces(product.price.amount_tax),
    amount_total: normalizeSpaces(product.price.amount_total),
  });

  const discountCoupon = { ...percentage10DiscountCoupon, category: 'discount' as const };

  it('shows items with a discount coupon before discount, followed by a line with the discount', () => {
    const data = processOrder([buildPriceItem('a', '11.90', [discountCoupon])]);

    expect(data.products.map(getDisplayedAmounts)).toEqual([
      {
        name: 'Product a',
        unit_amount: '11,90 €',
        unit_amount_net: '10,00 €',
        amount_subtotal: '20,00 €',
        amount_tax: '3,80 €',
        amount_total: '23,80 €',
      },
      {
        name: discountCoupon.name,
        unit_amount: '-1,19 €',
        unit_amount_net: '-1,00 €',
        amount_subtotal: '-2,00 €',
        amount_tax: '-0,38 €',
        amount_total: '-2,38 €',
      },
    ]);
  });

  it('shows a line with the cashback for items with a cashback coupon', () => {
    const data = processOrder([buildPriceItem('b', '23.80', [fixedCashbackCoupon])]);

    expect(data.products.map(getDisplayedAmounts)).toEqual([
      {
        name: 'Product b',
        unit_amount: '23,80 €',
        unit_amount_net: '20,00 €',
        amount_subtotal: '40,00 €',
        amount_tax: '7,60 €',
        amount_total: '47,60 €',
      },
      {
        name: fixedCashbackCoupon.name,
        unit_amount: '',
        unit_amount_net: '',
        amount_subtotal: '0,00 €',
        amount_tax: '0,00 €',
        amount_total: '-20,00 €',
      },
    ]);
    expect(data.products[1].price.type).toBe('one_time');
  });

  it('shows the cashback of the composite price coupon', () => {
    const data = processOrder([compositePriceCashbackCombinedWithComponentCashbacks]);

    expect(
      data.products.map((product: DisplayedProduct) => [
        product.name,
        Boolean(product.is_composite_component),
        normalizeSpaces(product.price.amount_total),
      ]),
    ).toEqual([
      ['Eletricity Pack 1', false, '0,00 €'],
      [fixedCashbackCoupon.name, false, '-10,00 €'],
      ['Base price per month', true, '10,00 €'],
      ['Wallbox 11 kW', true, '100,00 €'],
      [fixedCashbackCoupon.name, true, '-10,00 €'],
    ]);
  });

  it('shows the cashback of each composite price coupon on its own line', () => {
    const data = processOrder([
      {
        ...compositePriceCashbackCombinedWithComponentCashbacks,
        _coupons: [fixedCashbackCoupon, lowFixedCashbackCoupon],
      },
    ]);

    expect(
      data.products
        .filter((product: DisplayedProduct) => !product.is_composite_component)
        .map((product: DisplayedProduct) => [product.name, normalizeSpaces(product.price.amount_total)]),
    ).toEqual([
      ['Eletricity Pack 1', '0,00 €'],
      [fixedCashbackCoupon.name, '-10,00 €'],
      [lowFixedCashbackCoupon.name, '-5,00 €'],
    ]);
  });

  it('formats the order totals, discount recurrence and cashbacks', () => {
    const data = processOrder([
      buildPriceItem('a', '11.90', [discountCoupon]),
      buildPriceItem('b', '23.80', [fixedCashbackCoupon]),
    ]);

    expect(normalizeSpaces(data.amount_total)).toBe('69,02 €');
    expect(normalizeSpaces(data.amount_subtotal)).toBe('58,00 €');
    expect(normalizeSpaces(data.total_details.amount_tax)).toBe('11,02 €');
    expect(data.total_details.recurrences).toHaveLength(2);
    expect(data.total_details.recurrences[0].is_discount_recurrence).toBe(true);
    expect(normalizeSpaces(data.total_details.recurrences[0].amount_total)).toBe('-2,38 €');
    expect(data.total_details.recurrences[1]).toMatchObject({
      amount_total_decimal: '69.02',
      amount_subtotal_decimal: '58',
      amount_tax_decimal: '11.02',
      type: 'one_time',
    });
    expect(
      data.total_details.cashbacks.map(({ amount, ...rest }: Record<string, string>) => ({
        ...rest,
        amount: normalizeSpaces(amount),
      })),
    ).toEqual([{ name: 'table_order.cashback', period: 'table_order.cashback_period.12', amount: '20,00 €' }]);
  });
});
