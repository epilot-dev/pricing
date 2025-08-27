import type { Currency, I18n, Tax } from '../../shared/types';
import type { TimeFrequency } from '../../time-frequency/types';
import type { ExternalFeesMetadata, ExternalFeesDetails, ExternalFeesDetailsGroup } from '../types';
import { getDetailsFee } from './utils';

export const processNetworkOperatingFeesDetails = (
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

  result.groups['network_operating_fees'] = {
    label: i18n.t(`table_order.getag_details_table.groups.network_operating_fees.title`),
    fees: {
      network_operating_fee_base: getDetailsFee({
        fee: externalFeesMetadata.breakdown.static?.['basic_fee'],
        label: i18n.t(`table_order.getag_details_table.groups.network_operating_fees.fees.network_operating_fee_base`),
        currency,
        i18n,
        billingPeriod,
        unitPricePeriod,
        tax,
        variableUnit,
      }),
      ...(externalFeesMetadata.breakdown.variable?.['power_kwh_ht'] &&
      externalFeesMetadata.breakdown.variable?.['power_kwh_nt'] &&
      type === 'power'
        ? {
            network_operating_fee_work: getDetailsFee({
              fee: externalFeesMetadata.breakdown.variable?.['power_kwh_ht'],
              label:
                i18n.t(
                  `table_order.getag_details_table.groups.network_operating_fees.fees.network_operating_fee_work`,
                ) + ' (HT)',
              currency,
              i18n,
              billingPeriod,
              unitPricePeriod,
              tax,
              variableUnit,
            }),
            network_operating_fee_work_nt: getDetailsFee({
              fee: externalFeesMetadata.breakdown.variable?.['power_kwh_nt'],
              label:
                i18n.t(
                  `table_order.getag_details_table.groups.network_operating_fees.fees.network_operating_fee_work`,
                ) + ' (NT)',
              currency,
              i18n,
              billingPeriod,
              unitPricePeriod,
              tax,
              variableUnit,
            }),
          }
        : type === 'power'
          ? {
              network_operating_fee_work: getDetailsFee({
                fee:
                  externalFeesMetadata.breakdown.variable?.['power_kwh_ht'] ||
                  externalFeesMetadata.breakdown.variable?.['power_kwh_nt'],
                label: i18n.t(
                  `table_order.getag_details_table.groups.network_operating_fees.fees.network_operating_fee_work`,
                ),
                currency,
                i18n,
                billingPeriod,
                unitPricePeriod,
                tax,
                variableUnit,
              }),
            }
          : {
              network_operating_fee_work: getDetailsFee({
                fee: externalFeesMetadata.breakdown.variable?.['grid_fee'],
                label: i18n.t(
                  `table_order.getag_details_table.groups.network_operating_fees.fees.network_operating_fee_work`,
                ),
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
