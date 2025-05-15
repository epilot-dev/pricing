import type { PriceItemDto, CompositePriceItemDto } from '../types';

export const isCompositePriceItemDto = (
  priceItem: PriceItemDto | CompositePriceItemDto,
): priceItem is CompositePriceItemDto => Boolean(priceItem.is_composite_price || priceItem._price?.is_composite_price);
