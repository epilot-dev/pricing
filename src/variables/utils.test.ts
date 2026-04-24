import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fixedDiscountCoupon } from '../coupons/__tests__/coupon.fixtures';
import type { I18n } from '../shared/types';
import type { PriceItemWithParent } from './types';
import { getDecimalPrecision, getUnitAmount } from './utils';

const mockI18n = {
  t: (key: string, fallback: string) => key || fallback,
  language: 'de',
} as I18n;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getUnitAmount', () => {
  it('should return different net and gross amounts for items with discount coupons', () => {
    const itemWithDiscount = {
      currency: 'EUR',
      _price: {
        pricing_model: 'per_unit',
      },
      _coupons: [fixedDiscountCoupon],
      before_discount_unit_amount: 78946,
      before_discount_unit_amount_net: 66341,
      before_discount_unit_amount_gross: 78946,
    } as PriceItemWithParent;

    const netAmount = getUnitAmount(itemWithDiscount, mockI18n, {
      isUnitAmountApproved: true,
      useUnitAmountNet: true,
      isDiscountCoupon: false,
      isCashbackCoupon: false,
      isItemContainingDiscountCoupon: true,
    });

    const grossAmount = getUnitAmount(itemWithDiscount, mockI18n, {
      isUnitAmountApproved: true,
      useUnitAmountNet: false,
      isDiscountCoupon: false,
      isCashbackCoupon: false,
      isItemContainingDiscountCoupon: true,
    });

    // Net and gross amounts should be different
    expect(netAmount).not.toBe(grossAmount);
    expect(netAmount).toBe('663,41\xa0€');
    expect(grossAmount).toBe('789,46\xa0€');
  });
});

describe('getDecimalPrecision', () => {
  it('returns 2 when input is undefined', () => {
    expect(getDecimalPrecision(undefined)).toBe(2);
  });

  it('returns 2 when input has no decimal point', () => {
    expect(getDecimalPrecision('12')).toBe(2);
  });

  it('returns 2 for a two-decimal string', () => {
    expect(getDecimalPrecision('12.00')).toBe(2);
  });

  it('returns 1 for a one-decimal string', () => {
    expect(getDecimalPrecision('12.5')).toBe(1);
  });

  it('returns the full precision for a high-precision string', () => {
    expect(getDecimalPrecision('0.12345')).toBe(5);
  });

  it('returns the full precision for a high-precision string', () => {
    expect(getDecimalPrecision('10.12345')).toBe(5);
  });
});
