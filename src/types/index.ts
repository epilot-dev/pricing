export type {
  Price,
  PriceItem,
  PriceItemDto,
  Product,
  Coupon,
  PricingDetails,
  PriceItems,
  PriceItemsDto,
  Tax,
  TaxAmountDto,
  TaxAmount,
  CompositePriceItemDto,
  EntityItem,
  CompositePrice,
  TaxAmountBreakdown,
  RecurrenceAmount,
  RecurrenceAmountWithTax,
  BillingPeriod,
  PriceInputMappings,
  PriceInputMapping,
  ExternalFeeMappings,
  ExternalFeeMapping,
  PriceTier,
  PriceTierEnhanced,
  PriceTierDisplayMode,
  PriceGetAg,
  PriceDynamicTariff,
  CashbackAmount,
  RedeemedPromo,
} from '@epilot/pricing-client';
import type { BillingPeriod, CompositePriceItem as BaseCompositePriceItem } from '@epilot/pricing-client';

export type TimeFrequency = Exclude<BillingPeriod, 'one_time'>;

// TODO: Remove this once the pricing-client is updated
export type CashbackTotals = Record<string, { cashback_amount: number; cashback_amount_decimal: string }>;
export type CompositePriceItem = BaseCompositePriceItem & {
  cashback_totals?: CashbackTotals;
};
