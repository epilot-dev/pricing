---
'@epilot/pricing': patch
---

Cap displayed decimals when formatting with `useRealPrecision`: amounts >= 1 show at most 4 decimals, amounts below 1 at most 6, and trailing zeros are ignored. Fixes unit prices such as `8,968633333333 €` in order tables (UI and documents) when an external catalog returns non-terminating decimals. Calculations are unchanged.
