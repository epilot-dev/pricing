import type { PriceItems } from '../types';
import { isCompositePriceItem } from './isCompositePriceItem';

export const getRecurrencesWithEstimatedPrices = (lineItems: PriceItems | undefined) => {
  const recurrences: Record<string, boolean> = {};

  lineItems?.forEach((lineItem) => {
    if (isCompositePriceItem(lineItem)) {
      lineItem.item_components?.forEach((component) => {
        const recurrence = component._price?.type === 'recurring' ? component._price.billing_period : component.type;

        if (recurrence !== undefined) {
          recurrences[recurrence] =
            recurrences[recurrence] || component._price?.price_display_in_journeys === 'estimated_price';
        }
      });
    } else {
      const recurrence = lineItem._price?.type === 'recurring' ? lineItem._price.billing_period : lineItem._price?.type;

      if (recurrence !== undefined) {
        recurrences[recurrence] =
          recurrences[recurrence] || lineItem._price?.price_display_in_journeys === 'estimated_price';
      }
    }
  });

  return recurrences;
};
