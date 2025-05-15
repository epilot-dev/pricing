import { Currency } from 'dinero.js';

type CurrencySubunit = {
  default: string;
  [language: string]: string;
};

export type CurrencySubunitMap = {
  [key in Currency]?: CurrencySubunit;
} & {
  [key in 'EUR' | 'USD' | 'CHF']: CurrencySubunit;
};
