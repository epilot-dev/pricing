import type { Currency } from 'dinero.js';

export const getCurrencySymbol = (currency: Currency, locale: string) => {
  return new Intl.NumberFormat(locale, { style: 'currency', currency })
    .formatToParts(1)
    .find((part) => part.type === 'currency')!.value;
};
