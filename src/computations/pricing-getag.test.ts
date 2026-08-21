import type { CompositePriceItem, PriceItem, PriceItemDto } from '@epilot/pricing-client';
import { describe, expect, it } from 'vitest';
import {
  compositePriceGetAG,
  compositePriceGetAGWithZeroInputMapping,
  compositePriceTieredFlatFeeGetAG,
  compositePriceTieredVolumeGetAG,
  priceGetAG,
  priceTieredFlatFeeGetAG,
  priceTieredVolumeGetAG,
  withCouponOnComponents,
} from '../__tests__/fixtures/price-getag.samples';
import { percentageCashbackCoupon, percentageDiscountCoupon } from '../coupons/__tests__/coupon.fixtures';
import { computeAggregatedAndPriceTotals } from './compute-totals';

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
                markup_amount_net_decimal: '0.084033613445',
                markup_amount_net: 8,
                markup_amount: 10,
                markup_amount_decimal: '0.10',
                markup_amount_gross: 10,
                markup_amount_gross_decimal: '0.1',
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
                markup_amount_gross: 10,
                markup_amount_gross_decimal: '0.1',
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

    it('returns the correct markups if tax is not inclusive', () => {
      const priceItems = [
        {
          ...priceGetAG,
          _price: { ...priceGetAG._price, is_tax_inclusive: false },
        } as PriceItemDto,
      ];

      const result = computeAggregatedAndPriceTotals(priceItems);

      expect((result.items?.[0] as PriceItem).get_ag).toStrictEqual(
        expect.objectContaining({
          markup_amount_net_decimal: '0.1',
          markup_amount_net: 10,
          markup_amount: 10,
          markup_amount_decimal: '0.10',
          markup_amount_gross: 12,
          markup_amount_gross_decimal: '0.119',
          unit_amount_gross: 14,
          unit_amount_gross_decimal: '0.1414434',
          unit_amount_net: 12,
          unit_amount_net_decimal: '0.11886',
          markup_total_amount_net: 10,
          markup_total_amount_gross: 12,
          category: 'power',
        }),
      );
    });

    it('returns the correct markups if tax is not inclusive with additional markups', () => {
      const priceItems = [
        {
          ...priceGetAG,
          _price: {
            ...priceGetAG._price,
            is_tax_inclusive: false,
            get_ag: {
              ...priceGetAG._price?.get_ag,
              additional_markups_enabled: true,
              additional_markups: {
                procurement: {
                  amount_decimal: '0.05',
                  amount: 5,
                },
              },
            },
          },
        } as PriceItemDto,
      ];

      const result = computeAggregatedAndPriceTotals(priceItems);

      expect((result.items?.[0] as PriceItem).get_ag).toStrictEqual(
        expect.objectContaining({
          additional_markups_enabled: true,
          additional_markups: {
            procurement: {
              amount_decimal: '0.05',
              amount: 5,
              amount_net: 5,
              amount_gross: 6,
              amount_gross_decimal: '0.0595',
              amount_net_decimal: '0.05',
            },
          },
          markup_amount_net_decimal: '0.1',
          markup_amount_net: 10,
          markup_amount: 10,
          markup_amount_decimal: '0.10',
          markup_total_amount_gross: 18,
          markup_total_amount_gross_decimal: '0.1785',
          unit_amount_gross: 14,
          unit_amount_gross_decimal: '0.1414434',
          unit_amount_net: 12,
          unit_amount_net_decimal: '0.11886',
          markup_total_amount_net: 15,
          markup_total_amount_net_decimal: '0.15',
          category: 'power',
          type: 'work_price',
        }),
      );
    });

    it('returns the correct markups if tax is inclusive with additional markups', () => {
      const priceItems = [
        {
          ...priceGetAG,
          _price: {
            ...priceGetAG._price,
            is_tax_inclusive: true,
            get_ag: {
              ...priceGetAG._price?.get_ag,
              additional_markups_enabled: true,
              additional_markups: {
                procurement: {
                  amount_decimal: '0.05',
                  amount: 5,
                },
              },
            },
          },
        } as PriceItemDto,
      ];

      const result = computeAggregatedAndPriceTotals(priceItems);

      expect((result.items?.[0] as PriceItem).get_ag).toStrictEqual(
        expect.objectContaining({
          additional_markups_enabled: true,
          additional_markups: {
            procurement: {
              amount_decimal: '0.05',
              amount: 5,
              amount_gross: 5,
              amount_gross_decimal: '0.05',
              amount_net: 4,
              amount_net_decimal: '0.042016806723',
            },
          },
          markup_amount_gross: 10,
          markup_amount_gross_decimal: '0.1',
          markup_amount_net: 8,
          markup_amount_net_decimal: '0.084033613445',
          markup_total_amount_gross: 15,
          markup_total_amount_gross_decimal: '0.15',
          markup_total_amount_net: 13,
          markup_total_amount_net_decimal: '0.126050420168',
          unit_amount_gross: 14,
          unit_amount_gross_decimal: '0.1414434',
          unit_amount_net: 12,
          unit_amount_net_decimal: '0.11886',
          category: 'power',
          type: 'work_price',
        }),
      );
    });
    describe('when margins are tiered', () => {
      describe('when model is tiered_volume', () => {
        it('returns the correct amount_total', () => {
          const priceItems: PriceItemDto[] = [priceTieredVolumeGetAG];

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
                    markup_amount_net_decimal: '0.084033613445',
                    markup_amount_net: 8,
                    markup_amount: 10,
                    markup_amount_decimal: '0.10',
                    markup_amount_gross: 10,
                    markup_amount_gross_decimal: '0.1',
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

        it('returns the correct markups if tax is not inclusive', () => {
          const priceItems = [
            { ...priceTieredVolumeGetAG, _price: { ...priceTieredVolumeGetAG._price, is_tax_inclusive: false } },
          ] as PriceItemDto[];

          const result = computeAggregatedAndPriceTotals(priceItems);

          expect((result.items?.[0] as PriceItem).get_ag).toStrictEqual(
            expect.objectContaining({
              markup_amount_net_decimal: '0.1',
              markup_amount_net: 10,
              markup_amount: 10,
              markup_amount_decimal: '0.10',
              markup_amount_gross: 12,
              markup_amount_gross_decimal: '0.119',
            }),
          );
        });
      });
      describe('when model is tiered_flatfee', () => {
        it('returns the correct amount_total', () => {
          const priceItems: PriceItemDto[] = [priceTieredFlatFeeGetAG];

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
                  get_ag: expect.objectContaining({
                    category: 'power',
                    markup_amount_net_decimal: '8.403361344538',
                    markup_amount_net: 840,
                    markup_amount: 1000,
                    markup_amount_decimal: '10.00',
                    markup_amount_gross: 1000,
                    markup_amount_gross_decimal: '10',
                    unit_amount_gross: 538,
                    unit_amount_gross_decimal: '5.380783333334',
                    unit_amount_net: 452,
                    unit_amount_net_decimal: '4.521666666667',
                  }),
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

        it('returns the correct markups if tax is not inclusive', () => {
          const priceItems = [
            { ...priceTieredFlatFeeGetAG, _price: { ...priceTieredFlatFeeGetAG._price, is_tax_inclusive: false } },
          ] as PriceItemDto[];

          const result = computeAggregatedAndPriceTotals(priceItems);

          expect((result.items?.[0] as PriceItem).get_ag).toStrictEqual(
            expect.objectContaining({
              markup_amount_net_decimal: '10',
              markup_amount_net: 1000,
              markup_amount: 1000,
              markup_amount_decimal: '10.00',
              markup_amount_gross: 1190,
              markup_amount_gross_decimal: '11.9',
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
                  unit_amount_net: 1293,
                  unit_amount_net_decimal: '12.925028011205',
                  unit_amount_gross: 1538,
                  unit_amount_gross_decimal: '15.380783333334',
                  get_ag: expect.objectContaining({
                    category: 'power',
                    markup_amount: 1000,
                    markup_amount_decimal: '10.00',
                    markup_amount_gross: 1000,
                    markup_amount_gross_decimal: '10',
                    unit_amount_gross: 538,
                    unit_amount_gross_decimal: '5.380783333334',
                    unit_amount_net: 452,
                    unit_amount_net_decimal: '4.521666666667',
                    markup_amount_net: 840,
                    markup_amount_net_decimal: '8.403361344538',
                  }),
                }),
                expect.objectContaining({
                  unit_amount_net: 20,
                  unit_amount_net_decimal: '0.202893613445',
                  unit_amount_gross: 24,
                  unit_amount_gross_decimal: '0.2414434',
                  get_ag: expect.objectContaining({
                    category: 'power',
                    markup_amount: 10,
                    markup_amount_decimal: '0.10',
                    markup_amount_gross: 10,
                    markup_amount_gross_decimal: '0.1',
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
                    markup_amount_gross: 1000,
                    markup_amount_gross_decimal: '10',
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
                    markup_amount_gross: 10,
                    markup_amount_gross_decimal: '0.1',
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

    describe('when margins are tiered', () => {
      describe('when model is tiered_volume', () => {
        it('returns the correct amount_total', () => {
          const priceItems: PriceItemDto[] = [compositePriceTieredVolumeGetAG];

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
                        markup_amount_gross: 1000,
                        markup_amount_gross_decimal: '10',
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
                        markup_amount_gross: 10,
                        markup_amount_gross_decimal: '0.1',
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
      });

      describe('when model is tiered_flatfee', () => {
        it('returns the correct amount_total', () => {
          const priceItems: PriceItemDto[] = [compositePriceTieredFlatFeeGetAG];

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
                        markup_amount_gross: 1000,
                        markup_amount_gross_decimal: '10',
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
      });
    });
  });

  describe('when a coupon is applied to GetAG components', () => {
    describe('percentage cashback', () => {
      it('does not produce a negative after-cashback total for work prices (regression)', () => {
        const result = computeAggregatedAndPriceTotals([
          withCouponOnComponents(compositePriceGetAG, percentageCashbackCoupon),
        ]);

        const components = (result.items?.[0] as CompositePriceItem)?.item_components;
        const basePriceComponent = components?.[0];
        const workPriceComponent = components?.[1];

        // Base price component: amount_total === unit gross, so the value was already correct.
        expect(basePriceComponent?.amount_total).toBe(1538);
        expect(basePriceComponent?.cashback_amount).toBe(154);
        expect(basePriceComponent?.after_cashback_amount_total).toBe(1525);

        // Work price component: amount_total = per-unit gross × consumption.
        // Previously after_cashback was computed from the tiny per-unit gross
        // (≈ 24) minus the whole cashback, yielding a negative total (-177).
        // It must now be derived from the line total instead: 24144 - 201 = 23943.
        expect(workPriceComponent?.amount_total).toBe(24144);
        expect(workPriceComponent?.cashback_amount).toBe(2414);
        expect(workPriceComponent?.after_cashback_amount_total).toBe(23943);
        expect(workPriceComponent?.after_cashback_amount_total).toBeGreaterThan(0);
      });
    });

    describe('percentage discount', () => {
      it('keeps before-discount totals above the discounted totals for GetAG components', () => {
        const result = computeAggregatedAndPriceTotals([
          withCouponOnComponents(compositePriceGetAG, percentageDiscountCoupon),
        ]);

        const components = (result.items?.[0] as CompositePriceItem)?.item_components;
        const workPriceComponent = components?.[1];

        // before_discount (24144) stays above the discounted total (18108).
        expect(workPriceComponent?.before_discount_amount_total).toBe(24144);
        expect(workPriceComponent?.amount_total).toBe(18108);
        expect(workPriceComponent?.discount_amount).toBe(6036);

        const recurrence = result.total_details?.breakdown?.recurrences?.[0];
        expect(recurrence?.before_discount_amount_total).toBe(25682);
        expect(recurrence?.amount_total).toBe(19262);
      });
    });
  });
});
