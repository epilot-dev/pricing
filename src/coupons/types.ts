import { Currency } from 'dinero.js';
import { Coupon } from '@epilot/pricing-client';
import { RemoveIndexSignature } from '../types';

export type BaseCoupon = RemoveIndexSignature<Coupon>;

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
