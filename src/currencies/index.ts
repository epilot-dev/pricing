import type { Currency } from 'dinero.js';

type CurrencySubunit = {
  default: string;
  [language: string]: string;
};

export const CURRENCIES_SUBUNITS: {
  [key in Currency]?: CurrencySubunit;
} & {
  [key in 'EUR' | 'USD' | 'CHF']: CurrencySubunit;
} = {
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
