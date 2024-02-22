import { compositePriceGetAG } from './__tests__/fixtures/price-getag.samples'
import { computeAggregatedAndPriceTotals } from './pricing';
import { PriceItemDto } from './types';

describe('GetAG - computeAggregatedAndPriceTotals', () => {
  describe('when is_composite_price = false', () => {
    
  });

  describe('when is_composite_price = true', () => {
    const priceItems: PriceItemDto[] = [
      compositePriceGetAG
    ];

    expect(computeAggregatedAndPriceTotals(priceItems)).toStrictEqual(null);
  });
});