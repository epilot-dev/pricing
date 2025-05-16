import type { Dinero } from 'dinero.js';
import { toDinero } from '../money/toDinero';
import { getSafeQuantity } from '../shared/getSafeQuantity';
import type { Price, PriceInputMapping } from '../shared/types';
import { normalizeTimeFrequencyToDinero } from '../time-frequency/normalizers';
import type { TimeFrequency } from '../time-frequency/types';

/**
 * This function takes in a quantity, block mapping number, block mapping frequency, price, and parent quantity
 * and returns the normalized quantity. The block mapping number and block mapping frequency are used to
 * calculate the normalized quantity. The normalized quantity is the quantity multiplied by the block mapping
 * number and block mapping frequency. The block mapping number and block mapping frequency are converted to
 * dinero objects and then multiplied with the quantity. The normalized quantity is then multiplied by the
 * parent quantity and returned.
 *
 * @param blockMappingNumberInput - The block mapping number to be used to calculate the normalized quantity
 * @param blockMappingFrequencyInput - The block mapping frequency to be used to calculate the normalized quantity
 * @param price - The price to be used to calculate the normalized quantity
 * @returns The normalized quantity
 */
export const normalizePriceMappingInput = (priceMapping?: PriceInputMapping, price?: Price): Dinero | null => {
  if (!price || !priceMapping || (typeof priceMapping.value !== 'number' && !priceMapping.frequency_unit)) {
    return null;
  }

  const safeValue = getSafeQuantity(priceMapping.value);
  const isFrequencyUnitNormalizationNeeded = price.type !== 'one_time' && priceMapping.value;

  if (isFrequencyUnitNormalizationNeeded) {
    return normalizeTimeFrequencyToDinero(
      safeValue,
      priceMapping.frequency_unit as TimeFrequency,
      price.billing_period as TimeFrequency,
    );
  }

  return toDinero(String(safeValue));
};
