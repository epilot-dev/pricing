import { describe, it, expect } from 'vitest';
import { PricingModel } from '../../prices/constants';
import type { PriceItem, CompositePriceItem } from '../../shared/types';
import type { PriceItemWithParent } from '../types';
import {
  safeFormatAmount,
  computeRecurrenceAmounts,
  getRecurrenceInterval,
  fillPostSpaces,
  getSafeAmount,
  isCompositePrice,
  getQuantity,
  getDisplayUnit,
  unitAmountApproved,
  EMPTY_VALUE_PLACEHOLDER,
} from '../utils';

describe('variables/utils', () => {
  describe('safeFormatAmount', () => {
    it('should format amount as currency when amount is a number', () => {
      const result = safeFormatAmount({
        amount: 1000,
        currency: 'EUR',
        locale: 'en-US',
      });

      expect(result).toBe('€10.00');
    });

    it('should format amount as currency when amount is a decimal string', () => {
      const result = safeFormatAmount({
        amount: '10.50',
        currency: 'EUR',
        locale: 'en-US',
      });

      expect(result).toBe('€10.50');
    });

    it('should return 0 formatted when amount is falsy', () => {
      expect(
        safeFormatAmount({
          amount: 0,
          currency: 'EUR',
          locale: 'en-US',
        }),
      ).toBe('€0.00');

      expect(
        safeFormatAmount({
          amount: '',
          currency: 'EUR',
          locale: 'en-US',
        }),
      ).toBe('€0.00');
    });

    it('should handle non-formattable inputs', () => {
      // Test with an input that will cause formatting to fail
      // but is still a valid type for the function parameter
      const result = safeFormatAmount({
        amount: 'not-a-number',
        currency: 'EUR',
        locale: 'en-US',
      });

      // The function will return the original value when it can't format it
      expect(result).toBe('not-a-number');
    });
  });

  describe('computeRecurrenceAmounts', () => {
    it('should format all amounts in a recurrence', () => {
      const recurrence = {
        amount_total: 1000,
        amount_subtotal: 800,
        amount_tax: 200,
      };

      const result = computeRecurrenceAmounts(recurrence, {
        currency: 'EUR',
        locale: 'en-US',
      });

      expect(result).toEqual({
        amount_total: '€10.00',
        amount_total_decimal: '10',
        amount_subtotal: '€8.00',
        amount_subtotal_decimal: '8',
        amount_tax: '€2.00',
        amount_tax_decimal: '2',
      });
    });

    it('should handle zero amounts', () => {
      const recurrence = {
        amount_total: 0,
        amount_subtotal: 0,
        amount_tax: 0,
      };

      const result = computeRecurrenceAmounts(recurrence, {
        currency: 'EUR',
        locale: 'en-US',
      });

      expect(result).toEqual({
        amount_total: '€0.00',
        amount_total_decimal: '0',
        amount_subtotal: '€0.00',
        amount_subtotal_decimal: '0',
        amount_tax: '€0.00',
        amount_tax_decimal: '0',
      });
    });

    it('should handle undefined tax amount', () => {
      const recurrence = {
        amount_total: 1000,
        amount_subtotal: 1000,
        amount_tax: undefined,
      };

      const result = computeRecurrenceAmounts(recurrence, {
        currency: 'EUR',
        locale: 'en-US',
      });

      expect(result).toEqual({
        amount_total: '€10.00',
        amount_total_decimal: '10',
        amount_subtotal: '€10.00',
        amount_subtotal_decimal: '10',
        amount_tax: '€0.00',
      });
    });
  });

  describe('getRecurrenceInterval', () => {
    it('should return billing_period for recurring items', () => {
      const result = getRecurrenceInterval({
        type: 'recurring',
        billing_period: 'monthly',
      });

      expect(result).toBe('monthly');
    });

    it('should return the type for one-time items', () => {
      const result = getRecurrenceInterval({
        type: 'one_time',
      });

      // The function returns the type value directly for non-recurring types
      expect(result).toBe('one_time');
    });
  });

  describe('fillPostSpaces', () => {
    it('should add non-breaking spaces to fill up to the desired length', () => {
      const result = fillPostSpaces('test', 10);
      expect(result).toBe('test&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
    });

    it('should return original string if it is already at or above the desired length', () => {
      const result = fillPostSpaces('abcdefghij', 10);
      expect(result).toBe('abcdefghij');

      const result2 = fillPostSpaces('abcdefghijk', 10);
      expect(result2).toBe('abcdefghijk');
    });

    it('should handle empty strings', () => {
      const result = fillPostSpaces('', 5);
      expect(result).toBe('');
    });
  });

  describe('getSafeAmount', () => {
    it('should return the original value for primitives', () => {
      expect(getSafeAmount(100)).toBe(100);
      expect(getSafeAmount('100')).toBe('100');
      expect(getSafeAmount(true)).toBe(true);
    });

    it('should return undefined for objects', () => {
      expect(getSafeAmount({})).toBeUndefined();
      expect(getSafeAmount([])).toBeUndefined();
      expect(getSafeAmount(new Date())).toBeUndefined();
    });

    it('should return undefined for undefined', () => {
      expect(getSafeAmount(undefined)).toBeUndefined();
    });

    it('should return undefined for null', () => {
      // The implementation treats null as an object, so it returns undefined
      expect(getSafeAmount(null)).toBeUndefined();
    });
  });

  describe('isCompositePrice', () => {
    it('should return true for items with is_composite_price set to true', () => {
      const priceItem = {
        is_composite_price: true,
      } as unknown as PriceItem;
      expect(isCompositePrice(priceItem)).toBe(true);
    });

    it('should return true for items with _price.is_composite_price set to true', () => {
      const priceItem = {
        _price: {
          is_composite_price: true,
        },
      } as unknown as PriceItem;
      expect(isCompositePrice(priceItem)).toBe(true);
    });

    it('should return false for non-composite price items', () => {
      const priceItem = {
        is_composite_price: false,
        _price: {
          is_composite_price: false,
        },
      } as unknown as PriceItem;
      expect(isCompositePrice(priceItem)).toBe(false);
    });

    it('should return false when properties are undefined', () => {
      const priceItem = {} as unknown as PriceItem;
      expect(isCompositePrice(priceItem)).toBe(false);

      const priceItem2 = { _price: {} } as unknown as PriceItem;
      expect(isCompositePrice(priceItem2)).toBe(false);
    });
  });

  describe('getQuantity', () => {
    it('should return formatted string with quantity for non-variable prices', () => {
      const item = {
        quantity: 10,
        _price: { variable_price: false },
      } as unknown as PriceItem;
      expect(getQuantity(item)).toBe('10');
    });

    it('should handle variable price items', () => {
      const item = {
        quantity: 1,
        price_id: 'price_123',
        _price: {
          variable_price: true,
          unit: 'users',
        },
        price_mappings: [
          {
            price_id: 'price_123',
            value: 15,
          },
        ],
      } as unknown as PriceItem;
      expect(getQuantity(item)).toBe('15 users');
    });

    it('should handle variable price with multiple quantities', () => {
      const item = {
        quantity: 2,
        price_id: 'price_123',
        _price: {
          variable_price: true,
          unit: 'users',
        },
        price_mappings: [
          {
            price_id: 'price_123',
            value: 15,
          },
        ],
      } as unknown as PriceItem;
      expect(getQuantity(item)).toBe('2 x 15 users');
    });

    it('should show placeholder when value is not available', () => {
      const item = {
        quantity: 1,
        price_id: 'price_123',
        _price: {
          variable_price: true,
        },
        price_mappings: [],
      } as unknown as PriceItem;
      expect(getQuantity(item)).toBe(EMPTY_VALUE_PLACEHOLDER);
    });

    it('should handle parent relationships for non-variable prices', () => {
      const item = {
        quantity: 3,
        _price: { variable_price: false },
      } as unknown as PriceItem;
      const parentItem = {
        quantity: 2,
      } as unknown as PriceItem;
      expect(getQuantity(item, parentItem)).toBe('2 x 3');
    });
  });

  describe('getDisplayUnit', () => {
    it('should return undefined for tiered flat fee pricing model', () => {
      const item = {
        _price: {
          pricing_model: PricingModel.tieredFlatFee,
        },
      } as unknown as PriceItem;
      expect(getDisplayUnit(item)).toBeUndefined();
    });

    it('should return undefined for on-request prices', () => {
      const item = {
        _price: {
          price_display_in_journeys: 'show_as_on_request',
        },
      } as unknown as PriceItem;
      expect(getDisplayUnit(item)).toBeUndefined();
    });

    it('should return formatted unit with leading slash', () => {
      const item = {
        _price: { unit: 'users' },
      } as unknown as PriceItem;
      expect(getDisplayUnit(item)).toBe('/users');
    });

    it('should return empty string when no unit is available', () => {
      const item = {
        _price: {},
      } as unknown as PriceItem;
      expect(getDisplayUnit(item)).toBe('');
    });
  });

  describe('unitAmountApproved', () => {
    it('should return true when price display type is not hidden', () => {
      const item = {
        _price: { price_display_in_journeys: 'show_price' },
      } as unknown as PriceItemWithParent;
      expect(unitAmountApproved(item)).toBe(true);
    });

    it('should return true when request is approved', () => {
      const item = {
        _price: { price_display_in_journeys: 'show_as_on_request' },
        on_request_approved: true,
      } as unknown as PriceItemWithParent;
      expect(unitAmountApproved(item)).toBe(true);
    });

    it('should return true when parent request is approved', () => {
      const item = {
        _price: { price_display_in_journeys: 'show_as_on_request' },
        parent_item: {
          on_request_approved: true,
        },
      } as unknown as PriceItemWithParent;
      expect(unitAmountApproved(item)).toBe(true);
    });

    it('should return false when hidden price is not approved', () => {
      const item = {
        _price: { price_display_in_journeys: 'show_as_on_request' },
      } as unknown as PriceItemWithParent;
      expect(unitAmountApproved(item)).toBe(false);
    });

    it('should handle composite prices correctly', () => {
      const compositeItem = {
        is_composite_price: true,
        _price: { price_display_in_journeys: 'show_price' },
        item_components: [{ _price: { price_display_in_journeys: 'show_price' } }],
      } as unknown as PriceItemWithParent & CompositePriceItem;
      expect(unitAmountApproved(compositeItem)).toBe(true);
    });

    it('should handle composite prices with hidden components', () => {
      const compositeItem = {
        is_composite_price: true,
        _price: { price_display_in_journeys: 'show_price' },
        item_components: [{ _price: { price_display_in_journeys: 'show_as_on_request' } }],
      } as unknown as PriceItemWithParent & CompositePriceItem;
      expect(unitAmountApproved(compositeItem)).toBe(false);
    });
  });
});
