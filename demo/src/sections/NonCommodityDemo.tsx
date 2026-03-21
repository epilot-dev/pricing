import { useState, useMemo } from 'react';
import { computeAggregatedAndPriceTotals } from '@epilot/pricing';
import { ResultCard } from '../components/ResultCard';
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
  // Solar
  { name: 'Solar Panel System (10 kWp)', category: 'solar', price: '12500.00', quantity: 1, type: 'one_time', enabled: true },
  { name: 'Battery Storage (10 kWh)', category: 'solar', price: '6800.00', quantity: 1, type: 'one_time', enabled: true },
  { name: 'Solar Installation', category: 'solar', price: '3200.00', quantity: 1, type: 'one_time', enabled: true },
  { name: 'Solar Maintenance Contract', category: 'solar', price: '29.90', quantity: 1, type: 'recurring', billingPeriod: 'monthly', enabled: true },
  // E-Mobility
  { name: 'Wallbox (11 kW)', category: 'emobility', price: '899.00', quantity: 1, type: 'one_time', enabled: false },
  { name: 'Wallbox Installation', category: 'emobility', price: '450.00', quantity: 1, type: 'one_time', enabled: false },
  { name: 'Charging Flat Rate', category: 'emobility', price: '59.00', quantity: 1, type: 'recurring', billingPeriod: 'monthly', enabled: false },
  // Heating
  { name: 'Heat Pump System', category: 'heating', price: '15800.00', quantity: 1, type: 'one_time', enabled: false },
  { name: 'Heat Pump Installation', category: 'heating', price: '4500.00', quantity: 1, type: 'one_time', enabled: false },
  { name: 'Heating Maintenance', category: 'heating', price: '39.90', quantity: 1, type: 'recurring', billingPeriod: 'monthly', enabled: false },
  // Smart Home
  { name: 'Smart Thermostat', category: 'smarthome', price: '249.00', quantity: 1, type: 'one_time', enabled: false },
  { name: 'Energy Manager', category: 'smarthome', price: '499.00', quantity: 1, type: 'one_time', enabled: false },
];

const categoryMeta: Record<string, { label: string; color: string; bg: string; text: string; icon: string }> = {
  solar: { label: 'Solar & Storage', color: 'bg-yellow-400', bg: 'bg-yellow-50', text: 'text-yellow-700', icon: '\u2600\uFE0F' },
  emobility: { label: 'E-Mobility', color: 'bg-blue-400', bg: 'bg-blue-50', text: 'text-blue-700', icon: '\uD83D\uDE97' },
  heating: { label: 'Heating', color: 'bg-red-400', bg: 'bg-red-50', text: 'text-red-700', icon: '\uD83C\uDF21\uFE0F' },
  smarthome: { label: 'Smart Home', color: 'bg-green-400', bg: 'bg-green-50', text: 'text-green-700', icon: '\uD83C\uDFE0' },
};

export function NonCommodityDemo() {
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [taxRate, setTaxRate] = useState(19);

  const toggleProduct = (idx: number) => {
    setProducts((prev) => prev.map((p, i) => (i === idx ? { ...p, enabled: !p.enabled } : p)));
  };

  const updateProduct = (idx: number, field: keyof Product, value: any) => {
    setProducts((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p)));
  };

  const toggleCategory = (category: string) => {
    setProducts((prev) => {
      const catProducts = prev.filter((p) => p.category === category);
      const allEnabled = catProducts.every((p) => p.enabled);
      return prev.map((p) => (p.category === category ? { ...p, enabled: !allEnabled } : p));
    });
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

  const categories = ['solar', 'emobility', 'heating', 'smarthome'];
  const categoryTotals = categories.map((cat) => {
    const catProducts = enabledProducts.filter((p) => p.category === cat);
    return {
      category: cat,
      ...categoryMeta[cat],
      oneTime: catProducts.filter((p) => p.type === 'one_time').reduce((s, p) => s + parseFloat(p.price) * p.quantity, 0),
      recurring: catProducts.filter((p) => p.type === 'recurring').reduce((s, p) => s + parseFloat(p.price) * p.quantity, 0),
      count: catProducts.length,
    };
  }).filter((c) => c.count > 0);

  return (
    <div>
      <h1 className="section-title">Non-Commodity Products</h1>
      <p className="section-desc">
        Products and services beyond the energy supply itself — solar panels, battery storage,
        wallboxes, heat pumps, and smart home devices. Combines one-time hardware and installation
        costs with recurring service and maintenance contracts.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {/* Category toggles */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Product Categories</h3>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => {
                const meta = categoryMeta[cat];
                const catProducts = products.filter((p) => p.category === cat);
                const enabledCount = catProducts.filter((p) => p.enabled).length;
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      enabledCount > 0
                        ? `${meta.bg} border-current ${meta.text}`
                        : 'bg-gray-50 border-gray-200 text-gray-400'
                    }`}
                  >
                    <span className="text-lg">{meta.icon}</span>
                    <p className="text-sm font-medium mt-1">{meta.label}</p>
                    <p className="text-[10px] opacity-70">
                      {enabledCount}/{catProducts.length} selected
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product list */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Products & Services</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {products.map((product, idx) => {
                const meta = categoryMeta[product.category];
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors ${
                      product.enabled ? `${meta.bg} border-transparent` : 'bg-gray-50 border-gray-100 opacity-50'
                    }`}
                  >
                    <button
                      onClick={() => toggleProduct(idx)}
                      className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center text-[10px] ${
                        product.enabled
                          ? 'bg-primary-600 border-primary-600 text-white'
                          : 'border-gray-300'
                      }`}
                    >
                      {product.enabled ? '\u2713' : ''}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 truncate">{product.name}</p>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] ${meta.text}`}>{meta.label}</span>
                        <span
                          className={`text-[10px] px-1 py-0.5 rounded ${
                            product.type === 'one_time'
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-green-100 text-green-600'
                          }`}
                        >
                          {product.type === 'one_time' ? 'One-time' : product.billingPeriod}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        value={product.quantity}
                        onChange={(e) => updateProduct(idx, 'quantity', Math.max(1, Number(e.target.value)))}
                        className="input-field w-12 text-xs text-center"
                        disabled={!product.enabled}
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={product.price}
                        onChange={(e) => updateProduct(idx, 'price', e.target.value)}
                        className="input-field w-24 text-xs text-right"
                        disabled={!product.enabled}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <label className="text-sm font-medium text-gray-700">Tax Rate</label>
            <select
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              className="select-field mt-1"
            >
              <option value={0}>0% (Solar tax exemption)</option>
              <option value={7}>7%</option>
              <option value={19}>19%</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {/* Category cost breakdown */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Cost by Category</h3>

            {categoryTotals.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No products selected</p>
            ) : (
              <>
                {/* Stacked bar for one-time costs */}
                {oneTimeCosts > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">One-time costs</p>
                    <div className="h-8 flex rounded-lg overflow-hidden">
                      {categoryTotals
                        .filter((c) => c.oneTime > 0)
                        .map((cat) => (
                          <div
                            key={cat.category}
                            className={`${cat.color} flex items-center justify-center text-white text-xs font-medium transition-all duration-300`}
                            style={{ width: `${(cat.oneTime / oneTimeCosts) * 100}%` }}
                            title={`${cat.label}: EUR ${cat.oneTime.toFixed(2)}`}
                          >
                            {(cat.oneTime / oneTimeCosts) * 100 > 15 ? cat.icon : ''}
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {categoryTotals.map((cat) => (
                    <div key={cat.category} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                      <div className={`w-3 h-3 rounded-sm ${cat.color}`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">{cat.icon} {cat.label}</p>
                        <p className="text-xs text-gray-400">{cat.count} item(s)</p>
                      </div>
                      <div className="text-right">
                        {cat.oneTime > 0 && (
                          <p className="text-sm font-bold">EUR {cat.oneTime.toFixed(2)}</p>
                        )}
                        {cat.recurring > 0 && (
                          <p className="text-xs text-green-600">+ EUR {cat.recurring.toFixed(2)}/mo</p>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="border-t border-gray-200 pt-2 mt-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">One-time total (net)</span>
                      <span className="font-bold text-gray-900">EUR {oneTimeCosts.toFixed(2)}</span>
                    </div>
                    {monthlyCosts > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Monthly total (net)</span>
                        <span className="font-bold text-green-600">EUR {monthlyCosts.toFixed(2)}/mo</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Bundle summary */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Selected Bundle</h3>
            <div className="space-y-1.5">
              {enabledProducts.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm py-1 border-b border-gray-50">
                  <span className="text-gray-600 truncate flex-1 mr-2">
                    {categoryMeta[p.category].icon} {p.name}
                    {p.quantity > 1 && <span className="text-gray-400"> x{p.quantity}</span>}
                  </span>
                  <span className="font-medium whitespace-nowrap">
                    EUR {(parseFloat(p.price) * p.quantity).toFixed(2)}
                    {p.type === 'recurring' && <span className="text-green-600 text-xs">/mo</span>}
                  </span>
                </div>
              ))}
              {enabledProducts.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-2">No products selected</p>
              )}
            </div>
          </div>

          {/* Computed results */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Computed via Library</h3>
            <div className="grid grid-cols-2 gap-3">
              <ResultCard label="Total Net" value={fmtCents(result.amount_subtotal)} />
              <ResultCard label={`Tax (${taxRate}%)`} value={fmtCents(result.amount_tax)} color="amber" />
              <ResultCard label="Total Gross" value={fmtCents(result.amount_total)} highlight color="green" />
              <ResultCard label="Items" value={enabledProducts.length} />
            </div>

            {(result.total_details?.breakdown?.recurrences?.length ?? 0) > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">By Recurrence:</p>
                {result.total_details?.breakdown?.recurrences?.map((r: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-100 text-sm">
                    <span className={r.type === 'one_time' ? 'badge-blue' : 'badge-green'}>
                      {r.type === 'one_time' ? 'One-time' : r.billing_period}
                    </span>
                    <span className="font-medium">{fmtCents(r.amount_total)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Usage */}
      <div className="mt-6">
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
// result.amount_total = ${fmtCents(result.amount_total)}
// Recurrence breakdown available via result.total_details.breakdown.recurrences`}
        />
      </div>
    </div>
  );
}
