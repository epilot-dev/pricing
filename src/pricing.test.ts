import * as samples from './__tests__/fixtures/price.samples';
import * as results from './__tests__/fixtures/pricing.results';
import {
  computeAggregatedAndPriceTotals,
  computeCompositePrice,
  computePriceDetails,
  computePriceItemDetails,
  extractPricingEntitiesBySlug,
  isCompositePrice,
} from './pricing';
import {
  CompositePrice,
  CompositePriceItemDto,
  Price,
  PriceInputMappings,
  PriceItemDto,
  PriceTier,
  TimeFrequency,
} from './types';

describe('computeAggregatedAndPriceTotals', () => {
  describe('when is_composite_price = false', () => {
    it('should return the right result when there is one item per recurrence', () => {
      const priceItems: PriceItemDto[] = [
        samples.priceItem1,
        samples.priceItem2,
        samples.priceItem3,
        samples.priceItem6,
      ];

      expect(computeAggregatedAndPriceTotals(priceItems)).toStrictEqual(results.oneItemPerRecurrenceTotals);
    });

    it('should return 0 when number input is 0', () => {
      const priceItems: PriceItemDto[] = [samples.simplePriceWithNumberInputEqualsToZero];
      expect(computeAggregatedAndPriceTotals(priceItems)).toStrictEqual(
        expect.objectContaining({
          amount_subtotal: 0,
          amount_total: 0,
          total_details: expect.objectContaining({
            amount_tax: 0,
          }),
          items: expect.arrayContaining([
            expect.objectContaining({
              amount_subtotal: 0,
              amount_total: 0,
            }),
          ]),
        }),
      );
    });

    it('should return the right result when there are several items per recurrence', () => {
      const priceItems = [
        samples.priceItem1,
        samples.priceItem2,
        samples.priceItem3,
        samples.priceItem4,
        samples.priceItem5,
        samples.compositePrice,
      ];

      const result = computeAggregatedAndPriceTotals(priceItems);

      expect(result).toStrictEqual(results.severalItemsPerRecurrenceTotals);
    });

    it('should return the right result when the price is not provided ', () => {
      const priceItems = [samples.incompletePriceItem];

      const result = computeAggregatedAndPriceTotals(priceItems);

      expect(result).toEqual(results.resultsWhenNoPricesProvided);
    });

    it('should return the right result when the price is nontaxable', () => {
      const priceItems = [samples.priceItemNonTaxable];

      const result = computeAggregatedAndPriceTotals(priceItems);

      expect(result).toEqual(results.resultsWhenPriceIsNontaxable);
    });

    it('should return the right result when quantity=0', () => {
      const priceItems = [{ ...samples.priceItem1, quantity: 0 }];

      const result = computeAggregatedAndPriceTotals(priceItems);

      expect(result).toEqual(
        expect.objectContaining({ amount_subtotal: 0, amount_total: 0, unit_amount_gross: 78946 }),
      );
    });

    it('should return the right result when there is one simple price with display mode "On Request"', () => {
      const priceItems = [samples.priceItemDisplayOnRequest];

      const result = computeAggregatedAndPriceTotals(priceItems);

      expect(result).toEqual(results.priceWithDisplayOnRequest);
    });

    it('should return the right result when there is one simple price with display mode "Display as starting price"', () => {
      const priceItems = [samples.priceItemDisplayAsStartingPrice];

      const result = computeAggregatedAndPriceTotals(priceItems);

      expect(result).toEqual(
        expect.objectContaining({
          amount_subtotal: 4546,
          amount_total: 5000,
          unit_amount_gross: 5000,
          total_details: expect.objectContaining({
            breakdown: expect.objectContaining({
              recurrences: [
                {
                  amount_subtotal: 4546,
                  amount_tax: 455,
                  amount_total: 5000,
                  unit_amount_gross: 5000,
                  type: 'recurring',
                  billing_period: 'yearly',
                },
              ],
            }),
          }),
        }),
      );
    });

    it('should return the right result when there is one simple price with display mode "On Request" and other simple prices', () => {
      const priceItems = [
        samples.priceItem1,
        samples.priceItem2,
        samples.priceItem3,
        samples.priceItem6,
        samples.priceItemDisplayOnRequest,
      ];

      const result = computeAggregatedAndPriceTotals(priceItems);

      expect(result).toEqual(results.priceWithDisplayOnRequestAndSimplePrices);
    });

    describe('pricing_model = tiered_graduated', () => {
      it('should return the correct result when tiers are undefined', () => {
        const priceItems = [
          {
            ...samples.priceItemWithVolumeTiersNoFlatFee,
            quantity: 1,
            _price: { ...samples.priceItemWithGraduatedTiersNoFlatFee._price, tiers: undefined } as Price,
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            amount_subtotal: 0,
            amount_total: 0,
            unit_amount_gross: 0,
            total_details: expect.objectContaining({
              amount_tax: 0,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_subtotal: 0,
                amount_total: 0,
                unit_amount_gross: 0,
              }),
              expect.not.objectContaining({
                unit_amount: undefined,
                unit_amount_net: undefined,
                unit_amount_decimal: undefined,
                unit_amount_gross: undefined,
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when tiers are empty', () => {
        const priceItems = [
          {
            ...samples.priceItemWithGraduatedTiersNoFlatFee,
            quantity: 1,
            _price: { ...samples.priceItemWithGraduatedTiersNoFlatFee._price, tiers: [] as PriceTier[] },
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            amount_subtotal: 0,
            amount_total: 0,
            unit_amount_gross: 0,
            total_details: expect.objectContaining({
              amount_tax: 0,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_subtotal: 0,
                amount_total: 0,
                unit_amount_gross: 0,
              }),
              expect.not.objectContaining({
                unit_amount: undefined,
                unit_amount_net: undefined,
                unit_amount_decimal: undefined,
                unit_amount_gross: undefined,
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when input mapping is 0', () => {
        const priceItems = [
          {
            ...samples.priceItemWithGraduatedTiersNoFlatFee,
            price_mappings: [
              {
                frequency_unit: 'one_time',
                price_id: samples.priceItemWithGraduatedTiersNoFlatFee._price?._id,
                value: 0,
              },
            ] as PriceInputMappings,
            quantity: 0,
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            amount_total: 0,
            amount_subtotal: 0,
            unit_amount_gross: 0,
            total_details: expect.objectContaining({
              amount_tax: 0,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_total: 0,
                amount_subtotal: 0,
                unit_amount_gross: 0,
              }),
              expect.not.objectContaining({
                unit_amount: undefined,
                unit_amount_net: undefined,
                unit_amount_decimal: undefined,
                unit_amount_gross: undefined,
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when input mapping is 2', () => {
        const priceItems = [
          {
            ...samples.priceItemWithGraduatedTiersNoFlatFee,
            price_mappings: [
              {
                frequency_unit: 'one_time',
                price_id: samples.priceItemWithGraduatedTiersNoFlatFee._price?._id,
                value: 2,
              },
            ] as PriceInputMappings,
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            amount_subtotal: 1818,
            amount_total: 2000,
            unit_amount_gross: 1000,
            total_details: expect.objectContaining({
              amount_tax: 182,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_subtotal: 1818,
                amount_total: 2000,
                unit_amount_gross: 1000,
              }),
              expect.not.objectContaining({
                unit_amount: undefined,
                unit_amount_net: undefined,
                unit_amount_decimal: undefined,
                unit_amount_gross: undefined,
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when input mapping is 10', () => {
        const priceItems = [
          {
            ...samples.priceItemWithGraduatedTiersNoFlatFee,
            price_mappings: [
              {
                frequency_unit: 'one_time',
                price_id: samples.priceItemWithGraduatedTiersNoFlatFee._price?._id,
                value: 10,
              },
            ] as PriceInputMappings,
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            amount_subtotal: 9091,
            amount_total: 10000,
            unit_amount_gross: 1000,
            total_details: expect.objectContaining({
              amount_tax: 909,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_subtotal: 9091,
                amount_total: 10000,
                unit_amount_gross: 1000,
              }),
              expect.not.objectContaining({
                unit_amount: undefined,
                unit_amount_net: undefined,
                unit_amount_decimal: undefined,
                unit_amount_gross: undefined,
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when input mapping is 10.999', () => {
        const priceItems = [
          {
            ...samples.priceItemWithGraduatedTiersNoFlatFee,
            price_mappings: [
              {
                frequency_unit: 'one_time',
                price_id: samples.priceItemWithGraduatedTiersNoFlatFee._price?._id,
                value: 10.999,
              },
            ] as PriceInputMappings,
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            amount_subtotal: 9817,
            amount_total: 10799,
            unit_amount_gross: 1800,
            total_details: expect.objectContaining({
              amount_tax: 982,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_subtotal: 9817,
                amount_total: 10799,
                unit_amount_gross: 1800,
              }),
              expect.not.objectContaining({
                unit_amount: undefined,
                unit_amount_net: undefined,
                unit_amount_decimal: undefined,
                unit_amount_gross: undefined,
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when input mapping is 15', () => {
        const priceItems = [
          {
            ...samples.priceItemWithGraduatedTiersNoFlatFee,
            price_mappings: [
              {
                frequency_unit: 'one_time',
                price_id: samples.priceItemWithGraduatedTiersNoFlatFee._price?._id,
                value: 15,
              },
            ] as PriceInputMappings,
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            amount_subtotal: 12727,
            amount_total: 14000,
            unit_amount_gross: 1800,
            total_details: expect.objectContaining({
              amount_tax: 1273,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_subtotal: 12727,
                amount_total: 14000,
                unit_amount_gross: 1800,
              }),
              expect.not.objectContaining({
                unit_amount: undefined,
                unit_amount_net: undefined,
                unit_amount_decimal: undefined,
                unit_amount_gross: undefined,
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when input mapping is 100', () => {
        const priceItems = [
          {
            ...samples.priceItemWithGraduatedTiersNoFlatFee,
            price_mappings: [
              {
                frequency_unit: 'one_time',
                price_id: samples.priceItemWithGraduatedTiersNoFlatFee._price?._id,
                value: 100,
              },
            ] as PriceInputMappings,
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            amount_total: 66000,
            amount_subtotal: 60000,
            unit_amount_gross: 2400,
            total_details: expect.objectContaining({
              amount_tax: 6000,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_total: 66000,
                amount_subtotal: 60000,
                unit_amount_gross: 2400,
              }),
              expect.not.objectContaining({
                unit_amount: undefined,
                unit_amount_net: undefined,
                unit_amount_decimal: undefined,
                unit_amount_gross: undefined,
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when price is negative and bottom tier is matched', () => {
        const priceItems = [
          {
            ...samples.priceItemWithNegativePriceGraduatedTiersNoFlatFee,
            price_mappings: [
              {
                frequency_unit: 'one_time',
                price_id: samples.priceItemWithGraduatedTiersNoFlatFee._price?._id,
                value: 2,
              },
            ] as PriceInputMappings,
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            unit_amount_gross: -1000,
            amount_subtotal: -1818,
            amount_total: -2000,
            total_details: expect.objectContaining({
              amount_tax: -182,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                pricing_model: 'tiered_graduated',
                unit_amount_gross: -1000,
                amount_subtotal: -1818,
                amount_total: -2000,
              }),
              expect.not.objectContaining({
                unit_amount: undefined,
                unit_amount_net: undefined,
                unit_amount_decimal: undefined,
                unit_amount_gross: undefined,
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when price is negative and upper tier is matched', () => {
        const priceItems = [
          {
            ...samples.priceItemWithNegativePriceGraduatedTiersNoFlatFee,
            price_mappings: [
              {
                frequency_unit: 'one_time',
                price_id: samples.priceItemWithGraduatedTiersNoFlatFee._price?._id,
                value: 50,
              },
            ] as PriceInputMappings,
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            unit_amount_gross: -2400,
            amount_subtotal: -32727,
            amount_total: -36000,
            total_details: expect.objectContaining({
              amount_tax: -3273,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                pricing_model: 'tiered_graduated',
                unit_amount_gross: -2400,
                amount_subtotal: -32727,
                amount_total: -36000,
              }),
              expect.not.objectContaining({
                unit_amount: undefined,
                unit_amount_net: undefined,
                unit_amount_decimal: undefined,
                unit_amount_gross: undefined,
              }),
            ]),
          }),
        );
      });
    });

    describe('pricing_model = tiered_volume', () => {
      it('should return the correct result when tiers are undefined', () => {
        const priceItems = [
          {
            ...samples.priceItemWithVolumeTiersNoFlatFee,
            quantity: 1,
            _price: { ...samples.priceItemWithVolumeTiersNoFlatFee._price, tiers: undefined } as Price,
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            amount_subtotal: 0,
            amount_total: 0,
            unit_amount_gross: 0,
            total_details: expect.objectContaining({
              amount_tax: 0,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_subtotal: 0,
                amount_total: 0,
                unit_amount_gross: 0,
              }),
              expect.not.objectContaining({
                unit_amount: undefined,
                unit_amount_net: undefined,
                unit_amount_decimal: undefined,
                unit_amount_gross: undefined,
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when tiers are empty', () => {
        const priceItems = [
          {
            ...samples.priceItemWithVolumeTiersNoFlatFee,
            quantity: 1,
            _price: { ...samples.priceItemWithVolumeTiersNoFlatFee._price, tiers: [] as PriceTier[] },
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            amount_subtotal: 0,
            amount_total: 0,
            unit_amount_gross: 0,
            total_details: expect.objectContaining({
              amount_tax: 0,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_subtotal: 0,
                amount_total: 0,
                unit_amount_gross: 0,
              }),
              expect.not.objectContaining({
                unit_amount: undefined,
                unit_amount_net: undefined,
                unit_amount_decimal: undefined,
                unit_amount_gross: undefined,
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when input mapping is 0', () => {
        const priceItems = [
          {
            ...samples.priceItemWithVolumeTiersNoFlatFee,
            price_mappings: [
              {
                frequency_unit: 'one_time',
                price_id: samples.priceItemWithVolumeTiersNoFlatFee._price?._id,
                value: 0,
              },
            ] as PriceInputMappings,
            quantity: 0,
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            amount_total: 0,
            amount_subtotal: 0,
            unit_amount_gross: 0,
            total_details: expect.objectContaining({
              amount_tax: 0,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_total: 0,
                amount_subtotal: 0,
                unit_amount_gross: 0,
              }),
              expect.not.objectContaining({
                unit_amount: undefined,
                unit_amount_net: undefined,
                unit_amount_decimal: undefined,
                unit_amount_gross: undefined,
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when input mapping is 2', () => {
        const priceItems = [{ ...samples.priceItemWithVolumeTiersNoFlatFee, quantity: 2 }];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            amount_subtotal: 1818,
            amount_total: 2000,
            unit_amount_gross: 1000,
            total_details: expect.objectContaining({
              amount_tax: 182,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_subtotal: 1818,
                amount_total: 2000,
                unit_amount_gross: 1000,
              }),
              expect.not.objectContaining({
                unit_amount: undefined,
                unit_amount_net: undefined,
                unit_amount_decimal: undefined,
                unit_amount_gross: undefined,
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when input mapping is 10', () => {
        const priceItems = [{ ...samples.priceItemWithVolumeTiersNoFlatFee, quantity: 10 }];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            amount_subtotal: 9091,
            amount_total: 10000,
            unit_amount_gross: 1000,
            total_details: expect.objectContaining({
              amount_tax: 909,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_subtotal: 9091,
                amount_total: 10000,
                unit_amount_gross: 1000,
              }),
              expect.not.objectContaining({
                unit_amount: undefined,
                unit_amount_net: undefined,
                unit_amount_decimal: undefined,
                unit_amount_gross: undefined,
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when input mapping is 10.999', () => {
        const priceItems = [
          {
            ...samples.priceItemWithVolumeTiersNoFlatFee,
            price_mappings: [
              {
                frequency_unit: 'yearly' as TimeFrequency,
                price_id: samples.priceItemWithVolumeTiersNoFlatFee._price?._id,
                value: 10.999,
              },
            ],
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            amount_subtotal: 7999,
            amount_total: 8799,
            unit_amount_gross: 800,
            total_details: expect.objectContaining({
              amount_tax: 800,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_subtotal: 7999,
                amount_total: 8799,
                unit_amount_gross: 800,
              }),
              expect.not.objectContaining({
                unit_amount: undefined,
                unit_amount_net: undefined,
                unit_amount_decimal: undefined,
                unit_amount_gross: undefined,
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when input mapping is 15', () => {
        const priceItems = [
          {
            ...samples.priceItemWithVolumeTiersNoFlatFee,
            price_mappings: [
              {
                frequency_unit: 'yearly' as TimeFrequency,
                price_id: samples.priceItemWithVolumeTiersNoFlatFee._price?._id,
                value: 15,
              },
            ],
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            amount_subtotal: 10909,
            amount_total: 12000,
            unit_amount_gross: 800,
            total_details: expect.objectContaining({
              amount_tax: 1091,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_subtotal: 10909,
                amount_total: 12000,
                unit_amount_gross: 800,
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when input mapping is 100', () => {
        const priceItems = [
          {
            ...samples.priceItemWithVolumeTiersNoFlatFee,
            price_mappings: [
              {
                frequency_unit: 'yearly' as TimeFrequency,
                price_id: samples.priceItemWithVolumeTiersNoFlatFee._price?._id,
                value: 100,
              },
            ],
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            amount_total: 60000,
            amount_subtotal: 54545,
            unit_amount_gross: 600,
            total_details: expect.objectContaining({
              amount_tax: 5455,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_total: 60000,
                amount_subtotal: 54545,
                unit_amount_gross: 600,
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when price is negative and bottom tier is matched', () => {
        const priceItems = [
          {
            ...samples.priceItemWithNegativePriceVolumeTiersNoFlatFee,
            price_mappings: [
              {
                frequency_unit: 'yearly' as TimeFrequency,
                price_id: samples.priceItemWithNegativePriceVolumeTiersNoFlatFee._price?._id,
                value: 3,
              },
            ],
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toEqual(
          expect.objectContaining({
            unit_amount_gross: -1000,
            amount_subtotal: -2727,
            amount_total: -3000,
            total_details: expect.objectContaining({
              amount_tax: -273,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                pricing_model: 'tiered_volume',
                unit_amount_gross: -1000,
                amount_subtotal: -2727,
                amount_total: -3000,
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when price is negative and upper tier is matched', () => {
        const priceItems = [
          {
            ...samples.priceItemWithNegativePriceVolumeTiersNoFlatFee,
            price_mappings: [
              {
                frequency_unit: 'yearly' as TimeFrequency,
                price_id: samples.priceItemWithNegativePriceVolumeTiersNoFlatFee._price?._id,
                value: 100,
              },
            ],
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toEqual(
          expect.objectContaining({
            unit_amount_gross: -600,
            amount_subtotal: -54545,
            amount_total: -60000,
            total_details: expect.objectContaining({
              amount_tax: -5455,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                pricing_model: 'tiered_volume',
                unit_amount_gross: -600,
                amount_subtotal: -54545,
                amount_total: -60000,
              }),
            ]),
          }),
        );
      });
    });

    describe('pricing_model = tiered_flat_fee', () => {
      it('should return the correct result when tiers are undefined', () => {
        const priceItems = [
          {
            ...samples.priceItemWithFlatFeeTiers,
            quantity: 1,
            _price: { ...samples.priceItemWithFlatFeeTiers._price, tiers: undefined } as Price,
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            amount_subtotal: 0,
            amount_total: 0,
            unit_amount_gross: 0,
            total_details: expect.objectContaining({
              amount_tax: 0,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_subtotal: 0,
                amount_total: 0,
                unit_amount_gross: 0,
              }),
              expect.not.objectContaining({
                unit_amount: undefined,
                unit_amount_net: undefined,
                unit_amount_decimal: undefined,
                unit_amount_gross: undefined,
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when tiers are empty', () => {
        const priceItems = [
          {
            ...samples.priceItemWithFlatFeeTiers,
            quantity: 1,
            _price: { ...samples.priceItemWithFlatFeeTiers._price, tiers: [] as PriceTier[] },
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            amount_subtotal: 0,
            amount_total: 0,
            unit_amount_gross: 0,
            total_details: expect.objectContaining({
              amount_tax: 0,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_subtotal: 0,
                amount_total: 0,
                unit_amount_gross: 0,
              }),
              expect.not.objectContaining({
                unit_amount: undefined,
                unit_amount_net: undefined,
                unit_amount_decimal: undefined,
                unit_amount_gross: undefined,
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when input mapping is 0', () => {
        const priceItems = [
          {
            ...samples.priceItemWithFlatFeeTiers,
            price_mappings: [
              {
                frequency_unit: 'yearly' as TimeFrequency,
                price_id: samples.priceItemWithFlatFeeTiers._price?._id,
                value: 0,
              },
            ],
            quantity: 0,
          },
        ];
        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            amount_total: 0,
            amount_subtotal: 0,
            unit_amount_gross: 0,
            total_details: expect.objectContaining({
              amount_tax: 0,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_total: 0,
                amount_subtotal: 0,
                unit_amount_gross: 0,
              }),
              expect.not.objectContaining({
                unit_amount: undefined,
                unit_amount_net: undefined,
                unit_amount_decimal: undefined,
                unit_amount_gross: undefined,
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when input mapping is 2', () => {
        const priceItems = [
          {
            ...samples.priceItemWithFlatFeeTiers,
            price_mappings: [
              { frequency_unit: 'one_time', price_id: samples.priceItemWithFlatFeeTiers._price?._id, value: 2 },
            ] as PriceInputMappings,
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            amount_total: 10000,
            amount_subtotal: 9091,
            unit_amount_gross: 10000,
            total_details: expect.objectContaining({
              amount_tax: 909,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_total: 10000,
                amount_subtotal: 9091,
                unit_amount_gross: 10000,
              }),
              expect.not.objectContaining({
                unit_amount: undefined,
                unit_amount_net: undefined,
                unit_amount_decimal: undefined,
                unit_amount_gross: undefined,
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when input mapping is 10', () => {
        const priceItems = [
          {
            ...samples.priceItemWithFlatFeeTiers,
            price_mappings: [
              { frequency_unit: 'one_time', price_id: samples.priceItemWithFlatFeeTiers._price?._id, value: 10 },
            ] as PriceInputMappings,
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            amount_total: 8000,
            amount_subtotal: 7273,
            unit_amount_gross: 8000,
            total_details: expect.objectContaining({
              amount_tax: 727,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_total: 8000,
                amount_subtotal: 7273,
                unit_amount_gross: 8000,
              }),
              expect.not.objectContaining({
                unit_amount: undefined,
                unit_amount_net: undefined,
                unit_amount_decimal: undefined,
                unit_amount_gross: undefined,
              }),
            ]),
          }),
        );
      });

      it('should only use the mapping input for multiplying when it is being passed', () => {
        const priceItems = [
          {
            ...samples.priceItemWithFlatFeeTiers,
            price_mappings: [
              {
                frequency_unit: 'yearly' as TimeFrequency,
                price_id: samples.priceItemWithFlatFeeTiers._price?._id,
                value: 10,
              },
            ],
            quantity: 2,
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            amount_total: 16000,
            amount_subtotal: 14545,
            unit_amount_gross: 8000,
            total_details: expect.objectContaining({
              amount_tax: 1455,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_total: 16000,
                amount_subtotal: 14545,
                unit_amount_gross: 8000,
              }),
              expect.not.objectContaining({
                unit_amount: undefined,
                unit_amount_net: undefined,
                unit_amount_decimal: undefined,
                unit_amount_gross: undefined,
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when input mapping is 10.999', () => {
        const priceItems = [
          {
            ...samples.priceItemWithFlatFeeTiers,
            price_mappings: [
              { frequency_unit: 'one_time', price_id: samples.priceItemWithFlatFeeTiers._price?._id, value: 10.999 },
            ] as PriceInputMappings,
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            amount_total: 6000,
            amount_subtotal: 5455,
            unit_amount_gross: 6000,
            total_details: expect.objectContaining({
              amount_tax: 545,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_total: 6000,
                amount_subtotal: 5455,
                unit_amount_gross: 6000,
              }),
              expect.not.objectContaining({
                unit_amount: undefined,
                unit_amount_net: undefined,
                unit_amount_decimal: undefined,
                unit_amount_gross: undefined,
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when input mapping is 15', () => {
        const priceItems = [
          {
            ...samples.priceItemWithFlatFeeTiers,
            price_mappings: [
              { frequency_unit: 'one_time', price_id: samples.priceItemWithFlatFeeTiers._price?._id, value: 15 },
            ] as PriceInputMappings,
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            amount_total: 6000,
            amount_subtotal: 5455,
            unit_amount_gross: 6000,
            total_details: expect.objectContaining({
              amount_tax: 545,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_total: 6000,
                amount_subtotal: 5455,
                unit_amount_gross: 6000,
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when input mapping is 100', () => {
        const priceItems = [
          {
            ...samples.priceItemWithFlatFeeTiers,
            price_mappings: [
              { frequency_unit: 'one_time', price_id: samples.priceItemWithFlatFeeTiers._price?._id, value: 100 },
            ] as PriceInputMappings,
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            amount_total: 6000,
            amount_subtotal: 5455,
            unit_amount_gross: 6000,
            total_details: expect.objectContaining({
              amount_tax: 545,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_total: 6000,
                amount_subtotal: 5455,
                unit_amount_gross: 6000,
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when price is negative and bottom tier is matched', () => {
        const priceItems = [
          {
            ...samples.priceItemWithNegativePriceFlatFeeTiers,
            price_mappings: [
              { frequency_unit: 'one_time', price_id: 'price#1-tiered-flat-fee', value: 3 },
            ] as PriceInputMappings,
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            unit_amount_gross: -10000,
            amount_subtotal: -9091,
            amount_total: -10000,
            total_details: expect.objectContaining({
              amount_tax: -909,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                unit_amount_gross: -10000,
                amount_subtotal: -9091,
                amount_total: -10000,
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when price is negative and upper tier is matched', () => {
        const priceItems = [
          {
            ...samples.priceItemWithNegativePriceFlatFeeTiers,
            price_mappings: [
              { frequency_unit: 'one_time', price_id: 'price#1-tiered-flat-fee', value: 100 },
            ] as PriceInputMappings,
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            unit_amount_gross: -6000,
            amount_subtotal: -5455,
            amount_total: -6000,
            total_details: expect.objectContaining({
              amount_tax: -545,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                unit_amount_gross: -6000,
                amount_subtotal: -5455,
                amount_total: -6000,
              }),
            ]),
          }),
        );
      });
    });
  });

  describe('when is_composite_price = true', () => {
    it('should return 0 when number input is 0', () => {
      const priceItems: CompositePriceItemDto[] = [samples.compositePriceWithNumberInputEqualsToZero];
      expect(computeAggregatedAndPriceTotals(priceItems)).toStrictEqual(
        expect.objectContaining({
          amount_subtotal: 0,
          amount_total: 0,
          total_details: expect.objectContaining({
            amount_tax: 0,
          }),
          items: expect.arrayContaining([
            expect.objectContaining({
              amount_subtotal: 0,
              amount_total: 0,
            }),
          ]),
        }),
      );
    });

    it('should return the right result when there is one composite price with display mode "On Request"', () => {
      const priceItems = [samples.compositePriceWithOnRequest];

      const result = computeAggregatedAndPriceTotals(priceItems);

      expect(result).toEqual(results.compositePriceWithDisplayOnRequest);
    });

    it('should return the right result when there is one composite price with display mode "On Request"', () => {
      const priceItems = [
        samples.priceItem1,
        samples.priceItem2,
        samples.priceItem3,
        samples.priceItem4,
        samples.priceItem5,
        samples.compositePrice,
        samples.compositePriceWithOnRequest,
      ];

      const result = computeAggregatedAndPriceTotals(priceItems);

      expect(result).toEqual(results.compositePriceWithDisplayOnRequestAndOthers);
    });

    it('should return the right result when there is one component with display mode "Show as starting price"', () => {
      const priceItems = [samples.priceComponentDisplayAsStartingPrice];

      const result = computeAggregatedAndPriceTotals(priceItems);

      expect(result).toEqual(
        expect.objectContaining({
          amount_subtotal: 1800,
          amount_total: 1800,
          unit_amount_gross: 1800,
          total_details: expect.objectContaining({
            breakdown: expect.objectContaining({
              recurrences: [
                {
                  amount_subtotal: 1800,
                  amount_tax: 0,
                  amount_total: 1800,
                  unit_amount_gross: 1800,
                  type: 'one_time',
                },
              ],
            }),
          }),
        }),
      );
    });

    it('should return the right result when there is one composite price with quantity 2', () => {
      const priceItems = [samples.compositePriceQuantity2];

      const result = computeAggregatedAndPriceTotals(priceItems);

      expect(result).toEqual(results.resultCompositePriceQuantity2);
    });

    it('should return the right result when there is one composite price with total_details already set', () => {
      const priceItems = [samples.compositePriceWithTotalDetails];

      const result = computeAggregatedAndPriceTotals(priceItems);

      expect(result).toEqual(results.resultCompositePriceWithTotalDetails);
    });

    it('should return the right result when there is one composite price with unit_amount=0', () => {
      const priceItems = [samples.compositePricesUnitAmountZero];

      const result = computeAggregatedAndPriceTotals(priceItems);

      expect(result).toEqual(results.compositePricesUnitAmountZeroResult);
    });

    describe('when price component has is_tax_inclusive = false', () => {
      it('should return the right result', () => {
        const priceItems = [samples.compositePriceWithTaxExclusiveComponent];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toEqual(
          expect.objectContaining({
            amount_subtotal: 1000000,
            amount_total: 1190000,
            unit_amount_gross: 1190,
          }),
        );
      });
    });

    describe('when computing custom items', () => {
      it('should compute prices correctly when computing a composite price item with a custom item inside', () => {
        const priceItems = [samples.compositePriceWithCustomItem];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect((result.items?.[0] as CompositePriceItemDto | undefined)?.item_components?.length).toEqual(4);
        expect(result).toEqual({
          amount_subtotal: 53031,
          amount_total: 61114,
          unit_amount_gross: 52114,
          total_details: expect.anything(),
          items: [
            {
              price_id: 'price#4',
              product_id: 'prod-id#1234',
              quantity: 1,
              description: 'Eletricity Pack 1',
              item_components: [
                {
                  description: 'custom item',
                  quantity: 10,
                  unit_amount: 1000,
                  unit_amount_currency: 'EUR',
                  unit_amount_decimal: '10.0',
                  unit_amount_gross: 1000,
                  type: 'one_time',
                  _price: {},
                  _product: {},
                  currency: 'EUR',
                  unit_amount_net: 1000,
                  amount_subtotal: 10000,
                  amount_total: 10000,
                  product_id: 'prod-id#1234',
                  price_id: undefined,
                  taxes: [
                    {
                      amount: 0,
                      rate: 'nontaxable',
                      rateValue: 0,
                    },
                  ],
                  pricing_model: 'per_unit',
                },
                expect.any(Object),
                expect.any(Object),
                expect.any(Object),
              ],
              _price: expect.any(Object),
              _product: expect.any(Object),
              currency: 'EUR',
              amount_subtotal: 53031,
              amount_total: 61114,
              unit_amount_gross: 52114,
              total_details: expect.anything(),
            },
          ],
        });
      });
    });

    describe('when component has quantity=0', () => {
      it('should return the right result', () => {
        const priceItems = [samples.compositePriceComponentQuantity0];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toEqual(
          expect.objectContaining({
            amount_subtotal: 0,
            amount_total: 0,
            unit_amount_gross: 1069,
          }),
        );
      });
    });

    describe('pricing_model = tiered_graduated', () => {
      it('should return the correct result when input mapping is 2', () => {
        const priceItems = [
          {
            ...samples.compositePriceItemWithTieredGraduatedComponent,
            price_mappings: [
              { frequency_unit: 'one_time', price_id: 'price#1-tiered-graduated', value: 2 },
            ] as PriceInputMappings,
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            amount_subtotal: 1818,
            amount_total: 2000,
            unit_amount_gross: 1000,
            total_details: expect.objectContaining({
              amount_tax: 182,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_subtotal: 1818,
                amount_total: 2000,
                unit_amount_gross: 1000,
              }),
              expect.not.objectContaining({
                unit_amount: undefined,
                unit_amount_net: undefined,
                unit_amount_decimal: undefined,
                unit_amount_gross: undefined,
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when input mapping is 10', () => {
        const priceItems = [
          {
            ...samples.compositePriceItemWithTieredGraduatedComponent,
            price_mappings: [
              { frequency_unit: 'one_time', price_id: 'price#1-tiered-graduated', value: 10 },
            ] as PriceInputMappings,
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            amount_subtotal: 9091,
            amount_total: 10000,
            unit_amount_gross: 1000,
            total_details: expect.objectContaining({
              amount_tax: 909,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_subtotal: 9091,
                amount_total: 10000,
                unit_amount_gross: 1000,
              }),
              expect.not.objectContaining({
                unit_amount: undefined,
                unit_amount_net: undefined,
                unit_amount_decimal: undefined,
                unit_amount_gross: undefined,
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when input mapping is 15', () => {
        const priceItems = [
          {
            ...samples.compositePriceItemWithTieredGraduatedComponent,
            price_mappings: [
              { frequency_unit: 'one_time', price_id: 'price#1-tiered-graduated', value: 15 },
            ] as PriceInputMappings,
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            amount_subtotal: 12727,
            amount_total: 14000,
            unit_amount_gross: 1800,
            total_details: expect.objectContaining({
              amount_tax: 1273,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_subtotal: 12727,
                amount_total: 14000,
                unit_amount_gross: 1800,
              }),
              expect.not.objectContaining({
                unit_amount: undefined,
                unit_amount_net: undefined,
                unit_amount_decimal: undefined,
                unit_amount_gross: undefined,
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when input mapping is 100', () => {
        const priceItems = [
          {
            ...samples.compositePriceItemWithTieredGraduatedComponent,
            price_mappings: [
              { frequency_unit: 'one_time', price_id: 'price#1-tiered-graduated', value: 100 },
            ] as PriceInputMappings,
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            amount_total: 66000,
            amount_subtotal: 60000,
            unit_amount_gross: 2400,
            total_details: expect.objectContaining({
              amount_tax: 6000,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_total: 66000,
                amount_subtotal: 60000,
                unit_amount_gross: 2400,
              }),
              expect.not.objectContaining({
                unit_amount: undefined,
                unit_amount_net: undefined,
                unit_amount_decimal: undefined,
                unit_amount_gross: undefined,
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when price is negative and bottom tier is matched', () => {
        const priceItems = [
          {
            ...samples.compositePriceItemWithNegativePriceTieredGraduatedComponent,
            price_mappings: [
              { frequency_unit: 'one_time', price_id: 'price#1-tiered-graduated', value: 2 },
            ] as PriceInputMappings,
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            unit_amount_gross: -1000,
            amount_subtotal: -1818,
            amount_total: -2000,
            total_details: expect.objectContaining({
              amount_tax: -182,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                unit_amount_gross: -1000,
                amount_subtotal: -1818,
                amount_total: -2000,
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when price is negative and upper tier is matched', () => {
        const priceItems = [
          {
            ...samples.compositePriceItemWithNegativePriceTieredGraduatedComponent,
            price_mappings: [
              { frequency_unit: 'one_time', price_id: 'price#1-tiered-graduated', value: 100 },
            ] as PriceInputMappings,
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            amount_total: -66000,
            amount_subtotal: -60000,
            unit_amount_gross: -2400,
            total_details: expect.objectContaining({
              amount_tax: -6000,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_total: -66000,
                amount_subtotal: -60000,
                unit_amount_gross: -2400,
              }),
            ]),
          }),
        );
      });
    });

    describe('pricing_model = tiered_volume', () => {
      it('should return the correct result when input mapping is 2', () => {
        const priceItems = [
          {
            ...samples.compositePriceItemWithTieredVolumeComponent,
            price_mappings: [
              { frequency_unit: 'one_time', price_id: 'price#1-tiered-volume', value: 2 },
            ] as PriceInputMappings,
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            amount_subtotal: 1818,
            amount_total: 2000,
            unit_amount_gross: 1000,
            total_details: expect.objectContaining({
              amount_tax: 182,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_subtotal: 1818,
                amount_total: 2000,
                unit_amount_gross: 1000,
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when input mapping is 10', () => {
        const priceItems = [
          {
            ...samples.compositePriceItemWithTieredVolumeComponent,
            price_mappings: [
              { frequency_unit: 'one_time', price_id: 'price#1-tiered-volume', value: 10 },
            ] as PriceInputMappings,
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            amount_subtotal: 9091,
            amount_total: 10000,
            unit_amount_gross: 1000,
            total_details: expect.objectContaining({
              amount_tax: 909,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_subtotal: 9091,
                amount_total: 10000,
                unit_amount_gross: 1000,
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when input mapping is 15', () => {
        const priceItems = [
          {
            ...samples.compositePriceItemWithTieredVolumeComponent,
            price_mappings: [
              { frequency_unit: 'one_time', price_id: 'price#1-tiered-volume', value: 15 },
            ] as PriceInputMappings,
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            amount_subtotal: 10909,
            amount_total: 12000,
            unit_amount_gross: 800,
            total_details: expect.objectContaining({
              amount_tax: 1091,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_subtotal: 10909,
                amount_total: 12000,
                unit_amount_gross: 800,
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when input mapping is 100', () => {
        const priceItems = [
          {
            ...samples.compositePriceItemWithTieredVolumeComponent,
            price_mappings: [
              { frequency_unit: 'one_time', price_id: 'price#1-tiered-volume', value: 100 },
            ] as PriceInputMappings,
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            amount_total: 60000,
            amount_subtotal: 54545,
            unit_amount_gross: 600,
            total_details: expect.objectContaining({
              amount_tax: 5455,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_total: 60000,
                amount_subtotal: 54545,
                unit_amount_gross: 600,
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when price is negative and bottom tier is matched', () => {
        const priceItems = [
          {
            ...samples.compositePriceItemWithNegativePriceTieredVolumeComponent,
            price_mappings: [
              { frequency_unit: 'one_time', price_id: 'price#1-tiered-graduated', value: 3 },
            ] as PriceInputMappings,
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            unit_amount_gross: -1000,
            amount_subtotal: -909,
            amount_total: -1000,
            total_details: expect.objectContaining({
              amount_tax: -91,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                unit_amount_gross: -1000,
                amount_subtotal: -909,
                amount_total: -1000,
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when price is negative and upper tier is matched', () => {
        const priceItems = [
          {
            ...samples.compositePriceItemWithNegativePriceTieredVolumeComponent,
            price_mappings: [
              { frequency_unit: 'one_time', price_id: 'price#1-tiered-volume', value: 100 },
            ] as PriceInputMappings,
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            amount_total: -60000,
            amount_subtotal: -54545,
            unit_amount_gross: -600,
            total_details: expect.objectContaining({
              amount_tax: -5455,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_total: -60000,
                amount_subtotal: -54545,
                unit_amount_gross: -600,
              }),
            ]),
          }),
        );
      });
    });

    describe('pricing_model = tiered_flat_fee', () => {
      it('should return the correct result when input mapping is 2', () => {
        const priceItems = [
          {
            ...samples.compositePriceItemWithFlatFee,
            price_mappings: [
              { frequency_unit: 'one_time', price_id: 'price#1-tiered-flat-fee', value: 2 },
            ] as PriceInputMappings,
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            unit_amount_gross: 10000,
            amount_subtotal: 9091,
            amount_total: 10000,
            total_details: expect.objectContaining({
              amount_tax: 909,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                unit_amount_gross: 10000,
                amount_subtotal: 9091,
                amount_total: 10000,
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when input mapping is 10', () => {
        const priceItems = [
          {
            ...samples.compositePriceItemWithFlatFee,
            price_mappings: [
              { frequency_unit: 'one_time', price_id: 'price#1-tiered-flat-fee', value: 10 },
            ] as PriceInputMappings,
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            unit_amount_gross: 8000,
            amount_subtotal: 7273,
            amount_total: 8000,
            total_details: expect.objectContaining({
              amount_tax: 727,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                unit_amount_gross: 8000,
                amount_subtotal: 7273,
                amount_total: 8000,
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when input mapping is 15', () => {
        const priceItems = [
          {
            ...samples.compositePriceItemWithFlatFee,
            price_mappings: [
              { frequency_unit: 'one_time', price_id: 'price#1-tiered-flat-fee', value: 15 },
            ] as PriceInputMappings,
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            unit_amount_gross: 6000,
            amount_subtotal: 5455,
            amount_total: 6000,
            total_details: expect.objectContaining({
              amount_tax: 545,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                unit_amount_gross: 6000,
                amount_subtotal: 5455,
                amount_total: 6000,
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when input mapping is 100', () => {
        const priceItems = [
          {
            ...samples.compositePriceItemWithFlatFee,
            price_mappings: [
              { frequency_unit: 'one_time', price_id: 'price#1-tiered-flat-fee', value: 100 },
            ] as PriceInputMappings,
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            amount_total: 6000,
            amount_subtotal: 5455,
            unit_amount_gross: 6000,
            total_details: expect.objectContaining({
              amount_tax: 545,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_total: 6000,
                amount_subtotal: 5455,
                unit_amount_gross: 6000,
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when price is negative and bottom tier is matched', () => {
        const priceItems = [
          {
            ...samples.compositePriceItemWithNegativePriceFlatFee,
            price_mappings: [
              { frequency_unit: 'one_time', price_id: 'price#1-tiered-flat-fee', value: 3 },
            ] as PriceInputMappings,
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            unit_amount_gross: -10000,
            amount_subtotal: -9091,
            amount_total: -10000,
            total_details: expect.objectContaining({
              amount_tax: -909,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                unit_amount_gross: -10000,
                amount_subtotal: -9091,
                amount_total: -10000,
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when price is negative and upper tier is matched', () => {
        const priceItems = [
          {
            ...samples.compositePriceItemWithNegativePriceFlatFee,
            price_mappings: [
              { frequency_unit: 'one_time', price_id: 'price#1-tiered-flat-fee', value: 100 },
            ] as PriceInputMappings,
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            unit_amount_gross: -6000,
            amount_subtotal: -5455,
            amount_total: -6000,
            total_details: expect.objectContaining({
              amount_tax: -545,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                unit_amount_gross: -6000,
                amount_subtotal: -5455,
                amount_total: -6000,
              }),
            ]),
          }),
        );
      });
    });
  });

  describe('extractPricingEntitiesBySlug', () => {
    it('should return the pricing relations without duplicates', () => {
      const priceItems = [
        samples.priceItem1,
        samples.priceItem2,
        samples.priceItem3,
        samples.priceItem4,
        samples.priceItem5,
        samples.compositePrice,
      ];

      const result = extractPricingEntitiesBySlug(priceItems);

      expect(result).toStrictEqual({
        price: {
          $relation: [
            { _schema: 'price', _tags: [], entity_id: 'price#1' },
            { _schema: 'price', _tags: [], entity_id: 'price#2' },
            { _schema: 'price', _tags: [], entity_id: 'price#3' },
            { _schema: 'price', _tags: [], entity_id: 'price#4' },
          ],
        },
        product: {
          $relation: [
            { _schema: 'product', _tags: [], entity_id: 'prod-id#12324' },
            { _schema: 'product', _tags: [], entity_id: 'prod-id#1234' },
          ],
        },
        _tags: ['product-tag-1', 'product-tag-2', 'price-tag-1', 'price-tag-2', 'composite'],
      });
    });

    it('should return no relations with the pricing slugs when there is no data', () => {
      expect(extractPricingEntitiesBySlug([])).toStrictEqual({
        price: { $relation: [] },
        product: { $relation: [] },
        _tags: [],
      });
    });
  });

  describe('computeCompositePrice', () => {
    it.each([samples.nonComputedCompositePrice])('computes the composite price correctly #1', (compositePrice) => {
      const result = computeCompositePrice(
        compositePrice as CompositePriceItemDto,
        compositePrice._price as CompositePrice,
      );

      expect(result).toStrictEqual(results.computedCompositePrice);
    });
    it.each([samples.fullCompositePrice])('computes the composite price correctly #2', (compositePrice) => {
      const result = computeCompositePrice(
        compositePrice as CompositePriceItemDto,
        compositePrice._price as CompositePrice,
      );

      expect(result).toStrictEqual(results.computedCompositePrice);
    });
  });

  describe('handleCompositePrices', () => {
    it('should identify composite price correctly', () => {
      const result1 = isCompositePrice(samples.compositePrice._price as CompositePrice);
      const result2 = isCompositePrice(samples.priceItem._price as Price);
      const result3 = isCompositePrice(samples.priceItem1._price as Price);
      expect(result1).toBe(true);
      expect(result2).toBe(false);
      expect(result3).toBe(false);
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
  });

  describe('computePriceDetails', () => {
    it('computes the pricing details for a simple price', () => {
      const result = computePriceDetails(samples.priceItem1._price as Price);

      expect(result).toStrictEqual(results.resultsForSimplePrice);
    });

    it('computes the pricing details for a composite price', () => {
      const result = computePriceDetails(samples.compositePrice._price as Price);

      expect(result).toStrictEqual(results.resultsWithCompositePrices);
    });
  });
});
