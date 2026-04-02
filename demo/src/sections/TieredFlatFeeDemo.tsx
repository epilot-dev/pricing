import { computeAggregatedAndPriceTotals } from '@epilot/pricing';
import { useState, useMemo } from 'react';
import { CodeBlock } from '../components/CodeBlock';
import { ResultCard } from '../components/ResultCard';
import { buildPriceItemDto, fmtCents } from '../helpers';

const defaultTiers = [
  { up_to: 10, unit_amount: 0, unit_amount_decimal: '0', flat_fee_amount: 9900, flat_fee_amount_decimal: '99.00' },
  { up_to: 50, unit_amount: 0, unit_amount_decimal: '0', flat_fee_amount: 19900, flat_fee_amount_decimal: '199.00' },
  { up_to: 100, unit_amount: 0, unit_amount_decimal: '0', flat_fee_amount: 34900, flat_fee_amount_decimal: '349.00' },
  { up_to: null, unit_amount: 0, unit_amount_decimal: '0', flat_fee_amount: 49900, flat_fee_amount_decimal: '499.00' },
];

export function TieredFlatFeeDemo() {
  const [quantity, setQuantity] = useState(30);
  const [tiers, setTiers] = useState(defaultTiers);
  const [taxRate] = useState(19);
  const [isTaxInclusive, setIsTaxInclusive] = useState(true);

  const result = useMemo(() => {
    const item = buildPriceItemDto({
      unitAmountDecimal: '0',
      quantity,
      pricingModel: 'tiered_flatfee',
      taxRate,
      isTaxInclusive,
      tiers,
      description: 'Flat Fee Product',
    });
    return computeAggregatedAndPriceTotals([item]);
  }, [quantity, tiers, taxRate, isTaxInclusive]);

  const activeTierIdx = tiers.findIndex((t) => t.up_to === null || quantity <= t.up_to);

  const updateTier = (idx: number, field: string, value: string) => {
    setTiers((prev) =>
      prev.map((t, i) => {
        if (i !== idx) return t;
        if (field === 'up_to') return { ...t, up_to: value === '' ? null : (Number(value) as any) };
        return { ...t, flat_fee_amount_decimal: value, flat_fee_amount: Math.round(Number(value) * 100) };
      }),
    );
  };

  return (
    <div>
      <h1 className="section-title">Tiered Flat Fee</h1>
      <p className="section-desc">
        A single fixed fee is charged based on the quantity range. Unlike volume pricing, the fee does{' '}
        <strong>not</strong> multiply by quantity.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Tier Configuration</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase">
                  <th className="pb-2">Tier</th>
                  <th className="pb-2">Up To</th>
                  <th className="pb-2">Flat Fee</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tiers.map((tier, idx) => (
                  <tr key={idx} className={idx === activeTierIdx ? 'bg-green-50' : ''}>
                    <td className="py-2 font-medium text-gray-600">Tier {idx + 1}</td>
                    <td className="py-2">
                      <input
                        type="number"
                        value={tier.up_to ?? ''}
                        placeholder="∞"
                        onChange={(e) => updateTier(idx, 'up_to', e.target.value)}
                        className="input-field w-20"
                      />
                    </td>
                    <td className="py-2">
                      <input
                        type="number"
                        step="0.01"
                        value={tier.flat_fee_amount_decimal}
                        onChange={(e) => updateTier(idx, 'flat_fee_amount_decimal', e.target.value)}
                        className="input-field w-28"
                      />
                    </td>
                    <td className="py-2">{idx === activeTierIdx && <span className="badge-green">Selected</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <label className="text-sm font-medium text-gray-700">
              Quantity: <span className="text-primary-600 font-bold text-lg">{quantity}</span>
            </label>
            <input
              type="range"
              min="1"
              max="200"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full mt-2 accent-primary-600"
            />
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => setIsTaxInclusive(!isTaxInclusive)}
                className="text-xs text-primary-600 font-medium"
              >
                {isTaxInclusive ? 'Tax Inclusive' : 'Tax Exclusive'} ({taxRate}%)
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Visual */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Fee by Range</h3>
            <div className="space-y-2">
              {tiers.map((tier, idx) => {
                const prevLimit = idx === 0 ? 0 : (tiers[idx - 1].up_to ?? 0);
                const isActive = idx === activeTierIdx;
                return (
                  <div
                    key={idx}
                    className={`flex items-center rounded-lg p-3 transition-colors ${
                      isActive ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-700">
                        {prevLimit + 1} - {tier.up_to ?? '∞'} units
                      </span>
                    </div>
                    <span className={`text-lg font-bold ${isActive ? 'text-green-600' : 'text-gray-400'}`}>
                      €{tier.flat_fee_amount_decimal}
                    </span>
                    {isActive && <span className="ml-2 text-xs text-green-600 font-medium">← Your plan</span>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Computed Result</h3>
            <div className="grid grid-cols-2 gap-3">
              <ResultCard label="Subtotal (Net)" value={fmtCents(result.amount_subtotal)} />
              <ResultCard label="Tax" value={fmtCents(result.amount_tax)} color="amber" />
              <ResultCard label="Total (Gross)" value={fmtCents(result.amount_total)} highlight color="green" />
              <ResultCard
                label="Effective cost/unit"
                value={quantity > 0 ? fmtCents(Math.round((result.amount_total ?? 0) / quantity)) : '-'}
                color="blue"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Usage */}
      <div className="mt-6">
        <CodeBlock
          title="Usage"
          code={`import { computeAggregatedAndPriceTotals } from '@epilot/pricing';

const priceItem = {
  quantity: ${quantity},
  _price: {
    unit_amount_decimal: '0',
    unit_amount_currency: 'EUR',
    pricing_model: 'tiered_flatfee',
    is_tax_inclusive: ${isTaxInclusive},
    type: 'one_time',
    tax: [{ rate: ${taxRate}, type: 'VAT' }],
    tiers: [
${tiers.map((t) => `      { up_to: ${t.up_to === null ? 'null' : t.up_to}, unit_amount_decimal: '0', flat_fee_amount: ${t.flat_fee_amount}, flat_fee_amount_decimal: '${t.flat_fee_amount_decimal}' },`).join('\n')}
    ],
  },
};

const result = computeAggregatedAndPriceTotals([priceItem]);
// result.amount_total = ${result.amount_total}  (${fmtCents(result.amount_total)})`}
        />
      </div>
    </div>
  );
}
