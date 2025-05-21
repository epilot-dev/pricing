import type { CompositePriceItemDto, Price } from '@epilot/pricing-client';
import { describe, expect, it } from 'vitest';
import * as samples from '../__tests__/fixtures/price.samples';
import * as results from '../__tests__/fixtures/pricing.results';
import { PricingModel } from '../prices/constants';
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

  it('should handle undefined item_components and undefined _price.price_components (line 86 branch)', () => {
    const compositePriceItem: CompositePriceItemDto = {
      product_id: 'product-1',
      quantity: 1,
      _price: {
        _id: 'price-1',
        name: 'Test Composite Price',
        pricing_model: 'composite',
        unit_amount_currency: 'EUR',
      },
    };
    const result = computeCompositePrice(compositePriceItem);
    expect(result.item_components).toEqual([]);
  });

  it('should handle undefined item_components and _price.price_components with invalid tiered component (line 69 & 86)', () => {
    const invalidTieredComponent: Price = {
      _id: 'component-price-1',
      name: 'Invalid Tiered Component',
      pricing_model: PricingModel.tieredVolume,
      tiers: undefined,
      unit_amount_currency: 'EUR',
    };

    const compositePriceItem: CompositePriceItemDto = {
      product_id: 'product-1',
      quantity: 1,
      _price: {
        _id: 'price-1',
        name: 'Test Composite Price',
        pricing_model: 'composite',
        unit_amount_currency: 'EUR',
        price_components: [invalidTieredComponent],
      },
    };
    const result = computeCompositePrice(compositePriceItem);
    expect(result.item_components).toEqual([]);
  });

  it('should filter out invalid perUnit component (line 66)', () => {
    const invalidPerUnitComponent: Price = {
      _id: 'component-price-2',
      name: 'Invalid PerUnit Component',
      pricing_model: PricingModel.perUnit,
      // unit_amount is not a number (or missing), or unit_amount_decimal is missing
      unit_amount: undefined, // Makes it invalid
      unit_amount_decimal: '10.00', // This alone is not enough
      unit_amount_currency: 'EUR',
    };
    const anotherInvalidPerUnitComponent: Price = {
      _id: 'component-price-3',
      name: 'Another Invalid PerUnit Component',
      pricing_model: PricingModel.perUnit,
      unit_amount: 1000,
      unit_amount_decimal: undefined, // Makes it invalid
      unit_amount_currency: 'EUR',
    };

    const compositePriceItem: CompositePriceItemDto = {
      product_id: 'product-1',
      quantity: 1,
      _price: {
        _id: 'price-1',
        name: 'Test Composite Price',
        pricing_model: 'composite',
        unit_amount_currency: 'EUR',
        price_components: [invalidPerUnitComponent, anotherInvalidPerUnitComponent],
      },
    };
    const result = computeCompositePrice(compositePriceItem);
    expect(result.item_components).toEqual([]);
  });
});
