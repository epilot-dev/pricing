import { SolarIllustration, WallboxIllustration, HeatPumpIllustration, SmartHomeIllustration } from '../components/ProductShowcase';
import { CodeBlock } from '../components/CodeBlock';

interface OverviewDemoProps {
  onNavigate: (id: string) => void;
}

const energyProducts = [
  {
    id: 'electricity',
    title: 'Electricity Tariffs',
    desc: 'Single & dual-tariff pricing with Grundpreis, Arbeitspreis, and smart meter support',
    icon: '\u26A1',
    gradient: 'gradient-electricity',
    price: 'from 28.5 ct/kWh',
  },
  {
    id: 'gas',
    title: 'Gas Supply',
    desc: 'Gas tariffs with CO2 levy, storage levy, and per-kWh work price breakdowns',
    icon: '\uD83D\uDD25',
    gradient: 'gradient-gas',
    price: 'from 8.9 ct/kWh',
  },
  {
    id: 'house-connection',
    title: 'House Connection',
    desc: 'Hausanschluss fees with distance-based trench work and multi-utility connections',
    icon: '\uD83C\uDFE1',
    gradient: 'gradient-house',
    price: 'from EUR 1,850',
  },
  {
    id: 'non-commodity',
    title: 'Products & Add-ons',
    desc: 'Solar, wallboxes, heat pumps, and smart home bundles with service contracts',
    icon: '\u2600\uFE0F',
    gradient: 'gradient-solar',
    price: 'Bundles from EUR 899',
  },
];

const addOnShowcase = [
  {
    title: 'Solar & Battery',
    desc: 'Complete PV systems with battery storage and installation',
    illustration: SolarIllustration,
    price: 'EUR 12,500',
    sub: '+ EUR 29.90/mo maintenance',
    features: ['10 kWp solar system', '10 kWh battery storage', 'Professional installation', 'Maintenance contract'],
  },
  {
    title: 'E-Mobility',
    desc: 'Wallbox charging solutions for home and fleet',
    illustration: WallboxIllustration,
    price: 'EUR 899',
    sub: '+ EUR 59/mo charging flat rate',
    features: ['11 kW wallbox', 'Professional installation', 'Smart charging', 'Monthly flat rate'],
  },
  {
    title: 'Heat Pumps',
    desc: 'Modern heating solutions with smart controls',
    illustration: HeatPumpIllustration,
    price: 'EUR 15,800',
    sub: '+ EUR 39.90/mo service',
    features: ['Air-to-water system', 'Installation included', 'Smart thermostat', 'Service contract'],
  },
  {
    title: 'Smart Home',
    desc: 'Intelligent energy management and automation',
    illustration: SmartHomeIllustration,
    price: 'EUR 249',
    sub: 'Energy manager from EUR 499',
    features: ['Smart thermostat', 'Energy monitoring', 'App control', 'Consumption insights'],
  },
];

const capabilities = [
  { id: 'per-unit', title: 'Per Unit', icon: '\uD83D\uDCE6' },
  { id: 'tiered-volume', title: 'Tiered Volume', icon: '\uD83D\uDCCA' },
  { id: 'tiered-graduated', title: 'Graduated', icon: '\uD83D\uDCC8' },
  { id: 'tiered-flatfee', title: 'Flat Fee', icon: '\uD83C\uDFF7\uFE0F' },
  { id: 'tax', title: 'Tax', icon: '\uD83E\uDDFE' },
  { id: 'discounts', title: 'Discounts', icon: '\uD83C\uDF9F\uFE0F' },
  { id: 'composite', title: 'Composite', icon: '\uD83E\uDDE9' },
  { id: 'recurring', title: 'Recurring', icon: '\uD83D\uDD04' },
  { id: 'currency', title: 'Currency', icon: '\uD83D\uDCB1' },
  { id: 'dynamic-tariff', title: 'Dynamic', icon: '\u26A1' },
  { id: 'getag', title: 'GetAG', icon: '\uD83D\uDD0C' },
];

export function OverviewDemo({ onNavigate }: OverviewDemoProps) {
  return (
    <div>
      {/* Hero */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
          Interactive Playground
        </div>
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4 tracking-tight leading-tight">
          Energy Pricing,<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-400">
            Made Simple.
          </span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl leading-relaxed">
          Configure tariffs, bundle products, and compute prices in real-time.
          From electricity and gas to solar panels and wallboxes — everything your sales team needs.
        </p>
      </div>

      {/* Stats row */}
      <div className="flex gap-3 mb-12 flex-wrap">
        {[
          { label: 'Pricing Models', value: '6', color: 'bg-blue-50 text-blue-700' },
          { label: 'Billing Periods', value: '6', color: 'bg-emerald-50 text-emerald-700' },
          { label: 'Functions', value: '40+', color: 'bg-amber-50 text-amber-700' },
          { label: 'Decimal Precision', value: '12 digits', color: 'bg-purple-50 text-purple-700' },
        ].map((stat) => (
          <div key={stat.label} className={`stat-pill ${stat.color}`}>
            <span className="font-extrabold">{stat.value}</span>
            <span className="opacity-70">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Energy Products — tariff card grid */}
      <h2 className="text-2xl font-extrabold text-gray-900 mb-1 tracking-tight">Energy Products</h2>
      <p className="text-sm text-gray-400 mb-6">Click any card to explore the interactive tariff configurator</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
        {energyProducts.map((p) => (
          <button
            key={p.id}
            onClick={() => onNavigate(p.id)}
            className="text-left group"
          >
            <div className="tariff-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className={`${p.gradient} px-5 py-4 text-white`}>
                <span className="text-2xl">{p.icon}</span>
                <h3 className="font-bold mt-2 text-base">{p.title}</h3>
              </div>
              <div className="p-5">
                <p className="text-sm text-gray-500 mb-3 leading-relaxed">{p.desc}</p>
                <p className="text-sm font-extrabold text-gray-900">{p.price}</p>
                <p className="text-xs text-primary-600 font-semibold mt-2 group-hover:text-primary-700 transition-colors">
                  Explore tariff &rarr;
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Add-on Showcase with illustrations */}
      <h2 className="text-2xl font-extrabold text-gray-900 mb-1 tracking-tight">Products & Add-ons</h2>
      <p className="text-sm text-gray-400 mb-6">Complete product bundles your customers can visualize and configure</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
        {addOnShowcase.map((product) => {
          const Illustration = product.illustration;
          return (
            <button
              key={product.title}
              onClick={() => onNavigate('non-commodity')}
              className="text-left group"
            >
              <div className="showcase-card">
                <div className="h-40 overflow-hidden">
                  <Illustration />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 mb-1">{product.title}</h3>
                  <p className="text-xs text-gray-400 mb-3">{product.desc}</p>
                  <p className="text-xl font-extrabold text-gray-900">{product.price}</p>
                  <p className="text-xs text-emerald-600 font-medium mt-0.5">{product.sub}</p>
                  <div className="mt-3 space-y-1">
                    {product.features.slice(0, 3).map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px] text-gray-500">
                        <svg className="w-3 h-3 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {f}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-primary-600 font-semibold mt-3 group-hover:text-primary-700">
                    Configure bundle &rarr;
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Capabilities strip */}
      <h2 className="text-2xl font-extrabold text-gray-900 mb-1 tracking-tight">Pricing Capabilities</h2>
      <p className="text-sm text-gray-400 mb-6">Explore individual pricing models and features</p>
      <div className="flex flex-wrap gap-2 mb-14">
        {capabilities.map((c) => (
          <button
            key={c.id}
            onClick={() => onNavigate(c.id)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-gray-100 text-sm font-medium text-gray-600 hover:text-primary-700 hover:border-primary-200 hover:bg-primary-50 transition-all shadow-sm hover:shadow-md"
          >
            <span>{c.icon}</span>
            {c.title}
          </button>
        ))}
      </div>

      {/* Customer journey visualization */}
      <div className="card mb-10">
        <h2 className="text-xl font-extrabold text-gray-900 mb-6 tracking-tight">Customer Journey</h2>
        <div className="flex items-stretch gap-0 overflow-x-auto pb-2">
          {[
            { step: '1', label: 'Browse Products', desc: 'Customer selects tariff or product bundle', icon: '\uD83D\uDED2', color: 'bg-blue-50 text-blue-700' },
            { step: '2', label: 'Configure', desc: 'Adjust consumption, select add-ons, set preferences', icon: '\u2699\uFE0F', color: 'bg-amber-50 text-amber-700' },
            { step: '3', label: 'Price Calculation', desc: 'Real-time pricing with tax, discounts, recurrences', icon: '\uD83D\uDCB0', color: 'bg-emerald-50 text-emerald-700' },
            { step: '4', label: 'Order Summary', desc: 'Clear breakdown for customer and sales team', icon: '\u2705', color: 'bg-purple-50 text-purple-700' },
          ].map((s, i) => (
            <div key={s.step} className="flex items-stretch">
              {i > 0 && (
                <div className="flex items-center px-2">
                  <svg className="w-6 h-6 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
              <div className={`${s.color} rounded-2xl p-5 min-w-[200px] flex-1`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{s.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Step {s.step}</span>
                </div>
                <p className="font-bold text-sm">{s.label}</p>
                <p className="text-xs opacity-70 mt-1">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Start */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
// result.amount_total → 24995 (EUR 249.95)`}
        />
      </div>
    </div>
  );
}
