import { computeAggregatedAndPriceTotals, normalizeValueToFrequencyUnit } from '@epilot/pricing';
import { useState, useMemo } from 'react';
import { CodeBlock } from '../components/CodeBlock';
import { ResultCard } from '../components/ResultCard';
import { buildPriceItemDto, fmtCents } from '../helpers';

const periods = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'every_quarter', label: 'Quarterly' },
  { value: 'every_6_months', label: 'Semi-Annual' },
  { value: 'yearly', label: 'Yearly' },
];

const normFactors: Record<string, Record<string, number>> = {
  weekly: { weekly: 1, monthly: 4, every_quarter: 13, every_6_months: 26, yearly: 52 },
  monthly: { weekly: 1 / 4, monthly: 1, every_quarter: 3, every_6_months: 6, yearly: 12 },
  every_quarter: { weekly: 1 / 13, monthly: 1 / 3, every_quarter: 1, every_6_months: 2, yearly: 4 },
  every_6_months: { weekly: 1 / 26, monthly: 1 / 6, every_quarter: 1 / 2, every_6_months: 1, yearly: 2 },
  yearly: { weekly: 1 / 52, monthly: 1 / 12, every_quarter: 1 / 4, every_6_months: 1 / 2, yearly: 1 },
};

export function RecurringBillingDemo() {
  const [unitPrice, setUnitPrice] = useState('29.99');
  const [basePeriod, setBasePeriod] = useState('monthly');
  const [quantity] = useState(1);
  const [taxRate] = useState(19);
  const [isTaxInclusive, setIsTaxInclusive] = useState(true);

  const result = useMemo(() => {
    const item = buildPriceItemDto({
      unitAmountDecimal: unitPrice,
      quantity,
      pricingModel: 'per_unit',
      type: 'recurring',
      billingPeriod: basePeriod,
      taxRate,
      isTaxInclusive,
      description: 'Subscription',
    });
    return computeAggregatedAndPriceTotals([item]);
  }, [unitPrice, quantity, basePeriod, taxRate, isTaxInclusive]);

  // Frequency normalization
  const normalizedPrices = useMemo(() => {
    const base = parseFloat(unitPrice);
    if (isNaN(base)) return [];

    return periods.map((p) => {
      try {
        const normalized = normalizeValueToFrequencyUnit(unitPrice, basePeriod as any, p.value as any);
        return {
          period: p.label,
          periodValue: p.value,
          amount: typeof normalized === 'string' ? parseFloat(normalized) : normalized,
          isBase: p.value === basePeriod,
        };
      } catch {
        const factor = normFactors[basePeriod]?.[p.value] ?? 1;
        return {
          period: p.label,
          periodValue: p.value,
          amount: base * factor,
          isBase: p.value === basePeriod,
        };
      }
    });
  }, [unitPrice, basePeriod]);

  // Mixed recurrence demo
  const [showMixed, setShowMixed] = useState(false);
  const mixedResult = useMemo(() => {
    const items = [
      buildPriceItemDto({
        unitAmountDecimal: '499.00',
        quantity: 1,
        type: 'one_time',
        taxRate: 19,
        isTaxInclusive: true,
        description: 'Setup Fee',
      }),
      buildPriceItemDto({
        unitAmountDecimal: '29.99',
        quantity: 1,
        type: 'recurring',
        billingPeriod: 'monthly',
        taxRate: 19,
        isTaxInclusive: true,
        description: 'Monthly Plan',
      }),
      buildPriceItemDto({
        unitAmountDecimal: '199.00',
        quantity: 1,
        type: 'recurring',
        billingPeriod: 'yearly',
        taxRate: 19,
        isTaxInclusive: true,
        description: 'Annual License',
      }),
    ];
    return computeAggregatedAndPriceTotals(items);
  }, []);

  return (
    <div>
      <h1 className="section-title">Recurring Billing</h1>
      <p className="section-desc">
        Support for one-time and recurring prices with frequency normalization. Convert prices between billing periods
        automatically.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Configure</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Billing Period</label>
                <select
                  value={basePeriod}
                  onChange={(e) => setBasePeriod(e.target.value)}
                  className="select-field mt-1"
                >
                  {periods.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs text-gray-500">Qty: {quantity}</span>
              <span className="text-xs text-gray-400">|</span>
              <button
                onClick={() => setIsTaxInclusive(!isTaxInclusive)}
                className="text-xs text-primary-600 font-medium"
              >
                {isTaxInclusive ? 'Inclusive' : 'Exclusive'} ({taxRate}%)
              </button>
            </div>
          </div>

          {/* Computed Result */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Computed Result</h3>
            <div className="grid grid-cols-2 gap-3">
              <ResultCard label="Subtotal" value={fmtCents(result.amount_subtotal)} />
              <ResultCard label="Tax" value={fmtCents(result.amount_tax)} color="amber" />
              <ResultCard label="Total" value={fmtCents(result.amount_total)} highlight color="green" />
              <ResultCard
                label="Billing Period"
                value={periods.find((p) => p.value === basePeriod)?.label ?? basePeriod}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Frequency Normalization */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Frequency Normalization</h3>
            <p className="text-xs text-gray-500 mb-3">
              Same price expressed in different billing periods using normalizeValueToFrequencyUnit()
            </p>
            <div className="space-y-2">
              {normalizedPrices.map((np) => (
                <div
                  key={np.period}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    np.isBase ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50'
                  }`}
                >
                  <span className="text-sm font-medium text-gray-700">
                    {np.period}
                    {np.isBase && <span className="text-primary-600 ml-1 text-xs">(base)</span>}
                  </span>
                  <span className={`text-lg font-bold ${np.isBase ? 'text-primary-600' : 'text-gray-900'}`}>
                    €{typeof np.amount === 'number' ? np.amount.toFixed(2) : np.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mixed Recurrence */}
      <div className="card mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Mixed Recurrence Example</h3>
          <button onClick={() => setShowMixed(!showMixed)} className="btn-secondary text-xs">
            {showMixed ? 'Hide' : 'Show'}
          </button>
        </div>
        {showMixed && (
          <div>
            <p className="text-sm text-gray-500 mb-4">
              Three items: a one-time setup fee, a monthly subscription, and an annual license. The library groups
              totals by recurrence type.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-4">
              {['Setup Fee (€499, one-time)', 'Monthly Plan (€29.99/mo)', 'Annual License (€199/yr)'].map(
                (label, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg text-center">
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="font-bold mt-1">{fmtCents(mixedResult.items?.[i]?.amount_total)}</p>
                  </div>
                ),
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <ResultCard label="Total Subtotal" value={fmtCents(mixedResult.amount_subtotal)} />
              <ResultCard label="Total Tax" value={fmtCents(mixedResult.amount_tax)} color="amber" />
              <ResultCard label="Grand Total" value={fmtCents(mixedResult.amount_total)} highlight color="green" />
            </div>

            {(mixedResult.total_details?.breakdown?.recurrences?.length ?? 0) > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Grouped by Recurrence:</p>
                {mixedResult.total_details?.breakdown?.recurrences?.map((r: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className={r.type === 'one_time' ? 'badge-blue' : 'badge-green'}>
                      {r.type === 'one_time' ? 'One-time' : r.billing_period}
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-medium">{fmtCents(r.amount_total)}</span>
                      <span className="text-xs text-gray-400 ml-2">(net: {fmtCents(r.amount_subtotal)})</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Usage */}
      <div className="mt-6">
        <CodeBlock
          title="Usage"
          code={`import { computeAggregatedAndPriceTotals, normalizeValueToFrequencyUnit } from '@epilot/pricing';

// Recurring price item
const priceItem = {
  quantity: ${quantity},
  pricing_model: 'per_unit',
  is_tax_inclusive: ${isTaxInclusive},
  _price: {
    unit_amount_decimal: '${unitPrice}',
    unit_amount_currency: 'EUR',
    pricing_model: 'per_unit',
    is_tax_inclusive: ${isTaxInclusive},
    type: 'recurring',
    billing_period: '${basePeriod}',
    tax: [{ rate: ${taxRate}, type: 'VAT' }],
  },
  taxes: [{ tax: { rate: ${taxRate} } }],
};

const result = computeAggregatedAndPriceTotals([priceItem]);
// result.amount_total = ${fmtCents(result.amount_total)}

// Normalize price across billing periods
const yearlyPrice = normalizeValueToFrequencyUnit(
  '${unitPrice}',  // amount
  '${basePeriod}',  // from
  'yearly',         // to
);
// yearlyPrice = ${normalizedPrices.find((p) => p.periodValue === 'yearly')?.amount.toFixed(2) ?? 'N/A'}`}
        />
      </div>
    </div>
  );
}
