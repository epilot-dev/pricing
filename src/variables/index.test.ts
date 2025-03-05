/* eslint-disable @typescript-eslint/no-explicit-any */
// import type { i18n } from 'i18next';

import {
  orderWithCompositeItem,
  orderWithCompositeItemResults,
  orderWithMultiplePrices,
  orderWithMultiplePricesResults,
  initialOrderEntityData,
  priceWithCorrectQuantity,
  orderEntityDataWithEmptyLineItems,
  invalidOrderEntityData,
} from './fixtures/orders';

import { processOrderTableData } from '.';

const mockI18n = {
  t: (key: string, fallback: string) => key || fallback,
  language: 'de',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('processOrderTableData', () => {
  it('returns correctly', async () => {
    const result = await processOrderTableData(orderWithCompositeItem, mockI18n);
    expect(result.products.length).toBe(12);
    expect(result.products[0]).toEqual(
      expect.objectContaining({
        quantity: 1,
        price: expect.objectContaining({
          quantity: '1',
          quantity_billing_period: undefined,
        }),
      }),
    );
    expect(result.products[1]).toEqual(
      expect.objectContaining({
        quantity: 1,
        price: expect.objectContaining({
          quantity: '1',
          quantity_billing_period: undefined,
        }),
      }),
    );
    expect(result.products[2]).toEqual(
      expect.objectContaining({
        quantity: 1,
        price: expect.objectContaining({
          quantity: '75 ',
          quantity_billing_period: 'table_order.recurrences.billing_period.yearly',
        }),
      }),
    );
    expect(result.products[3]).toEqual(
      expect.objectContaining({
        quantity: 1,
        price: expect.objectContaining({
          quantity: '75 ',
          quantity_billing_period: undefined,
        }),
      }),
    );
    expect(result.products[4]).toEqual(
      expect.objectContaining({
        quantity: 1,
        price: expect.objectContaining({
          quantity: '---',
          quantity_billing_period: undefined,
        }),
      }),
    );
    expect(result.products[5]).toEqual(
      expect.objectContaining({
        quantity: 1,
        price: expect.objectContaining({
          quantity: '1',
          quantity_billing_period: undefined,
        }),
      }),
    );
    expect(result.products[8]).toEqual(
      expect.objectContaining({
        price: expect.objectContaining({
          unit_amount: 'show_as_on_request',
        }),
      }),
    );
    expect(result.products[11]).toEqual(
      expect.objectContaining({
        price: expect.objectContaining({
          unit_amount: 'show_as_on_request',
        }),
      }),
    );
    expect(result.total_details.recurrences).toEqual(orderWithCompositeItemResults.total_details.recurrences);
  });

  it('returns correctly the tax details', async () => {
    const result = await processOrderTableData(orderWithMultiplePrices, mockI18n);
    expect(result.total_details.recurrences).toEqual(orderWithMultiplePricesResults.total_details.recurrences);
  });

  it('returns correct data avoiding reprocessing of flatten items', async () => {
    //when
    const dataWithFlattenLineItems1 = await processOrderTableData(initialOrderEntityData as any, mockI18n);

    //then
    expect(dataWithFlattenLineItems1.products.length).toBe(12);
    expect(dataWithFlattenLineItems1.products[1].price).toEqual(expect.objectContaining(priceWithCorrectQuantity));

    //when
    const dataWithFlattenLineItems2 = await processOrderTableData(dataWithFlattenLineItems1, mockI18n);

    //then
    expect(dataWithFlattenLineItems2.products.length).toBe(12);
    expect(dataWithFlattenLineItems2.products[1].price).toEqual(expect.objectContaining(priceWithCorrectQuantity));
  });

  it('return original data/skip processing if line items are empty', async () => {
    //given orderEntityDataWithEmptyLineItems

    //when
    const data = await processOrderTableData(orderEntityDataWithEmptyLineItems as any, mockI18n);

    //then
    expect(data).toEqual(orderEntityDataWithEmptyLineItems);
  });

  it('return original data/skip processing if line items are invalid', async () => {
    //when
    const data = await processOrderTableData(invalidOrderEntityData as any, mockI18n);

    //then
    expect(data).toEqual(invalidOrderEntityData);
  });
});

// describe('getQuantity', () => {
//   const baseVariableItem = {
//     price_id: 'price_id',
//     _price: {
//       variable_price: true,
//     },
//   };

//   const baseNotVariableItem = {
//     price_id: 'price_id',
//     _price: {
//       variable_price: false,
//     },
//   };

//   const baseMappings = [{ price_id: 'price_id', value: 75 }];
//   const zeroBaseMappings = [{ price_id: 'price_id', value: 0 }];
//   const wrongBaseMappings = [{ price_id: 'price_id_1', value: 75 }];

//   it.each`
//     baseItem               | parentItem             | quantity     | parentQuantity | mappings             | expected
//     ${baseNotVariableItem} | ${undefined}           | ${1}         | ${1}           | ${undefined}         | ${'1'}
//     ${baseNotVariableItem} | ${undefined}           | ${2}         | ${2}           | ${undefined}         | ${'2'}
//     ${baseNotVariableItem} | ${baseVariableItem}    | ${1}         | ${1}           | ${undefined}         | ${'1'}
//     ${baseNotVariableItem} | ${baseVariableItem}    | ${2}         | ${2}           | ${undefined}         | ${'2 x 2'}
//     ${baseVariableItem}    | ${undefined}           | ${1}         | ${1}           | ${undefined}         | ${'---'}
//     ${baseVariableItem}    | ${undefined}           | ${2}         | ${2}           | ${undefined}         | ${'2 x ---'}
//     ${baseVariableItem}    | ${undefined}           | ${1}         | ${1}           | ${baseMappings}      | ${'75 '}
//     ${baseVariableItem}    | ${undefined}           | ${2}         | ${2}           | ${baseMappings}      | ${'2 x 75 '}
//     ${baseVariableItem}    | ${baseVariableItem}    | ${1}         | ${1}           | ${undefined}         | ${'---'}
//     ${baseVariableItem}    | ${baseVariableItem}    | ${2}         | ${2}           | ${undefined}         | ${'2 x ---'}
//     ${baseVariableItem}    | ${baseVariableItem}    | ${1}         | ${1}           | ${baseMappings}      | ${'75 '}
//     ${baseVariableItem}    | ${baseVariableItem}    | ${2}         | ${2}           | ${baseMappings}      | ${'2 x 75 '}
//     ${baseVariableItem}    | ${baseVariableItem}    | ${2}         | ${2}           | ${wrongBaseMappings} | ${'2 x ---'}
//     ${baseVariableItem}    | ${baseVariableItem}    | ${2}         | ${2}           | ${zeroBaseMappings}  | ${'2 x 0 '}
//     ${baseVariableItem}    | ${baseVariableItem}    | ${undefined} | ${2}           | ${baseMappings}      | ${'2 x 75 '}
//     ${baseNotVariableItem} | ${baseNotVariableItem} | ${6}         | ${2}           | ${undefined}         | ${'2 x 6'}
//   `(
//     'returns $expected for the inputs',
//     async ({
//       baseItem,
//       parentItem,
//       quantity,
//       parentQuantity,
//       mappings,
//       expected,
//     }: {
//       baseItem: PriceItem;
//       parentItem: PriceItem | undefined;
//       quantity: number;
//       parentQuantity: number;
//       mappings: any;
//       expected: string;
//     }) => {
//       const mappedParentItem = parentItem && {
//         ...parentItem,
//         ...(parentQuantity && { quantity: parentQuantity }),
//         ...(mappings && { price_mappings: mappings }),
//       };

//       const item = {
//         ...baseItem,
//         ...(quantity && { quantity }),
//         ...(mappings && { price_mappings: mappings }),
//       };

//       const result = getQuantity(item, mappedParentItem);

//       expect(result).toBe(expected);
//     },
//   );
// });

// describe('unitAmountApproved', () => {
//   it('should return true when item._price.price_display_in_journeys is not "show_as_on_request"', async () => {
//     const item = {
//       _price: {
//         price_display_in_journeys: 'show_price',
//       },
//     };
//     expect(unitAmountApproved(item as PriceItemWithParent)).toBe(true);
//   });

//   it('should return true when item.is_composite_price is true and item_components has "show_price" price_display_in_journeys', async () => {
//     const item = {
//       is_composite_price: true,
//       item_components: [
//         {
//           _price: {
//             price_display_in_journeys: 'show_price',
//           },
//         },
//         {
//           _price: {
//             price_display_in_journeys: 'show_price',
//           },
//         },
//       ],
//     };
//     expect(unitAmountApproved(item as PriceItemWithParent)).toBe(true);
//   });

//   it('should return true when item.on_request_approved is true', async () => {
//     const item = {
//       on_request_approved: true,
//     };
//     expect(unitAmountApproved(item as PriceItemWithParent)).toBe(true);
//   });

//   it('should return true when item.parent_item.on_request_approved is true', async () => {
//     const item = {
//       parent_item: {
//         on_request_approved: true,
//       },
//     };
//     expect(unitAmountApproved(item as PriceItemWithParent)).toBe(true);
//   });

//   it('should return false when all conditions are false', async () => {
//     const item = {
//       _price: {
//         price_display_in_journeys: 'show_as_on_request',
//       },
//       is_composite_price: true,
//       item_components: [
//         {
//           _price: {
//             price_display_in_journeys: 'show_as_on_request',
//           },
//         },
//       ],
//       on_request_approved: false,
//       parent_item: {
//         on_request_approved: false,
//       },
//     };
//     expect(unitAmountApproved(item as PriceItemWithParent)).toBe(false);
//   });
// });

// describe('getHiddenAmountString', () => {
//   it('should return "---" for a composite price with no matching component', async () => {
//     const priceItem = {
//       _price: {
//         price_display_in_journeys: 'show_as_on_request',
//       },
//       item_components: [
//         {
//           _price: {
//             price_display_in_journeys: 'other_value',
//           },
//         },
//       ],
//     } as CompositePrice;

//     const result = getHiddenAmountString(mockI18n.t, getPriceDisplayInJourneys(priceItem));

//     expect(result).toBe('show_as_on_request');
//   });

//   it('should return the translation for a composite price', async () => {
//     const priceItem = {
//       _price: {
//         price_display_in_journeys: 'show_as_on_request',
//       },
//       item_components: [
//         {
//           _price: {
//             price_display_in_journeys: 'other_value',
//           },
//         },
//         {
//           _price: {
//             price_display_in_journeys: 'show_as_starting_price',
//           },
//         },
//       ],
//     } as CompositePrice;

//     const result = getHiddenAmountString(mockI18n.t, getPriceDisplayInJourneys(priceItem));

//     expect(result).toBe('show_as_on_request');
//   });

//   it('should return the translation for a non-composite price with a parentItem', async () => {
//     const priceItem = {
//       _price: {
//         price_display_in_journeys: 'other_value',
//       },
//       parent_item: {
//         _price: {
//           price_display_in_journeys: 'show_as_on_request',
//         },
//       },
//     };

//     const result = getHiddenAmountString(mockI18n.t, getPriceDisplayInJourneys(priceItem));

//     expect(result).toBe('show_as_on_request');
//   });

//   it('should return the translation for a non-composite price with NO parentItem', async () => {
//     const priceItem = {
//       _price: {
//         price_display_in_journeys: 'show_as_on_request',
//       },
//     };

//     const result = getHiddenAmountString(mockI18n.t, getPriceDisplayInJourneys(priceItem));
//     const resultWithAmount = getHiddenAmountString(mockI18n.t, getPriceDisplayInJourneys(priceItem), '€123.45');

//     expect(result).toBe('show_as_on_request');
//     expect(resultWithAmount).toBe('show_as_on_request');
//   });

//   it('should return the correct translations when price is starting at', async () => {
//     const priceItem = {
//       _price: {
//         price_display_in_journeys: 'show_as_starting_price',
//       },
//     };

//     const resultWithFormattedString = getHiddenAmountString(
//       mockI18n.t,
//       getPriceDisplayInJourneys(priceItem),
//       '€123.45',
//     );
//     const resultWithZeroNumber = getHiddenAmountString(mockI18n.t, getPriceDisplayInJourneys(priceItem), 0);
//     const resultWithNumber = getHiddenAmountString(mockI18n.t, getPriceDisplayInJourneys(priceItem), 123);
//     const resultWithUndefined = getHiddenAmountString(mockI18n.t, getPriceDisplayInJourneys(priceItem), undefined);

//     expect(resultWithFormattedString).toBe('show_as_starting_price €123.45');
//     expect(resultWithZeroNumber).toBe('show_as_starting_price 0');
//     expect(resultWithNumber).toBe('show_as_starting_price 123');
//     expect(resultWithUndefined).toBe('show_as_starting_price');
//   });
// });
