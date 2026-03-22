import { useState, useMemo } from 'react';
import { computeAggregatedAndPriceTotals } from '@epilot/pricing';
import { ResultCard } from '../components/ResultCard';
import { ProductShowcase, SolarIllustration, WallboxIllustration, HeatPumpIllustration, SmartHomeIllustration } from '../components/ProductShowcase';
import { CodeBlock } from '../components/CodeBlock';
import { buildPriceItemDto, fmtCents } from '../helpers';

interface Product {
  name: string;
  category: string;
  price: string;
  quantity: number;
  type: 'one_time' | 'recurring';
  billingPeriod?: string;
  enabled: boolean;
}

const defaultProducts: Product[] = [
  { name: 'Solar Panel System (10 kWp)', category: 'solar', price: '12500.00', quantity: 1, type: 'one_time', enabled: true },
  { name: 'Battery Storage (10 kWh)', category: 'solar', price: '6800.00', quantity: 1, type: 'one_time', enabled: true },
  { name: 'Solar Installation', category: 'solar', price: '3200.00', quantity: 1, type: 'one_time', enabled: true },
  { name: 'Solar Maintenance Contract', category: 'solar', price: '29.90', quantity: 1, type: 'recurring', billingPeriod: 'monthly', enabled: true },
  { name: 'Wallbox (11 kW)', category: 'emobility', price: '899.00', quantity: 1, type: 'one_time', enabled: false },
  { name: 'Wallbox Installation', category: 'emobility', price: '450.00', quantity: 1, type: 'one_time', enabled: false },
  { name: 'Charging Flat Rate', category: 'emobility', price: '59.00', quantity: 1, type: 'recurring', billingPeriod: 'monthly', enabled: false },
  { name: 'Heat Pump System', category: 'heating', price: '15800.00', quantity: 1, type: 'one_time', enabled: false },
  { name: 'Heat Pump Installation', category: 'heating', price: '4500.00', quantity: 1, type: 'one_time', enabled: false },
  { name: 'Heating Maintenance', category: 'heating', price: '39.90', quantity: 1, type: 'recurring', billingPeriod: 'monthly', enabled: false },
  { name: 'Smart Thermostat', category: 'smarthome', price: '249.00', quantity: 1, type: 'one_time', enabled: false },
  { name: 'Energy Manager', category: 'smarthome', price: '499.00', quantity: 1, type: 'one_time', enabled: false },
];

const categoryMeta: Record<string, { label: string; gradient: string; bg: string; text: string; icon: string; illustration: React.ComponentType; features: string[] }> = {
  solar: {
    label: 'Solar & Storage',
    gradient: 'gradient-solar',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    icon: '\u2600\uFE0F',
    illustration: SolarIllustration,
    features: ['10 kWp PV system', 'Battery storage', 'Professional installation', 'Maintenance included'],
  },
  emobility: {
    label: 'E-Mobility',
    gradient: 'gradient-emobility',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    icon: '\uD83D\uDE97',
    illustration: WallboxIllustration,
    features: ['11 kW wallbox', 'Installation included', 'Smart charging', 'Monthly flat rate'],
  },
  heating: {
    label: 'Heating',
    gradient: 'gradient-heating',
    bg: 'bg-red-50',
    text: 'text-red-700',
    icon: '\uD83C\uDF21\uFE0F',
    illustration: HeatPumpIllustration,
    features: ['Air-to-water system', 'Full installation', 'Smart controls', 'Service contract'],
  },
  smarthome: {
    label: 'Smart Home',
    gradient: 'gradient-smarthome',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    icon: '\uD83C\uDFE0',
    illustration: SmartHomeIllustration,
    features: ['Smart thermostat', 'Energy monitoring', 'App control', 'Consumption insights'],
  },
};

const categories = ['solar', 'emobility', 'heating', 'smarthome'] as const;

export function NonCommodityDemo() {
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [taxRate, setTaxRate] = useState(19);

  const toggleCategory = (category: string) => {
    setProducts((prev) => {
      const catProducts = prev.filter((p) => p.category === category);
      const allEnabled = catProducts.every((p) => p.enabled);
      return prev.map((p) => (p.category === category ? { ...p, enabled: !allEnabled } : p));
    });
  };

  const updateProduct = (idx: number, field: keyof Product, value: any) => {
    setProducts((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p)));
  };

  const result = useMemo(() => {
    const items = products
      .filter((p) => p.enabled)
      .map((p) =>
        buildPriceItemDto({
          unitAmountDecimal: p.price,
          quantity: p.quantity,
          type: p.type,
          billingPeriod: p.billingPeriod,
          taxRate,
          isTaxInclusive: false,
          description: p.name,
        }),
      );

    if (items.length === 0) {
      return { amount_subtotal: 0, amount_tax: 0, amount_total: 0, items: [], total_details: { breakdown: { recurrences: [] } } };
    }

    return computeAggregatedAndPriceTotals(items);
  }, [products, taxRate]);

  const enabledProducts = products.filter((p) => p.enabled);
  const oneTimeCosts = enabledProducts
    .filter((p) => p.type === 'one_time')
    .reduce((sum, p) => sum + parseFloat(p.price) * p.quantity, 0);
  const monthlyCosts = enabledProducts
    .filter((p) => p.type === 'recurring')
    .reduce((sum, p) => sum + parseFloat(p.price) * p.quantity, 0);

  const categoryTotals = categories.map((cat) => {
    const catProducts = enabledProducts.filter((p) => p.category === cat);
    const meta = categoryMeta[cat];
    return {
      category: cat,
      ...meta,
      oneTime: catProducts.filter((p) => p.type === 'one_time').reduce((s, p) => s + parseFloat(p.price) * p.quantity, 0),
      recurring: catProducts.filter((p) => p.type === 'recurring').reduce((s, p) => s + parseFloat(p.price) * p.quantity, 0),
      count: catProducts.length,
    };
  });

  const isCategoryEnabled = (cat: string) => products.filter((p) => p.category === cat).some((p) => p.enabled);

  return (
    <div>
      <h1 className="section-title">Products & Add-ons</h1>
      <p className="section-desc">
        Build product bundles for your customers — solar panels, wallboxes, heat pumps, and smart home devices.
        Select categories to configure complete packages with one-time and recurring pricing.
      </p>

      {/* Product showcase grid — the "journey" visual */}
      <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-4">Select Product Categories</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {categories.map((cat) => {
          const meta = categoryMeta[cat];
          const catProducts = products.filter((p) => p.category === cat);
          const catOneTime = catProducts.filter((p) => p.type === 'one_time').reduce((s, p) => s + parseFloat(p.price), 0);
          const catRecurring = catProducts.filter((p) => p.type === 'recurring').reduce((s, p) => s + parseFloat(p.price), 0);
          const enabled = isCategoryEnabled(cat);

          return (
            <ProductShowcase
              key={cat}
              icon={meta.icon}
              gradient={cat}
              title={meta.label}
              description={`${catProducts.length} products available`}
              price={`EUR ${catOneTime.toLocaleString('de-DE', { minimumFractionDigits: 0 })}`}
              priceLabel={catRecurring > 0 ? `+ EUR ${catRecurring.toFixed(2)}/mo` : 'one-time'}
              features={meta.features}
              tag={enabled ? 'Selected' : undefined}
              tagColor={enabled ? 'bg-emerald-100 text-emerald-700' : undefined}
              selected={enabled}
              onToggle={() => toggleCategory(cat)}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product details */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card">
            <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-3">Products in Bundle</p>
            <div className="space-y-1.5 max-h-[420px] overflow-y-auto">
              {products.map((product, idx) => {
                const meta = categoryMeta[product.category];
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                      product.enabled ? `${meta.bg} border border-transparent` : 'bg-gray-50 opacity-40'
                    }`}
                  >
                    <button
                      onClick={() => updateProduct(idx, 'enabled', !product.enabled)}
                      className={`w-5 h-5 rounded-lg border-2 flex-shrink-0 flex items-center justify-center text-[10px] transition-colors ${
                        product.enabled
                          ? 'bg-primary-600 border-primary-600 text-white'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {product.enabled ? '\u2713' : ''}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-700 truncate">{product.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[10px] font-medium ${meta.text}`}>{meta.icon}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                          product.type === 'one_time'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-emerald-100 text-emerald-600'
                        }`}>
                          {product.type === 'one_time' ? 'One-time' : product.billingPeriod}
                        </span>
                      </div>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      value={product.price}
                      onChange={(e) => updateProduct(idx, 'price', e.target.value)}
                      className="input-field w-24 text-xs text-right"
                      disabled={!product.enabled}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tax Rate</label>
            <select value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} className="select-field mt-2">
              <option value={0}>0% (Solar tax exemption)</option>
              <option value={7}>7%</option>
              <option value={19}>19%</option>
            </select>
          </div>
        </div>

        {/* Right column — Bundle summary + results */}
        <div className="lg:col-span-2 space-y-5">
          {/* Bundle order summary — tariff card style */}
          <div className="tariff-card">
            <div className="tariff-card-header gradient-primary">
              <div className="flex items-center justify-between">
                <div>
                  <p className="tariff-card-label mb-1">Your Bundle</p>
                  <div className="flex items-baseline gap-1">
                    <span className="tariff-card-price">EUR {oneTimeCosts.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  {monthlyCosts > 0 && (
                    <p className="text-sm opacity-80 mt-1">+ EUR {monthlyCosts.toFixed(2)}/month service</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-3xl font-extrabold">{enabledProducts.length}</p>
                  <p className="text-xs opacity-70">items selected</p>
                </div>
              </div>
            </div>
            <div className="tariff-card-body">
              {/* Category cost stacked bar */}
              {oneTimeCosts > 0 && (
                <div className="mb-5">
                  <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-2">Cost Distribution</p>
                  <div className="h-3 flex rounded-full overflow-hidden">
                    {categoryTotals
                      .filter((c) => c.oneTime > 0)
                      .map((cat) => {
                        const colors: Record<string, string> = {
                          solar: 'bg-amber-400',
                          emobility: 'bg-blue-400',
                          heating: 'bg-red-400',
                          smarthome: 'bg-emerald-400',
                        };
                        return (
                          <div
                            key={cat.category}
                            className={`${colors[cat.category]} transition-all duration-300`}
                            style={{ width: `${(cat.oneTime / oneTimeCosts) * 100}%` }}
                            title={`${cat.label}: EUR ${cat.oneTime.toFixed(2)}`}
                          />
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Line items */}
              {enabledProducts.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Select products above to build your bundle</p>
              ) : (
                <div>
                  {categoryTotals
                    .filter((c) => c.count > 0)
                    .map((cat) => (
                      <div key={cat.category} className="mb-4 last:mb-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm">{cat.icon}</span>
                          <span className="text-xs font-bold text-gray-600">{cat.label}</span>
                        </div>
                        {enabledProducts
                          .filter((p) => p.category === cat.category)
                          .map((p, idx) => (
                            <div key={idx} className="cost-line">
                              <span className="cost-line-label">
                                {p.name}
                                {p.quantity > 1 && <span className="text-gray-400"> x{p.quantity}</span>}
                              </span>
                              <span className="cost-line-value">
                                EUR {(parseFloat(p.price) * p.quantity).toFixed(2)}
                                {p.type === 'recurring' && <span className="text-emerald-600 text-xs font-semibold ml-1">/mo</span>}
                              </span>
                            </div>
                          ))}
                      </div>
                    ))}
                </div>
              )}
            </div>
            {enabledProducts.length > 0 && (
              <div className="tariff-card-footer">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-500">One-time total (net)</span>
                  <span className="font-extrabold text-gray-900">EUR {oneTimeCosts.toFixed(2)}</span>
                </div>
                {monthlyCosts > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Monthly total (net)</span>
                    <span className="font-extrabold text-emerald-600">EUR {monthlyCosts.toFixed(2)}/mo</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Computed results */}
          <div className="card">
            <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-4">Computed via @epilot/pricing</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <ResultCard label="Total Net" value={fmtCents(result.amount_subtotal)} />
              <ResultCard label={`Tax (${taxRate}%)`} value={fmtCents(result.amount_tax)} color="amber" highlight />
              <ResultCard label="Total Gross" value={fmtCents(result.amount_total)} highlight color="green" />
              <ResultCard label="Items" value={enabledProducts.length} color="blue" highlight />
            </div>

            {(result.total_details?.breakdown?.recurrences?.length ?? 0) > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-3">By Recurrence</p>
                <div className="space-y-2">
                  {result.total_details?.breakdown?.recurrences?.map((r: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-2">
                      <span className={r.type === 'one_time' ? 'badge-blue' : 'badge-green'}>
                        {r.type === 'one_time' ? 'One-time' : r.billing_period}
                      </span>
                      <span className="font-extrabold text-sm tabular-nums">{fmtCents(r.amount_total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Code block */}
      <div className="mt-8">
        <CodeBlock
          title="Usage"
          code={`import { computeAggregatedAndPriceTotals } from '@epilot/pricing';

// Non-commodity bundle: hardware + services + maintenance
const items = [
${enabledProducts.slice(0, 4).map((p) => `  {
    quantity: ${p.quantity},
    _price: {
      unit_amount_decimal: '${p.price}',
      unit_amount_currency: 'EUR',
      pricing_model: 'per_unit',
      is_tax_inclusive: false,
      type: '${p.type}',${p.billingPeriod ? `\n      billing_period: '${p.billingPeriod}',` : ''}
      tax: [{ rate: ${taxRate}, type: 'VAT' }],
      description: '${p.name}',
    },
    taxes: [{ tax: { rate: ${taxRate} } }],
  },`).join('\n')}${enabledProducts.length > 4 ? `\n  // ... ${enabledProducts.length - 4} more items` : ''}
];

const result = computeAggregatedAndPriceTotals(items);
// result.amount_total = ${fmtCents(result.amount_total)}`}
        />
      </div>
    </div>
  );
}
