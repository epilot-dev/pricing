import type { Coupon } from '@epilot/pricing-client';

export const percentageDiscountCoupon: Coupon = {
  _id: 'coupon#1',
  _schema: 'coupon',
  _org: 'org#1',
  _created_at: '2022-06-15T09:17:06.510Z',
  _updated_at: '2022-06-17T11:48:20.104Z',
  _title: 'Winter Sale',
  name: 'Winter Sale',
  type: 'percentage',
  percentage_value: '25',
};

export const fixedDiscountCoupon: Coupon = {
  _id: 'coupon#2',
  _schema: 'coupon',
  _org: 'org#1',
  _created_at: '2022-06-15T09:17:06.510Z',
  _updated_at: '2022-06-17T11:48:20.104Z',
  _title: 'Winter Sale',
  name: 'Winter Sale',
  type: 'fixed',
  fixed_value: 500,
  fixed_value_decimal: '5.00',
  fixed_value_currency: 'EUR',
};

export const fixedCashbackCoupon: Coupon = {
  _id: 'coupon#3',
  _schema: 'coupon',
  _org: 'org#1',
  _created_at: '2022-06-15T09:17:06.510Z',
  _updated_at: '2022-06-17T11:48:20.104Z',
  _title: 'Summer Cashback',
  name: 'Summer Cashback',
  type: 'fixed',
  category: 'cashback',
  fixed_value: 1000,
  fixed_value_decimal: '10.00',
  fixed_value_currency: 'EUR',
  cashback_period: '12',
};

export const percentageCashbackCoupon: Coupon = {
  _id: 'coupon#3',
  _schema: 'coupon',
  _org: 'org#1',
  _created_at: '2022-06-15T09:17:06.510Z',
  _updated_at: '2022-06-17T11:48:20.104Z',
  _title: 'Summer Cashback',
  name: 'Summer Cashback',
  type: 'percentage',
  category: 'cashback',
  percentage_value: '10',
  cashback_period: '12',
};

export const immediateFixedCashbackCoupon: Coupon = {
  ...fixedCashbackCoupon,
  cashback_period: '0',
};
