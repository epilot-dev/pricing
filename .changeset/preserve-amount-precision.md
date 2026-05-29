---
'@epilot/pricing': minor
---

Add `precision` option to `computeAggregatedAndPriceTotals` so consumers can opt into preserving sub-cent precision in integer amount fields (`amount_total`, `unit_amount`, etc.). Default is unchanged (`DEFAULT_INTEGER_AMOUNT_PRECISION`, i.e. cents). Pass `{ precision: 12 }` to keep the full `DECIMAL_PRECISION` in returned integers — useful for rendering per-unit rates like `0.1524 EUR/kWh` without losing decimals to monetary rounding.
