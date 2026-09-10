---
'@epilot/pricing': patch
---

fix(getag): tolerate `external_fees_metadata` without `inputs` and derive the commodity from the breakdown

`processExternalFeesDetails` crashed with `Cannot read properties of undefined (reading 'consumptionHT')` for order line items whose getag fee metadata has no `inputs` object (orders created via the 360 cockpit, the public API, or journey flows that forward the raw compute result). `inputs` is now optional and consumption-based yearly amounts render as `-` when it is absent.

The commodity used to pick the power vs. gas fee groups is no longer hard-defaulted to `power` when `inputs.type` is missing. New `resolveExternalFeesType()` derives it from the fee keys the pricing API emitted (e.g. `gas_tax`, `gas_storage` vs. `power_tax`, `chp`), then from the price's getag `category`, and only then falls back to `power`.
