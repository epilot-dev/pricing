import type { Dinero } from 'dinero.js';

import { toDinero } from '../formatters';
import type { Price, PriceInputMapping, TimeFrequency } from '../types';

import { TIME_FREQUENCY_NORMALIZATION_FACTORS } from './constants';

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

  /**
   * @todo Remove non-nullish assertion and do instead
   * priceMapping.value === 'number' && isNaN(priceMapping.value) ? 1 : priceMapping.value;
   */
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
 * desired time frequency based on constant values defined here {@link TIME_FREQUENCY_NORMALIZATION_FACTORS}.
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
export const normalizeTimeFrequencyToDinero = (
  timeValue: number | string,
  timeValueFrequency: TimeFrequency,
  targetTimeFrequency: TimeFrequency,
): Dinero => {
  const dineroInputValue = toDinero(String(timeValue));

  return normalizeTimeFrequencyFromDineroInputValue(dineroInputValue, timeValueFrequency, targetTimeFrequency);
};

export const normalizeTimeFrequencyFromDineroInputValue = (
  dineroInputValue: Dinero,
  timeValueFrequency: TimeFrequency,
  targetTimeFrequency: TimeFrequency,
): Dinero => {
  const targetFactor = TIME_FREQUENCY_NORMALIZATION_FACTORS[targetTimeFrequency];
  const originFactor = TIME_FREQUENCY_NORMALIZATION_FACTORS[timeValueFrequency];

  if (!targetFactor || !originFactor) {
    return dineroInputValue;
  }

  const factor = targetFactor / originFactor;

  return factor > 1 ? dineroInputValue.multiply(factor) : dineroInputValue.divide(1 / factor);
};

/**
 * This function will normalize an inputted value of a specific time frequency to the
 * desired time frequency based on constant values defined here {@link TIME_FREQUENCY_NORMALIZATION_FACTORS}.
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
 * @deprecated The method will be removed in the next major version. Use normalizeValueToFrequencyUnit instead.
 * See also {@link TimeFrequency}
 */
export const normalizeTimeFrequency = (
  timeValue: number | string,
  timeValueFrequency: TimeFrequency,
  targetTimeFrequency: TimeFrequency,
  precision = 4,
): number => {
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

/**
 * This function will normalize an inputted value of a specific time frequency to the
 * desired time frequency based on constant values defined here {@link TIME_FREQUENCY_NORMALIZATION_FACTORS}.
 *
 * The default precision is set to 4 decimal places.
 *
 * @param {number} value the value that will be normalized
 * @param {TimeFrequency} timeValueFrequency the current time frequency of the value
 * @param {TimeFrequency} targetTimeFrequency the time frequency the value will be normalized to
 * @param {number} precision the precision of the normalized value
 *
 * @returns {number | string} normalized value
 * See also {@link TimeFrequency}
 */
export const normalizeValueToFrequencyUnit = (
  value: number | string,
  timeValueFrequency: TimeFrequency,
  targetTimeFrequency: TimeFrequency,
  precision?: number,
): number | string => {
  const safePrecision = precision ? precision : typeof value === 'number' ? 4 : 12;

  const normalizedValue = normalizeTimeFrequencyToDinero(
    value,
    timeValueFrequency?.toLowerCase() as TimeFrequency,
    targetTimeFrequency?.toLocaleLowerCase() as TimeFrequency,
  )
    .convertPrecision(safePrecision)
    .toUnit()
    .toString();

  return typeof value === 'string' ? normalizedValue : Number(normalizedValue);
};
