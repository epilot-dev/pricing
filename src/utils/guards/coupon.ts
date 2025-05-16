import type { Currency } from 'dinero.js';
import type { Coupon, RemoveIndexSignature } from '../../types';

type BaseCoupon = RemoveIndexSignature<Coupon>;

type FixedValueCoupon = Omit<BaseCoupon, 'percentage_value'> & {
  type: 'fixed';
  fixed_value: NonNullable<Coupon['fixed_value']>;
  fixed_value_decimal: NonNullable<Coupon['fixed_value_decimal']>;
  fixed_value_currency: NonNullable<Coupon['fixed_value_currency']> & Currency;
};

type CashbackCoupon = BaseCoupon & {
  category: 'cashback';
};

type PercentageCoupon = Omit<BaseCoupon, 'fixed_value'> & {
  type: 'percentage';
  percentage_value: NonNullable<Coupon['percentage_value']>;
};

export const isFixedValueCoupon = (coupon: Coupon): coupon is FixedValueCoupon =>
  coupon.type === 'fixed' &&
  typeof coupon.fixed_value === 'number' &&
  typeof coupon.fixed_value_decimal === 'string' &&
  typeof coupon.fixed_value_currency === 'string';

export const isPercentageCoupon = (coupon: Coupon): coupon is PercentageCoupon =>
  coupon.type === 'percentage' &&
  typeof coupon.percentage_value === 'string' &&
  !Number.isNaN(Number(coupon.percentage_value));

/* Typeguard that ensures validity of coupon and asserts value with correct type */
export const isValidCoupon = (coupon: Coupon): coupon is FixedValueCoupon | PercentageCoupon =>
  isFixedValueCoupon(coupon) || isPercentageCoupon(coupon);

export const isCashbackCoupon = (coupon: Coupon): coupon is CashbackCoupon => coupon.category === 'cashback';

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

  /* If category is percentage, the higher the percentage, the higher the coupon */
  if (isPercentageCoupon(a)) {
    return Number(b.percentage_value ?? 0) - Number(a.percentage_value ?? 0);
  }

  /* If category is fixed, the higher the value, the higher the coupon */
  if (isFixedValueCoupon(a)) {
    return (b.fixed_value ?? 0) - (a.fixed_value ?? 0);
  }

  /* If they're the same in every way described above, the one with a lowest _created_at comes first */
  return getTimestamp(a._created_at) - getTimestamp(b._created_at);
};
