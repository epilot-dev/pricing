import { describe, expect, it } from 'vitest';
import * as samples from '../__tests__/fixtures/price.samples';
import type { CompositePriceItem, PriceItem } from '../shared/types';
import { extractPricingEntitiesBySlug } from './extract-pricing-entities-by-slug';

describe('extractPricingEntitiesBySlug', () => {
  it('should return the pricing relations without duplicates', () => {
    const priceItems = [
      samples.priceItem1,
      samples.priceItem2,
      samples.priceItem3,
      samples.priceItem4,
      samples.priceItem5,
      samples.compositePrice,
    ] as (PriceItem | CompositePriceItem)[];

    const result = extractPricingEntitiesBySlug(priceItems);

    expect(result).toStrictEqual({
      price: {
        $relation: [
          { _schema: 'price', _tags: [], entity_id: 'price#1' },
          { _schema: 'price', _tags: [], entity_id: 'price#2' },
          { _schema: 'price', _tags: [], entity_id: 'price#3' },
          { _schema: 'price', _tags: [], entity_id: 'price#4' },
        ],
      },
      product: {
        $relation: [
          { _schema: 'product', _tags: [], entity_id: 'prod-id#12324' },
          { _schema: 'product', _tags: [], entity_id: 'prod-id#1234' },
        ],
      },
      _tags: ['product-tag-1', 'product-tag-2', 'price-tag-1', 'price-tag-2', 'composite'],
    });
  });

  it('should return the pricing relations, including coupons', () => {
    const priceItems = [
      samples.priceItem1,
      samples.priceItem2,
      samples.priceItem3,
      samples.priceItem4,
      samples.priceItem5,
      samples.compositePrice,
      samples.compositePriceWithCoupons,
    ] as (PriceItem | CompositePriceItem)[];

    const result = extractPricingEntitiesBySlug(priceItems);

    expect(result).toStrictEqual({
      price: {
        $relation: [
          { _schema: 'price', _tags: [], entity_id: 'price#1' },
          { _schema: 'price', _tags: [], entity_id: 'price#2' },
          { _schema: 'price', _tags: [], entity_id: 'price#3' },
          { _schema: 'price', _tags: [], entity_id: 'price#4' },
        ],
      },
      product: {
        $relation: [
          { _schema: 'product', _tags: [], entity_id: 'prod-id#12324' },
          { _schema: 'product', _tags: [], entity_id: 'prod-id#1234' },
        ],
      },
      coupon: {
        $relation: [
          { _schema: 'coupon', _tags: [], entity_id: 'coupon#3' },
          { _schema: 'coupon', _tags: [], entity_id: 'coupon#1' },
        ],
      },
      _tags: ['product-tag-1', 'product-tag-2', 'price-tag-1', 'price-tag-2', 'composite'],
    });
  });

  it('should return no relations with the pricing slugs when there is no data', () => {
    expect(extractPricingEntitiesBySlug([])).toStrictEqual({
      price: { $relation: [] },
      product: { $relation: [] },
      _tags: [],
    });
  });
});
