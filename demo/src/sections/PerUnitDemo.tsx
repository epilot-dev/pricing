import { computeAggregatedAndPriceTotals } from '@epilot/pricing';
import { useState, useMemo } from 'react';
import { CodeBlock } from '../components/CodeBlock';
import { ResultCard } from '../components/ResultCard';
import { buildPriceItemDto, fmtCents } from '../helpers';

export function PerUnitDemo() {
  const [unitPrice, setUnitPrice] = useState('49.99');
  const [quantity, setQuantity] = useState(5);
  const [taxRate, setTaxRate] = useState(19);
  const [isTaxInclusive, setIsTaxInclusive] = useState(true);
  const [currency, setCurrency] = useState('EUR');

  const result = useMemo(() => {
    const item = buildPriceItemDto({
      unitAmountDecimal: unitPrice,
      quantity,
      currency,
      taxRate,
      isTaxInclusive,
      description: 'Product',
    });
    return computeAggregatedAndPriceTotals([item]);
  }, [unitPrice, quantity, taxRate, isTaxInclusive, currency]);

  const lineItem = result.items?.[0];

  return (
    <div>
      <h1 className="section-title">Per Unit Pricing</h1>
      <p className="section-desc">
        The simplest model: unit price multiplied by quantity. Supports tax-inclusive and tax-exclusive modes.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-900">Configure</h3>

          <div>
            <label className="text-sm font-medium text-gray-700">Unit Price</label>
            <input
              type="number"
              step="0.01"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              className="input-field mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Quantity: <span className="text-primary-600 font-bold">{quantity}</span>
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full mt-1 accent-primary-600"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>1</span>
              <span>100</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Tax Rate (%)</label>
              <select
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="select-field mt-1"
              >
                <option value={0}>0%</option>
                <option value={6}>6%</option>
                <option value={7}>7%</option>
                <option value={10}>10%</option>
                <option value={19}>19%</option>
                <option value={21}>21%</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Currency</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="select-field mt-1">
                <option value="EUR">EUR</option>
                <option value="CHF">CHF</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Tax Mode:</label>
            <button
              onClick={() => setIsTaxInclusive(true)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                isTaxInclusive ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'
              }`}
            >
              Inclusive
            </button>
            <button
              onClick={() => setIsTaxInclusive(false)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                !isTaxInclusive ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'
              }`}
            >
              Exclusive
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Computed Result</h3>
            <div className="grid grid-cols-2 gap-3">
              <ResultCard label="Unit Amount (Net)" value={fmtCents(lineItem?.unit_amount, currency)} />
              <ResultCard label="Unit Amount (Gross)" value={fmtCents(lineItem?.unit_amount_gross, currency)} />
              <ResultCard label="Subtotal (Net)" value={fmtCents(lineItem?.amount_subtotal, currency)} />
              <ResultCard label="Total (Gross)" value={fmtCents(lineItem?.amount_total, currency)} highlight />
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Aggregated Totals</h3>
            <div className="grid grid-cols-3 gap-3">
              <ResultCard label="Amount Subtotal" value={fmtCents(result.amount_subtotal, currency)} />
              <ResultCard label="Amount Tax" value={fmtCents(result.amount_tax, currency)} color="amber" />
              <ResultCard
                label="Amount Total"
                value={fmtCents(result.amount_total, currency)}
                highlight
                color="green"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Code */}
      <div className="mt-6">
        <CodeBlock
          title="Usage"
          code={`import { computeAggregatedAndPriceTotals } from '@epilot/pricing';

const priceItem = {
  quantity: ${quantity},
  _price: {
    unit_amount: ${Math.round(parseFloat(unitPrice) * 100)},
    unit_amount_decimal: '${unitPrice}',
    unit_amount_currency: '${currency}',
    pricing_model: 'per_unit',
    is_tax_inclusive: ${isTaxInclusive},
    type: 'one_time',
    tax: [{ rate: ${taxRate}, type: 'VAT' }],
  },
};

const result = computeAggregatedAndPriceTotals([priceItem]);
// result.amount_total = ${result.amount_total}  (${fmtCents(result.amount_total, currency)})`}
        />
      </div>
    </div>
  );
}
