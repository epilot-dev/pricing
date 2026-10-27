---
"@epilot/pricing": patch
---

`computeCumulativeValue` rounds its `breakdown` for display like its totals: each tier's `quantityUsed` to 2 decimals and its `totalAmountDecimal` to 2 decimals (`precision: 2`, as `total` is). A quantity normalised from a yearly consumption used to show as `83.333333 kWh` with an amount of `€28.333333333333`. `tierAmountDecimal` keeps the tier's real precision, and `totalWithPrecision` / `subtotalWithPrecision` are unchanged.
