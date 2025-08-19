import { DEFAULT_CURRENCY } from '../money/constants';
import { formatAmountFromString, parseDecimalValue } from '../money/formatters';
import { toDinero } from '../money/to-dinero';
import type { Currency } from '../shared/types';

/**
 * Determines the appropriate precision for fee formatting based on simplified rules:
 * - Remove trailing zeros from decimal part
 * - Minimum 2 decimal places, maximum 4 decimal places
 * - Show exactly as many decimals as needed (after removing trailing zeros)
 */
const getCustomFeePrecision = (decimalNumbers: string): number => {
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
  const [onlyDecimalFromAmount] = parsedDecimalAmount.split('.');

  // Check if this will be displayed as subunits (cents)
  const dineroObjectFromAmount = toDinero(parsedDecimalAmount, currency);
  const shouldDisplayAsCents =
    enableSubunitDisplay && Number(onlyDecimalFromAmount) === 0 && dineroObjectFromAmount.hasSubUnits();

  if (shouldDisplayAsCents) {
    // When displaying as cents, we need to apply fee precision rules to the cent value
    const centAmount = dineroObjectFromAmount.multiply(100).toUnit();
    const centDecimalPart = centAmount.toString().split('.')[1] || '';

    const feePrecision = getCustomFeePrecision(centDecimalPart);

    return formatAmountFromString({
      decimalAmount,
      precision: feePrecision,
      currency,
      format,
      locale,
      enableSubunitDisplay,
    });
  } else {
    return formatAmountFromString({
      decimalAmount,
      currency,
      format,
      locale,
      enableSubunitDisplay,
    });
  }
};
