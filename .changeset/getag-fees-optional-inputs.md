---
'@epilot/pricing': patch
---

fix(getag): tolerate `external_fees_metadata` without `inputs` and resolve the commodity from the price

`processExternalFeesDetails` crashed with `Cannot read properties of undefined (reading 'consumptionHT')` for order line items whose getag fee metadata has no `inputs` object (orders created via the 360 cockpit, the public API, or journey flows that forward the raw compute result). `inputs` is now optional and consumption-based yearly amounts render as `-` when it is absent.

The commodity used to pick the power vs. gas fee groups is no longer hard-defaulted to `power` when `inputs.type` is missing. New `resolveExternalFeesType()` uses `inputs.type` when present, otherwise the price's getag `category` (read from the item or its composite components), and only then falls back to `power`.
