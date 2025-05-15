import * as samples from '../__tests__/fixtures/price.samples';
import { computeAggregatedAndPriceTotals } from './computeTotals';
import { TimeFrequency } from '../time-frequency/types';
import { Price, PriceInputMappings, PriceTier } from '../shared/types';

describe('computeAggregatedAndPriceTotals', () => {
  describe('when is_composite_price = false', () => {
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
            quantity: 1,
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            amount_total: 0,
            amount_subtotal: 0,
            total_details: expect.objectContaining({
              amount_tax: 0,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_total: 0,
                amount_subtotal: 0,
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
            amount_tax: 182,
            total_details: expect.objectContaining({
              amount_tax: 182,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_subtotal: 1818,
                amount_total: 2000,
                unit_amount_gross: 1000,
                tiers_details: expect.arrayContaining([
                  expect.objectContaining({
                    quantity: 2,
                    unit_amount_gross: 1000,
                    unit_amount_net: 909,
                    unit_amount_decimal: '10.00',
                    unit_amount: 1000,
                    amount_subtotal: 1818,
                    amount_total: 2000,
                    amount_tax: 182,
                  }),
                ]),
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

      it('should return the correct result when input mapping is 2 and quantity is 2', () => {
        const priceItems = [
          {
            ...samples.priceItemWithGraduatedTiersNoFlatFee,
            quantity: 2,
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
            amount_subtotal: 3636,
            amount_total: 4000,
            amount_tax: 364,
            total_details: expect.objectContaining({
              amount_tax: 364,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_subtotal: 3636,
                amount_total: 4000,
                unit_amount_gross: 1000,
                tiers_details: expect.arrayContaining([
                  expect.objectContaining({
                    quantity: 2,
                    unit_amount_gross: 1000,
                    unit_amount_net: 909,
                    unit_amount_decimal: '10.00',
                    unit_amount: 1000,
                    amount_subtotal: 1818,
                    amount_total: 2000,
                    amount_tax: 182,
                  }),
                ]),
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
            total_details: expect.objectContaining({
              amount_tax: 909,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_subtotal: 9091,
                amount_total: 10000,
                unit_amount_gross: 1000,
                tiers_details: expect.arrayContaining([
                  expect.objectContaining({
                    quantity: 10,
                    unit_amount_gross: 1000,
                    unit_amount_net: 909,
                    unit_amount_decimal: '10.00',
                    unit_amount: 1000,
                    amount_total: 10000,
                    amount_subtotal: 9091,
                    amount_tax: 909,
                  }),
                ]),
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
            total_details: expect.objectContaining({
              amount_tax: 982,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_subtotal: 9817,
                amount_total: 10799,
                unit_amount_gross: 1800,
                tiers_details: expect.arrayContaining([
                  expect.objectContaining({
                    quantity: 10,
                    unit_amount_gross: 1000,
                    unit_amount_net: 909,
                    unit_amount_decimal: '10.00',
                    unit_amount: 1000,
                    amount_total: 10000,
                    amount_subtotal: 9091,
                    amount_tax: 909,
                  }),
                  expect.objectContaining({
                    quantity: 0.999,
                    unit_amount_gross: 800,
                    unit_amount_net: 727,
                    unit_amount_decimal: '8.00',
                    unit_amount: 800,
                    amount_total: 799,
                    amount_subtotal: 727,
                    amount_tax: 73,
                  }),
                ]),
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
            total_details: expect.objectContaining({
              amount_tax: 1273,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_subtotal: 12727,
                amount_total: 14000,
                tiers_details: expect.arrayContaining([
                  expect.objectContaining({
                    quantity: 10,
                    unit_amount_gross: 1000,
                    unit_amount_net: 909,
                    unit_amount_decimal: '10.00',
                    unit_amount: 1000,
                    amount_total: 10000,
                    amount_subtotal: 9091,
                    amount_tax: 909,
                  }),
                  expect.objectContaining({
                    quantity: 5,
                    unit_amount_gross: 800,
                    unit_amount_net: 727,
                    unit_amount_decimal: '8.00',
                    unit_amount: 800,
                    amount_total: 4000,
                    amount_subtotal: 3636,
                    amount_tax: 364,
                  }),
                ]),
              }),
              expect.not.objectContaining({
                unit_amount: undefined,
                unit_amount_net: undefined,
                unit_amount_decimal: undefined,
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
            total_details: expect.objectContaining({
              amount_tax: 6000,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_total: 66000,
                amount_subtotal: 60000,
                unit_amount_gross: 2400,
                tiers_details: expect.arrayContaining([
                  expect.objectContaining({
                    quantity: 10,
                    unit_amount_gross: 1000,
                    unit_amount_net: 909,
                    unit_amount_decimal: '10.00',
                    unit_amount: 1000,
                    amount_total: 10000,
                    amount_subtotal: 9091,
                    amount_tax: 909,
                  }),
                  expect.objectContaining({
                    quantity: 10,
                    unit_amount_gross: 800,
                    unit_amount_net: 727,
                    unit_amount_decimal: '8.00',
                    unit_amount: 800,
                    amount_total: 8000,
                    amount_subtotal: 7273,
                    amount_tax: 727,
                  }),
                  expect.objectContaining({
                    quantity: 80,
                    unit_amount_gross: 600,
                    unit_amount_net: 545,
                    unit_amount_decimal: '6.00',
                    unit_amount: 600,
                    amount_total: 48000,
                    amount_subtotal: 43636,
                    amount_tax: 4364,
                  }),
                ]),
              }),
              expect.not.objectContaining({
                unit_amount: undefined,
                unit_amount_net: undefined,
                unit_amount_decimal: undefined,
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
                tiers_details: expect.arrayContaining([
                  expect.objectContaining({
                    quantity: 2,
                    unit_amount_gross: -1000,
                    unit_amount_net: -909,
                    unit_amount_decimal: '-10.00',
                    unit_amount: -1000,
                    amount_total: -2000,
                    amount_subtotal: -1818,
                    amount_tax: -182,
                  }),
                ]),
              }),
              expect.not.objectContaining({
                unit_amount: undefined,
                unit_amount_net: undefined,
                unit_amount_decimal: undefined,
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
                tiers_details: expect.arrayContaining([
                  expect.objectContaining({
                    quantity: 10,
                    unit_amount_gross: -1000,
                    unit_amount_net: -909,
                    unit_amount_decimal: '-10.00',
                    unit_amount: -1000,
                    amount_total: -10000,
                    amount_subtotal: -9091,
                    amount_tax: -909,
                  }),
                  expect.objectContaining({
                    quantity: 10,
                    unit_amount_gross: -800,
                    unit_amount_net: -727,
                    unit_amount_decimal: '-8.00',
                    unit_amount: -800,
                    amount_total: -8000,
                    amount_subtotal: -7273,
                    amount_tax: -727,
                  }),
                ]),
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
            quantity: 1,
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            amount_total: 0,
            amount_subtotal: 0,
            total_details: expect.objectContaining({
              amount_tax: 0,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_total: 0,
                amount_subtotal: 0,
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

      it('should return the correct result when input mapping is 2', () => {
        const priceItems = [{ ...samples.priceItemWithVolumeTiersNoFlatFee, quantity: 2 }];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            amount_subtotal: 1818,
            amount_total: 2000,
            total_details: expect.objectContaining({
              amount_tax: 182,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_subtotal: 1818,
                amount_total: 2000,
                unit_amount_gross: 1000,
                tiers_details: expect.arrayContaining([
                  expect.objectContaining({
                    quantity: 2,
                    unit_amount_gross: 1000,
                    unit_amount_net: 909,
                    unit_amount_decimal: '10.00',
                    unit_amount: 1000,
                    amount_subtotal: 1818,
                    amount_total: 2000,
                    amount_tax: 182,
                  }),
                ]),
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
            total_details: expect.objectContaining({
              amount_tax: 909,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_subtotal: 9091,
                amount_total: 10000,
                unit_amount_gross: 1000,
                tiers_details: expect.arrayContaining([
                  expect.objectContaining({
                    quantity: 10,
                    unit_amount_gross: 1000,
                    unit_amount_net: 909,
                    unit_amount_decimal: '10.00',
                    unit_amount: 1000,
                    amount_total: 10000,
                    amount_subtotal: 9091,
                    amount_tax: 909,
                  }),
                ]),
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
            total_details: expect.objectContaining({
              amount_tax: 800,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_subtotal: 7999,
                amount_total: 8799,
                unit_amount_gross: 800,
                tiers_details: expect.arrayContaining([
                  expect.objectContaining({
                    quantity: 10.999,
                    unit_amount_gross: 800,
                    unit_amount_net: 727,
                    unit_amount: 800,
                    unit_amount_decimal: '8.00',
                    amount_subtotal: 7999,
                    amount_tax: 800,
                    amount_total: 8799,
                  }),
                ]),
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
            total_details: expect.objectContaining({
              amount_tax: 1091,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_subtotal: 10909,
                amount_total: 12000,
                unit_amount_gross: 800,
                tiers_details: expect.arrayContaining([
                  expect.objectContaining({
                    quantity: 15,
                    unit_amount_gross: 800,
                    unit_amount_net: 727,
                    unit_amount: 800,
                    unit_amount_decimal: '8.00',
                    amount_subtotal: 10909,
                    amount_tax: 1091,
                    amount_total: 12000,
                  }),
                ]),
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
            total_details: expect.objectContaining({
              amount_tax: 5455,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_total: 60000,
                amount_subtotal: 54545,
                unit_amount_gross: 600,
                tiers_details: expect.arrayContaining([
                  expect.objectContaining({
                    quantity: 100,
                    unit_amount_gross: 600,
                    unit_amount_net: 545,
                    unit_amount: 600,
                    unit_amount_decimal: '6.00',
                    amount_subtotal: 54545,
                    amount_tax: 5455,
                    amount_total: 60000,
                  }),
                ]),
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
            amount_subtotal: -2727,
            amount_total: -3000,
            total_details: expect.objectContaining({
              amount_tax: -273,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                pricing_model: 'tiered_volume',
                amount_subtotal: -2727,
                amount_total: -3000,
                tiers_details: expect.arrayContaining([
                  expect.objectContaining({
                    quantity: 3,
                    unit_amount_gross: -1000,
                    unit_amount_net: -909,
                    unit_amount_decimal: '-10.00',
                    unit_amount: -1000,
                    amount_subtotal: -2727,
                    amount_tax: -273,
                    amount_total: -3000,
                  }),
                ]),
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
                tiers_details: expect.arrayContaining([
                  expect.objectContaining({
                    quantity: 100,
                    unit_amount_gross: -600,
                    unit_amount_net: -545,
                    unit_amount_decimal: '-6.00',
                    unit_amount: -600,
                    amount_subtotal: -54545,
                    amount_tax: -5455,
                    amount_total: -60000,
                  }),
                ]),
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
            quantity: 1,
          },
        ];
        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            amount_total: 10000,
            amount_subtotal: 9091,
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
            total_details: expect.objectContaining({
              amount_tax: 909,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_total: 10000,
                amount_subtotal: 9091,
                unit_amount_gross: 10000,
                tiers_details: expect.arrayContaining([
                  expect.objectContaining({
                    quantity: 2,
                    unit_amount_gross: 10000,
                    unit_amount_net: 9091,
                    unit_amount_decimal: '100.00',
                    unit_amount: 10000,
                    amount_total: 10000,
                    amount_subtotal: 9091,
                    amount_tax: 909,
                  }),
                ]),
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
            total_details: expect.objectContaining({
              amount_tax: 727,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_total: 8000,
                amount_subtotal: 7273,
                unit_amount_gross: 8000,
                tiers_details: expect.arrayContaining([
                  expect.objectContaining({
                    quantity: 10,
                    unit_amount_gross: 8000,
                    unit_amount_net: 7273,
                    unit_amount_decimal: '80.00',
                    unit_amount: 8000,
                    amount_total: 8000,
                    amount_subtotal: 7273,
                    amount_tax: 727,
                  }),
                ]),
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
            total_details: expect.objectContaining({
              amount_tax: 1455,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_total: 16000,
                amount_subtotal: 14545,
                unit_amount_gross: 8000,
                tiers_details: expect.arrayContaining([
                  expect.objectContaining({
                    quantity: 10,
                    unit_amount_gross: 8000,
                    unit_amount_net: 7273,
                    unit_amount_decimal: '80.00',
                    unit_amount: 8000,
                    amount_total: 8000,
                    amount_subtotal: 7273,
                    amount_tax: 727,
                  }),
                ]),
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
            total_details: expect.objectContaining({
              amount_tax: 545,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_total: 6000,
                amount_subtotal: 5455,
                unit_amount_gross: 6000,
                tiers_details: expect.arrayContaining([
                  expect.objectContaining({
                    quantity: 10.999,
                    unit_amount_gross: 6000,
                    unit_amount_net: 5455,
                    unit_amount_decimal: '60.00',
                    unit_amount: 6000,
                    amount_total: 6000,
                    amount_subtotal: 5455,
                    amount_tax: 545,
                  }),
                ]),
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
            total_details: expect.objectContaining({
              amount_tax: 545,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_total: 6000,
                amount_subtotal: 5455,
                tiers_details: expect.arrayContaining([
                  expect.objectContaining({
                    quantity: 15,
                    unit_amount_gross: 6000,
                    unit_amount_net: 5455,
                    unit_amount_decimal: '60.00',
                    unit_amount: 6000,
                    amount_total: 6000,
                    amount_subtotal: 5455,
                    amount_tax: 545,
                  }),
                ]),
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
            total_details: expect.objectContaining({
              amount_tax: 545,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_total: 6000,
                amount_subtotal: 5455,
                unit_amount_gross: 6000,
                tiers_details: expect.arrayContaining([
                  expect.objectContaining({
                    quantity: 100,
                    unit_amount_gross: 6000,
                    unit_amount_net: 5455,
                    unit_amount_decimal: '60.00',
                    unit_amount: 6000,
                    amount_total: 6000,
                    amount_subtotal: 5455,
                    amount_tax: 545,
                  }),
                ]),
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
            amount_subtotal: -9091,
            amount_total: -10000,
            total_details: expect.objectContaining({
              amount_tax: -909,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_subtotal: -9091,
                amount_total: -10000,
                tiers_details: expect.arrayContaining([
                  expect.objectContaining({
                    quantity: 3,
                    unit_amount_gross: -10000,
                    unit_amount_net: -9091,
                    unit_amount_decimal: '-100.00',
                    unit_amount: -10000,
                    amount_total: -10000,
                    amount_subtotal: -9091,
                    amount_tax: -909,
                  }),
                ]),
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
            amount_subtotal: -5455,
            amount_total: -6000,
            total_details: expect.objectContaining({
              amount_tax: -545,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_subtotal: -5455,
                amount_total: -6000,
                tiers_details: expect.arrayContaining([
                  expect.objectContaining({
                    quantity: 100,
                    unit_amount_gross: -6000,
                    unit_amount_net: -5455,
                    unit_amount_decimal: '-60.00',
                    unit_amount: -6000,
                    amount_total: -6000,
                    amount_subtotal: -5455,
                    amount_tax: -545,
                  }),
                ]),
              }),
            ]),
          }),
        );
      });
    });
  });

  describe('when is_composite_price = true', () => {
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
            total_details: expect.objectContaining({
              amount_tax: 182,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_subtotal: 1818,
                amount_total: 2000,
                item_components: expect.arrayContaining([
                  expect.objectContaining({
                    unit_amount_gross: 1000,
                    unit_amount_net: 909,
                    tiers_details: expect.arrayContaining([
                      expect.objectContaining({
                        quantity: 2,
                        unit_amount_gross: 1000,
                        unit_amount_net: 909,
                        unit_amount_decimal: '10.00',
                        unit_amount: 1000,
                        amount_subtotal: 1818,
                        amount_total: 2000,
                        amount_tax: 182,
                      }),
                    ]),
                  }),
                ]),
              }),
              expect.not.objectContaining({
                unit_amount: undefined,
                unit_amount_net: undefined,
                unit_amount_decimal: undefined,
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
            total_details: expect.objectContaining({
              amount_tax: 909,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_subtotal: 9091,
                amount_total: 10000,
                item_components: expect.arrayContaining([
                  expect.objectContaining({
                    unit_amount_gross: 1000,
                    unit_amount_net: 909,
                    tiers_details: expect.arrayContaining([
                      expect.objectContaining({
                        quantity: 10,
                        unit_amount_gross: 1000,
                        unit_amount_net: 909,
                        unit_amount_decimal: '10.00',
                        unit_amount: 1000,
                        amount_total: 10000,
                        amount_subtotal: 9091,
                        amount_tax: 909,
                      }),
                    ]),
                  }),
                ]),
              }),
              expect.not.objectContaining({
                unit_amount: undefined,
                unit_amount_net: undefined,
                unit_amount_decimal: undefined,
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
            total_details: expect.objectContaining({
              amount_tax: 1273,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_subtotal: 12727,
                amount_total: 14000,
                item_components: expect.arrayContaining([
                  expect.objectContaining({
                    unit_amount_gross: 1800,
                    unit_amount_net: 1636,
                    tiers_details: expect.arrayContaining([
                      expect.objectContaining({
                        quantity: 10,
                        unit_amount_gross: 1000,
                        unit_amount_net: 909,
                        unit_amount_decimal: '10.00',
                        unit_amount: 1000,
                        amount_total: 10000,
                        amount_subtotal: 9091,
                        amount_tax: 909,
                      }),
                      expect.objectContaining({
                        quantity: 5,
                        unit_amount_gross: 800,
                        unit_amount_net: 727,
                        unit_amount_decimal: '8.00',
                        unit_amount: 800,
                        amount_total: 4000,
                        amount_subtotal: 3636,
                        amount_tax: 364,
                      }),
                    ]),
                  }),
                ]),
              }),
              expect.not.objectContaining({
                unit_amount: undefined,
                unit_amount_net: undefined,
                unit_amount_decimal: undefined,
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
            total_details: expect.objectContaining({
              amount_tax: 6000,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_total: 66000,
                amount_subtotal: 60000,
                item_components: expect.arrayContaining([
                  expect.objectContaining({
                    unit_amount_gross: 2400,
                    unit_amount_net: 2182,
                    tiers_details: expect.arrayContaining([
                      expect.objectContaining({
                        quantity: 10,
                        unit_amount_gross: 1000,
                        unit_amount_net: 909,
                        unit_amount_decimal: '10.00',
                        unit_amount: 1000,
                        amount_total: 10000,
                        amount_subtotal: 9091,
                        amount_tax: 909,
                      }),
                      expect.objectContaining({
                        quantity: 10,
                        unit_amount_gross: 800,
                        unit_amount_net: 727,
                        unit_amount_decimal: '8.00',
                        unit_amount: 800,
                        amount_total: 8000,
                        amount_subtotal: 7273,
                        amount_tax: 727,
                      }),
                      expect.objectContaining({
                        quantity: 80,
                        unit_amount_gross: 600,
                        unit_amount_net: 545,
                        unit_amount_decimal: '6.00',
                        unit_amount: 600,
                        amount_total: 48000,
                        amount_subtotal: 43636,
                        amount_tax: 4364,
                      }),
                    ]),
                  }),
                ]),
              }),
              expect.not.objectContaining({
                unit_amount: undefined,
                unit_amount_net: undefined,
                unit_amount_decimal: undefined,
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
            amount_subtotal: -1818,
            amount_total: -2000,
            total_details: expect.objectContaining({
              amount_tax: -182,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_subtotal: -1818,
                amount_total: -2000,
                item_components: expect.arrayContaining([
                  expect.objectContaining({
                    unit_amount_gross: -1000,
                    unit_amount_net: -909,
                    tiers_details: expect.arrayContaining([
                      expect.objectContaining({
                        quantity: 2,
                        unit_amount_gross: -1000,
                        unit_amount_net: -909,
                        unit_amount_decimal: '-10.00',
                        unit_amount: -1000,
                        amount_total: -2000,
                        amount_subtotal: -1818,
                        amount_tax: -182,
                      }),
                    ]),
                  }),
                ]),
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
            total_details: expect.objectContaining({
              amount_tax: -6000,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_total: -66000,
                amount_subtotal: -60000,
                item_components: expect.arrayContaining([
                  expect.objectContaining({
                    unit_amount_gross: -2400,
                    unit_amount_net: -2182,
                    tiers_details: expect.arrayContaining([
                      expect.objectContaining({
                        quantity: 10,
                        unit_amount_gross: -1000,
                        unit_amount_net: -909,
                        unit_amount_decimal: '-10.00',
                        unit_amount: -1000,
                        amount_total: -10000,
                        amount_subtotal: -9091,
                        amount_tax: -909,
                      }),
                      expect.objectContaining({
                        quantity: 10,
                        unit_amount_gross: -800,
                        unit_amount_net: -727,
                        unit_amount_decimal: '-8.00',
                        unit_amount: -800,
                        amount_total: -8000,
                        amount_subtotal: -7273,
                        amount_tax: -727,
                      }),
                    ]),
                  }),
                ]),
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
            total_details: expect.objectContaining({
              amount_tax: 182,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_subtotal: 1818,
                amount_total: 2000,
                item_components: expect.arrayContaining([
                  expect.objectContaining({
                    unit_amount_gross: 1000,
                    unit_amount_net: 909,
                    tiers_details: expect.arrayContaining([
                      expect.objectContaining({
                        quantity: 2,
                        unit_amount_gross: 1000,
                        unit_amount_net: 909,
                        unit_amount_decimal: '10.00',
                        unit_amount: 1000,
                        amount_total: 2000,
                        amount_subtotal: 1818,
                        amount_tax: 182,
                      }),
                    ]),
                  }),
                ]),
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
            total_details: expect.objectContaining({
              amount_tax: 909,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_subtotal: 9091,
                amount_total: 10000,
                item_components: expect.arrayContaining([
                  expect.objectContaining({
                    unit_amount_gross: 1000,
                    unit_amount_net: 909,
                    tiers_details: expect.arrayContaining([
                      expect.objectContaining({
                        quantity: 10,
                        unit_amount_gross: 1000,
                        unit_amount_net: 909,
                        unit_amount_decimal: '10.00',
                        unit_amount: 1000,
                        amount_total: 10000,
                        amount_subtotal: 9091,
                        amount_tax: 909,
                      }),
                    ]),
                  }),
                ]),
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
            total_details: expect.objectContaining({
              amount_tax: 1091,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_subtotal: 10909,
                amount_total: 12000,
                item_components: expect.arrayContaining([
                  expect.objectContaining({
                    unit_amount_gross: 800,
                    unit_amount_net: 727,
                    tiers_details: expect.arrayContaining([
                      expect.objectContaining({
                        quantity: 15,
                        unit_amount_gross: 800,
                        unit_amount_net: 727,
                        unit_amount_decimal: '8.00',
                        unit_amount: 800,
                        amount_total: 12000,
                        amount_subtotal: 10909,
                        amount_tax: 1091,
                      }),
                    ]),
                  }),
                ]),
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
            total_details: expect.objectContaining({
              amount_tax: 5455,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_total: 60000,
                amount_subtotal: 54545,
                item_components: expect.arrayContaining([
                  expect.objectContaining({
                    unit_amount_gross: 600,
                    unit_amount_net: 545,
                    tiers_details: expect.arrayContaining([
                      expect.objectContaining({
                        quantity: 100,
                        unit_amount_gross: 600,
                        unit_amount_net: 545,
                        unit_amount_decimal: '6.00',
                        unit_amount: 600,
                        amount_total: 60000,
                        amount_subtotal: 54545,
                        amount_tax: 5455,
                      }),
                    ]),
                  }),
                ]),
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
              { frequency_unit: 'one_time', price_id: 'price#1-tiered-volume', value: 3 },
            ] as PriceInputMappings,
          },
        ];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toStrictEqual(
          expect.objectContaining({
            amount_subtotal: -2727,
            amount_total: -3000,
            total_details: expect.objectContaining({
              amount_tax: -273,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_subtotal: -2727,
                amount_total: -3000,
                item_components: expect.arrayContaining([
                  expect.objectContaining({
                    unit_amount_gross: -1000,
                    unit_amount_net: -909,
                    tiers_details: expect.arrayContaining([
                      expect.objectContaining({
                        quantity: 3,
                        unit_amount_gross: -1000,
                        unit_amount_net: -909,
                        unit_amount_decimal: '-10.00',
                        unit_amount: -1000,
                        amount_total: -3000,
                        amount_subtotal: -2727,
                        amount_tax: -273,
                      }),
                    ]),
                  }),
                ]),
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
            total_details: expect.objectContaining({
              amount_tax: -5455,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_total: -60000,
                amount_subtotal: -54545,
                item_components: expect.arrayContaining([
                  expect.objectContaining({
                    unit_amount_gross: -600,
                    unit_amount_net: -545,
                    tiers_details: expect.arrayContaining([
                      expect.objectContaining({
                        quantity: 100,
                        unit_amount_gross: -600,
                        unit_amount_net: -545,
                        unit_amount_decimal: '-6.00',
                        unit_amount: -600,
                        amount_total: -60000,
                        amount_subtotal: -54545,
                        amount_tax: -5455,
                      }),
                    ]),
                  }),
                ]),
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
            amount_subtotal: 9091,
            amount_total: 10000,
            total_details: expect.objectContaining({
              amount_tax: 909,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_subtotal: 9091,
                amount_total: 10000,
                item_components: expect.arrayContaining([
                  expect.objectContaining({
                    unit_amount_gross: 10000,
                    unit_amount_net: 9091,
                    tiers_details: expect.arrayContaining([
                      expect.objectContaining({
                        quantity: 2,
                        unit_amount_gross: 10000,
                        unit_amount_net: 9091,
                        unit_amount_decimal: '100.00',
                        unit_amount: 10000,
                        amount_total: 10000,
                        amount_subtotal: 9091,
                        amount_tax: 909,
                      }),
                    ]),
                  }),
                ]),
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
            amount_subtotal: 7273,
            amount_total: 8000,
            total_details: expect.objectContaining({
              amount_tax: 727,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_subtotal: 7273,
                amount_total: 8000,
                item_components: expect.arrayContaining([
                  expect.objectContaining({
                    unit_amount_gross: 8000,
                    unit_amount_net: 7273,
                    tiers_details: expect.arrayContaining([
                      expect.objectContaining({
                        quantity: 10,
                        unit_amount_gross: 8000,
                        unit_amount_net: 7273,
                        unit_amount_decimal: '80.00',
                        unit_amount: 8000,
                        amount_total: 8000,
                        amount_subtotal: 7273,
                        amount_tax: 727,
                      }),
                    ]),
                  }),
                ]),
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
            amount_subtotal: 5455,
            amount_total: 6000,
            total_details: expect.objectContaining({
              amount_tax: 545,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_subtotal: 5455,
                amount_total: 6000,
                item_components: expect.arrayContaining([
                  expect.objectContaining({
                    unit_amount_gross: 6000,
                    unit_amount_net: 5455,
                    tiers_details: expect.arrayContaining([
                      expect.objectContaining({
                        quantity: 15,
                        unit_amount_gross: 6000,
                        unit_amount_net: 5455,
                        unit_amount_decimal: '60.00',
                        unit_amount: 6000,
                        amount_total: 6000,
                        amount_subtotal: 5455,
                        amount_tax: 545,
                      }),
                    ]),
                  }),
                ]),
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
            total_details: expect.objectContaining({
              amount_tax: 545,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_total: 6000,
                amount_subtotal: 5455,
                item_components: expect.arrayContaining([
                  expect.objectContaining({
                    unit_amount_gross: 6000,
                    unit_amount_net: 5455,
                    tiers_details: expect.arrayContaining([
                      expect.objectContaining({
                        quantity: 100,
                        unit_amount_gross: 6000,
                        unit_amount_net: 5455,
                        unit_amount_decimal: '60.00',
                        unit_amount: 6000,
                        amount_total: 6000,
                        amount_subtotal: 5455,
                        amount_tax: 545,
                      }),
                    ]),
                  }),
                ]),
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
            amount_subtotal: -9091,
            amount_total: -10000,
            total_details: expect.objectContaining({
              amount_tax: -909,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_subtotal: -9091,
                amount_total: -10000,
                item_components: expect.arrayContaining([
                  expect.objectContaining({
                    unit_amount_gross: -10000,
                    unit_amount_net: -9091,
                    tiers_details: expect.arrayContaining([
                      expect.objectContaining({
                        quantity: 3,
                        unit_amount_gross: -10000,
                        unit_amount_net: -9091,
                        unit_amount_decimal: '-100.00',
                        unit_amount: -10000,
                        amount_total: -10000,
                        amount_subtotal: -9091,
                        amount_tax: -909,
                      }),
                    ]),
                  }),
                ]),
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
            amount_subtotal: -5455,
            amount_total: -6000,
            total_details: expect.objectContaining({
              amount_tax: -545,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_subtotal: -5455,
                amount_total: -6000,
                item_components: expect.arrayContaining([
                  expect.objectContaining({
                    unit_amount_gross: -6000,
                    unit_amount_net: -5455,
                    tiers_details: expect.arrayContaining([
                      expect.objectContaining({
                        quantity: 100,
                        unit_amount_gross: -6000,
                        unit_amount_net: -5455,
                        unit_amount_decimal: '-60.00',
                        unit_amount: -6000,
                        amount_total: -6000,
                        amount_subtotal: -5455,
                        amount_tax: -545,
                      }),
                    ]),
                  }),
                ]),
              }),
            ]),
          }),
        );
      });
    });
  });
});
