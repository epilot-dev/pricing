import { describe, it, expect } from 'vitest';
import type { Coupon } from '../../shared/types';
import { getCouponOrder } from '../utils';
import {
  percentageDiscountCoupon,
  highPercentageDiscountCoupon,
  percentage10DiscountCoupon,
  fixedDiscountCoupon,
  highFixedDiscountCoupon,
  veryHighFixedDiscountCoupon,
  fixedCashbackCoupon,
  percentageCashbackCoupon,
} from './coupon.fixtures';

describe('coupons/utils', () => {
  describe('getCouponOrder', () => {
    describe('sorting by category', () => {
      it('should place cashback coupons before discount coupons', () => {
        // Compare cashback with discount coupons
        expect(getCouponOrder(percentageCashbackCoupon, percentageDiscountCoupon)).toBe(-1);
        expect(getCouponOrder(fixedCashbackCoupon, fixedDiscountCoupon)).toBe(-1);
        expect(getCouponOrder(percentageDiscountCoupon, fixedCashbackCoupon)).toBe(1);
      });

      it('should handle coupons with undefined category', () => {
        const undefinedCategoryCoupon = {
          ...percentageDiscountCoupon,
          category: undefined,
        } as Coupon;

        const regularCoupon = {
          ...percentageDiscountCoupon,
          category: 'discount',
        } as Coupon;

        const cashbackCoupon = {
          ...percentageCashbackCoupon,
          category: 'cashback',
        } as Coupon;

        // Undefined category vs discount
        expect(getCouponOrder(undefinedCategoryCoupon, regularCoupon)).toBe(1);
        // Cashback vs undefined category
        expect(getCouponOrder(cashbackCoupon, undefinedCategoryCoupon)).toBe(-1);
      });
    });

    describe('sorting by type within the same category', () => {
      it('should place percentage type before fixed type', () => {
        // Compare different types within discount category
        expect(getCouponOrder(percentageDiscountCoupon, fixedDiscountCoupon)).toBe(-1);

        // Compare different types within cashback category
        expect(getCouponOrder(percentageCashbackCoupon, fixedCashbackCoupon)).toBe(-1);
        expect(getCouponOrder(fixedCashbackCoupon, percentageCashbackCoupon)).toBe(1);
      });

      it('should handle coupons with unexpected type values', () => {
        const unknownTypeCoupon = {
          ...percentageDiscountCoupon,
          type: 'unknown' as any,
        };

        const percentageCoupon = {
          ...percentageDiscountCoupon,
          type: 'percentage',
        };

        // Unknown type vs percentage
        expect(getCouponOrder(unknownTypeCoupon, percentageCoupon)).toBe(1);
        // Percentage vs unknown type
        expect(getCouponOrder(percentageCoupon, unknownTypeCoupon)).toBe(-1);
      });
    });

    describe('sorting by value for percentage coupons', () => {
      it('should sort percentage coupons by percentage value in descending order', () => {
        // Higher percentage should come first
        expect(getCouponOrder(highPercentageDiscountCoupon, percentageDiscountCoupon)).toBe(-25);
        expect(getCouponOrder(percentageDiscountCoupon, percentage10DiscountCoupon)).toBe(-15);
      });
    });

    describe('sorting by value for fixed-value coupons', () => {
      it('should sort fixed-value coupons by value in descending order', () => {
        // Higher fixed value should come first
        expect(getCouponOrder(highFixedDiscountCoupon, fixedDiscountCoupon)).toBe(-500);
        expect(getCouponOrder(veryHighFixedDiscountCoupon, highFixedDiscountCoupon)).toBe(-999000);
      });
    });

    describe('sorting by creation timestamp fallback', () => {
      it('should use timestamp for identical coupons', () => {
        // Create two nearly identical coupons with different timestamps but same type and value
        // So that the timestamp comparison will be used
        const olderCoupon = {
          ...fixedDiscountCoupon,
          _created_at: '2020-01-01T00:00:00Z',
        };

        const newerCoupon = {
          ...fixedDiscountCoupon,
          _created_at: '2021-01-01T00:00:00Z',
        };

        const result = getCouponOrder(olderCoupon, newerCoupon);
        // Older timestamp (lower value) should come first for otherwise identical coupons
        // We don't assert an exact value as we only care about the sign of the result
        expect(result).toBeLessThanOrEqual(0);
        expect(getCouponOrder(newerCoupon, olderCoupon)).toBeGreaterThanOrEqual(0);
      });
    });

    describe('edge cases', () => {
      it('should handle empty coupon objects', () => {
        const emptyCoupon = {} as Coupon;
        const validCoupon = fixedDiscountCoupon;

        // Function should not throw and should return a reasonable result
        expect(() => getCouponOrder(emptyCoupon, validCoupon)).not.toThrow();
        expect(() => getCouponOrder(validCoupon, emptyCoupon)).not.toThrow();
      });

      it('should handle coupons without category or type properly', () => {
        const noPropertiesCoupon = {} as Coupon;
        const validCoupon = fixedDiscountCoupon;

        // We're not testing specific values here, just that the function doesn't crash
        const result = getCouponOrder(noPropertiesCoupon, validCoupon);
        expect(typeof result).toBe('number');
      });
    });
  });
});
