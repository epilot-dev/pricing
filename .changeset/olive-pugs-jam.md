---
'@epilot/pricing': minor
---

Bump the `@epilot/sdk` peer dependency to `^2.19.3` and source `PriceTierEnhanced` from it.

The SDK now ships the legacy "additional types" (carried over from `@epilot/pricing-client`) on the `@epilot/sdk/pricing` entrypoint, so the local `PriceTierEnhanced` declaration this package added during the SDK migration is no longer needed. It is re-exported from the SDK instead — the type shape is unchanged, so this is a no-op for consumers other than the raised minimum peer version.
