import type { Currency } from 'dinero.js';

import { DEFAULT_CURRENCY } from './currencies';
import { d, toDinero } from './formatters';
import { normalizePriceMappingInput } from './normalizers';
import type {
  CompositePrice,
  CompositePriceItem,
  CompositePriceItemDto,
  Price,
  PriceInputMapping,
  PriceInputMappings,
  PriceItem,
  PriceItemDto,
  PriceItemsDto,
  PricingDetails,
  Product,
  RecurrenceAmount,
  Tax,
  TaxAmountBreakdown,
  TaxAmountDto,
} from './types';
import {
  computePriceItemValues,
  computeTieredFlatFeePriceItemValues,
  computeTieredGraduatedPriceItemValues,
  computeTieredVolumePriceItemValues,
  isTaxInclusivePrice,
} from './utils';

/**
 * @deprecated
 * @todo Remove safely
 */
export const DEFAULT_INTEGER_AMOUNT_PRECISION = 2;
export const BillingPeriods = new Set(['weekly', 'monthly', 'every_quarter', 'every_6_months', 'yearly'] as const);

export const TaxRates = Object.freeze({
  standard: 0.19,
  reduced: 0.07,
  nontaxable: 0,
});

export enum PricingModel {
  perUnit = 'per_unit',
  tieredGraduated = 'tiered_graduated',
  tieredVolume = 'tiered_volume',
  tieredFlatFee = 'tiered_flatfee',
}

export type ComputeAggregatedAndPriceTotals = typeof computeAggregatedAndPriceTotals;

export type RelationAttributeValue = {
  $relation: { entity_id: string; _schema: string; _tags: string[] }[];
};

export interface PricingEntitiesExtractResult {
  /**
   * A relation attribute value containing all price entities from the given price items.
   */
  price: RelationAttributeValue;
  /**
   * A relation attribute value containing all product entities from the given price items.
   */
  product: RelationAttributeValue;
  /**
   * All pricing tags inferred from the products and prices of the provided price items.
   */
  _tags: string[];
}

type PriceComponent = NonNullable<CompositePriceItemDto['item_components']>[number]['_price'] & {
  _itemRef?: PriceItemDto;
  /**
   * @todo Verify whether these properties are ever set.
   */
  frequency_unit?: string;
  number_input?: number;
};

export const isCompositePrice = (priceItem: PriceItemDto | CompositePriceItemDto): priceItem is CompositePriceItemDto =>
  Boolean(priceItem?.is_composite_price || priceItem?._price?.is_composite_price);

export const computePriceComponent = (
  priceItemComponent: PriceItemDto,
  priceMappings: PriceInputMappings,
  parentQuantity: number,
): PriceItem => {
  const tax = priceItemComponent?.taxes?.[0]?.tax;
  const priceMapping = priceMappings?.find(({ price_id }) => priceItemComponent._price!._id === price_id);

  const safeQuantity = isNaN(priceItemComponent?.quantity!) ? 1 : priceItemComponent?.quantity;
  const safeParentQuantity = isNaN(parentQuantity) ? 1 : parentQuantity;
  const quantity = toDinero(String(safeQuantity)).multiply(safeParentQuantity).toUnit();

  return computePriceItem(priceItemComponent, priceItemComponent._price, tax!, quantity, priceMapping);
};

const isValidPrice = (priceComponent: Price): boolean => {
  if (
    (!priceComponent.pricing_model || priceComponent.pricing_model === PricingModel.perUnit) &&
    typeof priceComponent.unit_amount !== 'number'
  ) {
    return false;
  }

  if (
    (!priceComponent.pricing_model || priceComponent.pricing_model === PricingModel.perUnit) &&
    !priceComponent.unit_amount_decimal
  ) {
    return false;
  }

  if (
    (priceComponent.pricing_model === PricingModel.tieredFlatFee ||
      priceComponent.pricing_model === PricingModel.tieredVolume ||
      priceComponent.pricing_model === PricingModel.tieredGraduated) &&
    !priceComponent.tiers
  ) {
    return false;
  }

  return true;
};

const getPriceComponents = (priceItem: CompositePriceItemDto): PriceComponent[] => {
  if (!Array.isArray(priceItem?.item_components)) {
    return Array.isArray(priceItem?._price?.price_components)
      ? priceItem._price!.price_components.filter(isValidPrice)
      : [];
  }

  const ensureComponentWithValidPrice = (itemComponent: PriceItemDto): PriceItemDto => ({
    ...itemComponent,
    unit_amount: Number.isInteger(itemComponent.unit_amount) ? itemComponent.unit_amount : 0,
    unit_amount_decimal:
      typeof itemComponent.unit_amount_decimal !== 'undefined' ? itemComponent.unit_amount_decimal : '0.0',
  });

  return priceItem.item_components.map<PriceComponent>((itemComponent) => ({
    _itemRef: ensureComponentWithValidPrice(itemComponent),
    ...itemComponent._price!,
  }));
};

/**
 * Extracts the pricing entities from a list of price items.
 *
 * @param priceItems a list of price items
 * @returns the product and price relations from the price items grouped by their slug.
 */
export const extractPricingEntitiesBySlug = (
  priceItems: (PriceItem | CompositePriceItem)[],
): PricingEntitiesExtractResult => {
  const productRelations = [] as RelationAttributeValue['$relation'];
  const priceRelations = [] as RelationAttributeValue['$relation'];
  const priceLookup: Record<string, boolean> = {};
  const productLookup: Record<string, boolean> = {};
  const pricingTags: string[] = [];

  priceItems?.forEach((item) => {
    if (item?.product_id && !productLookup[item.product_id]) {
      productRelations.push({
        entity_id: item.product_id,
        _schema: 'product',
        _tags: [],
      });
      pricingTags.push(...(item._product?._tags || []));
      productLookup[item.product_id] = true;
    }
    if (item?.price_id && !priceLookup[item.price_id]) {
      priceRelations.push({
        entity_id: item.price_id,
        _schema: 'price',
        _tags: [],
      });
      pricingTags.push(...(item._price?._tags || []));
      priceLookup[item.price_id] = true;
    }
  });

  return {
    product: { $relation: productRelations },
    price: { $relation: priceRelations },
    _tags: [...new Set(pricingTags)],
  };
};

/**
 * Computes a composite price item from a composite price item DTO and a composite price.
 * The composite price item DTO may or may not contain price components. If it does,
 * we calculate the price components and add them to the composite price item.
 * Otherwise, the composite price item is returned as is.
 *
 * @param priceItem the composite price item DTO
 * @param compositePrice the composite price
 * @returns the composite price item
 */
export const computeCompositePrice = (
  priceItem: CompositePriceItemDto,
  compositePrice: CompositePrice,
): CompositePriceItem => {
  const priceComponents = getPriceComponents(priceItem) || [];
  const itemComponents: PriceItemDto[] = priceComponents.reduce((itemComponentsResult: PriceItemDto[], component) => {
    const componentTax = Array.isArray(component.tax) ? component.tax : [];
    const itemTaxRate: TaxAmountDto = (componentTax?.[0] && { tax: componentTax?.[0] }) || { rate: 'nontaxable' };

    const { _itemRef: existingItemComponent, ...existingPrice } = component;

    const itemComponent: PriceItemDto = {
      ...existingItemComponent,
      pricing_model: existingItemComponent?.pricing_model || component.pricing_model,
      quantity: isNaN(existingItemComponent?.quantity!) ? 1 : existingItemComponent?.quantity,
      type: existingItemComponent?.type || component.type,
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
    };

    return [...itemComponentsResult, itemComponent];
  }, []);

  const computedItemComponents = itemComponents.map((priceRelation) =>
    computePriceComponent(priceRelation, priceItem.price_mappings!, priceItem.quantity!),
  );

  const itemDescription = priceItem?.description ?? compositePrice?.description ?? null;

  return {
    ...priceItem,
    ...(priceItem?._product && { _product: mapToProductSnapshot(priceItem._product!) }),
    _price: mapToPriceSnapshot(priceItem._price! as Price),
    currency: priceItem._price!.unit_amount_currency || DEFAULT_CURRENCY,
    ...(itemDescription && { description: itemDescription }),
    item_components: [...computedItemComponents],
  };
};

/**
 * Computes all the integer amounts for the price items using the string decimal representation defined on prices unit_amount field.
 * All totals are computed with a decimal precision of DECIMAL_PRECISION.
 * After the calculations the integer amounts are scaled to a precision of 2.
 *
 * This compute function computes both line items and aggregated totals.
 */

export const computeAggregatedAndPriceTotals = (priceItems: PriceItemsDto): PricingDetails => {
  const initialPricingDetails: PricingDetails = {
    items: [],
    amount_subtotal: 0,
    amount_total: 0,
    amount_tax: 0,
    total_details: {
      amount_shipping: 0,
      amount_tax: 0,
      breakdown: {
        taxes: [],
        recurrences: [],
        recurrencesByTax: [],
      },
    },
    currency: DEFAULT_CURRENCY,
  };

  const priceDetails: PricingDetails = priceItems.reduce((details, priceItem) => {
    if (isCompositePrice(priceItem)) {
      const price = priceItem._price;
      const compositePriceItemToAppend = computeCompositePrice(priceItem, price!);
      const itemBreakdown = computeCompositePriceBreakDown(compositePriceItemToAppend);
      const updatedTotals = recomputeDetailTotalsFromCompositePrice(details, compositePriceItemToAppend);

      return {
        ...updatedTotals,
        items: [
          ...details.items!,
          {
            ...compositePriceItemToAppend,
            ...itemBreakdown,
            ...(typeof itemBreakdown?.amount_subtotal === 'number' && {
              amount_subtotal_decimal: d(itemBreakdown.amount_subtotal).toUnit().toString(),
            }),
            ...(typeof itemBreakdown?.amount_total === 'number' && {
              amount_total_decimal: d(itemBreakdown.amount_total).toUnit().toString(),
            }),
            item_components: convertPriceComponentsPrecision(compositePriceItemToAppend.item_components!, 2),
          },
        ],
      } as PricingDetails;
    } else {
      const price = priceItem._price;
      const tax = priceItem.taxes?.[0]?.tax;
      const priceMapping = priceItem.price_mappings?.find(({ price_id }) => priceItem._price!._id === price_id);

      const priceItemToAppend = computePriceItem(priceItem, price, tax!, priceItem.quantity!, priceMapping);

      const updatedTotals = isUnitAmountApproved(
        priceItem,
        priceItemToAppend?._price?.price_display_in_journeys ?? price?.price_display_in_journeys,
        null!,
      )
        ? recomputeDetailTotals(details, price!, priceItemToAppend)
        : {
            amount_subtotal: details.amount_subtotal,
            amount_total: details.amount_total,
            amount_tax: details.amount_tax,
            total_details: details.total_details,
          };

      return {
        ...updatedTotals,
        items: [...details.items!, convertPriceItemPrecision(priceItemToAppend, 2)],
      } as PricingDetails;
    }
  }, initialPricingDetails);

  priceDetails.currency = (priceDetails?.items?.[0]?.currency as Currency) || DEFAULT_CURRENCY;

  return convertPricingPrecision(priceDetails, 2);
};

/**
 * Computes the pricing details for a given PriceItem in isolation.
 * The computed price item will be the only entry from the PricingDetails items array.
 *
 * @param priceItem - the price item to compute
 * @returns the pricing details
 */
export const computePriceItemDetails = (priceItem: PriceItemDto | CompositePriceItemDto): PricingDetails => {
  return computeAggregatedAndPriceTotals([priceItem]);
};

/**
 * Computes the pricing details for a given Price in isolation.
 *
 * @param price - the price to compute
 * @returns - the pricing details
 */
export const computePriceDetails = (price: Price): PricingDetails => {
  const priceItem: PriceItem = {
    quantity: 1,
    ...(price.pricing_model && { pricing_model: price.pricing_model }),
    _price: price,
  };

  return computeAggregatedAndPriceTotals([priceItem]);
};

/**
 * Computes all the pricing total amounts to integers with a decimal precision of DECIMAL_PRECISION.
 */
const recomputeDetailTotals = (details: PricingDetails, price: Price, priceItemToAppend: PriceItem): PricingDetails => {
  const taxes = details?.total_details?.breakdown?.taxes || [];
  const itemTax =
    priceItemToAppend.taxes?.[0]?.tax ||
    ({
      rate: +priceItemToAppend.taxes?.[0]?.rateValue!,
    } as Partial<Tax>);

  /**
   * itemRateValue is only used for outdated prices, not migrated yet
   */
  const itemRateValue = priceItemToAppend.taxes?.[0]?.rateValue;
  const tax = taxes.find(
    (item) =>
      (item.tax?._id && itemTax?._id && item.tax?._id === itemTax?._id) ||
      item.tax?.rate === itemTax?.rate ||
      item.tax!.rate === itemRateValue,
  );

  const recurrences = [...details?.total_details?.breakdown?.recurrences!] || [];
  const recurrence = getPriceRecurrence(price, recurrences);

  const recurrencesByTax = [...details?.total_details?.breakdown?.recurrencesByTax!] || [];
  const recurrenceByTax = getPriceRecurrenceByTax(price, recurrencesByTax, tax?.tax?.rate ?? itemTax?.rate);

  const total = d(details.amount_total!);
  const subtotal = d(details.amount_subtotal!);
  const totalTax = d(details?.total_details?.amount_tax!);

  const priceUnitAmountGross = d(priceItemToAppend.unit_amount_gross!);
  const priceSubtotal = d(priceItemToAppend.amount_subtotal!);
  const priceTotal = d(priceItemToAppend.amount_total!);
  const priceTax = d(priceItemToAppend?.taxes?.[0]?.amount || 0.0);

  if (!tax) {
    itemTax &&
      taxes.push({
        tax: {
          ...(itemTax._id && { _id: itemTax._id }),
          ...(itemTax.type && { type: itemTax.type }),
          rate: itemTax.rate,
        },
        amount: priceTax.getAmount(),
      });
  } else {
    tax.amount = d(tax.amount!).add(priceTax).getAmount();

    // Populates missing data in deprecated taxes
    if (!tax?.tax?._id && itemTax?._id) {
      tax.tax!._id = itemTax._id;
    }

    if (!tax?.tax?.type && itemTax?.type) {
      tax.tax!.type = itemTax.type;
    }
  }

  if (!recurrence) {
    const type = price?.type || priceItemToAppend?.type;

    recurrences.push({
      type: ['one_time', 'recurring'].includes(type!) ? type : 'one_time',
      ...(price?.type === 'recurring' && { billing_period: price?.billing_period }),
      unit_amount_gross: priceUnitAmountGross.getAmount(),
      amount_subtotal: priceSubtotal.getAmount(),
      amount_total: priceTotal.getAmount(),
      amount_subtotal_decimal: priceSubtotal.toUnit().toString(),
      amount_total_decimal: priceTotal.toUnit().toString(),
      amount_tax: priceTax.getAmount(),
    });
  } else {
    const unitAmountGrossAmount = d(recurrence.unit_amount_gross!);
    const subTotalAmount = d(recurrence.amount_subtotal);
    const totalAmount = d(recurrence.amount_total);
    const taxAmount = d(recurrence.amount_tax!);
    recurrence.unit_amount_gross = unitAmountGrossAmount.add(priceUnitAmountGross).getAmount();
    recurrence.amount_subtotal = subTotalAmount.add(priceSubtotal).getAmount();
    recurrence.amount_total = totalAmount.add(priceTotal).getAmount();
    recurrence.amount_subtotal_decimal = subTotalAmount.add(priceSubtotal).toUnit().toString();
    recurrence.amount_total_decimal = totalAmount.add(priceTotal).toUnit().toString();
    recurrence.amount_tax = taxAmount.add(priceTax).getAmount();
  }

  const recurrenceTax = !tax && itemTax ? taxes.at(-1) : tax;

  if (!recurrenceByTax) {
    const type = price?.type || priceItemToAppend?.type;

    recurrencesByTax.push({
      type: ['one_time', 'recurring'].includes(type!) ? type : 'one_time',
      ...(price?.type === 'recurring' && { billing_period: price?.billing_period }),
      unit_amount_gross: priceUnitAmountGross.getAmount(),
      amount_subtotal: priceSubtotal.getAmount(),
      amount_total: priceTotal.getAmount(),
      amount_subtotal_decimal: priceSubtotal.toUnit().toString(),
      amount_total_decimal: priceTotal.toUnit().toString(),
      amount_tax: priceTax.getAmount(),
      tax: recurrenceTax,
    });
  } else {
    const unitAmountGrossAmount = d(recurrenceByTax.unit_amount_gross!);
    const subTotalAmount = d(recurrenceByTax.amount_subtotal);
    const totalAmount = d(recurrenceByTax.amount_total);
    const taxAmount = d(recurrenceByTax.amount_tax!);
    recurrenceByTax.unit_amount_gross = unitAmountGrossAmount.add(priceUnitAmountGross).getAmount();
    recurrenceByTax.amount_subtotal = subTotalAmount.add(priceSubtotal).getAmount();
    recurrenceByTax.amount_total = totalAmount.add(priceTotal).getAmount();
    recurrenceByTax.amount_subtotal_decimal = subTotalAmount.add(priceSubtotal).toUnit().toString();
    recurrenceByTax.amount_total_decimal = totalAmount.add(priceTotal).toUnit().toString();
    recurrenceByTax.amount_tax = taxAmount.add(priceTax).getAmount();
  }

  return {
    amount_subtotal: subtotal.add(priceSubtotal).getAmount(),
    amount_total: total.add(priceTotal).getAmount(),
    amount_tax: totalTax.add(priceTax).getAmount(),
    total_details: {
      amount_tax: totalTax.add(priceTax).getAmount(),
      breakdown: {
        taxes,
        recurrences,
        recurrencesByTax,
      },
    },
  };
};

const computeCompositePriceBreakDown = (compositePriceItem: CompositePriceItem): PricingDetails | undefined =>
  recomputeDetailTotalsFromCompositePrice(undefined, compositePriceItem);

const recomputeDetailTotalsFromCompositePrice = (
  details: PricingDetails | undefined,
  compositePriceItem: CompositePriceItem,
): PricingDetails | undefined => {
  const initialPricingDetails: PricingDetails = {
    items: [],
    amount_subtotal: 0,
    amount_total: 0,
    total_details: {
      amount_shipping: 0,
      amount_tax: 0,
      breakdown: {
        taxes: [],
        recurrences: [],
      },
    },
  };

  return compositePriceItem?.item_components?.reduce((detailTotals, itemComponent: Price) => {
    const updatedTotals = isUnitAmountApproved(
      itemComponent,
      itemComponent._price?.price_display_in_journeys,
      compositePriceItem,
    )
      ? recomputeDetailTotals(detailTotals, itemComponent._price, itemComponent)
      : {
          amount_subtotal: details?.amount_subtotal || 0,
          amount_total: details?.amount_total || 0,
          amount_tax: details?.amount_tax || 0,
          total_details: details?.total_details || initialPricingDetails.total_details,
        };

    return {
      ...(detailTotals.items?.length && { items: [...detailTotals.items] }),
      ...updatedTotals,
    };
  }, details || initialPricingDetails);
};

export const ENTITY_FIELDS_EXCLUSION_LIST: Set<keyof Price> = new Set([
  '_org',
  '_schema',
  '_created_at',
  '_updated_at',
  '_owners',
  '_acl',
  '_acl_sync',
  '_viewers',
  '_relations',
  '$relation',
  'file',
  '_files',
  'workflows',
  '_slug',
]);

/**
 * Converts a Price entity into a PriceDTO without all fields present on the entity fields exclusion list.
 */
export const mapToPriceSnapshot = (price: Price): Price => {
  /**
   *? @todo We should define _price as not being an optional key in PriceItemDto since there is no case where is optional
   */

  const mappedPricing: Price = {} as Price;

  for (const key in price) {
    const currValue = price[key];

    if (!ENTITY_FIELDS_EXCLUSION_LIST.has(key)) {
      mappedPricing[key] = currValue;
    }

    // Checks if price has price_components and if so iterates over them to extract whitelisted keys
    if (key === 'price_components' && currValue && Array.isArray(currValue)) {
      mappedPricing[key] = currValue.map((el: Price) => mapToPriceSnapshot(el));
    }
  }

  return mappedPricing;
};

/**
 * Converts a Product entity into a ProductDTO without all fields present on the entity fields exclusion list.
 */
export const mapToProductSnapshot = (product?: Product): Product | undefined => {
  if (!product) return undefined;

  const mappedProduct = {} as NonNullable<Product>;

  for (const key in product) {
    const currValue = product[key];

    if (!ENTITY_FIELDS_EXCLUSION_LIST.has(key)) {
      mappedProduct[key] = currValue;
    }
  }

  return mappedProduct;
};

/**
 * Computes all price item total amounts to integers with a decimal precision of DECIMAL_PRECISION.
 */
export const computePriceItem = (
  priceItem: PriceItemDto,
  price: Price | undefined,
  applicableTax: Tax,
  quantity: number,
  priceMapping?: PriceInputMapping,
): PriceItem => {
  const currency = (price?.unit_amount_currency || DEFAULT_CURRENCY).toUpperCase() as Currency;
  const priceItemDescription = priceItem?.description ?? price?.description;

  const unitAmountDecimal = priceItem?.unit_amount_decimal || price?.unit_amount_decimal || '0.0';
  const priceTax = getPriceTax(applicableTax, price!, priceItem?.taxes);
  const isTaxInclusive = isTaxInclusivePrice(price!);

  const { safeQuantity, quantityToSelectTier, unitAmountMultiplier, isUsingPriceMappingToSelectTier } =
    computeQuantities(price!, quantity, priceMapping);

  const itemValues =
    price?.pricing_model === PricingModel.tieredVolume
      ? computeTieredVolumePriceItemValues(
          price.tiers!,
          currency,
          isTaxInclusive,
          quantityToSelectTier,
          priceTax,
          unitAmountMultiplier!,
          priceItem._price?.unchanged_price_display_in_journeys,
        )
      : price?.pricing_model === PricingModel.tieredFlatFee
      ? computeTieredFlatFeePriceItemValues(
          price.tiers!,
          currency,
          isTaxInclusive,
          quantityToSelectTier,
          priceTax!,
          safeQuantity!,
          isUsingPriceMappingToSelectTier,
          priceItem._price?.unchanged_price_display_in_journeys,
        )
      : price?.pricing_model === PricingModel.tieredGraduated
      ? computeTieredGraduatedPriceItemValues(
          price.tiers!,
          currency,
          isTaxInclusive,
          quantityToSelectTier,
          priceTax!,
          safeQuantity!,
          isUsingPriceMappingToSelectTier,
          priceItem._price?.unchanged_price_display_in_journeys,
        )
      : computePriceItemValues(unitAmountDecimal, currency, isTaxInclusive, unitAmountMultiplier!, priceTax!);

  return {
    ...priceItem,
    currency,
    ...(priceItemDescription && { description: priceItemDescription }),
    ...(Number.isInteger(itemValues.unitAmount) && { unit_amount: itemValues.unitAmount }),
    ...(Number.isInteger(itemValues.unitAmountNet) && { unit_amount_net: itemValues.unitAmountNet }),
    ...(price?.pricing_model === PricingModel.perUnit &&
      unitAmountDecimal && { unit_amount_decimal: unitAmountDecimal }),
    unit_amount_gross: itemValues.unitAmountGross,
    amount_subtotal: itemValues.amountSubtotal,
    amount_total: itemValues.amountTotal,
    amount_tax: itemValues.taxAmount,
    taxes: [
      {
        ...(priceTax ? { tax: priceTax } : { rate: 'nontaxable', rateValue: 0 }),
        amount: itemValues.taxAmount,
      },
    ],
    ...(priceItem?._product && { _product: mapToProductSnapshot(priceItem._product) }),
    _price: {
      ...mapToPriceSnapshot(price!),
      ...(itemValues.displayMode && {
        price_display_in_journeys: itemValues.displayMode ?? price?.price_display_in_journeys,
        unchanged_price_display_in_journeys:
          priceItem._price?.unchanged_price_display_in_journeys ?? price?.price_display_in_journeys,
      }),
    },
  };
};

const convertPriceComponentsPrecision = (items: PriceItem[], precision = 2): PriceItem[] =>
  items.map((component) => convertPriceItemPrecision(component, precision));

/**
 * Converts all integer amounts from a precision of DECIMAL_PRECISION to a given precision.
 * e.g: 10.00 with precision DECIMAL_PRECISION, represented as 10(+12 zeros) with precision 2
 * would be 1000(only 2 zeros on the decimal component).
 */
const convertPriceItemPrecision = (priceItem: PriceItem, precision = 2): PriceItem => ({
  ...priceItem,
  ...(typeof priceItem.unit_amount === 'number' && {
    unit_amount: d(priceItem.unit_amount).convertPrecision(precision).getAmount(),
  }),
  ...(typeof priceItem.unit_amount_net === 'number' && {
    unit_amount_net: d(priceItem.unit_amount_net).convertPrecision(precision).getAmount(),
  }),
  unit_amount_gross: d(priceItem.unit_amount_gross!).convertPrecision(precision).getAmount(),
  amount_subtotal: d(priceItem.amount_subtotal!).convertPrecision(precision).getAmount(),
  amount_subtotal_decimal: d(priceItem.amount_subtotal!).toUnit().toString(),
  amount_total: d(priceItem.amount_total!).convertPrecision(precision).getAmount(),
  amount_total_decimal: d(priceItem.amount_total!).toUnit().toString(),
  amount_tax: d(priceItem.amount_tax!).convertPrecision(precision).getAmount(),
  taxes: priceItem.taxes!.map((tax) => ({
    ...tax,
    amount: d(tax.amount!).convertPrecision(precision).getAmount(),
  })),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isPricingDetails = (details: any): details is PricingDetails => details.amount_tax !== undefined;

const convertBreakDownPrecision = (details: PricingDetails | CompositePriceItem, precision: number): PricingDetails => {
  return {
    amount_subtotal: d(details.amount_subtotal!).convertPrecision(precision).getAmount(),
    amount_total: d(details.amount_total!).convertPrecision(precision).getAmount(),
    ...(isPricingDetails(details) && { amount_tax: d(details.amount_tax!).convertPrecision(precision).getAmount() }),
    total_details: {
      ...details?.total_details,
      amount_tax: d(details?.total_details?.amount_tax!).convertPrecision(precision).getAmount(),
      breakdown: {
        ...details?.total_details?.breakdown,
        taxes: details?.total_details?.breakdown?.taxes!.map((tax) => ({
          ...tax,
          amount: d(tax.amount!).convertPrecision(precision).getAmount(),
        })),
        recurrences: details?.total_details?.breakdown?.recurrences!.map((recurrence) => {
          return {
            ...recurrence,
            unit_amount_gross: d(recurrence.unit_amount_gross!).convertPrecision(precision).getAmount(),
            amount_subtotal: d(recurrence.amount_subtotal).convertPrecision(precision).getAmount(),
            amount_total: d(recurrence.amount_total).convertPrecision(precision).getAmount(),
            amount_tax: d(recurrence.amount_tax!).convertPrecision(precision).getAmount(),
          };
        }),
      },
    },
  };
};

/**
 * Converts all integer amounts from a precision of DECIMAL_PRECISION to a given precision.
 * e.g: 10.00 with precision DECIMAL_PRECISION, represented as 10(+12 zeros) with precision 2
 * would be 1000(only 2 zeros on the decimal component).
 */
const convertPricingPrecision = (details: PricingDetails, precision: number): PricingDetails => ({
  ...details,
  items: details.items!.map((item) => {
    if ((item as CompositePriceItem).total_details) {
      return {
        ...item,
        ...convertBreakDownPrecision(item, precision),
      };
    }

    return item;
  }),
  ...convertBreakDownPrecision(details, precision),
});

/**
 * Gets a price tax with the proper tax behavior override
 */
export const getPriceTax = (
  applicableTax: Tax | undefined,
  price?: Price,
  priceItemTaxes?: TaxAmountDto[],
): Tax | undefined => {
  if (applicableTax) {
    return applicableTax;
  }

  if (Array.isArray(priceItemTaxes) && priceItemTaxes.length > 0) {
    return priceItemTaxes[0].tax;
  }

  const isNonTaxable = applicableTax === null;
  const existingPriceTax = Array.isArray(price?.tax) && price?.tax?.[0];

  if (!isNonTaxable && existingPriceTax) {
    return existingPriceTax;
  }

  return applicableTax;
};

const getPriceRecurrence = (price: Price, recurrences: RecurrenceAmount[]) => {
  if (price?.type === 'recurring') {
    return recurrences.find(
      (recurrenceItem) => recurrenceItem.type === price.type && recurrenceItem.billing_period === price.billing_period,
    );
  }

  return recurrences.find((recurrenceItem) => recurrenceItem.type === 'one_time');
};

// TODO: update on lib
const getPriceRecurrenceByTax = (
  price: Price,
  recurrencesByTax: (RecurrenceAmount & { tax?: TaxAmountBreakdown })[],
  taxRate?: number,
) => {
  if (price?.type === 'recurring') {
    return recurrencesByTax.find(
      (recurrenceItem) =>
        recurrenceItem.type === price.type &&
        recurrenceItem.billing_period === price.billing_period &&
        (!taxRate || recurrenceItem.tax?.tax?.rate === taxRate),
    );
  }

  return recurrencesByTax.find(
    (recurrenceItem) => recurrenceItem.type === 'one_time' && (!taxRate || recurrenceItem.tax?.tax?.rate === taxRate),
  );
};

const isUnitAmountApproved = (
  priceItem: PriceItem,
  priceDisplayInJourneys?: Price['price_display_in_journeys'],
  parentPriceItem?: CompositePriceItem,
) => {
  if (parentPriceItem) {
    const parentHasHiddenPriceComponents = parentPriceItem.item_components!.some(
      (component) => component._price?.price_display_in_journeys === 'show_as_on_request',
    );
    const parentPriceIsHiddenPrice = parentPriceItem._price?.price_display_in_journeys === 'show_as_on_request';

    if (parentHasHiddenPriceComponents || parentPriceIsHiddenPrice) {
      return parentPriceItem?.on_request_approved;
    }

    return true;
  }

  return priceDisplayInJourneys !== 'show_as_on_request' || priceItem?.on_request_approved;
};

export const computeQuantities = (price: Price, quantity?: number, priceMapping?: PriceInputMapping) => {
  const safeQuantity = isNaN(quantity!) ? 1 : quantity;
  const normalizedPriceMappingInput = normalizePriceMappingInput(priceMapping!, price);
  const quantityToSelectTier = normalizedPriceMappingInput ? normalizedPriceMappingInput.toUnit() : 1;
  const unitAmountMultiplier = normalizedPriceMappingInput
    ? normalizedPriceMappingInput.multiply(safeQuantity!).toUnit()
    : safeQuantity;

  return {
    safeQuantity,
    quantityToSelectTier,
    unitAmountMultiplier,
    isUsingPriceMappingToSelectTier: Boolean(normalizedPriceMappingInput),
  };
};
