export type { i18n as I18n, TFunction } from 'i18next';
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
  CompositePriceItem,
  EntityItem,
  TaxAmountBreakdown,
  RecurrenceAmount,
  RecurrenceAmountWithTax,
  BillingPeriod,
  PriceInputMappings,
  PriceInputMapping,
  ExternalFeeMapping,
  PriceTier,
  PriceTierEnhanced,
  PriceTierDisplayMode,
  PriceGetAg,
  PriceDynamicTariff,
  CashbackAmount,
  RedeemedPromo,
  Order,
  TierDetails,
} from '@epilot/pricing-client';
export type { Currency, Dinero } from 'dinero.js';

import type { Price } from '@epilot/pricing-client';

export type PriceUnit = NonNullable<Price['unit']>;

/* Types coming from OpenAPI spec include an [k: string]: any key, which makes type narrowing harder */
export type RemoveIndexSignature<T> = {
  [Property in keyof T as string extends Property ? never : number extends Property ? never : Property]: T[Property];
};
