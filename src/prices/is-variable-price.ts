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
  if (price.is_composite_price) {
    return false;
  }

  const p = price as Price;

  if (isTieredPrice(p)) return true;
  if (p.pricing_model === PricingModel.dynamicTariff) return true;
  if (p.pricing_model === PricingModel.externalGetAG) {
    if (p.get_ag?.type === TypeGetAg.workPrice) return true;
    if (p.get_ag?.type === TypeGetAg.basePrice && p.get_ag?.markup_pricing_model === MarkupPricingModel.tieredFlatFee) {
      return true;
    }
  }
  if (p.pricing_model === PricingModel.perUnit && p.variable_price) return true;

  return false;
};

export const isVariablePriceItem = (priceItem: PriceItem | CompositePriceItem): boolean => {
  if (!priceItem._price) return false;

  return isVariablePrice(priceItem._price);
};
