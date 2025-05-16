import type { Coupon } from '@epilot/pricing-client';
import type { Currency } from 'dinero.js';
import type { RemoveIndexSignature } from '../shared/type-utils';

type BaseCoupon = RemoveIndexSignature<Coupon>;

export type FixedValueCoupon = Omit<BaseCoupon, 'percentage_value'> & {
  type: 'fixed';
  fixed_value: NonNullable<Coupon['fixed_value']>;
  fixed_value_decimal: NonNullable<Coupon['fixed_value_decimal']>;
  fixed_value_currency: NonNullable<Coupon['fixed_value_currency']> & Currency;
};

export type CashbackCoupon = BaseCoupon & {
  category: 'cashback';
};

export type PercentageCoupon = Omit<BaseCoupon, 'fixed_value'> & {
  type: 'percentage';
  percentage_value: NonNullable<Coupon['percentage_value']>;
};
