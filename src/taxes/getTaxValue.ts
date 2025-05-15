import type { Tax } from '@epilot/pricing-client';
import { TaxRates } from './constants';

export const getTaxValue = (tax?: Tax): number => {
  if (!tax) {
    return TaxRates.nontaxable;
  }

  if (Array.isArray(tax)) {
    return (Number(tax[0]?.rate) || 0) / 100;
  }

  return (Number(tax.rate) || 0) / 100;
};
