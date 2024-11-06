export const DECIMAL_PRECISION = 12;
export const DEFAULT_INTEGER_AMOUNT_PRECISION = 2;
export const MAX_SUPPORTED_FORMAT_PRECISION = 6;
export const DEFAULT_FORMAT = '$0,0.00';
export const DEFAULT_SUBUNIT_FORMAT = '$0,0';
export const DEFAULT_LOCALE = 'de';
export const GENERIC_UNIT_DISPLAY_LABEL = 'unit';

export const BillingPeriods = new Set(['weekly', 'monthly', 'every_quarter', 'every_6_months', 'yearly'] as const);

export const TaxRates = Object.freeze({
  standard: 0.19,
  reduced: 0.07,
  nontaxable: 0,
});
