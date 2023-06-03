import dinero, { Currency } from 'dinero.js';

import { CURRENCIES_SUBUNITS, DEFAULT_CURRENCY, DEFAULT_SUBUNIT } from '../currencies';
import { Price } from '../types';

import {
  DECIMAL_PRECISION,
  DEFAULT_FORMAT,
  DEFAULT_INTEGER_AMOUNT_PRECISION,
  DEFAULT_LOCALE,
  DEFAULT_SUBUNIT_FORMAT,
  GENERIC_UNIT_DISPLAY_LABEL,
} from './constants';

export {
  DECIMAL_PRECISION,
  DEFAULT_FORMAT,
  DEFAULT_INTEGER_AMOUNT_PRECISION,
  DEFAULT_LOCALE,
  GENERIC_UNIT_DISPLAY_LABEL,
} from './constants';

export type AmountFormatter = ({
  amount,
  currency,
  format,
  locale,
}: {
  amount: number | string;
  currency?: Currency;
  format?: string;
  locale?: string;
  enableSubunitDisplay?: boolean;
}) => string;

export type AmountFormatterFromString = ({
  decimalAmount,
  precision,
  currency,
  format,
  locale,
  useRealPrecision,
}: {
  decimalAmount: string;
  precision?: number;
  currency?: Currency;
  format?: string;
  locale?: string;
  useRealPrecision?: boolean;
  enableSubunitDisplay?: boolean;
}) => string;

export type DineroConvertor = (unitAmountDecimal: string, currency?: Currency) => dinero.Dinero;
export type FormatPriceUnit = (unit: Price['unit'], hideGenericUnitLabel?: boolean) => string;

const getCurrencySymbol = (currency: Currency, locale: string) => {
  return new Intl.NumberFormat(locale, { style: 'currency', currency })
    .formatToParts(1)
    .find((part) => part.type === 'currency').value;
};

const getCurrencySubunit = (currency: Currency, locale: string, language: string) => {
  if (!CURRENCIES_SUBUNITS[currency]) {
    const subunit = DEFAULT_SUBUNIT[language] || DEFAULT_SUBUNIT['default'];

    return {
      symbol: getCurrencySymbol(currency, locale),
      subunit,
    };
  }

  const subunit = CURRENCIES_SUBUNITS[currency].subunit[language] || CURRENCIES_SUBUNITS[currency].subunit['default'];

  return {
    symbol: getCurrencySymbol(currency, locale),
    subunit,
  };
};

function formatWithSubunit(formattedDineroObject: string, subunit: { symbol: string; subunit: string }) {
  return `${formattedDineroObject.replace(subunit.symbol, '').trimEnd()} ${subunit.subunit}`;
}

/**
 * Returns the subunit and symbol of the currency, as well as the subunit pluralized if necessary.
 *
 * @param {Currency} currency The currency.
 * @param {string} locale The locale to format the currency in.
 * @param {number} amount The amount to check.
 *
 * @returns {Object} The subunit and symbol of the currency, as well as the subunit pluralized if necessary.
 */
export const getFormattedCurrencySubunit = (
  currency: Currency,
  locale: string,
  amount: number,
): {
  symbol: string;
  subunit: string;
} => {
  const [language] = locale.split('-');
  const subunit = getCurrencySubunit(currency, locale, language);

  if (amount === 1) {
    return subunit;
  }

  return {
    ...subunit,
    subunit: `${subunit.subunit}${language !== 'de' ? 's' : ''}`,
  };
};

// /**
//  * Formats an integer amount, optionally with a currency into a formatted text string.
//  * If specified, a custom Dinero formatter can also be applied.
//  *
//  * @param params: { amount, currency, format }: amount - representing the integer/string amount, currency – a currency in the ISO code format, and format – a dinerojs format.
//  * @returns the formatted amount
//  */
export const formatAmount: AmountFormatter = ({ amount, currency, format, locale, enableSubunitDisplay }) => {
  let integerAmount = 0;

  try {
    integerAmount = +amount;
    if (isNaN(integerAmount)) {
      throw new Error(`NaN error, unable to cast ${amount} to number.`);
    }
  } catch (e) {
    integerAmount = 0;
    console.error(`formatAmount: expects an integer amount, received this instead "${amount}", fallbacks to zero.`, e);
  }

  const dAmount = dinero({
    amount: integerAmount,
    currency: currency || DEFAULT_CURRENCY,
    precision: DEFAULT_INTEGER_AMOUNT_PRECISION,
  });

  if (enableSubunitDisplay && shouldDisplayAmountAsCents(integerAmount, currency)) {
    const subunit = getFormattedCurrencySubunit(currency || DEFAULT_CURRENCY, locale || DEFAULT_LOCALE, integerAmount);

    return formatWithSubunit(
      dAmount
        .multiply(100)
        .convertPrecision(DEFAULT_INTEGER_AMOUNT_PRECISION)
        .setLocale(locale || DEFAULT_LOCALE)
        .toFormat(format || DEFAULT_SUBUNIT_FORMAT),
      subunit,
    );
  }

  return dAmount.setLocale(locale || DEFAULT_LOCALE).toFormat(format || DEFAULT_FORMAT);
};

/**
 * Gets the precision and format from a decimal amount (string)
 * @param {string} decimalAmount - The decimal amount to get the precision and format from
 */
function getPrecisionAndFormatFromStringAmount(
  decimalAmount: string,
  useRealPrecision: boolean,
  shouldDisplayAsCents: boolean,
) {
  if (useRealPrecision) {
    const [, decimalNumbers] = decimalAmount.split('.');

    const amountPrecision = getPrecisionFromDecimalNumbersLength(decimalNumbers, shouldDisplayAsCents);
    const precisionToFormat = '0'.repeat(amountPrecision);
    const amountFormat = DEFAULT_FORMAT.replace('.00', `.${precisionToFormat}`);

    return {
      amountPrecision,
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
export const formatAmountFromString: AmountFormatterFromString = ({
  decimalAmount,
  precision,
  currency,
  format,
  locale,
  useRealPrecision = false,
  enableSubunitDisplay = false,
}) => {
  /**
   * Decimal amounts can sometimes come in an invalid format, such as 1.000.000,00.
   * In an attempt to build some resiliency into our library, this function will parse the decimal amount to a valid format, such as 1000000.00.
   */
  const parsedDecimalAmount = parseDecimalValue(decimalAmount);

  const dineroObjectFromAmount = toDinero(parsedDecimalAmount, currency || DEFAULT_CURRENCY);
  const [onlyDecimalFromAmount, subunitFromAmount] = parsedDecimalAmount.split('.');
  const shouldDisplayAsCents = Number(onlyDecimalFromAmount) === 0 && dineroObjectFromAmount.hasSubUnits();
  const { amountPrecision, amountFormat } = getPrecisionAndFormatFromStringAmount(
    parsedDecimalAmount,
    useRealPrecision,
    enableSubunitDisplay && shouldDisplayAsCents,
  );

  if (enableSubunitDisplay && shouldDisplayAsCents) {
    const subunitInDecimals = Number(subunitFromAmount) / 100;

    const subunit = getFormattedCurrencySubunit(
      currency || DEFAULT_CURRENCY,
      locale || DEFAULT_LOCALE,
      subunitInDecimals,
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
 * Convert an amount decimal and currency into a dinero object.
 */
export const toDinero: DineroConvertor = (unitAmountDecimal, currency) => {
  const [amountInteger = '0', amountDecimal = '0'] = (unitAmountDecimal || '0').split('.');
  const truncatedDecimal = amountDecimal.substr(0, DECIMAL_PRECISION).padEnd(DECIMAL_PRECISION, '0');
  const unitAmountInteger = Number(`${amountInteger}${truncatedDecimal}`);

  return d(unitAmountInteger, currency);
};

/**
 * Converts a string decimal amount to an integer amount with 2 digits precision.
 *
 * @param decimalAmount a string decimal amount
 * @returns the decimal amount represent as an integer scaled to 2 decimal places precision.
 */
export const toIntegerAmount: (decimalAmount: string) => number = (decimalAmount) =>
  toDinero(decimalAmount).convertPrecision(DEFAULT_INTEGER_AMOUNT_PRECISION).getAmount();

/**
 * Utility mapper from Integer amount into DineroJS object using DECIMAL_PRECISION (12).
 */
export const d: (integerAmount: number, currency?: Currency) => dinero.Dinero = (integerAmount, currency) =>
  dinero({ amount: integerAmount, precision: DECIMAL_PRECISION, ...(currency && { currency }) });

/**
 * Formats built-in price units into a displayable representation. Eg. kw -> kW
 *
 * @returns {string} the formatted unit
 */
export const formatPriceUnit: FormatPriceUnit = (unit, hideGenericUnitLabel) => {
  if (!hideGenericUnitLabel && !unit?.trim()) {
    return unitDisplayLabels.none;
  }

  if (!isPriceBuiltInUnit(unit)) {
    return String(unit ?? '').trim();
  }

  return unitDisplayLabels[unit];
};

/**
 * Checks whether a price unit is a built-in unit or not.
 *
 * @param {Price['unit']} unit - the built-in unit code or user custom unit
 * @returns {boolean} true if the unit is a built-in unit
 */
export const isPriceBuiltInUnit = (unit: string): unit is Price['unit'] => {
  return unitDisplayLabels[unit] !== undefined;
};

export const unitDisplayLabels: Record<Price['unit'], string> & {
  none: typeof GENERIC_UNIT_DISPLAY_LABEL;
} = Object.freeze({
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
});

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
  const precision = decimalNumbers?.length;

  if (precision < 2) {
    return 2;
  }

  if (!shouldDisplayAsCents) {
    return precision || DEFAULT_INTEGER_AMOUNT_PRECISION;
  }

  if (precision > 2) {
    return precision - 2;
  }

  return precision;
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
