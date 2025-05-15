import type { PriceItem, CompositePriceItem } from '../types';

export const isCompositePriceItem = (priceItem: PriceItem | CompositePriceItem): priceItem is CompositePriceItem =>
  Boolean(priceItem.is_composite_price || priceItem._price?.is_composite_price);
