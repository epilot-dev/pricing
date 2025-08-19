import { DEFAULT_CURRENCY, DEFAULT_SUBUNIT_FORMAT, DECIMAL_PRECISION } from '../money/constants';
import { formatAmountFromString, parseDecimalValue } from '../money/formatters';
import { toDinero } from '../money/to-dinero';
import type { Currency } from '../shared/types';

/**
 * Determines the appropriate precision for fee formatting based on simplified rules:
 * - Remove trailing zeros from decimal part
 * - Minimum 2 decimal places, maximum 4 decimal places
 * - Show exactly as many decimals as needed (after removing trailing zeros)
 */
const getFeePrecision = (decimalNumbers: string): number => {
  if (!decimalNumbers || decimalNumbers.length === 0) {
    return 2;
  }

  // Remove trailing zeros and use the length (min 2, max 4)
  const trimmedDecimals = decimalNumbers.replace(/0+$/, '');
  return Math.min(Math.max(trimmedDecimals.length, 2), 4);
};

/**
 * Formats a fee amount from a string to a currency string
 */
export const formatFeeAmountFromString = ({
  decimalAmount,
  currency = DEFAULT_CURRENCY,
  format,
  locale,
  enableSubunitDisplay = false,
}: {
  decimalAmount: string;
  currency?: Currency;
  format?: string;
  locale?: string;
  enableSubunitDisplay?: boolean;
}): string => {
  const parsedDecimalAmount = parseDecimalValue(decimalAmount);
  const [onlyDecimalFromAmount, decimalNumbers] = parsedDecimalAmount.split('.');

  // Check if this will be displayed as subunits (cents)
  const dineroObjectFromAmount = toDinero(parsedDecimalAmount, currency);
  const shouldDisplayAsCents =
    enableSubunitDisplay && Number(onlyDecimalFromAmount) === 0 && dineroObjectFromAmount.hasSubUnits();

  const isOneOrMore = Math.abs(dineroObjectFromAmount.getAmount()) >= Math.pow(10, DECIMAL_PRECISION);

  if (isOneOrMore) {
    return formatAmountFromString({
      decimalAmount: parsedDecimalAmount,
      precision: 0,
      currency,
      format: DEFAULT_SUBUNIT_FORMAT,
      locale,
    });
  }

  let feePrecision: number;

  if (shouldDisplayAsCents) {
    // When displaying as cents, we need to apply fee precision rules to the cent value
    // For example: 0.0123 becomes 1.23 cents, so we check the decimal part of "1.23"
    const centAmount = dineroObjectFromAmount.multiply(100).toUnit();
    const centDecimalPart = centAmount.toString().split('.')[1] || '';

    feePrecision = getFeePrecision(centDecimalPart);
  } else {
    // Normal case: apply fee precision rules to the original decimal part
    feePrecision = getFeePrecision(decimalNumbers || '');
  }

  return formatAmountFromString({
    decimalAmount,
    precision: feePrecision,
    currency,
    format,
    locale,
    enableSubunitDisplay,
  });
};
