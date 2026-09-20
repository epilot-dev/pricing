import type { Currency } from 'dinero.js';
import { describe, expect, it } from 'vitest';
import { priceItem1 } from '../__tests__/fixtures/price.samples';
import { compositePriceItemWithTieredGraduatedComponent } from '../__tests__/fixtures/price.samples';
import { tax10percent, tax19percent } from '../__tests__/fixtures/tax.samples';
import {
  fixedCashbackCoupon,
  fixedDiscountCoupon,
  highPercentageDiscountCoupon,
  percentage10DiscountCoupon,
  percentageCashbackCoupon,
  percentageDiscountCoupon,
  veryHighFixedDiscountCoupon,
} from '../coupons/__tests__/coupon.fixtures';
import { DEFAULT_CURRENCY } from '../money/constants';
import { PricingModel } from '../prices/constants';
import { applyDiscounts } from './apply-discounts';

describe('applyDiscounts', () => {
  const baseParams = {
    priceItem: priceItem1,
    currency: DEFAULT_CURRENCY as Currency,
    isTaxInclusive: true,
    unitAmountMultiplier: 1,
    tax: tax19percent,
  };

  describe('percentage discounts', () => {
    it('should apply 25% discount correctly', () => {
      const result = applyDiscounts(
        {
          unit_amount: 789460000000000, // 789.46
          unit_amount_net: 663411764705900, // 663.41
          unit_amount_gross: 789460000000000, // 789.46
          amount_subtotal: 663411764705900, // 663.41
          amount_total: 789460000000000, // 789.46
          amount_tax: 126048235294100, // 126.05
        },
        {
          ...baseParams,
          coupon: percentageDiscountCoupon,
        },
      );

      expect(result.unit_amount).toBe(592095000000000); // 789.46 * 0.75
      expect(result.unit_amount_net).toBe(497558823529429); // (789.46 * 0.75) / 1.19
      expect(result.unit_amount_gross).toBe(592095000000000); // 789.46 * 0.75
      expect(result.amount_subtotal).toBe(497558823529429); // (789.46 * 0.75) / 1.19
      expect(result.amount_total).toBe(592095000000000); // 789.46 * 0.75
      expect(result.amount_tax).toBe(94536176470571); // 789.46 * 0.75 - ((789.46 * 0.75) / 1.19)
      expect(result.discount_amount).toBe(197365000000000); // 789.46 * 0.25
      expect(result.discount_percentage).toBe(25);
      expect(result.before_discount_amount_total).toBe(789460000000000); // original gross
      expect(result.before_discount_amount_subtotal).toBe(663411764705900); // original net
    });

    it('should apply 50% discount correctly', () => {
      const result = applyDiscounts(
        {
          unit_amount: 789460000000000, // 789.46
          unit_amount_net: 663411764705900, // 663.41
          unit_amount_gross: 789460000000000, // 789.46
          amount_subtotal: 663411764705900, // 663.41
          amount_total: 789460000000000, // 789.46
          amount_tax: 126048235294100, // 126.05
        },
        {
          ...baseParams,
          coupon: highPercentageDiscountCoupon,
        },
      );

      expect(result.unit_amount).toBe(394730000000000); // 789.46 * 0.5
      expect(result.unit_amount_net).toBe(331705882352959); // (789.46 * 0.5) / 1.19
      expect(result.unit_amount_gross).toBe(394730000000000); // 789.46 * 0.5
      expect(result.amount_subtotal).toBe(331705882352959); // (789.46 * 0.5) / 1.19
      expect(result.amount_total).toBe(394730000000000); // 789.46 * 0.5
      expect(result.amount_tax).toBe(63024117647041); // 789.46 * 0.5 - ((789.46 * 0.5) / 1.19)
      expect(result.discount_amount).toBe(394730000000000); // 789.46 * 0.5
      expect(result.discount_percentage).toBe(50);
      expect(result.before_discount_amount_total).toBe(789460000000000); // original gross
      expect(result.before_discount_amount_subtotal).toBe(663411764705900); // original net
    });

    it('should apply percentage discount with tax exclusive pricing correctly', () => {
      const result = applyDiscounts(
        {
          unit_amount: 663411764705900, // 663.41
          unit_amount_net: 663411764705900, // 663.41
          unit_amount_gross: 789460000000000, // 789.46
          amount_subtotal: 663411764705900, // 663.41
          amount_total: 789460000000000, // 789.46
          amount_tax: 126048235294100, // 126.05
        },
        {
          ...baseParams,
          isTaxInclusive: false,
          coupon: percentageDiscountCoupon,
        },
      );

      // Using actual values from the implementation
      expect(result.unit_amount).toBe(497558823529425); // 663.41 * 0.75
      expect(result.unit_amount_net).toBe(497558823529425); // 663.41 * 0.75
      expect(result.unit_amount_gross).toBe(592095000000016); // 497.56 * 1.19
      expect(result.amount_subtotal).toBe(497558823529425); // 663.41 * 0.75
      expect(result.amount_total).toBe(592095000000016); // 497.56 * 1.19
      expect(result.amount_tax).toBe(94536176470591); // 497.56 * 0.19
      expect(result.discount_amount).toBe(197365000000005); // Actual value from implementation
      expect(result.discount_percentage).toBe(25);
    });
  });

  describe('fixed discounts', () => {
    it('should apply fixed discount of 5 EUR correctly', () => {
      const result = applyDiscounts(
        {
          unit_amount: 789460000000000, // 789.46
          unit_amount_net: 663411764705900, // 663.41
          unit_amount_gross: 789460000000000, // 789.46
          amount_subtotal: 663411764705900, // 663.41
          amount_total: 789460000000000, // 789.46
          amount_tax: 126048235294100, // 126.05
        },
        {
          ...baseParams,
          coupon: fixedDiscountCoupon,
        },
      );

      expect(result.unit_amount).toBe(784460000000000); // 789.46 - 5.00
      expect(result.unit_amount_net).toBe(659210084033631); // (789.46 - 5.00) / 1.19
      expect(result.unit_amount_gross).toBe(784460000000000); // 789.46 - 5.00
      expect(result.amount_subtotal).toBe(659210084033631); // (789.46 - 5.00) / 1.19
      expect(result.amount_total).toBe(784460000000000); // 789.46 - 5.00
      expect(result.amount_tax).toBe(125249915966369); // (789.46 - 5.00) - ((789.46 - 5.00) / 1.19)
      expect(result.discount_amount).toBe(5000000000000); // 5.00
      expect(result.before_discount_amount_total).toBe(789460000000000); // original gross
      expect(result.before_discount_amount_subtotal).toBe(663411764705900); // original net
    });

    it('should apply fixed discount with tax exclusive pricing correctly', () => {
      const result = applyDiscounts(
        {
          unit_amount: 663411764705900, // 663.41
          unit_amount_net: 663411764705900, // 663.41
          unit_amount_gross: 789460000000000, // 789.46
          amount_subtotal: 663411764705900, // 663.41
          amount_total: 789460000000000, // 789.46
          amount_tax: 126048235294100, // 126.05
        },
        {
          ...baseParams,
          isTaxInclusive: false,
          coupon: fixedDiscountCoupon,
        },
      );

      expect(result.unit_amount).toBe(658411764705900); // 663.41 - 5.00
      expect(result.unit_amount_net).toBe(658411764705900); // 663.41 - 5.00
      expect(result.unit_amount_gross).toBe(783510000000021); // (663.41 - 5.00) * 1.19
      expect(result.amount_subtotal).toBe(658411764705900); // 663.41 - 5.00
      expect(result.amount_total).toBe(783510000000021); // (663.41 - 5.00) * 1.19
      expect(result.amount_tax).toBe(125098235294121); // (663.41 - 5.00) * 0.19
      expect(result.discount_amount).toBe(5950000000000); // Fixed discount with tax
    });

    it('should not apply discount larger than the price', () => {
      const result = applyDiscounts(
        {
          unit_amount: 789460000000000, // 789.46
          unit_amount_net: 663411764705900, // 663.41
          unit_amount_gross: 789460000000000, // 789.46
          amount_subtotal: 663411764705900, // 663.41
          amount_total: 789460000000000, // 789.46
          amount_tax: 126048235294100, // 126.05
        },
        {
          ...baseParams,
          coupon: veryHighFixedDiscountCoupon,
        },
      );

      expect(result.unit_amount).toBe(0);
      expect(result.amount_total).toBe(0);
      expect(result.unit_discount_amount).toBe(789460000000000);
      expect(result.before_discount_amount_total).toBe(789460000000000); // original gross
      expect(result.before_discount_amount_subtotal).toBe(663411764705900); // original net
    });
  });

  describe('cashback coupons', () => {
    it('should apply fixed cashback correctly', () => {
      const result = applyDiscounts(
        {
          unit_amount: 789460000000000, // 789.46
          unit_amount_net: 663411764705900, // 663.41
          unit_amount_gross: 789460000000000, // 789.46
          amount_subtotal: 663411764705900, // 663.41
          amount_total: 789460000000000, // 789.46
          amount_tax: 126048235294100, // 126.05
        },
        {
          ...baseParams,
          coupon: fixedCashbackCoupon,
        },
      );

      expect(result.unit_amount).toBe(789460000000000); // Original price remains unchanged
      expect(result.unit_amount_net).toBe(663411764705900);
      expect(result.unit_amount_gross).toBe(789460000000000);
      expect(result.amount_subtotal).toBe(663411764705900);
      expect(result.amount_total).toBe(789460000000000);
      expect(result.amount_tax).toBe(126048235294100);
      expect(result.cashback_amount).toBe(10000000000000); // 10.00 EUR cashback
      expect(result.after_cashback_amount_total).toBe(779460000000000); // 789.46 - 10.00
    });

    it('should apply percentage cashback correctly', () => {
      const result = applyDiscounts(
        {
          unit_amount: 789460000000000, // 789.46
          unit_amount_net: 663411764705900, // 663.41
          unit_amount_gross: 789460000000000, // 789.46
          amount_subtotal: 663411764705900, // 663.41
          amount_total: 789460000000000, // 789.46
          amount_tax: 126048235294100, // 126.05
        },
        {
          ...baseParams,
          coupon: percentageCashbackCoupon,
        },
      );

      expect(result.unit_amount).toBe(789460000000000); // Original price remains unchanged
      expect(result.unit_amount_net).toBe(663411764705900);
      expect(result.unit_amount_gross).toBe(789460000000000);
      expect(result.amount_subtotal).toBe(663411764705900);
      expect(result.amount_total).toBe(789460000000000);
      expect(result.amount_tax).toBe(126048235294100);
      expect(result.cashback_amount).toBe(78946000000000); // 10% of 789.46
      expect(result.after_cashback_amount_total).toBe(710514000000000); // 789.46 - 78.946
    });
  });

  describe('graduated tiered prices', () => {
    it('should apply percentage discount to graduated tiered prices correctly', () => {
      const result = applyDiscounts(
        {
          tiers_details: [
            {
              quantity: 100,
              unit_amount: 5000,
              unit_amount_decimal: '050',
              unit_amount_net: 42016806722689,
              unit_amount_gross: 50000000000000,
              amount_subtotal: 4201680672268900,
              amount_total: 5000000000000000,
              amount_tax: 798319327731100,
            },
            {
              quantity: 150,
              unit_amount: 4500,
              unit_amount_decimal: '045',
              unit_amount_net: 37815126050420,
              unit_amount_gross: 45000000000000,
              amount_subtotal: 5672268907563000,
              amount_total: 6750000000000000,
              amount_tax: 1077731092437000,
            },
            {
              quantity: 250,
              unit_amount: 4000,
              unit_amount_decimal: '040',
              unit_amount_net: 33613445378151,
              unit_amount_gross: 40000000000000,
              amount_subtotal: 8403361344537750,
              amount_total: 10000000000000000,
              amount_tax: 1596638655462250,
            },
            {
              quantity: 500,
              unit_amount: 3500,
              unit_amount_decimal: '035',
              unit_amount_net: 29411764705882,
              unit_amount_gross: 35000000000000,
              amount_subtotal: 14705882352941000,
              amount_total: 17500000000000000,
              amount_tax: 2794117647059000,
            },
          ],
          unit_amount_gross: 170000000000000,
          unit_amount_net: 142857142857142,
          amount_subtotal: 32983193277310650,
          amount_total: 39250000000000000,
          amount_tax: 6266806722689350,
        },
        {
          ...baseParams,
          coupon: percentage10DiscountCoupon,
          priceItem: compositePriceItemWithTieredGraduatedComponent.item_components?.[0]!,
          unitAmountMultiplier: 1000, // Total quantity
        },
      );

      if (!result.tiers_details) {
        throw new Error('Expected tiers_details to be defined');
      }

      expect(result.amount_subtotal).toBe(29684873949579700); // Weighted average of discounted tiers
      expect(result.amount_total).toBe(35325000000000000); // Weighted average of discounted tiers
      expect(result.amount_tax).toBe(5640126050420300); // Weighted average of discounted tiers
      expect(result.discount_percentage).toBe(10);
      expect(result.before_discount_amount_total).toBe(39250000000000000); // sum of tier gross * qty
      expect(result.before_discount_amount_subtotal).toBe(32983193277310650); // sum of tier net * qty
    });
  });

  describe('tax-exclusive percentage discounts', () => {
    const taxExclusiveParams = {
      ...baseParams,
      isTaxInclusive: false,
      priceItem: {
        ...priceItem1,
        is_tax_inclusive: false,
        _price: { ...priceItem1._price!, is_tax_inclusive: false },
      },
    };

    // Tax-exclusive: net=100, gross=119 (19% tax), qty=1
    const taxExclusiveValues = {
      unit_amount: 100000000000000, // 100.00 (net is the base in tax-exclusive)
      unit_amount_net: 100000000000000, // 100.00
      unit_amount_gross: 119000000000000, // 119.00
      amount_subtotal: 100000000000000, // 100.00
      amount_total: 119000000000000, // 119.00
      amount_tax: 19000000000000, // 19.00
    };

    it('should apply 25% percentage discount correctly (tax-exclusive)', () => {
      const result = applyDiscounts(taxExclusiveValues, {
        ...taxExclusiveParams,
        coupon: percentageDiscountCoupon,
      });

      // Tax-exclusive: discount is applied to net first
      // unitDiscountAmountNet = 100 * 25/100 = 25
      // unitDiscountAmount = 25 * 1.19 = 29.75
      // afterDiscountNet = 100 - 25 = 75
      // afterDiscountGross = 75 * 1.19 = 89.25
      expect(result.unit_amount).toBe(75000000000000); // net after discount
      expect(result.unit_amount_net).toBe(75000000000000); // 75.00
      expect(result.unit_amount_gross).toBe(89250000000000); // 89.25
      expect(result.amount_subtotal).toBe(75000000000000);
      expect(result.amount_total).toBe(89250000000000);
      expect(result.discount_percentage).toBe(25);
      expect(result.before_discount_amount_total).toBe(119000000000000); // original gross
      expect(result.before_discount_amount_subtotal).toBe(100000000000000); // original net
    });

    it('should apply fixed 5 EUR discount correctly (tax-exclusive)', () => {
      const result = applyDiscounts(taxExclusiveValues, {
        ...taxExclusiveParams,
        coupon: fixedDiscountCoupon,
      });

      // Tax-exclusive: fixed discount applied to net
      // unitDiscountAmountNet = min(5, 100) = 5
      // unitDiscountAmount = 5 * 1.19 = 5.95
      // afterDiscountNet = 100 - 5 = 95
      // afterDiscountGross = 95 * 1.19 = 113.05
      expect(result.unit_amount).toBe(95000000000000); // net after discount
      expect(result.unit_amount_net).toBe(95000000000000); // 95.00
      expect(result.unit_amount_gross).toBe(113050000000000); // 113.05
      expect(result.amount_subtotal).toBe(95000000000000);
      expect(result.amount_total).toBe(113050000000000);
      expect(result.before_discount_amount_total).toBe(119000000000000); // original gross
      expect(result.before_discount_amount_subtotal).toBe(100000000000000); // original net
    });
  });

  describe('tax-exclusive with multiplier', () => {
    const taxExclusiveParams = {
      ...baseParams,
      isTaxInclusive: false,
      unitAmountMultiplier: 3,
      priceItem: {
        ...priceItem1,
        is_tax_inclusive: false,
        _price: { ...priceItem1._price!, is_tax_inclusive: false },
      },
    };

    // Tax-exclusive: net=100, gross=119 (19% tax)
    const taxExclusiveValues = {
      unit_amount: 100000000000000,
      unit_amount_net: 100000000000000,
      unit_amount_gross: 119000000000000,
      amount_subtotal: 300000000000000, // 100 * 3
      amount_total: 357000000000000, // 119 * 3
      amount_tax: 57000000000000, // 19 * 3
    };

    it('should apply 25% discount with multiplier=3 (tax-exclusive)', () => {
      const result = applyDiscounts(taxExclusiveValues, {
        ...taxExclusiveParams,
        coupon: percentageDiscountCoupon,
      });

      // unitDiscountAmountNet = 100 * 25/100 = 25
      // afterDiscountNet = 75, afterDiscountGross = 89.25
      // amounts multiplied by 3
      expect(result.unit_amount_net).toBe(75000000000000); // 75.00
      expect(result.unit_amount_gross).toBe(89250000000000); // 89.25
      expect(result.amount_subtotal).toBe(225000000000000); // 75 * 3
      expect(result.amount_total).toBe(267750000000000); // 89.25 * 3
      expect(result.before_discount_amount_total).toBe(357000000000000); // 119 * 3
      expect(result.before_discount_amount_subtotal).toBe(300000000000000); // 100 * 3
    });
  });

  describe('tax-inclusive with multiplier', () => {
    it('should apply 25% discount with multiplier=3 (tax-inclusive)', () => {
      const result = applyDiscounts(
        {
          unit_amount: 789460000000000,
          unit_amount_net: 663411764705900,
          unit_amount_gross: 789460000000000,
          amount_subtotal: 1990235294117700, // 663.41 * 3
          amount_total: 2368380000000000, // 789.46 * 3
          amount_tax: 378144705882300, // 126.05 * 3
        },
        {
          ...baseParams,
          unitAmountMultiplier: 3,
          coupon: percentageDiscountCoupon,
        },
      );

      expect(result.amount_subtotal).toBe(1492676470588287); // (789.46 * 0.75 / 1.19) * 3
      expect(result.amount_total).toBe(1776285000000000); // 789.46 * 0.75 * 3
      expect(result.before_discount_amount_total).toBe(2368380000000000); // 789.46 * 3
      expect(result.before_discount_amount_subtotal).toBe(1990235294117700); // 663.41 * 3
    });
  });

  describe('tax-exclusive graduated tiered prices', () => {
    it('should apply percentage discount to graduated tiered prices (tax-exclusive)', () => {
      const result = applyDiscounts(
        {
          tiers_details: [
            {
              quantity: 100,
              unit_amount: 5000,
              unit_amount_decimal: '050',
              unit_amount_net: 50000000000000, // 50.00 (net is base in tax-exclusive)
              unit_amount_gross: 55000000000000, // 55.00 (10% tax)
              amount_subtotal: 5000000000000000, // 50 * 100
              amount_total: 5500000000000000, // 55 * 100
              amount_tax: 500000000000000, // 5 * 100
            },
            {
              quantity: 200,
              unit_amount: 4000,
              unit_amount_decimal: '040',
              unit_amount_net: 40000000000000, // 40.00
              unit_amount_gross: 44000000000000, // 44.00
              amount_subtotal: 8000000000000000, // 40 * 200
              amount_total: 8800000000000000, // 44 * 200
              amount_tax: 800000000000000, // 4 * 200
            },
          ],
          unit_amount_gross: 99000000000000,
          unit_amount_net: 90000000000000,
          amount_subtotal: 13000000000000000, // 5000 + 8000
          amount_total: 14300000000000000, // 5500 + 8800
          amount_tax: 1300000000000000,
        },
        {
          ...baseParams,
          tax: tax10percent,
          isTaxInclusive: false,
          coupon: percentage10DiscountCoupon,
          priceItem: compositePriceItemWithTieredGraduatedComponent.item_components?.[0]!,
          unitAmountMultiplier: 300,
        },
      );

      if (!result.tiers_details) {
        throw new Error('Expected tiers_details to be defined');
      }

      // 10% discount on net: tier1 net=45*100=4500, tier2 net=36*200=7200 => subtotal=11700
      expect(result.amount_subtotal).toBe(11700000000000000);
      // gross = net * 1.10: tier1=49.5*100=4950, tier2=39.6*200=7920 => total=12870
      expect(result.amount_total).toBe(12870000000000000);
      expect(result.discount_percentage).toBe(10);
      expect(result.before_discount_amount_total).toBe(14300000000000000); // original gross total
      expect(result.before_discount_amount_subtotal).toBe(13000000000000000); // original net total
    });

    it('should apply percentage discount to graduated tiered prices with tax exclusive pricing correctly', () => {
      const initialItemValues = {
        tiers_details: [
          {
            quantity: 10,
            unit_amount: 75630252100840,
            unit_amount_decimal: '756.30',
            unit_amount_net: 75630252100840,
            unit_amount_gross: 90000000000000,
            amount_subtotal: 756302521008400,
            amount_total: 900000000000000,
            amount_tax: 143697478991600,
          },
          {
            quantity: 10,
            unit_amount: 67226890756303,
            unit_amount_decimal: '672.27',
            unit_amount_net: 67226890756303,
            unit_amount_gross: 80000000000000,
            amount_subtotal: 672268907563030,
            amount_total: 800000000000000,
            amount_tax: 127731092436970,
          },
        ],
        unit_amount: 142857142857143,
        unit_amount_net: 142857142857143,
        unit_amount_gross: 170000000000000,
        amount_subtotal: 5882352941176450,
        amount_total: 7000000000000000,
        amount_tax: 1117647058823550,
      };

      const result = applyDiscounts(initialItemValues, {
        ...baseParams,
        priceItem: {
          ...priceItem1,
          _price: {
            ...priceItem1._price!,
            pricing_model: PricingModel.tieredGraduated,
          },
        },
        coupon: percentage10DiscountCoupon,
        isTaxInclusive: false,
      });

      expect(result.discount_percentage).toBe(10);
      expect(result.discount_amount).toBeGreaterThan(0);
      expect(result.discount_amount).toBe(170000000000000);
      expect(result.amount_total).toBeLessThan(initialItemValues.amount_total);
      expect(result.amount_total).toBe(1530000000000010);
    });

    it('should apply fixed discount to graduated tiered prices correctly', () => {
      const result = applyDiscounts(
        {
          tiers_details: [
            {
              quantity: 100,
              unit_amount: 5000,
              unit_amount_decimal: '050',
              unit_amount_net: 42016806722689,
              unit_amount_gross: 50000000000000,
              amount_subtotal: 4201680672268900,
              amount_total: 5000000000000000,
              amount_tax: 798319327731100,
            },
            {
              quantity: 150,
              unit_amount: 4500,
              unit_amount_decimal: '045',
              unit_amount_net: 37815126050420,
              unit_amount_gross: 45000000000000,
              amount_subtotal: 5672268907563000,
              amount_total: 6750000000000000,
              amount_tax: 1077731092437000,
            },
          ],
          unit_amount_gross: 95000000000000,
          unit_amount_net: 79831932773109,
          amount_subtotal: 9873949579831900,
          amount_total: 11750000000000000,
          amount_tax: 1876050420168100,
        },
        {
          ...baseParams,
          coupon: fixedDiscountCoupon,
          priceItem: {
            ...compositePriceItemWithTieredGraduatedComponent.item_components?.[0]!,
            pricing_model: PricingModel.tieredGraduated,
          },
          unitAmountMultiplier: 250, // Total quantity
        },
      );

      if (!result.tiers_details) {
        throw new Error('Expected tiers_details to be defined');
      }

      expect(result.tiers_details).toHaveLength(2);
      expect(result.discount_amount).toBe(1250000000000000);
      expect(result.amount_total).toBe(10500000000000000);
    });

    it('should apply discounts with tax exclusive pricing to tiered prices correctly', () => {
      const result = applyDiscounts(
        {
          tiers_details: [
            {
              quantity: 100,
              unit_amount: 42016806722689,
              unit_amount_decimal: '420.17',
              unit_amount_net: 42016806722689,
              unit_amount_gross: 50000000000000,
              amount_subtotal: 4201680672268900,
              amount_total: 5000000000000000,
              amount_tax: 798319327731100,
            },
            {
              quantity: 150,
              unit_amount: 37815126050420,
              unit_amount_decimal: '378.15',
              unit_amount_net: 37815126050420,
              unit_amount_gross: 45000000000000,
              amount_subtotal: 5672268907563000,
              amount_total: 6750000000000000,
              amount_tax: 1077731092437000,
            },
          ],
          unit_amount: 79831932773109,
          unit_amount_net: 79831932773109,
          unit_amount_gross: 95000000000000,
          amount_subtotal: 9873949579831900,
          amount_total: 11750000000000000,
          amount_tax: 1876050420168100,
        },
        {
          ...baseParams,
          isTaxInclusive: false,
          coupon: percentage10DiscountCoupon,
          priceItem: {
            ...compositePriceItemWithTieredGraduatedComponent.item_components?.[0]!,
            pricing_model: PricingModel.tieredGraduated,
          },
          unitAmountMultiplier: 250, // Total quantity
        },
      );

      if (!result.tiers_details) {
        throw new Error('Expected tiers_details to be defined');
      }

      expect(result.tiers_details).toHaveLength(2);
      expect(result.amount_subtotal).toBe(8886554621848700);
      expect(result.discount_percentage).toBe(10);
    });

    it('should handle tiered discounts with fixed discount amount greater than tier unit amount', () => {
      const result = applyDiscounts(
        {
          tiers_details: [
            {
              quantity: 100,
              unit_amount: 3000, // 3.00
              unit_amount_decimal: '3.00',
              unit_amount_net: 2521008403361, // 2.52
              unit_amount_gross: 3000000000000, // 3.00
              amount_subtotal: 252100840336100, // 252.10
              amount_total: 300000000000000, // 300.00
              amount_tax: 47899159663900, // 47.90
            },
          ],
          unit_amount_gross: 3000000000000, // 3.00
          unit_amount_net: 2521008403361, // 2.52
          amount_subtotal: 252100840336100, // 252.10
          amount_total: 300000000000000, // 300.00
          amount_tax: 47899159663900, // 47.90
        },
        {
          ...baseParams,
          coupon: veryHighFixedDiscountCoupon, // Discount amount of 10,000 which is > 3.00
          priceItem: {
            ...compositePriceItemWithTieredGraduatedComponent.item_components?.[0]!,
            pricing_model: PricingModel.tieredGraduated,
          },
          unitAmountMultiplier: 100, // Total quantity
        },
      );

      if (!result.tiers_details) {
        throw new Error('Expected tiers_details to be defined');
      }

      expect(result.tiers_details).toHaveLength(1);

      expect(result.amount_total).toBe(0);
      expect(result.amount_subtotal).toBe(0);
      expect(result.amount_tax).toBe(0);

      expect(result.discount_amount).toBeGreaterThan(0);
      expect(result.discount_amount).toBe(300000000000000);
    });

    it('should handle fixed discounts with tax exclusive pricing for tiered prices correctly', () => {
      const result = applyDiscounts(
        {
          tiers_details: [
            {
              quantity: 100,
              unit_amount: 42016806722689,
              unit_amount_decimal: '420.17',
              unit_amount_net: 42016806722689,
              unit_amount_gross: 50000000000000,
              amount_subtotal: 4201680672268900,
              amount_total: 5000000000000000,
              amount_tax: 798319327731100,
            },
            {
              quantity: 150,
              unit_amount: 37815126050420,
              unit_amount_decimal: '378.15',
              unit_amount_net: 37815126050420,
              unit_amount_gross: 45000000000000,
              amount_subtotal: 5672268907563000,
              amount_total: 6750000000000000,
              amount_tax: 1077731092437000,
            },
          ],
          unit_amount: 79831932773109,
          unit_amount_net: 79831932773109,
          unit_amount_gross: 95000000000000,
          amount_subtotal: 9873949579831900,
          amount_total: 11750000000000000,
          amount_tax: 1876050420168100,
        },
        {
          ...baseParams,
          isTaxInclusive: false,
          coupon: fixedDiscountCoupon,
          priceItem: {
            ...compositePriceItemWithTieredGraduatedComponent.item_components?.[0]!,
            pricing_model: PricingModel.tieredGraduated,
          },
          unitAmountMultiplier: 250, // Total quantity
        },
      );

      if (!result.tiers_details) {
        throw new Error('Expected tiers_details to be defined');
      }

      expect(result.tiers_details).toHaveLength(2);

      expect(result.amount_subtotal).toBe(8623949579831900);
      expect(result.amount_total).toBe(10262500000000000);
      expect(result.discount_amount).toBe(1487500000000000);

      expect(result.unit_amount_gross).toBeGreaterThan(result.unit_amount_net!);
      expect(result.unit_amount_gross).toBe(83100000000000);
      expect(result.unit_amount_net).toBe(69831932773109!);
    });
  });
});
