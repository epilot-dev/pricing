import type { CompositePrice, CompositePriceItem, Price, PriceItem } from '../shared/types';
import { MarkupPricingModel, PricingModel, TypeGetAg } from './constants';

const isTieredPrice = (price: Price): boolean => {
  return (
    price.pricing_model === PricingModel.tieredVolume ||
    price.pricing_model === PricingModel.tieredGraduated ||
    price.pricing_model === PricingModel.tieredFlatFee
  );
};

export const isVariablePrice = (price: Price | CompositePrice): boolean => {
  if (price.is_composite_price || Array.isArray(price.price_components)) return false;

  const p = price as Price;
  const { pricing_model, get_ag, variable_price } = p;

  if (isTieredPrice(p) || pricing_model === PricingModel.dynamicTariff) return true;

  if (pricing_model === PricingModel.externalGetAG) {
    return (
      get_ag?.type === TypeGetAg.workPrice ||
      (get_ag?.type === TypeGetAg.basePrice && get_ag?.markup_pricing_model === MarkupPricingModel.tieredFlatFee)
    );
  }

  // We treat undefined or null pricing_model as perUnit
  if (pricing_model === PricingModel.perUnit || !pricing_model) {
    return Boolean(variable_price);
  }

  return false;
};

export const isVariablePriceItem = (priceItem: PriceItem | CompositePriceItem): boolean => {
  if (!priceItem._price) return false;

  return isVariablePrice(priceItem._price);
};
