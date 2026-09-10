---
'@epilot/pricing': patch
---

Render the GetAG fees breakdown when `external_fees_metadata.inputs` is absent.

`inputs` is annotated client-side by the Journey renderer after the GetAG compute
call — the pricing API never returns it — so price items coming from carts submitted
through the public API carry fee metadata without it. `processExternalFeesDetails`
dereferenced `inputs.type` and `inputs.consumptionHT/NT` unguarded and threw
`Cannot read properties of undefined`, taking down the whole order table variable for
those items.

The reads are now optional-chained and `ExternalFeesMetadata['inputs']` is typed as
optional to match. Consumption-based yearly amounts already fall back to `-` when the
consumption is unknown, so the breakdown renders with everything except those figures.
