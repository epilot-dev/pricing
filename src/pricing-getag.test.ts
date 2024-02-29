import { compositePriceGetAG } from './__tests__/fixtures/price-getag.samples'
import { computeAggregatedAndPriceTotals } from './pricing';
import { PriceItemDto } from './types';

describe('GetAG - computeAggregatedAndPriceTotals', () => {
  describe('when is_composite_price = true', () => {
    it('returns the correct amount_total', () => {
      const priceItems: PriceItemDto[] = [
        compositePriceGetAG
      ];
  
      const result = computeAggregatedAndPriceTotals(priceItems);

      expect(result).toStrictEqual(expect.objectContaining({
        total_details: expect.objectContaining({
          breakdown: 
            expect.objectContaining({
              recurrences: expect.arrayContaining([
                expect.objectContaining({
                  amount_total: 23338,
                }),
              ]),
            }),
        }),
      }));
    })
  });
});