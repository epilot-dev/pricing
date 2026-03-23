import { computeAggregatedAndPriceTotals } from '@epilot/pricing';
import { useState, useMemo } from 'react';
import { CodeBlock } from '../components/CodeBlock';
import { ResultCard } from '../components/ResultCard';
import { buildPriceItemDto, fmtCents } from '../helpers';

export function TaxDemo() {
  const [unitPrice, setUnitPrice] = useState('100.00');
  const [quantity, setQuantity] = useState(3);
  const [taxRate, setTaxRate] = useState(19);

  // Compute both modes side by side
  const inclusiveResult = useMemo(() => {
    const item = buildPriceItemDto({
      unitAmountDecimal: unitPrice,
      quantity,
      taxRate,
      isTaxInclusive: true,
    });
    return computeAggregatedAndPriceTotals([item]);
  }, [unitPrice, quantity, taxRate]);

  const exclusiveResult = useMemo(() => {
    const item = buildPriceItemDto({
      unitAmountDecimal: unitPrice,
      quantity,
      taxRate,
      isTaxInclusive: false,
    });
    return computeAggregatedAndPriceTotals([item]);
  }, [unitPrice, quantity, taxRate]);

  // Multi-tax demo
  const [showMultiTax, setShowMultiTax] = useState(false);
  const multiTaxResult = useMemo(() => {
    const item1 = buildPriceItemDto({
      unitAmountDecimal: '50.00',
      quantity: 2,
      taxRate: 19,
      isTaxInclusive: true,
      description: 'Standard Rate Item',
    });
    const item2 = buildPriceItemDto({
      unitAmountDecimal: '30.00',
      quantity: 3,
      taxRate: 7,
      isTaxInclusive: true,
      description: 'Reduced Rate Item',
    });
    return computeAggregatedAndPriceTotals([item1, item2]);
  }, []);

  const incItem = inclusiveResult.items?.[0];
  const excItem = exclusiveResult.items?.[0];

  return (
    <div>
      <h1 className="section-title">Tax Handling</h1>
      <p className="section-desc">
        Compare tax-inclusive vs tax-exclusive pricing side by side. The library handles tax calculations precisely
        using Dinero.js for decimal arithmetic.
      </p>

      {/* Controls */}
      <div className="card mb-6">
        <div className="grid grid-cols-3 gap-4">
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
              max="20"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full mt-3 accent-primary-600"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Tax Rate (%)</label>
            <select value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} className="select-field mt-1">
              <option value={0}>0%</option>
              <option value={6}>6%</option>
              <option value={7}>7%</option>
              <option value={10}>10%</option>
              <option value={19}>19%</option>
              <option value={21}>21%</option>
            </select>
          </div>
        </div>
      </div>

      {/* Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Inclusive */}
        <div className="card border-blue-200">
          <div className="flex items-center gap-2 mb-4">
            <span className="badge-blue">Tax Inclusive</span>
            <span className="text-xs text-gray-500">Price includes tax</span>
          </div>
          <div className="space-y-3">
            <ResultCard label="Unit Price (what customer sees)" value={`€${unitPrice}`} />
            <ResultCard label="Net per unit (excluding tax)" value={fmtCents(incItem?.unit_amount)} />
            <ResultCard label="Line Subtotal (Net)" value={fmtCents(inclusiveResult.amount_subtotal)} />
            <ResultCard label="Tax Amount" value={fmtCents(inclusiveResult.amount_tax)} color="amber" />
            <ResultCard
              label="Line Total (Gross)"
              value={fmtCents(inclusiveResult.amount_total)}
              highlight
              color="green"
            />
          </div>
          <div className="mt-3 p-3 bg-blue-50 rounded text-xs text-blue-700">
            The €{unitPrice} price already contains {taxRate}% tax. Net = €{unitPrice} / 1.
            {String(taxRate).padStart(2, '0')} per unit.
          </div>
        </div>

        {/* Exclusive */}
        <div className="card border-amber-200">
          <div className="flex items-center gap-2 mb-4">
            <span className="badge-amber">Tax Exclusive</span>
            <span className="text-xs text-gray-500">Tax added on top</span>
          </div>
          <div className="space-y-3">
            <ResultCard label="Unit Price (net)" value={`€${unitPrice}`} />
            <ResultCard label="Gross per unit (including tax)" value={fmtCents(excItem?.unit_amount_gross)} />
            <ResultCard label="Line Subtotal (Net)" value={fmtCents(exclusiveResult.amount_subtotal)} />
            <ResultCard label="Tax Amount" value={fmtCents(exclusiveResult.amount_tax)} color="amber" />
            <ResultCard
              label="Line Total (Gross)"
              value={fmtCents(exclusiveResult.amount_total)}
              highlight
              color="green"
            />
          </div>
          <div className="mt-3 p-3 bg-amber-50 rounded text-xs text-amber-700">
            €{unitPrice} is the net price. {taxRate}% tax is added on top. Gross = €{unitPrice} * 1.
            {String(taxRate).padStart(2, '0')} per unit.
          </div>
        </div>
      </div>

      {/* Multi-Tax */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Multi-Tax Breakdown</h3>
          <button onClick={() => setShowMultiTax(!showMultiTax)} className="btn-secondary text-xs">
            {showMultiTax ? 'Hide' : 'Show'} Example
          </button>
        </div>
        {showMultiTax && (
          <div>
            <p className="text-sm text-gray-500 mb-4">
              Two items with different tax rates (19% standard, 7% reduced). The library tracks tax breakdown by rate.
            </p>
            <div className="grid grid-cols-4 gap-3 mb-4">
              <ResultCard label="Subtotal" value={fmtCents(multiTaxResult.amount_subtotal)} />
              <ResultCard label="Tax (Total)" value={fmtCents(multiTaxResult.amount_tax)} color="amber" />
              <ResultCard label="Total" value={fmtCents(multiTaxResult.amount_total)} highlight color="green" />
              <ResultCard label="Items" value={multiTaxResult.items?.length ?? 0} />
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-700 mb-2">Tax Breakdown:</p>
              {multiTaxResult.total_details?.breakdown?.taxes?.map((t: any, i: number) => {
                const rate = t.tax?.rate ?? t.rateValue ?? 0;
                const type = t.tax?.type || 'VAT';
                return (
                  <div key={i} className="flex items-center gap-3 py-1.5 border-b border-gray-100">
                    <span className="badge-amber">{rate}%</span>
                    <span className="text-gray-600 flex-1">
                      {type} {rate}%
                    </span>
                    <span className="font-medium">{fmtCents(t.amount)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Usage */}
      <div className="mt-6">
        <CodeBlock
          title="Usage"
          code={`import { computeAggregatedAndPriceTotals } from '@epilot/pricing';

// Tax-inclusive: price already contains tax
const inclusiveItem = {
  quantity: ${quantity},
  pricing_model: 'per_unit',
  is_tax_inclusive: true,
  _price: {
    unit_amount_decimal: '${unitPrice}',
    unit_amount_currency: 'EUR',
    pricing_model: 'per_unit',
    is_tax_inclusive: true,
    tax: [{ rate: ${taxRate}, type: 'VAT' }],
  },
  taxes: [{ tax: { rate: ${taxRate} } }],
};

// Tax-exclusive: tax is added on top
const exclusiveItem = {
  ...inclusiveItem,
  is_tax_inclusive: false,
  _price: { ...inclusiveItem._price, is_tax_inclusive: false },
};

const inclusiveResult = computeAggregatedAndPriceTotals([inclusiveItem]);
const exclusiveResult = computeAggregatedAndPriceTotals([exclusiveItem]);
// Inclusive total: ${fmtCents(inclusiveResult.amount_total)}
// Exclusive total: ${fmtCents(exclusiveResult.amount_total)}`}
        />
      </div>
    </div>
  );
}
