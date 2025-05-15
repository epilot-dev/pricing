import type { Price, PriceItem, PriceItemDto } from '@epilot/pricing-client';

/**
 * Checks whether a price is tax inclusive or not.
 *
 * @param price the price object
 * @returns true if the price is tax inclusive, false otherwise. defaults to true.
 */
export const isTaxInclusivePrice = (price?: Pick<Price, 'is_tax_inclusive'>): boolean =>
  price?.is_tax_inclusive ?? true;

export const isPriceItemWithCouponApplied = (priceItem: PriceItem | PriceItemDto) =>
  'before_discount_unit_amount_decimal' in priceItem || 'after_cashback_amount_total' in priceItem;
