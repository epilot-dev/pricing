import dinero, { type Currency, type Dinero } from 'dinero.js';
import { DEFAULT_CURRENCY } from './constants';
import { DECIMAL_PRECISION } from './constants';

/**
 * Utility mapper from Integer amount into DineroJS object using DECIMAL_PRECISION (12).
 */
export const toDineroFromInteger: (integerAmount: number, currency?: Currency) => Dinero = (
  integerAmount,
  currency = 'EUR',
) => dinero({ amount: integerAmount, precision: DECIMAL_PRECISION, ...(currency && { currency }) });

/**
 * Convert an amount decimal and currency into a dinero object.
 */
export const toDinero = (unitAmountDecimal?: string, currency: Currency = DEFAULT_CURRENCY): Dinero => {
  const [amountInteger = '0', amountDecimal = '0'] = (unitAmountDecimal || '0').split('.');
  const truncatedDecimal = amountDecimal.substr(0, DECIMAL_PRECISION).padEnd(DECIMAL_PRECISION, '0');
  const unitAmountInteger = Number(`${amountInteger}${truncatedDecimal}`);

  return toDineroFromInteger(unitAmountInteger, currency);
};

export type DineroConvertor = typeof toDinero;
