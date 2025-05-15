import * as samples from '../__tests__/fixtures/price.samples';
import * as results from '../__tests__/fixtures/pricing.results';
import { computeCompositePrice, getRecurrencesWithEstimatedPrices, isCompositePriceItemDto } from './pricing';
import { computePriceItemDetails } from './totals/computeTotals';
import type { CompositePrice, CompositePriceItemDto, Price, PriceItems } from '../types';

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

describe('computePriceItemDetails', () => {
  it('computes the pricing details for a simple price', () => {
    const result = computePriceItemDetails(samples.priceItem1);

    expect(result).toStrictEqual(results.priceDetailsForOnePrice);
  });

  it('computes the pricing details for a composite price', () => {
    const result = computePriceItemDetails(samples.compositePrice);

    expect(result).toStrictEqual(results.priceDetailsForCompositePrice);
  });

  it('computes the pricing details for a composite price that one component has changed its tax', () => {
    const result = computePriceItemDetails(samples.compositePriceWithTaxChanges);

    expect(result).toStrictEqual(results.priceDetailsForCompositePriceWithTaxChanges);
  });

  it('should deliver the same result when recomputing the pricing details', () => {
    const result = computePriceItemDetails(samples.compositePrice);
    const resultRecomputed = computePriceItemDetails(result.items?.[0] as CompositePriceItemDto);
    expect(result).toStrictEqual(resultRecomputed);
  });
});

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

describe('getRecurrencesWithEstimatedPrices', () => {
  const monthlyEstimateComponent = {
    type: 'recurring',
    billing_period: 'monthly',
    _price: {
      type: 'recurring',
      billing_period: 'monthly',
      price_display_in_journeys: 'estimated_price',
    },
  };

  const oneTimeEstimateComponent = {
    type: 'one_time',
    _price: {
      type: 'one_time',
      price_display_in_journeys: 'estimated_price',
    },
  };

  const monthlyComponent = {
    type: 'recurring',
    billing_period: 'monthly',
    _price: {
      type: 'recurring',
      billing_period: 'monthly',
      price_display_in_journeys: 'show_price',
    },
  };

  const oneTimeComponent = {
    type: 'one_time',
    _price: {
      type: 'one_time',
      price_display_in_journeys: 'show_price',
    },
  };

  test('should return recurrences with estimated prices (composite price, monthly estimated)', () => {
    // given
    const priceDetails = [
      {
        is_composite_price: true,
        item_components: [oneTimeComponent, monthlyComponent, monthlyEstimateComponent],
      },
      {
        is_composite_price: true,
        item_components: [oneTimeComponent, monthlyComponent],
      },
    ] as PriceItems;

    // when
    const result = getRecurrencesWithEstimatedPrices(priceDetails);

    // then
    expect(result).toEqual({ monthly: true, one_time: false });
  });

  test('should return recurrences with estimated prices (composite price, one time and monthly estimated)', () => {
    // given
    const priceDetails = [
      {
        is_composite_price: true,
        item_components: [oneTimeEstimateComponent, oneTimeComponent, monthlyComponent, monthlyEstimateComponent],
      },
      {
        is_composite_price: true,
        item_components: [oneTimeComponent, monthlyComponent],
      },
    ] as PriceItems;

    // when
    const result = getRecurrencesWithEstimatedPrices(priceDetails);

    // then
    expect(result).toEqual({ monthly: true, one_time: true });
  });

  test('should return recurrences with estimated prices (composite price, none estimated)', () => {
    // given
    const priceDetails = [
      {
        is_composite_price: true,
        item_components: [oneTimeComponent, monthlyComponent],
      },
      {
        is_composite_price: true,
        item_components: [oneTimeComponent, monthlyComponent],
      },
    ] as PriceItems;

    // when
    const result = getRecurrencesWithEstimatedPrices(priceDetails);

    // then
    expect(result).toEqual({ monthly: false, one_time: false });
  });

  test('should return recurrences with estimated prices (simple price, none estimated)', () => {
    // given
    const priceDetails: PriceItems = [oneTimeComponent, monthlyComponent];

    // when
    const result = getRecurrencesWithEstimatedPrices(priceDetails);

    // then
    expect(result).toEqual({ monthly: false, one_time: false });
  });

  test('should return recurrences with estimated prices (simple price, monthly estimated)', () => {
    // given
    const priceDetails = [oneTimeComponent, monthlyComponent, monthlyEstimateComponent] as PriceItems;

    // when
    const result = getRecurrencesWithEstimatedPrices(priceDetails);

    // then
    expect(result).toEqual({ monthly: true, one_time: false });
  });

  test('should return recurrences with estimated prices (simple price, one time and monthly estimated)', () => {
    // given
    const priceDetails = [
      oneTimeComponent,
      oneTimeEstimateComponent,
      monthlyComponent,
      monthlyEstimateComponent,
    ] as PriceItems;

    // when
    const result = getRecurrencesWithEstimatedPrices(priceDetails);

    // then
    expect(result).toEqual({ monthly: true, one_time: true });
  });

  test('should return recurrences with estimated prices (mixed prices, one time and monthly estimated)', () => {
    // given
    const priceDetails = [
      {
        is_composite_price: true,
        item_components: [oneTimeEstimateComponent, oneTimeComponent, monthlyComponent],
      },
      oneTimeComponent,
      monthlyComponent,
      monthlyEstimateComponent,
    ] as PriceItems;

    // when
    const result = getRecurrencesWithEstimatedPrices(priceDetails);

    // then
    expect(result).toEqual({ monthly: true, one_time: true });
  });
});
