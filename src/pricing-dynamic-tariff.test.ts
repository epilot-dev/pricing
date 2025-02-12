import {
  compositePriceDynamicManual,
  compositePriceDynamicRealtime,
  compositePriceDynamicRealtimeTaxInclusive,
  priceDynamicManual,
  priceDynamicRealtime,
  priceDynamicRealtimeTaxinclusive,
} from './__tests__/fixtures/price-dynamic-tariff.samples';
import { computeAggregatedAndPriceTotals } from './pricing';
import { PriceItemDto } from './types';

describe('Dynamic Tariff - computeAggregatedAndPriceTotals', () => {
  describe('when is_composite_price = false', () => {
    it('returns the correct amount_total for a manual tariff', () => {
      const priceItems: PriceItemDto[] = [priceDynamicManual];

      const result = computeAggregatedAndPriceTotals(priceItems);

      expect(result).toStrictEqual(
        expect.objectContaining({
          amount_total: 39270,
          amount_subtotal: 33000,
          amount_tax: 6270,
          items: expect.arrayContaining([
            expect.objectContaining({
              amount_total: 39270,
              amount_subtotal: 33000,
              amount_tax: 6270,
              dynamic_tariff: expect.objectContaining({
                average_price: 33,
                average_price_decimal: '0.33',
                mode: 'manual',
              }),
            }),
          ]),
          total_details: expect.objectContaining({
            breakdown: expect.objectContaining({
              recurrences: expect.arrayContaining([
                expect.objectContaining({
                  amount_total: 39270,
                  amount_subtotal: 33000,
                  amount_tax: 6270,
                }),
              ]),
            }),
          }),
        }),
      );
    });

    it('returns the correct amount_total for a realtime tariff', () => {
      const priceItems: PriceItemDto[] = [priceDynamicRealtime];

      const result = computeAggregatedAndPriceTotals(priceItems);

      expect(result).toStrictEqual(
        expect.objectContaining({
          amount_total: 34986,
          amount_subtotal: 29400,
          amount_tax: 5586,
          items: expect.arrayContaining([
            expect.objectContaining({
              amount_total: 34986,
              amount_subtotal: 29400,
              amount_tax: 5586,
              dynamic_tariff: expect.objectContaining({
                mode: 'day_ahead_market',
                interval: 'hourly',
                markup: 18,
                markup_amount_decimal: '0.18',
              }),
            }),
          ]),
          total_details: expect.objectContaining({
            breakdown: expect.objectContaining({
              recurrences: expect.arrayContaining([
                expect.objectContaining({
                  amount_total: 34986,
                  amount_subtotal: 29400,
                  amount_tax: 5586,
                }),
              ]),
            }),
          }),
        }),
      );
    });

    it('returns the correct amount_total for a realtime tariff set to include tax', () => {
      const priceItems: PriceItemDto[] = [priceDynamicRealtimeTaxinclusive];

      const result = computeAggregatedAndPriceTotals(priceItems);

      expect(result).toStrictEqual(
        expect.objectContaining({
          amount_total: 26131,
          amount_subtotal: 21958,
          amount_tax: 4172,
          items: expect.arrayContaining([
            expect.objectContaining({
              amount_total: 26131,
              amount_subtotal: 21958,
              amount_tax: 4172,
              dynamic_tariff: expect.objectContaining({
                mode: 'day_ahead_market',
                interval: 'hourly',
                markup: 25,
                markup_amount_decimal: '0.25',
              }),
            }),
          ]),
          total_details: expect.objectContaining({
            breakdown: expect.objectContaining({
              recurrences: expect.arrayContaining([
                expect.objectContaining({
                  amount_total: 26131,
                  amount_subtotal: 21958,
                  amount_tax: 4172,
                }),
              ]),
            }),
          }),
        }),
      );
    });
  });

  describe('when is_composite_price = true', () => {
    it('returns the correct amount_total for a manual tariff', () => {
      const priceItems: PriceItemDto[] = [compositePriceDynamicManual];

      const result = computeAggregatedAndPriceTotals(priceItems);

      expect(result).toStrictEqual(
        expect.objectContaining({
          amount_total: 40460,
          amount_subtotal: 34000,
          amount_tax: 6460,
          items: expect.arrayContaining([
            expect.objectContaining({
              amount_total: 40460,
              amount_subtotal: 34000,
              amount_tax: 6460,
              item_components: expect.arrayContaining([
                expect.objectContaining({
                  unit_amount: 1190,
                  unit_amount_decimal: '11.9',
                  unit_amount_gross: 1190,
                  unit_amount_gross_decimal: '11.9',
                  unit_amount_net: 1000,
                  unit_amount_net_decimal: '10',
                }),
                expect.objectContaining({
                  unit_amount: 33,
                  unit_amount_decimal: '0.33',
                  unit_amount_gross: 39,
                  unit_amount_gross_decimal: '0.3927',
                  unit_amount_net: 33,
                  unit_amount_net_decimal: '0.33',
                }),
              ]),
            }),
          ]),
          total_details: expect.objectContaining({
            breakdown: expect.objectContaining({
              recurrences: expect.arrayContaining([
                expect.objectContaining({
                  amount_total: 40460,
                  amount_subtotal: 34000,
                  amount_tax: 6460,
                }),
              ]),
            }),
          }),
        }),
      );
    });

    it('returns the correct amount_total for a realtime tariff', () => {
      const priceItems: PriceItemDto[] = [compositePriceDynamicRealtime];

      const result = computeAggregatedAndPriceTotals(priceItems);

      expect(result).toStrictEqual(
        expect.objectContaining({
          amount_total: 36176,
          amount_subtotal: 30400,
          amount_tax: 5776,
          items: expect.arrayContaining([
            expect.objectContaining({
              amount_total: 36176,
              amount_subtotal: 30400,
              amount_tax: 5776,
              item_components: expect.arrayContaining([
                expect.objectContaining({
                  unit_amount: 1190,
                  unit_amount_decimal: '11.9',
                  unit_amount_gross: 1190,
                  unit_amount_gross_decimal: '11.9',
                  unit_amount_net: 1000,
                  unit_amount_net_decimal: '10',
                }),
                expect.objectContaining({
                  unit_amount: 29,
                  unit_amount_decimal: '0.294',
                  unit_amount_gross: 35,
                  unit_amount_gross_decimal: '0.34986',
                  unit_amount_net: 29,
                  unit_amount_net_decimal: '0.294',
                }),
              ]),
            }),
          ]),
          total_details: expect.objectContaining({
            breakdown: expect.objectContaining({
              recurrences: expect.arrayContaining([
                expect.objectContaining({
                  amount_total: 36176,
                  amount_subtotal: 30400,
                  amount_tax: 5776,
                }),
              ]),
            }),
          }),
        }),
      );
    });

    it('returns the correct amount_total for a realtime tariff set to include tax', () => {
      const priceItems: PriceItemDto[] = [compositePriceDynamicRealtimeTaxInclusive];

      const result = computeAggregatedAndPriceTotals(priceItems);

      expect(result).toStrictEqual(
        expect.objectContaining({
          amount_total: 44506,
          amount_subtotal: 37400,
          amount_tax: 7106,
          items: expect.arrayContaining([
            expect.objectContaining({
              amount_total: 44506,
              amount_subtotal: 37400,
              amount_tax: 7106,
              item_components: expect.arrayContaining([
                expect.objectContaining({
                  unit_amount: 1190,
                  unit_amount_decimal: '11.9',
                  unit_amount_gross: 1190,
                  unit_amount_gross_decimal: '11.9',
                  unit_amount_net: 1000,
                  unit_amount_net_decimal: '10',
                }),
                expect.objectContaining({
                  unit_amount: 36,
                  unit_amount_decimal: '0.364',
                  unit_amount_gross: 43,
                  unit_amount_gross_decimal: '0.43316',
                  unit_amount_net: 36,
                  unit_amount_net_decimal: '0.364',
                }),
              ]),
            }),
          ]),
          total_details: expect.objectContaining({
            breakdown: expect.objectContaining({
              recurrences: expect.arrayContaining([
                expect.objectContaining({
                  amount_total: 44506,
                  amount_subtotal: 37400,
                  amount_tax: 7106,
                }),
              ]),
            }),
          }),
        }),
      );
    });
  });
});
