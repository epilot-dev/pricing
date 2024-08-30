import { Currency } from 'dinero.js';

import { d, toDinero } from '../formatters';
import { MarkupPricingModel, TypeGetAg } from '../pricing';
import { Price, PriceGetAg, PriceTier, Tax } from '../types';

type GetTaxValue = (tax?: Tax) => number;

type PriceItemsTotals = {
  unitAmount?: number;
  unitAmountNet?: number;
  unitAmountNetDecimal?: string;
  unitAmountGross?: number;
  unitAmountGrossDecimal?: string;
  amountSubtotal: number;
  amountTotal: number;
  taxAmount: number;
  displayMode?: Price['price_display_in_journeys'];
  getAg?: PriceGetAg;
  tiers_details?: {
    quantity: number;
    unitAmount: number;
    unitAmountDecimal: string;
    unitAmountNet: number;
    unitAmountGross: number;
    amountSubtotal: number;
    amountTotal: number;
    taxAmount: number;
  }[];
};

export const TaxRates = Object.freeze({
  standard: 0.19,
  reduced: 0.07,
  nontaxable: 0,
});

export const getTaxValue: GetTaxValue = (tax) => {
  if (Array.isArray(tax)) {
    return (+tax?.[0]?.rate || 0.0) / 100;
  }

  if (tax) {
    return (+tax?.rate || 0.0) / 100;
  }

  return TaxRates.nontaxable;
};

/**
 * Checks whether a price is tax inclusive or not.
 *
 * @param price the price object
 * @returns true if the price is tax inclusive, false otherwise. defaults to true.
 */
export const isTaxInclusivePrice = (price?: Price): boolean => {
  return price?.is_tax_inclusive ?? true;
};

/**
 * Gets the quantity for a specific tier.
 * @param tierMinQuantity The minimum quantity for the tier.
 * @param tierMaxQuantity The maximum quantity for the tier.
 * @param normalizedQuantity The normalized quantity.
 * @returns The quantity to be considered for the tier totals computation.
 */
export const getQuantityForTier = (tierMinQuantity: number, tierMaxQuantity: number, normalizedQuantity: number) => {
  if (typeof tierMinQuantity !== 'number' && isNaN(tierMinQuantity)) {
    throw new Error('Tier min quantity must be a number');
  }

  if (typeof tierMaxQuantity !== 'number' && isNaN(tierMaxQuantity)) {
    throw new Error('Tier max quantity must be a number');
  }

  if (tierMinQuantity >= tierMaxQuantity) {
    throw new Error('Tier min quantity must be less than tier max quantity');
  }

  if (normalizedQuantity < tierMinQuantity) {
    throw new Error('Normalized quantity must be greater than tier min quantity');
  }

  if (normalizedQuantity >= tierMaxQuantity) {
    return toDinero(tierMaxQuantity.toString(), 'EUR').subtract(toDinero(tierMinQuantity.toString(), 'EUR')).toUnit();
  }

  return toDinero(normalizedQuantity.toString(), 'EUR').subtract(toDinero(tierMinQuantity.toString(), 'EUR')).toUnit();
};

export const computePriceItemValues = (
  unitAmountDecimal: string,
  currency: Currency,
  isTaxInclusive: boolean,
  unitAmountMultiplier: number,
  tax?: Tax,
): PriceItemsTotals => {
  const unitAmount = toDinero(unitAmountDecimal, currency);
  const taxRate = getTaxValue(tax);

  const unitAmountNet = isTaxInclusive ? unitAmount.divide(1 + taxRate) : unitAmount;

  const unitTaxAmount = isTaxInclusive
    ? unitAmount.subtract(unitAmount.divide(1 + taxRate))
    : unitAmount.multiply(taxRate);

  const unitAmountGross = unitAmountNet.add(unitTaxAmount);

  const amountSubtotal = unitAmountNet.multiply(unitAmountMultiplier);
  const amountTotal = unitAmountGross.multiply(unitAmountMultiplier);
  const taxAmount = unitTaxAmount.multiply(unitAmountMultiplier);

  return {
    unitAmount: unitAmount.getAmount(),
    unitAmountNet: unitAmountNet.getAmount(),
    unitAmountNetDecimal: unitAmountNet.toUnit().toString(),
    unitAmountGross: unitAmountGross.getAmount(),
    unitAmountGrossDecimal: unitAmountGross.toUnit().toString(),
    amountSubtotal: amountSubtotal.getAmount(),
    amountTotal: amountTotal.getAmount(),
    taxAmount: taxAmount.getAmount(),
  };
};

/**
 * Returns a function that checks whether a price tier is eligible for a given quantity.
 *
 * @param tiers a set of ordered price tiers
 * @param quantity the quantity to check
 */
const byPriceTiersForQuantity = (tiers: PriceTier[], quantity: number) => (_: PriceTier, index: number) => {
  if (index === 0) {
    return quantity >= 0;
  }

  return quantity > (tiers[index - 1]?.up_to || 0);
};

/**
 * Gets the price tiers for a quantity given the pricing model and price tiers.
 * @param {string} pricingModel - The pricing model.
 * @param {PriceTier[]} tiers - The price tiers.
 * @param {number} quantity - The quantity.
 * @return {PriceTier[]} - The result price tiers.
 */
export const getPriceTiersForQuantity = (tiers: PriceTier[], quantity: number): PriceTier[] => {
  const selectedTiers = tiers?.filter(byPriceTiersForQuantity(tiers, quantity));

  if (selectedTiers?.length) {
    return selectedTiers;
  }

  return [];
};

const getPriceTierForQuantity = (tiers: PriceTier[], quantity: number): PriceTier | null | undefined => {
  const selectedTiers = tiers.filter(byPriceTiersForQuantity(tiers, quantity));

  if (selectedTiers.length) {
    return selectedTiers.pop();
  }

  return null;
};

export const computeTieredVolumePriceItemValues = (
  tiers: PriceTier[] = [],
  currency: Currency,
  isTaxInclusive: boolean,
  quantityToSelectTier: number,
  tax: Tax | undefined,
  unitAmountMultiplier: number,
  unchangedPriceDisplayInJourneys: Price['price_display_in_journeys'],
): PriceItemsTotals => {
  const tier = getPriceTierForQuantity(tiers, quantityToSelectTier);

  const tierValues = computePriceItemValues(
    tier?.unit_amount_decimal!,
    currency,
    isTaxInclusive,
    unitAmountMultiplier,
    tax,
  );

  const displayMode = tier?.display_mode === 'on_request' ? 'show_as_on_request' : unchangedPriceDisplayInJourneys;

  return {
    tiers_details: [
      {
        quantity: unitAmountMultiplier,
        unitAmount: tier?.unit_amount || 0,
        unitAmountDecimal: tier?.unit_amount_decimal || '0',
        unitAmountNet: tierValues.unitAmountNet || 0,
        unitAmountGross: tierValues.unitAmountGross || 0,
        amountSubtotal: tierValues.amountSubtotal || 0,
        amountTotal: tierValues.amountTotal || 0,
        taxAmount: tierValues.taxAmount || 0,
      },
    ],
    unitAmountGross: d(tierValues.unitAmountGross!).getAmount(),
    unitAmountNet: d(tierValues.unitAmountNet!).getAmount(),
    amountSubtotal: d(tierValues.amountSubtotal).getAmount(),
    amountTotal: d(tierValues.amountTotal).getAmount(),
    taxAmount: d(tierValues.taxAmount).getAmount(),
    displayMode,
  };
};

export const computeTieredFlatFeePriceItemValues = (
  tiers: PriceTier[] = [],
  currency: Currency,
  isTaxInclusive: boolean,
  quantityToSelectTier: number,
  tax: Tax | undefined,
  quantity: number,
  isUsingPriceMappingToSelectTier: boolean,
  unchangedPriceDisplayInJourneys: Price['price_display_in_journeys'],
): PriceItemsTotals => {
  const tier = getPriceTierForQuantity(tiers, quantityToSelectTier);
  /**
   * If the price mapping is used to select the tier, we need to multiply the totals by the quantity.
   * Otherwise, the quantity is only used to select the tier.
   */
  const quantityToMultiply = isUsingPriceMappingToSelectTier ? quantity : 1;

  const tierValues = computePriceItemValues(
    tier?.flat_fee_amount_decimal!,
    currency,
    isTaxInclusive,
    quantityToMultiply,
    tax,
  );

  const displayMode: Price['price_display_in_journeys'] =
    tier?.display_mode === 'on_request' ? 'show_as_on_request' : unchangedPriceDisplayInJourneys;

  return {
    tiers_details: [
      {
        quantity: quantityToSelectTier,
        unitAmount: tier?.flat_fee_amount || 0,
        unitAmountDecimal: tier?.flat_fee_amount_decimal || '0',
        unitAmountNet: tierValues.unitAmountNet || 0,
        unitAmountGross: tierValues.unitAmountGross || 0,
        amountSubtotal: tierValues.unitAmountNet || 0,
        amountTotal: tierValues.unitAmountGross || 0,
        taxAmount: d(tierValues.unitAmountGross!).subtract(d(tierValues.unitAmountNet!)).getAmount() || 0,
      },
    ],
    unitAmountGross: d(tierValues.unitAmountGross!).getAmount(),
    unitAmountNet: d(tierValues.unitAmountNet!).getAmount(),
    amountSubtotal: d(tierValues.amountSubtotal).getAmount(),
    amountTotal: d(tierValues.amountTotal).getAmount(),
    taxAmount: d(tierValues.taxAmount).getAmount(),
    displayMode,
  };
};

export const computeTieredGraduatedPriceItemValues = (
  tiers: PriceTier[] = [],
  currency: Currency,
  isTaxInclusive: boolean,
  quantityToSelectTier: number,
  tax: Tax,
  quantity: number,
  isUsingPriceMappingToSelectTier: boolean,
  unchangedPriceDisplayInJourneys: Price['price_display_in_journeys'],
): PriceItemsTotals => {
  const priceTiersForQuantity = getPriceTiersForQuantity(tiers, quantityToSelectTier);

  const totals = priceTiersForQuantity.reduce(
    (totals, tier, index) => {
      const tierMinQuantity = index === 0 ? 0 : tiers[index - 1].up_to;
      const tierMaxQuantity = tier.up_to || Infinity;
      const graduatedQuantity = getQuantityForTier(tierMinQuantity!, tierMaxQuantity, quantityToSelectTier);

      const tierValues = computePriceItemValues(
        tier.unit_amount_decimal!,
        currency,
        isTaxInclusive,
        graduatedQuantity,
        tax,
      );

      const displayMode: Price['price_display_in_journeys'] =
        tier?.display_mode === 'on_request' ? 'show_as_on_request' : unchangedPriceDisplayInJourneys;

      return {
        tiers_details: [
          ...(totals.tiers_details || []),
          {
            quantity: graduatedQuantity,
            unitAmount: tier.unit_amount || 0,
            unitAmountDecimal: tier.unit_amount_decimal || '0',
            unitAmountNet: tierValues.unitAmountNet || 0,
            unitAmountGross: tierValues.unitAmountGross || 0,
            amountSubtotal: tierValues.amountSubtotal || 0,
            amountTotal: tierValues.amountTotal || 0,
            taxAmount: tierValues.taxAmount || 0,
          },
        ],
        unitAmountGross: d(totals.unitAmountGross!).add(d(tierValues.unitAmountGross!)).getAmount(),
        unitAmountNet: d(totals.unitAmountNet!).add(d(tierValues.unitAmountNet!)).getAmount(),
        amountSubtotal: d(totals.amountSubtotal).add(d(tierValues.amountSubtotal)).getAmount(),
        amountTotal: d(totals.amountTotal).add(d(tierValues.amountTotal)).getAmount(),
        taxAmount: d(totals.taxAmount).add(d(tierValues.taxAmount)).getAmount(),
        displayMode,
      };
    },
    { unitAmountGross: 0, unitAmountNet: 0, amountSubtotal: 0, amountTotal: 0, taxAmount: 0 } as PriceItemsTotals,
  );

  /**
   * If the price mapping is used to select the tier, we need to multiply the totals by the quantity.
   * Otherwise, the quantity is only used to select the tier.
   */
  const quantityToMultiply = isUsingPriceMappingToSelectTier ? quantity : 1;

  return {
    ...totals,
    amountSubtotal: d(totals.amountSubtotal).multiply(quantityToMultiply).getAmount(),
    amountTotal: d(totals.amountTotal).multiply(quantityToMultiply).getAmount(),
    taxAmount: d(totals.taxAmount).multiply(quantityToMultiply).getAmount(),
  };
};

export const computeExternalGetAGItemValues = (
  getAg: PriceGetAg,
  currency: Currency,
  isTaxInclusive: boolean,
  unitAmountMultiplier: number,
  userInput: number,
  externalFeeAmountDecimal: string | undefined,
  tax?: Tax,
): PriceItemsTotals => {
  if (externalFeeAmountDecimal === undefined || getAg === undefined || userInput === 0) {
    return {
      unitAmountNet: 0,
      unitAmountGross: 0,
      taxAmount: 0,
      amountSubtotal: 0,
      amountTotal: 0,
      getAg: {
        ...getAg,
        unit_amount_net: 0,
        unit_amount_gross: 0,
        markup_amount_net: 0,
      },
    };
  }

  const taxRate = getTaxValue(tax);

  const markupValues =
    getAg.markup_pricing_model === MarkupPricingModel.tieredVolume && getAg.markup_tiers
      ? computeTieredVolumePriceItemValues(
          getAg.markup_tiers,
          currency,
          isTaxInclusive,
          userInput,
          tax,
          userInput,
          'show_price',
        )
      : getAg.markup_pricing_model === MarkupPricingModel.tieredFlatFee && getAg.markup_tiers
      ? computeTieredFlatFeePriceItemValues(
          getAg.markup_tiers,
          currency,
          isTaxInclusive,
          userInput,
          tax,
          userInput,
          true,
          'show_price',
        )
      : ({
          unitAmountNet: isTaxInclusive
            ? toDinero(getAg.markup_amount_decimal)
                .divide(1 + taxRate)
                .getAmount()
            : toDinero(getAg.markup_amount_decimal).getAmount(),
        } as PriceItemsTotals);

  const relevantTier = markupValues.tiers_details?.[0];
  const unitAmountGetAgFeeNet =
    getAg.type === TypeGetAg.basePrice
      ? toDinero(externalFeeAmountDecimal)
      : toDinero(externalFeeAmountDecimal).divide(userInput);
  const unitAmountGetAgFeeGross = unitAmountGetAgFeeNet.multiply(1 + taxRate);

  // Unit Amount = Markup amount + Fee Amount
  const unitAmountNet = unitAmountGetAgFeeNet.add(d(markupValues.unitAmountNet || 0));

  const unitAmountGross = unitAmountNet.multiply(1 + taxRate);
  const unitTaxAmount = unitAmountGross.subtract(unitAmountNet);
  const unitAmountMarkupNet = d(markupValues.unitAmountNet || 0);

  // Amount Subtotal = Unit Amount Net * Quantity
  const amountSubtotal =
    getAg.type === TypeGetAg.basePrice ? unitAmountNet : unitAmountNet.multiply(unitAmountMultiplier);
  const amountTotal =
    getAg.type === TypeGetAg.basePrice ? unitAmountGross : unitAmountGross.multiply(unitAmountMultiplier);
  const amountTax = getAg.type === TypeGetAg.basePrice ? unitTaxAmount : unitTaxAmount.multiply(unitAmountMultiplier);

  return {
    unitAmountNet: unitAmountNet.getAmount(),
    unitAmountGross: unitAmountGross.getAmount(),
    taxAmount: amountTax.getAmount(),
    amountSubtotal: amountSubtotal.getAmount(),
    amountTotal: amountTotal.getAmount(),
    getAg: {
      ...getAg,
      unit_amount_net: unitAmountGetAgFeeNet.getAmount(),
      unit_amount_gross: unitAmountGetAgFeeGross.getAmount(),
      markup_amount_net: unitAmountMarkupNet.getAmount(),
      markup_amount: (relevantTier ? relevantTier?.unitAmount : getAg.markup_amount) || 0,
      // ToDo: Move the computation of the decimal value on the convert precision step
      markup_amount_decimal: (relevantTier ? relevantTier?.unitAmountDecimal : getAg.markup_amount_decimal) || '0',
    },
  };
};

export const isNotPieceUnit = (unit: string | undefined) => unit !== undefined && unit !== 'unit';
