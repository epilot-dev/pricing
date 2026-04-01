import type { Currency as DineroCurrency } from 'dinero.js';
import { DEFAULT_CURRENCY, DEFAULT_INTEGER_AMOUNT_PRECISION } from '../money/constants';
import { formatAmount, parseDecimalValue } from '../money/formatters';
import { toDinero } from '../money/to-dinero';
import type { Currency } from '../shared/types';

export type PriceDiffFormat = 'percentage' | 'absolute';

export type PriceDiffOptions = {
  format: PriceDiffFormat;
  onlyIfBetter?: boolean;
  currency?: string;
  locale?: string;
};

export type PriceDiff = {
  isBetter: boolean;
  formattedDiff: string;
};

/**
 * Computes the price difference between an offer price and a current price,
 * returning the formatted savings or increase for display purposes.
 *
 * @param offerAmount - The new/offer price as a decimal string (e.g. "25.00")
 * @param currentAmount - The current/reference price as a decimal string (e.g. "30.00")
 * @param options - Configuration: format, onlyIfBetter, currency, locale
 * @returns `{ isBetter, formattedDiff }` or `null` if not applicable
 */
export const computePriceDiff = (
  offerAmount: string,
  currentAmount: string,
  options: PriceDiffOptions,
): PriceDiff | null => {
  const { format, onlyIfBetter = false, currency, locale } = options;
  const resolvedCurrency = (currency || DEFAULT_CURRENCY) as DineroCurrency;

  const currentDinero = toDinero(parseDecimalValue(currentAmount), resolvedCurrency);
  const offerDinero = toDinero(parseDecimalValue(offerAmount), resolvedCurrency);

  if (currentDinero.isZero()) return null;

  const diff = currentDinero.subtract(offerDinero);

  if (diff.isZero()) return null;

  const isBetter = !diff.isNegative();

  if (onlyIfBetter && !isBetter) return null;

  const resolvedLocale = locale ?? (typeof navigator !== 'undefined' ? navigator.language : undefined);

  const absDiff = diff.isNegative() ? diff.multiply(-1) : diff;

  let formattedDiff: string;

  if (format === 'percentage') {
    const percentage = (absDiff.getAmount() / currentDinero.getAmount()) * 100;

    formattedDiff = `${percentage.toFixed(1)}%`;
  } else {
    formattedDiff = formatAmount({
      amount: absDiff.convertPrecision(DEFAULT_INTEGER_AMOUNT_PRECISION).getAmount(),
      currency: resolvedCurrency as Currency,
      locale: resolvedLocale,
    });
  }

  return { isBetter, formattedDiff };
};
