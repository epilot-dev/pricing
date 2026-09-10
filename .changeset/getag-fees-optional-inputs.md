---
'@epilot/pricing': patch
---

fix(getag): tolerate `external_fees_metadata` without `inputs`

`processExternalFeesDetails` crashed with `Cannot read properties of undefined (reading 'consumptionHT')` for order line items whose getag fee metadata has no `inputs` object (orders created via the 360 cockpit, the public API, or journeys before the consumption inputs were attached). The `inputs` field is now optional and consumption-based yearly amounts render as `-` when it is absent; the fee type falls back to `power`.
