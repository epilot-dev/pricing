import type { CompositePriceItemDto } from '@epilot/pricing-client';
import * as samples from '../__tests__/fixtures/price.samples';
import * as results from '../__tests__/fixtures/pricing.results';
import { computeCompositePrice } from './compute-composite-price';

describe('computeCompositePrice', () => {
  it('computes the composite price correctly from non computed composite price', () => {
    const result = computeCompositePrice(samples.nonComputedCompositePrice);
    expect(result).toStrictEqual(results.firstTimeComputedCompositePrice);
  });

  it('computes the composite price correctly from already computed composite price', () => {
    const result = computeCompositePrice(samples.alreadyComputedCompositePrice as CompositePriceItemDto);
    expect(result).toStrictEqual(results.recomputedCompositePrice);
  });
});
