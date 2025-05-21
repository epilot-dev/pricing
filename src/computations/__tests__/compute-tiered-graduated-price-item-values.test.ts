import type { PriceTier, Tax } from '@epilot/pricing-client';
import type { Currency } from 'dinero.js';
import { describe, it, expect } from 'vitest';
import { computeTieredGraduatedPriceItemValues } from '../compute-tiered-graduated-price-item-values';

describe('computeTieredGraduatedPriceItemValues', () => {
  // Test data
  const currency = 'EUR' as Currency;
  const tiers: PriceTier[] = [
    {
      up_to: 10,
      unit_amount: 1000,
      unit_amount_decimal: '10.00',
    },
    {
      up_to: 20,
      unit_amount: 800,
      unit_amount_decimal: '8.00',
    },
    {
      up_to: null,
      unit_amount: 600,
      unit_amount_decimal: '6.00',
    },
  ];

  const tax = {
    _id: '10',
    rate: 10,
    type: 'VAT',
  } as Tax;

  it('should handle empty tiers array', () => {
    const result = computeTieredGraduatedPriceItemValues({
      tiers: [],
      currency,
      isTaxInclusive: true,
      quantityToSelectTier: 5,
      tax,
      quantity: 1,
      isUsingPriceMappingToSelectTier: false,
      unchangedPriceDisplayInJourneys: 'show_price',
    });

    expect(result.amount_subtotal).toBe(0);
    expect(result.amount_total).toBe(0);
    expect(result.amount_tax).toBe(0);
    expect(result.tiers_details).toBeUndefined();
  });

  it('should handle null tiers', () => {
    const result = computeTieredGraduatedPriceItemValues({
      tiers: undefined,
      currency,
      isTaxInclusive: true,
      quantityToSelectTier: 5,
      tax,
      quantity: 1,
      isUsingPriceMappingToSelectTier: false,
      unchangedPriceDisplayInJourneys: 'show_price',
    });

    expect(result.amount_subtotal).toBe(0);
    expect(result.amount_total).toBe(0);
    expect(result.amount_tax).toBe(0);
    expect(result.tiers_details).toBeUndefined();
  });

  it('should handle tier without unit_amount_decimal', () => {
    const tiersWithMissingDecimal: PriceTier[] = [
      {
        up_to: 10,
        unit_amount: 1000,
        // Missing unit_amount_decimal
      },
    ];

    const result = computeTieredGraduatedPriceItemValues({
      tiers: tiersWithMissingDecimal,
      currency,
      isTaxInclusive: true,
      quantityToSelectTier: 5,
      tax,
      quantity: 1,
      isUsingPriceMappingToSelectTier: false,
      unchangedPriceDisplayInJourneys: 'show_price',
    });

    expect(result.tiers_details).toHaveLength(1);
    expect(result.tiers_details?.[0].unit_amount_decimal).toBe('0');
  });

  it('should handle tiers without unit_amount', () => {
    const tiersWithMissingAmount: PriceTier[] = [
      {
        up_to: 10,
        // Missing unit_amount
        unit_amount_decimal: '10.00',
      },
    ];

    const result = computeTieredGraduatedPriceItemValues({
      tiers: tiersWithMissingAmount,
      currency,
      isTaxInclusive: true,
      quantityToSelectTier: 5,
      tax,
      quantity: 1,
      isUsingPriceMappingToSelectTier: false,
      unchangedPriceDisplayInJourneys: 'show_price',
    });

    expect(result.tiers_details).toHaveLength(1);
    expect(result.tiers_details?.[0].unit_amount).toBe(0);
  });

  it('should handle missing totals.tiers_details', () => {
    // Test when the initial totals object doesn't have tiers_details
    // This is testing the spread operator with optional chaining on line 56
    const mockTiers: PriceTier[] = [
      {
        up_to: 10,
        unit_amount: 1000,
        unit_amount_decimal: '10.00',
      },
    ];

    const result = computeTieredGraduatedPriceItemValues({
      tiers: mockTiers,
      currency,
      isTaxInclusive: true,
      quantityToSelectTier: 5,
      tax,
      quantity: 1,
      isUsingPriceMappingToSelectTier: false,
      unchangedPriceDisplayInJourneys: 'show_price',
    });

    // The result should have tiers_details
    expect(result.tiers_details).toBeDefined();
    expect(result.tiers_details).toHaveLength(1);
  });

  it('should handle tier with display_mode = on_request', () => {
    const tiersWithDisplayMode: PriceTier[] = [
      {
        up_to: 10,
        unit_amount: 1000,
        unit_amount_decimal: '10.00',
        display_mode: 'on_request',
      },
    ];

    const result = computeTieredGraduatedPriceItemValues({
      tiers: tiersWithDisplayMode,
      currency,
      isTaxInclusive: true,
      quantityToSelectTier: 5,
      tax,
      quantity: 1,
      isUsingPriceMappingToSelectTier: false,
      unchangedPriceDisplayInJourneys: 'show_price',
    });

    expect(result.price_display_in_journeys).toBe('show_as_on_request');
  });

  it('should handle tier with undefined display_mode', () => {
    const result = computeTieredGraduatedPriceItemValues({
      tiers,
      currency,
      isTaxInclusive: true,
      quantityToSelectTier: 5,
      tax,
      quantity: 1,
      isUsingPriceMappingToSelectTier: false,
      unchangedPriceDisplayInJourneys: 'show_price',
    });

    expect(result.price_display_in_journeys).toBe('show_price');
  });

  it('should properly multiply by quantity when isUsingPriceMappingToSelectTier is true', () => {
    const quantity = 3;
    const result = computeTieredGraduatedPriceItemValues({
      tiers,
      currency,
      isTaxInclusive: true,
      quantityToSelectTier: 5,
      tax,
      quantity,
      isUsingPriceMappingToSelectTier: true,
      unchangedPriceDisplayInJourneys: 'show_price',
    });

    // Checking that the multiplication happened
    const singleUnitResult = computeTieredGraduatedPriceItemValues({
      tiers,
      currency,
      isTaxInclusive: true,
      quantityToSelectTier: 5,
      tax,
      quantity: 1,
      isUsingPriceMappingToSelectTier: true,
      unchangedPriceDisplayInJourneys: 'show_price',
    });

    expect(result.amount_subtotal).toBe(singleUnitResult.amount_subtotal * quantity);
    expect(result.amount_total).toBe(singleUnitResult.amount_total * quantity);
    expect(result.amount_tax).toBe(singleUnitResult.amount_tax * quantity);
  });

  it('should not multiply by quantity when isUsingPriceMappingToSelectTier is false', () => {
    const quantity = 3;
    const result = computeTieredGraduatedPriceItemValues({
      tiers,
      currency,
      isTaxInclusive: true,
      quantityToSelectTier: 5,
      tax,
      quantity,
      isUsingPriceMappingToSelectTier: false,
      unchangedPriceDisplayInJourneys: 'show_price',
    });

    // The tiers_details should reflect the calculation for quantityToSelectTier (5),
    // but the final amounts should not be multiplied by quantity (since isUsingPriceMappingToSelectTier is false)
    expect(result.tiers_details).toHaveLength(1);
    expect(result.tiers_details?.[0].quantity).toBe(5);

    // The multiplication factor should be 1, not quantity
    const expectedSubtotal = result.tiers_details?.[0].amount_subtotal;
    expect(result.amount_subtotal).toBe(expectedSubtotal);
  });
});
