import type { Currency } from '../shared/types';
import { normalizeValueToFrequencyUnit } from '../time-frequency/normalizers';
import type { TimeFrequency } from '../time-frequency/types';
import { DEFAULT_CURRENCY } from './constants';
import { toDinero } from './to-dinero';

/**
 * Converts a unit amount to a billing amount based on the quantity (e.g consumption)
 */
export const convertUnitAmountToBillingAmount = (
  unitAmountDecimal: string | undefined,
  quantity = 0,
  quantityPeriod: TimeFrequency,
  desiredBillingPeriod: TimeFrequency,
  precision: number = 12,
  currency: Currency = DEFAULT_CURRENCY,
): string | undefined => {
  if (!unitAmountDecimal || !quantity) {
    return undefined;
  }

  const dineroObjectFromUnitAmountDecimal = toDinero(unitAmountDecimal, currency);

  const total =
    precision !== 12
      ? dineroObjectFromUnitAmountDecimal.multiply(quantity).convertPrecision(precision).toUnit().toString()
      : dineroObjectFromUnitAmountDecimal.multiply(quantity).toUnit().toString();

  if (desiredBillingPeriod === quantityPeriod) {
    return total;
  }

  return normalizeValueToFrequencyUnit(total, quantityPeriod, desiredBillingPeriod, precision).toString();
};
