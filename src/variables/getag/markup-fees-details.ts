import { extractGetAgConfig } from '../../getag/extract-config';
import type { CompositePriceItem, Currency, I18n, PriceItem } from '../../shared/types';
import type { TimeFrequency } from '../../time-frequency/types';
import type { ExternalFeesMetadata, ExternalFeesDetails, ExternalFeesDetailsGroup } from '../types';
import { getMarkupDetailsFee } from './utils';

export const processMarkupsFeesDetails = (
  result: Partial<ExternalFeesDetails> = {},
  item: PriceItem | CompositePriceItem,
  externalFeesMetadata: ExternalFeesMetadata,
  currency: Currency,
  i18n: I18n,
  billingPeriod: TimeFrequency,
  unitPricePeriod: TimeFrequency,
  variableUnit?: string,
) => {
  const basePrice = extractGetAgConfig(item, { type: 'base_price' });
  const workPrice = extractGetAgConfig(item, { type: 'work_price', tariffType: 'HT' });
  const workPriceNT = extractGetAgConfig(item, { type: 'work_price', tariffType: 'NT' });

  const markupBasePrice = getMarkupDetailsFee({
    priceGetAgConfig: basePrice,
    externalFeesMetadata,
    options: { type: 'base_price' },
    currency,
    i18n,
    billingPeriod,
    unitPricePeriod,
    variableUnit,
  });

  const markupWorkPrice = getMarkupDetailsFee({
    priceGetAgConfig: workPrice,
    externalFeesMetadata,
    options: { type: 'work_price', tariffType: 'HT' },
    currency,
    i18n,
    billingPeriod,
    unitPricePeriod,
    variableUnit,
  });

  const markupWorkPriceNT = getMarkupDetailsFee({
    priceGetAgConfig: workPriceNT,
    externalFeesMetadata,
    options: { type: 'work_price', tariffType: 'NT' },
    currency,
    i18n,
    billingPeriod,
    unitPricePeriod,
    variableUnit,
  });

  const procurementMarkup = getMarkupDetailsFee({
    priceGetAgConfig: workPrice,
    externalFeesMetadata,
    options: { type: 'additional_markup', tariffType: 'HT', key: 'procurement' },
    currency,
    i18n,
    billingPeriod,
    unitPricePeriod,
    variableUnit,
  });

  const procurementMarkupNT = getMarkupDetailsFee({
    priceGetAgConfig: workPriceNT,
    externalFeesMetadata,
    options: { type: 'additional_markup', tariffType: 'NT', key: 'procurement' },
    currency,
    i18n,
    billingPeriod,
    unitPricePeriod,
    variableUnit,
  });

  const hasHTandNT = markupWorkPrice && markupWorkPriceNT;
  const hasAdditionalMarkups = workPrice?.additional_markups_enabled || workPriceNT?.additional_markups_enabled;

  if (!result.groups) {
    result.groups = {};
  }

  result.groups['sales_and_procurement_costs'] = {
    label: i18n.t(
      `table_order.getag_details_table.groups.sales_and_procurement_costs.title${
        workPrice?.additional_markups_enabled || workPriceNT?.additional_markups_enabled ? '_with_energy' : ''
      }`,
    ),
    fees: {
      markup_base_price: markupBasePrice,
      ...(hasHTandNT
        ? {
            markup_work_price: { ...markupWorkPrice, label: `${markupWorkPrice.label} (HT)` },
            markup_work_price_nt: { ...markupWorkPriceNT, label: `${markupWorkPriceNT.label} (NT)` },
            ...(procurementMarkup && {
              markup_procurement: { ...procurementMarkup, label: `${procurementMarkup.label} (HT)` },
            }),
            ...(procurementMarkupNT && {
              markup_procurement_nt: { ...procurementMarkupNT, label: `${procurementMarkupNT.label} (NT)` },
            }),
          }
        : {
            markup_work_price: markupWorkPrice || markupWorkPriceNT,
            ...(hasAdditionalMarkups && { markup_procurement: procurementMarkup || procurementMarkupNT }),
          }),
    } as ExternalFeesDetailsGroup['fees'],
  } as ExternalFeesDetailsGroup;

  return result;
};
