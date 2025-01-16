import type { PriceItems } from '@epilot/pricing-client';

import * as coupons from './__tests__/fixtures/coupon.samples';
import * as samples from './__tests__/fixtures/price.samples';
import * as results from './__tests__/fixtures/pricing.results';
import {
  ENTITY_FIELDS_EXCLUSION_LIST,
  computeAggregatedAndPriceTotals,
  computeCompositePrice,
  computePriceItemDetails,
  extractPricingEntitiesBySlug,
  getRecurrencesWithEstimatedPrices,
  isCompositePriceItemDto,
  mapToPriceSnapshot,
  mapToProductSnapshot,
} from './pricing';
import type { CompositePrice, CompositePriceItemDto, Price, PriceItemDto } from './types';

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

      expect(result).toEqual(
        expect.objectContaining({
          amount_subtotal: 1000,
          amount_total: 1000,
          items: expect.arrayContaining([
            expect.objectContaining({
              amount_subtotal: 1000,
              amount_total: 1000,
              unit_amount_decimal: '10.00',
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
              unit_amount_decimal: '10.00',
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
              unit_amount_decimal: '20.00',
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
                  unit_amount_decimal: '10.0',
                  unit_amount_gross: 1000,
                  unit_amount_gross_decimal: '10',
                  type: 'one_time',
                  _price: {},
                  _product: {},
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
              fixed_value: 500_000,
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

    it('should compute discounts and totals correctly when there is a percentage discount coupon', () => {
      const result = computeAggregatedAndPriceTotals([samples.priceItemWithPercentageDiscount]);
      expect(result).toEqual(results.computedPriceWithPercentageDiscount);
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

    it('should disregard any coupons set on a composite price when computing discounts and totals', () => {
      const resultWithoutCoupons = computeAggregatedAndPriceTotals([samples.compositePrice]);
      const resultWithCoupons = computeAggregatedAndPriceTotals([
        { ...samples.compositePrice, _coupons: [coupons.fixedCashbackCoupon] },
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
      const result = computeAggregatedAndPriceTotals([samples.recurringPriceItemWithFixedAmountCashbackCoupon]);
      expect(result).toEqual(results.computedRecurringPriceWithFixedAmountCashbackCoupon);
    });
  });
});

describe('computeCompositePrice', () => {
  it.each([samples.nonComputedCompositePrice])('computes the composite price correctly #1', (compositePrice) => {
    const result = computeCompositePrice(compositePrice as CompositePriceItemDto);

    expect(result).toStrictEqual(results.computedCompositePrice);
  });
  it.each([samples.fullCompositePrice])('computes the composite price correctly #2', (compositePrice) => {
    const result = computeCompositePrice(compositePrice as CompositePriceItemDto);

    expect(result).toStrictEqual(results.computedCompositePrice);
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

describe('handleCompositePrices', () => {
  it('should identify composite price correctly', () => {
    const result1 = isCompositePriceItemDto(samples.compositePrice._price as CompositePrice);
    const result2 = isCompositePriceItemDto(samples.priceItem._price as Price);
    const result3 = isCompositePriceItemDto(samples.priceItem1._price as Price);
    expect(result1).toBe(true);
    expect(result2).toBe(false);
    expect(result3).toBe(false);
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

describe('mapToPriceSnapshot', () => {
  it('should return an empty object if price is falsy', () => {
    const result = mapToPriceSnapshot(null as unknown as Price);

    expect(result).toStrictEqual({});
  });

  it('should exclude keys defined in the exclusion list', () => {
    const result = mapToPriceSnapshot(samples.compositePrice as Price);

    expect(result).not.toHaveProperty(Array.from(ENTITY_FIELDS_EXCLUSION_LIST));
  });

  it("should ignore price_components if it doesn't exist or is falsy", () => {
    const priceItem1 = {
      ...samples.compositePrice,
      price_components: undefined,
    };

    const result = mapToPriceSnapshot(priceItem1 as unknown as Price);

    expect(result).toStrictEqual(expect.objectContaining({ price_components: undefined }));
  });
});

describe('mapToProductSnapshot', () => {
  it('should return undefined if product is falsy', () => {
    const result = mapToProductSnapshot(null as unknown as PriceItemDto['_product']);

    expect(result).toStrictEqual(undefined);
  });

  it('should exclude keys defined in the exclusion list', () => {
    const result = mapToProductSnapshot(samples.compositePriceWithTaxChanges._product);

    expect(result).not.toHaveProperty(Array.from(ENTITY_FIELDS_EXCLUSION_LIST));
  });
});

describe('getRecurrencesWithEstimatedPrices', () => {
  const monthlyEstimateComponent = {
    type: 'recurring',
    billing_period: 'monthly',
    _price: {
      type: 'recurring',
      billing_period: 'monthly',
      price_display_in_journeys: 'estimated_price',
    },
  };

  const oneTimeEstimateComponent = {
    type: 'one_time',
    _price: {
      type: 'one_time',
      price_display_in_journeys: 'estimated_price',
    },
  };

  const monthlyComponent = {
    type: 'recurring',
    billing_period: 'monthly',
    _price: {
      type: 'recurring',
      billing_period: 'monthly',
      price_display_in_journeys: 'show_price',
    },
  };

  const oneTimeComponent = {
    type: 'one_time',
    _price: {
      type: 'one_time',
      price_display_in_journeys: 'show_price',
    },
  };

  test('should return recurrences with estimated prices (composite price, monthly estimated)', () => {
    // given
    const priceDetails = [
      {
        is_composite_price: true,
        item_components: [oneTimeComponent, monthlyComponent, monthlyEstimateComponent],
      },
      {
        is_composite_price: true,
        item_components: [oneTimeComponent, monthlyComponent],
      },
    ] as PriceItems;

    // when
    const result = getRecurrencesWithEstimatedPrices(priceDetails);

    // then
    expect(result).toEqual({ monthly: true, one_time: false });
  });

  test('should return recurrences with estimated prices (composite price, one time and monthly estimated)', () => {
    // given
    const priceDetails = [
      {
        is_composite_price: true,
        item_components: [oneTimeEstimateComponent, oneTimeComponent, monthlyComponent, monthlyEstimateComponent],
      },
      {
        is_composite_price: true,
        item_components: [oneTimeComponent, monthlyComponent],
      },
    ] as PriceItems;

    // when
    const result = getRecurrencesWithEstimatedPrices(priceDetails);

    // then
    expect(result).toEqual({ monthly: true, one_time: true });
  });

  test('should return recurrences with estimated prices (composite price, none estimated)', () => {
    // given
    const priceDetails = [
      {
        is_composite_price: true,
        item_components: [oneTimeComponent, monthlyComponent],
      },
      {
        is_composite_price: true,
        item_components: [oneTimeComponent, monthlyComponent],
      },
    ] as PriceItems;

    // when
    const result = getRecurrencesWithEstimatedPrices(priceDetails);

    // then
    expect(result).toEqual({ monthly: false, one_time: false });
  });

  test('should return recurrences with estimated prices (simple price, none estimated)', () => {
    // given
    const priceDetails: PriceItems = [oneTimeComponent, monthlyComponent];

    // when
    const result = getRecurrencesWithEstimatedPrices(priceDetails);

    // then
    expect(result).toEqual({ monthly: false, one_time: false });
  });

  test('should return recurrences with estimated prices (simple price, monthly estimated)', () => {
    // given
    const priceDetails = [oneTimeComponent, monthlyComponent, monthlyEstimateComponent] as PriceItems;

    // when
    const result = getRecurrencesWithEstimatedPrices(priceDetails);

    // then
    expect(result).toEqual({ monthly: true, one_time: false });
  });

  test('should return recurrences with estimated prices (simple price, one time and monthly estimated)', () => {
    // given
    const priceDetails = [
      oneTimeComponent,
      oneTimeEstimateComponent,
      monthlyComponent,
      monthlyEstimateComponent,
    ] as PriceItems;

    // when
    const result = getRecurrencesWithEstimatedPrices(priceDetails);

    // then
    expect(result).toEqual({ monthly: true, one_time: true });
  });

  test('should return recurrences with estimated prices (mixed prices, one time and monthly estimated)', () => {
    // given
    const priceDetails = [
      {
        is_composite_price: true,
        item_components: [oneTimeEstimateComponent, oneTimeComponent, monthlyComponent],
      },
      oneTimeComponent,
      monthlyComponent,
      monthlyEstimateComponent,
    ] as PriceItems;

    // when
    const result = getRecurrencesWithEstimatedPrices(priceDetails);

    // then
    expect(result).toEqual({ monthly: true, one_time: true });
  });
});
