import { Currency, Dinero } from 'dinero.js';

import { DEFAULT_CURRENCY } from '../currencies';
import { DEFAULT_LOCALE, formatAmountFromString, toDinero } from '../formatters';
import { PricingModel } from '../pricing';
import { Price, PriceTier } from '../types';
import { getQuantityForTier } from '../utils';

const byInputQuantity = (tiers: PriceTier[], quantity: number) => (_: PriceTier, index: number) =>
  Math.ceil(quantity) > (tiers[index - 1]?.up_to || 0);

type CumulativePriceBreakdownItem = {
  quantityUsed: string;
  tierAmountDecimal: string;
  totalAmountDecimal: string;
};

/**
 * This function returns the price tier that matches the input quantity.
 *
 * @param {PriceTier[]} tiers - The price tiers.
 * @param {Number} quantity - The quantity.
 * @param {PricingModel} pricingModel - The pricing model.
 * @returns {Price} The selected tier.
 */
export function getDisplayTierByQuantity(
  tiers: PriceTier[],
  quantity: number,
  pricingModel: PricingModel | Price['pricing_model'],
): PriceTier {
  if (!tiers || !tiers.length) {
    return;
  }

  if (!quantity || quantity <= 0 || !pricingModel) {
    return tiers[0];
  }

  if (pricingModel === PricingModel.tieredGraduated) {
    return tiers[0];
  }

  const matchingTiers = tiers.filter(byInputQuantity(tiers, quantity));

  return matchingTiers[matchingTiers.length - 1];
}

/**
 * This function returns all the price tier that matches the input quantity.
 *
 * @param {PriceTier[]} tiers - The price tiers.
 * @param {Number} quantity - The quantity.
 * @param {PricingModel} pricingModel - The pricing model.
 * @returns {Price} The selected tiers.
 */
export function getDisplayTiersByQuantity(
  tiers: PriceTier[],
  quantity: number,
  pricingModel: PricingModel | Price['pricing_model'],
): PriceTier[] {
  if (!tiers || !tiers.length) {
    return;
  }

  if (!quantity || quantity <= 0 || !pricingModel) {
    return [tiers[0]];
  }

  const matchingTiers = tiers.filter(byInputQuantity(tiers, quantity));

  if (pricingModel === PricingModel.tieredGraduated) {
    return matchingTiers;
  }

  return [matchingTiers[matchingTiers.length - 1]];
}

/**
 * Get the tier description for a tiered price. This function will return a string
 * describing the price, based on the tier and unit.
 *
 * @param {PriceTier} tier - The price tier.
 * @param {string | undefined} unit - The price unit.
 * @param {string} locale - The locale to use when formatting the price.
 * @param {Currency | undefined} currency - The currency to use when formatting
 * @param {boolean} showStartsAt - The boolean to show the starts at text.
 * the price.
 * @returns {string} The tier description.
 */
export function getTierDescription(
  pricingModel: PricingModel,
  tier: PriceTier | undefined,
  unit: string | undefined,
  locale: string,
  currency: Currency | undefined,
  t: (key: string, options?: { ns: string; defaultValue?: string }) => string,
  options: { showStartsAt?: boolean; enableSubunitDisplay?: boolean } = {},
): string {
  if (!pricingModel) {
    return;
  }

  if (!tier) {
    return;
  }

  if (tier.display_mode === 'on_request') {
    return t('show_as_on_request', {
      ns: '',
      defaultValue: 'Price on request',
    });
  }

  if (typeof tier.unit_amount !== 'number' && typeof tier.flat_fee_amount !== 'number') {
    return;
  }

  const { showStartsAt = true, enableSubunitDisplay = false } = options;
  const showUnitAmount =
    (pricingModel === PricingModel.tieredGraduated || pricingModel === PricingModel.tieredVolume) &&
    typeof tier.unit_amount === 'number';

  const showFlatFeeAmount = pricingModel === PricingModel.tieredFlatFee && typeof tier.flat_fee_amount === 'number';
  const startsAt =
    showStartsAt &&
    t('starts_at', {
      ns: 'entity',
      defaultValue: 'Starts at',
    });

  const formatedAmountString =
    showUnitAmount &&
    formatAmountFromString({
      decimalAmount: tier.unit_amount_decimal,
      currency: currency || DEFAULT_CURRENCY,
      locale,
      useRealPrecision: true,
      enableSubunitDisplay,
    });

  const formatedFlatFeeString =
    showFlatFeeAmount &&
    formatAmountFromString({
      decimalAmount: tier.flat_fee_amount_decimal || '0',
      currency: currency || DEFAULT_CURRENCY,
      locale,
      useRealPrecision: true,
      enableSubunitDisplay,
    });

  const formatedUnitString =
    showUnitAmount &&
    `/${t(`selectvalues.Price.unit.${unit || 'unit'}`, {
      ns: 'entity',
    })}`;

  return (
    (startsAt ? startsAt + ' ' : '') +
    (formatedAmountString || '') +
    (formatedUnitString || '') +
    (formatedFlatFeeString || '')
  );
}

export const computeCumulativeValue = (
  tiers: PriceTier[] | undefined,
  quantityToSelectTier: number,
  unit: string | undefined,
  locale: string,
  currency: Currency | undefined,
  t: (key: string, options?: { ns: string; defaultValue?: string }) => string,
) => {
  if (!tiers || !tiers.length || quantityToSelectTier <= 0) {
    return;
  }

  const priceTiersForQuantity = getDisplayTiersByQuantity(tiers, quantityToSelectTier, PricingModel.tieredGraduated);
  const formattedUnit = t(`selectvalues.Price.unit.${unit || 'unit'}`, {
    ns: 'entity',
    defaultValue: unit,
  });
  const formatOptions = {
    currency: currency || DEFAULT_CURRENCY,
    locale: locale || DEFAULT_LOCALE,
    useRealPrecision: true,
    enableSubunitDisplay: true,
  };

  const breakdown: CumulativePriceBreakdownItem[] = [];

  const total = priceTiersForQuantity.reduce((total: Dinero, tier: PriceTier, index: number) => {
    const tierMinQuantity = index === 0 ? 0 : tiers[index - 1].up_to;
    const tierMaxQuantity = tier.up_to || Infinity;
    const graduatedQuantity = getQuantityForTier(tierMinQuantity, tierMaxQuantity, quantityToSelectTier);
    const tierAmount = toDinero(tier.unit_amount_decimal).multiply(graduatedQuantity);

    breakdown.push({
      quantityUsed: `${graduatedQuantity} ${formattedUnit}`,
      tierAmountDecimal: formatAmountFromString({
        decimalAmount: tier.unit_amount_decimal,
        ...formatOptions,
      }),
      totalAmountDecimal: formatAmountFromString({
        decimalAmount: tierAmount.toFormat('0.00'),
        ...formatOptions,
      }),
    });

    return tierAmount.add(total);
  }, toDinero('0'));

  return {
    total: formatAmountFromString({
      decimalAmount: total.toFormat('0.00'),
      ...formatOptions,
    }),
    average: `${formatAmountFromString({
      decimalAmount: total.divide(quantityToSelectTier).toFormat('0.00'),
      ...formatOptions,
    })}/${formattedUnit}`,
    breakdown,
  };
};
