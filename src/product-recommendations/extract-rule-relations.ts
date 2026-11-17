import type {
  ProductRecommendationRelationAttributeValue,
  ProductRecommendationRule,
  ProductRecommendationRuleRelations,
} from './types';

const createRelationCollector = (schema: 'product' | 'price') => {
  const seen = new Set<string>();
  const value: ProductRecommendationRelationAttributeValue = { $relation: [] };

  return {
    add: (entityId?: string | null) => {
      if (!entityId || seen.has(entityId)) {
        return;
      }
      seen.add(entityId);
      value.$relation.push({ entity_id: entityId, _schema: schema });
    },
    value,
  };
};

/**
 * Derives the relation attributes of a `product_recommendation` entity from its rule table,
 * the same way `extractPricingEntitiesBySlug` derives product/price relations from line items.
 *
 * Relations are de-duplicated and keep the order of first appearance. Missing ids are skipped.
 *
 * @param rules the rule table of the product recommendation
 * @returns `source_products`, `source_prices`, `offer_products` and `offer_prices` relation attribute values
 */
export const extractProductRecommendationRuleRelations = (
  rules?: ProductRecommendationRule[],
): ProductRecommendationRuleRelations => {
  const sourceProducts = createRelationCollector('product');
  const sourcePrices = createRelationCollector('price');
  const offerProducts = createRelationCollector('product');
  const offerPrices = createRelationCollector('price');

  for (const rule of rules ?? []) {
    sourceProducts.add(rule?.source?.product_id);
    sourcePrices.add(rule?.source?.price_id);

    for (const group of rule?.offer_groups ?? []) {
      for (const item of group?.items ?? []) {
        offerProducts.add(item?.product_id);
        offerPrices.add(item?.price_id);
      }
    }
  }

  return {
    source_products: sourceProducts.value,
    source_prices: sourcePrices.value,
    offer_products: offerProducts.value,
    offer_prices: offerPrices.value,
  };
};
