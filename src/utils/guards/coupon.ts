import type { Currency } from 'dinero.js';

import type { Coupon } from '../../types';

/* Types coming from OpenAPI spec include an [k: string]: any key, which makes type narrowing harder */
export type RemoveIndexSignature<T> = {
  [Property in keyof T as string extends Property ? never : number extends Property ? never : Property]: T[Property];
};

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

export const sortCouponsByCreationDate = <C extends Coupon>(a: C, b: C): number =>
  getTimestamp(a._created_at) - getTimestamp(b._created_at);
