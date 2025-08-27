import type { CompositePriceItem, PriceItem, Tax } from '@epilot/pricing-client';
import { isCompositePriceItem } from '../prices/utils';

export const extractTaxFromPriceItem = (item: PriceItem | CompositePriceItem) => {
  let tax: Tax | undefined = undefined;

  if (
    isCompositePriceItem(item) &&
    item.item_components &&
    Array.isArray(item.item_components) &&
    item.item_components.length > 0
  ) {
    tax = item.item_components.find(
      (component) =>
        component.taxes && Array.isArray(component.taxes) && component.taxes.length > 0 && component.taxes[0].tax,
    )?.taxes?.[0]?.tax;

    if (tax) {
      return tax;
    }
  } else if (item.taxes && Array.isArray(item.taxes) && item.taxes.length > 0 && item.taxes[0].tax) {
    tax = item.taxes?.[0]?.tax;
  }

  return tax;
};
