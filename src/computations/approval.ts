import type { PriceItem, CompositePriceItem, Price } from '@epilot/pricing-client';
import { isCompositePriceItem } from './isCompositePriceItem';

/**
 * Determines if a price item is approved based on its display mode and approval property.
 *
 * If price item has a parent item, it is always cosidered approved if the display mode is not 'show_as_on_request'.
 *
 * @param priceItem - The price item to check, which can be either a `PriceItem` or a `CompositePriceItem`.
 * @param parentPriceItem - An optional parent composite price item, used for additional context when checking unit amounts.
 * @returns `true` if the price item is approved, `false` otherwise.
 */

export const isPriceItemApproved = (
  priceItem: PriceItem | CompositePriceItem,
  parentPriceItem?: CompositePriceItem,
) => {
  if (isCompositePriceItem(priceItem)) {
    const hasHiddenPriceComponents = (priceItem.item_components ?? []).some(isDisplayModeRequiringApproval);

    return hasHiddenPriceComponents
      ? Boolean(priceItem.on_request_approved)
      : !isDisplayModeRequiringApproval(priceItem) || Boolean(priceItem.on_request_approved);
  } else if (parentPriceItem) {
    return (
      priceItem._price?.price_display_in_journeys !== 'show_as_on_request' ||
      Boolean(parentPriceItem.on_request_approved)
    );
  } else {
    return !isDisplayModeRequiringApproval(priceItem) || Boolean(priceItem.on_request_approved);
  }
};

export const isOnRequestUnitAmountApproved = (
  priceItem: PriceItem,
  priceDisplayInJourneys?: Price['price_display_in_journeys'],
  parentPriceItem?: CompositePriceItem,
) => {
  if (parentPriceItem) {
    const parentHasHiddenPriceComponents = (parentPriceItem.item_components ?? []).some(
      (component) => component._price?.price_display_in_journeys === 'show_as_on_request',
    );
    const parentPriceIsHiddenPrice = parentPriceItem._price?.price_display_in_journeys === 'show_as_on_request';

    if (parentHasHiddenPriceComponents || parentPriceIsHiddenPrice) {
      return Boolean(parentPriceItem.on_request_approved);
    }

    return true;
  }

  return Boolean(priceDisplayInJourneys !== 'show_as_on_request' || priceItem.on_request_approved);
};

/**
 * Determines if a price item or composite price item requires approval.
 *
 * This function checks if the given price item or any of its components (if it is a composite price)
 * require approval based on their display mode.
 *
 * @param priceItem - The price item or composite price item to check.
 * @returns `true` if the price item or any of its components require approval, otherwise `false`.
 */
export const isRequiringApproval = (priceItem: PriceItem | CompositePriceItem): boolean => {
  const isRequiringApproval = isDisplayModeRequiringApproval(priceItem);

  if (isCompositePriceItem(priceItem)) {
    return (
      isRequiringApproval ||
      Boolean(priceItem.item_components?.some((component) => isDisplayModeRequiringApproval(component)))
    );
  }

  return isRequiringApproval;
};

const isDisplayModeRequiringApproval = (priceItem: PriceItem | CompositePriceItem): boolean => {
  return (
    priceItem._price?.price_display_in_journeys === 'show_as_on_request' ||
    priceItem._price?.price_display_in_journeys === 'show_as_starting_price'
  );
};
