import { Components } from '@epilot/pricing-client';
import type { Dinero } from 'dinero.js';

export type Price = Components.Schemas.Price;
export type PriceItem = Components.Schemas.PriceItem & {
  tiers?: {
    quantity: number;
    unit_amount: number;
  }[];
};
export type PriceItemDto = Components.Schemas.PriceItemDto;
export type Product = Components.Schemas.Product;
export type PricingDetails = Components.Schemas.PricingDetails;
export type PriceItems = Components.Schemas.PriceItems;
export type PriceItemsDto = Components.Schemas.PriceItemsDto;
export type Tax = Components.Schemas.Tax;
export type TaxAmountDto = Components.Schemas.TaxAmountDto;
export type TaxAmount = Components.Schemas.TaxAmount;
export type CompositePrice = Components.Schemas.CompositePrice;
export type PriceComponentRelation = Components.Schemas.PriceComponentRelation;
export type CompositePriceItemDto = Components.Schemas.CompositePriceItemDto;
export type CompositePriceItem = Components.Schemas.CompositePriceItem;
export type EntityItem = Components.Schemas.EntityItem;
export type EntityRelation = Components.Schemas.EntityRelation;
export type TaxAmountBreakdown = Components.Schemas.TaxAmountBreakdown;
export type RecurrenceAmount = Components.Schemas.RecurrenceAmount;
export type RecurrenceAmountWithTax = Components.Schemas.RecurrenceAmountWithTax;
export type BillingPeriod = Components.Schemas.BillingPeriod;
export type PriceInputMappings = Components.Schemas.PriceInputMappings;
export type PriceInputMapping = Components.Schemas.PriceInputMapping;
export type ExternalFeesMappings = Components.Schemas.ExternalFeesMappings;
export type TimeFrequency = Exclude<BillingPeriod, 'one_time'>;
export type PriceTier = Components.Schemas.PriceTier;
export type PriceTierDisplayMode = Components.Schemas.PriceTierDisplayMode;
export type NormalizeTimeFrequency = (
  timeValue: number | string,
  timeValueFrequency: TimeFrequency,
  targetTimeFrequency: TimeFrequency,
  precision?: number,
) => number;
export type NormalizeValueToFrequencyUnit = (
  timeValue: number | string,
  timeValueFrequency: TimeFrequency,
  targetTimeFrequency: TimeFrequency,
  precision?: number,
) => number | string;

export type NormalizeTimeFrequencyToDinero = (
  timeValue: number | string,
  timeValueFrequency: TimeFrequency,
  targetTimeFrequency: TimeFrequency,
  precision?: number,
) => Dinero;
