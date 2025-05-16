import type { Tax } from '@epilot/pricing-client';
import type { Currency, Dinero } from 'dinero.js';
import { toDinero } from '../money/to-dinero';
import type { PriceItemsTotals } from '../prices/types';
import { getTaxValue } from '../taxes/get-tax-value';

export const computePerUnitPriceItemValues = ({
  unitAmountDecimal,
  currency,
  isTaxInclusive,
  unitAmountMultiplier,
  tax,
}: {
  unitAmountDecimal?: string;
  currency: Currency;
  isTaxInclusive: boolean;
  unitAmountMultiplier: number;
  tax?: Tax;
}): PriceItemsTotals => {
  const unitAmount = toDinero(unitAmountDecimal, currency);
  const taxRate = getTaxValue(tax);

  let unitAmountNet: Dinero;
  let unitTaxAmount: Dinero;

  if (isTaxInclusive) {
    unitAmountNet = unitAmount.divide(1 + taxRate);
    unitTaxAmount = unitAmount.subtract(unitAmountNet);
  } else {
    unitAmountNet = unitAmount;
    unitTaxAmount = unitAmount.multiply(taxRate);
  }

  const unitAmountGross = unitAmountNet.add(unitTaxAmount);
  const taxAmount = unitTaxAmount.multiply(unitAmountMultiplier);
  const amountSubtotal = unitAmountNet.multiply(unitAmountMultiplier);
  const amountTotal = unitAmountGross.multiply(unitAmountMultiplier);

  return {
    unit_amount: unitAmount.getAmount(),
    unit_amount_net: unitAmountNet.getAmount(),
    unit_amount_gross: unitAmountGross.getAmount(),
    amount_subtotal: amountSubtotal.getAmount(),
    amount_total: amountTotal.getAmount(),
    amount_tax: taxAmount.getAmount(),
  };
};
