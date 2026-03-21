import { useState, useMemo } from 'react';
import { computeAggregatedAndPriceTotals } from '@epilot/pricing';
import { ResultCard } from '../components/ResultCard';
import { CodeBlock } from '../components/CodeBlock';
import { buildPriceItemDto, fmtCents } from '../helpers';

const defaultTiers = [
  { up_to: 10, unit_amount: 5000, unit_amount_decimal: '50.00', flat_fee_amount: 0, flat_fee_amount_decimal: '0' },
  { up_to: 50, unit_amount: 3000, unit_amount_decimal: '30.00', flat_fee_amount: 0, flat_fee_amount_decimal: '0' },
  { up_to: 100, unit_amount: 2000, unit_amount_decimal: '20.00', flat_fee_amount: 0, flat_fee_amount_decimal: '0' },
  { up_to: null, unit_amount: 1000, unit_amount_decimal: '10.00', flat_fee_amount: 0, flat_fee_amount_decimal: '0' },
];

function getTierBreakdown(quantity: number, tiers: typeof defaultTiers) {
  const breakdown: { tier: number; from: number; to: number; qty: number; rate: string; subtotal: number }[] = [];
  let remaining = quantity;
  let prevLimit = 0;

  for (let i = 0; i < tiers.length && remaining > 0; i++) {
    const tierLimit = tiers[i].up_to ?? Infinity;
    const tierCapacity = tierLimit - prevLimit;
    const qtyInTier = Math.min(remaining, tierCapacity);
    const rate = parseFloat(tiers[i].unit_amount_decimal);

    breakdown.push({
      tier: i + 1,
      from: prevLimit + 1,
      to: prevLimit + qtyInTier,
      qty: qtyInTier,
      rate: tiers[i].unit_amount_decimal,
      subtotal: qtyInTier * rate * 100,
    });

    remaining -= qtyInTier;
    prevLimit = tierLimit === Infinity ? prevLimit + qtyInTier : tierLimit;
  }
  return breakdown;
}

export function TieredGraduatedDemo() {
  const [quantity, setQuantity] = useState(75);
  const [tiers, setTiers] = useState(defaultTiers);
  const [isTaxInclusive, setIsTaxInclusive] = useState(true);
  const [taxRate, setTaxRate] = useState(19);

  const result = useMemo(() => {
    const item = buildPriceItemDto({
      unitAmountDecimal: '0',
      quantity,
      pricingModel: 'tiered_graduated',
      taxRate,
      isTaxInclusive,
      tiers,
      description: 'Graduated Product',
    });
    return computeAggregatedAndPriceTotals([item]);
  }, [quantity, tiers, taxRate, isTaxInclusive]);

  const breakdown = getTierBreakdown(quantity, tiers);

  const updateTier = (idx: number, field: string, value: string) => {
    setTiers((prev) =>
      prev.map((t, i) => {
        if (i !== idx) return t;
        if (field === 'up_to') return { ...t, up_to: value === '' ? null : (Number(value) as any) };
        return { ...t, unit_amount_decimal: value, unit_amount: Math.round(Number(value) * 100) };
      }),
    );
  };

  // Stacked bar visualization
  const totalUnits = breakdown.reduce((s, b) => s + b.qty, 0);
  const tierColors = ['bg-blue-400', 'bg-indigo-400', 'bg-purple-400', 'bg-pink-400'];

  return (
    <div>
      <h1 className="section-title">Tiered Graduated Pricing</h1>
      <p className="section-desc">
        Units are spread across tiers. Each tier charges its own rate for the units within its range.
        This is the "graduated" model used by many SaaS platforms.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {/* Tier Editor */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Tier Configuration</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase">
                  <th className="pb-2">Tier</th>
                  <th className="pb-2">Up To</th>
                  <th className="pb-2">Unit Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tiers.map((tier, idx) => (
                  <tr key={idx}>
                    <td className="py-2">
                      <span className={`inline-block w-3 h-3 rounded-sm ${tierColors[idx]} mr-2`} />
                      Tier {idx + 1}
                    </td>
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
                        value={tier.unit_amount_decimal}
                        onChange={(e) => updateTier(idx, 'unit_amount_decimal', e.target.value)}
                        className="input-field w-24"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quantity */}
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
          {/* Stacked Bar */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Tier Breakdown Visualization</h3>
            <div className="h-12 flex rounded-lg overflow-hidden">
              {breakdown.map((b, i) => (
                <div
                  key={i}
                  className={`${tierColors[i]} flex items-center justify-center text-white text-xs font-medium transition-all duration-300`}
                  style={{ width: `${(b.qty / Math.max(totalUnits, 1)) * 100}%` }}
                  title={`Tier ${b.tier}: ${b.qty} units @ €${b.rate}`}
                >
                  {b.qty > 5 && `${b.qty}u`}
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-1.5">
              {breakdown.map((b, i) => (
                <div key={i} className="flex items-center text-sm">
                  <span className={`inline-block w-3 h-3 rounded-sm ${tierColors[i]} mr-2`} />
                  <span className="text-gray-600 flex-1">
                    Tier {b.tier}: units {b.from}-{b.to} ({b.qty} units)
                  </span>
                  <span className="text-gray-500">@ €{b.rate}/unit</span>
                  <span className="ml-3 font-medium text-gray-900">{fmtCents(b.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Computed Result</h3>
            <div className="grid grid-cols-2 gap-3">
              <ResultCard label="Subtotal (Net)" value={fmtCents(result.amount_subtotal)} />
              <ResultCard label="Tax" value={fmtCents(result.amount_tax)} color="amber" />
              <ResultCard
                label="Total (Gross)"
                value={fmtCents(result.amount_total)}
                highlight
                color="green"
              />
              <ResultCard
                label="Avg Price/Unit"
                value={
                  quantity > 0
                    ? fmtCents(Math.round((result.amount_total ?? 0) / quantity))
                    : '-'
                }
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
  pricing_model: 'tiered_graduated',
  is_tax_inclusive: ${isTaxInclusive},
  _price: {
    unit_amount_decimal: '0',
    unit_amount_currency: 'EUR',
    pricing_model: 'tiered_graduated',
    is_tax_inclusive: ${isTaxInclusive},
    tax: [{ rate: ${taxRate}, type: 'VAT' }],
    tiers: [
${tiers.map((t) => `      { up_to: ${t.up_to === null ? 'null' : t.up_to}, unit_amount_decimal: '${t.unit_amount_decimal}', flat_fee_amount_decimal: '0' },`).join('\n')}
    ],
  },
  taxes: [{ tax: { rate: ${taxRate} } }],
};

const result = computeAggregatedAndPriceTotals([priceItem]);
// result.amount_total = ${result.amount_total}  (${fmtCents(result.amount_total)})`}
        />
      </div>
    </div>
  );
}
