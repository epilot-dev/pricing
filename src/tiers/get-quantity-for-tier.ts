import { DEFAULT_CURRENCY } from '../money/constants';
import { toDinero } from '../money/to-dinero';

/**
 * Gets the quantity for a specific tier.
 * @param min The minimum quantity for the tier.
 * @param max The maximum quantity for the tier.
 * @param quantity The normalized quantity.
 * @returns The quantity to be considered for the tier totals computation.
 */

export const getQuantityForTier = ({ min, max, quantity }: { min?: number; max: number; quantity: number }) => {
  if (typeof min !== 'number' || isNaN(min)) {
    throw new Error('Tier min quantity must be a number');
  }

  if (typeof max !== 'number' || isNaN(max)) {
    throw new Error('Tier max quantity must be a number');
  }

  if (min >= max) {
    throw new Error('Tier min quantity must be less than tier max quantity');
  }

  if (quantity < min) {
    throw new Error('Normalized quantity must be greater than tier min quantity');
  }

  if (quantity >= max) {
    return toDinero(max.toString(), DEFAULT_CURRENCY).subtract(toDinero(min.toString(), DEFAULT_CURRENCY)).toUnit();
  }

  return toDinero(quantity.toString(), DEFAULT_CURRENCY).subtract(toDinero(min.toString(), DEFAULT_CURRENCY)).toUnit();
};
