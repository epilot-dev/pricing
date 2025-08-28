import type { Currency, TimeFrequency } from '@epilot/pricing';
import type { CompositePriceItem, PriceItem } from '@epilot/pricing-client';
import { formatPriceUnit } from '../../money/formatters';
import type { I18n } from '../../shared/types';
import { extractTaxFromPriceItem } from '../../taxes/extract-tax-from-price';
import type { ExternalFeesMetadata, ExternalFeesDetails } from '../types';
import { processExternalDisplayFeesDetails } from './display-fees-details';
import { processMarkupsFeesDetails } from './markup-fees-details';
import { processMeterFeesDetails } from './meter-fees-details';
import { processNetworkOperatingFeesDetails } from './network-fees-details';
import { processOtherFeesDetails } from './other-fees-details';

export const processExternalFeesDetails = (
  item: PriceItem | CompositePriceItem,
  externalFeesMetadata: ExternalFeesMetadata,
  currency: Currency,
  i18n: I18n,
  unit?: string,
) => {
  const unitPricePeriod: TimeFrequency = 'monthly';
  const billingPeriod = externalFeesMetadata.billing_period as TimeFrequency;
  const tax = extractTaxFromPriceItem(item);
  const taxRate = tax?.rate;
  const formattedUnit = formatPriceUnit(unit, true);

  const result: Partial<ExternalFeesDetails> = {
    unit_price_period: i18n.t(`table_order.recurrences.billing_period.${unitPricePeriod}`),
    unit: formattedUnit,
    tax_behavior: taxRate ? i18n.t('table_order.incl_vat').replace('!!amount!!', taxRate.toString() + '%') : undefined,
    headers: {
      unit_price: i18n.t('table_order.getag_details_table.price_unit'),
      yearly_price: i18n.t('table_order.getag_details_table.price_yearly'),
    },
  };

  processMarkupsFeesDetails(
    result,
    item,
    externalFeesMetadata,
    currency,
    i18n,
    billingPeriod,
    unitPricePeriod,
    formattedUnit,
  );

  processNetworkOperatingFeesDetails(
    result,
    externalFeesMetadata,
    currency,
    i18n,
    billingPeriod,
    unitPricePeriod,
    tax,
    formattedUnit,
  );

  processMeterFeesDetails(
    result,
    externalFeesMetadata,
    currency,
    i18n,
    billingPeriod,
    unitPricePeriod,
    tax,
    formattedUnit,
  );

  processOtherFeesDetails(
    result,
    externalFeesMetadata,
    currency,
    i18n,
    billingPeriod,
    unitPricePeriod,
    tax,
    formattedUnit,
  );

  processExternalDisplayFeesDetails(result as ExternalFeesDetails);

  return result;
};
