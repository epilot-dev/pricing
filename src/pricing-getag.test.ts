import { compositePriceGetAG } from './__tests__/fixtures/price-getag.samples'
import { computeAggregatedAndPriceTotals } from './pricing';
import { PriceItemDto } from './types';

describe('GetAG - computeAggregatedAndPriceTotals', () => {
  describe('when is_composite_price = false', () => {
    
  });

  describe('when is_composite_price = true', () => {
    it('', () => {
      const priceItems: PriceItemDto[] = [
        compositePriceGetAG
      ];
  
      const result = computeAggregatedAndPriceTotals(priceItems);

      console.log(result.total_details?.breakdown?.recurrences?.[0])

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