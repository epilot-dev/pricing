import { computeAggregatedAndPriceTotals } from '@epilot/pricing';
import { useState, useMemo } from 'react';
import { CodeBlock } from '../components/CodeBlock';
import { ResultCard } from '../components/ResultCard';
import { TariffCard } from '../components/TariffCard';
import { buildPriceItemDto, fmtCents, fmtEur } from '../helpers';

export function ElectricityDemo() {
  const [tariffType, setTariffType] = useState<'single' | 'dual'>('single');
  const [basePrice, setBasePrice] = useState('96.00');
  const [workPriceHT, setWorkPriceHT] = useState('31.70');
  const [workPriceNT, setWorkPriceNT] = useState('24.40');
  const [consumptionHT, setConsumptionHT] = useState(2800);
  const [consumptionNT, setConsumptionNT] = useState(1200);
  const [taxRate] = useState(19);

  const result = useMemo(() => {
    const items: any[] = [];

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

    const htEUR = (parseFloat(workPriceHT) / 100).toFixed(4);
    items.push(
      buildPriceItemDto({
        unitAmountDecimal: htEUR,
        quantity: tariffType === 'dual' ? consumptionHT : consumptionHT + consumptionNT,
        type: 'recurring',
        billingPeriod: 'yearly',
        taxRate,
        isTaxInclusive: false,
        description: tariffType === 'dual' ? 'Work Price HT (Peak)' : 'Work Price',
      }),
    );

    if (tariffType === 'dual') {
      const ntEUR = (parseFloat(workPriceNT) / 100).toFixed(4);
      items.push(
        buildPriceItemDto({
          unitAmountDecimal: ntEUR,
          quantity: consumptionNT,
          type: 'recurring',
          billingPeriod: 'yearly',
          taxRate,
          isTaxInclusive: false,
          description: 'Work Price NT (Off-Peak)',
        }),
      );
    }

    return computeAggregatedAndPriceTotals(items);
  }, [tariffType, basePrice, workPriceHT, workPriceNT, consumptionHT, consumptionNT, taxRate]);

  const totalConsumption = consumptionHT + consumptionNT;
  const baseCost = parseFloat(basePrice);
  const htRateCt = parseFloat(workPriceHT);
  const ntRateCt = parseFloat(workPriceNT);
  const htConsumption = tariffType === 'dual' ? consumptionHT : totalConsumption;
  const htCostEUR = (htRateCt / 100) * htConsumption;
  const ntCostEUR = tariffType === 'dual' ? (ntRateCt / 100) * consumptionNT : 0;
  const totalNet = baseCost + htCostEUR + ntCostEUR;
  const totalGross = totalNet * (1 + taxRate / 100);
  const monthlyGross = totalGross / 12;

  const htEURDisplay = (parseFloat(workPriceHT) / 100).toFixed(4);
  const ntEURDisplay = (parseFloat(workPriceNT) / 100).toFixed(4);

  return (
    <div>
      <h1 className="section-title">Electricity Tariff</h1>
      <p className="section-desc">
        Configure a German electricity tariff with base price and work price. Toggle between single and dual-tariff
        meters to see real-time pricing.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — Controls */}
        <div className="lg:col-span-1 space-y-4">
          {/* Meter type */}
          <div className="card">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Meter Type</p>
            <div className="flex gap-2">
              {(['single', 'dual'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTariffType(t)}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${
                    tariffType === t
                      ? 'gradient-electricity text-white shadow-md'
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {t === 'single' ? 'Single Tariff (ET)' : 'Dual Tariff (HT/NT)'}
                </button>
              ))}
            </div>
          </div>

          {/* Base price */}
          <div className="card">
            <div className="p-4 bg-blue-50 rounded-xl">
              <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Base Price</p>
              <div>
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
          </div>

          {/* Work prices */}
          <div className="card space-y-3">
            <div className="p-4 bg-amber-50 rounded-xl">
              <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">
                {tariffType === 'dual' ? 'Work Price HT' : 'Work Price'}
              </p>
              <div>
                <label className="text-xs text-amber-600 font-medium">Rate (ct/kWh)</label>
                <input
                  type="number"
                  step="0.01"
                  value={workPriceHT}
                  onChange={(e) => setWorkPriceHT(e.target.value)}
                  className="input-field mt-1"
                />
              </div>
            </div>

            {tariffType === 'dual' && (
              <div className="p-4 bg-indigo-50 rounded-xl">
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Work Price NT </p>
                <div>
                  <label className="text-xs text-indigo-600 font-medium">Rate (ct/kWh)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={workPriceNT}
                    onChange={(e) => setWorkPriceNT(e.target.value)}
                    className="input-field mt-1"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Consumption */}
          <div className="card">
            {tariffType === 'dual' ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">HT Consumption</label>
                    <span className="text-sm font-extrabold text-amber-600">{consumptionHT.toLocaleString()} kWh</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="8000"
                    step="100"
                    value={consumptionHT}
                    onChange={(e) => setConsumptionHT(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">NT Consumption</label>
                    <span className="text-sm font-extrabold text-indigo-600">{consumptionNT.toLocaleString()} kWh</span>
                  </div>
                  <input
                    type="range"
                    min="200"
                    max="5000"
                    step="100"
                    value={consumptionNT}
                    onChange={(e) => setConsumptionNT(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Total consumption</span>
                    <span className="text-sm font-bold text-gray-700">
                      {totalConsumption.toLocaleString()} kWh/year
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Annual Consumption
                  </label>
                  <span className="text-sm font-extrabold text-primary-600">
                    {totalConsumption.toLocaleString()} kWh
                  </span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="10000"
                  step="100"
                  value={consumptionHT + consumptionNT}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setConsumptionHT(Math.round(val * 0.7));
                    setConsumptionNT(Math.round(val * 0.3));
                  }}
                  className="w-full accent-primary-600"
                />
                <div className="flex justify-between text-[10px] text-gray-300 mt-1">
                  <span>1,000 kWh</span>
                  <span>10,000 kWh</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column — Tariff card + results */}
        <div className="lg:col-span-2 space-y-5">
          {/* Main tariff card */}
          <TariffCard
            gradient="gradient-electricity"
            icon={<span>⚡</span>}
            title={tariffType === 'dual' ? 'Dual Tariff (HT/NT)' : 'Single Tariff (ET)'}
            subtitle={`${totalConsumption.toLocaleString()} kWh/year`}
            badge={tariffType === 'dual' ? 'HT/NT' : 'SINGLE'}
            price={`${fmtEur(monthlyGross)}`}
            priceUnit="/month"
            priceLabel="Estimated monthly cost (gross)"
            footer={
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Annual total (gross)</span>
                <span className="font-extrabold text-gray-900 text-lg">{fmtEur(totalGross)}</span>
              </div>
            }
          >
            {/* Cost breakdown inside card */}
            <div className="space-y-0">
              {/* Stacked bar */}
              <div className="h-3 flex rounded-full overflow-hidden mb-4">
                <div
                  className="bg-blue-400 transition-all duration-300"
                  style={{ width: `${(baseCost / totalNet) * 100}%` }}
                  title="Base Price"
                />
                <div
                  className="bg-amber-400 transition-all duration-300"
                  style={{ width: `${(htCostEUR / totalNet) * 100}%` }}
                  title="HT"
                />
                {tariffType === 'dual' && (
                  <div
                    className="bg-indigo-400 transition-all duration-300"
                    style={{ width: `${(ntCostEUR / totalNet) * 100}%` }}
                    title="NT"
                  />
                )}
              </div>

              <div className="cost-line">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                  <div>
                    <span className="cost-line-label">Base Price</span>
                    <p className="text-[10px] text-gray-400">{fmtEur(parseFloat(basePrice))}/year</p>
                  </div>
                </div>
                <span className="cost-line-value">{fmtEur(baseCost)}</span>
              </div>

              <div className="cost-line">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div>
                    <span className="cost-line-label">{tariffType === 'dual' ? 'Work Price HT' : 'Work Price'}</span>
                    <p className="text-[10px] text-gray-400">
                      {htRateCt.toFixed(2)} ct/kWh x {htConsumption.toLocaleString()} kWh
                    </p>
                  </div>
                </div>
                <span className="cost-line-value">{fmtEur(htCostEUR)}</span>
              </div>

              {tariffType === 'dual' && (
                <div className="cost-line">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                    <div>
                      <span className="cost-line-label">Work Price NT</span>
                      <p className="text-[10px] text-gray-400">
                        {ntRateCt.toFixed(2)} ct/kWh x {consumptionNT.toLocaleString()} kWh
                      </p>
                    </div>
                  </div>
                  <span className="cost-line-value">{fmtEur(ntCostEUR)}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 mt-1 border-t border-gray-200">
                <span className="text-sm font-bold text-gray-600">Net Total (annual)</span>
                <span className="text-lg font-extrabold text-gray-900">{fmtEur(totalNet)}</span>
              </div>
            </div>
          </TariffCard>

          {/* Rate comparison for dual tariff */}
          {tariffType === 'dual' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="card text-center p-5">
                <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">HT (Peak)</p>
                <p className="text-3xl font-extrabold text-amber-600 mt-1">{htRateCt.toFixed(2)}</p>
                <p className="text-xs text-gray-400">ct/kWh</p>
                <p className="text-xs text-amber-500 font-medium mt-1">{consumptionHT.toLocaleString()} kWh</p>
              </div>
              <div className="card text-center p-5">
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">NT (Off-Peak)</p>
                <p className="text-3xl font-extrabold text-indigo-600 mt-1">{ntRateCt.toFixed(2)}</p>
                <p className="text-xs text-gray-400">ct/kWh</p>
                <p className="text-xs text-indigo-500 font-medium mt-1">{consumptionNT.toLocaleString()} kWh</p>
              </div>
            </div>
          )}

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

// Electricity tariff: Base Price + Work Price 
const items = [
  {
    quantity: 1,
    _price: {
      unit_amount: ${Math.round(parseFloat(basePrice) * 100)},
      unit_amount_decimal: '${basePrice}',
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
    quantity: 1,
    _price: {
      unit_amount: ${Math.round((parseFloat(workPriceHT) / 100) * 100)},
      unit_amount_decimal: '${htEURDisplay}',
      unit_amount_currency: 'EUR',
      pricing_model: 'per_unit',
      is_tax_inclusive: false,
      type: 'recurring',
      billing_period: 'yearly',
      tax: [{ rate: ${taxRate}, type: 'VAT' }],
      price_mappings: [{
        frequency_unit: 'yearly',
        value: ${tariffType === 'dual' ? consumptionHT : totalConsumption},  // consumption in kWh
      }],
    },
  },${
    tariffType === 'dual'
      ? `
  {
    quantity: 1,
    _price: {
      unit_amount: ${Math.round((parseFloat(workPriceNT) / 100) * 100)},
      unit_amount_decimal: '${ntEURDisplay}',
      unit_amount_currency: 'EUR',
      pricing_model: 'per_unit',
      is_tax_inclusive: false,
      type: 'recurring',
      billing_period: 'yearly',
      tax: [{ rate: ${taxRate}, type: 'VAT' }],
      price_mappings: [{
        frequency_unit: 'yearly',
        value: ${consumptionNT},  // consumption in kWh
      }],
    },
  },`
      : ''
  }
];

const result = computeAggregatedAndPriceTotals(items);
// result.amount_total = ${fmtCents(result.amount_total)} (annual gross)`}
        />
      </div>
    </div>
  );
}
