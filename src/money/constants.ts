import { CurrencySubunitMap } from './types';

export const CURRENCIES_SUBUNITS: CurrencySubunitMap = {
  EUR: {
    de: 'Cent',
    default: 'cent',
  },
  USD: {
    de: 'Cent',
    default: 'cent',
  },
  CHF: {
    de: 'Centime',
    default: 'centime',
  },
};
export const DEFAULT_CURRENCY = 'EUR';
export const DEFAULT_SUBUNIT = CURRENCIES_SUBUNITS[DEFAULT_CURRENCY];
export const DECIMAL_PRECISION = 12;
export const DEFAULT_INTEGER_AMOUNT_PRECISION = 2;
export const MAX_SUPPORTED_FORMAT_PRECISION = 6;
export const DEFAULT_FORMAT = '$0,0.00';
export const DEFAULT_SUBUNIT_FORMAT = '$0,0';
export const DEFAULT_LOCALE = 'de';
export const GENERIC_UNIT_DISPLAY_LABEL = 'unit';
