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
  CompositePriceItem,
} from '@epilot/pricing-client';
export type { Currency, Dinero } from 'dinero.js';
import type { i18n } from 'i18next';
export type I18n = Pick<i18n, 't' | 'language'>;
