import { useState, useMemo } from 'react';
import { computeAggregatedAndPriceTotals } from '@epilot/pricing';
import { ResultCard } from '../components/ResultCard';
import { buildPriceItemDto, fmtCents } from '../helpers';

export function GasDemo() {
  const [basePrice, setBasePrice] = useState('144.00');
  const [workPrice, setWorkPrice] = useState('8.90');
  const [markup, setMarkup] = useState('1.80');
  const [consumption, setConsumption] = useState(15000);
  const [co2Levy, setCo2Levy] = useState('0.546');
  const [gasStorageLevy, setGasStorageLevy] = useState('0.059');
  const [taxRate, setTaxRate] = useState(19);

  const result = useMemo(() => {
    const items: any[] = [];

    // Base price
    items.push(
      buildPriceItemDto({
        unitAmountDecimal: basePrice,
        quantity: 1,
        type: 'recurring',
        billingPeriod: 'yearly',
        taxRate,
        isTaxInclusive: false,
        description: 'Grundpreis (Base Price)',
      }),
    );

    // Work price + markup + levies per kWh
    const totalPerKwh =
      parseFloat(workPrice) + parseFloat(markup) + parseFloat(co2Levy) + parseFloat(gasStorageLevy);
    items.push(
      buildPriceItemDto({
        unitAmountDecimal: totalPerKwh.toFixed(4),
        quantity: consumption,
        type: 'recurring',
        billingPeriod: 'yearly',
        taxRate,
        isTaxInclusive: false,
        description: 'Arbeitspreis (Work Price)',
      }),
    );

    return computeAggregatedAndPriceTotals(items);
  }, [basePrice, workPrice, markup, consumption, co2Levy, gasStorageLevy, taxRate]);

  const baseCost = parseFloat(basePrice);
  const workRate = parseFloat(workPrice) + parseFloat(markup);
  const levyRate = parseFloat(co2Levy) + parseFloat(gasStorageLevy);
  const workCost = workRate * consumption;
  const levyCost = levyRate * consumption;
  const totalNet = baseCost + workCost + levyCost;

  return (
    <div>
      <h1 className="section-title">Gas Tariff</h1>
      <p className="section-desc">
        German gas supply pricing with Grundpreis, Arbeitspreis, and gas-specific levies
        including CO2 tax and gas storage levy. Typical household consumption: 10,000 - 25,000 kWh/year.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {/* Base price */}
          <div className="card">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Grundpreis (Base Price)</h4>
              <div>
                <label className="text-xs text-blue-600">Annual base fee (EUR/year)</label>
                <input
                  type="number"
                  step="0.01"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  className="input-field mt-1"
                />
              </div>
            </div>
          </div>

          {/* Work price */}
          <div className="card">
            <div className="p-3 bg-orange-50 rounded-lg mb-3">
              <h4 className="text-sm font-medium text-orange-800 mb-2">Arbeitspreis (Work Price)</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-orange-600">Base price (ct/kWh)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={workPrice}
                    onChange={(e) => setWorkPrice(e.target.value)}
                    className="input-field mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-orange-600">Markup (ct/kWh)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={markup}
                    onChange={(e) => setMarkup(e.target.value)}
                    className="input-field mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Gas-specific levies */}
            <div className="p-3 bg-red-50 rounded-lg">
              <h4 className="text-sm font-medium text-red-800 mb-2">Gas Levies</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-red-600">CO2 levy (ct/kWh)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={co2Levy}
                    onChange={(e) => setCo2Levy(e.target.value)}
                    className="input-field mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-red-600">Gas storage levy (ct/kWh)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={gasStorageLevy}
                    onChange={(e) => setGasStorageLevy(e.target.value)}
                    className="input-field mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Consumption */}
          <div className="card">
            <label className="text-sm font-medium text-gray-700">
              Annual Consumption: <span className="text-primary-600 font-bold">{consumption.toLocaleString()} kWh</span>
            </label>
            <input
              type="range"
              min="5000"
              max="50000"
              step="500"
              value={consumption}
              onChange={(e) => setConsumption(Number(e.target.value))}
              className="w-full mt-2 accent-primary-600"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>5,000 kWh</span>
              <span>50,000 kWh</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Cost breakdown */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Annual Cost Breakdown</h3>
            <div className="h-10 flex rounded-lg overflow-hidden mb-4">
              {[
                { value: baseCost, color: 'bg-blue-400', label: 'Base' },
                { value: workCost, color: 'bg-orange-400', label: 'Work' },
                { value: levyCost, color: 'bg-red-400', label: 'Levies' },
              ].map((seg) => (
                <div
                  key={seg.label}
                  className={`${seg.color} flex items-center justify-center text-white text-xs font-medium transition-all duration-300`}
                  style={{ width: `${Math.max((seg.value / totalNet) * 100, 1)}%` }}
                  title={`${seg.label}: EUR ${seg.value.toFixed(2)}`}
                >
                  {(seg.value / totalNet) * 100 > 10 ? seg.label : ''}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                <div className="w-3 h-3 rounded-sm bg-blue-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">Grundpreis</p>
                  <p className="text-xs text-gray-400">EUR {parseFloat(basePrice).toFixed(2)}/year</p>
                </div>
                <span className="font-bold text-sm">EUR {baseCost.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                <div className="w-3 h-3 rounded-sm bg-orange-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">Arbeitspreis + Markup</p>
                  <p className="text-xs text-gray-400">
                    {workRate.toFixed(2)} ct/kWh x {consumption.toLocaleString()} kWh
                  </p>
                </div>
                <span className="font-bold text-sm">EUR {workCost.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                <div className="w-3 h-3 rounded-sm bg-red-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">Gas Levies</p>
                  <p className="text-xs text-gray-400">
                    {levyRate.toFixed(3)} ct/kWh x {consumption.toLocaleString()} kWh (CO2 + storage)
                  </p>
                </div>
                <span className="font-bold text-sm">EUR {levyCost.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Net Total (annual)</span>
                  <span className="text-lg font-bold text-gray-900">EUR {totalNet.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Computed results */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Computed via Library</h3>
            <div className="grid grid-cols-2 gap-3">
              <ResultCard label="Annual Net" value={fmtCents(result.amount_subtotal)} />
              <ResultCard label={`Tax (${taxRate}%)`} value={fmtCents(result.amount_tax)} color="amber" />
              <ResultCard label="Annual Gross" value={fmtCents(result.amount_total)} highlight color="green" />
              <ResultCard
                label="Monthly Gross"
                value={fmtCents(Math.round((result.amount_total ?? 0) / 12))}
                color="blue"
              />
            </div>
          </div>

          {/* Per-kWh breakdown */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Per-kWh Price Composition</h3>
            <div className="space-y-2">
              {[
                { label: 'Work Price', value: parseFloat(workPrice), color: 'bg-orange-200' },
                { label: 'Markup', value: parseFloat(markup), color: 'bg-orange-400' },
                { label: 'CO2 Levy', value: parseFloat(co2Levy), color: 'bg-red-300' },
                { label: 'Gas Storage', value: parseFloat(gasStorageLevy), color: 'bg-red-200' },
              ].map((item) => {
                const totalKwh = parseFloat(workPrice) + parseFloat(markup) + parseFloat(co2Levy) + parseFloat(gasStorageLevy);
                return (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-24">{item.label}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                      <div
                        className={`${item.color} h-full rounded-full`}
                        style={{ width: `${(item.value / totalKwh) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium w-16 text-right">{item.value.toFixed(3)} ct</span>
                  </div>
                );
              })}
              <div className="border-t border-gray-200 pt-2 text-right">
                <span className="text-sm font-bold text-gray-900">
                  Total: {(parseFloat(workPrice) + parseFloat(markup) + parseFloat(co2Levy) + parseFloat(gasStorageLevy)).toFixed(3)} ct/kWh
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
