import { Currency, Dinero } from 'dinero.js';

import { DEFAULT_CURRENCY } from '../currencies';
import { addSeparatorToDineroString, formatAmountFromString, toDinero } from '../formatters';
import { DEFAULT_LOCALE } from '../formatters/constants';
import { PricingModel } from '../pricing';
import { Price, PriceTier } from '../types';
import { getQuantityForTier, isNotPieceUnit } from '../utils';

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
 * @returns {Price} The selected tier.
 */
export function getDisplayTierByQuantity(
  tiers: PriceTier[],
  quantity: number,
  pricingModel: PricingModel | Price['pricing_model'],
): PriceTier | undefined {
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
): PriceTier[] | undefined {
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
  options: { showStartsAt?: boolean; enableSubunitDisplay?: boolean; shouldDisplayOnRequest?: boolean } = {},
): string | undefined {
  if (!pricingModel) {
    return;
  }

  if (!tier) {
    return;
  }

  if (tier.display_mode === 'on_request' && options.shouldDisplayOnRequest) {
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
      decimalAmount: tier.unit_amount_decimal!,
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

export const computeCumulativeValue = (
  tiers: PriceTier[] | undefined,
  quantityToSelectTier: number,
  unit: string | undefined,
  locale: string,
  currency: Currency | undefined,
  t: (key: string, options?: { ns: string; defaultValue?: string }) => string,
  options: { showStartsAt?: boolean; shouldDisplayOnRequest?: boolean } = {},
  tax: { isIncluded: boolean; rate: number } | undefined = undefined,
) => {
  if (!tiers || !tiers.length || quantityToSelectTier < 0) {
    return;
  }

  const priceTiersForQuantity = getDisplayTiersByQuantity(tiers, quantityToSelectTier, PricingModel.tieredGraduated);
  const onRequestTier = priceTiersForQuantity!.find((tier) => tier.display_mode === 'on_request');
  if (onRequestTier && options.shouldDisplayOnRequest) {
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
    const tierMinQuantity = index === 0 ? 0 : tiers[index - 1].up_to;
    const tierMaxQuantity = tier.up_to || Infinity;
    const graduatedQuantity = getQuantityForTier(tierMinQuantity!, tierMaxQuantity, quantityToSelectTier);
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

  const averageAmount = total
    .divide(quantityToSelectTier || 1)
    .getAmount()
    .toString();

  const netValues: {
    net_total?: Dinero;
    net_average?: string;
  } = {
    net_total: undefined,
    net_average: undefined,
  };

  if (tax) {
    const taxMultiplier = 1 + tax.rate / 100;
    netValues.net_total = tax.isIncluded ? total.divide(taxMultiplier) : total;

    netValues.net_average = netValues.net_total
      .divide(quantityToSelectTier || 1)
      .getAmount()
      .toString();
  }

  return {
    total:
      (startsAt ? `${startsAt} ` : '') +
      formatAmountFromString({
        decimalAmount: addSeparatorToDineroString(total.getAmount().toString()),
        ...formatOptions,
        precision: 2,
        useRealPrecision: false,
      }),
    totalWithPrecision:
      (startsAt ? `${startsAt} ` : '') +
      formatAmountFromString({
        decimalAmount: addSeparatorToDineroString(total.getAmount().toString()),
        ...formatOptions,
      }),
    average: `${formatAmountFromString({
      decimalAmount: addSeparatorToDineroString(averageAmount),
      ...formatOptions,
      precision: 2,
      useRealPrecision: false,
    })}${formattedUnit ? `/${formattedUnit}` : ''}`,
    ...(netValues.net_total && {
      netTotal:
        (startsAt ? `${startsAt} ` : '') +
        formatAmountFromString({
          decimalAmount: addSeparatorToDineroString(netValues.net_total.getAmount().toString()),
          ...formatOptions,
          precision: 2,
          useRealPrecision: false,
        }),
      netTotalWithPrecision:
        (startsAt ? `${startsAt} ` : '') +
        formatAmountFromString({
          decimalAmount: addSeparatorToDineroString(netValues.net_total.getAmount().toString()),
          ...formatOptions,
        }),
      netAverage: `${formatAmountFromString({
        decimalAmount: addSeparatorToDineroString(netValues.net_average!),
        ...formatOptions,
        precision: 2,
        useRealPrecision: false,
      })}${formattedUnit ? `/${formattedUnit}` : ''}`,
    }),
    breakdown,
  };
};
