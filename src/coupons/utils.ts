import type { Coupon } from '@epilot/pricing-client';
import { isCashbackCoupon, isPercentageCoupon, isFixedValueCoupon } from './guards';

const getTimestamp = (dateString?: string): number => {
  const date = new Date(dateString ?? '');

  const timestamp = date.getTime();

  return isNaN(timestamp) ? 0 : timestamp;
};

/**
 * Get sorting order of coupons by category, type, and value.
 */
export const getCouponOrder = <C extends Coupon>(a: C, b: C): number => {
  /* Cashback coupons should come first, discounts later */
  if (a.category !== b.category) {
    return isCashbackCoupon(a) ? -1 : 1;
  }

  /* Within each category, a coupon with type percentage should come first and then the fixed coupons */
  if (a.type !== b.type) {
    return isPercentageCoupon(a) ? -1 : 1;
  }

  let difference = 0;

  if (isPercentageCoupon(a)) {
    /* If category is percentage, the higher the percentage, the higher the coupon */
    difference = Number(b.percentage_value ?? 0) - Number(a.percentage_value ?? 0);
  } else if (isFixedValueCoupon(a)) {
    /* If category is fixed, the higher the value, the higher the coupon */
    difference = (b.fixed_value ?? 0) - (a.fixed_value ?? 0);
  }

  if (difference !== 0) {
    return difference;
  }

  /* If they're the same in every way described above, the one with a lowest _created_at comes first */
  return getTimestamp(a._created_at) - getTimestamp(b._created_at);
};
