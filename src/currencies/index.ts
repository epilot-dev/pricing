import { Currency } from 'dinero.js';

type CurrencySubunit = {
  subunit: {
    default: string;
    [language: string]: string;
  };
};

export const CURRENCIES_SUBUNITS: {
  [key in Currency]?: CurrencySubunit;
} & {
  [key in 'EUR' | 'USD' | 'CHF']: CurrencySubunit;
} = Object.freeze({
  EUR: {
    subunit: {
      de: 'Cent',
      default: 'cent',
    },
  },
  USD: {
    subunit: {
      de: 'Cent',
      default: 'cent',
    },
  },
  CHF: {
    subunit: {
      de: 'Centime',
      default: 'centime',
    },
  },
});

export const DEFAULT_CURRENCY = 'EUR';
export const DEFAULT_SUBUNIT = CURRENCIES_SUBUNITS[DEFAULT_CURRENCY].subunit;
