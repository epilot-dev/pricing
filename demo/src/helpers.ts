/** Format cents integer to currency string */
export function fmtCents(amount: number | undefined, currency = 'EUR'): string {
  if (amount === undefined || amount === null) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount / 100);
}

/** Format a decimal string to currency */
export function fmtDecimal(amount: string | undefined, currency = 'EUR'): string {
  if (!amount) return '-';
  const num = parseFloat(amount);
  if (isNaN(num)) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(num);
}

/** Create a minimal Tax object */
export function makeTax(rate: number, id?: string) {
  return {
    _id: id || `tax-${rate}`,
    _title: `Tax ${rate}%`,
    _org: 'demo',
    _schema: 'tax' as const,
    _tags: [],
    _created_at: new Date().toISOString(),
    _updated_at: new Date().toISOString(),
    type: 'VAT' as const,
    rate,
    active: true,
    region: 'DE',
    region_label: 'Germany',
  };
}

/** Build a PriceItemDto for computation */
export function buildPriceItemDto({
  unitAmountDecimal,
  quantity,
  currency = 'EUR',
  pricingModel = 'per_unit',
  type = 'one_time',
  billingPeriod,
  isTaxInclusive = true,
  taxRate = 19,
  tiers,
  coupons,
  description = 'Demo Price',
  dynamicTariff,
  getAg,
}: {
  unitAmountDecimal: string;
  quantity: number;
  currency?: string;
  pricingModel?: string;
  type?: 'one_time' | 'recurring';
  billingPeriod?: string;
  isTaxInclusive?: boolean;
  taxRate?: number;
  tiers?: any[];
  coupons?: any[];
  description?: string;
  dynamicTariff?: any;
  getAg?: any;
}) {
  const tax = makeTax(taxRate);
  const unitAmount = Math.round(parseFloat(unitAmountDecimal) * 100);

  const price: any = {
    _id: 'demo-price-' + Math.random().toString(36).slice(2, 8),
    unit_amount: unitAmount,
    unit_amount_currency: currency,
    unit_amount_decimal: unitAmountDecimal,
    type,
    billing_period: billingPeriod,
    tax: [tax],
    is_tax_inclusive: isTaxInclusive,
    pricing_model: pricingModel,
    description,
    _title: description,
    ...(tiers && { tiers }),
    ...(dynamicTariff && { dynamic_tariff: dynamicTariff }),
    ...(getAg && { get_ag: getAg }),
  };

  const item: any = {
    quantity,
    product_id: 'demo-product',
    price_id: price._id,
    taxes: [{ tax }],
    _price: price,
    _product: { name: 'Demo Product', type: 'product' },
    pricing_model: pricingModel,
    is_tax_inclusive: isTaxInclusive,
  };

  if (coupons && coupons.length > 0) {
    item._coupons = coupons;
  }

  return item;
}

export function makeCoupon({
  type,
  category,
  percentageValue,
  fixedValue,
  fixedValueDecimal,
  currency = 'EUR',
  name = 'Demo Coupon',
  cashbackPeriod,
}: {
  type: 'fixed' | 'percentage';
  category: 'discount' | 'cashback';
  percentageValue?: string;
  fixedValue?: number;
  fixedValueDecimal?: string;
  currency?: string;
  name?: string;
  cashbackPeriod?: number;
}) {
  return {
    _id: 'coupon-' + Math.random().toString(36).slice(2, 8),
    _title: name,
    _org: 'demo',
    _schema: 'coupon' as const,
    _tags: [],
    _created_at: new Date().toISOString(),
    _updated_at: new Date().toISOString(),
    name,
    type,
    category,
    ...(percentageValue !== undefined && { percentage_value: percentageValue }),
    ...(fixedValue !== undefined && { fixed_value: fixedValue }),
    ...(fixedValueDecimal !== undefined && { fixed_value_decimal: fixedValueDecimal }),
    fixed_value_currency: currency,
    active: true,
    ...(cashbackPeriod !== undefined && { cashback_period: cashbackPeriod }),
  };
}
