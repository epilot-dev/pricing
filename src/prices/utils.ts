import type { CompositePriceItem, CompositePriceItemDto, Price, PriceItem, PriceItemDto } from '../shared/types';

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

export const isCompositePriceItem = (priceItem: PriceItem | CompositePriceItem): priceItem is CompositePriceItem =>
  Boolean(priceItem.is_composite_price || priceItem._price?.is_composite_price);

export const isCompositePriceItemDto = (
  priceItem: PriceItemDto | CompositePriceItemDto,
): priceItem is CompositePriceItemDto => Boolean(priceItem.is_composite_price || priceItem._price?.is_composite_price);
