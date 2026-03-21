import { useState, useMemo } from 'react';
import { computeAggregatedAndPriceTotals } from '@epilot/pricing';
import { ResultCard } from '../components/ResultCard';
import { CodeBlock } from '../components/CodeBlock';
import { buildPriceItemDto, fmtCents } from '../helpers';

export function GetAGDemo() {
  const [basePrice, setBasePrice] = useState('120.00');
  const [workPrice, setWorkPrice] = useState('6.50');
  const [consumption, setConsumption] = useState(3500);
  const [markupPerUnit, setMarkupPerUnit] = useState('1.50');
  const [additionalMarkup, setAdditionalMarkup] = useState('24.00');
  const [taxRate, setTaxRate] = useState(19);

  // Compute a simplified GetAG-like calculation
  const result = useMemo(() => {
    // Base price (fixed annual fee)
    const baseItem = buildPriceItemDto({
      unitAmountDecimal: basePrice,
      quantity: 1,
      type: 'recurring',
      billingPeriod: 'yearly',
      taxRate,
      isTaxInclusive: false,
      description: 'Base Price (Grundpreis)',
    });

    // Work price (per kWh) + markup
    const totalWorkPrice = (parseFloat(workPrice) + parseFloat(markupPerUnit)).toFixed(4);
    const workItem = buildPriceItemDto({
      unitAmountDecimal: totalWorkPrice,
      quantity: consumption,
      type: 'recurring',
      billingPeriod: 'yearly',
      taxRate,
      isTaxInclusive: false,
      description: 'Work Price (Arbeitspreis)',
    });

    // Additional markup as flat fee
    const additionalItem = buildPriceItemDto({
      unitAmountDecimal: additionalMarkup,
      quantity: 1,
      type: 'recurring',
      billingPeriod: 'yearly',
      taxRate,
      isTaxInclusive: false,
      description: 'Additional Markup',
    });

    return computeAggregatedAndPriceTotals([baseItem, workItem, additionalItem]);
  }, [basePrice, workPrice, consumption, markupPerUnit, additionalMarkup, taxRate]);

  const baseCost = parseFloat(basePrice);
  const workCost = (parseFloat(workPrice) + parseFloat(markupPerUnit)) * consumption;
  const addCost = parseFloat(additionalMarkup);
  const totalNet = baseCost + workCost + addCost;
  const totalGross = totalNet * (1 + taxRate / 100);

  return (
    <div>
      <h1 className="section-title">GetAG Energy Pricing</h1>
      <p className="section-desc">
        German energy operator (GetAG) integration supporting base price + work price models
        with tiered markups and additional fees. Used for electricity and gas tariffs.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {/* GetAG Config */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Tariff Configuration</h3>

            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Grundpreis (Base Price)</h4>
                <div>
                  <label className="text-xs text-blue-600">Annual base fee (€/year)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    className="input-field mt-1"
                  />
                </div>
              </div>

              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="text-sm font-medium text-green-800 mb-2">Arbeitspreis (Work Price)</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-green-600">GetAG price (ct/kWh)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={workPrice}
                      onChange={(e) => setWorkPrice(e.target.value)}
                      className="input-field mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-green-600">Markup (ct/kWh)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={markupPerUnit}
                      onChange={(e) => setMarkupPerUnit(e.target.value)}
                      className="input-field mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg">
                <h4 className="text-sm font-medium text-amber-800 mb-2">Additional Markup</h4>
                <div>
                  <label className="text-xs text-amber-600">Fixed annual fee (€/year)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={additionalMarkup}
                    onChange={(e) => setAdditionalMarkup(e.target.value)}
                    className="input-field mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <label className="text-sm font-medium text-gray-700">
              Annual Consumption: <span className="text-primary-600 font-bold">{consumption.toLocaleString()} kWh</span>
            </label>
            <input
              type="range"
              min="500"
              max="10000"
              step="100"
              value={consumption}
              onChange={(e) => setConsumption(Number(e.target.value))}
              className="w-full mt-2 accent-primary-600"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>500 kWh</span>
              <span>10,000 kWh</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Cost breakdown visual */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Annual Cost Breakdown</h3>

            {/* Stacked bar */}
            <div className="h-10 flex rounded-lg overflow-hidden mb-4">
              {[
                { value: baseCost, color: 'bg-blue-400', label: 'Base' },
                { value: workCost, color: 'bg-green-400', label: 'Work' },
                { value: addCost, color: 'bg-amber-400', label: 'Markup' },
              ].map((seg) => (
                <div
                  key={seg.label}
                  className={`${seg.color} flex items-center justify-center text-white text-xs font-medium transition-all duration-300`}
                  style={{ width: `${(seg.value / totalNet) * 100}%` }}
                  title={`${seg.label}: €${seg.value.toFixed(2)}`}
                >
                  {(seg.value / totalNet) * 100 > 10 ? seg.label : ''}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              {[
                { label: 'Grundpreis (Base)', value: baseCost, color: 'bg-blue-400', detail: `€${parseFloat(basePrice).toFixed(2)}/year` },
                {
                  label: 'Arbeitspreis (Work)',
                  value: workCost,
                  color: 'bg-green-400',
                  detail: `${(parseFloat(workPrice) + parseFloat(markupPerUnit)).toFixed(2)} ct/kWh x ${consumption.toLocaleString()} kWh`,
                },
                { label: 'Additional Markup', value: addCost, color: 'bg-amber-400', detail: `€${parseFloat(additionalMarkup).toFixed(2)}/year` },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                  <div className={`w-3 h-3 rounded-sm ${item.color}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.detail}</p>
                  </div>
                  <span className="font-bold text-sm">€{item.value.toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Net Total (annual)</span>
                  <span className="text-lg font-bold text-gray-900">€{totalNet.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Computed Results */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Computed via Library</h3>
            <div className="grid grid-cols-2 gap-3">
              <ResultCard label="Annual Net" value={fmtCents(result.amount_subtotal)} />
              <ResultCard label="Tax ({taxRate}%)" value={fmtCents(result.amount_tax)} color="amber" />
              <ResultCard label="Annual Gross" value={fmtCents(result.amount_total)} highlight color="green" />
              <ResultCard
                label="Monthly Gross"
                value={fmtCents(Math.round((result.amount_total ?? 0) / 12))}
                color="blue"
              />
            </div>
          </div>

          {/* Work price breakdown */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Work Price Detail</h3>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex-1 text-center p-2 bg-green-50 rounded">
                <p className="text-xs text-green-600">GetAG Price</p>
                <p className="font-bold text-green-700">{workPrice} ct</p>
              </div>
              <span className="text-gray-400">+</span>
              <div className="flex-1 text-center p-2 bg-amber-50 rounded">
                <p className="text-xs text-amber-600">Markup</p>
                <p className="font-bold text-amber-700">{markupPerUnit} ct</p>
              </div>
              <span className="text-gray-400">=</span>
              <div className="flex-1 text-center p-2 bg-primary-50 rounded">
                <p className="text-xs text-primary-600">Total</p>
                <p className="font-bold text-primary-700">
                  {(parseFloat(workPrice) + parseFloat(markupPerUnit)).toFixed(2)} ct
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Usage */}
      <div className="mt-6">
        <CodeBlock
          title="Usage"
          code={`import { computeAggregatedAndPriceTotals } from '@epilot/pricing';

// GetAG-style tariff: base price + work price + markups
const items = [
  {
    quantity: 1,
    _price: {
      unit_amount_decimal: '${basePrice}',
      unit_amount_currency: 'EUR',
      pricing_model: 'per_unit',
      is_tax_inclusive: false,
      type: 'recurring',
      billing_period: 'yearly',
      tax: [{ rate: ${taxRate}, type: 'VAT' }],
      description: 'Grundpreis (Base Price)',
    },
    taxes: [{ tax: { rate: ${taxRate} } }],
  },
  {
    quantity: ${consumption},  // kWh consumption
    _price: {
      unit_amount_decimal: '${(parseFloat(workPrice) + parseFloat(markupPerUnit)).toFixed(4)}',
      unit_amount_currency: 'EUR',
      pricing_model: 'per_unit',
      is_tax_inclusive: false,
      type: 'recurring',
      billing_period: 'yearly',
      tax: [{ rate: ${taxRate}, type: 'VAT' }],
      description: 'Arbeitspreis (Work Price)',
    },
    taxes: [{ tax: { rate: ${taxRate} } }],
  },
];

const result = computeAggregatedAndPriceTotals(items);
// result.amount_total = ${fmtCents(result.amount_total)} (annual gross)`}
        />
      </div>
    </div>
  );
}
