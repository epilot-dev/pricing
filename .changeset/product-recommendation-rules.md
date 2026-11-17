---
'@epilot/pricing': minor
---

Add `extractProductRecommendationRuleRelations` and `validateProductRecommendationRules` (plus `ProductRecommendationRule`, `ProductRecommendationOfferGroup` and `ProductRecommendationOfferItem` types) to derive the `source_products`/`source_prices`/`offer_products`/`offer_prices` relations of a `product_recommendation` entity from its rule table and validate it before saving.
