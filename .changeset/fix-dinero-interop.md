---
"@epilot/pricing": patch
---

Fix `TypeError: (0, x.default) is not a function` when a consumer bundles `@epilot/pricing` with `mainFields: ['module','main']`. The `dinero.js` factory is now resolved regardless of whether the CJS or ESM build is picked up.
