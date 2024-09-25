import type { Currency } from 'dinero.js';

import { DEFAULT_CURRENCY } from './currencies';
import { toDineroFromInteger, toDinero } from './formatters';
import { normalizePriceMappingInput, normalizeValueToFrequencyUnit } from './normalizers';
import type {
  CompositePrice,
  CompositePriceItem,
  CompositePriceItemDto,
  Coupon,
  ExternalFeeMapping,
  Price,
  PriceInputMapping,
  PriceItem,
  PriceItemDto,
  PriceItemsDto,
  PricingDetails,
  Product,
  RecurrenceAmount,
  RecurrenceAmountWithTax,
  Tax,
  TaxAmountDto,
  TimeFrequency,
} from './types';
import {
  computeExternalGetAGItemValues,
  computePriceItemValues,
  computeTieredFlatFeePriceItemValues,
  computeTieredGraduatedPriceItemValues,
  computeTieredVolumePriceItemValues,
  isTaxInclusivePrice,
  PriceItemsTotals,
} from './utils';

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
  externalGetAG = 'external_getag',
}
export enum MarkupPricingModel {
  perUnit = 'per_unit',
  tieredVolume = 'tiered_volume',
  tieredFlatFee = 'tiered_flatfee',
}
export enum TypeGetAg {
  basePrice = 'base_price',
  workPrice = 'work_price',
}

export type ComputeAggregatedAndPriceTotals = typeof computeAggregatedAndPriceTotals;

type RelationAttributeValue = {
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
  Boolean(priceItem.is_composite_price || priceItem._price?.is_composite_price);

export const computePriceComponent = (
  priceItemComponent: PriceItemDto,
  priceItem: CompositePriceItemDto,
): PriceItem => {
  const tax = priceItemComponent?.taxes?.[0]?.tax;
  const priceMapping = priceItem.price_mappings?.find(({ price_id }) => priceItemComponent._price!._id === price_id);

  const externalFeeMapping = priceItem.external_fees_mappings?.find(
    ({ price_id }) => priceItemComponent._price!._id === price_id,
  );

  const safeQuantity = isNaN(priceItemComponent?.quantity!) ? 1 : priceItemComponent?.quantity;
  const safeParentQuantity = isNaN(priceItem.quantity!) ? 1 : priceItem.quantity!;
  const quantity = toDinero(String(safeQuantity)).multiply(safeParentQuantity).toUnit();

  return computePriceItem(
    priceItemComponent,
    priceItemComponent._price,
    tax,
    quantity,
    priceMapping,
    externalFeeMapping,
  );
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

const ensureComponentWithValidPrice = (itemComponent: PriceItemDto): PriceItemDto => ({
  ...itemComponent,
  unit_amount: Number.isInteger(itemComponent.unit_amount) ? itemComponent.unit_amount : 0,
  unit_amount_decimal:
    typeof itemComponent.unit_amount_decimal !== 'undefined' ? itemComponent.unit_amount_decimal : '0.0',
});

const getPriceComponents = (priceItem: CompositePriceItemDto): PriceComponent[] => {
  if (!Array.isArray(priceItem?.item_components)) {
    return Array.isArray(priceItem?._price?.price_components)
      ? priceItem._price!.price_components.filter(isValidPrice)
      : [];
  }

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
  priceItems?: (PriceItem | CompositePriceItem)[],
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
  compositePrice?: CompositePrice,
): CompositePriceItem => {
  const priceComponents = getPriceComponents(priceItem);
  const computedItemComponents = priceComponents.map((component) => {
    const componentTax = Array.isArray(component.tax) ? component.tax : [];
    const itemTaxRate: TaxAmountDto = (componentTax?.[0] && { tax: componentTax?.[0] }) || { rate: 'nontaxable' };

    const { _itemRef: existingItemComponent, ...existingPrice } = component;
    const type = existingItemComponent?.type || component.type;

    const itemComponent: PriceItemDto = {
      ...existingItemComponent,
      pricing_model: existingItemComponent?.pricing_model || component.pricing_model,
      quantity: isNaN(existingItemComponent?.quantity!) ? 1 : existingItemComponent?.quantity,
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
    };

    return computePriceComponent(itemComponent, priceItem);
  });

  const itemDescription = priceItem?.description ?? compositePrice?.description ?? null;

  return {
    ...priceItem,
    ...(priceItem?._product && { _product: mapToProductSnapshot(priceItem._product!) }),
    _price: mapToPriceSnapshot(priceItem._price as Price | undefined),
    currency: priceItem._price!.unit_amount_currency || DEFAULT_CURRENCY,
    ...(itemDescription && { description: itemDescription }),
    /**
     * @todo It might not be necessary to spread the price components here,
     * investigate whether it's being mutated elsewhere
     */
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
  const initialPricingDetails: Omit<PricingDetails, 'items'> & {
    items: NonNullable<PricingDetails['items']>;
  } = {
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

  const priceDetails = priceItems.reduce((details, priceItem) => {
    if (
      /**
       * priceItem should never be nullish but since optional check was removed
       * from isCompositePrice we should make the check before calling it
       */
      priceItem &&
      isCompositePrice(priceItem)
    ) {
      const price = priceItem._price;
      const compositePriceItemToAppend = computeCompositePrice(priceItem, price);
      const itemBreakdown = recomputeDetailTotalsFromCompositePrice(undefined, compositePriceItemToAppend);
      const updatedTotals = recomputeDetailTotalsFromCompositePrice(details, compositePriceItemToAppend);

      return {
        ...updatedTotals,
        items: [
          ...details.items,
          {
            ...compositePriceItemToAppend,
            ...itemBreakdown,
            ...(typeof itemBreakdown?.amount_subtotal === 'number' && {
              amount_subtotal_decimal: toDineroFromInteger(itemBreakdown.amount_subtotal).toUnit().toString(),
            }),
            ...(typeof itemBreakdown?.amount_total === 'number' && {
              amount_total_decimal: toDineroFromInteger(itemBreakdown.amount_total).toUnit().toString(),
            }),
            item_components: convertPriceComponentsPrecision(compositePriceItemToAppend.item_components ?? [], 2),
          },
        ],
      };
    } else {
      const price = priceItem._price;
      const coupons = priceItem._coupons;
      const tax = priceItem.taxes?.[0]?.tax;
      const priceMapping = priceItem._price
        ? priceItem.price_mappings?.find(({ price_id }) => priceItem._price!._id === price_id)
        : undefined;

      const externalFeeMapping = priceItem.external_fees_mappings?.find(
        ({ price_id }) => priceItem._price!._id === price_id,
      );

      const priceItemToAppend = computePriceItem(
        priceItem as PriceItemDto,
        price,
        tax,
        priceItem.quantity!,
        priceMapping,
        externalFeeMapping,
        coupons,
      );

      const updatedTotals = isUnitAmountApproved(
        priceItem,
        priceItemToAppend?._price?.price_display_in_journeys ?? price?.price_display_in_journeys,
        undefined,
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
        items: [...details.items, convertPriceItemPrecision(priceItemToAppend, 2)],
      };
    }
  }, initialPricingDetails);

  priceDetails.currency = (priceDetails.items[0]?.currency as Currency) || DEFAULT_CURRENCY;

  return convertPricingPrecision(priceDetails, 2);
};

/**
 * Computes the pricing details for a given PriceItem in isolation.
 * The computed price item will be the only entry from the PricingDetails items array.
 *
 * @param priceItem - the price item to compute
 * @returns the pricing details
 */
export const computePriceItemDetails = (priceItem: PriceItemDto | CompositePriceItemDto): PricingDetails =>
  computeAggregatedAndPriceTotals([priceItem]);

/**
 * Computes all the pricing total amounts to integers with a decimal precision of DECIMAL_PRECISION.
 */
const recomputeDetailTotals = (details: PricingDetails, price: Price, priceItemToAppend: PriceItem): PricingDetails => {
  const taxes = details.total_details?.breakdown?.taxes || [];
  const firstTax = priceItemToAppend.taxes?.[0];
  const itemTax = firstTax?.tax || ({ rate: Number(firstTax?.rateValue) } as Partial<Tax>);

  /**
   * itemRateValue is only used for outdated prices, not migrated yet
   */
  const itemRateValue = priceItemToAppend.taxes?.[0]?.rateValue;
  const tax = taxes.find(
    (item) =>
      (item.tax?._id && itemTax?._id && item.tax?._id === itemTax?._id) ||
      item.tax?.rate === itemTax?.rate ||
      item.tax?.rate === itemRateValue,
  );

  const recurrences = [...(details.total_details?.breakdown?.recurrences ?? [])];
  const recurrence = getPriceRecurrence(price, recurrences);

  const recurrencesByTax = [...(details.total_details?.breakdown?.recurrencesByTax ?? [])];
  const recurrenceByTax = getPriceRecurrenceByTax(price, recurrencesByTax, tax?.tax?.rate ?? itemTax?.rate);

  const total = toDineroFromInteger(details.amount_total!);
  const subtotal = toDineroFromInteger(details.amount_subtotal!);
  const totalTax = toDineroFromInteger(details?.total_details?.amount_tax!);

  const priceUnitAmountGross = toDineroFromInteger(priceItemToAppend.unit_amount_gross!);
  const priceUnitAmountNet = Number.isInteger(priceItemToAppend.unit_amount_net)
    ? toDineroFromInteger(priceItemToAppend.unit_amount_net!)
    : null;
  const priceSubtotal = toDineroFromInteger(priceItemToAppend.amount_subtotal!);
  const priceTotal = toDineroFromInteger(priceItemToAppend.amount_total!);
  const priceDiscountAmount =
    typeof priceItemToAppend.discount_amount !== 'undefined'
      ? toDineroFromInteger(priceItemToAppend.discount_amount!)
      : undefined;
  const priceBeforeDiscountAmountTotal =
    typeof priceItemToAppend.before_discount_amount_total !== 'undefined'
      ? toDineroFromInteger(priceItemToAppend.before_discount_amount_total!)
      : undefined;
  const priceTax = toDineroFromInteger(priceItemToAppend?.taxes?.[0]?.amount || 0.0);

  if (!tax) {
    if (itemTax) {
      taxes.push({
        tax: {
          ...(itemTax._id && { _id: itemTax._id }),
          ...(itemTax.type && { type: itemTax.type }),
          rate: itemTax.rate,
        },
        amount: priceTax.getAmount(),
      });
    }
  } else {
    tax.amount = toDineroFromInteger(tax.amount!).add(priceTax).getAmount();

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
      type: type === 'recurring' ? type : 'one_time',
      ...(price?.type === 'recurring' && { billing_period: price?.billing_period }),
      unit_amount_gross: priceUnitAmountGross.getAmount(),
      unit_amount_net: priceUnitAmountNet?.getAmount() ?? undefined,
      amount_subtotal: priceSubtotal.getAmount(),
      amount_total: priceTotal.getAmount(),
      amount_subtotal_decimal: priceSubtotal.toUnit().toString(),
      amount_total_decimal: priceTotal.toUnit().toString(),
      amount_tax: priceTax.getAmount(),
      ...(priceBeforeDiscountAmountTotal && {
        before_discount_amount_total: priceBeforeDiscountAmountTotal?.getAmount(),
        before_discount_amount_total_decimal: priceBeforeDiscountAmountTotal?.toUnit().toString(),
      }),
      ...(priceDiscountAmount && {
        discount_amount: priceDiscountAmount?.getAmount(),
        discount_amount_decimal: priceDiscountAmount?.toUnit().toString(),
      }),
    });
  } else {
    const unitAmountGrossAmount = toDineroFromInteger(recurrence.unit_amount_gross!);
    const unitAmountNetAmount = recurrence.unit_amount_net
      ? toDineroFromInteger(recurrence.unit_amount_net)
      : undefined;
    const subTotalAmount = toDineroFromInteger(recurrence.amount_subtotal);
    const totalAmount = toDineroFromInteger(recurrence.amount_total);
    const taxAmount = toDineroFromInteger(recurrence.amount_tax!);
    const beforeDiscountAmountTotal =
      typeof recurrence.before_discount_amount_total !== 'undefined'
        ? toDineroFromInteger(recurrence.before_discount_amount_total)
        : undefined;
    const discountAmount =
      typeof recurrence.discount_amount !== 'undefined' ? toDineroFromInteger(recurrence.discount_amount) : undefined;
    recurrence.unit_amount_gross = unitAmountGrossAmount.add(priceUnitAmountGross).getAmount();
    recurrence.unit_amount_net = unitAmountNetAmount?.add(priceUnitAmountNet!).getAmount() ?? undefined;
    recurrence.amount_subtotal = subTotalAmount.add(priceSubtotal).getAmount();
    recurrence.amount_total = totalAmount.add(priceTotal).getAmount();
    recurrence.amount_subtotal_decimal = subTotalAmount.add(priceSubtotal).toUnit().toString();
    recurrence.amount_total_decimal = totalAmount.add(priceTotal).toUnit().toString();
    recurrence.amount_tax = taxAmount.add(priceTax).getAmount();
    if (beforeDiscountAmountTotal) {
      recurrence.before_discount_amount_total = beforeDiscountAmountTotal
        .add(priceBeforeDiscountAmountTotal!)
        .getAmount();
      recurrence.before_discount_amount_total_decimal = beforeDiscountAmountTotal
        .add(priceBeforeDiscountAmountTotal!)
        .toUnit()
        .toString();
    }
    if (discountAmount) {
      recurrence.discount_amount = discountAmount.add(priceDiscountAmount!).getAmount();
      recurrence.discount_amount_decimal = discountAmount.add(priceDiscountAmount!).toUnit().toString();
    }
  }

  const recurrenceTax = !tax && itemTax ? taxes?.[taxes?.length - 1] : tax;

  if (!recurrenceByTax) {
    const type = price?.type || priceItemToAppend?.type;

    recurrencesByTax.push({
      type: ['one_time', 'recurring'].includes(type!) ? type : 'one_time',
      ...(price?.type === 'recurring' && { billing_period: price?.billing_period }),
      amount_total: priceTotal.getAmount(),
      amount_subtotal: priceSubtotal.getAmount(),
      amount_tax: priceTax.getAmount(),
      tax: recurrenceTax ?? { amount: 0, rate: 'nontaxable', rateValue: 0, tax: { rate: 0 } },
    });
  } else {
    const totalAmount = toDineroFromInteger(recurrenceByTax.amount_total);
    const subTotalAmount = toDineroFromInteger(recurrenceByTax.amount_subtotal);
    const taxAmount = toDineroFromInteger(recurrenceByTax.amount_tax!);
    recurrenceByTax.amount_total = totalAmount.add(priceTotal).getAmount();
    recurrenceByTax.amount_subtotal = subTotalAmount.add(priceSubtotal).getAmount();
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

const recomputeDetailTotalsFromCompositePrice = (
  details: PricingDetails | undefined,
  compositePriceItem: CompositePriceItem,
): PricingDetails => {
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
        recurrencesByTax: [],
      },
    },
  };

  return (compositePriceItem.item_components ?? []).reduce((detailTotals, itemComponent) => {
    const updatedTotals = isUnitAmountApproved(
      itemComponent,
      itemComponent._price?.price_display_in_journeys,
      compositePriceItem,
    )
      ? recomputeDetailTotals(detailTotals, itemComponent._price as Price, itemComponent)
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
 * @todo Should narrow down the checks to ensure each item matches the Price type
 */
const isArrayOfPrices = (prices: unknown): prices is Price[] => Array.isArray(prices);

/**
 * Converts a Price entity into a PriceDTO without all fields present on the entity fields exclusion list.
 */
export const mapToPriceSnapshot = (price?: Price): Price =>
  price
    ? (Object.fromEntries(
        Object.entries(price)
          .filter(([key]) => !ENTITY_FIELDS_EXCLUSION_LIST.has(key))
          .map(([key, value]) => {
            if (key === 'price_components' && isArrayOfPrices(value)) {
              return [key, value.map((price) => mapToPriceSnapshot(price))];
            } else {
              return [key, value];
            }
          }),
      ) as Price)
    : ({} as Price);

/**
 * Converts a Product entity into a ProductDTO without all fields present on the entity fields exclusion list.
 */
export const mapToProductSnapshot = (product?: Product): Product | undefined =>
  product
    ? (Object.fromEntries(Object.entries(product).filter(([key]) => !ENTITY_FIELDS_EXCLUSION_LIST.has(key))) as Product)
    : undefined;

/**
 * Computes all price item total amounts to integers with a decimal precision of DECIMAL_PRECISION.
 */
export const computePriceItem = (
  priceItem: PriceItemDto,
  price: Price | undefined,
  applicableTax: Tax | undefined,
  quantity: number,
  priceMapping?: PriceInputMapping,
  externalFeeMapping?: ExternalFeeMapping,
  coupons: ReadonlyArray<Coupon> = [],
): PriceItem => {
  const currency = (price?.unit_amount_currency || DEFAULT_CURRENCY).toUpperCase() as Currency;
  const priceItemDescription = priceItem.description ?? price?.description;

  const unitAmountDecimal = priceItem.unit_amount_decimal || price?.unit_amount_decimal || '0.0';
  const priceTax = getPriceTax(applicableTax, price, priceItem.taxes);
  const isTaxInclusive =
    priceItem.is_tax_inclusive !== undefined ? priceItem.is_tax_inclusive : isTaxInclusivePrice(price);

  const { safeQuantity, quantityToSelectTier, unitAmountMultiplier, isUsingPriceMappingToSelectTier } =
    computeQuantities(price, quantity, priceMapping);

  const externalFeeAmountDecimal = computeExternalFee(
    externalFeeMapping,
    priceItem.billing_period || price?.billing_period,
  );

  let itemValues: PriceItemsTotals;

  switch (price?.pricing_model) {
    case PricingModel.tieredVolume:
      itemValues = computeTieredVolumePriceItemValues(
        price.tiers,
        currency,
        isTaxInclusive,
        quantityToSelectTier,
        priceTax,
        unitAmountMultiplier,
        priceItem._price?.unchanged_price_display_in_journeys,
      );
      break;
    case PricingModel.tieredFlatFee:
      itemValues = computeTieredFlatFeePriceItemValues(
        price.tiers,
        currency,
        isTaxInclusive,
        quantityToSelectTier,
        priceTax,
        safeQuantity,
        isUsingPriceMappingToSelectTier,
        priceItem._price?.unchanged_price_display_in_journeys,
      );
      break;
    case PricingModel.tieredGraduated:
      itemValues = computeTieredGraduatedPriceItemValues(
        price.tiers,
        currency,
        isTaxInclusive,
        quantityToSelectTier,
        priceTax,
        safeQuantity,
        isUsingPriceMappingToSelectTier,
        priceItem._price?.unchanged_price_display_in_journeys,
      );
      break;
    case PricingModel.externalGetAG:
      itemValues = computeExternalGetAGItemValues(
        price?.get_ag!,
        currency,
        isTaxInclusive,
        unitAmountMultiplier,
        quantityToSelectTier,
        externalFeeAmountDecimal,
        priceTax,
      );
      break;
    default:
      itemValues = computePriceItemValues(
        unitAmountDecimal,
        currency,
        isTaxInclusive,
        unitAmountMultiplier,
        priceTax,
        coupons,
      );
  }

  return {
    ...priceItem,
    currency,
    ...(priceItemDescription && { description: priceItemDescription }),
    ...(Number.isInteger(itemValues.unitAmount) && { unit_amount: itemValues.unitAmount }),
    ...(Number.isInteger(itemValues.beforeDiscountUnitAmount) && {
      before_discount_unit_amount: itemValues.beforeDiscountUnitAmount,
    }),
    ...(Number.isInteger(itemValues.unitDiscountAmount) && { unit_discount_amount: itemValues.unitDiscountAmount }),
    ...(itemValues.unitDiscountAmountDecimal && {
      unit_discount_amount_decimal: itemValues.unitDiscountAmountDecimal,
    }),
    ...(Number.isInteger(itemValues.unitAmountNet) && { unit_amount_net: itemValues.unitAmountNet }),
    ...(itemValues.unitAmountNetDecimal && { unit_amount_net_decimal: itemValues.unitAmountNetDecimal }),
    ...(Number.isInteger(itemValues.unitDiscountAmountNet) && {
      unit_discount_amount_net: itemValues.unitDiscountAmountNet,
    }),
    ...(itemValues.unitDiscountAmountNetDecimal && {
      unit_discount_amount_net_decimal: itemValues.unitDiscountAmountNetDecimal,
    }),
    ...(Number.isInteger(itemValues.unitAmountGross) && { unit_amount_gross: itemValues.unitAmountGross }),
    ...(itemValues.unitAmountGrossDecimal && { unit_amount_gross_decimal: itemValues.unitAmountGrossDecimal }),
    ...(price?.pricing_model === PricingModel.perUnit &&
      unitAmountDecimal && { unit_amount_decimal: unitAmountDecimal }),
    amount_subtotal: itemValues.amountSubtotal,
    amount_total: itemValues.amountTotal,
    ...(itemValues.discountAmount && { discount_amount: itemValues.discountAmount }),
    ...(itemValues.discountPercentage && { discount_percentage: itemValues.discountPercentage }),
    ...(itemValues.beforeDiscountAmountTotal && { before_discount_amount_total: itemValues.beforeDiscountAmountTotal }),
    amount_tax: itemValues.taxAmount,
    ...(Number.isInteger(itemValues.taxDiscountAmount) && {
      tax_discount_amount: itemValues.taxDiscountAmount,
    }),
    ...(itemValues.taxDiscountAmountDecimal && {
      tax_discount_amount_decimal: itemValues.taxDiscountAmountDecimal,
    }),
    ...(Number.isInteger(itemValues.beforeDiscountTaxAmount) && {
      before_discount_tax_amount: itemValues.beforeDiscountTaxAmount,
    }),
    ...(itemValues.beforeDiscountTaxAmountDecimal && {
      before_discount_tax_amount_decimal: itemValues.beforeDiscountTaxAmountDecimal,
    }),
    ...(itemValues.tiers_details && {
      tiers_details: itemValues.tiers_details.map((tier) => ({
        quantity: tier.quantity,
        unit_amount: tier.unitAmount,
        unit_amount_decimal: tier.unitAmountDecimal,
        unit_amount_gross: tier.unitAmountGross,
        unit_amount_net: tier.unitAmountNet,
        amount_subtotal: tier.amountSubtotal,
        amount_total: tier.amountTotal,
        amount_tax: tier.taxAmount,
      })),
    }),
    ...(itemValues.getAg && { get_ag: itemValues.getAg }),
    taxes: [
      {
        ...(priceTax ? { tax: priceTax } : { rate: 'nontaxable', rateValue: 0 }),
        amount: itemValues.taxAmount,
      },
    ],
    ...(priceItem?._product && { _product: mapToProductSnapshot(priceItem._product) }),
    _price: {
      ...mapToPriceSnapshot(price),
      ...(itemValues.displayMode && {
        price_display_in_journeys: itemValues.displayMode ?? price?.price_display_in_journeys,
        unchanged_price_display_in_journeys:
          priceItem._price?.unchanged_price_display_in_journeys ?? price?.price_display_in_journeys,
      }),
    },
    is_tax_inclusive: isTaxInclusive,
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
    unit_amount: toDineroFromInteger(priceItem.unit_amount).convertPrecision(precision).getAmount(),
  }),
  ...(typeof priceItem.before_discount_unit_amount === 'number' && {
    before_discount_unit_amount: toDineroFromInteger(priceItem.before_discount_unit_amount)
      .convertPrecision(precision)
      .getAmount(),
  }),
  ...(typeof priceItem.unit_discount_amount === 'number' && {
    unit_discount_amount: toDineroFromInteger(priceItem.unit_discount_amount).convertPrecision(precision).getAmount(),
    unit_discount_amount_decimal: toDineroFromInteger(priceItem.unit_discount_amount).toUnit().toString(),
  }),
  ...(typeof priceItem.unit_amount_net === 'number' && {
    unit_amount_net: toDineroFromInteger(priceItem.unit_amount_net).convertPrecision(precision).getAmount(),
  }),
  ...(typeof priceItem.unit_amount_net === 'number' && {
    unit_amount_net_decimal: toDineroFromInteger(priceItem.unit_amount_net!).toUnit().toString(),
  }),
  ...(typeof priceItem.unit_discount_amount_net === 'number' && {
    unit_discount_amount_net: toDineroFromInteger(priceItem.unit_discount_amount_net)
      .convertPrecision(precision)
      .getAmount(),
    unit_discount_amount_net_decimal: toDineroFromInteger(priceItem.unit_discount_amount_net).toUnit().toString(),
  }),
  ...(typeof priceItem.unit_amount_gross === 'number' && {
    unit_amount_gross_decimal: toDineroFromInteger(priceItem.unit_amount_gross!).toUnit().toString(),
  }),
  unit_amount_gross: toDineroFromInteger(priceItem.unit_amount_gross!).convertPrecision(precision).getAmount(),
  amount_subtotal: toDineroFromInteger(priceItem.amount_subtotal!).convertPrecision(precision).getAmount(),
  amount_subtotal_decimal: toDineroFromInteger(priceItem.amount_subtotal!).toUnit().toString(),
  amount_total: toDineroFromInteger(priceItem.amount_total!).convertPrecision(precision).getAmount(),
  amount_total_decimal: toDineroFromInteger(priceItem.amount_total!).toUnit().toString(),
  ...(typeof priceItem.discount_amount === 'number' && {
    discount_amount: toDineroFromInteger(priceItem.discount_amount!).convertPrecision(precision).getAmount(),
    discount_amount_decimal: toDineroFromInteger(priceItem.discount_amount!).toUnit().toString(),
  }),
  ...(typeof priceItem.discount_percentage === 'number' && { discount_percentage: priceItem.discount_percentage }),
  ...(typeof priceItem.before_discount_amount_total === 'number' && {
    before_discount_amount_total: toDineroFromInteger(priceItem.before_discount_amount_total!)
      .convertPrecision(precision)
      .getAmount(),
    before_discount_amount_total_decimal: toDineroFromInteger(priceItem.before_discount_amount_total!)
      .toUnit()
      .toString(),
  }),
  amount_tax: toDineroFromInteger(priceItem.amount_tax!).convertPrecision(precision).getAmount(),

  ...(typeof priceItem.tax_discount_amount === 'number' && {
    tax_discount_amount: toDineroFromInteger(priceItem.tax_discount_amount!).convertPrecision(precision).getAmount(),
    tax_discount_amount_decimal: toDineroFromInteger(priceItem.tax_discount_amount!).toUnit().toString(),
  }),
  ...(typeof priceItem.before_discount_tax_amount === 'number' && {
    before_discount_tax_amount: toDineroFromInteger(priceItem.before_discount_tax_amount)
      .convertPrecision(precision)
      .getAmount(),
    before_discount_tax_amount_decimal: toDineroFromInteger(priceItem.before_discount_tax_amount).toUnit().toString(),
  }),
  taxes: priceItem.taxes!.map((tax) => ({
    ...tax,
    amount: toDineroFromInteger(tax.amount!).convertPrecision(precision).getAmount(),
  })),
  ...(priceItem.tiers_details && {
    tiers_details: priceItem.tiers_details?.map((tier) => {
      return {
        ...tier,
        unit_amount_gross: toDineroFromInteger(tier.unit_amount_gross).convertPrecision(precision).getAmount(),
        unit_amount_net: toDineroFromInteger(tier.unit_amount_net).convertPrecision(precision).getAmount(),
        amount_total: toDineroFromInteger(tier.amount_total).convertPrecision(precision).getAmount(),
        amount_subtotal: toDineroFromInteger(tier.amount_subtotal).convertPrecision(precision).getAmount(),
        amount_tax: toDineroFromInteger(tier.amount_tax).convertPrecision(precision).getAmount(),
      };
    }),
  }),
  ...(priceItem.get_ag &&
    priceItem.pricing_model === PricingModel.externalGetAG && {
      get_ag: {
        ...priceItem.get_ag,
        unit_amount_net: toDineroFromInteger(priceItem.get_ag.unit_amount_net).convertPrecision(precision).getAmount(),
        unit_amount_gross: toDineroFromInteger(priceItem.get_ag.unit_amount_gross)
          .convertPrecision(precision)
          .getAmount(),
        unit_amount_net_decimal: toDineroFromInteger(priceItem.get_ag.unit_amount_net).toUnit().toString(),
        unit_amount_gross_decimal: toDineroFromInteger(priceItem.get_ag.unit_amount_gross).toUnit().toString(),
        markup_amount_net: toDineroFromInteger(priceItem.get_ag.markup_amount_net!)
          .convertPrecision(precision)
          .getAmount(),
        markup_amount_net_decimal: toDineroFromInteger(priceItem.get_ag.markup_amount_net!).toUnit().toString(),
      },
    }),
});

const isPricingDetails = (details: unknown): details is PricingDetails =>
  Boolean(
    details &&
      typeof details === 'object' &&
      'amount_tax' in details &&
      (details as { amount_tax: unknown }).amount_tax !== undefined,
  );

const convertBreakDownPrecision = (details: PricingDetails | CompositePriceItem, precision: number): PricingDetails => {
  return {
    amount_subtotal: toDineroFromInteger(details.amount_subtotal!).convertPrecision(precision).getAmount(),
    amount_total: toDineroFromInteger(details.amount_total!).convertPrecision(precision).getAmount(),
    ...(isPricingDetails(details) && {
      amount_tax: toDineroFromInteger(details.amount_tax!).convertPrecision(precision).getAmount(),
    }),
    total_details: {
      ...details.total_details,
      amount_tax: toDineroFromInteger(details.total_details?.amount_tax!).convertPrecision(precision).getAmount(),
      breakdown: {
        ...details.total_details?.breakdown,
        taxes: details.total_details?.breakdown?.taxes!.map((tax) => ({
          ...tax,
          amount: toDineroFromInteger(tax.amount!).convertPrecision(precision).getAmount(),
        })),
        recurrences: details.total_details?.breakdown?.recurrences!.map((recurrence) => {
          return {
            ...recurrence,
            unit_amount_gross: toDineroFromInteger(recurrence.unit_amount_gross!)
              .convertPrecision(precision)
              .getAmount(),
            unit_amount_net: Number.isInteger(recurrence.unit_amount_net)
              ? toDineroFromInteger(recurrence.unit_amount_net!).convertPrecision(precision).getAmount()
              : undefined,
            amount_subtotal: toDineroFromInteger(recurrence.amount_subtotal).convertPrecision(precision).getAmount(),
            amount_total: toDineroFromInteger(recurrence.amount_total).convertPrecision(precision).getAmount(),
            amount_tax: toDineroFromInteger(recurrence.amount_tax!).convertPrecision(precision).getAmount(),
            ...(Number.isInteger(recurrence.discount_amount) && {
              discount_amount: toDineroFromInteger(recurrence.discount_amount!).convertPrecision(precision).getAmount(),
            }),
            ...(Number.isInteger(recurrence.before_discount_amount_total) && {
              before_discount_amount_total: toDineroFromInteger(recurrence.before_discount_amount_total!)
                .convertPrecision(precision)
                .getAmount(),
            }),
          };
        }),
        recurrencesByTax: details.total_details?.breakdown?.recurrencesByTax!.map((recurrence) => {
          return {
            ...recurrence,
            amount_total: toDineroFromInteger(recurrence.amount_total).convertPrecision(precision).getAmount(),
            amount_subtotal: toDineroFromInteger(recurrence.amount_subtotal).convertPrecision(precision).getAmount(),
            amount_tax: toDineroFromInteger(recurrence.amount_tax!).convertPrecision(precision).getAmount(),
            tax: {
              ...recurrence.tax,
              amount: toDineroFromInteger(recurrence.tax?.amount!).convertPrecision(precision).getAmount(),
            },
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
const getPriceTax = (applicableTax?: Tax, price?: Price, priceItemTaxes?: TaxAmountDto[]): Tax | undefined => {
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

const getPriceRecurrence = (price: Price | undefined, recurrences: RecurrenceAmount[]) => {
  if (price?.type === 'recurring') {
    return recurrences.find(
      (recurrenceItem) => recurrenceItem.type === price.type && recurrenceItem.billing_period === price.billing_period,
    );
  }

  return recurrences.find((recurrenceItem) => recurrenceItem.type === 'one_time');
};

const getPriceRecurrenceByTax = (
  price: Price | undefined,
  recurrencesByTax: RecurrenceAmountWithTax[],
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
    const parentHasHiddenPriceComponents = (parentPriceItem.item_components ?? []).some(
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

export const computeQuantities = (price: Price | undefined, quantity: number, priceMapping?: PriceInputMapping) => {
  const safeQuantity = isNaN(quantity) ? 1 : quantity;
  const normalizedPriceMappingInput = normalizePriceMappingInput(priceMapping, price);
  const quantityToSelectTier = normalizedPriceMappingInput ? normalizedPriceMappingInput.toUnit() : 1;
  const unitAmountMultiplier = normalizedPriceMappingInput
    ? normalizedPriceMappingInput.multiply(safeQuantity).toUnit()
    : safeQuantity;

  return {
    safeQuantity,
    quantityToSelectTier,
    unitAmountMultiplier,
    isUsingPriceMappingToSelectTier: Boolean(normalizedPriceMappingInput),
  };
};

const computeExternalFee = (
  externalFeeMapping: ExternalFeeMapping | undefined,
  priceBillingPeriod: TimeFrequency | undefined,
): string | undefined => {
  if (!externalFeeMapping || !externalFeeMapping.amount_total_decimal) {
    return;
  }

  if (!priceBillingPeriod) {
    return externalFeeMapping.amount_total_decimal;
  }

  return normalizeValueToFrequencyUnit(
    externalFeeMapping.amount_total_decimal,
    externalFeeMapping.frequency_unit as TimeFrequency,
    priceBillingPeriod,
  ) as string;
};
