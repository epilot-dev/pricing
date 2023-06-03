import { Currency } from 'dinero.js';

export const CURRENCIES_SUBUNITS: {
  [key in Currency]?: { subunit: { [language: string]: string } };
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
