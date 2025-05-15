import { OperationType } from './constants';
import { BillingPeriod } from '../types';

export type TimeFrequency = Exclude<BillingPeriod, 'one_time'>;

/**
 * An interface for a normalized time frequencies transformation matrix
 * Eg. Output must be monthly, input was yearly
 * `timeFrequencyNormalizerMatrix.yearly.monthly`
 * @deprecated Rely on TIME_FREQUENCY_NORMALIZATION_FACTORS
 * @todo Remove in next major version
 */
export type TimeFrequencyNormalizerMatrix = {
  [outputFrequency in TimeFrequency]: {
    [inputFrequency in TimeFrequency]: {
      action: OperationType.MULTIPLY | OperationType.DIVIDE;
      value: number;
    };
  };
};

/**
 * Normalization factors for each time frequency.
 * These factors represent the number of periods of each frequency in one year.
 */
export type NormalizationFactor = {
  [key in TimeFrequency]: number;
};
