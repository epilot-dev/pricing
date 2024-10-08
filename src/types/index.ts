import type { Components } from '@epilot/pricing-client';

export type Price = Components.Schemas.Price;
export type PriceItem = Components.Schemas.PriceItem;
export type PriceItemDto = Components.Schemas.PriceItemDto;
export type Product = Components.Schemas.Product;
export type Coupon = Components.Schemas.Coupon;
export type PricingDetails = Components.Schemas.PricingDetails;
export type PriceItems = Components.Schemas.PriceItems;
export type PriceItemsDto = Components.Schemas.PriceItemsDto;
export type Tax = Components.Schemas.Tax;
export type TaxAmountDto = Components.Schemas.TaxAmountDto;
export type TaxAmount = Components.Schemas.TaxAmount;
export type CompositePrice = Components.Schemas.CompositePrice;
export type CompositePriceItemDto = Components.Schemas.CompositePriceItemDto;
export type CompositePriceItem = Components.Schemas.CompositePriceItem;
export type EntityItem = Components.Schemas.EntityItem;
export type TaxAmountBreakdown = Components.Schemas.TaxAmountBreakdown;
export type RecurrenceAmount = Components.Schemas.RecurrenceAmount;
export type RecurrenceAmountWithTax = Components.Schemas.RecurrenceAmountWithTax;
export type BillingPeriod = Components.Schemas.BillingPeriod;
export type PriceInputMappings = Components.Schemas.PriceInputMappings;
export type PriceInputMapping = Components.Schemas.PriceInputMapping;
export type ExternalFeeMappings = Components.Schemas.ExternalFeeMappings;
export type ExternalFeeMapping = Components.Schemas.ExternalFeeMapping;
export type TimeFrequency = Exclude<BillingPeriod, 'one_time'>;
export type PriceTier = Components.Schemas.PriceTier;
export type PriceTierEnhanced = Components.Schemas.PriceTierEnhanced;
export type PriceTierDisplayMode = Components.Schemas.PriceTierDisplayMode;
export type PriceGetAg = Components.Schemas.PriceGetAg;
