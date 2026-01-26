import { describe, expect, it } from 'vitest';
import * as libraryExports from './index';

const expectedNamedExports = [
  'DEFAULT_CURRENCY',
  'formatAmount',
  'formatAmountFromString',
  'formatPriceUnit',
  'parseDecimalValue',
  'toDinero',
  'toDineroFromInteger',
  'toIntegerAmount',
  'addSeparatorToDineroString',
  'getCurrencySymbol',
  'TaxRates',
  'GENERIC_UNIT_DISPLAY_LABEL',
  'BillingPeriods',
  'normalizeTimeFrequency',
  'normalizeValueToFrequencyUnit',
  'TIME_FREQUENCY_NORMALIZATION_FACTORS',
  'PricingModel',
  'computeAggregatedAndPriceTotals',
  'computeQuantities',
  'extractPricingEntitiesBySlug',
  'extractCouponsFromItem',
  'isPriceItemApproved',
  'isRequiringApproval',
  'getRecurrencesWithEstimatedPrices',
  'computeCumulativeValue',
  'getDisplayTierByQuantity',
  'getDisplayTiersByQuantity',
  'getTierDescription',
  'processOrderTableData',
  'formatFeeAmountFromString',
  'extractGetAgConfig',
  'getAmountWithTax',
  'getTaxValue',
];

/**
 * There are multiple MFEs, APIs and customers depending on niche exports of the pricing library.
 * After an export has been introduced, it cannot be removed with the certainty that the change won't create breaking changes.
 * This test adds a sanity check to ensure that no exports are accidentally removed.
 * If new library exports are added, they should be included in the expectedNamedExports array.
 */
describe('exports', () => {
  it.each(expectedNamedExports)('should export %s', (key) =>
    expect(libraryExports[key as keyof typeof libraryExports]).toBeDefined(),
  );

  it('should not export any other exports', () => {
    const namedExportsSet = new Set(expectedNamedExports);
    const missingExports = Object.keys(libraryExports).filter((key) => !namedExportsSet.has(key));
    expect(missingExports).toEqual([]);
  });
});
