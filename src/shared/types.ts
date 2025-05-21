export type { TFunction } from 'i18next';

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
  CompositePrice,
  CompositePriceItemDto,
  EntityItem,
  TaxAmountBreakdown,
  RecurrenceAmount,
  RecurrenceAmountWithTax,
  BillingPeriod,
  PriceInputMappings,
  PriceInputMapping,
  PriceTier,
  PriceTierEnhanced,
  PriceTierDisplayMode,
  CashbackAmount,
  RedeemedPromo,
  Order,
  TierDetails,
} from '@epilot/pricing-client';
export type { Currency, Dinero } from 'dinero.js';

// TODO: Remove this once the pricing-client is updated
import type { CompositePriceItem as BaseCompositePriceItem } from '@epilot/pricing-client';
export type CashbackTotals = Record<string, { cashback_amount: number; cashback_amount_decimal: string }>;
export type CompositePriceItem = BaseCompositePriceItem & {
  cashback_totals?: CashbackTotals;
};

import type { i18n } from 'i18next';
export type I18n = Pick<i18n, 't' | 'language'>;
