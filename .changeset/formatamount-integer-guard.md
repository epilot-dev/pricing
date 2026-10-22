---
"@epilot/pricing": patch
---

fix: `formatAmount` no longer throws `"You must provide an integer."` on malformed amounts

`formatAmount` passed its amount straight to dinero, which rejects non-integer/non-finite values. `parseUnknownAmount` now rounds finite non-integers to the nearest minor unit (normalising `-0` to `0`) and falls back to `0` for `NaN`/`±Infinity`, so a bad stored amount degrades to a displayed value instead of crashing the caller. Integer and `NaN` inputs are unchanged.
