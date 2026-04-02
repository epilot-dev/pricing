import { computeAggregatedAndPriceTotals } from '@epilot/pricing';
import { useState, useMemo } from 'react';
import { CodeBlock } from '../components/CodeBlock';
import { ResultCard } from '../components/ResultCard';
import { TariffCard } from '../components/TariffCard';
import { buildPriceItemDto, fmtCents } from '../helpers';

export function GasDemo() {
  const [basePrice, setBasePrice] = useState('144.00');
  const [workPrice, setWorkPrice] = useState('10.70');
  const [consumption, setConsumption] = useState(15000);
  const [co2Levy, setCo2Levy] = useState('0.546');
  const [gasStorageLevy, setGasStorageLevy] = useState('0.059');
  const [taxRate] = useState(19);

  const result = useMemo(() => {
    const items: any[] = [];

    // Base Price: already in EUR/year -- pass directly
    items.push(
      buildPriceItemDto({
        unitAmountDecimal: basePrice,
        quantity: 1,
        type: 'recurring',
        billingPeriod: 'yearly',
        taxRate,
        isTaxInclusive: false,
        description: 'Base Price',
      }),
    );

    // Work Price + levies: all in ct/kWh -- sum then divide by 100 for EUR/kWh
    const totalCtPerKwh = parseFloat(workPrice) + parseFloat(co2Levy) + parseFloat(gasStorageLevy);
    const totalEurPerKwh = (totalCtPerKwh / 100).toFixed(6);
    items.push(
      buildPriceItemDto({
        unitAmountDecimal: totalEurPerKwh,
        quantity: consumption,
        type: 'recurring',
        billingPeriod: 'yearly',
        taxRate,
        isTaxInclusive: false,
        description: 'Work Price incl. Levies',
      }),
    );

    return computeAggregatedAndPriceTotals(items);
  }, [basePrice, workPrice, consumption, co2Levy, gasStorageLevy, taxRate]);

  // ct/kWh values for display
  const workRate = parseFloat(workPrice); // ct/kWh
  const levyRate = parseFloat(co2Levy) + parseFloat(gasStorageLevy); // ct/kWh
  const totalCtPerKwh = workRate + levyRate;

  // EUR amounts for totals
  const baseCostEUR = parseFloat(basePrice);
  const workCostEUR = (workRate / 100) * consumption;
  const levyCostEUR = (levyRate / 100) * consumption;
  const totalNetEUR = baseCostEUR + workCostEUR + levyCostEUR;
  const totalGrossEUR = totalNetEUR * (1 + taxRate / 100);
  const monthlyGrossEUR = totalGrossEUR / 12;

  return (
    <div>
      <h1 className="section-title">Gas Tariff</h1>
      <p className="section-desc">
        Configure a German gas supply tariff with base price, work price, and gas-specific levies including CO2 tax and
        gas storage levy.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column -- Controls */}
        <div className="lg:col-span-1 space-y-4">
          {/* Base price */}
          <div className="card">
            <div className="p-4 bg-blue-50 rounded-xl">
              <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Base Price</p>
              <label className="text-xs text-blue-600 font-medium">Annual base fee (EUR/year)</label>
              <input
                type="number"
                step="0.01"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className="input-field mt-1"
              />
            </div>
          </div>

          {/* Work price */}
          <div className="card space-y-3">
            <div className="p-4 bg-orange-50 rounded-xl">
              <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-2">Work Price </p>
              <div>
                <label className="text-xs text-orange-600 font-medium">Rate (ct/kWh)</label>
                <input
                  type="number"
                  step="0.01"
                  value={workPrice}
                  onChange={(e) => setWorkPrice(e.target.value)}
                  className="input-field mt-1"
                />
              </div>
            </div>

            <div className="p-4 bg-red-50 rounded-xl">
              <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2">Gas Levies</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-red-600 font-medium">CO2 (ct/kWh)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={co2Levy}
                    onChange={(e) => setCo2Levy(e.target.value)}
                    className="input-field mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-red-600 font-medium">Storage (ct/kWh)</label>
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
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Annual Consumption</label>
              <span className="text-sm font-extrabold text-primary-600">{consumption.toLocaleString()} kWh</span>
            </div>
            <input
              type="range"
              min="5000"
              max="50000"
              step="500"
              value={consumption}
              onChange={(e) => setConsumption(Number(e.target.value))}
              className="w-full accent-primary-600"
            />
            <div className="flex justify-between text-[10px] text-gray-300 mt-1">
              <span>5,000 kWh</span>
              <span>50,000 kWh</span>
            </div>
          </div>
        </div>

        {/* Right column -- Tariff card + results */}
        <div className="lg:col-span-2 space-y-5">
          {/* Main tariff card */}
          <TariffCard
            gradient="gradient-gas"
            icon={<span>🔥</span>}
            title="Natural Gas Tariff"
            subtitle={`${consumption.toLocaleString()} kWh/year`}
            badge="GAS"
            price={`EUR ${monthlyGrossEUR.toFixed(2)}`}
            priceUnit="/month"
            priceLabel="Estimated monthly cost (gross)"
            footer={
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Annual total (gross)</span>
                <span className="font-extrabold text-gray-900 text-lg">EUR {totalGrossEUR.toFixed(2)}</span>
              </div>
            }
          >
            {/* Stacked bar */}
            <div className="h-3 flex rounded-full overflow-hidden mb-4">
              <div
                className="bg-blue-400 transition-all duration-300"
                style={{ width: `${(baseCostEUR / totalNetEUR) * 100}%` }}
              />
              <div
                className="bg-orange-400 transition-all duration-300"
                style={{ width: `${(workCostEUR / totalNetEUR) * 100}%` }}
              />
              <div
                className="bg-red-400 transition-all duration-300"
                style={{ width: `${(levyCostEUR / totalNetEUR) * 100}%` }}
              />
            </div>

            <div className="cost-line">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                <div>
                  <span className="cost-line-label">Base Price</span>
                  <p className="text-[10px] text-gray-400">EUR {parseFloat(basePrice).toFixed(2)}/year</p>
                </div>
              </div>
              <span className="cost-line-value">EUR {baseCostEUR.toFixed(2)}</span>
            </div>

            <div className="cost-line">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                <div>
                  <span className="cost-line-label">Work Price</span>
                  <p className="text-[10px] text-gray-400">
                    {workRate.toFixed(2)} ct/kWh x {consumption.toLocaleString()} kWh
                  </p>
                </div>
              </div>
              <span className="cost-line-value">EUR {workCostEUR.toFixed(2)}</span>
            </div>

            <div className="cost-line">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div>
                  <span className="cost-line-label">Gas Levies</span>
                  <p className="text-[10px] text-gray-400">{levyRate.toFixed(3)} ct/kWh (CO2 + storage)</p>
                </div>
              </div>
              <span className="cost-line-value">EUR {levyCostEUR.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between pt-3 mt-1 border-t border-gray-200">
              <span className="text-sm font-bold text-gray-600">Net Total (annual)</span>
              <span className="text-lg font-extrabold text-gray-900">EUR {totalNetEUR.toFixed(2)}</span>
            </div>
          </TariffCard>

          {/* Per-kWh composition */}
          <div className="card">
            <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-4">Price per kWh Composition</p>
            <div className="space-y-2.5">
              {[
                { label: 'Work Price', value: parseFloat(workPrice), color: 'bg-orange-200', bar: 'bg-orange-400' },
                { label: 'CO2 Levy', value: parseFloat(co2Levy), color: 'bg-red-100', bar: 'bg-red-400' },
                { label: 'Gas Storage', value: parseFloat(gasStorageLevy), color: 'bg-red-50', bar: 'bg-red-300' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-24 font-medium">{item.label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`${item.bar} h-full rounded-full transition-all duration-300`}
                      style={{ width: `${(item.value / totalCtPerKwh) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold w-16 text-right tabular-nums">{item.value.toFixed(3)} ct</span>
                </div>
              ))}
              <div className="border-t border-gray-100 pt-2 text-right">
                <span className="text-sm font-extrabold text-gray-900">Total: {totalCtPerKwh.toFixed(3)} ct/kWh</span>
              </div>
            </div>
          </div>

          {/* Computed results */}
          <div className="card">
            <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-4">
              Computed via @epilot/pricing
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <ResultCard label="Annual Net" value={fmtCents(result.amount_subtotal)} />
              <ResultCard label={`Tax (${taxRate}%)`} value={fmtCents(result.amount_tax)} color="amber" highlight />
              <ResultCard label="Annual Gross" value={fmtCents(result.amount_total)} highlight color="green" />
              <ResultCard
                label="Monthly Gross"
                value={fmtCents(Math.round((result.amount_total ?? 0) / 12))}
                color="blue"
                highlight
              />
            </div>
          </div>
        </div>
      </div>

      {/* Code block */}
      <div className="mt-8">
        <CodeBlock
          title="Usage"
          code={`import { computeAggregatedAndPriceTotals } from '@epilot/pricing';

// Gas tariff: Base Price + Work Price incl. levies
const items = [
  {
    quantity: 1,
    _price: {
      unit_amount: ${Math.round(parseFloat(basePrice) * 100)},       // ${parseFloat(basePrice).toFixed(2)} EUR in cents
      unit_amount_decimal: '${basePrice}',  // EUR
      unit_amount_currency: 'EUR',
      pricing_model: 'per_unit',
      is_tax_inclusive: false,
      type: 'recurring',
      billing_period: 'yearly',
      tax: [{ rate: ${taxRate}, type: 'VAT' }],
      description: 'Base Price',
    },
  },
  {
    quantity: ${consumption},
    _price: {
      unit_amount: ${Math.round((totalCtPerKwh / 100) * 100)},       // ${(totalCtPerKwh / 100).toFixed(4)} EUR in cents
      unit_amount_decimal: '${(totalCtPerKwh / 100).toFixed(6)}',  // EUR/kWh (${totalCtPerKwh.toFixed(3)} ct/100)
      unit_amount_currency: 'EUR',
      pricing_model: 'per_unit',
      is_tax_inclusive: false,
      type: 'recurring',
      billing_period: 'yearly',
      tax: [{ rate: ${taxRate}, type: 'VAT' }],
      description: 'Work Price incl. Levies',
    },
  },
];

const result = computeAggregatedAndPriceTotals(items);
// result.amount_total = ${fmtCents(result.amount_total)} (annual gross)`}
        />
      </div>
    </div>
  );
}
