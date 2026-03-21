import { CodeBlock } from '../components/CodeBlock';

interface OverviewDemoProps {
  onNavigate: (id: string) => void;
}

const features = [
  {
    id: 'per-unit',
    title: 'Per Unit Pricing',
    desc: 'Simple price x quantity calculations with tax support',
    icon: '📦',
    color: 'bg-blue-50 border-blue-200',
  },
  {
    id: 'tiered-volume',
    title: 'Tiered Volume',
    desc: 'Single tier selected based on total quantity',
    icon: '📊',
    color: 'bg-indigo-50 border-indigo-200',
  },
  {
    id: 'tiered-graduated',
    title: 'Tiered Graduated',
    desc: 'Different rates apply to different quantity ranges',
    icon: '📈',
    color: 'bg-purple-50 border-purple-200',
  },
  {
    id: 'tiered-flatfee',
    title: 'Tiered Flat Fee',
    desc: 'Fixed fee based on quantity range',
    icon: '🏷️',
    color: 'bg-pink-50 border-pink-200',
  },
  {
    id: 'tax',
    title: 'Tax Handling',
    desc: 'Inclusive/exclusive tax with multi-rate breakdown',
    icon: '🧾',
    color: 'bg-green-50 border-green-200',
  },
  {
    id: 'discounts',
    title: 'Discounts & Coupons',
    desc: 'Fixed, percentage, and cashback coupon types',
    icon: '🎟️',
    color: 'bg-amber-50 border-amber-200',
  },
  {
    id: 'composite',
    title: 'Composite Pricing',
    desc: 'Multi-component bundled price items',
    icon: '🧩',
    color: 'bg-cyan-50 border-cyan-200',
  },
  {
    id: 'recurring',
    title: 'Recurring Billing',
    desc: 'Billing periods and frequency normalization',
    icon: '🔄',
    color: 'bg-teal-50 border-teal-200',
  },
  {
    id: 'currency',
    title: 'Currency & Formatting',
    desc: 'Multi-currency support with locale-aware formatting',
    icon: '💱',
    color: 'bg-emerald-50 border-emerald-200',
  },
  {
    id: 'dynamic-tariff',
    title: 'Dynamic Tariff',
    desc: 'Market-based pricing with configurable markup',
    icon: '⚡',
    color: 'bg-yellow-50 border-yellow-200',
  },
  {
    id: 'getag',
    title: 'GetAG Energy Pricing',
    desc: 'German energy operator integration with tiered markups',
    icon: '🔌',
    color: 'bg-orange-50 border-orange-200',
  },
];

const useCases = [
  {
    id: 'electricity',
    title: 'Electricity',
    desc: 'Single & dual-tariff (HT/NT) electricity pricing with Grundpreis and Arbeitspreis',
    icon: '⚡',
    color: 'bg-yellow-50 border-yellow-200',
  },
  {
    id: 'gas',
    title: 'Gas',
    desc: 'Gas supply tariffs with CO2 levy, gas storage levy, and per-kWh work price',
    icon: '🔥',
    color: 'bg-orange-50 border-orange-200',
  },
  {
    id: 'house-connection',
    title: 'House Connection',
    desc: 'Hausanschluss fees with distance-based trench work and connection services',
    icon: '🏡',
    color: 'bg-emerald-50 border-emerald-200',
  },
  {
    id: 'non-commodity',
    title: 'Non-Commodity',
    desc: 'Solar panels, wallboxes, heat pumps, and smart home products with service contracts',
    icon: '📋',
    color: 'bg-purple-50 border-purple-200',
  },
];

export function OverviewDemo({ onNavigate }: OverviewDemoProps) {
  return (
    <div>
      {/* Hero */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
          epilot Pricing Playground
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl">
          Interactive playground for <code className="text-sm bg-gray-100 px-1.5 py-0.5 rounded font-mono">@epilot/pricing</code> — a comprehensive
          pricing calculation engine supporting 6 pricing models, tax handling,
          discounts, composite pricing, recurring billing, multi-currency formatting, and
          energy-market integrations. Explore each capability below.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Pricing Models', value: '6' },
          { label: 'Exported Functions', value: '40+' },
          { label: 'Billing Periods', value: '6' },
          { label: 'Decimal Precision', value: '12 digits' },
        ].map((stat) => (
          <div key={stat.label} className="card text-center">
            <p className="text-2xl font-bold text-primary-600">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Use Cases */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">Energy & Utility Use Cases</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {useCases.map((f) => (
          <button
            key={f.id}
            onClick={() => onNavigate(f.id)}
            className={`text-left p-5 rounded-xl border ${f.color} hover:shadow-md transition-shadow group`}
          >
            <span className="text-2xl">{f.icon}</span>
            <h3 className="font-semibold text-gray-900 mt-2 group-hover:text-primary-600 transition-colors">
              {f.title}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{f.desc}</p>
          </button>
        ))}
      </div>

      {/* Capabilities */}
      <h2 className="text-xl font-bold text-gray-900 mb-4 mt-10">Capabilities</h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((f) => (
          <button
            key={f.id}
            onClick={() => onNavigate(f.id)}
            className={`text-left p-5 rounded-xl border ${f.color} hover:shadow-md transition-shadow group`}
          >
            <span className="text-2xl">{f.icon}</span>
            <h3 className="font-semibold text-gray-900 mt-2 group-hover:text-primary-600 transition-colors">
              {f.title}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{f.desc}</p>
          </button>
        ))}
      </div>

      {/* Quick Start */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CodeBlock
          title="Install"
          language="bash"
          code={`npm install @epilot/pricing`}
        />
        <CodeBlock
          title="Quick Start"
          code={`import { computeAggregatedAndPriceTotals } from '@epilot/pricing';

const priceItem = {
  quantity: 5,
  pricing_model: 'per_unit',
  is_tax_inclusive: true,
  _price: {
    unit_amount_decimal: '49.99',
    unit_amount_currency: 'EUR',
    pricing_model: 'per_unit',
    is_tax_inclusive: true,
    tax: [{ rate: 19, type: 'VAT' }],
  },
  taxes: [{ tax: { rate: 19 } }],
};

const result = computeAggregatedAndPriceTotals([priceItem]);
// result.amount_total → 24995 (€249.95)`}
        />
      </div>

      {/* Architecture */}
      <div className="mt-10 card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">How It Works</h2>
        <div className="flex items-center gap-4 text-sm overflow-x-auto pb-2">
          {[
            { step: '1', label: 'Price Items', desc: 'Define price, quantity, tax, coupons' },
            { step: '2', label: 'Compute', desc: 'computeAggregatedAndPriceTotals()' },
            { step: '3', label: 'Results', desc: 'Subtotals, tax, discounts, recurrences' },
          ].map((s, i) => (
            <div key={s.step} className="flex items-center gap-4">
              {i > 0 && (
                <svg className="w-6 h-6 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
              <div className="bg-gray-50 rounded-lg p-4 min-w-[180px]">
                <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center mb-2">
                  {s.step}
                </div>
                <p className="font-semibold text-gray-900">{s.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
