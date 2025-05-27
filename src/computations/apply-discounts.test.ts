import type { Currency } from 'dinero.js';
import { describe, expect, it } from 'vitest';
import { priceItem1 } from '../__tests__/fixtures/price.samples';
import { compositePriceItemWithTieredGraduatedComponent } from '../__tests__/fixtures/price.samples';
import { tax19percent } from '../__tests__/fixtures/tax.samples';
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
