import * as libraryExports from './index';

const expectedNamedExports = [
  'DEFAULT_CURRENCY',
  'formatAmount',
  'formatAmountFromString',
  'formatPriceUnit',
  'isPriceBuiltInUnit',
  'parseDecimalValue',
  'toDinero',
  'toDineroFromInteger',
  'toIntegerAmount',
  'addSeparatorToDineroString',
  'getCurrencySymbol',
  'TaxRates',
  'DECIMAL_PRECISION',
  'GENERIC_UNIT_DISPLAY_LABEL',
  'BillingPeriods',
  'normalizePriceMappingInput',
  'normalizeTimeFrequency',
  'normalizeTimeFrequencyToDinero',
  'normalizeValueToFrequencyUnit',
  'timeFrequencyNormalizerMatrix',
  'TIME_FREQUENCY_NORMALIZATION_FACTORS',
  'PricingModel',
  'computeAggregatedAndPriceTotals',
  'computePriceComponent',
  'computePriceItemDetails',
  'computeQuantities',
  'extractPricingEntitiesBySlug',
  'isPriceItemApproved',
  'isRequiringApproval',
  'getRecurrencesWithEstimatedPrices',
  'computeCumulativeValue',
  'getDisplayTierByQuantity',
  'getDisplayTiersByQuantity',
  'getTierDescription',
  'isTaxInclusivePrice',
  'processOrderTableData',
];
/**
 * There are multiple MFEs, APIs and customers depending on niche exports of the pricing library.
 * After an export has been introduced, it cannot be removed with the certainty that the change won't create breaking changes.
 * This test adds a sanity check to ensure that no exports are accidentally removed.
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
