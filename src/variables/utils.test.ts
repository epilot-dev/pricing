import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fixedDiscountCoupon } from '../coupons/__tests__/coupon.fixtures';
import type { I18n } from '../shared/types';
import type { PriceItemWithParent } from './types';
import { getUnitAmount } from './utils';

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
