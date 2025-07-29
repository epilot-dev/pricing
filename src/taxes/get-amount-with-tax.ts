import { toDinero } from '../money/to-dinero';

/**
 * Returns the amount with tax.
 */
export const getAmountWithTax = (amountDecimal: string | undefined, taxRate: number = 0) => {
  if (!amountDecimal) {
    return amountDecimal;
  }

  return toDinero(amountDecimal)
    .multiply(1 + taxRate)
    .toUnit()
    .toString();
};
