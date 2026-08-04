---
'@epilot/pricing': patch
---

Support TaxItem (an ad-hoc tax rate with no backing entity) alongside Tax wherever a tax object is accepted or returned, following the @epilot/pricing-client bump that introduced it. Ad-hoc/custom line items with no product or price reference can now be taxed without a full Tax entity.
