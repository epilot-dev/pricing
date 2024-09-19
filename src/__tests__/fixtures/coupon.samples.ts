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
