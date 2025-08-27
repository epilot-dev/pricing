import type { Currency, TimeFrequency } from '@epilot/pricing';
import type { CompositePriceItem, PriceItem, Tax } from '@epilot/pricing-client';
import { formatPriceUnit } from '../../money/formatters';
import { isCompositePrice } from '../../prices/utils';
import type { I18n } from '../../shared/types';
import type { ExternalFeesMetadata, ExternalFeesTable } from '../types';
import { processExternalDisplayFeesTable } from './display-fees-table';
import { processMarkupsFeesTable } from './markup-fees-table';
import { processMeterFeesTable } from './meter-fees-table';
import { processNetworkOperatingFeesTable } from './network-fees-table';
import { processOtherFeesTable } from './other-fees-table';

export const processExternalFeesTable = (
  item: PriceItem | CompositePriceItem,
  externalFeesMetadata: ExternalFeesMetadata,
  currency: Currency,
  i18n: I18n,
  unit?: string,
) => {
  const unitPricePeriod: TimeFrequency = 'monthly';
  const billingPeriod = externalFeesMetadata.billing_period as TimeFrequency;

  // TODO: find a better way to get the tax
  let tax: Tax | undefined;

  if (isCompositePrice(item) && item._price?.price_components) {
    const componentWithTax = Array.isArray(item._price.price_components)
      ? item._price.price_components.find(
          (component) => component.tax && Array.isArray(component.tax) && component.tax.length > 0,
        )
      : undefined;
    if (componentWithTax && componentWithTax.tax && Array.isArray(componentWithTax.tax)) {
      tax = componentWithTax.tax[0];
    }
  } else if (item._price?.tax && Array.isArray(item._price.tax) && item._price.tax.length > 0) {
    tax = item._price.tax[0];
  }

  const taxRate = tax?.rate;

  const formattedUnit = formatPriceUnit(unit, true);

  const result: Partial<ExternalFeesTable> = {
    unit_price_period: i18n.t(`table_order.recurrences.billing_period.${unitPricePeriod}`),
    unit: formattedUnit,
    tax_behavior: taxRate ? i18n.t('table_order.incl_vat').replace('!!amount!!', taxRate.toString() + '%') : undefined,
  };

  processMarkupsFeesTable(
    result,
    item,
    externalFeesMetadata,
    currency,
    i18n,
    billingPeriod,
    unitPricePeriod,
    formattedUnit,
  );

  processNetworkOperatingFeesTable(
    result,
    externalFeesMetadata,
    currency,
    i18n,
    billingPeriod,
    unitPricePeriod,
    tax,
    formattedUnit,
  );

  processMeterFeesTable(
    result,
    externalFeesMetadata,
    currency,
    i18n,
    billingPeriod,
    unitPricePeriod,
    tax,
    formattedUnit,
  );

  processOtherFeesTable(
    result,
    externalFeesMetadata,
    currency,
    i18n,
    billingPeriod,
    unitPricePeriod,
    tax,
    formattedUnit,
  );

  processExternalDisplayFeesTable(result as ExternalFeesTable);

  return result;
};
