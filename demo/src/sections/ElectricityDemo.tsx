import { useState, useMemo } from 'react';
import { computeAggregatedAndPriceTotals } from '@epilot/pricing';
import { ResultCard } from '../components/ResultCard';
import { buildPriceItemDto, fmtCents } from '../helpers';

export function ElectricityDemo() {
  const [tariffType, setTariffType] = useState<'single' | 'dual'>('single');
  const [basePrice, setBasePrice] = useState('96.00');
  const [workPriceHT, setWorkPriceHT] = useState('28.50');
  const [workPriceNT, setWorkPriceNT] = useState('22.30');
  const [markupHT, setMarkupHT] = useState('3.20');
  const [markupNT, setMarkupNT] = useState('2.10');
  const [consumptionHT, setConsumptionHT] = useState(2800);
  const [consumptionNT, setConsumptionNT] = useState(1200);
  const [taxRate, setTaxRate] = useState(19);

  const result = useMemo(() => {
    const items: any[] = [];

    // Base price (Grundpreis)
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

    // HT work price
    const totalHT = (parseFloat(workPriceHT) + parseFloat(markupHT)).toFixed(4);
    items.push(
      buildPriceItemDto({
        unitAmountDecimal: totalHT,
        quantity: tariffType === 'dual' ? consumptionHT : consumptionHT + consumptionNT,
        type: 'recurring',
        billingPeriod: 'yearly',
        taxRate,
        isTaxInclusive: false,
        description: tariffType === 'dual' ? 'Arbeitspreis HT (Peak)' : 'Arbeitspreis (Work Price)',
      }),
    );

    // NT work price (dual tariff only)
    if (tariffType === 'dual') {
      const totalNT = (parseFloat(workPriceNT) + parseFloat(markupNT)).toFixed(4);
      items.push(
        buildPriceItemDto({
          unitAmountDecimal: totalNT,
          quantity: consumptionNT,
          type: 'recurring',
          billingPeriod: 'yearly',
          taxRate,
          isTaxInclusive: false,
          description: 'Arbeitspreis NT (Off-Peak)',
        }),
      );
    }

    return computeAggregatedAndPriceTotals(items);
  }, [tariffType, basePrice, workPriceHT, workPriceNT, markupHT, markupNT, consumptionHT, consumptionNT, taxRate]);

  const totalConsumption = tariffType === 'dual' ? consumptionHT + consumptionNT : consumptionHT + consumptionNT;
  const baseCost = parseFloat(basePrice);
  const htRate = parseFloat(workPriceHT) + parseFloat(markupHT);
  const ntRate = parseFloat(workPriceNT) + parseFloat(markupNT);
  const htCost = htRate * (tariffType === 'dual' ? consumptionHT : totalConsumption);
  const ntCost = tariffType === 'dual' ? ntRate * consumptionNT : 0;
  const totalNet = baseCost + htCost + ntCost;

  return (
    <div>
      <h1 className="section-title">Electricity Tariff</h1>
      <p className="section-desc">
        Standard German electricity pricing with Grundpreis (base fee) and Arbeitspreis (work price per kWh).
        Supports single-tariff and dual-tariff (HT/NT) meters for peak and off-peak consumption.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {/* Tariff type toggle */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Meter Type</h3>
            <div className="flex gap-2">
              {(['single', 'dual'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTariffType(t)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    tariffType === t
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {t === 'single' ? 'Single Tariff (ET)' : 'Dual Tariff (HT/NT)'}
                </button>
              ))}
            </div>
          </div>

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

          {/* Work prices */}
          <div className="card">
            <div className="p-3 bg-yellow-50 rounded-lg mb-3">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">
                {tariffType === 'dual' ? 'Arbeitspreis HT (Peak)' : 'Arbeitspreis (Work Price)'}
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-yellow-600">Base price (ct/kWh)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={workPriceHT}
                    onChange={(e) => setWorkPriceHT(e.target.value)}
                    className="input-field mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-yellow-600">Markup (ct/kWh)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={markupHT}
                    onChange={(e) => setMarkupHT(e.target.value)}
                    className="input-field mt-1"
                  />
                </div>
              </div>
            </div>

            {tariffType === 'dual' && (
              <div className="p-3 bg-indigo-50 rounded-lg">
                <h4 className="text-sm font-medium text-indigo-800 mb-2">Arbeitspreis NT (Off-Peak)</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-indigo-600">Base price (ct/kWh)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={workPriceNT}
                      onChange={(e) => setWorkPriceNT(e.target.value)}
                      className="input-field mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-indigo-600">Markup (ct/kWh)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={markupNT}
                      onChange={(e) => setMarkupNT(e.target.value)}
                      className="input-field mt-1"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Consumption */}
          <div className="card">
            {tariffType === 'dual' ? (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    HT Consumption: <span className="text-yellow-600 font-bold">{consumptionHT.toLocaleString()} kWh</span>
                  </label>
                  <input
                    type="range"
                    min="500"
                    max="8000"
                    step="100"
                    value={consumptionHT}
                    onChange={(e) => setConsumptionHT(Number(e.target.value))}
                    className="w-full mt-1 accent-yellow-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    NT Consumption: <span className="text-indigo-600 font-bold">{consumptionNT.toLocaleString()} kWh</span>
                  </label>
                  <input
                    type="range"
                    min="200"
                    max="5000"
                    step="100"
                    value={consumptionNT}
                    onChange={(e) => setConsumptionNT(Number(e.target.value))}
                    className="w-full mt-1 accent-indigo-500"
                  />
                </div>
                <p className="text-xs text-gray-400">
                  Total: {totalConsumption.toLocaleString()} kWh/year
                </p>
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Annual Consumption: <span className="text-primary-600 font-bold">{totalConsumption.toLocaleString()} kWh</span>
                </label>
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
                  className="w-full mt-1 accent-primary-600"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>1,000 kWh</span>
                  <span>10,000 kWh</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* Cost breakdown */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Annual Cost Breakdown</h3>
            <div className="h-10 flex rounded-lg overflow-hidden mb-4">
              {[
                { value: baseCost, color: 'bg-blue-400', label: 'Base' },
                { value: htCost, color: 'bg-yellow-400', label: tariffType === 'dual' ? 'HT' : 'Work' },
                ...(tariffType === 'dual' ? [{ value: ntCost, color: 'bg-indigo-400', label: 'NT' }] : []),
              ].map((seg) => (
                <div
                  key={seg.label}
                  className={`${seg.color} flex items-center justify-center text-white text-xs font-medium transition-all duration-300`}
                  style={{ width: `${(seg.value / totalNet) * 100}%` }}
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
                <div className="w-3 h-3 rounded-sm bg-yellow-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">
                    {tariffType === 'dual' ? 'Arbeitspreis HT' : 'Arbeitspreis'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {htRate.toFixed(2)} ct/kWh x {(tariffType === 'dual' ? consumptionHT : totalConsumption).toLocaleString()} kWh
                  </p>
                </div>
                <span className="font-bold text-sm">EUR {htCost.toFixed(2)}</span>
              </div>
              {tariffType === 'dual' && (
                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                  <div className="w-3 h-3 rounded-sm bg-indigo-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">Arbeitspreis NT</p>
                    <p className="text-xs text-gray-400">
                      {ntRate.toFixed(2)} ct/kWh x {consumptionNT.toLocaleString()} kWh
                    </p>
                  </div>
                  <span className="font-bold text-sm">EUR {ntCost.toFixed(2)}</span>
                </div>
              )}
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

          {/* Rate comparison for dual tariff */}
          {tariffType === 'dual' && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3">HT vs NT Rate Comparison</h3>
              <div className="flex gap-3">
                <div className="flex-1 text-center p-3 bg-yellow-50 rounded-lg">
                  <p className="text-xs text-yellow-600">HT (Peak)</p>
                  <p className="text-lg font-bold text-yellow-700">{htRate.toFixed(2)} ct</p>
                  <p className="text-xs text-yellow-500">{consumptionHT.toLocaleString()} kWh</p>
                </div>
                <div className="flex-1 text-center p-3 bg-indigo-50 rounded-lg">
                  <p className="text-xs text-indigo-600">NT (Off-Peak)</p>
                  <p className="text-lg font-bold text-indigo-700">{ntRate.toFixed(2)} ct</p>
                  <p className="text-xs text-indigo-500">{consumptionNT.toLocaleString()} kWh</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                Savings vs. all-HT: EUR {((htRate - ntRate) * consumptionNT).toFixed(2)}/year
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
