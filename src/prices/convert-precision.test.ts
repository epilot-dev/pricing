import { describe, expect, it } from 'vitest';
import type { PriceItem, PricingDetails } from '../shared/types';
import {
  convertCashbackAmountsPrecision,
  convertPriceItemPrecision,
  convertPriceItemWithCouponAppliedToPriceItemDto,
  convertPricingPrecision,
} from './convert-precision';

/**
 * Integer amount with DECIMAL_PRECISION (12) for an amount in EUR with up to 2 decimals.
 */
const eur = (amount: number) => Math.round(amount * 100) * 10 ** 10;

const basePriceItem = {
  price_id: 'price#1',
  amount_subtotal: eur(10),
  amount_total: eur(11.9),
  amount_tax: eur(1.9),
  taxes: [{ amount: eur(1.9), rate: 'standard' }],
} as PriceItem;

describe('convertPriceItemPrecision', () => {
  it('converts the required amounts and adds their decimal values', () => {
    const result = convertPriceItemPrecision(basePriceItem);

    expect(result.amount_subtotal).toBe(1000);
    expect(result.amount_subtotal_decimal).toBe('10');
    expect(result.amount_total).toBe(1190);
    expect(result.amount_total_decimal).toBe('11.9');
    expect(result.amount_tax).toBe(190);
    expect(result.taxes).toEqual([{ amount: 190, rate: 'standard' }]);
  });

  it('converts to the given precision', () => {
    const result = convertPriceItemPrecision({ ...basePriceItem, unit_amount: eur(10.25) }, 4);

    expect(result.amount_total).toBe(119000);
    expect(result.unit_amount).toBe(102500);
    expect(result.unit_amount_decimal).toBe('10.25');
  });

  it('defaults missing tax amounts to 0', () => {
    const result = convertPriceItemPrecision({
      ...basePriceItem,
      amount_tax: undefined,
      taxes: [{ rate: 'nontaxable' }],
    } as PriceItem);

    expect(result.amount_tax).toBe(0);
    expect(result.taxes).toEqual([{ rate: 'nontaxable', amount: 0 }]);
  });

  it('only converts optional amounts holding a number, including 0', () => {
    const result = convertPriceItemPrecision({
      ...basePriceItem,
      unit_amount: eur(10),
      unit_amount_net: 0,
      discount_amount: eur(2.5),
      cashback_amount: undefined,
    });

    expect(result.unit_amount).toBe(1000);
    expect(result.unit_amount_decimal).toBe('10');
    expect(result.unit_amount_net).toBe(0);
    expect(result.unit_amount_net_decimal).toBe('0');
    expect(result.discount_amount).toBe(250);
    expect(result.discount_amount_decimal).toBe('2.5');
    expect(result.cashback_amount).toBeUndefined();
    expect(result).not.toHaveProperty('cashback_amount_decimal');
    expect(result).not.toHaveProperty('unit_amount_gross');
    expect(result).not.toHaveProperty('unit_amount_gross_decimal');
  });

  it('converts every optional amount', () => {
    const optionalAmounts = {
      unit_amount: eur(1),
      before_discount_unit_amount: eur(2),
      before_discount_unit_amount_gross: eur(3),
      before_discount_unit_amount_net: eur(4),
      unit_discount_amount: eur(5),
      unit_amount_net: eur(6),
      unit_discount_amount_net: eur(7),
      unit_amount_gross: eur(8),
      discount_amount: eur(9),
      before_discount_amount_total: eur(10),
      before_discount_amount_subtotal: eur(11),
      cashback_amount: eur(12),
      after_cashback_amount_total: eur(13),
      tax_discount_amount: eur(14),
      discount_amount_net: eur(15),
      before_discount_tax_amount: eur(16),
    };

    const result = convertPriceItemPrecision({ ...basePriceItem, ...optionalAmounts });

    Object.entries(optionalAmounts).forEach(([field, amount], index) => {
      expect(result[field as keyof PriceItem]).toBe(amount / 10 ** 10);
      expect(result[`${field}_decimal` as keyof PriceItem]).toBe(String(index + 1));
    });
  });

  it('keeps the discount percentage as is', () => {
    const result = convertPriceItemPrecision({ ...basePriceItem, discount_percentage: 25 });

    expect(result.discount_percentage).toBe(25);
  });

  it('keeps the existing key order and appends the decimal values in a stable order', () => {
    const result = convertPriceItemPrecision({
      price_id: 'price#1',
      tax_discount_amount: eur(1),
      unit_amount_net: eur(1),
      amount_total: eur(1),
      discount_amount: eur(1),
      amount_subtotal: eur(1),
      taxes: [],
    } as PriceItem);

    expect(Object.keys(result)).toEqual([
      'price_id',
      'tax_discount_amount',
      'unit_amount_net',
      'amount_total',
      'discount_amount',
      'amount_subtotal',
      'taxes',
      'unit_amount_net_decimal',
      'amount_subtotal_decimal',
      'amount_total_decimal',
      'discount_amount_decimal',
      'amount_tax',
      'tax_discount_amount_decimal',
    ]);
  });

  it('converts tiers details without adding decimal values', () => {
    const result = convertPriceItemPrecision({
      ...basePriceItem,
      tiers_details: [
        {
          quantity: 2,
          unit_amount: 500,
          unit_amount_decimal: '5.00',
          unit_amount_gross: eur(5.95),
          unit_amount_net: eur(5),
          amount_subtotal: eur(10),
          amount_total: eur(11.9),
          amount_tax: eur(1.9),
        },
      ],
    });

    expect(result.tiers_details).toEqual([
      {
        quantity: 2,
        unit_amount: 500,
        unit_amount_decimal: '5.00',
        unit_amount_gross: 595,
        unit_amount_net: 500,
        amount_subtotal: 1000,
        amount_total: 1190,
        amount_tax: 190,
      },
    ]);
  });

  describe('get_ag', () => {
    const getAg = {
      category: 'power',
      unit_amount_net: eur(10),
      unit_amount_gross: eur(11.9),
      markup_amount_net: eur(1),
      markup_amount_gross: eur(1.19),
      markup_total_amount_net: eur(2),
      markup_total_amount_gross: eur(2.38),
      additional_markups_enabled: true,
      additional_markups: {
        markup1: { amount: 100, amount_decimal: '1.00', amount_net: eur(1), amount_gross: eur(1.19), extra: 'x' },
        markup2: { amount: 50, amount_decimal: '0.50', amount_net: 1.5 },
      },
    } as unknown as NonNullable<PriceItem['get_ag']>;

    it('converts get_ag amounts for GetAG price items', () => {
      const result = convertPriceItemPrecision({ ...basePriceItem, pricing_model: 'external_getag', get_ag: getAg });

      expect(result.get_ag).toEqual({
        category: 'power',
        unit_amount_net: 1000,
        unit_amount_gross: 1190,
        unit_amount_net_decimal: '10',
        unit_amount_gross_decimal: '11.9',
        markup_amount_net: 100,
        markup_amount_net_decimal: '1',
        markup_amount_gross: 119,
        markup_amount_gross_decimal: '1.19',
        markup_total_amount_net: 200,
        markup_total_amount_net_decimal: '2',
        markup_total_amount_gross: 238,
        markup_total_amount_gross_decimal: '2.38',
        additional_markups_enabled: true,
        additional_markups: {
          markup1: {
            amount: 100,
            amount_decimal: '1.00',
            amount_net: 100,
            amount_gross: 119,
            amount_net_decimal: '1',
            amount_gross_decimal: '1.19',
          },
          markup2: {
            amount: 50,
            amount_decimal: '0.50',
            amount_net: undefined,
            amount_gross: undefined,
            amount_net_decimal: undefined,
            amount_gross_decimal: undefined,
          },
        },
      });
      expect(Object.keys(result.get_ag?.additional_markups?.markup2 ?? {})).toEqual([
        'amount',
        'amount_decimal',
        'amount_net',
        'amount_gross',
        'amount_net_decimal',
        'amount_gross_decimal',
      ]);
    });

    it('detects GetAG price items through the price pricing model', () => {
      const result = convertPriceItemPrecision({
        ...basePriceItem,
        _price: { pricing_model: 'external_getag' },
        get_ag: getAg,
      } as PriceItem);

      expect(result.get_ag?.unit_amount_net).toBe(1000);
    });

    it('keeps additional markups untouched when they are not enabled', () => {
      const result = convertPriceItemPrecision({
        ...basePriceItem,
        pricing_model: 'external_getag',
        get_ag: { ...getAg, additional_markups_enabled: false },
      });

      expect(result.get_ag?.additional_markups).toBe(getAg.additional_markups);
    });

    it('keeps get_ag untouched for other pricing models', () => {
      const result = convertPriceItemPrecision({ ...basePriceItem, pricing_model: 'per_unit', get_ag: getAg });

      expect(result.get_ag).toBe(getAg);
    });
  });

  describe('dynamic_tariff', () => {
    const dynamicTariff = {
      mode: 'day_ahead_market',
      average_price: 3,
      unit_amount_net: eur(10),
      unit_amount_gross: 0,
      markup_amount_net: eur(1),
    } as unknown as PriceItem['dynamic_tariff'];

    it('converts dynamic tariff amounts and omits the ones that are 0 or missing', () => {
      const result = convertPriceItemPrecision({
        ...basePriceItem,
        pricing_model: 'dynamic_tariff',
        dynamic_tariff: dynamicTariff,
      });

      expect(result.dynamic_tariff).toStrictEqual({
        mode: 'day_ahead_market',
        average_price: 3,
        unit_amount_net: 1000,
        unit_amount_gross: undefined,
        markup_amount_net: 100,
        unit_amount_net_decimal: '10',
        unit_amount_gross_decimal: undefined,
        markup_amount_net_decimal: '1',
        markup_amount_gross: undefined,
        markup_amount_gross_decimal: undefined,
      });
    });

    it('keeps dynamic_tariff untouched for other pricing models', () => {
      const result = convertPriceItemPrecision({ ...basePriceItem, dynamic_tariff: dynamicTariff });

      expect(result.dynamic_tariff).toBe(dynamicTariff);
    });
  });
});

describe('convertPricingPrecision', () => {
  const breakdown = {
    taxes: [{ amount: eur(1.9), tax: { rate: 19 } }],
    recurrences: [
      {
        type: 'one_time',
        unit_amount_gross: eur(11.9),
        unit_amount_net: eur(10),
        amount_subtotal: eur(10),
        amount_total: eur(11.9),
        amount_tax: eur(1.9),
        discount_amount: eur(1),
        before_discount_amount_total: 2.5,
        after_cashback_amount_total: eur(6.9),
      },
    ],
    recurrencesByTax: [
      {
        type: 'one_time',
        amount_subtotal: eur(10),
        amount_total: eur(11.9),
        amount_tax: eur(1.9),
        tax: { amount: eur(1.9), tax: { rate: 19 } },
      },
    ],
    cashbacks: [{ cashback_period: '0', amount_total: eur(5) }],
  };

  const details = {
    amount_subtotal: eur(10),
    amount_total: eur(11.9),
    amount_tax: eur(1.9),
    currency: 'EUR',
    items: [
      { price_id: 'simple', amount_total: eur(11.9) },
      {
        price_id: 'composite',
        amount_subtotal: eur(10),
        amount_total: eur(11.9),
        total_details: { amount_tax: eur(1.9), breakdown },
      },
    ],
    total_details: { amount_shipping: 0, amount_tax: eur(1.9), breakdown },
  } as unknown as PricingDetails;

  it('converts the totals and the breakdown', () => {
    const result = convertPricingPrecision(details, 2);

    const convertedBreakdown = {
      taxes: [{ amount: 190, tax: { rate: 19 } }],
      recurrences: [
        {
          type: 'one_time',
          unit_amount_gross: 1190,
          unit_amount_net: 1000,
          amount_subtotal: 1000,
          amount_total: 1190,
          amount_tax: 190,
          discount_amount: 100,
          // not an integer, so it is not converted
          before_discount_amount_total: 2.5,
          after_cashback_amount_total: 690,
        },
      ],
      recurrencesByTax: [
        {
          type: 'one_time',
          amount_subtotal: 1000,
          amount_total: 1190,
          amount_tax: 190,
          tax: { amount: 190, tax: { rate: 19 } },
        },
      ],
      cashbacks: [{ cashback_period: '0', amount_total: 500 }],
    };

    expect(result).toEqual({
      amount_subtotal: 1000,
      amount_total: 1190,
      amount_tax: 190,
      currency: 'EUR',
      items: [
        // items without total details are left untouched (they're converted when computed)
        { price_id: 'simple', amount_total: eur(11.9) },
        {
          price_id: 'composite',
          amount_subtotal: 1000,
          amount_total: 1190,
          total_details: { amount_tax: 190, breakdown: convertedBreakdown },
        },
      ],
      total_details: { amount_shipping: 0, amount_tax: 190, breakdown: convertedBreakdown },
    });
  });

  it('does not add amount_tax to composite items without one', () => {
    const result = convertPricingPrecision(details, 2);

    expect(result.items?.[1]).not.toHaveProperty('amount_tax');
  });

  it('does not add optional recurrence amounts', () => {
    const result = convertPricingPrecision(
      {
        ...details,
        total_details: {
          ...details.total_details,
          breakdown: {
            ...breakdown,
            recurrences: [
              {
                type: 'one_time',
                unit_amount_gross: eur(11.9),
                amount_subtotal: eur(10),
                amount_total: eur(11.9),
                amount_tax: eur(1.9),
              },
            ],
          },
        },
      } as PricingDetails,
      2,
    );

    expect(result.total_details?.breakdown?.recurrences?.[0]).toStrictEqual({
      type: 'one_time',
      unit_amount_gross: 1190,
      amount_subtotal: 1000,
      amount_total: 1190,
      amount_tax: 190,
    });
  });
});

describe('convertCashbackAmountsPrecision', () => {
  it('converts the cashback amounts', () => {
    expect(convertCashbackAmountsPrecision(eur(5), eur(6.9))).toStrictEqual({
      cashback_amount: 500,
      cashback_amount_decimal: '5',
      after_cashback_amount_total: 690,
      after_cashback_amount_total_decimal: '6.9',
    });
  });

  it('omits amounts that are 0 or missing', () => {
    expect(convertCashbackAmountsPrecision(0, undefined)).toStrictEqual({});
  });
});

describe('convertPriceItemWithCouponAppliedToPriceItemDto', () => {
  const price = { _id: 'price#1', unit_amount_decimal: '10.00' };

  it('removes the values computed when applying coupons and restores the unit amount', () => {
    const result = convertPriceItemWithCouponAppliedToPriceItemDto({
      price_id: 'price#1',
      quantity: 2,
      unit_amount: 750,
      unit_amount_decimal: '7.50',
      amount_total: 1500,
      before_discount_unit_amount: 1000,
      before_discount_unit_amount_decimal: '10.00',
      before_discount_amount_total: 2000,
      before_discount_amount_total_decimal: '20.00',
      discount_amount: 500,
      discount_amount_decimal: '5.00',
      discount_percentage: 25,
      unit_discount_amount: 250,
      cashback_amount: 0,
      cashback_period: '0',
      _price: price,
    } as PriceItem);

    expect(result).toStrictEqual({
      price_id: 'price#1',
      quantity: 2,
      unit_amount: 1000,
      unit_amount_decimal: '10.00',
      amount_total: 1500,
      _price: price,
    });
  });

  it('keeps the unit amount when there is no amount before discount', () => {
    const result = convertPriceItemWithCouponAppliedToPriceItemDto({
      price_id: 'price#1',
      unit_amount: 750,
      unit_amount_decimal: '7.50',
      after_cashback_amount_total: 500,
      _price: price,
    } as PriceItem);

    expect(result).toStrictEqual({
      price_id: 'price#1',
      unit_amount: 750,
      unit_amount_decimal: '7.50',
      _price: price,
    });
  });
});
