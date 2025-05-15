import { getRecurrencesWithEstimatedPrices } from './getRecurrencesWithEstimatedPrices';
import type { PriceItems } from '../types';

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
