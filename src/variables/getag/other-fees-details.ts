import type { Currency } from 'dinero.js';
import type { Tax } from '../../shared/types';
import type { I18n } from '../../shared/types';
import type { TimeFrequency } from '../../time-frequency/types';
import type { ExternalFeesMetadata, ExternalFeesDetails, ExternalFeesDetailsGroup } from '../types';
import { getDetailsFee } from './utils';

export const processOtherFeesDetails = (
  result: Partial<ExternalFeesDetails> = {},
  externalFeesMetadata: ExternalFeesMetadata,
  currency: Currency,
  i18n: I18n,
  billingPeriod: TimeFrequency,
  unitPricePeriod: TimeFrequency,
  tax?: Tax,
  variableUnit?: string,
) => {
  const type = externalFeesMetadata.inputs.type || 'power';

  if (!result.groups) {
    result.groups = {};
  }

  result.groups['other_fees'] = {
    label: i18n.t(`table_order.getag_details_table.groups.other_fees.title`),
    fees: {
      concession: getDetailsFee({
        fee: externalFeesMetadata.breakdown.variable?.['concession'],
        label: i18n.t(`table_order.getag_details_table.groups.other_fees.fees.concession`),
        currency,
        i18n,
        billingPeriod,
        unitPricePeriod,
        tax,
        variableUnit,
      }),
      ...(type === 'power'
        ? {
            chp: getDetailsFee({
              fee: externalFeesMetadata.breakdown.variable?.['chp'],
              label: i18n.t(`table_order.getag_details_table.groups.other_fees.fees.chp`),
              currency,
              i18n,
              billingPeriod,
              unitPricePeriod,
              tax,
              variableUnit,
            }),
            extra_charge: getDetailsFee({
              fee: externalFeesMetadata.breakdown.variable?.['extra_charge'],
              label: i18n.t(`table_order.getag_details_table.groups.other_fees.fees.extra_charge`),
              currency,
              i18n,
              billingPeriod,
              unitPricePeriod,
              tax,
              variableUnit,
            }),
            offshore_liability_fee: getDetailsFee({
              fee: externalFeesMetadata.breakdown.variable?.['offshore_liability_fee'],
              label: i18n.t(`table_order.getag_details_table.groups.other_fees.fees.offshore_liability_fee`),
              currency,
              i18n,
              billingPeriod,
              unitPricePeriod,
              tax,
              variableUnit,
            }),
            power_tax: getDetailsFee({
              fee: externalFeesMetadata.breakdown.variable?.['power_tax'],
              label: i18n.t(`table_order.getag_details_table.groups.other_fees.fees.power_tax`),
              currency,
              i18n,
              billingPeriod,
              unitPricePeriod,
              tax,
              variableUnit,
            }),
          }
        : {
            neutrality_charge: getDetailsFee({
              fee: externalFeesMetadata.breakdown.variable?.['neutrality_charge'],
              label: i18n.t(`table_order.getag_details_table.groups.other_fees.fees.neutrality_charge`),
              currency,
              i18n,
              billingPeriod,
              unitPricePeriod,
              tax,
              variableUnit,
            }),
            gas_storage: getDetailsFee({
              fee: externalFeesMetadata.breakdown.variable?.['gas_storage'],
              label: i18n.t(`table_order.getag_details_table.groups.other_fees.fees.gas_storage`),
              currency,
              i18n,
              billingPeriod,
              unitPricePeriod,
              tax,
              variableUnit,
            }),
            gas_conversion_charge: getDetailsFee({
              fee: externalFeesMetadata.breakdown.variable?.['gas_conversion_charge'],
              label: i18n.t(`table_order.getag_details_table.groups.other_fees.fees.gas_conversion_charge`),
              currency,
              i18n,
              billingPeriod,
              unitPricePeriod,
              tax,
              variableUnit,
            }),
            gas_tax: getDetailsFee({
              fee: externalFeesMetadata.breakdown.variable?.['gas_tax'],
              label: i18n.t(`table_order.getag_details_table.groups.other_fees.fees.gas_tax`),
              currency,
              i18n,
              billingPeriod,
              unitPricePeriod,
              tax,
              variableUnit,
            }),
            co2: getDetailsFee({
              fee: externalFeesMetadata.breakdown.variable?.['co2'],
              label: i18n.t(`table_order.getag_details_table.groups.other_fees.fees.co2`),
              currency,
              i18n,
              billingPeriod,
              unitPricePeriod,
              tax,
              variableUnit,
            }),
          }),
    } as ExternalFeesDetailsGroup['fees'],
  } as ExternalFeesDetailsGroup;

  return result;
};
