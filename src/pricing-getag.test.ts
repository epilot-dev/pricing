import { compositePriceGetAG, priceGetAG } from './__tests__/fixtures/price-getag.samples'
import { computeAggregatedAndPriceTotals } from './pricing';
import { PriceItemDto } from './types';

describe('GetAG - computeAggregatedAndPriceTotals', () => {

  describe('when is_composite_price = false', () => {
    it('returns the correct amount_total', () => {
      const priceItems: PriceItemDto[] = [
        priceGetAG
      ];
  
      const result = computeAggregatedAndPriceTotals(priceItems);

      expect(result).toStrictEqual(expect.objectContaining({
        amount_total: 24144,
        amount_subtotal: 20289,
        amount_tax: 3855,
        total_details: expect.objectContaining({
          breakdown: 
            expect.objectContaining({
              recurrences: expect.arrayContaining([
                expect.objectContaining({
                  amount_total: 24144,
                  amount_subtotal: 20289,
                  amount_tax: 3855,
                }),
              ]),
            }),
        }),
      }));
    })
  })

  describe('when is_composite_price = true', () => {
    it('returns the correct amount_total', () => {
      const priceItems: PriceItemDto[] = [
        compositePriceGetAG
      ];
  
      const result = computeAggregatedAndPriceTotals(priceItems);

      expect(result).toStrictEqual(expect.objectContaining({
        amount_total: 25682,
        amount_subtotal: 21582,
        amount_tax: 4101,
        total_details: expect.objectContaining({
          breakdown: 
            expect.objectContaining({
              recurrences: expect.arrayContaining([
                expect.objectContaining({
                  amount_total: 25682,
                  amount_subtotal: 21582,
                  amount_tax: 4101,
                }),
              ]),
            }),
        }),
      }));
    })
  });
});