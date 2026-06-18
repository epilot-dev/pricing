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

  it('should handle scenario where no item_components are present at the root of price or in _price', () => {
    const result = computeCompositePrice({
      product_id: 'product-1',
      quantity: 1,
      is_composite_price: true,
      _price: {
        _id: 'price-1',
        name: 'Test Composite Price',
        pricing_model: 'composite',
        unit_amount_currency: 'EUR',
        is_composite_price: true,
      },
    });
    expect(result.item_components).toEqual([]);
  });

  it('should ignore invalid tiered components', () => {
    const invalidTieredComponent: Price = {
      _id: 'component-price-1',
      name: 'Invalid Tiered Component',
      pricing_model: PricingModel.tieredVolume,
      tiers: undefined,
      unit_amount_currency: 'EUR',
    };
    const result = computeCompositePrice({
      product_id: 'product-1',
      quantity: 1,
      is_composite_price: true,
      _price: {
        _id: 'price-1',
        name: 'Test Composite Price',
        pricing_model: 'composite',
        unit_amount_currency: 'EUR',
        price_components: [invalidTieredComponent],
        is_composite_price: true,
      },
    });
    expect(result.item_components).toEqual([]);
  });

  it('should filter out invalid perUnit component', () => {
    const invalidPerUnitComponent: Price = {
      _id: 'component-price-2',
      name: 'Invalid PerUnit Component',
      pricing_model: PricingModel.perUnit,
      // unit_amount is not a number (or missing), or unit_amount_decimal is missing
      // Makes it invalid
      unit_amount: undefined,
      unit_amount_decimal: '10.00',
      unit_amount_currency: 'EUR',
    };
    const anotherInvalidPerUnitComponent: Price = {
      _id: 'component-price-3',
      name: 'Another Invalid PerUnit Component',
      pricing_model: PricingModel.perUnit,
      unit_amount: 1000,
      // Makes it invalid
      unit_amount_decimal: undefined,
      unit_amount_currency: 'EUR',
    };
    const result = computeCompositePrice({
      product_id: 'product-1',
      quantity: 1,
      is_composite_price: true,
      _price: {
        _id: 'price-1',
        name: 'Test Composite Price',
        pricing_model: 'composite',
        unit_amount_currency: 'EUR',
        price_components: [invalidPerUnitComponent, anotherInvalidPerUnitComponent],
        is_composite_price: true,
      },
    });
    expect(result.item_components).toEqual([]);
  });
});
