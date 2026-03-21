import { useState, useMemo } from 'react';
import { computeAggregatedAndPriceTotals } from '@epilot/pricing';
import { ResultCard } from '../components/ResultCard';
import { buildPriceItemDto, fmtCents } from '../helpers';

interface ConnectionItem {
  name: string;
  unitAmountDecimal: string;
  quantity: number;
  type: 'one_time' | 'recurring';
  billingPeriod?: string;
}

const defaultItems: ConnectionItem[] = [
  { name: 'Electricity Connection', unitAmountDecimal: '1850.00', quantity: 1, type: 'one_time' },
  { name: 'Gas Connection', unitAmountDecimal: '1450.00', quantity: 1, type: 'one_time' },
  { name: 'Water Connection', unitAmountDecimal: '2200.00', quantity: 1, type: 'one_time' },
  { name: 'Construction Power Supply', unitAmountDecimal: '350.00', quantity: 1, type: 'one_time' },
  { name: 'Meter Installation Fee', unitAmountDecimal: '12.50', quantity: 1, type: 'recurring', billingPeriod: 'monthly' },
];

export function HouseConnectionDemo() {
  const [items, setItems] = useState<ConnectionItem[]>(defaultItems);
  const [taxRate, setTaxRate] = useState(19);
  const [distance, setDistance] = useState(15);
  const [perMeterRate, setPerMeterRate] = useState('85.00');

  // Trench cost based on distance
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

    // Add trench/distance-based cost
    priceItems.push(
      buildPriceItemDto({
        unitAmountDecimal: trenchCost.toFixed(2),
        quantity: 1,
        type: 'one_time',
        taxRate,
        isTaxInclusive: false,
        description: 'Trench Work (Tiefbau)',
      }),
    );

    return computeAggregatedAndPriceTotals(priceItems);
  }, [items, taxRate, trenchCost]);

  const updateItem = (idx: number, field: keyof ConnectionItem, value: any) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };

  const toggleItem = (idx: number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, quantity: item.quantity > 0 ? 0 : 1 } : item)),
    );
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
      <h1 className="section-title">House Connection</h1>
      <p className="section-desc">
        Hausanschluss (house connection) pricing for new builds and renovations.
        Combines one-time connection fees, distance-based trench work, and recurring meter costs.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {/* Connection items */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Connection Services</h3>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border transition-colors ${
                    item.quantity > 0
                      ? 'bg-white border-primary-200'
                      : 'bg-gray-50 border-gray-100 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleItem(idx)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs transition-colors ${
                        item.quantity > 0
                          ? 'bg-primary-600 border-primary-600 text-white'
                          : 'border-gray-300'
                      }`}
                    >
                      {item.quantity > 0 ? '\u2713' : ''}
                    </button>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">{item.name}</p>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded ${
                          item.type === 'one_time'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {item.type === 'one_time' ? 'One-time' : `${item.billingPeriod}`}
                      </span>
                    </div>
                    <div className="w-28">
                      <input
                        type="number"
                        step="0.01"
                        value={item.unitAmountDecimal}
                        onChange={(e) => updateItem(idx, 'unitAmountDecimal', e.target.value)}
                        className="input-field text-xs text-right"
                        disabled={item.quantity === 0}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Distance-based pricing */}
          <div className="card">
            <div className="p-3 bg-amber-50 rounded-lg">
              <h4 className="text-sm font-medium text-amber-800 mb-2">Trench Work (Tiefbau)</h4>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Distance to grid: <span className="text-amber-600 font-bold">{distance} m</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="1"
                  value={distance}
                  onChange={(e) => setDistance(Number(e.target.value))}
                  className="w-full mt-1 accent-amber-500"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>5 m</span>
                  <span>100 m</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="text-xs text-amber-600">Rate per meter (EUR/m)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={perMeterRate}
                    onChange={(e) => setPerMeterRate(e.target.value)}
                    className="input-field mt-1"
                  />
                </div>
                <div className="flex items-end">
                  <div className="p-2 bg-amber-100 rounded text-center w-full">
                    <p className="text-xs text-amber-600">Total Trench Cost</p>
                    <p className="font-bold text-amber-800">EUR {trenchCost.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Visual overview */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Cost Overview</h3>

            {/* Connection type breakdown */}
            <div className="space-y-3 mb-4">
              {items
                .filter((i) => i.quantity > 0 && i.type === 'one_time')
                .map((item, idx) => {
                  const cost = parseFloat(item.unitAmountDecimal) * item.quantity;
                  return (
                    <div key={idx} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                      <span className="text-sm text-gray-700">{item.name}</span>
                      <span className="font-semibold text-sm">EUR {cost.toFixed(2)}</span>
                    </div>
                  );
                })}
              <div className="flex items-center justify-between p-2 bg-amber-50 rounded">
                <span className="text-sm text-gray-700">Trench Work ({distance}m x EUR {parseFloat(perMeterRate).toFixed(2)})</span>
                <span className="font-semibold text-sm">EUR {trenchCost.toFixed(2)}</span>
              </div>
              {items
                .filter((i) => i.quantity > 0 && i.type === 'recurring')
                .map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <div>
                      <span className="text-sm text-gray-700">{item.name}</span>
                      <span className="text-xs text-green-600 ml-2">/{item.billingPeriod}</span>
                    </div>
                    <span className="font-semibold text-sm">EUR {parseFloat(item.unitAmountDecimal).toFixed(2)}</span>
                  </div>
                ))}
            </div>

            <div className="border-t border-gray-200 pt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">One-time costs (net)</span>
                <span className="font-bold text-gray-900">EUR {totalOneTime.toFixed(2)}</span>
              </div>
              {recurringCosts > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Recurring costs (net)</span>
                  <span className="font-bold text-gray-900">EUR {recurringCosts.toFixed(2)}/month</span>
                </div>
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
              <ResultCard label="Items" value={result.items?.length ?? 0} />
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
    </div>
  );
}
