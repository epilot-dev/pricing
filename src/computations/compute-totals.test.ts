import type { PriceItemDto, CompositePriceItemDto, PriceItemsDto, Price } from '@epilot/pricing-client';
import { describe, expect, it } from 'vitest';
import * as samples from '../__tests__/fixtures/price.samples';
import * as results from '../__tests__/fixtures/pricing.results';
import { taxRateless } from '../__tests__/fixtures/tax.samples';
import * as coupons from '../coupons/__tests__/coupon.fixtures';
import { fixedCashbackCoupon } from '../coupons/__tests__/coupon.fixtures';
import type { CompositePriceItem } from '../shared/types';
import { computeAggregatedAndPriceTotals } from './compute-totals';

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

    it('should return the right result when the price has rateless tax', () => {
      const priceItems = [samples.priceItemRateless];

      const result = computeAggregatedAndPriceTotals(priceItems);

      expect(result).toEqual(
        expect.objectContaining({
          amount_subtotal: 1000,
          amount_total: 1000,
          items: expect.arrayContaining([
            expect.objectContaining({
              amount_subtotal: 1000,
              amount_total: 1000,
              unit_amount_decimal: '10',
              unit_amount_gross: 1000,
              unit_amount_gross_decimal: '10',
              unit_amount_net: 1000,
              taxes: [
                {
                  tax: taxRateless,
                  amount: 0,
                },
              ],
            }),
          ]),
          total_details: expect.objectContaining({ amount_tax: 0 }),
        }),
      );
    });

    it('should return the right result when the price is nontaxable', () => {
      const priceItems = [samples.priceItemNonTaxable];

      const result = computeAggregatedAndPriceTotals(priceItems);

      expect(result).toEqual(
        expect.objectContaining({
          amount_subtotal: 1000,
          amount_total: 1000,
          items: expect.arrayContaining([
            expect.objectContaining({
              amount_subtotal: 1000,
              amount_total: 1000,
              unit_amount_decimal: '10',
              unit_amount_gross: 1000,
              unit_amount_gross_decimal: '10',
              unit_amount_net: 1000,
              taxes: [
                {
                  amount: 0,
                  rate: 'nontaxable',
                  rateValue: 0,
                },
              ],
            }),
          ]),
          total_details: expect.objectContaining({ amount_tax: 0 }),
        }),
      );
    });

    it('should return the right result when multiple prices are nontaxable', () => {
      const priceItems = [samples.priceItemNonTaxable, samples.priceItemNonTaxable2];

      const result = computeAggregatedAndPriceTotals(priceItems);

      expect(result).toEqual(
        expect.objectContaining({
          amount_subtotal: 3000,
          amount_total: 3000,
          items: expect.arrayContaining([
            expect.objectContaining({
              amount_subtotal: 1000,
              amount_total: 1000,
              unit_amount_decimal: '10',
              unit_amount_gross: 1000,
              unit_amount_net: 1000,
              taxes: [
                {
                  amount: 0,
                  rate: 'nontaxable',
                  rateValue: 0,
                },
              ],
            }),
            expect.objectContaining({
              amount_subtotal: 2000,
              amount_total: 2000,
              unit_amount_decimal: '20',
              unit_amount_gross: 2000,
              unit_amount_net: 2000,
              taxes: [
                {
                  amount: 0,
                  rate: 'nontaxable',
                  rateValue: 0,
                },
              ],
            }),
          ]),
          total_details: expect.objectContaining({ amount_tax: 0 }),
        }),
      );
    });

    it('should return the right result when one of the price in composite price is rateless', () => {
      const priceItems = [samples.compositePriceWithRateless];

      const result = computeAggregatedAndPriceTotals(priceItems);

      expect(result).toEqual(
        expect.objectContaining({
          amount_subtotal: 1017,
          amount_total: 1114,
          amount_tax: 97,
          currency: 'EUR',
          items: expect.arrayContaining([
            expect.objectContaining({
              amount_subtotal: 1017,
              amount_total: 1114,
              amount_tax: 97,
              item_components: expect.arrayContaining([
                expect.objectContaining({
                  unit_amount: 1069,
                  amount_subtotal: 972,
                  amount_total: 1069,
                  amount_tax: 97,
                  taxes: expect.arrayContaining([
                    expect.objectContaining({
                      tax: expect.objectContaining({
                        _id: '10',
                        rate: 10,
                        type: 'VAT',
                      }),
                      amount: 97,
                    }),
                  ]),
                }),
                expect.objectContaining({
                  unit_amount: 45,
                  amount_subtotal: 45,
                  amount_total: 45,
                  amount_tax: 0,
                  taxes: expect.arrayContaining([
                    expect.objectContaining({
                      tax: expect.objectContaining({
                        _id: '88',
                        rate: null,
                        type: 'Custom',
                      }),
                      amount: 0,
                    }),
                  ]),
                }),
              ]),
              total_details: expect.objectContaining({
                amount_tax: 97,
                breakdown: expect.objectContaining({
                  taxes: expect.arrayContaining([
                    expect.objectContaining({
                      tax: expect.objectContaining({
                        _id: '10',
                        rate: 10,
                        type: 'VAT',
                      }),
                      amount: 97,
                    }),
                    expect.objectContaining({
                      tax: expect.objectContaining({
                        _id: '88',
                        rate: null,
                        type: 'Custom',
                      }),
                      amount: 0,
                    }),
                  ]),
                  recurrences: expect.arrayContaining([
                    expect.objectContaining({
                      type: 'recurring',
                      billing_period: 'monthly',
                      amount_subtotal: 1017,
                      amount_total: 1114,
                      amount_tax: 97,
                    }),
                  ]),
                }),
              }),
            }),
          ]),
          total_details: expect.objectContaining({
            amount_tax: 97,
            breakdown: expect.objectContaining({
              taxes: expect.arrayContaining([
                expect.objectContaining({
                  tax: expect.objectContaining({
                    _id: '10',
                    rate: 10,
                    type: 'VAT',
                  }),
                  amount: 97,
                }),
                expect.objectContaining({
                  tax: expect.objectContaining({
                    _id: '88',
                    rate: null,
                    type: 'Custom',
                  }),
                  amount: 0,
                }),
              ]),
            }),
          }),
        }),
      );
    });

    it('should return the right result when quantity=0', () => {
      const priceItems = [{ ...samples.priceItem1, quantity: 0 }];

      const result = computeAggregatedAndPriceTotals(priceItems);

      expect(result).toEqual(expect.objectContaining({ amount_subtotal: 0, amount_total: 0 }));
    });

    it('should return the right result when there is one simple price with display mode "On Request"', () => {
      const priceItems = [samples.priceItemDisplayOnRequest];

      const result = computeAggregatedAndPriceTotals(priceItems);

      expect(result).toEqual(
        expect.objectContaining({
          amount_subtotal: 0,
          amount_total: 0,
          currency: 'EUR',
          total_details: expect.objectContaining({
            amount_shipping: 0,
            amount_tax: 0,
          }),
          items: expect.arrayContaining([
            expect.objectContaining({
              amount_subtotal: 4546,
              amount_total: 5000,
              unit_amount: 4546,
              unit_amount_net: 4546,
            }),
          ]),
        }),
      );
    });

    it('should return the right result when there is one simple price with display mode "Display as starting price"', () => {
      const priceItems = [samples.priceItemDisplayAsStartingPrice];

      const result = computeAggregatedAndPriceTotals(priceItems);

      expect(result).toEqual(
        expect.objectContaining({
          amount_subtotal: 4546,
          amount_total: 5000,
          total_details: expect.objectContaining({
            breakdown: expect.objectContaining({
              recurrences: [
                {
                  amount_subtotal: 4546,
                  amount_tax: 455,
                  amount_total: 5000,
                  unit_amount_gross: 5000,
                  unit_amount_net: 4546,
                  type: 'recurring',
                  billing_period: 'yearly',
                  amount_subtotal_decimal: '45.456224456678',
                  amount_total_decimal: '50.001846902346',
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
          total_details: expect.objectContaining({
            breakdown: expect.objectContaining({
              recurrences: [
                {
                  amount_subtotal: 1800,
                  amount_tax: 0,
                  amount_total: 1800,
                  amount_total_decimal: '18',
                  amount_subtotal_decimal: '18',
                  unit_amount_gross: 1800,
                  unit_amount_net: 1800,
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
          currency: 'EUR',
          amount_total: 61114,
          amount_tax: 8083,
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
                  unit_amount_decimal: '10',
                  unit_amount_gross: 1000,
                  unit_amount_gross_decimal: '10',
                  type: 'one_time',
                  _price: {},
                  currency: 'EUR',
                  unit_amount_net: 1000,
                  unit_amount_net_decimal: '10',
                  amount_subtotal: 10000,
                  amount_total: 10000,
                  amount_subtotal_decimal: '100',
                  amount_total_decimal: '100',
                  amount_tax: 0,
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
                  is_tax_inclusive: true,
                },
                expect.any(Object),
                expect.any(Object),
                expect.any(Object),
              ],
              _price: expect.any(Object),
              _product: expect.any(Object),
              currency: 'EUR',
              amount_subtotal: 53031,
              amount_subtotal_decimal: '530.31077734696',
              amount_total: 61114,
              amount_total_decimal: '611.14',
              amount_tax: 8083,
              total_details: expect.anything(),
            },
          ],
        });
      });
      it('should compute prices correctly when computing a composite price item with a custom item with coupons inside', () => {
        const compositePriceWithCustomItemCoupon = {
          ...samples.compositePriceWithCustomItem,
          item_components: [
            {
              ...(samples.compositePriceWithCustomItem.item_components?.[0] as PriceItemDto),
              _coupons: [fixedCashbackCoupon], // custom delete coupons from the custom item
              _price: {
                ...(samples.compositePriceWithCustomItem.item_components?.[0]!._price as Price),
                _coupons: [],
              },
            },
            {
              ...(samples.compositePriceWithCustomItem.item_components?.[1] as PriceItemDto),
            },
            {
              ...(samples.compositePriceWithCustomItem.item_components?.[2] as PriceItemDto),
            },
            {
              ...(samples.compositePriceWithCustomItem.item_components?.[3] as PriceItemDto),
            },
          ],
        };

        const result = computeAggregatedAndPriceTotals([compositePriceWithCustomItemCoupon]);

        expect((result.items?.[0] as CompositePriceItemDto | undefined)?.item_components?.length).toEqual(4);
        expect((result.items?.[0] as CompositePriceItemDto | undefined)?.item_components?.[0]?._coupons).toEqual([
          fixedCashbackCoupon,
        ]);
        expect(
          (result.items?.[0] as CompositePriceItemDto | undefined)?.item_components?.[0]?._price?._coupons,
        ).toEqual([]);
        expect(result.items?.[0]?.amount_total).toEqual(61114);
        expect(result.total_details?.breakdown?.cashbacks).toEqual([
          {
            amount_total: 10000,
            cashback_period: '12',
          },
        ]);
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

    describe('when there are mappings for not variable components', () => {
      it('should return the right result', () => {
        const priceItems = [samples.compositePriceWithMappingForNotVariableComponent];

        const result = computeAggregatedAndPriceTotals(priceItems);

        expect(result).toEqual(
          expect.objectContaining({
            amount_total: 1000,
            amount_subtotal: 840,
          }),
        );
      });
    });
  });

  describe('when coupons are applied', () => {
    it('should compute discounts and totals correctly when there is a fixed-amount discount coupon', () => {
      const result = computeAggregatedAndPriceTotals([samples.priceItemWithFixedDiscount]);
      expect(result).toEqual(results.computedPriceWithFixedDiscount);
    });

    it('should not output negative totals when fixed discount is higher than unit price', () => {
      const result = computeAggregatedAndPriceTotals([
        {
          ...samples.priceItemWithFixedDiscount,
          _coupons: [
            {
              ...samples.priceItemWithFixedDiscount._coupons?.[0]!,
              /* Discount is 50x higher */
              fixed_value: 500000,
              fixed_value_decimal: '5000.00',
            },
          ],
        },
      ]);
      const item = result.items?.[0];
      if (!item) {
        throw new Error('Expected at least one item resulting from computation');
      }
      expect(item.amount_total).toEqual(0);
      expect(item.before_discount_unit_amount).toEqual(item.unit_discount_amount);
    });

    it('should only apply the highest fixed amount discount coupon', () => {
      const result = computeAggregatedAndPriceTotals([samples.priceItemWithMultipleFixedDiscounts]);
      expect(result).toEqual(results.computedPriceWithMultipleFixedDiscounts);
    });

    it('should compute discounts and totals correctly when there is a percentage discount coupon', () => {
      const result = computeAggregatedAndPriceTotals([samples.priceItemWithPercentageDiscount]);
      expect(result).toEqual(results.computedPriceWithPercentageDiscount);
    });

    it('should only apply the highest percentage discount coupon', () => {
      const result = computeAggregatedAndPriceTotals([samples.priceItemWithMultiplePercentageDiscounts]);
      expect(result).toEqual(results.computedPriceWithMultiplePercentageDiscounts);
    });

    it('should ensure percentage discounts do not go below 0% and above 100%', () => {
      /* For discounts above 100% */
      const resultMaximum = computeAggregatedAndPriceTotals([
        {
          ...samples.priceItemWithPercentageDiscount,
          _coupons: [
            {
              ...samples.priceItemWithPercentageDiscount._coupons?.[0]!,
              percentage_value: '150',
            },
          ],
        },
      ]);
      expect(resultMaximum.items?.[0]?.discount_percentage).toEqual(100);
      /* For discounts below 0% */
      const resultMinimum = computeAggregatedAndPriceTotals([
        {
          ...samples.priceItemWithPercentageDiscount,
          _coupons: [
            {
              ...samples.priceItemWithPercentageDiscount._coupons?.[0]!,
              percentage_value: '-35',
            },
          ],
        },
      ]);
      expect(resultMinimum.items?.[0]?.discount_percentage).toEqual(0);
    });

    it('should compute discounts and totals correctly when there is a percentage discount coupon and quantity is higher than 1', () => {
      const result = computeAggregatedAndPriceTotals([samples.priceItemWithPercentageDiscountAndHighQuantity]);
      expect(result).toEqual(results.computedPriceWithPercentageDiscountAndHighQuantity);
    });

    it('should compute discounts and totals correctly when there is a fixed discount coupon and quantity is higher than 1', () => {
      const result = computeAggregatedAndPriceTotals([samples.priceItemWithFixedDiscountAndHighQuantity]);
      expect(result).toEqual(results.computedPriceWithFixedDiscountAndHighQuantity);
    });

    it('should compute discounts and totals correctly when there is a fixed discount coupon and price mappings', () => {
      const result = computeAggregatedAndPriceTotals([samples.priceItemWithFixedDiscountAndPriceMappings]);
      expect(result).toEqual(results.computedPriceWithFixedDiscountAndPriceMappings);
    });

    it('should compute discounts and totals correctly for prices without tax', () => {
      const result = computeAggregatedAndPriceTotals([samples.priceItemWithPercentageDiscountAndNoTax]);
      expect(result).toEqual(results.computedPriceWithFixedDiscountAndNoTax);
    });

    it('should compute discounts and totals correctly when there is a percentage discount coupon and exclusive tax', () => {
      const result = computeAggregatedAndPriceTotals([samples.priceItemWithPercentageDiscountAndExclusiveTax]);
      expect(result).toEqual(results.computedPriceWithPercentageDiscountAndExclusiveTax);
    });

    it('should compute discounts and totals correctly when there is a fixed discount coupon and exclusive tax', () => {
      const result = computeAggregatedAndPriceTotals([samples.priceItemWithFixedDiscountAndExclusiveTax]);
      expect(result).toEqual(results.computedPriceWithFixedDiscountAndExclusiveTax);
    });

    it('should compute discounts and totals correctly when there are multiple prices', () => {
      const result = computeAggregatedAndPriceTotals([
        samples.priceItemWithPercentageDiscount,
        samples.priceItemWithPercentageDiscount,
        samples.priceItem,
      ]);
      expect(result).toEqual(results.computedResultWithPricesWithAndWithoutCoupons);
    });

    it('should disregard any discounts coupons set on a composite price when computing discounts and totals', () => {
      const resultWithoutCoupons = computeAggregatedAndPriceTotals([samples.compositePrice]);
      const resultWithCoupons = computeAggregatedAndPriceTotals([
        { ...samples.compositePrice, _coupons: [coupons.highFixedDiscountCoupon] },
      ]);
      expect(resultWithCoupons.total_details).toEqual(resultWithoutCoupons.total_details);
    });

    it('should compute discounts and totals correctly when given composite prices with components containing coupons', () => {
      const result = computeAggregatedAndPriceTotals([samples.compositePriceWithComponentsWithCoupons]);
      expect(result).toEqual(results.computedCompositePriceWithComponentsWithDiscounts);
    });

    it('should compute cashback correctly when given composite prices with components containing cashback coupons', () => {
      const result = computeAggregatedAndPriceTotals([samples.compositePriceWithComponentsWithCashbackCoupons]);
      expect(result).toEqual(results.computedCompositePriceWithComponentsWithCashbacks);
    });

    it('should compute fixed amount cashbacks and totals correctly', () => {
      const result = computeAggregatedAndPriceTotals([samples.priceItemWithFixedAmountCashbackCoupon]);
      expect(result).toEqual(results.computedPriceWithFixedAmountCashbackCoupon);
    });

    it('should compute fixed amount cashbacks and totals correctly when there is a price mapping', () => {
      const result = computeAggregatedAndPriceTotals([samples.priceItemWithFixedAmountCashbackCouponAndPriceMappings]);
      expect(result).toEqual(results.computedPriceWithFixedAmountCashbackCouponAndPriceMappings);
    });

    it('should compute percentage amount cashbacks and totals correctly', () => {
      const result = computeAggregatedAndPriceTotals([samples.priceItemWithPercentageCashbackCoupon]);
      expect(result).toEqual(results.computedPriceWithPercentageCashbackCoupon);
    });

    it('should compute fixed amount cashbacks and totals correctly for recurring price', () => {
      const result = computeAggregatedAndPriceTotals([
        samples.recurringPriceItemWithFixedAmountCashbackCoupon as PriceItemDto,
      ]);
      expect(result).toEqual(results.computedRecurringPriceWithFixedAmountCashbackCoupon);
    });

    it('should deliver the same result when recomputing the pricing details with discount coupons', () => {
      const result = computeAggregatedAndPriceTotals([samples.priceItemWithPercentageDiscount]);
      const resultRecomputed = computeAggregatedAndPriceTotals(result.items as PriceItemsDto);
      expect(result).toStrictEqual(resultRecomputed);
    });

    it('should deliver the same result when recomputing the pricing details with cashback coupons', () => {
      const result = computeAggregatedAndPriceTotals([samples.priceItemWithPercentageCashbackCoupon]);
      const resultRecomputed = computeAggregatedAndPriceTotals(result.items as PriceItemsDto);
      expect(result).toStrictEqual(resultRecomputed);
    });

    it('should not apply coupon if it has requires_promo_code set to true', () => {
      const result = computeAggregatedAndPriceTotals([samples.priceItemWithPromoCodeRequiredCoupon]);
      expect(result).toEqual(results.computedPriceWithoutAppliedCoupon);
    });

    it('should not apply coupon if it has requires_promo_code set to true and redeemedPromos is empty', () => {
      const result = computeAggregatedAndPriceTotals([samples.priceItemWithPromoCodeRequiredCoupon], {
        redeemedPromos: [],
      });
      expect(result).toEqual(results.computedPriceWithoutAppliedCoupon);
    });

    it('should apply coupon if it has requires_promo_code set to true and redeemedPromos includes the coupon', () => {
      const result = computeAggregatedAndPriceTotals([samples.priceItemWithPromoCodeRequiredCoupon], {
        redeemedPromos: [
          {
            code: 'SUMMER25',
            coupons: [samples.priceItemWithPromoCodeRequiredCoupon._coupons?.[0]!],
          },
        ],
      });
      expect(result).toEqual(results.computedPriceWithAppliedCoupon);
    });

    it('should apply coupon on price component if it has requires_promo_code set to true and redeemedPromos includes the coupon', () => {
      const result = computeAggregatedAndPriceTotals(
        [samples.compositePriceWithComponentsWithPromoCodeRequiredCoupon],
        {
          redeemedPromos: [
            {
              code: 'SUMMER25',
              coupons: [
                (
                  samples.compositePriceWithComponentsWithPromoCodeRequiredCoupon._price!.price_components as Price[]
                )?.[0]!._coupons?.[0]!,
              ],
            },
          ],
        },
      );
      expect(result).toEqual(results.computedCompositePriceWithComponentsWithPromoCodeRequiredCoupon);
    });
    it('should compute the pricing total breakdown details with discounts correctly independently of the order of the items', () => {
      const result = computeAggregatedAndPriceTotals(samples.unorderedPriceItemsOneTimeRecurrencesWithDiscount, {
        redeemedPromos: [],
      });
      expect(result.total_details?.breakdown?.recurrences?.[0]?.amount_total_decimal).toEqual('109000');
      expect(result.total_details?.breakdown?.recurrences?.[0]?.amount_total).toEqual(10900000);
      expect(result.total_details?.breakdown?.recurrences?.[0]?.before_discount_amount_total_decimal).toEqual('111000');
      expect(result.total_details?.breakdown?.recurrences?.[0]?.before_discount_amount_total).toEqual(11100000);
      expect(result.total_details?.breakdown?.recurrences?.[0]?.discount_amount_decimal).toEqual('2000');
      expect(result.total_details?.breakdown?.recurrences?.[0]?.discount_amount).toEqual(200000);
    });
  });

  it('computes the pricing details for a simple price', () => {
    const result = computeAggregatedAndPriceTotals([samples.priceItem1]);

    expect(result).toStrictEqual(results.priceDetailsForOnePrice);
  });

  it('computes the pricing details for a composite price', () => {
    const result = computeAggregatedAndPriceTotals([samples.compositePrice]);

    expect(result).toStrictEqual(results.priceDetailsForCompositePrice);
  });

  it('computes the pricing details for a composite price that one component has changed its tax', () => {
    const result = computeAggregatedAndPriceTotals([samples.compositePriceWithTaxChanges]);

    expect(result).toStrictEqual(results.priceDetailsForCompositePriceWithTaxChanges);
  });

  it('should deliver the same result when recomputing the pricing details', () => {
    const result = computeAggregatedAndPriceTotals([samples.compositePrice]);
    const resultRecomputed = computeAggregatedAndPriceTotals([result.items?.[0] as CompositePriceItemDto]);
    expect(result).toStrictEqual(resultRecomputed);
  });
});

it('should compute fixed cashbacks correctly when applied at the composite price level', () => {
  const result = computeAggregatedAndPriceTotals([samples.compositePriceWithFixedCashbackCoupon]);
  const computedPriceItem = result.items?.[0] as CompositePriceItem;
  expect(computedPriceItem?._coupons).toEqual([
    {
      ...samples.compositePriceWithFixedCashbackCoupon._coupons?.[0]!,
      cashback_amount: 1000,
      cashback_amount_decimal: '10',
      cashback_period: '12',
    },
  ]);
  expect(computedPriceItem?.total_details?.breakdown?.cashbacks?.length).toEqual(1);
  expect(computedPriceItem?.total_details?.breakdown?.cashbacks?.[0].cashback_period).toEqual('12');
  expect(computedPriceItem?.total_details?.breakdown?.cashbacks?.[0].amount_total).toEqual(1000);
  expect(
    computedPriceItem?.item_components?.every(
      (item) =>
        !item._coupons?.length &&
        !item.cashback_amount &&
        !item.cashback_amount_decimal &&
        !item.after_cashback_amount_total &&
        !item.after_cashback_amount_total_decimal,
    ),
  ).toBe(true);
});

it('should compute multiple fixed cashbacks correctly when applied at the composite price level with different cashback periods', () => {
  const priceItems = [
    {
      ...samples.compositePriceWithFixedCashbackCoupon,
      _coupons: [coupons.fixedCashbackCoupon, coupons.lowFixedCashbackCoupon],
    },
  ];
  const result = computeAggregatedAndPriceTotals(priceItems);
  const computedPriceItem = result.items?.[0] as CompositePriceItem;
  expect(computedPriceItem?._coupons).toEqual([
    {
      ...priceItems[0]!._coupons?.[0]!,
      cashback_amount: 1000,
      cashback_amount_decimal: '10',
      cashback_period: '12',
    },
    {
      ...priceItems[0]!._coupons?.[1]!,
      cashback_amount: 500,
      cashback_amount_decimal: '5',
      cashback_period: '0',
    },
  ]);
  expect(computedPriceItem?.total_details?.breakdown?.cashbacks?.length).toEqual(2);
  expect(computedPriceItem?.total_details?.breakdown?.cashbacks?.[0].cashback_period).toEqual('12');
  expect(computedPriceItem?.total_details?.breakdown?.cashbacks?.[0].amount_total).toEqual(1000);
  expect(computedPriceItem?.total_details?.breakdown?.cashbacks?.[1].cashback_period).toEqual('0');
  expect(computedPriceItem?.total_details?.breakdown?.cashbacks?.[1].amount_total).toEqual(500);
});

it('should compute multiple fixed cashbacks correctly when applied at the composite price level with same cashback periods', () => {
  const priceItems = [
    {
      ...samples.compositePriceWithFixedCashbackCoupon,
      _coupons: [coupons.fixedCashbackCoupon, coupons.fixedCashbackCoupon],
    },
  ];
  const result = computeAggregatedAndPriceTotals(priceItems);
  const computedPriceItem = result.items?.[0] as CompositePriceItem;
  expect(computedPriceItem?._coupons).toEqual([
    {
      ...priceItems[0]!._coupons?.[0]!,
      cashback_amount: 1000,
      cashback_amount_decimal: '10',
      cashback_period: '12',
    },
    {
      ...priceItems[0]!._coupons?.[1]!,
      cashback_amount: 1000,
      cashback_amount_decimal: '10',
      cashback_period: '12',
    },
  ]);
  expect(computedPriceItem?.total_details?.breakdown?.cashbacks?.length).toEqual(1);
  expect(computedPriceItem?.total_details?.breakdown?.cashbacks?.[0].cashback_period).toEqual('12');
  expect(computedPriceItem?.total_details?.breakdown?.cashbacks?.[0].amount_total).toEqual(2000);
});

it('should compute fixed cashbacks correctly when applied at the composite price level + component level with the same cashback period', () => {
  const result = computeAggregatedAndPriceTotals([samples.compositePriceCashbackCombinedWithComponentCashbacks]);
  const computedPriceItem = result.items?.[0] as CompositePriceItem;
  expect(computedPriceItem?._coupons).toEqual([
    {
      ...samples.compositePriceCashbackCombinedWithComponentCashbacks._coupons?.[0]!,
      cashback_amount: 1000,
      cashback_amount_decimal: '10',
      cashback_period: '12',
    },
  ]);
  expect(computedPriceItem?.item_components?.[1].cashback_amount).toEqual(1000);
  expect(computedPriceItem?.item_components?.[1].cashback_amount_decimal).toEqual('10');
  expect(computedPriceItem?.item_components?.[1].after_cashback_amount_total).toEqual(9981);
  expect(computedPriceItem?.item_components?.[1].after_cashback_amount_total_decimal).toEqual('99.807692307692');
  expect(computedPriceItem?.total_details?.breakdown?.cashbacks?.length).toEqual(1);
  expect(computedPriceItem?.total_details?.breakdown?.cashbacks?.[0].cashback_period).toEqual('12');
  expect(computedPriceItem?.total_details?.breakdown?.cashbacks?.[0].amount_total).toEqual(2000);
});

it('should compute fixed cashbacks correctly when applied at the composite price level + component level with different cashback periods', () => {
  const priceItems = [
    {
      ...samples.compositePriceCashbackCombinedWithComponentCashbacks,
      _coupons: [coupons.lowFixedCashbackCoupon],
    },
  ];
  const result = computeAggregatedAndPriceTotals(priceItems);
  const computedPriceItem = result.items?.[0] as CompositePriceItem;
  expect(computedPriceItem?._coupons).toEqual([
    {
      ...priceItems[0]!._coupons?.[0]!,
      cashback_amount: 500,
      cashback_amount_decimal: '5',
      cashback_period: '0',
    },
  ]);
  expect(computedPriceItem?.item_components?.[1].cashback_amount).toEqual(1000);
  expect(computedPriceItem?.item_components?.[1].cashback_amount_decimal).toEqual('10');
  expect(computedPriceItem?.item_components?.[1].after_cashback_amount_total).toEqual(9981);
  expect(computedPriceItem?.item_components?.[1].after_cashback_amount_total_decimal).toEqual('99.807692307692');
  expect(computedPriceItem?.total_details?.breakdown?.cashbacks?.length).toEqual(2);
  expect(computedPriceItem?.total_details?.breakdown?.cashbacks?.[0].cashback_period).toEqual('12');
  expect(computedPriceItem?.total_details?.breakdown?.cashbacks?.[0].amount_total).toEqual(1000);
  expect(computedPriceItem?.total_details?.breakdown?.cashbacks?.[1].cashback_period).toEqual('0');
  expect(computedPriceItem?.total_details?.breakdown?.cashbacks?.[1].amount_total).toEqual(500);
});

it('should not apply cashbacks in composite price if it has requires_promo_code set to true and redeemedPromos is empty', () => {
  const priceItems = [
    {
      ...samples.compositePriceWithFixedCashbackCoupon,
      _coupons: [
        {
          ...fixedCashbackCoupon,
          requires_promo_code: true,
        },
      ],
    },
  ];

  const result = computeAggregatedAndPriceTotals(priceItems, {
    redeemedPromos: [],
  });

  const computedPriceItem = result.items?.[0] as CompositePriceItem;

  expect(computedPriceItem).toBeDefined();
  expect(computedPriceItem?._coupons).toEqual([]);
});

it('should apply cashbacks in composite price if it has requires_promo_code set to true and redeemedPromos includes the coupon', () => {
  const priceItems = [
    {
      ...samples.compositePriceWithFixedCashbackCoupon,
      _coupons: [
        {
          ...fixedCashbackCoupon,
          requires_promo_code: true,
        },
      ],
    },
  ];
  const result = computeAggregatedAndPriceTotals(priceItems, {
    redeemedPromos: [
      {
        code: 'SUMMER25',
        coupons: [priceItems[0]!._coupons?.[0]!],
      },
    ],
  });
  const computedPriceItem = result.items?.[0] as CompositePriceItem;
  expect(computedPriceItem?._coupons).toEqual([
    {
      ...priceItems[0]!._coupons?.[0]!,
      cashback_amount: 1000,
      cashback_amount_decimal: '10',
      cashback_period: '12',
    },
  ]);
});
