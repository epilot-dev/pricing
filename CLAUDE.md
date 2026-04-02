# @epilot/pricing

Pricing computation library for the epilot platform. Handles tariff calculations, tax, discounts, tiered pricing, composite prices, and currency formatting.

## Interactive Playground (`demo/`)

A single-page React app that demonstrates every pricing model the library supports. Each page is a self-contained, interactive example with live computation, visual breakdown, and a code snippet showing the data model.

### Purpose

The Playground is a **Visual Storybook for pricing** -- a living documentation tool that serves multiple audiences:

- **Developer Experience** -- Before the Playground, testing pricing models required linking the library and running live on the platform. Now developers can explore, configure, and validate any pricing scenario interactively without touching a real environment.
- **Onboarding & Reference** -- Especially valuable for Customer Success teams to explain how a given pricing model works to customers. Each page is self-explanatory with interactive controls and real computed results.
- **Marketing** -- Publicly shareable showcase of epilot's pricing capabilities -- Dynamic Tariffs, GetAG integration, Coupons, Composite Pricing, and more. The Playground *is* the documentation.
- **Technical Sales** -- For demos with IT departments and technical managers who want to understand the range of pricing scenarios epilot supports. A useful reference during deeper technical evaluations.

### Tech stack

- React 18 + TypeScript
- Vite (dev server + build)
- Tailwind CSS (utility-first styling)
- No external UI library -- all components are custom

### Project structure

```
demo/
  src/
    App.tsx                  # Sidebar navigation + section routing
    helpers.ts               # Shared utilities: fmtCents, fmtEur, buildPriceItemDto, makeTax, makeCoupon
    main.tsx                 # Entry point
    components/
      CodeBlock.tsx          # Syntax-highlighted code snippet with copy button
      ProductShowcase.tsx    # Product category cards with SVG illustrations
      ResultCard.tsx         # Colored result metric card
      TariffCard.tsx         # Gradient header card for tariff summaries
      TierChart.tsx          # Bar chart for tiered pricing visualization
    sections/
      OverviewDemo.tsx       # Landing page with feature highlights
      ElectricityDemo.tsx    # Single/dual tariff with base price + work price
      GasDemo.tsx            # Gas tariff with CO2 and storage levies
      HouseConnectionDemo.tsx # Multi-utility connection with distance-based trench work
      NonCommodityDemo.tsx   # Product bundles using composite prices (price_components)
      PerUnitDemo.tsx        # Basic per-unit pricing
      TieredVolumeDemo.tsx   # Volume-based tier selection
      TieredGraduatedDemo.tsx # Graduated tier pricing
      TieredFlatFeeDemo.tsx  # Flat fee per tier
      TaxDemo.tsx            # Tax-inclusive vs tax-exclusive comparison
      DiscountDemo.tsx       # Fixed/percentage discounts and cashback
      CompositePriceDemo.tsx # Composite price with price_components
      CurrencyDemo.tsx       # EUR and CHF formatting utilities
      DynamicTariffDemo.tsx  # Market price + supplier margin
      GetAGDemo.tsx          # GetAG regulated fee breakdown (electricity + gas)
```

### Navigation structure (defined in `App.tsx`)

The sidebar organizes sections into two groups:

**Energy Products**: Electricity, Gas, House Connection, Products & Add-ons

**Pricing Models**: Per Unit, Tiered Volume, Tiered Graduated, Tiered Flat Fee, Tax Handling, Discounts & Coupons, Composite Pricing, Currency & Formatting, Dynamic Tariff, GetAG Energy

### How each demo section works

Every section file follows the same pattern:

1. **State** -- React `useState` for user-configurable inputs (prices, quantities, tax rates)
2. **Computation** -- `useMemo` calling `computeAggregatedAndPriceTotals()` from `@epilot/pricing` with price items built via `buildPriceItemDto()`
3. **Manual display calculations** -- Parallel EUR calculations for the visual breakdown (tariff cards, cost lines, stacked bars)
4. **UI** -- Left column with controls, right column with TariffCard/ResultCard showing results
5. **Code example** -- A `CodeBlock` at the bottom showing the exact data model passed to the library

### Key conventions

- **Currency formatting**: Always use `fmtCents(amountInCents)` for library output or `fmtEur(amountInEUR)` for manual calculations. Both produce `€12,500.00` format. Never use `EUR ${value.toFixed(2)}` or `toLocaleString('de-DE')`.
- **ct/kWh to EUR conversion**: Energy work prices are entered in ct/kWh but the library expects EUR. Always divide by 100: `(parseFloat(ctValue) / 100).toFixed(4)`.
- **Language**: All text must be in English. No German labels (no Grundpreis, Arbeitspreis, Erdgas, etc).
- **Supported currencies**: Only EUR and CHF.
- **Code examples**: Show `unit_amount` (integer cents) alongside `unit_amount_decimal` (EUR string). Do not duplicate `pricing_model`/`is_tax_inclusive` at item level -- keep them only in `_price`. Do not include a separate `taxes` array on the item.
- **Consumption items**: Use `quantity: 1` with `price_mappings: [{ frequency_unit, value }]` to model consumption-based pricing (the mapping drives the quantity).
- **Product bundles**: Use composite prices (`is_composite_price: true` with `price_components`) not individual items.
- **Simulated data**: GetAG and Dynamic Tariff pages include an info block noting values are simulated.

### Adding a new demo section

1. Create `demo/src/sections/YourDemo.tsx` following the pattern of existing sections
2. Import and add it to the `sections` array in `demo/src/App.tsx`
3. Use `buildPriceItemDto()` from `helpers.ts` to create price items
4. Use `computeAggregatedAndPriceTotals()` from `@epilot/pricing` for computation
5. Display results with `ResultCard` (metrics) and optionally `TariffCard` (energy tariffs)
6. Add a `CodeBlock` at the bottom showing the data model
7. Run `npx tsc --noEmit --project demo/tsconfig.json` to verify TypeScript
8. Run `npx vite build` from `demo/` to verify the production build

### Deploying changes

After making changes to the playground:

```bash
# 1. Build the demo
cd demo && npx vite build

# 2. Navigate to the docs repo
cd /path/to/codebase/github/docs

# 3. Copy the built playground into the docs site
npm run update-pricing-playground

# 4. Commit and push all files (including untracked new assets)
git add -A
git commit -m "update pricing playground"
git push

# This triggers the CI build which deploys the docs site with the updated playground.
```

## Library overview

The main export is `computeAggregatedAndPriceTotals(priceItems)` which takes an array of price items and returns aggregated totals including `amount_subtotal`, `amount_tax`, `amount_total`, and per-item breakdowns.

### Pricing models

- `per_unit` -- unit price x quantity
- `tiered_volume` -- single tier selected by quantity, applies to all units
- `tiered_graduated` -- each tier applies to units in its range
- `tiered_flatfee` -- flat fee per tier based on quantity

### Key types

- **Price item**: `{ quantity, _price: { unit_amount, unit_amount_decimal, unit_amount_currency, pricing_model, is_tax_inclusive, type, billing_period, tax } }`
- **Composite price**: `{ _price: { is_composite_price: true, price_components: [...] }, price_components: [...] }`
- **Dynamic tariff**: Standard `per_unit` with `_price.dynamic_tariff` metadata
- **Coupons**: Attached via `_coupons` array on the price item. Fixed or percentage, discount or cashback category.
