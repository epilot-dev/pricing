import { describe, expect, it } from 'vitest';
import * as samples from '../__tests__/fixtures/price.samples';
import type { CompositePrice, CompositePriceItem, Price, PriceItem } from '../shared/types';
import { isCompositePriceItem, isCompositePriceItemDto } from './utils';

describe('handleCompositePrices', () => {
  it('should identify composite price correctly', () => {
    const result1 = isCompositePriceItemDto(samples.compositePrice._price as CompositePrice);
    const result2 = isCompositePriceItemDto(samples.priceItem._price as Price);
    const result3 = isCompositePriceItemDto(samples.priceItem1._price as Price);
    expect(result1).toBe(true);
    expect(result2).toBe(false);
    expect(result3).toBe(false);
  });
});

describe.each([
  ['isCompositePriceItem', isCompositePriceItem],
  ['isCompositePriceItemDto', isCompositePriceItemDto],
] as const)('%s', (_, isComposite) => {
  it.each([
    [{ is_composite_price: true }, true],
    [{ _price: { is_composite_price: true } }, true],
    [{ is_composite_price: false, _price: { is_composite_price: true } }, true],
    [{ is_composite_price: false, _price: { is_composite_price: false } }, false],
    [{ _price: {} }, false],
    [{}, false],
  ])('returns the right result for %j', (priceItem, expected) => {
    expect(isComposite(priceItem as PriceItem & CompositePriceItem)).toBe(expected);
  });
});
