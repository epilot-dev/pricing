import type { BillingPeriod } from '../shared/types';

export type TimeFrequency = Exclude<BillingPeriod, 'one_time'>;

/**
 * Normalization factors for each time frequency.
 * These factors represent the number of periods of each frequency in one year.
 */
export type NormalizationFactor = {
  [key in TimeFrequency]: number;
};
