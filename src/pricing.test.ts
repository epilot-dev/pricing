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
import { CompositePrice, CompositePriceItemDto, Price, PriceItemDto, PriceTier, TimeFrequency } from './types';

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

      expect(result).toEqual(expect.objectContaining({ amount_subtotal: 0, amount_total: 0 }));
    });

    it('should return the right result when there is one simple price with display mode "On Request"', () => {
      const priceItems = [samples.priceItemDisplayOnRequest];

      const result = computeAggregatedAndPriceTotals(priceItems);

      expect(result).toEqual(results.priceWithDisplayOnRequest);
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
            total_details: expect.objectContaining({
              amount_tax: 0,
            }),
            items: expect.arrayContaining([
              expect.objectContaining({
                amount_subtotal: 0,
                amount_total: 0,
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

      it('should return the correct result when quantity is 0', () => {
        const priceItems = [{ ...samples.priceItemWithGraduatedTiersNoFlatFee, quantity: 0 }];

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

      it('should return the correct result when quantity is 2', () => {
        const priceItems = [{ ...samples.priceItemWithGraduatedTiersNoFlatFee, quantity: 2 }];

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

      it('should return the correct result when quantity is 10', () => {
        const priceItems = [{ ...samples.priceItemWithGraduatedTiersNoFlatFee, quantity: 10 }];

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

      it('should return the correct result when quantity is 10.999', () => {
        const priceItems = [{ ...samples.priceItemWithGraduatedTiersNoFlatFee, quantity: 10.999 }];

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

      it('should return the correct result when quantity is 15', () => {
        const priceItems = [{ ...samples.priceItemWithGraduatedTiersNoFlatFee, quantity: 15 }];

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

      it('should return the correct result when quantity is 100', () => {
        const priceItems = [{ ...samples.priceItemWithGraduatedTiersNoFlatFee, quantity: 100 }];

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
    });

    describe('pricing_model = volume_graduated', () => {
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

      it('should return the correct result when quantity is 0', () => {
        const priceItems = [{ ...samples.priceItemWithVolumeTiersNoFlatFee, quantity: 0 }];

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

      it('should return the correct result when quantity is 2', () => {
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

      it('should return the correct result when quantity is 10', () => {
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

      it('should return the correct result when quantity is 10.999', () => {
        const priceItems = [{ ...samples.priceItemWithVolumeTiersNoFlatFee, quantity: 10.999 }];

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

      it('should return the correct result when quantity is 15', () => {
        const priceItems = [{ ...samples.priceItemWithVolumeTiersNoFlatFee, quantity: 15 }];

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
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when quantity is 100', () => {
        const priceItems = [{ ...samples.priceItemWithVolumeTiersNoFlatFee, quantity: 100 }];

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

      it('should return the correct result when quantity is 0', () => {
        const priceItems = [{ ...samples.priceItemWithFlatFeeTiers, quantity: 0 }];
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

      it('should return the correct result when quantity is 2', () => {
        const priceItems = [{ ...samples.priceItemWithFlatFeeTiers, quantity: 2 }];

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

      it('should return the correct result when quantity is 10', () => {
        const priceItems = [{ ...samples.priceItemWithFlatFeeTiers, quantity: 10 }];

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

      it('should return the correct result when quantity is 10.999', () => {
        const priceItems = [{ ...samples.priceItemWithFlatFeeTiers, quantity: 10.999 }];

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

      it('should return the correct result when quantity is 15', () => {
        const priceItems = [{ ...samples.priceItemWithFlatFeeTiers, quantity: 15 }];

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
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when quantity is 100', () => {
        const priceItems = [{ ...samples.priceItemWithFlatFeeTiers, quantity: 100 }];

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
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when quantity is 100', () => {
        const priceItems = [{ ...samples.compositePriceItemWithFlatFee, quantity: 100 }];

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
              }),
            ]),
          }),
        );
      });
    });
  });

  describe('when is_composite_price = true', () => {
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
          }),
        );
      });
    });

    describe('pricing_model = tiered_graduated', () => {
      it('should return the correct result when quantity is 2', () => {
        const priceItems = [{ ...samples.compositePriceItemWithTieredGraduatedComponent, quantity: 2 }];

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

      it('should return the correct result when quantity is 10', () => {
        const priceItems = [{ ...samples.compositePriceItemWithTieredGraduatedComponent, quantity: 10 }];

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

      it('should return the correct result when quantity is 15', () => {
        const priceItems = [{ ...samples.compositePriceItemWithTieredGraduatedComponent, quantity: 15 }];

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

      it('should return the correct result when quantity is 100', () => {
        const priceItems = [{ ...samples.compositePriceItemWithTieredGraduatedComponent, quantity: 100 }];

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
    });

    describe('pricing_model = volume_graduated', () => {
      it('should return the correct result when quantity is 2', () => {
        const priceItems = [{ ...samples.compositePriceItemWithTieredVolumeComponent, quantity: 2 }];

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
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when quantity is 10', () => {
        const priceItems = [{ ...samples.compositePriceItemWithTieredVolumeComponent, quantity: 10 }];

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
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when quantity is 15', () => {
        const priceItems = [{ ...samples.compositePriceItemWithTieredVolumeComponent, quantity: 15 }];

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
              }),
            ]),
          }),
        );
      });

      it('should return the correct result when quantity is 100', () => {
        const priceItems = [{ ...samples.compositePriceItemWithTieredVolumeComponent, quantity: 100 }];

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
