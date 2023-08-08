import DineroFactory from 'dinero.js';

import { toDinero } from '../formatters';
import {
  NormalizeTimeFrequency,
  NormalizeTimeFrequencyToDinero,
  Price,
  PriceInputMapping,
  TimeFrequency,
} from '../types';

import { OperationType, timeFrequencyNormalizerMatrix } from './constants';

export { TimeFrequencyNormalizerMatrix, timeFrequencyNormalizerMatrix } from './constants';

type NormalizePriceMappingInput = (priceMapping: PriceInputMapping, price: Price) => DineroFactory.Dinero | null;

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
export const normalizePriceMappingInput: NormalizePriceMappingInput = (priceMapping, price) => {
  if (!price || !priceMapping || (!priceMapping.value && !priceMapping.frequency_unit)) {
    return null;
  }

  const safeValue = isNaN(priceMapping.value!) ? 1 : priceMapping.value;
  const isFrequencyUnitNormalizationNeeded = price.type !== 'one_time' && priceMapping.value;

  if (isFrequencyUnitNormalizationNeeded) {
    return normalizeTimeFrequencyToDinero(
      safeValue!,
      priceMapping.frequency_unit as TimeFrequency,
      price.billing_period as TimeFrequency,
    );
  }

  return toDinero(String(safeValue));
};

/**
 * This function will normalize an inputted value of a specific time frequency to the
 * desired time frequency based on constant values defined here {@link timeFrequencyNormalizerMatrix}.
 *
 * The default dinerojs precision is set to 12 decimal places.
 *
 * @param {number} timeValue the value in time that will be normalized
 * @param {TimeFrequency} timeValueFrequency the current time frequency of the value
 * @param {TimeFrequency} targetTimeFrequency the time frequency the value will be normalized to
 *
 * @returns {Dinero} a DineroJS object representing the normalized frequency input
 *
 * See also {@link TimeFrequency}
 */
export const normalizeTimeFrequencyToDinero: NormalizeTimeFrequencyToDinero = (
  timeValue,
  timeValueFrequency,
  targetTimeFrequency,
) => {
  const dineroInputValue = toDinero(String(timeValue));

  if (
    !timeFrequencyNormalizerMatrix[targetTimeFrequency] ||
    !timeFrequencyNormalizerMatrix[targetTimeFrequency][timeValueFrequency]
  ) {
    return dineroInputValue;
  }

  const { action, value } = timeFrequencyNormalizerMatrix[targetTimeFrequency][timeValueFrequency];

  if (action === OperationType.MULTIPLY) {
    return dineroInputValue.multiply(value);
  } else if (action === OperationType.DIVIDE) {
    return dineroInputValue.divide(value);
  }

  return dineroInputValue;
};

/**
 * This function will normalize an inputted value of a specific time frequency to the
 * desired time frequency based on constant values defined here {@link timeFrequencyNormalizerMatrix}.
 *
 * The default precision is set to 4 decimal places.
 *
 * @param {number} timeValue the value in time that will be normalized
 * @param {TimeFrequency} timeValueFrequency the current time frequency of the value
 * @param {TimeFrequency} targetTimeFrequency the time frequency the value will be normalized to
 * @param {number} precision the precision of the normalized value
 *
 * @returns {number} normalizedFrequencyInput
 *
 * See also {@link TimeFrequency}
 */
export const normalizeTimeFrequency: NormalizeTimeFrequency = (
  timeValue,
  timeValueFrequency,
  targetTimeFrequency,
  precision = 4,
) => {
  const targetPrecision = typeof precision !== undefined && precision >= 0 ? precision : 4;

  return Number(
    normalizeTimeFrequencyToDinero(
      timeValue,
      timeValueFrequency?.toLowerCase() as TimeFrequency,
      targetTimeFrequency?.toLocaleLowerCase() as TimeFrequency,
    )
      .convertPrecision(targetPrecision)
      .toFormat('0.0000'),
  );
};
