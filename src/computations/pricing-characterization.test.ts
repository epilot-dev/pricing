import { describe, expect, it } from 'vitest';
import {
  compositePriceCashbackCombinedWithComponentCashbacks,
  compositePriceWithComponentsWithCoupons,
} from '../__tests__/fixtures/price.samples';
import { tax19percent } from '../__tests__/fixtures/tax.samples';
import {
  fixedCashbackCoupon,
  fixedDiscountCoupon,
  percentage10DiscountCoupon,
  percentageCashbackCoupon,
} from '../coupons/__tests__/coupon.fixtures';
import type { Coupon, I18n, PriceItemDto, PriceTier } from '../shared/types';
import { processOrderTableData } from '../variables/process-order-table-data';
import { computeAggregatedAndPriceTotals } from './compute-totals';

/**
 * Characterization tests: they pin the complete output of the main entry points for a matrix of
 * pricing models, tax behaviours and coupons, so refactors can be checked for unintended changes.
 *
 * Unlike toEqual and the default snapshot serializer, the serialization below keeps the key order
 * and keys holding undefined, as consumers (e.g. custom variables in templates) iterate these objects.
 *
 * If a change of output is intended, update the snapshot with `pnpm test -u` and review its diff.
 */
const serialize = (value: unknown) =>
  JSON.stringify(
    value,
    (_, v) => {
      if (v === undefined) return '[undefined]';
      if (typeof v === 'number' && !Number.isFinite(v)) return `[${v}]`;

      return v;
    },
    2,
  );

const i18n = {
  t: (key: string, options?: unknown) =>
    typeof options === 'object' && options ? `${key} ${JSON.stringify(options)}` : key,
  language: 'de',
} as I18n;

const TIERS: PriceTier[] = [
  {
    up_to: 10,
    unit_amount: 1000,
    unit_amount_decimal: '10.00',
    flat_fee_amount: 5000,
    flat_fee_amount_decimal: '50.00',
  },
  { up_to: 20, unit_amount: 800, unit_amount_decimal: '8.00', flat_fee_amount: 9000, flat_fee_amount_decimal: '90.00' },
  {
    up_to: null,
    unit_amount: 600,
    unit_amount_decimal: '6.00',
    flat_fee_amount: 12000,
    flat_fee_amount_decimal: '120.00',
  },
] as PriceTier[];

const PRICING_MODELS = ['per_unit', 'tiered_volume', 'tiered_graduated', 'tiered_flatfee'] as const;

const COUPONS: Record<string, Coupon | undefined> = {
  'no coupon': undefined,
  'percentage discount': { ...percentage10DiscountCoupon, category: 'discount' },
  'fixed discount': { ...fixedDiscountCoupon, category: 'discount' },
  'fixed cashback': fixedCashbackCoupon,
  'percentage cashback': percentageCashbackCoupon,
};

const buildPriceItem = (
  pricingModel: (typeof PRICING_MODELS)[number],
  isTaxInclusive: boolean,
  coupon: Coupon | undefined,
): PriceItemDto => {
  const id = `${pricingModel}-${isTaxInclusive ? 'inclusive' : 'exclusive'}-${coupon?._id ?? 'none'}`;

  return {
    price_id: id,
    product_id: `product-${id}`,
    quantity: 15,
    taxes: [{ tax: tax19percent }],
    _price: {
      _id: id,
      unit_amount_currency: 'EUR',
      unit_amount_decimal: '12.34',
      pricing_model: pricingModel,
      ...(pricingModel !== 'per_unit' && { tiers: TIERS }),
      is_tax_inclusive: isTaxInclusive,
      type: isTaxInclusive ? 'one_time' : 'recurring',
      ...(!isTaxInclusive && { billing_period: 'monthly' }),
      tax: [tax19percent],
      description: `Price ${id}`,
    },
    _product: { _id: `product-${id}`, name: `Product ${id}`, type: 'product' },
    ...(coupon && { _coupons: [coupon] }),
  } as PriceItemDto;
};

const SCENARIOS = PRICING_MODELS.flatMap((pricingModel) =>
  [true, false].flatMap((isTaxInclusive) =>
    Object.entries(COUPONS).map(([couponName, coupon]) => ({
      name: `${pricingModel}, ${isTaxInclusive ? 'tax inclusive' : 'tax exclusive'}, ${couponName}`,
      priceItem: buildPriceItem(pricingModel, isTaxInclusive, coupon),
    })),
  ),
);

const computeOrderTableData = (priceItems: PriceItemDto[]) => {
  const totals = computeAggregatedAndPriceTotals(priceItems);

  return processOrderTableData({ ...structuredClone(totals), line_items: structuredClone(totals.items) }, i18n);
};

describe('pricing characterization', () => {
  it('computeAggregatedAndPriceTotals for each scenario', async () => {
    const results = Object.fromEntries(
      SCENARIOS.map(({ name, priceItem }) => [name, computeAggregatedAndPriceTotals([priceItem]).items?.[0]]),
    );

    await expect(serialize(results)).toMatchFileSnapshot('./__snapshots__/characterization.price-items.json');
  });

  it('computeAggregatedAndPriceTotals for all scenarios combined', async () => {
    const { items, ...totals } = computeAggregatedAndPriceTotals(SCENARIOS.map(({ priceItem }) => priceItem));

    expect(items).toHaveLength(SCENARIOS.length);
    await expect(serialize(totals)).toMatchFileSnapshot('./__snapshots__/characterization.totals.json');
  });

  it('computeAggregatedAndPriceTotals for composite prices', async () => {
    const results = [compositePriceWithComponentsWithCoupons, compositePriceCashbackCombinedWithComponentCashbacks].map(
      (priceItem) => computeAggregatedAndPriceTotals([priceItem]),
    );

    await expect(serialize(results)).toMatchFileSnapshot('./__snapshots__/characterization.composite.json');
  });

  it('processOrderTableData for all scenarios and composite prices', async () => {
    const { products, total_details, amount_total, amount_subtotal } = computeOrderTableData([
      ...SCENARIOS.map(({ priceItem }) => priceItem),
      compositePriceCashbackCombinedWithComponentCashbacks,
    ]);

    /* Only what the order table renders, the rest of each product is a copy of its line item */
    const renderedProducts = products.map(
      ({
        name,
        description,
        price,
        is_composite_price,
        is_composite_component,
        _position,
      }: Record<string, unknown>) => ({
        name,
        description,
        _position,
        is_composite_price,
        is_composite_component,
        price,
      }),
    );

    await expect(
      serialize({ products: renderedProducts, total_details, amount_total, amount_subtotal }),
    ).toMatchFileSnapshot('./__snapshots__/characterization.order-table.json');
  });
});
