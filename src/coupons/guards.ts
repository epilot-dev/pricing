import type { Coupon } from '../types';
import type { FixedValueCoupon, PercentageCoupon, CashbackCoupon } from './types';

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
