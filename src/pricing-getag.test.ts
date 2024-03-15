import { compositePriceGetAG, priceGetAG } from './__tests__/fixtures/price-getag.samples';
import { computeAggregatedAndPriceTotals } from './pricing';
import { PriceItemDto } from './types';

describe('GetAG - computeAggregatedAndPriceTotals', () => {
  describe('when is_composite_price = false', () => {
    it('returns the correct amount_total', () => {
      const priceItems: PriceItemDto[] = [priceGetAG];

      const result = computeAggregatedAndPriceTotals(priceItems);

      expect(result).toStrictEqual(
        expect.objectContaining({
          amount_total: 24144,
          amount_subtotal: 20289,
          amount_tax: 3855,
          items: expect.arrayContaining([
            expect.objectContaining({
              get_ag: expect.objectContaining({
                category: 'power',
                markup_amount: 10,
                markup_amount_decimal: '0.10',
                unit_amount_gross: 14,
                unit_amount_gross_decimal: '0.1414434',
                unit_amount_net: 12,
                unit_amount_net_decimal: '0.11886',
              }),
            }),
          ]),
          total_details: expect.objectContaining({
            breakdown: expect.objectContaining({
              recurrences: expect.arrayContaining([
                expect.objectContaining({
                  amount_total: 24144,
                  amount_subtotal: 20289,
                  amount_tax: 3855,
                }),
              ]),
            }),
          }),
        }),
      );
    });
  });

  describe('when is_composite_price = true', () => {
    it('returns the correct amount_total', () => {
      const priceItems: PriceItemDto[] = [compositePriceGetAG];

      const result = computeAggregatedAndPriceTotals(priceItems);

      expect(result).toStrictEqual(
        expect.objectContaining({
          amount_total: 25682,
          amount_subtotal: 21582,
          amount_tax: 4101,
          items: expect.arrayContaining([
            expect.objectContaining({
              item_components: expect.arrayContaining([
                expect.objectContaining({
                  get_ag: expect.objectContaining({
                    category: 'power',
                    markup_amount: 1000,
                    markup_amount_decimal: '10.00',
                    unit_amount_gross: 538,
                    unit_amount_gross_decimal: '5.380783333334',
                    unit_amount_net: 452,
                    unit_amount_net_decimal: '4.521666666667',
                  }),
                }),
                expect.objectContaining({
                  get_ag: expect.objectContaining({
                    category: 'power',
                    markup_amount: 10,
                    markup_amount_decimal: '0.10',
                    unit_amount_gross: 14,
                    unit_amount_gross_decimal: '0.1414434',
                    unit_amount_net: 12,
                    unit_amount_net_decimal: '0.11886',
                  }),
                }),
              ]),
            }),
          ]),
          total_details: expect.objectContaining({
            breakdown: expect.objectContaining({
              recurrences: expect.arrayContaining([
                expect.objectContaining({
                  amount_total: 25682,
                  amount_subtotal: 21582,
                  amount_tax: 4101,
                }),
              ]),
            }),
          }),
        }),
      );
    });
  });
});
