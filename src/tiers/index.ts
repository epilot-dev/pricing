/* eslint-disable prettier/prettier */
import { Currency, Dinero } from 'dinero.js';

import { DEFAULT_CURRENCY } from '../currencies';
import { addSeparatorToDineroString, formatAmountFromString, toDinero } from '../formatters';
import { DEFAULT_LOCALE } from '../formatters/constants';
import { PricingModel } from '../pricing';
import { Price, PriceTier, PriceTierEnhanced, Tax } from '../types';
import { getQuantityForTier, getTaxValue, isNotPieceUnit } from '../utils';

const byInputQuantity = (tiers: PriceTier[], quantity: number) => (_: PriceTier, index: number) =>
  quantity > (tiers[index - 1]?.up_to || 0);

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
 * @param {boolean} isTaxInclusive - The boolean to check if the tax is inclusive.
 * @param {Tax} tax - The tax object.
 * @returns {Price} The selected tier.
 */
export function getDisplayTierByQuantity(
  tiers: PriceTier[],
  quantity: number,
  pricingModel: PricingModel | Price['pricing_model'],
  isTaxInclusive = true,
  tax?: Tax,
): PriceTierEnhanced | undefined {
  if (!tiers || !tiers.length) {
    return;
  }

  if (!quantity || quantity <= 0 || !pricingModel) {
    return enhanceTier(tiers[0], isTaxInclusive, tax);
  }

  if (pricingModel === PricingModel.tieredGraduated) {
    return enhanceTier(tiers[0], isTaxInclusive, tax);
  }

  const matchingTiers = tiers.filter(byInputQuantity(tiers, quantity));

  return enhanceTier(matchingTiers[matchingTiers.length - 1], isTaxInclusive, tax);
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
  tiers?: PriceTier[],
  quantity?: number,
  pricingModel?: PricingModel | Price['pricing_model'],
  isTaxInclusive = true,
  tax?: Tax,
): PriceTierEnhanced[] | undefined {
  if (!tiers?.length) {
    return;
  }

  if (!quantity || quantity <= 0 || !pricingModel) {
    return [enhanceTier(tiers[0], isTaxInclusive, tax)];
  }

  const matchingTiers = tiers
    .filter(byInputQuantity(tiers, quantity))
    .map((tier) => enhanceTier(tier, isTaxInclusive, tax));

  if (pricingModel === PricingModel.tieredGraduated) {
    return matchingTiers.map((tier) => enhanceTier(tier, isTaxInclusive, tax));
  }

  return [enhanceTier(matchingTiers[matchingTiers.length - 1], isTaxInclusive, tax)];
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
  options: { showStartsAt?: boolean; enableSubunitDisplay?: boolean; showOnRequest?: boolean } = {},
  tax: { isInclusive: boolean; rate: number } | undefined = undefined,
): string | undefined {
  if (!pricingModel) {
    return;
  }

  if (!tier) {
    return;
  }

  if (tier.display_mode === 'on_request' && options.showOnRequest) {
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

  const formatOptions = {
    currency: currency || DEFAULT_CURRENCY,
    locale: locale || DEFAULT_LOCALE,
    useRealPrecision: tax ? false : true,
    enableSubunitDisplay,
  };

  const unitAmountDecimal =
    !showUnitAmount || tax === undefined
      ? tier.unit_amount_decimal
      : tax?.isInclusive
      ? addSeparatorToDineroString(
          toDinero(tier.unit_amount_decimal!, formatOptions.currency)
            .divide(1 + tax.rate / 100)
            .getAmount()
            .toString(),
        )
      : tier.unit_amount_decimal!;

  const flatFeeAmountDecimal =
    !showFlatFeeAmount || tax === undefined
      ? tier.flat_fee_amount_decimal
      : tax?.isInclusive
      ? addSeparatorToDineroString(
          toDinero(tier.flat_fee_amount_decimal!, formatOptions.currency)
            .divide(1 + tax.rate / 100)
            .getAmount()
            .toString(),
        )
      : tier.flat_fee_amount_decimal!;

  const formatedAmountString =
    showUnitAmount &&
    formatAmountFromString({
      ...formatOptions,
      decimalAmount: unitAmountDecimal!,
    });

  const formatedFlatFeeString =
    showFlatFeeAmount &&
    formatAmountFromString({
      ...formatOptions,
      decimalAmount: flatFeeAmountDecimal || '0',
    });

  const formatedUnitString =
    showUnitAmount &&
    isNotPieceUnit(unit) &&
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

/**
 * Computes the totals for cumulative prices and returns them in a human-readable format.
 * It includes a breakdown of the price tiers considered for the calculation.
 * @param {PriceTier[]} tiers
 * @param {number} quantityToSelectTier
 * @param {string} unit
 * @param {string} locale
 * @param {Currency} currency
 * @param {Function} t
 * @param {Object} options
 * @param {Tax} tax
 * @returns {Object} The cumulative price totals and breakdown.
 */
export const computeCumulativeValue = (
  tiers: PriceTier[] | undefined,
  quantityToSelectTier: number,
  unit: string | undefined,
  locale: string,
  currency: Currency | undefined,
  t: (key: string, options?: { ns: string; defaultValue?: string }) => string,
  isTaxInclusive = true,
  options: { showStartsAt?: boolean; showOnRequest?: boolean } = {},
  tax?: Tax,
) => {
  if (!tiers || !tiers.length || quantityToSelectTier < 0) {
    return;
  }

  const priceTiersForQuantity = getDisplayTiersByQuantity(tiers, quantityToSelectTier, PricingModel.tieredGraduated);
  const onRequestTier = priceTiersForQuantity!.find((tier) => tier.display_mode === 'on_request');
  if (onRequestTier && options.showOnRequest) {
    return t('show_as_on_request', {
      ns: '',
      defaultValue: 'Price on request',
    });
  }

  const formattedUnit = isNotPieceUnit(unit)
    ? t(`selectvalues.Price.unit.${unit || 'unit'}`, {
        ns: 'entity',
        defaultValue: unit,
      })
    : '';

  const formatOptions = {
    currency: currency || DEFAULT_CURRENCY,
    locale: locale || DEFAULT_LOCALE,
    useRealPrecision: true,
    enableSubunitDisplay: true,
  };

  const breakdown: CumulativePriceBreakdownItem[] = [];

  const total = priceTiersForQuantity!.reduce((total: Dinero, tier: PriceTier, index: number) => {
    const tierMinQuantity = index === 0 ? 0 : tiers[index - 1].up_to ?? undefined;
    const tierMaxQuantity = tier.up_to || Infinity;
    const graduatedQuantity = getQuantityForTier({
      min: tierMinQuantity,
      max: tierMaxQuantity,
      quantity: quantityToSelectTier,
    });
    const tierAmount = toDinero(tier.unit_amount_decimal!, formatOptions.currency).multiply(graduatedQuantity);

    breakdown.push({
      quantityUsed: `${graduatedQuantity.toLocaleString(formatOptions.locale, {
        maximumFractionDigits: 6,
      })} ${formattedUnit}`,
      tierAmountDecimal: `${formatAmountFromString({
        decimalAmount: tier.unit_amount_decimal!,
        ...formatOptions,
      })}${formattedUnit ? `/${formattedUnit}` : ''}`,
      totalAmountDecimal: formatAmountFromString({
        decimalAmount: addSeparatorToDineroString(tierAmount.getAmount().toString()),
        ...formatOptions,
      }),
    });

    return tierAmount.add(total);
  }, toDinero('0', formatOptions.currency));

  const startsAt =
    options.showStartsAt &&
    t('starts_at', {
      ns: 'entity',
      defaultValue: 'Starts at',
    });

  const taxRate = getTaxValue(tax);
  const amountTotal = isTaxInclusive ? total : total.multiply(1 + taxRate);
  const amountSubtotal = isTaxInclusive ? total.divide(1 + taxRate) : total;

  const subAverage = amountSubtotal
    .divide(quantityToSelectTier || 1)
    .getAmount()
    .toString();

  const average = amountTotal
    ? amountTotal
        .divide(quantityToSelectTier || 1)
        .getAmount()
        .toString()
    : '0';

  return {
    total:
      (startsAt ? `${startsAt} ` : '') +
      formatAmountFromString({
        decimalAmount: addSeparatorToDineroString(amountTotal.getAmount().toString()),
        ...formatOptions,
        precision: 2,
        useRealPrecision: false,
      }),
    totalWithPrecision:
      (startsAt ? `${startsAt} ` : '') +
      formatAmountFromString({
        decimalAmount: addSeparatorToDineroString(amountTotal.getAmount().toString()),
        ...formatOptions,
      }),
    average: `${formatAmountFromString({
      decimalAmount: addSeparatorToDineroString(average),
      ...formatOptions,
      precision: 2,
      useRealPrecision: false,
    })}${formattedUnit ? `/${formattedUnit}` : ''}`,
    subtotal:
      (startsAt ? `${startsAt} ` : '') +
      formatAmountFromString({
        decimalAmount: addSeparatorToDineroString(amountSubtotal.getAmount().toString()),
        ...formatOptions,
        precision: 2,
        useRealPrecision: false,
      }),
    subtotalWithPrecision:
      (startsAt ? `${startsAt} ` : '') +
      formatAmountFromString({
        decimalAmount: addSeparatorToDineroString(amountSubtotal.getAmount().toString()),
        ...formatOptions,
      }),
    subAverage: `${formatAmountFromString({
      decimalAmount: addSeparatorToDineroString(subAverage!),
      ...formatOptions,
      precision: 2,
      useRealPrecision: false,
    })}${formattedUnit ? `/${formattedUnit}` : ''}`,
    breakdown,
  };
};

/**
 * This function enhances a PriceTier with the gross amounts.
 * @param {PriceTier} tier
 * @param {boolean} isTaxInclusive
 * @param {Tax} tax
 * @returns {PriceTierEnhanced} an enhanced PriceTier with the gross amounts.
 */
const enhanceTier = (tier: PriceTier, isTaxInclusive: boolean, tax?: Tax): PriceTierEnhanced => {
  const taxRate = getTaxValue(tax);

  const unitAmount = tier.unit_amount_decimal && toDinero(tier.unit_amount_decimal);
  const unitAmountGross = !isTaxInclusive && unitAmount ? unitAmount.multiply(1 + taxRate) : unitAmount;
  const flatFeeAmount = tier.flat_fee_amount_decimal && toDinero(tier.flat_fee_amount_decimal);
  const flatFeeAmountGross = !isTaxInclusive && flatFeeAmount ? flatFeeAmount.multiply(1 + taxRate) : flatFeeAmount;

  return {
    ...tier,
    ...(unitAmountGross && { unit_amount_gross: unitAmountGross?.convertPrecision(2).getAmount() }),
    ...(unitAmountGross && { unit_amount_gross_decimal: unitAmountGross?.toUnit().toString() }),
    ...(flatFeeAmountGross && { flat_fee_amount_gross: flatFeeAmountGross?.convertPrecision(2).getAmount() }),
    ...(flatFeeAmountGross && { flat_fee_amount_gross_decimal: flatFeeAmountGross?.toUnit().toString() }),
  };
};
