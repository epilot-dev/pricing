import {
  compositePriceGetAG,
  compositePriceGetAGWithZeroInputMapping,
  priceGetAG,
  priceTieredGetAG,
} from './__tests__/fixtures/price-getag.samples';
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
              amount_total: 24144,
              amount_subtotal: 20289,
              amount_tax: 3855,
              get_ag: expect.objectContaining({
                category: 'power',
                markup_amount: 10,
                markup_amount_decimal: '0.10',
                unit_amount_gross: 14,
                unit_amount_gross_decimal: '0.1414434',
                unit_amount_net: 12,
                unit_amount_net_decimal: '0.11886',
                markup_amount_net: 8,
                markup_amount_net_decimal: '0.084033613445',
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

    it('returns the correct amount_total with quantity > 1', () => {
      const priceItems: PriceItemDto[] = [{ ...priceGetAG, quantity: 2 }];

      const result = computeAggregatedAndPriceTotals(priceItems);

      expect(result).toStrictEqual(
        expect.objectContaining({
          amount_total: 48289,
          amount_subtotal: 40579,
          amount_tax: 7710,
          items: expect.arrayContaining([
            expect.objectContaining({
              amount_total: 48289,
              amount_subtotal: 40579,
              amount_tax: 7710,
              get_ag: expect.objectContaining({
                category: 'power',
                markup_amount: 10,
                markup_amount_decimal: '0.10',
                unit_amount_gross: 14,
                unit_amount_gross_decimal: '0.1414434',
                unit_amount_net: 12,
                unit_amount_net_decimal: '0.11886',
                markup_amount_net: 8,
                markup_amount_net_decimal: '0.084033613445',
              }),
            }),
          ]),
          total_details: expect.objectContaining({
            breakdown: expect.objectContaining({
              recurrences: expect.arrayContaining([
                expect.objectContaining({
                  amount_total: 48289,
                  amount_subtotal: 40579,
                  amount_tax: 7710,
                }),
              ]),
            }),
          }),
        }),
      );
    });
    it('returns the default amount_total if no external fees mappings are passed', () => {
      const priceItems: PriceItemDto[] = [
        {
          ...priceGetAG,
          external_fees_mappings: undefined,
        },
      ];

      const result = computeAggregatedAndPriceTotals(priceItems);

      expect(result).toBeDefined();
      expect(result.amount_total).toBe(0);
    });

    describe('when margins are tiered', () => {
      describe('when model is when model is tiered_volume', () => {
        it('returns the correct amount_total', () => {
          const priceItems: PriceItemDto[] = [priceTieredGetAG];

          const result = computeAggregatedAndPriceTotals(priceItems);

          expect(result).toStrictEqual(
            expect.objectContaining({
              amount_total: 24144,
              amount_subtotal: 20289,
              amount_tax: 3855,
              items: expect.arrayContaining([
                expect.objectContaining({
                  amount_total: 24144,
                  amount_subtotal: 20289,
                  amount_tax: 3855,
                  get_ag: expect.objectContaining({
                    category: 'power',
                    markup_amount: 10,
                    markup_amount_decimal: '0.10',
                    markup_amount_net: 8,
                    markup_amount_net_decimal: '0.084033613445',
                    unit_amount_gross: 14,
                    unit_amount_gross_decimal: '0.1414434',
                    unit_amount_net: 12,
                    unit_amount_net_decimal: '0.11886',
                    markup_tiers_details: [
                      expect.objectContaining({
                        up_to: 1000,
                        unit_amount: 10,
                        unit_amount_decimal: '0.10',
                        flat_fee_amount: 0,
                        flat_fee_amount_decimal: '0',
                      }),
                    ],
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
              amount_total: 25682,
              amount_subtotal: 21582,
              amount_tax: 4101,
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
                    markup_amount_net: 840,
                    markup_amount_net_decimal: '8.403361344538',
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
                    markup_amount_net: 8,
                    markup_amount_net_decimal: '0.084033613445',
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
    it('returns the correct amount_total having consumption input zero', () => {
      const priceItems: PriceItemDto[] = [compositePriceGetAGWithZeroInputMapping];

      const result = computeAggregatedAndPriceTotals(priceItems);

      expect(result).toStrictEqual(
        expect.objectContaining({
          amount_total: 1538,
          amount_subtotal: 1293,
          amount_tax: 246,
          items: expect.arrayContaining([
            expect.objectContaining({
              amount_total: 1538,
              amount_subtotal: 1293,
              amount_tax: 246,
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
                    markup_amount_net: 840,
                    markup_amount_net_decimal: '8.403361344538',
                  }),
                }),
                expect.objectContaining({
                  get_ag: expect.objectContaining({
                    category: 'power',
                    markup_amount: 10,
                    markup_amount_decimal: '0.10',
                    unit_amount_gross: 0,
                    unit_amount_gross_decimal: '0',
                    unit_amount_net: 0,
                    unit_amount_net_decimal: '0',
                    markup_amount_net: 0,
                    markup_amount_net_decimal: '0',
                  }),
                }),
              ]),
            }),
          ]),
          total_details: expect.objectContaining({
            breakdown: expect.objectContaining({
              recurrences: expect.arrayContaining([
                expect.objectContaining({
                  amount_total: 1538,
                  amount_subtotal: 1293,
                  amount_tax: 246,
                }),
              ]),
            }),
          }),
        }),
      );
    });

    it('returns the correct amount_total with quantity > 1', () => {
      const priceItems: PriceItemDto[] = [{ ...compositePriceGetAG, quantity: 2 }];

      const result = computeAggregatedAndPriceTotals(priceItems);

      expect(result).toStrictEqual(
        expect.objectContaining({
          amount_subtotal: 43164,
          amount_total: 51365,
          amount_tax: 8201,
          items: expect.arrayContaining([
            expect.objectContaining({
              amount_subtotal: 43164,
              amount_total: 51365,
              amount_tax: 8201,
              item_components: expect.arrayContaining([
                expect.objectContaining({
                  amount_subtotal: 2585,
                  amount_total: 3076,
                  amount_tax: 491,
                  unit_amount_gross: 1538,
                  unit_amount_net: 1293,
                  get_ag: expect.objectContaining({
                    category: 'power',
                    markup_amount: 1000,
                    markup_amount_decimal: '10.00',
                    unit_amount_gross: 538,
                    unit_amount_gross_decimal: '5.380783333334',
                    unit_amount_net: 452,
                    unit_amount_net_decimal: '4.521666666667',
                    markup_amount_net: 840,
                    markup_amount_net_decimal: '8.403361344538',
                  }),
                }),
                expect.objectContaining({
                  amount_subtotal: 40579,
                  amount_total: 48289,
                  amount_tax: 7710,
                  unit_amount_gross: 24,
                  unit_amount_net: 20,
                  get_ag: expect.objectContaining({
                    category: 'power',
                    markup_amount: 10,
                    markup_amount_decimal: '0.10',
                    unit_amount_gross: 14,
                    unit_amount_gross_decimal: '0.1414434',
                    unit_amount_net: 12,
                    unit_amount_net_decimal: '0.11886',
                    markup_amount_net: 8,
                    markup_amount_net_decimal: '0.084033613445',
                  }),
                }),
              ]),
            }),
          ]),
          total_details: expect.objectContaining({
            breakdown: expect.objectContaining({
              recurrences: expect.arrayContaining([
                expect.objectContaining({
                  amount_subtotal: 43164,
                  amount_total: 51365,
                  amount_tax: 8201,
                }),
              ]),
            }),
          }),
        }),
      );
    });
  });
});
