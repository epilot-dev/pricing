import type { PriceItem, CompositePriceItem } from '../shared/types';

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
   * All pricing tags inferred from the products and prices of the provided price items.
   */
  _tags: string[];
};

/**
 * Extracts the pricing entities from a list of price items.
 *
 * @param priceItems a list of price items
 * @returns the product and price relations from the price items grouped by their slug.
 */

export const extractPricingEntitiesBySlug = (
  priceItems?: (PriceItem | CompositePriceItem)[],
): PricingEntitiesExtractResult => {
  const productRelations = [] as RelationAttributeValue['$relation'];
  const priceRelations = [] as RelationAttributeValue['$relation'];
  const priceLookup: Record<string, boolean> = {};
  const productLookup: Record<string, boolean> = {};
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
  });

  return {
    product: { $relation: productRelations },
    price: { $relation: priceRelations },
    _tags: [...new Set(pricingTags)],
  };
};
