import { TimeFrequency } from '../types';

enum OperationType {
  MULTIPLY = 'multiply',
  DIVIDE = 'divide',
}

/**
 * A interface for a normalized time frequencies transformation matrix
 *
 * Eg. Output must be monthly, input was yearly
 *
 * `timeFrequencyNormalizerMatrix.yearly.monthly`
 * @deprecated Rely on TIME_FREQUENCY_NORMALIZATION_FACTORS
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
 * A normalized time frequencies transformation matrix
 *
 * See also {@link TimeFrequencyNormalizerMatrix}
 * @deprecated Rely on TIME_FREQUENCY_NORMALIZATION_FACTORS
 * @todo Remove in next major version
 */
export const timeFrequencyNormalizerMatrix: TimeFrequencyNormalizerMatrix = Object.freeze({
  yearly: {
    weekly: { action: OperationType.MULTIPLY, value: 52 },
    monthly: { action: OperationType.MULTIPLY, value: 12 },
    every_quarter: { action: OperationType.MULTIPLY, value: 4 },
    every_6_months: { action: OperationType.MULTIPLY, value: 2 },
    yearly: { action: OperationType.MULTIPLY, value: 1 },
  },
  every_6_months: {
    weekly: { action: OperationType.MULTIPLY, value: 26 },
    monthly: { action: OperationType.MULTIPLY, value: 6 },
    every_quarter: { action: OperationType.MULTIPLY, value: 2 },
    every_6_months: { action: OperationType.MULTIPLY, value: 1 },
    yearly: { action: OperationType.DIVIDE, value: 2 },
  },
  every_quarter: {
    weekly: { action: OperationType.MULTIPLY, value: 13 },
    monthly: { action: OperationType.MULTIPLY, value: 3 },
    every_quarter: { action: OperationType.MULTIPLY, value: 1 },
    every_6_months: { action: OperationType.DIVIDE, value: 2 },
    yearly: { action: OperationType.DIVIDE, value: 4 },
  },
  monthly: {
    weekly: { action: OperationType.MULTIPLY, value: 4 },
    monthly: { action: OperationType.MULTIPLY, value: 1 },
    every_quarter: { action: OperationType.DIVIDE, value: 3 },
    every_6_months: { action: OperationType.DIVIDE, value: 6 },
    yearly: { action: OperationType.DIVIDE, value: 12 },
  },
  weekly: {
    weekly: { action: OperationType.MULTIPLY, value: 1 },
    monthly: { action: OperationType.DIVIDE, value: 4 },
    every_quarter: { action: OperationType.DIVIDE, value: 13 },
    every_6_months: { action: OperationType.DIVIDE, value: 26 },
    yearly: { action: OperationType.DIVIDE, value: 52 },
  },
});

type NormalizationFactor = {
  [key in TimeFrequency]: number;
};

export const TIME_FREQUENCY_NORMALIZATION_FACTORS: NormalizationFactor = {
  yearly: 1,
  every_6_months: 2,
  every_quarter: 4,
  monthly: 12,
  weekly: 52,
};
