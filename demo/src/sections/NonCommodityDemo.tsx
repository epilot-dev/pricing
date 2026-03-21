import { useState, useMemo } from 'react';
import { computeAggregatedAndPriceTotals } from '@epilot/pricing';
import { ResultCard } from '../components/ResultCard';
import { buildPriceItemDto, fmtCents } from '../helpers';

type EnergyType = 'power' | 'gas';

interface FeeItem {
  name: string;
  category: string;
  rateCtPerKwh: string;
  enabled: boolean;
}

const powerFees: FeeItem[] = [
  { name: 'Network Fee (Netzentgelt)', category: 'network', rateCtPerKwh: '8.12', enabled: true },
  { name: 'Metering (Messentgelt)', category: 'meter', rateCtPerKwh: '0.42', enabled: true },
  { name: 'Meter Operation (Messstellenbetrieb)', category: 'meter', rateCtPerKwh: '0.33', enabled: true },
  { name: 'Concession Levy (Konzessionsabgabe)', category: 'levy', rateCtPerKwh: '1.66', enabled: true },
  { name: 'CHP Levy (KWK-Aufschlag)', category: 'levy', rateCtPerKwh: '0.275', enabled: true },
  { name: 'Offshore Levy', category: 'levy', rateCtPerKwh: '0.591', enabled: true },
  { name: 'Electricity Tax (Stromsteuer)', category: 'tax', rateCtPerKwh: '2.05', enabled: true },
];

const gasFees: FeeItem[] = [
  { name: 'Network Fee (Netzentgelt)', category: 'network', rateCtPerKwh: '1.62', enabled: true },
  { name: 'Metering (Messentgelt)', category: 'meter', rateCtPerKwh: '0.28', enabled: true },
  { name: 'Meter Operation (Messstellenbetrieb)', category: 'meter', rateCtPerKwh: '0.18', enabled: true },
  { name: 'Concession Levy (Konzessionsabgabe)', category: 'levy', rateCtPerKwh: '0.03', enabled: true },
  { name: 'Gas Storage Levy (Gasspeicherumlage)', category: 'levy', rateCtPerKwh: '0.059', enabled: true },
  { name: 'CO2 Levy', category: 'levy', rateCtPerKwh: '0.546', enabled: true },
  { name: 'Gas Tax (Erdgassteuer)', category: 'tax', rateCtPerKwh: '0.55', enabled: true },
];

const categoryColors: Record<string, { bg: string; text: string; bar: string; label: string }> = {
  network: { bg: 'bg-blue-50', text: 'text-blue-700', bar: 'bg-blue-400', label: 'Network' },
  meter: { bg: 'bg-teal-50', text: 'text-teal-700', bar: 'bg-teal-400', label: 'Metering' },
  levy: { bg: 'bg-purple-50', text: 'text-purple-700', bar: 'bg-purple-400', label: 'Levies' },
  tax: { bg: 'bg-red-50', text: 'text-red-700', bar: 'bg-red-400', label: 'Taxes' },
};

export function NonCommodityDemo() {
  const [energyType, setEnergyType] = useState<EnergyType>('power');
  const [fees, setFees] = useState<FeeItem[]>(powerFees);
  const [consumption, setConsumption] = useState(3500);
  const [baseNetworkFee, setBaseNetworkFee] = useState('48.00');
  const [vatRate, setVatRate] = useState(19);

  const switchEnergyType = (type: EnergyType) => {
    setEnergyType(type);
    setFees(type === 'power' ? powerFees : gasFees);
    setConsumption(type === 'power' ? 3500 : 15000);
  };

  const toggleFee = (idx: number) => {
    setFees((prev) => prev.map((f, i) => (i === idx ? { ...f, enabled: !f.enabled } : f)));
  };

  const updateFeeRate = (idx: number, value: string) => {
    setFees((prev) => prev.map((f, i) => (i === idx ? { ...f, rateCtPerKwh: value } : f)));
  };

  const result = useMemo(() => {
    const items: any[] = [];

    // Fixed base network fee (annual)
    items.push(
      buildPriceItemDto({
        unitAmountDecimal: baseNetworkFee,
        quantity: 1,
        type: 'recurring',
        billingPeriod: 'yearly',
        taxRate: vatRate,
        isTaxInclusive: false,
        description: 'Base Network Fee (Grundpreis Netz)',
      }),
    );

    // Each enabled fee as a per-kWh charge
    fees
      .filter((f) => f.enabled)
      .forEach((fee) => {
        items.push(
          buildPriceItemDto({
            unitAmountDecimal: (parseFloat(fee.rateCtPerKwh)).toFixed(4),
            quantity: consumption,
            type: 'recurring',
            billingPeriod: 'yearly',
            taxRate: vatRate,
            isTaxInclusive: false,
            description: fee.name,
          }),
        );
      });

    return computeAggregatedAndPriceTotals(items);
  }, [fees, consumption, baseNetworkFee, vatRate]);

  // Category totals
  const categoryTotals = ['network', 'meter', 'levy', 'tax'].map((cat) => ({
    category: cat,
    ...categoryColors[cat],
    total: fees
      .filter((f) => f.category === cat && f.enabled)
      .reduce((sum, f) => sum + parseFloat(f.rateCtPerKwh) * consumption, 0),
  }));
  const baseCost = parseFloat(baseNetworkFee);
  const allFeesTotal = categoryTotals.reduce((s, c) => s + c.total, 0);
  const grandTotalNet = baseCost + allFeesTotal;

  return (
    <div>
      <h1 className="section-title">Non-Commodity Fees</h1>
      <p className="section-desc">
        Non-commodity costs include network fees, metering charges, government levies, and energy taxes.
        These are separate from the commodity (energy) price and typically regulated or set by the grid operator.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {/* Energy type toggle */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Energy Type</h3>
            <div className="flex gap-2">
              {([
                { type: 'power' as const, label: 'Electricity', icon: '\u26A1' },
                { type: 'gas' as const, label: 'Gas', icon: '\uD83D\uDD25' },
              ]).map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => switchEnergyType(opt.type)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    energyType === opt.type
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Base fee */}
          <div className="card">
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Base Network Fee (fixed annual)</h4>
              <input
                type="number"
                step="0.01"
                value={baseNetworkFee}
                onChange={(e) => setBaseNetworkFee(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          {/* Fee items */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Fee Components (ct/kWh)</h3>
            <div className="space-y-2">
              {fees.map((fee, idx) => {
                const colors = categoryColors[fee.category];
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-2 rounded-lg border transition-colors ${
                      fee.enabled ? `${colors.bg} border-transparent` : 'bg-gray-50 border-gray-100 opacity-50'
                    }`}
                  >
                    <button
                      onClick={() => toggleFee(idx)}
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center text-[10px] ${
                        fee.enabled
                          ? 'bg-primary-600 border-primary-600 text-white'
                          : 'border-gray-300'
                      }`}
                    >
                      {fee.enabled ? '\u2713' : ''}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 truncate">{fee.name}</p>
                      <span className={`text-[10px] ${colors.text}`}>{colors.label}</span>
                    </div>
                    <input
                      type="number"
                      step="0.001"
                      value={fee.rateCtPerKwh}
                      onChange={(e) => updateFeeRate(idx, e.target.value)}
                      className="input-field w-20 text-xs text-right"
                      disabled={!fee.enabled}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Consumption */}
          <div className="card">
            <label className="text-sm font-medium text-gray-700">
              Annual Consumption:{' '}
              <span className="text-primary-600 font-bold">{consumption.toLocaleString()} kWh</span>
            </label>
            <input
              type="range"
              min={energyType === 'power' ? 1000 : 5000}
              max={energyType === 'power' ? 10000 : 50000}
              step={energyType === 'power' ? 100 : 500}
              value={consumption}
              onChange={(e) => setConsumption(Number(e.target.value))}
              className="w-full mt-2 accent-primary-600"
            />
          </div>
        </div>

        <div className="space-y-4">
          {/* Category breakdown bar */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Annual Non-Commodity Costs</h3>

            <div className="h-10 flex rounded-lg overflow-hidden mb-4">
              <div
                className="bg-gray-400 flex items-center justify-center text-white text-xs font-medium"
                style={{ width: `${Math.max((baseCost / grandTotalNet) * 100, 1)}%` }}
                title={`Base: EUR ${baseCost.toFixed(2)}`}
              >
                {(baseCost / grandTotalNet) * 100 > 8 ? 'Base' : ''}
              </div>
              {categoryTotals
                .filter((c) => c.total > 0)
                .map((cat) => (
                  <div
                    key={cat.category}
                    className={`${cat.bar} flex items-center justify-center text-white text-xs font-medium transition-all duration-300`}
                    style={{ width: `${Math.max((cat.total / grandTotalNet) * 100, 1)}%` }}
                    title={`${cat.label}: EUR ${cat.total.toFixed(2)}`}
                  >
                    {(cat.total / grandTotalNet) * 100 > 8 ? cat.label : ''}
                  </div>
                ))}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                <div className="w-3 h-3 rounded-sm bg-gray-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">Base Network Fee</p>
                  <p className="text-xs text-gray-400">Fixed annual</p>
                </div>
                <span className="font-bold text-sm">EUR {baseCost.toFixed(2)}</span>
              </div>
              {categoryTotals
                .filter((c) => c.total > 0)
                .map((cat) => (
                  <div key={cat.category} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                    <div className={`w-3 h-3 rounded-sm ${cat.bar}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">{cat.label}</p>
                      <p className="text-xs text-gray-400">
                        {fees
                          .filter((f) => f.category === cat.category && f.enabled)
                          .length}{' '}
                        component(s)
                      </p>
                    </div>
                    <span className="font-bold text-sm">EUR {cat.total.toFixed(2)}</span>
                  </div>
                ))}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Total Non-Commodity (net)</span>
                  <span className="text-lg font-bold text-gray-900">EUR {grandTotalNet.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Per-kWh summary */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Per-kWh Breakdown</h3>
            <div className="space-y-1.5">
              {fees
                .filter((f) => f.enabled)
                .map((fee, idx) => {
                  const totalRate = fees
                    .filter((f) => f.enabled)
                    .reduce((s, f) => s + parseFloat(f.rateCtPerKwh), 0);
                  const pct = (parseFloat(fee.rateCtPerKwh) / totalRate) * 100;
                  const colors = categoryColors[fee.category];
                  return (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-500 w-32 truncate" title={fee.name}>
                        {fee.name.split('(')[0].trim()}
                      </span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className={`${colors.bar} h-full rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] font-medium w-14 text-right">{fee.rateCtPerKwh} ct</span>
                    </div>
                  );
                })}
              <div className="border-t border-gray-200 pt-2 text-right">
                <span className="text-sm font-bold text-gray-900">
                  Total:{' '}
                  {fees
                    .filter((f) => f.enabled)
                    .reduce((s, f) => s + parseFloat(f.rateCtPerKwh), 0)
                    .toFixed(3)}{' '}
                  ct/kWh
                </span>
              </div>
            </div>
          </div>

          {/* Computed results */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Computed via Library</h3>
            <div className="grid grid-cols-2 gap-3">
              <ResultCard label="Annual Net" value={fmtCents(result.amount_subtotal)} />
              <ResultCard label={`VAT (${vatRate}%)`} value={fmtCents(result.amount_tax)} color="amber" />
              <ResultCard label="Annual Gross" value={fmtCents(result.amount_total)} highlight color="green" />
              <ResultCard
                label="Monthly Gross"
                value={fmtCents(Math.round((result.amount_total ?? 0) / 12))}
                color="blue"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
