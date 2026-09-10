import type { CompositePriceItem, PriceItem } from '@epilot/sdk/pricing';
import { isCompositePrice } from '../../prices/utils';
import type { ExternalFeesMetadata } from '../types';

export type ExternalFeesType = 'power' | 'gas';

const isExternalFeesType = (value: unknown): value is ExternalFeesType => value === 'power' || value === 'gas';

/**
 * Read `category` directly rather than through `extractGetAgConfig`, which matches on the optional
 * `get_ag.type`. Components of a composite getag price all share the category, so the first wins.
 */
const resolveTypeFromPriceConfig = (item: PriceItem | CompositePriceItem): ExternalFeesType | undefined => {
  const categories = isCompositePrice(item)
    ? (item.item_components ?? []).map((component) => component.get_ag?.category)
    : [item.get_ag?.category];

  return categories.find(isExternalFeesType);
};

/**
 * Resolves whether getag fee metadata describes a power or a gas tariff.
 *
 * Only the journey app attaches `inputs.type`; API submissions carry the raw compute result without
 * it. The price's getag category is the same value the journey sends to getag (`type = category`),
 * so it decides — even when the attached breakdown looks like the other commodity.
 */
export const resolveExternalFeesType = (
  externalFeesMetadata: ExternalFeesMetadata,
  item: PriceItem | CompositePriceItem,
): ExternalFeesType => {
  const declaredType = externalFeesMetadata.inputs?.type;

  if (isExternalFeesType(declaredType)) {
    return declaredType;
  }

  return resolveTypeFromPriceConfig(item) ?? 'power';
};
