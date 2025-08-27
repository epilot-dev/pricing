import type { Currency } from 'dinero.js';
import type { Tax } from '../../shared/types';
import type { I18n } from '../../shared/types';
import type { TimeFrequency } from '../../time-frequency/types';
import type { ExternalFeesMetadata, ExternalFeesDetails, ExternalFeesDetailsGroup } from '../types';
import { getDetailsFee } from './utils';

export const processMeterFeesDetails = (
  result: Partial<ExternalFeesDetails> = {},
  externalFeesMetadata: ExternalFeesMetadata,
  currency: Currency,
  i18n: I18n,
  billingPeriod: TimeFrequency,
  unitPricePeriod: TimeFrequency,
  tax?: Tax,
  variableUnit?: string,
) => {
  if (!result.groups) {
    result.groups = {};
  }

  result.groups['meter_costs'] = {
    label: i18n.t(`table_order.getag_details_table.groups.meter_costs.title`),
    fees: {
      maintenance_fee: getDetailsFee({
        fee: externalFeesMetadata.breakdown.static?.['maintenance_fee'],
        label: i18n.t(`table_order.getag_details_table.groups.meter_costs.fees.maintenance_fee`),
        currency,
        i18n,
        billingPeriod,
        unitPricePeriod,
        tax,
        variableUnit,
      }),
      metering_reading_fee: getDetailsFee({
        fee: externalFeesMetadata.breakdown.static?.['metering_reading_fee'],
        label: i18n.t(`table_order.getag_details_table.groups.meter_costs.fees.metering_reading_fee`),
        currency,
        i18n,
        billingPeriod,
        unitPricePeriod,
        tax,
        variableUnit,
      }),
    } as ExternalFeesDetailsGroup['fees'],
  } as ExternalFeesDetailsGroup;

  return result;
};
