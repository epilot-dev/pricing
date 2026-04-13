import { computeAggregatedAndPriceTotals } from '@epilot/pricing';
import type { PriceItem } from '@epilot/pricing/shared/types';
import { useState, useMemo } from 'react';
import { CodeBlock } from '../components/CodeBlock';
import { ResultCard } from '../components/ResultCard';
import { TariffCard } from '../components/TariffCard';
import { buildPriceItemDto, fmtCents, fmtEur } from '../helpers';

interface ConnectionItem {
  name: string;
  unitAmountDecimal: string;
  quantity: number;
  type: PriceItem['type'];
  billingPeriod?: PriceItem['billing_period'];
  icon: string;
}

const defaultItems: ConnectionItem[] = [
  { name: 'Electricity Connection', unitAmountDecimal: '1850.00', quantity: 1, type: 'one_time', icon: '⚡' },
  { name: 'Gas Connection', unitAmountDecimal: '1450.00', quantity: 1, type: 'one_time', icon: '🔥' },
  { name: 'Water Connection', unitAmountDecimal: '2200.00', quantity: 1, type: 'one_time', icon: '💧' },
  { name: 'Construction Power Supply', unitAmountDecimal: '350.00', quantity: 1, type: 'one_time', icon: '🚧' },
  {
    name: 'Meter Installation Fee',
    unitAmountDecimal: '12.50',
    quantity: 1,
    type: 'recurring',
    billingPeriod: 'monthly',
    icon: '📋',
  },
];

export function HouseConnectionDemo() {
  const [items, setItems] = useState<ConnectionItem[]>(defaultItems);
  const [taxRate] = useState(19);
  const [distance, setDistance] = useState(15);
  const [perMeterRate, setPerMeterRate] = useState('85.00');

  const trenchCost = distance * parseFloat(perMeterRate);

  const result = useMemo(() => {
    const priceItems = items.map((item) =>
      buildPriceItemDto({
        unitAmountDecimal: item.unitAmountDecimal,
        quantity: item.quantity,
        type: item.type,
        billingPeriod: item.billingPeriod,
        taxRate,
        isTaxInclusive: false,
        description: item.name,
      }),
    );

    priceItems.push(
      buildPriceItemDto({
        unitAmountDecimal: trenchCost.toFixed(2),
        quantity: 1,
        type: 'one_time',
        taxRate,
        isTaxInclusive: false,
        description: 'Trench Work',
      }),
    );

    return computeAggregatedAndPriceTotals(priceItems);
  }, [items, taxRate, trenchCost]);

  const updateItem = (idx: number, field: keyof ConnectionItem, value: unknown) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };

  const toggleItem = (idx: number) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, quantity: item.quantity > 0 ? 0 : 1 } : item)));
  };

  const oneTimeCosts = items
    .filter((i) => i.type === 'one_time' && i.quantity > 0)
    .reduce((sum, i) => sum + parseFloat(i.unitAmountDecimal) * i.quantity, 0);
  const recurringCosts = items
    .filter((i) => i.type === 'recurring' && i.quantity > 0)
    .reduce((sum, i) => sum + parseFloat(i.unitAmountDecimal) * i.quantity, 0);
  const totalOneTime = oneTimeCosts + trenchCost;

  return (
    <div>
      <p className="text-[10px] font-bold text-primary-400 uppercase tracking-widest mb-1">
        Use Case: Utility Connection Packages
      </p>
      <h1 className="section-title">House Connection</h1>
      <p className="section-desc">
        Configure house connection pricing for new builds. Combines connection fees, distance-based trench work, and
        recurring meter costs.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — Controls */}
        <div className="lg:col-span-1 space-y-4">
          {/* Connection items */}
          <div className="card">
            <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-3">Connection Services</p>
            <div className="space-y-1.5">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl transition-all ${
                    item.quantity > 0
                      ? 'bg-white border border-primary-100 shadow-sm'
                      : 'bg-gray-50 border border-transparent opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleItem(idx)}
                      className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center text-[10px] transition-colors ${
                        item.quantity > 0 ? 'bg-primary-600 border-primary-600 text-white' : 'border-gray-300 bg-white'
                      }`}
                    >
                      {item.quantity > 0 ? '✓' : ''}
                    </button>
                    <span className="text-base">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-700">{item.name}</p>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                          item.type === 'one_time' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                        }`}
                      >
                        {item.type === 'one_time' ? 'One-time' : `${item.billingPeriod}`}
                      </span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      value={item.unitAmountDecimal}
                      onChange={(e) => updateItem(idx, 'unitAmountDecimal', e.target.value)}
                      className="input-field w-24 text-xs text-right"
                      disabled={item.quantity === 0}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Distance-based pricing */}
          <div className="card">
            <div className="p-4 bg-amber-50 rounded-xl">
              <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3">Trench Work</p>
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Distance to Grid</label>
                  <span className="text-sm font-extrabold text-amber-600">{distance} m</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="1"
                  value={distance}
                  onChange={(e) => setDistance(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-gray-300 mt-1">
                  <span>5 m</span>
                  <span>100 m</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-amber-600 font-medium">EUR/m rate</label>
                  <input
                    type="number"
                    step="0.01"
                    value={perMeterRate}
                    onChange={(e) => setPerMeterRate(e.target.value)}
                    className="input-field mt-1"
                  />
                </div>
                <div className="flex items-end">
                  <div className="p-3 bg-amber-100 rounded-xl text-center w-full">
                    <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Total</p>
                    <p className="font-extrabold text-amber-800">{fmtEur(trenchCost)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column — Tariff card + results */}
        <div className="lg:col-span-2 space-y-5">
          <TariffCard
            gradient="gradient-house"
            icon={<span>🏡</span>}
            title="House Connection"
            subtitle="New build connection package"
            badge="CONNECTION"
            price={`${fmtEur(totalOneTime)}`}
            priceUnit=""
            priceLabel="Total one-time costs (net)"
            footer={
              recurringCosts > 0 ? (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Recurring costs</span>
                  <span className="font-extrabold text-emerald-600">{fmtEur(recurringCosts)}/month</span>
                </div>
              ) : undefined
            }
          >
            {/* Line items */}
            {items
              .filter((i) => i.quantity > 0 && i.type === 'one_time')
              .map((item, idx) => {
                const cost = parseFloat(item.unitAmountDecimal) * item.quantity;
                return (
                  <div key={idx} className="cost-line">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{item.icon}</span>
                      <span className="cost-line-label">{item.name}</span>
                    </div>
                    <span className="cost-line-value">{fmtEur(cost)}</span>
                  </div>
                );
              })}

            <div className="cost-line">
              <div className="flex items-center gap-2">
                <span className="text-sm">🛠️</span>
                <div>
                  <span className="cost-line-label">Trench Work</span>
                  <p className="text-[10px] text-gray-400">
                    {distance}m x {fmtEur(parseFloat(perMeterRate))}/m
                  </p>
                </div>
              </div>
              <span className="cost-line-value">{fmtEur(trenchCost)}</span>
            </div>

            {items
              .filter((i) => i.quantity > 0 && i.type === 'recurring')
              .map((item, idx) => (
                <div key={idx} className="cost-line">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{item.icon}</span>
                    <div>
                      <span className="cost-line-label">{item.name}</span>
                      <p className="text-[10px] text-emerald-500 font-medium">/{item.billingPeriod}</p>
                    </div>
                  </div>
                  <span className="cost-line-value text-emerald-600">{fmtEur(parseFloat(item.unitAmountDecimal))}</span>
                </div>
              ))}
          </TariffCard>

          {/* Computed results */}
          <div className="card">
            <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-4">
              Computed via @epilot/pricing
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <ResultCard label="Total Net" value={fmtCents(result.amount_subtotal)} />
              <ResultCard label={`Tax (${taxRate}%)`} value={fmtCents(result.amount_tax)} color="amber" highlight />
              <ResultCard label="Total Gross" value={fmtCents(result.amount_total)} highlight color="green" />
              <ResultCard label="Items" value={result.items?.length ?? 0} color="blue" highlight />
            </div>

            {(result.total_details?.breakdown?.recurrences?.length ?? 0) > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-3">By Recurrence</p>
                <div className="space-y-2">
                  {result.total_details?.breakdown?.recurrences?.map((r, i: number) => (
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

// House connection: mix of one-time and recurring items
const items = [
${items
  .filter((i) => i.quantity > 0)
  .map(
    (i) => `  {
    quantity: ${i.quantity},
    _price: {
      unit_amount: ${Math.round(parseFloat(i.unitAmountDecimal) * 100)},
      unit_amount_decimal: '${i.unitAmountDecimal}',
      unit_amount_currency: 'EUR',
      pricing_model: 'per_unit',
      is_tax_inclusive: false,
      type: '${i.type}',${i.billingPeriod ? `\n      billing_period: '${i.billingPeriod}',` : ''}
      tax: [{ rate: ${taxRate}, type: 'VAT' }],
      description: '${i.name}',
    },
  },`,
  )
  .join('\n')}
  {
    quantity: 1,
    _price: {
      unit_amount: ${Math.round(trenchCost * 100)},
      unit_amount_decimal: '${trenchCost.toFixed(2)}',
      unit_amount_currency: 'EUR',
      pricing_model: 'per_unit',
      is_tax_inclusive: false,
      type: 'one_time',
      tax: [{ rate: ${taxRate}, type: 'VAT' }],
      description: 'Trench Work (${distance}m)',
    },
  },
];

const result = computeAggregatedAndPriceTotals(items);
// result.amount_total = ${fmtCents(result.amount_total)}`}
        />
      </div>
    </div>
  );
}
