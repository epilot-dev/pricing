import type { BillingPeriod } from '@epilot/pricing-client';
import type { NormalizationFactor } from './types';

/**
 * Normalization factors for each time frequency.
 * These factors represent the number of periods of each frequency in one year.
 */
export const TIME_FREQUENCY_NORMALIZATION_FACTORS: NormalizationFactor = {
  yearly: 1,
  every_6_months: 2,
  every_quarter: 4,
  monthly: 12,
  weekly: 52,
};
const BILLING_PERIODS: BillingPeriod[] = ['weekly', 'monthly', 'every_quarter', 'every_6_months', 'yearly'];

export const BillingPeriods = new Set(BILLING_PERIODS);
