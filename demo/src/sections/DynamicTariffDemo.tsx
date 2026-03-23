import { computeAggregatedAndPriceTotals } from '@epilot/pricing';
import { useState, useMemo } from 'react';
import { CodeBlock } from '../components/CodeBlock';
import { ResultCard } from '../components/ResultCard';
import { buildPriceItemDto, fmtCents } from '../helpers';

export function DynamicTariffDemo() {
  const [marketPrice, setMarketPrice] = useState('8.50');
  const [markup, setMarkup] = useState('2.00');
  const [quantity, setQuantity] = useState(1000); // kWh
  const [taxRate, setTaxRate] = useState(19);
  const [isTaxInclusive, setIsTaxInclusive] = useState(false);

  const result = useMemo(() => {
    const totalPrice = (parseFloat(marketPrice) + parseFloat(markup)).toFixed(2);
    const item = buildPriceItemDto({
      unitAmountDecimal: totalPrice,
      quantity,
      pricingModel: 'per_unit',
      type: 'recurring',
      billingPeriod: 'monthly',
      taxRate,
      isTaxInclusive,
      description: 'Dynamic Energy Tariff',
      dynamicTariff: {
        mode: 'manual',
        average_market_price_decimal: marketPrice,
        markup_amount_decimal: markup,
        markup_amount: Math.round(parseFloat(markup) * 100),
      },
    });
    return computeAggregatedAndPriceTotals([item]);
  }, [marketPrice, markup, quantity, taxRate, isTaxInclusive]);

  const totalPerUnit = parseFloat(marketPrice) + parseFloat(markup);
  const lineItem = result.items?.[0];

  // Simulate market price fluctuations
  const priceHistory = useMemo(() => {
    const base = parseFloat(marketPrice);
    return Array.from({ length: 24 }, (_, i) => ({
      hour: `${String(i).padStart(2, '0')}:00`,
      price: Math.max(0, base + Math.sin(i / 4) * 3 + (Math.random() - 0.5) * 2),
    }));
  }, [marketPrice]);

  const avgHistPrice = priceHistory.reduce((s, p) => s + p.price, 0) / priceHistory.length;
  const maxHistPrice = Math.max(...priceHistory.map((p) => p.price));

  return (
    <div>
      <h1 className="section-title">Dynamic Tariff</h1>
      <p className="section-desc">
        Market-based pricing for energy products. Combines a day-ahead market price with a configurable markup. Supports
        both automatic (day_ahead_market) and manual modes.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Configuration</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Market Price (ct/kWh)</label>
                <input
                  type="number"
                  step="0.01"
                  value={marketPrice}
                  onChange={(e) => setMarketPrice(e.target.value)}
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Markup (ct/kWh)</label>
                <input
                  type="number"
                  step="0.01"
                  value={markup}
                  onChange={(e) => setMarkup(e.target.value)}
                  className="input-field mt-1"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="text-sm font-medium text-gray-700">
                Consumption: <span className="text-primary-600 font-bold">{quantity} kWh</span>
              </label>
              <input
                type="range"
                min="100"
                max="10000"
                step="100"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full mt-1 accent-primary-600"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>100 kWh</span>
                <span>10,000 kWh</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => setIsTaxInclusive(!isTaxInclusive)}
                className="text-xs text-primary-600 font-medium"
              >
                {isTaxInclusive ? 'Tax Inclusive' : 'Tax Exclusive'}
              </button>
              <span className="text-xs text-gray-400">({taxRate}%)</span>
            </div>
          </div>

          {/* Price Composition */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Price Composition</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <span className="text-sm text-gray-700">Market Price</span>
                <span className="font-bold text-yellow-600">{marketPrice} ct/kWh</span>
              </div>
              <div className="flex items-center justify-center text-gray-400 text-lg">+</div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-gray-700">Supplier Markup</span>
                <span className="font-bold text-blue-600">{markup} ct/kWh</span>
              </div>
              <div className="flex items-center justify-center text-gray-400 text-lg">=</div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-sm font-medium text-gray-700">Total Unit Price</span>
                <span className="font-bold text-green-600">{totalPerUnit.toFixed(2)} ct/kWh</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Simulated Market Chart */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Simulated 24h Market Prices</h3>
            <div className="flex items-end gap-[2px] h-32">
              {priceHistory.map((p, i) => {
                const height = Math.max((p.price / maxHistPrice) * 100, 2);
                return (
                  <div
                    key={i}
                    className="flex-1 bg-yellow-400 rounded-t-sm hover:bg-yellow-500 transition-colors"
                    style={{ height: `${height}%` }}
                    title={`${p.hour}: ${p.price.toFixed(2)} ct/kWh`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>00:00</span>
              <span>Avg: {avgHistPrice.toFixed(2)} ct/kWh</span>
              <span>23:00</span>
            </div>
          </div>

          {/* Results */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Computed Result</h3>
            <div className="grid grid-cols-2 gap-3">
              <ResultCard label="Unit Price" value={`${totalPerUnit.toFixed(2)} ct/kWh`} />
              <ResultCard label="Consumption" value={`${quantity} kWh`} />
              <ResultCard label="Subtotal (Net)" value={fmtCents(result.amount_subtotal)} />
              <ResultCard label="Tax" value={fmtCents(result.amount_tax)} color="amber" />
              <ResultCard label="Monthly Total" value={fmtCents(result.amount_total)} highlight color="green" />
              <ResultCard label="Annual Estimate" value={fmtCents((result.amount_total ?? 0) * 12)} color="blue" />
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
  pricing_model: 'per_unit',
  is_tax_inclusive: ${isTaxInclusive},
  _price: {
    unit_amount_decimal: '${totalPerUnit.toFixed(2)}',
    unit_amount_currency: 'EUR',
    pricing_model: 'per_unit',
    is_tax_inclusive: ${isTaxInclusive},
    type: 'recurring',
    billing_period: 'monthly',
    tax: [{ rate: ${taxRate}, type: 'VAT' }],
    // Dynamic tariff configuration
    dynamic_tariff: {
      mode: 'manual',  // or 'day_ahead_market'
      average_market_price_decimal: '${marketPrice}',
      markup_amount_decimal: '${markup}',
    },
  },
  taxes: [{ tax: { rate: ${taxRate} } }],
};

const result = computeAggregatedAndPriceTotals([priceItem]);
// result.amount_total = ${fmtCents(result.amount_total)}`}
        />
      </div>
    </div>
  );
}
