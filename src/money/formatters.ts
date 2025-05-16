import dinero from 'dinero.js';
import type { Currency } from 'dinero.js';
import { CURRENCIES_SUBUNITS, DEFAULT_CURRENCY, DEFAULT_SUBUNIT } from './constants';
import {
  DECIMAL_PRECISION,
  DEFAULT_FORMAT,
  DEFAULT_INTEGER_AMOUNT_PRECISION,
  DEFAULT_LOCALE,
  DEFAULT_SUBUNIT_FORMAT,
  GENERIC_UNIT_DISPLAY_LABEL,
  MAX_SUPPORTED_FORMAT_PRECISION,
} from './constants';
import { getCurrencySymbol } from './getCurrencySymbol';
import { toDinero } from './toDinero';

type SubunitAndSymbol = {
  symbol: string;
  subunit: string;
};

const formatWithSubunit = (formattedDineroObject: string, { symbol, subunit }: SubunitAndSymbol) =>
  `${formattedDineroObject.replace(symbol, '').trimEnd()} ${subunit}`;

/**
 * Returns the subunit and symbol of the currency, as well as the subunit pluralized if necessary.
 *
 * @param {Currency} currency The currency.
 * @param {string} locale The locale to format the currency in.
 * @param {number} amount The amount to check.
 *
 * @returns {Object} The subunit and symbol of the currency, as well as the subunit pluralized if necessary.
 */
const getFormattedCurrencySubunit = (currency: Currency, locale: string, amount: number | string): SubunitAndSymbol => {
  const [language] = locale.split('-');
  const currencySubunit = CURRENCIES_SUBUNITS[currency] ?? DEFAULT_SUBUNIT;

  const subunit = currencySubunit[language] || currencySubunit['default'];

  const subunitAndSymbol = {
    symbol: getCurrencySymbol(currency, locale),
    subunit,
  };

  const oneCentRegex = /^010*$/;
  if (amount === 1 || (typeof amount === 'string' && oneCentRegex.test(amount))) {
    return subunitAndSymbol;
  }

  return {
    ...subunitAndSymbol,
    subunit: `${subunitAndSymbol.subunit}${language !== 'de' ? 's' : ''}`,
  };
};

const parseUnknownAmount = (
  /**
   * amount is typed as unknown to ensure the argument passed is handled
   * even if the caller is asserting the value type incorrectly
   */
  amount: unknown,
): number => {
  const integerAmount = Number(amount);

  if (isNaN(integerAmount)) {
    /* Kept here for backwards compatibility */
    console.error(
      `formatAmount: expects an integer amount, received this instead "${amount}", fallbacks to zero.`,
      new Error(`NaN error, unable to cast ${amount} to number.`),
    );

    return 0;
  } else {
    return integerAmount;
  }
};

// /**
//  * Formats an integer amount, optionally with a currency into a formatted text string.
//  * If specified, a custom Dinero formatter can also be applied.
//  *
//  * @param params: { amount, currency, format }: amount - representing the integer/string amount, currency – a currency in the ISO code format, and format – a dinerojs format.
//  * @returns the formatted amount
//  */
export const formatAmount = ({
  amount,
  currency = DEFAULT_CURRENCY,
  format,
  locale = DEFAULT_LOCALE,
  enableSubunitDisplay = false,
}: {
  amount: number | string;
  currency?: Currency;
  format?: string;
  locale?: string;
  enableSubunitDisplay?: boolean;
}): string => {
  const integerAmount = parseUnknownAmount(amount);

  const dAmount = dinero({
    amount: integerAmount,
    currency,
    precision: DEFAULT_INTEGER_AMOUNT_PRECISION,
  });

  if (enableSubunitDisplay && shouldDisplayAmountAsCents(integerAmount, currency)) {
    const subunitAndSymbol = getFormattedCurrencySubunit(currency, locale, integerAmount);

    return formatWithSubunit(
      dAmount
        .multiply(100)
        .convertPrecision(DEFAULT_INTEGER_AMOUNT_PRECISION)
        .setLocale(locale)
        .toFormat(format || DEFAULT_SUBUNIT_FORMAT),
      subunitAndSymbol,
    );
  }

  return dAmount.setLocale(locale).toFormat(format || DEFAULT_FORMAT);
};

export type AmountFormatter = typeof formatAmount;

/**
 * Gets the precision and format from a decimal amount (string)
 * @param {string} decimalAmount - The decimal amount to get the precision and format from
 */
function getPrecisionAndFormatFromStringAmount({
  decimalAmount,
  useRealPrecision,
  precision,
  shouldDisplayAsCents,
}: {
  decimalAmount: string;
  useRealPrecision: boolean;
  precision?: number;
  shouldDisplayAsCents: boolean;
}) {
  if (useRealPrecision) {
    const [, decimalNumbers] = decimalAmount.split('.');

    const precisionFromLength = getPrecisionFromDecimalNumbersLength(decimalNumbers, shouldDisplayAsCents);
    const amountPrecision = shouldDisplayAsCents
      ? Math.min(precisionFromLength, MAX_SUPPORTED_FORMAT_PRECISION)
      : precisionFromLength;
    const precisionToFormat = '0'.repeat(amountPrecision);
    const amountFormat = DEFAULT_FORMAT.replace('.00', `.${precisionToFormat}`);

    return {
      amountPrecision,
      amountFormat,
    };
  }

  if (precision) {
    const precisionToFormat = '0'.repeat(precision);
    const amountFormat = DEFAULT_FORMAT.replace('.00', `.${precisionToFormat}`);

    return {
      amountPrecision: precision,
      amountFormat,
    };
  }

  return {
    amountPrecision: DEFAULT_INTEGER_AMOUNT_PRECISION,
    amountFormat: DEFAULT_FORMAT,
  };
}

/**
 * Formats a decimal amount (string) to the desired user-displayable format
 *
 * @param {string} decimalAmount - The decimal amount to be formatted
 * @param {string} currency - The currency to be used in the formatting using the 3-letter ISO code
 * @param {string} format - The format to be used in the formatting
 * @param {string} locale - The locale to be used in the formatting, using the 2-letter ISO code (e.g. en, fr, es, etc.)
 * @param {number} precision - The precision to be used in the formatting (digits past the decimal point)
 * @param {boolean} useRealPrecision - When false, the amount will be rounded to use 2 decimal places, otherwise it will use the real precision
 * @param {boolean} enableSubunitDisplay - When true, the amount won't be displayed as the subunit (e.g. cents)
 * @return {string} - The user-displayable formatted amount
 */
export const formatAmountFromString = ({
  decimalAmount,
  precision,
  currency,
  format,
  locale,
  useRealPrecision = false,
  enableSubunitDisplay = false,
}: {
  decimalAmount: string;
  precision?: number;
  currency?: Currency;
  format?: string;
  locale?: string;
  useRealPrecision?: boolean;
  enableSubunitDisplay?: boolean;
}): string => {
  /**
   * Decimal amounts can sometimes come in an invalid format, such as 1.000.000,00.
   * In an attempt to build some resiliency into our library, this function will parse the decimal amount to a valid format, such as 1000000.00.
   */
  const parsedDecimalAmount = parseDecimalValue(decimalAmount);

  const dineroObjectFromAmount = toDinero(parsedDecimalAmount, currency || DEFAULT_CURRENCY);
  const [onlyDecimalFromAmount, subunitFromAmount] = parsedDecimalAmount.split('.');
  const shouldDisplayAsCents = Number(onlyDecimalFromAmount) === 0 && dineroObjectFromAmount.hasSubUnits();
  const { amountPrecision, amountFormat } = getPrecisionAndFormatFromStringAmount({
    decimalAmount: parsedDecimalAmount,
    useRealPrecision,
    shouldDisplayAsCents: enableSubunitDisplay && shouldDisplayAsCents,
    precision,
  });

  if (enableSubunitDisplay && shouldDisplayAsCents) {
    const subunit = getFormattedCurrencySubunit(
      currency || DEFAULT_CURRENCY,
      locale || DEFAULT_LOCALE,
      subunitFromAmount,
    );

    return formatWithSubunit(
      dineroObjectFromAmount
        .multiply(100)
        .convertPrecision(precision ?? amountPrecision)
        .setLocale(locale || DEFAULT_LOCALE)
        .toFormat(format || amountFormat),
      subunit,
    );
  }

  return dineroObjectFromAmount
    .setLocale(locale || DEFAULT_LOCALE)
    .convertPrecision(precision ?? amountPrecision)
    .toFormat(format || amountFormat);
};

/**
 * Adds a separator to a Dinero object string to have the correct decimal precision
 * @param {Dinero} dineroObject - The Dinero object to be formatted
 */
export function addSeparatorToDineroString(dineroString: string) {
  const leadingZerosRegex = /([0-9])0+$/g;
  const length = dineroString.length;
  const separator = '.';
  const isSubunit = length <= DECIMAL_PRECISION;

  if (isSubunit) {
    const missingZeros = DECIMAL_PRECISION - length;
    const integerPart = 0;

    return `${integerPart}${separator}${'0'.repeat(missingZeros)}${dineroString.replace(leadingZerosRegex, '$1')}`;
  }

  const decimalPart = dineroString.substring(length - DECIMAL_PRECISION, length);
  const integerPart = dineroString.substring(0, length - DECIMAL_PRECISION);

  return `${integerPart}${separator}${decimalPart.replace(leadingZerosRegex, '$1')}`;
}

/**
 * Converts a string decimal amount to an integer amount with 2 digits precision.
 *
 * @param decimalAmount a string decimal amount
 * @returns the decimal amount represent as an integer scaled to 2 decimal places precision.
 */
export const toIntegerAmount: (decimalAmount: string) => number = (decimalAmount) =>
  toDinero(decimalAmount).convertPrecision(DEFAULT_INTEGER_AMOUNT_PRECISION).getAmount();

export const unitDisplayLabels = {
  none: GENERIC_UNIT_DISPLAY_LABEL,
  kw: 'kW',
  kwh: 'kWh',
  m: 'm',
  m2: 'm²',
  l: 'l',
  'cubic-meter': 'm³',
  'cubic-meter-h': 'm³/h',
  ls: 'l/s',
  a: 'A',
  kva: 'kVA',
  w: 'W',
  wp: 'Wp',
  kwp: 'kWp',
} as const;

export type PriceUnit = keyof typeof unitDisplayLabels;

/**
 * Checks whether a price unit is a built-in unit or not.
 *
 * @param {Price['unit']} unit - the built-in unit code or user custom unit
 * @returns {boolean} true if the unit is a built-in unit
 */
export const isPriceBuiltInUnit = (unit: string): unit is PriceUnit => unit in unitDisplayLabels;

/**
 * Formats built-in price units into a displayable representation. Eg. kw -> kW
 *
 * @returns {string} the formatted unit
 */
export const formatPriceUnit = (unit?: string, hideGenericUnitLabel?: boolean) => {
  if (!hideGenericUnitLabel && !unit?.trim()) {
    return unitDisplayLabels.none;
  }

  if (unit && unit in unitDisplayLabels) {
    return unitDisplayLabels[unit as keyof typeof unitDisplayLabels];
  }

  return String(unit ?? '').trim();
};

/**
 * Gets the precision from the decimal numbers length, normalizing the value if the amount should be displayed as cents
 * @param {string} decimalNumbers - The decimal numbers to get the precision from
 * @param {boolean} shouldDisplayAsCents - Whether the amount should be displayed as cents
 * @return {number} - The precision
 * @example
 * getPrecisionFromDecimalNumbersLength('5005', false) // 4
 * getPrecisionFromDecimalNumbersLength('5005', true) // 2
 */
function getPrecisionFromDecimalNumbersLength(decimalNumbers: string, shouldDisplayAsCents: boolean) {
  const noZerosRegex = /[1-9]+/g;
  const noDecimalNumbersPresent = !noZerosRegex.test(decimalNumbers);
  const precision = decimalNumbers?.length ?? 0;

  if (precision < 2 || noDecimalNumbersPresent) {
    return 2;
  }

  if (!shouldDisplayAsCents) {
    return precision || DEFAULT_INTEGER_AMOUNT_PRECISION;
  }

  // Removes the last 2 digits from the precision, since we want to display the amount as cents
  return Math.max(precision - DEFAULT_INTEGER_AMOUNT_PRECISION, DEFAULT_INTEGER_AMOUNT_PRECISION);
}

/**
 * Returns true when the amount is between -1 and 1 and the amount has subunits
 * @param {number} amount - The amount to check
 * @param {Currency} currency - The currency of the amount
 * @return {boolean} - Whether the amount should be displayed as cents
 * @example
 * shouldDisplayAmountAsCents(0.5, 'USD') // true
 * shouldDisplayAmountAsCents(1.5, 'USD') // false
 * shouldDisplayAmountAsCents(-0.5, 'USD') // true
 * shouldDisplayAmountAsCents(-1.5, 'USD') // false
 */
function shouldDisplayAmountAsCents(amount: number, currency?: Currency) {
  const dAmountOfOneUnit = dinero({
    amount: 100,
    currency: currency || DEFAULT_CURRENCY,
    precision: DEFAULT_INTEGER_AMOUNT_PRECISION,
  });

  const dAbsoluteAmount = dinero({
    amount: Math.abs(amount),
    currency: currency || DEFAULT_CURRENCY,
    precision: DEFAULT_INTEGER_AMOUNT_PRECISION,
  });

  return dAbsoluteAmount.hasSubUnits() && dAbsoluteAmount.lessThan(dAmountOfOneUnit);
}

/**
 * Converts a decimal string value into a valid decimal amount value, without any thousand separators, using dot as the decimal separator.
 *
 * @param value - The decimal string value to convert
 * @returns A valid decimal amount value
 */
export function parseDecimalValue(value: string): string {
  if (!value || typeof value !== 'string') {
    return '0.00';
  }

  const thousandSeparatorsRegex = /[,\\.]+/g;
  const lastIndexOfComma = String(value).lastIndexOf(',');
  const lastIndexOfDot = String(value).lastIndexOf('.');
  const lastIndexOfDecimal = lastIndexOfComma > lastIndexOfDot ? lastIndexOfComma : lastIndexOfDot;

  const containsMixedSeparators = lastIndexOfComma !== -1 && lastIndexOfDot !== -1;
  const decimalSeparator = lastIndexOfDecimal !== -1 ? value[lastIndexOfDecimal] : '.';
  const hasMoreThanTwoDecimalSeparators = value.split(decimalSeparator).length > 2;

  const integerPart = value
    .substring(0, lastIndexOfDecimal === -1 ? value.length : lastIndexOfDecimal)
    .replace(thousandSeparatorsRegex, '');
  const decimalPart = value
    .substring(lastIndexOfDecimal === -1 ? value.length : lastIndexOfDecimal, value.length)
    .replace(thousandSeparatorsRegex, '');

  if (!containsMixedSeparators && hasMoreThanTwoDecimalSeparators) {
    return `${integerPart}${decimalPart}.00`;
  }

  return `${integerPart}.${decimalPart || '00'}`;
}
