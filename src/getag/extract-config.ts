import type { CompositePriceItem, PriceGetAg, PriceItem, TariffTypeGetAg } from '@epilot/pricing-client';

/**
 * Extracts the GetAg configuration from a price item.
 */
export const extractGetAgConfig = (
  item: PriceItem | CompositePriceItem,
  options:
    | {
        type: 'base_price';
      }
    | {
        type: 'work_price';
        tariffType: TariffTypeGetAg;
      },
) => {
  const { type } = options;
  const isWorkPrice = type === 'work_price';
  const targetTariffType = isWorkPrice ? options.tariffType : undefined;

  const matchesConfig = (getAgConfig: PriceGetAg | undefined) => {
    if (!getAgConfig || getAgConfig.type !== type) return false;

    if (!isWorkPrice) return true;

    return (getAgConfig.tariff_type ?? 'HT') === targetTariffType;
  };

  if (!item.is_composite_price && matchesConfig(item.get_ag)) {
    return item.get_ag;
  }

  if (item.is_composite_price && Array.isArray(item.item_components)) {
    const component = item.item_components.find((comp) => matchesConfig(comp.get_ag));

    return component?.get_ag;
  }

  return undefined;
};
