import type { PriceItem, Price } from '../types';

export type PriceItemsTotals = Pick<
  PriceItem,
  | 'unit_amount'
  | 'unit_discount_amount'
  | 'unit_discount_amount_decimal'
  | 'before_discount_unit_amount'
  | 'before_discount_unit_amount_gross'
  | 'before_discount_unit_amount_net'
  | 'unit_amount_net'
  | 'unit_amount_net_decimal'
  | 'unit_discount_amount_net'
  | 'unit_discount_amount_net_decimal'
  | 'unit_amount_gross'
  | 'unit_amount_gross_decimal'
  | 'tax_discount_amount'
  | 'tax_discount_amount_decimal'
  | 'before_discount_tax_amount'
  | 'before_discount_tax_amount_decimal'
  | 'discount_amount_net'
  | 'discount_amount_net_decimal'
  | 'discount_amount'
  | 'discount_percentage'
  | 'before_discount_amount_total'
  | 'cashback_amount'
  | 'cashback_amount_decimal'
  | 'after_cashback_amount_total'
  | 'after_cashback_amount_total_decimal'
  | 'get_ag'
  | 'dynamic_tariff'
  | 'tiers_details'
> & {
  /* These are marked as optional on the original type */
  amount_subtotal: number;
  amount_total: number;
  amount_tax: number;
  /* price_display_in_journeys arrives as unknown in PriceItem */
  price_display_in_journeys?: Price['price_display_in_journeys'];
};
