import type { PriceItem, CompositePriceItem } from '../shared/types';
import { isCompositePriceItem } from './utils';

type RelationAttributeValue = {
  $relation: { entity_id: string; _schema: string; _tags: string[] }[];
};

type PricingEntitiesExtractResult = {
  /**
   * A relation attribute value containing all price entities from the given price items.
   */
  price: RelationAttributeValue;
  /**
   * A relation attribute value containing all product entities from the given price items.
   */
  product: RelationAttributeValue;

  /**
   * A relation attribute value containing all coupon entities from the given price items.
   */
  coupon?: RelationAttributeValue;
  /**
   * All pricing tags inferred from the products and prices of the provided price items.
   */
  _tags: string[];
};

/**
 * Extracts all coupon entities ids from a price item and its components (if composite).
 */
const extractCouponsFromItem = (item: PriceItem | CompositePriceItem) => {
  const coupons = item._coupons ?? [];

  if (isCompositePriceItem(item) && Array.isArray(item.item_components)) {
    const componentCoupons = item.item_components.flatMap((component) => component._coupons ?? []);
    return [...coupons, ...componentCoupons];
  }

  return coupons;
};

/**
 * Extracts the pricing entities from a list of price items.
 *
 * @param priceItems a list of price items
 * @returns the product, price and coupon relations from the price items grouped by their slug.
 */

export const extractPricingEntitiesBySlug = (
  priceItems?: (PriceItem | CompositePriceItem)[],
): PricingEntitiesExtractResult => {
  const productRelations = [] as RelationAttributeValue['$relation'];
  const priceRelations = [] as RelationAttributeValue['$relation'];
  const couponRelations = [] as RelationAttributeValue['$relation'];
  const priceLookup: Record<string, boolean> = {};
  const productLookup: Record<string, boolean> = {};
  const couponLookup: Record<string, boolean> = {};
  const pricingTags: string[] = [];

  priceItems?.forEach((item) => {
    if (item?.product_id && !productLookup[item.product_id]) {
      productRelations.push({
        entity_id: item.product_id,
        _schema: 'product',
        _tags: [],
      });
      pricingTags.push(...(item._product?._tags || []));
      productLookup[item.product_id] = true;
    }

    if (item?.price_id && !priceLookup[item.price_id]) {
      priceRelations.push({
        entity_id: item.price_id,
        _schema: 'price',
        _tags: [],
      });
      pricingTags.push(...(item._price?._tags || []));
      priceLookup[item.price_id] = true;
    }

    const coupons = extractCouponsFromItem(item);
    if (coupons.length) {
      for (const coupon of coupons) {
        if (couponLookup[coupon._id]) {
          continue;
        }

        couponRelations.push({
          entity_id: coupon._id,
          _schema: 'coupon',
          _tags: [],
        });

        couponLookup[coupon._id] = true;
      }
    }
  });

  return {
    product: { $relation: productRelations },
    price: { $relation: priceRelations },
    ...(couponRelations.length > 0 ? { coupon: { $relation: couponRelations } } : {}),
    _tags: [...new Set(pricingTags)],
  };
};
