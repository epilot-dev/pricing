import type { Currency } from 'dinero.js';
import type { Tax } from '../../shared/types';
import type { I18n } from '../../shared/types';
import type { TimeFrequency } from '../../time-frequency/types';
import type { ExternalFeesMetadata, ExternalFeesTable, ExternalFeesTableGroup } from '../types';
import { getTableFee } from './utils';

export const processMeterFeesTable = (
  result: Partial<ExternalFeesTable> = {},
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
      maintenance_fee: getTableFee(
        externalFeesMetadata.breakdown.static?.['maintenance_fee'],
        i18n.t(`table_order.getag_details_table.groups.meter_costs.fees.maintenance_fee`),
        currency,
        i18n,
        billingPeriod,
        unitPricePeriod,
        tax,
        variableUnit,
      ),
      metering_reading_fee: getTableFee(
        externalFeesMetadata.breakdown.static?.['metering_reading_fee'],
        i18n.t(`table_order.getag_details_table.groups.meter_costs.fees.metering_reading_fee`),
        currency,
        i18n,
        billingPeriod,
        unitPricePeriod,
        tax,
        variableUnit,
      ),
    } as ExternalFeesTableGroup['fees'],
  } as ExternalFeesTableGroup;

  return result;
};
