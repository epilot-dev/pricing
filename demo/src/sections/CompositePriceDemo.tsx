import { useState, useMemo } from 'react';
import { computeAggregatedAndPriceTotals } from '@epilot/pricing';
import { ResultCard } from '../components/ResultCard';
import { fmtCents, makeTax } from '../helpers';

interface Component {
  name: string;
  unitAmountDecimal: string;
  quantity: number;
  type: 'one_time' | 'recurring';
  billingPeriod?: string;
}

const defaultComponents: Component[] = [
  { name: 'Installation Fee', unitAmountDecimal: '299.00', quantity: 1, type: 'one_time' },
  { name: 'Monthly Service', unitAmountDecimal: '49.99', quantity: 1, type: 'recurring', billingPeriod: 'monthly' },
  { name: 'Hardware Lease', unitAmountDecimal: '19.99', quantity: 2, type: 'recurring', billingPeriod: 'monthly' },
];

export function CompositePriceDemo() {
  const [components, setComponents] = useState<Component[]>(defaultComponents);
  const [parentQty, setParentQty] = useState(1);
  const [taxRate, setTaxRate] = useState(19);

  const result = useMemo(() => {
    const tax = makeTax(taxRate);

    // Build a composite price item
    const compositeItem: any = {
      quantity: parentQty,
      product_id: 'composite-product',
      price_id: 'composite-price',
      is_tax_inclusive: true,
      pricing_model: 'per_unit',
      taxes: [{ tax }],
      _price: {
        _id: 'composite-price',
        is_composite_price: true,
        pricing_model: 'per_unit',
        is_tax_inclusive: true,
        unit_amount: 0,
        unit_amount_decimal: '0',
        unit_amount_currency: 'EUR',
        tax: [tax],
        price_components: components.map((comp, i) => ({
          _id: `comp-${i}`,
          unit_amount: Math.round(parseFloat(comp.unitAmountDecimal) * 100),
          unit_amount_decimal: comp.unitAmountDecimal,
          unit_amount_currency: 'EUR',
          pricing_model: 'per_unit',
          is_tax_inclusive: true,
          type: comp.type,
          billing_period: comp.billingPeriod,
          tax: [tax],
          description: comp.name,
          _title: comp.name,
        })),
      },
      _product: { name: 'Bundle Package', type: 'product' },
      price_components: components.map((comp, i) => ({
        _id: `comp-${i}`,
        quantity: comp.quantity,
        unit_amount: Math.round(parseFloat(comp.unitAmountDecimal) * 100),
        unit_amount_decimal: comp.unitAmountDecimal,
        unit_amount_currency: 'EUR',
        pricing_model: 'per_unit',
        is_tax_inclusive: true,
        type: comp.type,
        billing_period: comp.billingPeriod,
        tax: [tax],
        description: comp.name,
        _title: comp.name,
        taxes: [{ tax }],
        _price: {
          _id: `comp-price-${i}`,
          unit_amount: Math.round(parseFloat(comp.unitAmountDecimal) * 100),
          unit_amount_decimal: comp.unitAmountDecimal,
          unit_amount_currency: 'EUR',
          pricing_model: 'per_unit',
          is_tax_inclusive: true,
          type: comp.type,
          billing_period: comp.billingPeriod,
          tax: [tax],
          description: comp.name,
          _title: comp.name,
        },
      })),
    };

    return computeAggregatedAndPriceTotals([compositeItem]);
  }, [components, parentQty, taxRate]);

  const updateComponent = (idx: number, field: keyof Component, value: any) => {
    setComponents((prev) => prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c)));
  };

  const addComponent = () => {
    setComponents((prev) => [
      ...prev,
      { name: `Component ${prev.length + 1}`, unitAmountDecimal: '10.00', quantity: 1, type: 'one_time' },
    ]);
  };

  const removeComponent = (idx: number) => {
    if (components.length > 1) setComponents((prev) => prev.filter((_, i) => i !== idx));
  };

  const oneTimeItems = result.items?.filter((item: any) => item._price?.type === 'one_time' || !item._price?.billing_period) ?? [];
  const recurringItems = result.items?.filter((item: any) => item._price?.type === 'recurring') ?? [];

  return (
    <div>
      <h1 className="section-title">Composite Pricing</h1>
      <p className="section-desc">
        Bundle multiple price components into a single product. Each component can have its own pricing model,
        recurrence, and quantity. Component quantities multiply with the parent quantity.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Price Components</h3>
              <button onClick={addComponent} className="btn-primary text-xs">+ Add</button>
            </div>
            <div className="space-y-3">
              {components.map((comp, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <input
                      value={comp.name}
                      onChange={(e) => updateComponent(idx, 'name', e.target.value)}
                      className="text-sm font-medium bg-transparent border-none outline-none text-gray-700 flex-1"
                    />
                    <button
                      onClick={() => removeComponent(idx)}
                      className="text-gray-400 hover:text-red-500 text-xs ml-2"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-500">Price</label>
                      <input
                        type="number"
                        step="0.01"
                        value={comp.unitAmountDecimal}
                        onChange={(e) => updateComponent(idx, 'unitAmountDecimal', e.target.value)}
                        className="input-field text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500">Qty</label>
                      <input
                        type="number"
                        min="1"
                        value={comp.quantity}
                        onChange={(e) => updateComponent(idx, 'quantity', Number(e.target.value))}
                        className="input-field text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500">Type</label>
                      <select
                        value={comp.type}
                        onChange={(e) => updateComponent(idx, 'type', e.target.value)}
                        className="select-field text-xs"
                      >
                        <option value="one_time">One-time</option>
                        <option value="recurring">Recurring</option>
                      </select>
                    </div>
                    {comp.type === 'recurring' && (
                      <div>
                        <label className="text-[10px] text-gray-500">Period</label>
                        <select
                          value={comp.billingPeriod || 'monthly'}
                          onChange={(e) => updateComponent(idx, 'billingPeriod', e.target.value)}
                          className="select-field text-xs"
                        >
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="every_quarter">Quarterly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Parent Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={parentQty}
                  onChange={(e) => setParentQty(Number(e.target.value))}
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Tax Rate</label>
                <select
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="select-field mt-1"
                >
                  <option value={0}>0%</option>
                  <option value={7}>7%</option>
                  <option value={19}>19%</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Component visual */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Bundle Breakdown</h3>
            <div className="space-y-2">
              {components.map((comp, idx) => {
                const price = parseFloat(comp.unitAmountDecimal) * comp.quantity * parentQty;
                return (
                  <div key={idx} className="flex items-center gap-3 p-2 rounded bg-gray-50">
                    <div
                      className={`w-2 h-8 rounded-full ${
                        comp.type === 'one_time' ? 'bg-blue-400' : 'bg-green-400'
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">{comp.name}</p>
                      <p className="text-xs text-gray-400">
                        €{comp.unitAmountDecimal} x {comp.quantity}
                        {parentQty > 1 ? ` x ${parentQty}` : ''}
                        {comp.type === 'recurring' && ` / ${comp.billingPeriod}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">€{price.toFixed(2)}</p>
                      <span className={`text-[10px] ${comp.type === 'one_time' ? 'text-blue-500' : 'text-green-500'}`}>
                        {comp.type === 'one_time' ? 'One-time' : comp.billingPeriod}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Totals */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Computed Totals</h3>
            <div className="grid grid-cols-2 gap-3">
              <ResultCard label="Subtotal (Net)" value={fmtCents(result.amount_subtotal)} />
              <ResultCard label="Tax" value={fmtCents(result.amount_tax)} color="amber" />
              <ResultCard label="Total" value={fmtCents(result.amount_total)} highlight color="green" />
              <ResultCard label="Total Items" value={result.items?.length ?? 0} />
            </div>

            {/* Recurrence breakdown */}
            {(result.total_details?.breakdown?.recurrences?.length ?? 0) > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">By Recurrence:</p>
                {result.total_details?.breakdown?.recurrences?.map((r: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-100 text-sm">
                    <span className={r.type === 'one_time' ? 'badge-blue' : 'badge-green'}>
                      {r.type === 'one_time' ? 'One-time' : r.billing_period}
                    </span>
                    <span className="font-medium">{fmtCents(r.amount_total)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
