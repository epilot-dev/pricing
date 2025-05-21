import type { PriceGetAg, PriceTier, Tax } from '@epilot/pricing-client';
import { describe, it, expect } from 'vitest';
import { MarkupPricingModel, TypeGetAg } from '../../prices/constants';
import { computeExternalGetAGItemValues } from '../compute-external-get-agitem-values';

describe('computeExternalGetAGItemValues', () => {
  // Test data
  const currency = 'EUR';
  const tax = {
    _id: '19',
    rate: 19,
    type: 'VAT',
  } as Tax;

  // Create a base getAg object with required properties
  const baseGetAg = {
    category: 'power',
    type: TypeGetAg.basePrice,
    markup_amount: 10,
    markup_amount_decimal: '0.10',
    unit_amount_gross: 0,
    unit_amount_net: 0,
  } as PriceGetAg;

  // Define consumption as string to avoid TypeGetAg type error
  const consumptionType = 'consumption';
  const consumptionGetAg = {
    ...baseGetAg,
    type: consumptionType,
  } as unknown as PriceGetAg;

  const tieredVolumeGetAg = {
    category: 'power',
    type: TypeGetAg.basePrice,
    markup_pricing_model: MarkupPricingModel.tieredVolume,
    markup_tiers: [
      {
        up_to: 10,
        unit_amount: 1000,
        unit_amount_decimal: '10.00',
      },
      {
        up_to: null,
        unit_amount: 800,
        unit_amount_decimal: '8.00',
      },
    ] as PriceTier[],
    markup_amount: 0,
    markup_amount_decimal: '0',
    unit_amount_gross: 0,
    unit_amount_net: 0,
  } as PriceGetAg;

  const tieredFlatFeeGetAg = {
    category: 'power',
    type: TypeGetAg.basePrice,
    markup_pricing_model: MarkupPricingModel.tieredFlatFee,
    markup_tiers: [
      {
        up_to: 10,
        flat_fee_amount: 1000,
        flat_fee_amount_decimal: '10.00',
      },
      {
        up_to: null,
        flat_fee_amount: 800,
        flat_fee_amount_decimal: '8.00',
      },
    ] as PriceTier[],
    markup_amount: 0,
    markup_amount_decimal: '0',
    unit_amount_gross: 0,
    unit_amount_net: 0,
  } as PriceGetAg;

  it('should return zeroed values when externalFeeAmountDecimal is undefined', () => {
    const result = computeExternalGetAGItemValues({
      getAg: baseGetAg,
      currency,
      isTaxInclusive: true,
      unitAmountMultiplier: 1,
      userInput: 1,
      externalFeeAmountDecimal: undefined,
      tax,
    });

    expect(result).toEqual({
      unit_amount_net: 0,
      unit_amount_gross: 0,
      amount_tax: 0,
      amount_subtotal: 0,
      amount_total: 0,
      get_ag: {
        ...baseGetAg,
        unit_amount_net: 0,
        unit_amount_gross: 0,
        markup_amount_net: 0,
      },
    });
  });

  it('should return zeroed values when getAg is undefined', () => {
    const result = computeExternalGetAGItemValues({
      getAg: undefined as unknown as PriceGetAg,
      currency,
      isTaxInclusive: true,
      unitAmountMultiplier: 1,
      userInput: 1,
      externalFeeAmountDecimal: '10.00',
      tax,
    });

    expect(result.unit_amount_net).toBe(0);
    expect(result.unit_amount_gross).toBe(0);
    expect(result.amount_tax).toBe(0);
    expect(result.amount_subtotal).toBe(0);
    expect(result.amount_total).toBe(0);
  });

  it('should return zeroed values when userInput is zero', () => {
    const result = computeExternalGetAGItemValues({
      getAg: baseGetAg,
      currency,
      isTaxInclusive: true,
      unitAmountMultiplier: 1,
      userInput: 0,
      externalFeeAmountDecimal: '10.00',
      tax,
    });

    expect(result.unit_amount_net).toBe(0);
    expect(result.unit_amount_gross).toBe(0);
  });

  it('should compute markup values correctly using tieredVolume pricing model', () => {
    const result = computeExternalGetAGItemValues({
      getAg: tieredVolumeGetAg,
      currency,
      isTaxInclusive: true,
      unitAmountMultiplier: 1,
      userInput: 5,
      externalFeeAmountDecimal: '5.38',
      tax,
    });

    // Check the unit_amount_net includes the tiered markup
    expect(result.unit_amount_net).toBeGreaterThan(0);
    // Verify a tier was selected
    expect(result.get_ag?.markup_amount).toBe(1000);
    expect(result.get_ag?.markup_amount_decimal).toBe('10.00');
  });

  it('should compute markup values correctly using tieredFlatFee pricing model', () => {
    const result = computeExternalGetAGItemValues({
      getAg: tieredFlatFeeGetAg,
      currency,
      isTaxInclusive: true,
      unitAmountMultiplier: 1,
      userInput: 5,
      externalFeeAmountDecimal: '5.38',
      tax,
    });

    // Check the unit_amount_net includes the tiered markup
    expect(result.unit_amount_net).toBeGreaterThan(0);
    // Verify a tier was selected
    expect(result.get_ag?.markup_amount).toBe(1000);
    expect(result.get_ag?.markup_amount_decimal).toBe('10.00');
  });

  it('should handle basePrice type correctly', () => {
    const result = computeExternalGetAGItemValues({
      getAg: baseGetAg,
      currency,
      isTaxInclusive: true,
      unitAmountMultiplier: 1,
      userInput: 1,
      externalFeeAmountDecimal: '5.38',
      tax,
    });

    // For basePrice type, amountSubtotal should equal unitAmountNet
    expect(result.amount_subtotal).toBe(result.unit_amount_net);
    expect(result.amount_total).toBe(result.unit_amount_gross);
  });

  it('should handle consumption type correctly', () => {
    const result = computeExternalGetAGItemValues({
      getAg: consumptionGetAg,
      currency,
      isTaxInclusive: true,
      unitAmountMultiplier: 1000,
      userInput: 1,
      externalFeeAmountDecimal: '5.38',
      tax,
    });

    // For consumption type, amountSubtotal should be multiplied by unitAmountMultiplier
    if (result.unit_amount_net !== undefined) {
      expect(result.amount_subtotal).toBe(result.unit_amount_net * 1000);
      expect(result.amount_total).toBe(result.unit_amount_gross! * 1000);
    }
  });

  it('should handle the case when relevantTier is undefined (specifically testing line 72)', () => {
    // Create a getAg without markup_tiers to trigger the condition where relevantTier is undefined
    const getAgWithoutTiers = {
      ...baseGetAg,
      // Just a standard getAg with no tiers, so markupValues.tiers_details will be undefined
    };

    const result = computeExternalGetAGItemValues({
      getAg: getAgWithoutTiers,
      currency,
      isTaxInclusive: true,
      unitAmountMultiplier: 1,
      userInput: 1,
      externalFeeAmountDecimal: '5.38',
      tax,
    });

    // Test that markup_amount is read from getAg instead of relevantTier (line 72)
    expect(result.get_ag?.markup_amount).toBe(getAgWithoutTiers.markup_amount);
    expect(result.get_ag?.markup_amount_decimal).toBe(getAgWithoutTiers.markup_amount_decimal);
  });

  // Additional test to specifically target the branch condition on line 72
  it('should handle the case when relevantTier is falsy but not undefined (null)', () => {
    // Modify the baseGetAg to have markup_tiers but force a situation where tiers_details[0] could be null
    // In this case, with markup_tiers: [], computeTieredVolumePriceItemValues results in a relevantTier
    // with unit_amount: 0.
    const getAgWithFalsyTier = {
      ...baseGetAg,
      markup_amount: 10, // This is the base markup, but a tier with 0 will be found
      markup_amount_decimal: '0.10',
      markup_pricing_model: MarkupPricingModel.tieredVolume,
      markup_tiers: [], // Empty array so a default/zero tier is selected by computeTieredVolumePriceItemValues
    } as PriceGetAg;

    const result = computeExternalGetAGItemValues({
      getAg: getAgWithFalsyTier,
      currency,
      isTaxInclusive: true,
      unitAmountMultiplier: 1,
      userInput: 1,
      externalFeeAmountDecimal: '5.38',
      tax,
    });

    // Test that markup_amount is from the selected (zero) tier, not the fallback getAg.markup_amount
    expect(result.get_ag?.markup_amount).toBe(0); // Tier amount is 0
    expect(result.get_ag?.markup_amount_decimal).toBe('0'); // Tier decimal is '0'
  });
});
