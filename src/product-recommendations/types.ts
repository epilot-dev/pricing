import type { ProductRecommendationOfferGroup, ProductRecommendationRule } from '@epilot/sdk/pricing';

/**
 * The rule table types come from the pricing API spec (`@epilot/sdk/pricing`):
 * - `ProductRecommendationRule`: a row; customers on the `source` product + price are offered the items of
 *   the `offer_groups`. `source: null` marks the fallback rule ("any other product").
 * - `ProductRecommendationOfferGroup`: the API's `Offer` plus an `id`; `target_id` absent = everyone on the
 *   rule's source tariff.
 */
export type { ProductRecommendationOfferGroup, ProductRecommendationRule };

/**
 * A product + price offered to customers matched by a product recommendation rule (incl. its `highlight_config`).
 */
export type ProductRecommendationOfferItem = ProductRecommendationOfferGroup['items'][number];

/**
 * A has_many relation attribute value.
 */
export type ProductRecommendationRelationAttributeValue = {
  $relation: { entity_id: string; _schema: 'product' | 'price' }[];
};

/**
 * The relation attributes of a `product_recommendation` entity derived from its rules.
 */
export type ProductRecommendationRuleRelations = {
  /** Products of all rule sources. */
  source_products: ProductRecommendationRelationAttributeValue;
  /** Prices of all rule sources. */
  source_prices: ProductRecommendationRelationAttributeValue;
  /** Products of all offer items. */
  offer_products: ProductRecommendationRelationAttributeValue;
  /** Prices of all offer items. */
  offer_prices: ProductRecommendationRelationAttributeValue;
};

export type ProductRecommendationRuleValidationErrorCode =
  | 'RULES_REQUIRED'
  | 'RULE_SOURCE_REQUIRED'
  | 'DUPLICATE_SOURCE'
  | 'MULTIPLE_FALLBACKS'
  | 'OFFERS_REQUIRED'
  | 'OFFER_IS_OWN_SOURCE'
  | 'DUPLICATE_RULE_ID';

export type ProductRecommendationRuleValidationError = {
  code: ProductRecommendationRuleValidationErrorCode;
  rule_id?: string;
  offer_group_id?: string;
  item_index?: number;
  message: string;
};
