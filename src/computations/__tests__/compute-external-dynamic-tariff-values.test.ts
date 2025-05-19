import type { PriceDynamicTariff } from '@epilot/pricing-client';
import { describe, it, expect } from 'vitest';
import { tax19percent } from '../../__tests__/fixtures/tax.samples';
import { DEFAULT_CURRENCY } from '../../money/constants';
import { ModeDynamicTariff } from '../../prices/constants';
import { computeExternalDynamicTariffValues } from '../compute-external-dynamic-tariff-values';

describe('computeExternalDynamicTariffValues', () => {
  it('should return zeroed values when externalFeeAmountDecimal is undefined', () => {
    const dynamicTariff: PriceDynamicTariff = {
      mode: ModeDynamicTariff.manual,
      average_price: 1000,
      average_price_decimal: '10.00',
    };

    const result = computeExternalDynamicTariffValues({
      dynamicTariff,
      currency: DEFAULT_CURRENCY,
      isTaxInclusive: true,
      unitAmountMultiplier: 1,
      externalFeeAmountDecimal: undefined,
      tax: tax19percent,
    });

    expect(result).toEqual({
      unit_amount_net: 0,
      unit_amount_gross: 0,
      amount_tax: 0,
      amount_subtotal: 0,
      amount_total: 0,
      dynamic_tariff: {
        ...dynamicTariff,
        unit_amount_net: 0,
        unit_amount_gross: 0,
        markup_amount_net: 0,
        markup_amount_gross: 0,
      },
    });
  });

  it('should return zeroed values when dynamicTariff is undefined', () => {
    const result = computeExternalDynamicTariffValues({
      // @ts-ignore - Testing runtime validation
      dynamicTariff: undefined,
      currency: DEFAULT_CURRENCY,
      isTaxInclusive: true,
      unitAmountMultiplier: 1,
      externalFeeAmountDecimal: '10.00',
      tax: tax19percent,
    });

    expect(result).toEqual({
      unit_amount_net: 0,
      unit_amount_gross: 0,
      amount_tax: 0,
      amount_subtotal: 0,
      amount_total: 0,
      dynamic_tariff: {
        unit_amount_net: 0,
        unit_amount_gross: 0,
        markup_amount_net: 0,
        markup_amount_gross: 0,
      },
    });
  });

  describe('Manual mode', () => {
    it('should compute values correctly for tax-inclusive pricing', () => {
      const dynamicTariff: PriceDynamicTariff = {
        mode: ModeDynamicTariff.manual,
        average_price: 1000,
        average_price_decimal: '10.00',
      };

      const result = computeExternalDynamicTariffValues({
        dynamicTariff,
        currency: DEFAULT_CURRENCY,
        isTaxInclusive: true,
        unitAmountMultiplier: 1,
        externalFeeAmountDecimal: '5.00',
        tax: tax19percent,
      });

      // In manual mode, the unit amount from dynamicTariff is used
      // For tax-inclusive, the net amount should be the gross amount divided by (1 + tax rate)
      // The result is using DECIMAL_PRECISION (12) so the number is scaled up by 10^12
      expect(result.dynamic_tariff?.markup_amount_net).toBeCloseTo(8403361344538, -1);
      expect(result.dynamic_tariff?.markup_amount_gross).toBe(10000000000000);

      // In manual mode, unit_amount_net and unit_amount_gross are set to 0
      expect(result.dynamic_tariff?.unit_amount_net).toBe(0);
      expect(result.dynamic_tariff?.unit_amount_gross).toBe(0);

      // The function will compute per-unit values based on the average_price_decimal
      expect(result.amount_total).toBe(10000000000000);
      expect(result.amount_subtotal).toBeCloseTo(8403361344538, -1);
      expect(result.amount_tax).toBeCloseTo(1596638655462, -1);
    });

    it('should compute values correctly for tax-exclusive pricing', () => {
      const dynamicTariff: PriceDynamicTariff = {
        mode: ModeDynamicTariff.manual,
        average_price: 1000,
        average_price_decimal: '10.00',
      };

      const result = computeExternalDynamicTariffValues({
        dynamicTariff,
        currency: DEFAULT_CURRENCY,
        isTaxInclusive: false,
        unitAmountMultiplier: 1,
        externalFeeAmountDecimal: '5.00',
        tax: tax19percent,
      });

      // For tax-exclusive, the net amount is the price directly (with DECIMAL_PRECISION)
      expect(result.dynamic_tariff?.markup_amount_net).toBe(10000000000000);
      // And the gross is net * (1 + tax rate)
      expect(result.dynamic_tariff?.markup_amount_gross).toBe(11900000000000);

      // In manual mode, unit_amount_net and unit_amount_gross are set to 0
      expect(result.dynamic_tariff?.unit_amount_net).toBe(0);
      expect(result.dynamic_tariff?.unit_amount_gross).toBe(0);

      // The function will compute per-unit values
      expect(result.amount_subtotal).toBe(10000000000000);
      expect(result.amount_tax).toBe(1900000000000);
      expect(result.amount_total).toBe(11900000000000);
    });

    it('should apply the unitAmountMultiplier correctly', () => {
      const dynamicTariff: PriceDynamicTariff = {
        mode: ModeDynamicTariff.manual,
        average_price: 1000,
        average_price_decimal: '10.00',
      };

      const result = computeExternalDynamicTariffValues({
        dynamicTariff,
        currency: DEFAULT_CURRENCY,
        isTaxInclusive: true,
        unitAmountMultiplier: 2, // Multiply by 2
        externalFeeAmountDecimal: '5.00',
        tax: tax19percent,
      });

      // The total should be doubled (with DECIMAL_PRECISION)
      expect(result.amount_total).toBe(20000000000000);
      expect(result.amount_subtotal).toBeCloseTo(16806722689076, -1);
      expect(result.amount_tax).toBeCloseTo(3193277310924, -1);
    });
  });

  describe('Dynamic tariff mode (non-manual)', () => {
    it('should compute values correctly for tax-inclusive pricing', () => {
      const dynamicTariff: PriceDynamicTariff = {
        mode: ModeDynamicTariff.dayAheadMarket,
        // Fix the property name - using markup_amount_decimal instead of markup
        markup_amount_decimal: '2.00',
        // Add required properties
        average_price: 0,
        average_price_decimal: '0',
      };

      const result = computeExternalDynamicTariffValues({
        dynamicTariff,
        currency: DEFAULT_CURRENCY,
        isTaxInclusive: true,
        unitAmountMultiplier: 1,
        externalFeeAmountDecimal: '5.00',
        tax: tax19percent,
      });

      // For markup, tax-inclusive means the gross is the input value
      expect(result.dynamic_tariff?.markup_amount_gross).toBe(2000000000000);
      // And the net is gross / (1 + tax rate)
      expect(result.dynamic_tariff?.markup_amount_net).toBeCloseTo(1680672268908, -1);

      // The dynamic tariff should have the market (external) price
      expect(result.dynamic_tariff?.unit_amount_net).toBe(5000000000000);
      expect(result.dynamic_tariff?.unit_amount_gross).toBe(5950000000000);

      // The total should include both market price and markup
      // Market price is 5.00, markup is 2.00, so 7.00 total
      expect(result.amount_total).toBe(7950000000000);
      expect(result.amount_subtotal).toBeCloseTo(6680672268908, -1);
      expect(result.amount_tax).toBeCloseTo(1269327731092, -1);
    });

    it('should compute values correctly for tax-exclusive pricing', () => {
      const dynamicTariff: PriceDynamicTariff = {
        mode: ModeDynamicTariff.dayAheadMarket,
        // Fix the property name
        markup_amount_decimal: '2.00',
        // Add required properties
        average_price: 0,
        average_price_decimal: '0',
      };

      const result = computeExternalDynamicTariffValues({
        dynamicTariff,
        currency: DEFAULT_CURRENCY,
        isTaxInclusive: false,
        unitAmountMultiplier: 1,
        externalFeeAmountDecimal: '5.00',
        tax: tax19percent,
      });

      // For markup, tax-exclusive means the net is the input value
      expect(result.dynamic_tariff?.markup_amount_net).toBe(2000000000000);
      // And the gross is net * (1 + tax rate)
      expect(result.dynamic_tariff?.markup_amount_gross).toBe(2380000000000);

      // The dynamic tariff should have the market (external) price
      expect(result.dynamic_tariff?.unit_amount_net).toBe(5000000000000);
      expect(result.dynamic_tariff?.unit_amount_gross).toBe(5950000000000);

      // The total should include both market price and markup, with tax added
      // Market price is 5.00, markup is 2.00, so 7.00 net total
      expect(result.amount_subtotal).toBe(7000000000000);
      expect(result.amount_tax).toBe(1330000000000);
      expect(result.amount_total).toBe(8330000000000);
    });

    it('should apply the unitAmountMultiplier correctly', () => {
      const dynamicTariff: PriceDynamicTariff = {
        mode: ModeDynamicTariff.dayAheadMarket,
        // Fix the property name
        markup_amount_decimal: '2.00',
        // Add required properties
        average_price: 0,
        average_price_decimal: '0',
      };

      const result = computeExternalDynamicTariffValues({
        dynamicTariff,
        currency: DEFAULT_CURRENCY,
        isTaxInclusive: true,
        unitAmountMultiplier: 3, // Multiply by 3
        externalFeeAmountDecimal: '5.00',
        tax: tax19percent,
      });

      // The total should be tripled
      expect(result.amount_total).toBe(23850000000000);
      expect(result.amount_subtotal).toBeCloseTo(20042016806724, -1);
      expect(result.amount_tax).toBeCloseTo(3807983193276, -1);
    });
  });

  it('should handle calculations without tax', () => {
    const dynamicTariff: PriceDynamicTariff = {
      mode: ModeDynamicTariff.manual,
      average_price: 1000,
      average_price_decimal: '10.00',
    };

    const result = computeExternalDynamicTariffValues({
      dynamicTariff,
      currency: DEFAULT_CURRENCY,
      isTaxInclusive: false,
      unitAmountMultiplier: 1,
      externalFeeAmountDecimal: '5.00',
      // No tax provided
    });

    // Without tax, net and gross amounts should be the same
    expect(result.dynamic_tariff?.markup_amount_net).toBe(10000000000000);
    expect(result.dynamic_tariff?.markup_amount_gross).toBe(10000000000000);

    expect(result.amount_subtotal).toBe(10000000000000);
    expect(result.amount_tax).toBe(0);
    expect(result.amount_total).toBe(10000000000000);
  });
});
