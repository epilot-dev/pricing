import type {
  CompositePriceItemDto,
  PriceItemDto,
  RedeemedPromo,
  PriceItem,
  Price,
  CompositePriceItem,
  TaxAmountDto,
} from '@epilot/pricing-client';
import { DEFAULT_CURRENCY } from '../money/constants';
import { toDinero } from '../money/to-dinero';
import { PricingModel } from '../prices/constants';
import { getPriceTax } from '../prices/get-price-tax';
import { mapToPriceSnapshot, mapToProductSnapshot } from '../prices/map-to-snapshots';
import { getSafeQuantity } from '../shared/get-safe-quantity';
import { computePriceItem } from './compute-price-item';

type PriceComponent = NonNullable<CompositePriceItemDto['item_components']>[number]['_price'] & {
  _itemRef?: PriceItemDto;
  /**
   * @todo Verify whether these properties are ever set.
   */
  frequency_unit?: string;
  number_input?: number;
};

type ComputePriceComponentOptions = {
  redeemedPromos?: Array<RedeemedPromo>;
};

const computePriceComponent = (
  priceItemComponent: PriceItemDto,
  priceItem: CompositePriceItemDto,
  { redeemedPromos = [] }: ComputePriceComponentOptions = {},
): PriceItem => {
  const tax = priceItemComponent.taxes?.[0]?.tax;
  const priceMapping = priceItem.price_mappings?.find(
    ({ price_id }) => priceItemComponent.price_id === price_id || priceItemComponent._price!._id === price_id,
  );

  const externalFeeMapping = priceItem.external_fees_mappings?.find(
    ({ price_id }) => priceItemComponent._price!._id === price_id,
  );

  const safeQuantity = getSafeQuantity(priceItemComponent.quantity);
  const safeParentQuantity = getSafeQuantity(priceItem.quantity);
  /**
   * @todo Consider using plain number multiplication instead of dinero,
   * as there's no tangible benefit of doing so here.
   */
  const quantity = toDinero(String(safeQuantity)).multiply(safeParentQuantity).toUnit();

  return computePriceItem(priceItemComponent, {
    tax,
    quantity,
    priceMapping,
    externalFeeMapping,
    redeemedPromos,
  });
};

const isValidPrice = (priceComponent: Price): boolean => {
  switch (priceComponent.pricing_model || PricingModel.perUnit) {
    case PricingModel.perUnit:
      return Boolean(typeof priceComponent.unit_amount === 'number' && priceComponent.unit_amount_decimal);
    case PricingModel.tieredFlatFee:
    case PricingModel.tieredVolume:
    case PricingModel.tieredGraduated:
      return Boolean(priceComponent.tiers);
    default:
      return true;
  }
};

const ensureComponentWithValidPrice = (itemComponent: PriceItemDto): PriceItemDto => ({
  ...itemComponent,
  unit_amount: Number.isInteger(itemComponent.unit_amount) ? itemComponent.unit_amount : 0,
  unit_amount_decimal:
    typeof itemComponent.unit_amount_decimal !== 'undefined' ? itemComponent.unit_amount_decimal : '0',
});

const getPriceComponents = (priceItem: CompositePriceItemDto): PriceComponent[] => {
  if (!Array.isArray(priceItem.item_components)) {
    return Array.isArray(priceItem._price?.price_components)
      ? priceItem._price!.price_components.filter(isValidPrice)
      : [];
  }

  return priceItem.item_components.map<PriceComponent>((itemComponent) => ({
    _itemRef: ensureComponentWithValidPrice(itemComponent),
    ...itemComponent._price!,
  }));
};

/**
 * Computes a composite price item from a composite price item DTO and a composite price.
 * The composite price item DTO may or may not contain price components. If it does,
 * we calculate the price components and add them to the composite price item.
 * Otherwise, the composite price item is returned as is.
 *
 * @param priceItem the composite price item DTO
 * @returns the composite price item
 */
export const computeCompositePrice = (
  priceItem: CompositePriceItemDto,
  options: ComputePriceComponentOptions = {},
): CompositePriceItem => {
  const priceComponents = getPriceComponents(priceItem);
  const computedItemComponents = priceComponents.map((component) => {
    const componentTax = Array.isArray(component.tax) ? component.tax : [];
    const itemTaxRate: TaxAmountDto = (componentTax[0] && { tax: componentTax[0] }) || { rate: 'nontaxable' };

    const { _itemRef: existingItemComponent, ...existingPrice } = component;
    const type = existingItemComponent?.type || component.type;

    const itemComponent: PriceItemDto = {
      ...existingItemComponent,
      pricing_model: existingItemComponent?.pricing_model || component.pricing_model,
      quantity: getSafeQuantity(existingItemComponent?.quantity),
      type,
      ...(type === 'recurring' && {
        billing_period: existingItemComponent?.billing_period || component.billing_period,
      }),
      price_id: existingItemComponent?.price_id || component._id,
      product_id: existingItemComponent?.product_id || priceItem.product_id,
      _price: mapToPriceSnapshot(existingItemComponent?._price || existingPrice),
      _product: mapToProductSnapshot(existingItemComponent?._product || priceItem._product),
      taxes: existingItemComponent?.taxes || [
        {
          ...itemTaxRate,
          ...(itemTaxRate.tax && { tax: getPriceTax(itemTaxRate.tax, component) }),
        },
      ],
      ...(component._coupons && { _coupons: component._coupons }),
    };

    return computePriceComponent(itemComponent, priceItem, options);
  });

  const itemDescription = priceItem.description ?? priceItem._price?.description;

  return {
    ...priceItem,
    ...(priceItem._product && { _product: mapToProductSnapshot(priceItem._product) }),
    _price: mapToPriceSnapshot(priceItem._price),
    currency: priceItem._price?.unit_amount_currency || DEFAULT_CURRENCY,
    ...(itemDescription && { description: itemDescription }),
    item_components: computedItemComponents,
  };
};
