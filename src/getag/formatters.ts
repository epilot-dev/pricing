import { DEFAULT_CURRENCY } from '../money/constants';
import { formatAmountFromString, parseDecimalValue } from '../money/formatters';
import { toDinero } from '../money/to-dinero';
import type { Currency } from '../shared/types';

/**
 * Determines the appropriate precision for fee formatting based on specific rules:
 * - Up to 4 decimal places maximum
 * - If 3rd decimal is 0 but 4th is not, show all 4 decimals
 * - If both 3rd and 4th decimals are 0, show only 2 decimals
 * - Otherwise, show the minimum required decimals (up to 4)
 */
const getFeePrecision = (decimalNumbers: string): number => {
  if (!decimalNumbers || decimalNumbers.length === 0) {
    return 2;
  }

  // Pad with zeros if less than 4 digits to make comparison easier
  const paddedDecimals = decimalNumbers.padEnd(4, '0');
  const thirdDigit = paddedDecimals[2];
  const fourthDigit = paddedDecimals[3];

  // If 3rd digit is 0 but 4th is not, show 4 decimals
  if (thirdDigit === '0' && fourthDigit !== '0') {
    return 4;
  }

  // If both 3rd and 4th digits are 0, show only 2 decimals
  if (thirdDigit === '0' && fourthDigit === '0') {
    return 2;
  }

  // Otherwise, show the minimum required decimals (remove trailing zeros, max 4)
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

  let feePrecision: number;

  if (shouldDisplayAsCents) {
    // When displaying as cents, we need to apply fee precision rules to the cent value
    // For example: 0.0123 becomes 1.23 cents, so we check the decimal part of "1.23"
    const centAmount = parseFloat(parsedDecimalAmount) * 100;
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
