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
  TaxItem,
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
  PriceTierDisplayMode,
  CashbackAmount,
  RedeemedPromo,
  Order,
  TierDetails,
  CompositePriceItem,
} from '@epilot/sdk/pricing';
export type { Currency, Dinero } from 'dinero.js';
import type { PriceTier } from '@epilot/sdk/pricing';
import type { i18n } from 'i18next';
export type I18n = Pick<i18n, 't' | 'language'>;

/**
 * Legacy type formerly exported by @epilot/pricing-client. The gross fields
 * were removed from the OpenAPI specification, so it lives here now.
 */
export interface PriceTierEnhanced extends PriceTier {
  unit_amount_gross?: number;
  unit_amount_gross_decimal?: string;
  flat_fee_amount_gross?: number;
  flat_fee_amount_gross_decimal?: string;
}
