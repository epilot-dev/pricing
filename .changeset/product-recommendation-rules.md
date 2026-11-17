---
'@epilot/pricing': minor
---

Add `extractProductRecommendationRuleRelations` and `validateProductRecommendationRules` (plus `ProductRecommendationRule`, `ProductRecommendationOfferGroup` and `ProductRecommendationOfferItem` types) to derive the `source_products`/`source_prices`/`offer_products`/`offer_prices` relations of a `product_recommendation` entity from its rule table and validate it before saving.

The rule table types (`ProductRecommendationRule`, `ProductRecommendationOfferGroup`) come from the pricing API spec via `@epilot/sdk/pricing` and are re-exported; `ProductRecommendationOfferItem` is derived from them. The `@epilot/sdk` peer dependency is raised to `^2.20.115`, the first version that ships these types.
