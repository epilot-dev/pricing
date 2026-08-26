---
"@epilot/pricing": major
---

Migrate from `@epilot/pricing-client` to `@epilot/sdk`.

The peer dependency on `@epilot/pricing-client` is replaced by `@epilot/sdk` (`^2.18.31`), and all types are now imported from `@epilot/sdk/pricing`. Consumers must install `@epilot/sdk` instead of `@epilot/pricing-client`.

The legacy `PriceTierEnhanced` type (removed from the OpenAPI spec and absent from the SDK) is now defined and exported by this package directly.
