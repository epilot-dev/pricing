import type { Dinero } from 'dinero.js';
import { toDinero } from '../money/to-dinero';
import { TIME_FREQUENCY_NORMALIZATION_FACTORS } from './constants';
import type { TimeFrequency } from './types';

export const normalizeTimeFrequencyFromDineroInputValue = (
  dineroInputValue: Dinero,
  timeValueFrequency: TimeFrequency,
  targetTimeFrequency: TimeFrequency,
): Dinero => dineroInputValue.multiply(getTimeFrequencyConversionFactor(timeValueFrequency, targetTimeFrequency));

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

const getTimeFrequencyConversionFactor = (
  timeValueFrequency: TimeFrequency,
  targetTimeFrequency: TimeFrequency,
): number => {
  /**
   * There's a special case when frequencies are monthly/weekly,
   * in which case we want to work with 4 weeks in a month rather than the
   * mathematically correct 4.33 weeks in a month (52 / 12 = 4.33).
   */
  if (timeValueFrequency === 'monthly' && targetTimeFrequency === 'weekly') {
    return 1 / 4;
  } else if (timeValueFrequency === 'weekly' && targetTimeFrequency === 'monthly') {
    return 4;
  }

  const targetFactor = TIME_FREQUENCY_NORMALIZATION_FACTORS[targetTimeFrequency];
  const originFactor = TIME_FREQUENCY_NORMALIZATION_FACTORS[timeValueFrequency];

  if (!targetFactor || !originFactor) {
    return 1;
  }

  return originFactor / targetFactor;
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
  const targetPrecision = typeof precision !== 'undefined' && precision >= 0 ? precision : 4;

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
