import type { PriceTier, Tax } from '@epilot/pricing-client';
import type { Currency, Dinero } from 'dinero.js';
import { DEFAULT_LOCALE } from '../money/constants';
import { DEFAULT_CURRENCY } from '../money/constants';
import { formatAmountFromString, addSeparatorToDineroString } from '../money/formatters';
import { toDinero } from '../money/to-dinero';
import { PricingModel } from '../prices/constants';
import { isNotPieceUnit } from '../shared/is-not-piece-unit';
import { getTaxValue } from '../taxes/get-tax-value';
import { getQuantityForTier } from './get-quantity-for-tier';
import { getDisplayTiersByQuantity } from './utils';

type CumulativePriceBreakdownItem = {
  quantityUsed: string;
  tierAmountDecimal: string;
  totalAmountDecimal: string;
};

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
  locale: string = DEFAULT_LOCALE,
  currency: Currency = DEFAULT_CURRENCY,
  t: (key: string, options?: { ns: string; defaultValue?: string }) => string,
  isTaxInclusive = true,
  options: { showStartsAt?: boolean; showOnRequest?: boolean } = {},
  tax?: Tax,
) => {
  if (!tiers?.length || quantityToSelectTier < 0) {
    return;
  }

  const priceTiersForQuantity = getDisplayTiersByQuantity(tiers, quantityToSelectTier, PricingModel.tieredGraduated);

  if (!priceTiersForQuantity) {
    throw new Error("Couldn't get tiers");
  }

  const onRequestTier = priceTiersForQuantity.find((tier) => tier.display_mode === 'on_request');
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

  const formatOptions: Partial<Parameters<typeof formatAmountFromString>[0]> = {
    currency,
    locale,
    useRealPrecision: true,
    enableSubunitDisplay: true,
  };

  const breakdown: CumulativePriceBreakdownItem[] = [];

  const total = priceTiersForQuantity.reduce(
    (total: Dinero, tier: PriceTier, index: number) => {
      const tierMinQuantity = index === 0 ? 0 : (tiers[index - 1].up_to ?? undefined);
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
    },
    toDinero('0', formatOptions.currency),
  );

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
