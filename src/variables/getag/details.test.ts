import type { PriceItem } from '@epilot/sdk/pricing';
import { describe, expect, it } from 'vitest';
import type { Currency, I18n } from '../../shared/types';
import type { ExternalFeesMetadata } from '../types';
import { processExternalFeesDetails } from './details';

const i18n: I18n = {
  t: ((key: string) => key) as never,
  language: 'en',
};

/**
 * Regression for a production crash in template-variables (`replaceTemplates`):
 * `TypeError: Cannot read properties of undefined (reading 'consumptionHT')`.
 *
 * `external_fees_metadata.inputs` is only attached by the journey app. Orders created
 * through the 360 cockpit, the public API, or journeys before the inputs were introduced
 * carry the raw getag compute result without it.
 */
describe('processExternalFeesDetails', () => {
  const item = {
    _id: 'item-1',
    price_id: 'price-1',
    quantity: 1,
    currency: 'EUR',
    pricing_model: 'external_getag',
    get_ag: {
      category: 'power',
      type: 'work_price',
      tariff_type: 'HT',
      markup_amount: 10,
      markup_amount_decimal: '0.10',
      markup_amount_gross_decimal: '0.10',
      unit_amount_gross: 30,
      unit_amount_net: 25,
      additional_markups_enabled: true,
      additional_markups: {
        procurement: { amount: 5, amount_decimal: '0.05', amount_gross_decimal: '0.05' },
      },
    },
  } as unknown as PriceItem;

  const metadataWithoutInputs: ExternalFeesMetadata = {
    billing_period: 'monthly',
    breakdown: {
      static: { basic_fee: { amount: 500, amount_decimal: '5.00' } },
      variable: { concession: { amount: 1, amount_decimal: '0.01', unit_amount: 1, unit_amount_decimal: '0.01' } },
      variable_ht: {},
    },
  } as ExternalFeesMetadata;

  it('does not throw when external_fees_metadata has no inputs', () => {
    expect(() => processExternalFeesDetails(item, metadataWithoutInputs, 'EUR' as Currency, i18n, 'kWh')).not.toThrow();
  });

  it('renders consumption-based yearly amounts as "-" and still builds every fee group', () => {
    const result = processExternalFeesDetails(item, metadataWithoutInputs, 'EUR' as Currency, i18n, 'kWh');

    expect(Object.keys(result.groups ?? {})).toEqual(
      expect.arrayContaining(['sales_and_procurement_costs', 'network_operating_fees', 'other_fees']),
    );

    const markups = result.groups?.['sales_and_procurement_costs'].fees as Record<
      string,
      { amount: string; amount_yearly: string }
    >;

    expect(markups.markup_work_price).toMatchObject({ amount: '10.00 cents/kWh', amount_yearly: '-' });
    expect(markups.markup_procurement).toMatchObject({ amount: '5.00 cents/kWh', amount_yearly: '-' });
  });

  it('falls back to the power fee set when inputs.type is missing', () => {
    const result = processExternalFeesDetails(item, metadataWithoutInputs, 'EUR' as Currency, i18n, 'kWh');

    expect(result.groups?.['other_fees'].fees).toHaveProperty('concession');
    expect(result.groups?.['other_fees'].fees).not.toHaveProperty('gas_tax');
  });
});
