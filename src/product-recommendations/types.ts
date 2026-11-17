import type { Offer } from '@epilot/sdk/pricing';

/**
 * A product + price offered to customers matched by a product recommendation rule.
 * Same shape as an item of the pricing API's `Offer` (incl. its `highlight_config`).
 */
export type ProductRecommendationOfferItem = NonNullable<Offer['items']>[number];

/**
 * A group of offers within a product recommendation rule: the pricing API's `Offer`
 * (`target_id` absent = everyone on the rule's source tariff), plus an `id` and required `items`.
 */
export type ProductRecommendationOfferGroup = Omit<Offer, 'items'> & {
  id: string;
  items: ProductRecommendationOfferItem[];
};

/**
 * A row of the rule table of a `product_recommendation` entity:
 * customers on the `source` product + price are offered the items of the `offer_groups`.
 */
export type ProductRecommendationRule = {
  id: string;
  /**
   * The source tariff (product + price) this rule applies to.
   * `null` marks the fallback rule ("any other product"); at most one rule may be the fallback.
   */
  source: { product_id: string; price_id: string } | null;
  offer_groups: ProductRecommendationOfferGroup[];
};

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
