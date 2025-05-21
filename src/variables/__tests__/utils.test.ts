import { describe, it, expect, vi } from 'vitest';
import { PricingModel } from '../../prices/constants';
import type { PriceItem, CompositePriceItem, I18n, TFunction } from '../../shared/types';
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
  getUnitAmount,
  processExternalFeesMetadata,
  getPriceDisplayInJourneys,
  processRecurrences,
  getHiddenAmountString,
  withValidLineItem,
  processTaxRecurrences,
  getTaxRate,
  getFormattedTieredDetails,
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
        _price: { variable_price: true, unit: 'month' },
        price_mappings: [{ price_id: 'price_123', value: 10 }],
      } as unknown as PriceItem;

      expect(getQuantity(item)).toBe('10 month');
    });

    it('should handle variable price with multiple quantities', () => {
      const item = {
        quantity: 2,
        price_id: 'price_123',
        _price: { variable_price: true, unit: 'month' },
        price_mappings: [{ price_id: 'price_123', value: 10 }],
      } as unknown as PriceItem;

      expect(getQuantity(item)).toBe('2 x 10 month');
    });

    it('should show placeholder when value is not available', () => {
      const item = {
        quantity: 1,
        price_id: 'price_123',
        _price: { variable_price: true },
        price_mappings: [{ price_id: 'different_id', value: 10 }],
      } as unknown as PriceItem;

      expect(getQuantity(item)).toBe('---');
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

    it('should handle parent item quantities for variable prices', () => {
      const item = {
        quantity: 1,
        price_id: 'price_123',
        _price: { variable_price: true, unit: 'month' },
      } as unknown as PriceItem;

      const parentItem = {
        quantity: 5,
        price_mappings: [{ price_id: 'price_123', value: 10 }],
      } as unknown as PriceItem;

      expect(getQuantity(item, parentItem)).toBe('5 x 10 month');
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

    it('should return formatted unit', () => {
      const item = {
        _price: { unit: 'month' },
      } as unknown as PriceItem;

      expect(getDisplayUnit(item)).toBe('/month');
    });

    it('should return empty string for missing unit', () => {
      const item = {
        _price: {},
      } as unknown as PriceItem;

      expect(getDisplayUnit(item)).toBe('');
    });

    it('should return undefined for hidden price types', () => {
      const item = {
        _price: {
          unit: 'month',
          price_display_in_journeys: 'show_as_on_request',
        },
      } as unknown as PriceItem;

      expect(getDisplayUnit(item)).toBeUndefined();
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

    it('should return true for non-hidden price items', () => {
      const item = {
        _price: { price_display_in_journeys: 'show_price' },
        parent_item: { _price: { price_display_in_journeys: 'show_price' } },
      } as unknown as PriceItemWithParent;

      expect(unitAmountApproved(item)).toBe(true);
    });

    it('should return true when item is approved even if hidden', () => {
      const item = {
        _price: { price_display_in_journeys: 'show_as_on_request' },
        on_request_approved: true,
      } as unknown as PriceItemWithParent;

      expect(unitAmountApproved(item)).toBe(true);
    });

    it('should return true when parent item is approved even if hidden', () => {
      const item = {
        _price: { price_display_in_journeys: 'show_as_on_request' },
        parent_item: {
          _price: { price_display_in_journeys: 'show_price' },
          on_request_approved: true,
        },
      } as unknown as PriceItemWithParent;

      expect(unitAmountApproved(item)).toBe(true);
    });

    it('should return false for hidden price items without approval', () => {
      const item = {
        _price: { price_display_in_journeys: 'show_as_on_request' },
      } as unknown as PriceItemWithParent;

      expect(unitAmountApproved(item)).toBe(false);
    });
  });

  describe('getUnitAmount', () => {
    const mockI18n = {
      language: 'en-US',
      t: vi.fn((key) => key),
      // Add required properties to satisfy I18n type
      init: vi.fn(),
      loadResources: vi.fn(),
      use: vi.fn(),
      modules: {},
      services: {},
      isInitialized: true,
      changeLanguage: vi.fn(),
      getFixedT: vi.fn(),
      hasResourceBundle: vi.fn(),
      getResourceBundle: vi.fn(),
      addResourceBundle: vi.fn(),
    } as unknown as I18n;

    it('should return undefined for composite price items', () => {
      const item = {
        _price: { is_composite_price: true },
        currency: 'EUR',
      } as unknown as PriceItemWithParent;

      const result = getUnitAmount(item, mockI18n, {
        isUnitAmountApproved: true,
        useUnitAmountNet: false,
        isDiscountCoupon: false,
        isCashbackCoupon: false,
        isItemContainingDiscountCoupon: false,
      });

      expect(result).toBeUndefined();
    });

    it('should handle regular price items', () => {
      const item = {
        _price: {
          pricing_model: PricingModel.perUnit,
          unit_amount_decimal: '10.00',
        },
        currency: 'EUR',
        unit_amount_decimal: '10.00',
      } as unknown as PriceItemWithParent;

      const result = getUnitAmount(item, mockI18n, {
        isUnitAmountApproved: true,
        useUnitAmountNet: false,
        isDiscountCoupon: false,
        isCashbackCoupon: false,
        isItemContainingDiscountCoupon: false,
      });

      expect(result).toBe('€10.00');
    });

    it('should handle discount coupons', () => {
      const item = {
        _price: { pricing_model: PricingModel.perUnit },
        currency: 'EUR',
        unit_discount_amount: 500,
      } as unknown as PriceItemWithParent;

      const result = getUnitAmount(item, mockI18n, {
        isUnitAmountApproved: true,
        useUnitAmountNet: false,
        isDiscountCoupon: true,
        isCashbackCoupon: false,
        isItemContainingDiscountCoupon: false,
      });

      expect(result).toBe('-€5.00');
    });

    it('should return undefined for cashback coupons', () => {
      const item = {
        _price: { pricing_model: PricingModel.perUnit },
        currency: 'EUR',
      } as unknown as PriceItemWithParent;

      const result = getUnitAmount(item, mockI18n, {
        isUnitAmountApproved: true,
        useUnitAmountNet: false,
        isDiscountCoupon: false,
        isCashbackCoupon: true,
        isItemContainingDiscountCoupon: false,
      });

      expect(result).toBeUndefined();
    });

    it('should use before_discount_unit_amount for items containing discount coupons', () => {
      const item = {
        _price: { pricing_model: PricingModel.perUnit },
        currency: 'EUR',
        before_discount_unit_amount: 1000,
      } as unknown as PriceItemWithParent;

      const result = getUnitAmount(item, mockI18n, {
        isUnitAmountApproved: true,
        useUnitAmountNet: false,
        isDiscountCoupon: false,
        isCashbackCoupon: false,
        isItemContainingDiscountCoupon: true,
      });

      expect(result).toBe('€10.00');
    });

    it('should handle externalGetAG pricing model with composite price', () => {
      const item = {
        _price: {
          pricing_model: PricingModel.externalGetAG,
          is_composite_price: true,
        },
        currency: 'EUR',
        unit_amount_gross: 1000,
        unit_amount_net: 800,
        is_tax_inclusive: true,
      } as unknown as PriceItemWithParent;

      const result = getUnitAmount(item, mockI18n, {
        isUnitAmountApproved: true,
        useUnitAmountNet: false,
        isDiscountCoupon: false,
        isCashbackCoupon: false,
        isItemContainingDiscountCoupon: false,
      });

      expect(result).toBeUndefined();
    });

    it('should handle externalGetAG pricing model with non-composite price', () => {
      const item = {
        _price: {
          pricing_model: PricingModel.externalGetAG,
          is_composite_price: false,
        },
        currency: 'EUR',
        unit_amount_gross: 1000,
        unit_amount_net: 800,
        is_tax_inclusive: true,
      } as unknown as PriceItemWithParent;

      const result = getUnitAmount(item, mockI18n, {
        isUnitAmountApproved: true,
        useUnitAmountNet: false,
        isDiscountCoupon: false,
        isCashbackCoupon: false,
        isItemContainingDiscountCoupon: false,
      });

      expect(result).toBe('€10.00');
    });

    it('should handle tiered pricing models', () => {
      const item = {
        _price: {
          pricing_model: PricingModel.tieredGraduated,
          tiers: [
            {
              flat_amount: 1000,
              flat_amount_decimal: '10.00',
              unit_amount: 200,
              unit_amount_decimal: '2.00',
              up_to: 10,
            },
          ],
          unit: 'kWh',
          billing_period: 'monthly',
        },
        currency: 'EUR',
        quantity: 5,
      } as unknown as PriceItemWithParent;

      const result = getUnitAmount(item, mockI18n, {
        isUnitAmountApproved: true,
        useUnitAmountNet: false,
        isDiscountCoupon: false,
        isCashbackCoupon: false,
        isItemContainingDiscountCoupon: false,
      });

      expect(result).not.toBeUndefined();
    });
  });

  describe('getPriceDisplayInJourneys', () => {
    it('should return price_display_in_journeys from the price item', () => {
      const item = {
        _price: { price_display_in_journeys: 'show_price' },
      } as unknown as PriceItem;

      expect(getPriceDisplayInJourneys(item)).toBe('show_price');
    });

    it('should return undefined when price_display_in_journeys is not set', () => {
      const item = {
        _price: {},
      } as unknown as PriceItem;

      expect(getPriceDisplayInJourneys(item)).toBeUndefined();
    });

    it('should handle composite price items with hidden components', () => {
      const item = {
        is_composite_price: true,
        _price: { price_display_in_journeys: 'show_price' },
        item_components: [{ _price: { price_display_in_journeys: 'show_as_on_request' } }],
      } as unknown as CompositePriceItem;

      expect(getPriceDisplayInJourneys(item)).toBe('show_as_on_request');
    });
  });

  describe('getHiddenAmountString', () => {
    const mockTFunction = vi.fn().mockImplementation((key: string, fallback: string) => {
      if (key === 'show_as_on_request') return 'On request';
      if (key === 'show_as_starting_price') return 'Starting from';
      return fallback;
    }) as unknown as TFunction;

    it('should return translated string for on request prices', () => {
      const result = getHiddenAmountString(mockTFunction, 'show_as_on_request');
      expect(result).toBe('On request');
    });

    it('should return the provided value when display type is starting price', () => {
      const result = getHiddenAmountString(mockTFunction, 'show_as_starting_price', '€10.00');
      expect(result).toBe('Starting from €10.00');
    });

    it('should return fallback when no display type is provided', () => {
      const result = getHiddenAmountString(mockTFunction, undefined);
      expect(result).toBe(EMPTY_VALUE_PLACEHOLDER);
    });
  });

  describe('processRecurrences', () => {
    const mockI18n = {
      language: 'en-US',
      t: vi.fn((key) => (key === 'table_order.recurrences.billing_period.monthly' ? 'Monthly' : key)),
      // Add required properties to satisfy I18n type
      init: vi.fn(),
      loadResources: vi.fn(),
      use: vi.fn(),
      modules: {},
      services: {},
      isInitialized: true,
      changeLanguage: vi.fn(),
      getFixedT: vi.fn(),
      hasResourceBundle: vi.fn(),
      getResourceBundle: vi.fn(),
      addResourceBundle: vi.fn(),
    } as unknown as I18n;

    it('should process recurrences and format their amounts', () => {
      const item = {
        total_details: {
          breakdown: {
            recurrences: [
              {
                amount_total: 1000,
                amount_subtotal: 800,
                amount_tax: 200,
                type: 'recurring',
                billing_period: 'monthly',
              },
            ],
          },
        },
      };

      const result = processRecurrences(item, { currency: 'EUR' }, mockI18n);

      expect(result).toEqual([
        {
          amount_total: '€10.00',
          amount_subtotal: '€8.00',
          amount_tax: '€2.00',
          billing_period: 'Monthly',
          type: 'recurring',
        },
      ]);
    });

    it('should handle items with prefix', () => {
      const item = {
        total_details: {
          breakdown: {
            recurrences: [
              {
                amount_total: 1000,
                amount_subtotal: 800,
                amount_tax: 200,
                type: 'recurring',
                billing_period: 'monthly',
              },
            ],
          },
        },
      };

      const result = processRecurrences(item, { currency: 'EUR' }, mockI18n, 'From');

      expect(result[0].amount_total).toBe('From €10.00');
    });
  });

  describe('processTaxRecurrences', () => {
    const mockI18n = {
      language: 'en-US',
      t: vi.fn((key) => key),
      // Add required properties to satisfy I18n type
      init: vi.fn(),
      loadResources: vi.fn(),
      use: vi.fn(),
      modules: {},
      services: {},
      isInitialized: true,
      changeLanguage: vi.fn(),
      getFixedT: vi.fn(),
      hasResourceBundle: vi.fn(),
      getResourceBundle: vi.fn(),
      addResourceBundle: vi.fn(),
    } as unknown as I18n;

    it('should process tax recurrences correctly', () => {
      const item = {
        total_details: {
          breakdown: {
            taxes: [{ amount: 190 }],
          },
        },
        taxes: [
          {
            tax: { name: 'VAT', rate: 19 },
          },
        ],
        currency: 'EUR',
      };

      const result = processTaxRecurrences(item, mockI18n);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          tax: 'table_order.no_tax',
          amount: '€1.90',
        }),
      );
    });

    it('should handle multiple taxes', () => {
      const item = {
        total_details: {
          breakdown: {
            taxes: [{ amount: 190 }, { amount: 50 }],
          },
        },
        taxes: [
          {
            tax: { name: 'VAT', rate: 19 },
          },
          {
            tax: { name: 'City Tax', rate: 5 },
          },
        ],
        currency: 'EUR',
      };

      const result = processTaxRecurrences(item, mockI18n);

      expect(result).toHaveLength(2);
    });
  });

  describe('getTaxRate', () => {
    const mockI18n = {
      language: 'en-US',
      t: vi.fn((key) => (key === 'table_order.no_tax' ? 'No tax' : key)),
      // Add required properties to satisfy I18n type
      init: vi.fn(),
      loadResources: vi.fn(),
      use: vi.fn(),
      modules: {},
      services: {},
      isInitialized: true,
      changeLanguage: vi.fn(),
      getFixedT: vi.fn(),
      hasResourceBundle: vi.fn(),
      getResourceBundle: vi.fn(),
      addResourceBundle: vi.fn(),
    } as unknown as I18n;

    it('should get tax rate from tax object', () => {
      const source = {
        taxes: [{ tax: { name: 'VAT', rate: 19 } }],
      };

      const result = getTaxRate(source, mockI18n);
      expect(result).toBe('19%');
    });

    it('should handle taxes with predefined rates', () => {
      const source = {
        taxes: [{ rate: 'standard' }],
      };

      const result = getTaxRate(source, mockI18n);
      expect(result).toBe('19%');
    });

    it('should return no tax message when taxes are missing', () => {
      const source = { taxes: [] };
      const result = getTaxRate(source, mockI18n);
      expect(result).toBe('No tax');
    });
  });

  describe('processExternalFeesMetadata', () => {
    const mockI18n = {
      language: 'en-US',
      t: (key: string) => {
        if (key === 'table_order.recurrences.billing_period.monthly') return 'Monthly';
        if (key === 'table_order.external_fees.tax_behavior') return 'Exclusive';
        if (key.startsWith('table_order.external_fees.get_ag.')) {
          const feeName = key.replace('table_order.external_fees.get_ag.', '');
          if (feeName === 'basic_fee') return 'Basic Fee';
          if (feeName === 'consumption_fee') return 'Consumption Fee';
          return feeName;
        }
        return key;
      },
      // Add required properties to satisfy I18n type
      init: vi.fn(),
      loadResources: vi.fn(),
      use: vi.fn(),
      modules: {},
      services: {},
      isInitialized: true,
      changeLanguage: vi.fn(),
      getFixedT: vi.fn(),
      hasResourceBundle: vi.fn(),
      getResourceBundle: vi.fn(),
      addResourceBundle: vi.fn(),
    } as unknown as I18n;

    it('should process external fees metadata with static breakdown', () => {
      const metadata = {
        billing_period: 'monthly',
        breakdown: {
          static: {
            basic_fee: {
              amount: 1000,
              amount_decimal: '10.00',
              label: 'Basic Fee',
            },
          },
          variable: {},
          variable_ht: {},
          variable_nt: {},
        },
      } as any;

      const result = processExternalFeesMetadata(metadata, 'EUR', mockI18n);

      expect(result.billing_period).toBe('Monthly');
      expect(result.is_tax_inclusive).toBe(false);
      expect(result.tax_behavior_display).toBe('Exclusive');
      expect(result.breakdown.static.basic_fee.amount).toBe('€10.00');
      expect(result.breakdown.display_static).toBe('Basic Fee - €10.00');
    });

    it('should process external fees metadata with variable breakdowns', () => {
      const metadata = {
        billing_period: 'monthly',
        breakdown: {
          static: {
            basic_fee: {
              amount: 1000,
              amount_decimal: '10.00',
              label: 'Basic Fee',
            },
          },
          variable: {
            consumption_fee: {
              amount: 2000,
              amount_decimal: '20.00',
              unit_amount: 500,
              unit_amount_decimal: '5.00',
              label: 'Consumption Fee',
            },
          },
          variable_ht: {
            consumption_fee: {
              amount: 1800,
              amount_decimal: '18.00',
              unit_amount: 450,
              unit_amount_decimal: '4.50',
              label: 'Consumption Fee HT',
            },
          },
          variable_nt: {
            consumption_fee: {
              amount: 1500,
              amount_decimal: '15.00',
              unit_amount: 350,
              unit_amount_decimal: '3.50',
              label: 'Consumption Fee NT',
            },
          },
        },
      } as any;

      const result = processExternalFeesMetadata(metadata, 'EUR', mockI18n, 'kWh');

      // Check static breakdown
      expect(result.breakdown.static.basic_fee.amount).toBe('€10.00');
      expect(result.breakdown.display_static).toBe('Basic Fee - €10.00');

      // Check variable breakdown
      expect(result.breakdown.variable.consumption_fee.amount).toBe('€20.00');
      expect(result.breakdown.variable.consumption_fee.unit_amount).toBe('€5.00 / kWh');
      expect(result.breakdown.display_variable).toBe('Consumption Fee - €20.00');
      expect(result.breakdown.display_variable_per_unit).toBe('Consumption Fee - €5.00 / kWh');

      // Check variable_ht breakdown
      expect(result.breakdown.variable_ht.consumption_fee.amount).toBe('€18.00');
      expect(result.breakdown.display_variable_ht).toBe('Consumption Fee - €18.00');
      expect(result.breakdown.display_variable_ht_per_unit).toBe('Consumption Fee - €4.50 / kWh');

      // Check variable_nt breakdown
      expect(result.breakdown.variable_nt!.consumption_fee.amount).toBe('€15.00');
      expect(result.breakdown.display_variable_nt).toBe('Consumption Fee - €15.00');
      expect(result.breakdown.display_variable_nt_per_unit).toBe('Consumption Fee - €3.50 / kWh');

      // Check yearly amounts
      expect(result.breakdown.display_static_yearly).toBe('Basic Fee - €120.00');
      expect(result.breakdown.display_variable_yearly).toBe('Consumption Fee - €240.00');
      expect(result.breakdown.display_variable_ht_yearly).toBe('Consumption Fee - €216.00');
      expect(result.breakdown.display_variable_nt_yearly).toBe('Consumption Fee - €180.00');
    });
  });

  describe('getFormattedTieredDetails', () => {
    it('should return undefined when pricing model is not tiered graduated', () => {
      const item = {
        _price: { pricing_model: PricingModel.perUnit },
      } as unknown as PriceItem;

      const result = getFormattedTieredDetails([{ _position: 1 }] as any, item, true, 'en-US');
      expect(result).toBeUndefined();
    });

    it('should return undefined when tiers details are missing', () => {
      const result = getFormattedTieredDetails(undefined, {} as PriceItem, true, 'en-US');
      expect(result).toBeUndefined();
    });

    it('should format tiers details for tiered graduated pricing', () => {
      const tiersDetails = [
        {
          _position: 1,
          quantity: 10,
          flat_amount: 1000,
          flat_amount_decimal: '10.00',
          unit_amount: 200,
          unit_amount_decimal: '2.00',
          unit_amount_net: 168,
          amount_total: 3000,
          amount_subtotal: 2500,
          amount_tax: 500,
          up_to: 10,
        },
      ] as any;

      const item = {
        currency: 'EUR',
        _price: {
          pricing_model: PricingModel.tieredGraduated,
          is_tax_inclusive: true,
          unit: 'kWh',
          currency: 'EUR',
        },
      } as unknown as PriceItem;

      const result = getFormattedTieredDetails(tiersDetails, item, true, 'en-US');

      expect(result).toBeDefined();
      expect(result![0]).toEqual(
        expect.objectContaining({
          _position: 1,
          quantity: '10 kWh',
          unit_amount: '€2.00',
          unit_amount_net: '€1.68',
          amount_total: '€30.00',
          amount_subtotal: '€25.00',
          amount_tax: '€5.00',
        }),
      );
    });
  });

  describe('withValidLineItem', () => {
    it('should return true for valid line items', () => {
      const item = { _price: {} };
      expect(withValidLineItem(item)).toBe(true);
    });

    it('should return false for items without _price', () => {
      const item = {};
      expect(withValidLineItem(item)).toBe(false);
    });

    it('should return false for flattened items with _position', () => {
      const item = { _price: {}, _position: 1 };
      expect(withValidLineItem(item)).toBe(false);
    });
  });
});
