import { computeAggregatedAndPriceTotals, PricingModel } from '@epilot/pricing';
import type { Coupon } from '@epilot/pricing/shared/types';
import { useState, useMemo } from 'react';
import { CodeBlock } from '../components/CodeBlock';
import { ResultCard } from '../components/ResultCard';
import { buildPriceItemDto, fmtCents, makeCoupon } from '../helpers';

type CouponConfig = {
  type: 'fixed' | 'percentage';
  category: Coupon['category'];
  value: string;
};

export function DiscountDemo() {
  const [unitPrice, setUnitPrice] = useState('100.00');
  const [quantity, setQuantity] = useState(1);
  const [taxRate] = useState(19);
  const [isTaxInclusive, setIsTaxInclusive] = useState(true);
  const [couponConfig, setCouponConfig] = useState<CouponConfig>({
    type: 'percentage',
    category: 'discount',
    value: '15',
  });

  const baseResult = useMemo(() => {
    const item = buildPriceItemDto({
      unitAmountDecimal: unitPrice,
      quantity,
      taxRate,
      isTaxInclusive,
    });
    return computeAggregatedAndPriceTotals([item]);
  }, [unitPrice, quantity, taxRate, isTaxInclusive]);

  const discountResult = useMemo(() => {
    const coupon =
      couponConfig.type === 'percentage'
        ? makeCoupon({
            type: 'percentage',
            category: couponConfig.category,
            percentageValue: couponConfig.value,
            name: `${couponConfig.value}% ${couponConfig.category}`,
            ...(couponConfig.category === 'cashback' && { cashbackPeriod: 12 as Coupon['cashbackPeriod'] }),
          })
        : makeCoupon({
            type: 'fixed',
            category: couponConfig.category,
            fixedValueDecimal: couponConfig.value,
            fixedValue: Math.round(parseFloat(couponConfig.value) * 100),
            name: `€${couponConfig.value} ${couponConfig.category}`,
            ...(couponConfig.category === 'cashback' && { cashbackPeriod: 12 as Coupon['cashbackPeriod'] }),
          });

    const item = buildPriceItemDto({
      unitAmountDecimal: unitPrice,
      quantity,
      taxRate,
      isTaxInclusive,
      coupons: [coupon],
    });
    return computeAggregatedAndPriceTotals([item]);
  }, [unitPrice, quantity, taxRate, isTaxInclusive, couponConfig]);

  const discountItem = discountResult.items?.[0];
  const savings = (baseResult.amount_total ?? 0) - (discountResult.amount_total ?? 0);

  const presets = [
    { label: '10% Off', config: { type: 'percentage' as const, category: 'discount' as const, value: '10' } },
    { label: '25% Off', config: { type: 'percentage' as const, category: 'discount' as const, value: '25' } },
    { label: '€50 Off', config: { type: 'fixed' as const, category: 'discount' as const, value: '50.00' } },
    { label: '€20 Cashback', config: { type: 'fixed' as const, category: 'cashback' as const, value: '20.00' } },
  ];

  return (
    <div>
      <h1 className="section-title">Discounts & Coupons</h1>
      <p className="section-desc">
        Apply fixed-value or percentage discounts, and fixed-value cashback coupons. Discounts reduce the total price
        while cashback is a separate refund amount. Coupons are prioritized: cashback &gt; discounts, percentage &gt;
        fixed.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {/* Base Price Controls */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Base Price</h3>
            <div className="grid grid-cols-2 gap-3">
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
                <label className="text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="input-field mt-1"
                />
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

          {/* Coupon Config */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Coupon Configuration</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {presets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setCouponConfig(p.config)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                    couponConfig.value === p.config.value &&
                    couponConfig.type === p.config.type &&
                    couponConfig.category === p.config.category
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Type</label>
                <select
                  value={couponConfig.type}
                  onChange={(e) => setCouponConfig((c) => ({ ...c, type: e.target.value as 'fixed' | 'percentage' }))}
                  className="select-field mt-1"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Category</label>
                <select
                  value={couponConfig.category}
                  onChange={(e) =>
                    setCouponConfig((c) => ({ ...c, category: e.target.value as 'discount' | 'cashback' }))
                  }
                  className="select-field mt-1"
                >
                  <option value="discount">Discount</option>
                  <option value="cashback">Cashback</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {couponConfig.type === 'percentage' ? 'Percentage' : 'Amount (€)'}
                </label>
                <input
                  type="number"
                  step={couponConfig.type === 'percentage' ? '1' : '0.01'}
                  value={couponConfig.value}
                  onChange={(e) => setCouponConfig((c) => ({ ...c, value: e.target.value }))}
                  className="input-field mt-1"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Before/After */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Before vs After</h3>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 uppercase font-medium">Before</p>
                <p className="text-xl font-bold text-gray-400 line-through mt-1">{fmtCents(baseResult.amount_total)}</p>
              </div>
              <svg
                className="w-6 h-6 text-gray-300 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <div className="flex-1 text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs text-green-600 uppercase font-medium">After</p>
                <p className="text-xl font-bold text-green-600 mt-1">{fmtCents(discountResult.amount_total)}</p>
              </div>
            </div>

            {savings > 0 && (
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <span className="text-sm font-semibold text-red-600">
                  You save {fmtCents(savings)}
                  {discountItem?.discount_percentage ? ` (${discountItem.discount_percentage}%)` : ''}
                </span>
              </div>
            )}
          </div>

          {/* Detailed Breakdown */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Detailed Breakdown</h3>
            <div className="grid grid-cols-2 gap-3">
              <ResultCard
                label="Before Discount (Total)"
                value={fmtCents(discountItem?.before_discount_amount_total)}
              />
              <ResultCard label="Discount Amount" value={fmtCents(discountItem?.discount_amount)} color="red" />
              <ResultCard label="Amount Subtotal" value={fmtCents(discountResult.amount_subtotal)} />
              <ResultCard label="Amount Tax" value={fmtCents(discountResult.amount_tax)} color="amber" />
              <ResultCard label="Final Total" value={fmtCents(discountResult.amount_total)} highlight color="green" />
              {couponConfig.category === 'cashback' && (
                <ResultCard label="Cashback Amount" value={fmtCents(discountItem?.cashback_amount)} color="blue" />
              )}
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
    unit_amount: ${Math.round(parseFloat(unitPrice) * 100)},
    unit_amount_decimal: '${unitPrice}',
    unit_amount_currency: 'EUR',
    pricing_model: ${PricingModel.perUnit},
    is_tax_inclusive: ${isTaxInclusive},
    type: 'one_time',
    tax: [{ rate: ${taxRate}, type: 'VAT' }],
  },
  // Attach coupons to the price item
  _coupons: [
    {
      type: '${couponConfig.type}',
      category: '${couponConfig.category}',${
        couponConfig.type === 'percentage'
          ? `
      percentage_value: '${couponConfig.value}',`
          : `
      fixed_value: ${Math.round(parseFloat(couponConfig.value) * 100)},
      fixed_value_decimal: '${couponConfig.value}',
      fixed_value_currency: 'EUR',`
      }
    },
  ],
};

const result = computeAggregatedAndPriceTotals([priceItem]);
// result.amount_total = ${fmtCents(discountResult.amount_total)}
// savings = ${fmtCents(savings)}`}
        />
      </div>
    </div>
  );
}
