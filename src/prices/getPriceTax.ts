import type { Tax, Price, TaxAmountDto } from '../shared/types';

/**
 * Gets a price tax with the proper tax behavior override
 */
export const getPriceTax = (applicableTax?: Tax, price?: Price, priceItemTaxes?: TaxAmountDto[]): Tax | undefined => {
  if (applicableTax) {
    return applicableTax;
  }

  if (Array.isArray(priceItemTaxes) && priceItemTaxes.length > 0) {
    return priceItemTaxes[0].tax;
  }

  const isNonTaxable = applicableTax === null;
  const existingPriceTax = Array.isArray(price?.tax) && price!.tax[0];

  if (!isNonTaxable && existingPriceTax) {
    return existingPriceTax;
  }

  return applicableTax;
};
