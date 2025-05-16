import * as samples from '../__tests__/fixtures/price.samples';
import type { CompositePrice, Price } from '../shared/types';
import { isCompositePriceItemDto } from './utils';

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
