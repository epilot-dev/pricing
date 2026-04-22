import { computeAggregatedAndPriceTotals, PricingModel } from '@epilot/pricing';
import { useState, useMemo } from 'react';
import { CodeBlock } from '../components/CodeBlock';
import { ResultCard } from '../components/ResultCard';
import { TierChart } from '../components/TierChart';
import { buildPriceItemDto, fmtCents, fmtEur } from '../helpers';

const defaultTiers = [
  { up_to: 10, unit_amount: 5000, unit_amount_decimal: '50.00', flat_fee_amount: 0, flat_fee_amount_decimal: '0' },
  { up_to: 50, unit_amount: 4000, unit_amount_decimal: '40.00', flat_fee_amount: 0, flat_fee_amount_decimal: '0' },
  { up_to: 100, unit_amount: 3000, unit_amount_decimal: '30.00', flat_fee_amount: 0, flat_fee_amount_decimal: '0' },
  { up_to: null, unit_amount: 2000, unit_amount_decimal: '20.00', flat_fee_amount: 0, flat_fee_amount_decimal: '0' },
];

export function TieredVolumeDemo() {
  const [quantity, setQuantity] = useState(25);
  const [tiers, setTiers] = useState(defaultTiers);
  const [taxRate] = useState(19);
  const [isTaxInclusive, setIsTaxInclusive] = useState(true);

  const result = useMemo(() => {
    const item = buildPriceItemDto({
      unitAmountDecimal: '0',
      quantity,
      pricingModel: PricingModel.tieredVolume,
      taxRate,
      isTaxInclusive,
      tiers,
      description: 'Volume Product',
    });
    return computeAggregatedAndPriceTotals([item]);
  }, [quantity, tiers, taxRate, isTaxInclusive]);

  // Determine active tier
  const activeTierIdx = tiers.findIndex((t) => t.up_to === null || quantity <= t.up_to);

  const updateTier = (idx: number, field: string, value: string) => {
    setTiers((prev) =>
      prev.map((t, i) => {
        if (i !== idx) return t;
        if (field === 'up_to') {
          const v = value === '' ? null : Number(value);
          return { ...t, up_to: v as number };
        }
        const numVal = Number(value);
        return {
          ...t,
          unit_amount_decimal: value,
          unit_amount: Math.round(numVal * 100),
        };
      }),
    );
  };

  const chartBars = tiers.map((t, i) => ({
    label: t.up_to ? `≤ ${t.up_to}` : '∞',
    value: parseFloat(t.unit_amount_decimal),
    active: i === activeTierIdx,
    sublabel: `${t.unit_amount_decimal}/unit`,
  }));

  return (
    <div>
      <h1 className="section-title">Tiered Volume Pricing</h1>
      <p className="section-desc">
        A single tier is selected based on total quantity. The selected tier's unit price applies to{' '}
        <strong>all</strong> units.
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
                  <th className="pb-2">Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tiers.map((tier, idx) => (
                  <tr key={idx} className={idx === activeTierIdx ? 'bg-primary-50' : ''}>
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
                        value={tier.unit_amount_decimal}
                        onChange={(e) => updateTier(idx, 'unit_amount_decimal', e.target.value)}
                        className="input-field w-24"
                      />
                    </td>
                    <td className="py-2">{idx === activeTierIdx && <span className="badge-blue">Active</span>}</td>
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
            <div className="flex justify-between text-xs text-gray-400">
              <span>1</span>
              <span>200</span>
            </div>

            <div className="flex items-center gap-3 mt-3">
              <span className="text-xs text-gray-500">Tax: {taxRate}%</span>
              <span className="text-xs text-gray-500">|</span>
              <button
                onClick={() => setIsTaxInclusive(!isTaxInclusive)}
                className="text-xs text-primary-600 font-medium"
              >
                {isTaxInclusive ? 'Tax Inclusive' : 'Tax Exclusive'}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Chart */}
          <div className="card">
            <TierChart
              bars={chartBars}
              title="Unit Price by Tier (active tier highlighted)"
              valueFormatter={(v) => fmtEur(v)}
            />
          </div>

          {/* Results */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Computed Result</h3>
            <div className="grid grid-cols-2 gap-3">
              <ResultCard
                label="Unit Price (selected tier)"
                value={activeTierIdx >= 0 ? fmtCents(tiers[activeTierIdx].unit_amount) : '-'}
              />
              <ResultCard label="Quantity" value={quantity} />
              <ResultCard label="Subtotal (Net)" value={fmtCents(result.amount_subtotal)} />
              <ResultCard label="Total (Gross)" value={fmtCents(result.amount_total)} highlight color="green" />
            </div>
            <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
              <strong>How it works:</strong> With quantity {quantity}, tier {activeTierIdx + 1} is selected (
              {tiers[activeTierIdx]?.unit_amount_decimal}/unit). All {quantity} units use this price.
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
    pricing_model: '${PricingModel.tieredVolume}',
    is_tax_inclusive: ${isTaxInclusive},
    type: 'one_time',
    tax: [{ rate: ${taxRate}, type: 'VAT' }],
    tiers: [
${tiers.map((t) => `      { up_to: ${t.up_to === null ? 'null' : t.up_to}, unit_amount: ${t.unit_amount}, unit_amount_decimal: '${t.unit_amount_decimal}', flat_fee_amount_decimal: '0' },`).join('\n')}
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
