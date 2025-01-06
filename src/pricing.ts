import { PriceItems } from '@epilot/pricing-client';
import type { Currency } from 'dinero.js';

import { DEFAULT_CURRENCY } from './currencies';
import { toDineroFromInteger, toDinero } from './formatters';
import { normalizePriceMappingInput, normalizeValueToFrequencyUnit } from './normalizers';
import type {
  CompositePrice,
  CompositePriceItem,
  CompositePriceItemDto,
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
  isTruthy,
  PriceItemsTotals,
  applyDiscounts,
} from './utils';
import { isValidCoupon } from './utils/guards/coupon';

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

const isCompositePriceItem = (priceItem: PriceItem | CompositePriceItem): priceItem is CompositePriceItem =>
  Boolean(priceItem.is_composite_price || priceItem._price?.is_composite_price);

export const computePriceComponent = (
  priceItemComponent: PriceItemDto,
  priceItem: CompositePriceItemDto,
): PriceItem => {
  const tax = priceItemComponent.taxes?.[0]?.tax;
  const priceMapping = priceItem.price_mappings?.find(({ price_id }) => priceItemComponent._price!._id === price_id);

  const externalFeeMapping = priceItem.external_fees_mappings?.find(
    ({ price_id }) => priceItemComponent._price!._id === price_id,
  );

  const safeQuantity = isNaN(priceItemComponent.quantity!) ? 1 : priceItemComponent.quantity;
  const safeParentQuantity = isNaN(priceItem.quantity!) ? 1 : priceItem.quantity!;
  const quantity = toDinero(String(safeQuantity)).multiply(safeParentQuantity).toUnit();

  return computePriceItem(priceItemComponent, {
    tax,
    quantity,
    priceMapping,
    externalFeeMapping,
  });
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
 * @returns the composite price item
 */
export const computeCompositePrice = (priceItem: CompositePriceItemDto): CompositePriceItem => {
  const compositePrice = priceItem._price as CompositePrice;

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
      ...(component?._coupons && { _coupons: component?._coupons }),
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

const convertAmountsToDinero = <Item extends PriceItem | CompositePriceItem>(item: Item): Item => {
  const dineroTotal = toDinero(item.amount_total_decimal || '0');
  const dineroSubtotal = toDinero(item.amount_subtotal_decimal || '0');
  const amountTax = dineroTotal.subtract(dineroSubtotal).getAmount();

  return {
    ...item,
    amount_total: dineroTotal.getAmount(),
    amount_subtotal: dineroSubtotal.getAmount(),
    unit_amount_gross: toDinero(item.unit_amount_gross_decimal || '0').getAmount(),
    unit_amount_net: toDinero(item.unit_amount_net_decimal || '0').getAmount(),
    unit_amount: toDinero(item.unit_amount_decimal || '0').getAmount(),
    amount_tax: amountTax,
    ...(item.taxes &&
      Array.isArray(item.taxes) &&
      item.taxes[0] && {
        taxes: [{ ...item.taxes[0], amount: amountTax }, ...item.taxes.slice(1)],
      }),
  };
};

const getImmutablePriceItem = (
  immutablePricingDetails: PricingDetails | undefined,
): PriceItem | CompositePriceItem | undefined => {
  const immutablePriceItem = immutablePricingDetails?.items?.[0];

  if (!immutablePriceItem) {
    return undefined;
  }

  if (immutablePriceItem.is_composite_price) {
    const compositePriceItem = immutablePriceItem as CompositePriceItem;

    return {
      ...convertAmountsToDinero(compositePriceItem),
      item_components: compositePriceItem.item_components?.map((component) => convertAmountsToDinero(component)),
    };
  }

  return convertAmountsToDinero(immutablePriceItem);
};

/**
 * Computes all the integer amounts for the price items using the string decimal representation defined on prices unit_amount field.
 * All totals are computed with a decimal precision of DECIMAL_PRECISION.
 * After the calculations the integer amounts are scaled to a precision of 2.
 *
 * This function computes both line items and aggregated totals.
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
    const immutablePriceItem = getImmutablePriceItem(priceItem._immutable_pricing_details);

    if (
      /**
       * priceItem should never be nullish but since optional check was removed
       * from isCompositePrice we should make the check before calling it
       */
      priceItem &&
      isCompositePrice(priceItem)
    ) {
      const compositePriceItemToAppend = immutablePriceItem
        ? (immutablePriceItem as CompositePriceItem)
        : computeCompositePrice(priceItem);

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
      const tax = priceItem.taxes?.[0]?.tax;
      const priceMapping = priceItem._price
        ? priceItem.price_mappings?.find(({ price_id }) => priceItem._price!._id === price_id)
        : undefined;

      const externalFeeMapping = priceItem.external_fees_mappings?.find(
        ({ price_id }) => priceItem._price!._id === price_id,
      );

      const priceItemToAppend = immutablePriceItem
        ? (immutablePriceItem as PriceItemDto)
        : computePriceItem(priceItem, {
            tax,
            quantity: priceItem.quantity!,
            priceMapping,
            externalFeeMapping,
          });

      const updatedTotals = isOnRequestUnitAmountApproved(
        priceItem,
        priceItemToAppend?._price?.price_display_in_journeys ?? price?.price_display_in_journeys,
        undefined,
      )
        ? recomputeDetailTotals(details, price, priceItemToAppend)
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
const recomputeDetailTotals = (
  details: PricingDetails,
  price: Price | undefined,
  priceItemToAppend: PriceItem,
): PricingDetails => {
  const taxes = details.total_details?.breakdown?.taxes || [];
  const firstTax = priceItemToAppend.taxes?.[0];
  const itemTax = firstTax?.tax ?? ({ rate: Number(firstTax?.rateValue) } as Partial<Tax>);

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

  const cashbacks = [...(details.total_details?.breakdown?.cashbacks ?? [])];

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
  const priceCashBackAmount =
    typeof priceItemToAppend.cashback_amount !== 'undefined'
      ? toDineroFromInteger(priceItemToAppend.cashback_amount!)
      : undefined;

  const coupon = (priceItemToAppend as PriceItemDto)?._coupons?.[0];

  const cashbackPeriod = priceItemToAppend.cashback_period ?? '0';
  const priceBeforeDiscountAmountTotal =
    typeof priceItemToAppend.before_discount_amount_total !== 'undefined'
      ? toDineroFromInteger(priceItemToAppend.before_discount_amount_total!)
      : undefined;
  const priceTax = toDineroFromInteger(priceItemToAppend.taxes?.[0]?.amount || priceItemToAppend.amount_tax || 0);

  if (tax) {
    tax.amount = toDineroFromInteger(tax.amount!).add(priceTax).getAmount();

    if (tax.tax && itemTax) {
      // Populates missing data in deprecated taxes
      if (!tax.tax._id && itemTax._id) {
        tax.tax._id = itemTax._id;
      }

      if (!tax.tax.type && itemTax.type) {
        tax.tax.type = itemTax.type;
      }
    }
  } else if (itemTax) {
    const { _id, type, rate } = itemTax;
    taxes.push({
      tax: {
        ...(_id && { _id }),
        ...(type && { type }),
        rate,
      },
      amount: priceTax.getAmount(),
    });
  }

  if (!recurrence) {
    const type = price?.type || priceItemToAppend.type;

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
    const existingRecurrenceBeforeDiscountAmountTotal =
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

    if (priceBeforeDiscountAmountTotal || existingRecurrenceBeforeDiscountAmountTotal) {
      const baseAmount = priceBeforeDiscountAmountTotal || priceTotal;
      const recurrenceBeforeDiscountAmountTotal =
        existingRecurrenceBeforeDiscountAmountTotal?.add(baseAmount) ?? baseAmount;
      recurrence.before_discount_amount_total = recurrenceBeforeDiscountAmountTotal.getAmount();
      recurrence.before_discount_amount_total_decimal = recurrenceBeforeDiscountAmountTotal.toUnit().toString();
    }
    if (priceDiscountAmount) {
      const recurrenceDiscountAmount = discountAmount?.add(priceDiscountAmount) ?? priceDiscountAmount;
      recurrence.discount_amount = recurrenceDiscountAmount.getAmount();
      recurrence.discount_amount_decimal = recurrenceDiscountAmount.toUnit().toString();
    }
  }

  const recurrenceTax = !tax && itemTax ? taxes?.[taxes?.length - 1] : tax;

  if (!recurrenceByTax) {
    const type = price?.type || priceItemToAppend.type;

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

  // Cashback totals
  if (priceCashBackAmount && Boolean(coupon)) {
    const cashbackMatch = cashbacks.find((cashback) => cashback.cashback_period === cashbackPeriod);

    if (cashbackMatch) {
      const cashbackAmountTotal = toDineroFromInteger(cashbackMatch.amount_total);
      cashbackMatch.amount_total = cashbackAmountTotal.add(priceCashBackAmount).getAmount();
    } else {
      cashbacks.push({
        cashback_period: cashbackPeriod,
        amount_total: priceCashBackAmount.getAmount(),
      });
    }
  }

  // Remove empty cashbacks from the breakdown
  if (cashbacks.length > 0) {
    cashbacks.filter((cashback) => cashback.amount_total > 0);
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
        cashbacks,
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
    const updatedTotals = isOnRequestUnitAmountApproved(
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
  {
    tax: applicableTax,
    quantity,
    priceMapping,
    externalFeeMapping,
  }: {
    tax?: Tax;
    quantity: number;
    priceMapping?: PriceInputMapping;
    externalFeeMapping?: ExternalFeeMapping;
  },
): PriceItem => {
  const price = priceItem._price;
  const currency = (price?.unit_amount_currency || DEFAULT_CURRENCY).toUpperCase() as Currency;
  const priceItemDescription = priceItem.description ?? price?.description;

  const unitAmountDecimal = priceItem.unit_amount_decimal || price?.unit_amount_decimal || '0';
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
      itemValues = computeTieredVolumePriceItemValues({
        tiers: price.tiers,
        currency,
        isTaxInclusive,
        quantityToSelectTier,
        tax: priceTax,
        unitAmountMultiplier,
        unchangedPriceDisplayInJourneys: priceItem._price?.unchanged_price_display_in_journeys,
      });
      break;
    case PricingModel.tieredFlatFee:
      itemValues = computeTieredFlatFeePriceItemValues({
        tiers: price.tiers,
        currency,
        isTaxInclusive,
        quantityToSelectTier,
        tax: priceTax,
        quantity: safeQuantity,
        isUsingPriceMappingToSelectTier: isUsingPriceMappingToSelectTier,
        unchangedPriceDisplayInJourneys: priceItem._price?.unchanged_price_display_in_journeys,
      });
      break;
    case PricingModel.tieredGraduated:
      itemValues = computeTieredGraduatedPriceItemValues({
        tiers: price.tiers,
        currency,
        isTaxInclusive,
        quantityToSelectTier,
        tax: priceTax,
        quantity: safeQuantity,
        isUsingPriceMappingToSelectTier: isUsingPriceMappingToSelectTier,
        unchangedPriceDisplayInJourneys: priceItem._price?.unchanged_price_display_in_journeys,
      });
      break;
    case PricingModel.externalGetAG:
      itemValues = computeExternalGetAGItemValues({
        getAg: price?.get_ag!,
        currency,
        isTaxInclusive,
        unitAmountMultiplier,
        userInput: quantityToSelectTier,
        externalFeeAmountDecimal,
        tax: priceTax,
      });
      break;
    default:
      itemValues = computePriceItemValues({
        unitAmountDecimal,
        currency,
        isTaxInclusive,
        unitAmountMultiplier,
        tax: priceTax,
      });
  }

  const coupons = priceItem._coupons ?? [];
  const [coupon] = coupons.filter(isValidCoupon);

  if (coupon) {
    itemValues = applyDiscounts(itemValues, {
      priceItem,
      currency,
      isTaxInclusive,
      unitAmountMultiplier,
      tax: priceTax,
      coupon,
    });
  }

  /* If there's a coupon cashback period output it */
  const cashbackPeriod = priceItem._coupons?.map(({ cashback_period }) => cashback_period).find(isTruthy);

  return {
    ...priceItem,
    currency,
    ...(priceItemDescription && { description: priceItemDescription }),
    ...(Number.isInteger(itemValues.cashback_amount) && { cashback_period: cashbackPeriod ?? '0' }),
    /**
     * @todo In the future the unit_amount_decimal should be derived from the unit_amount
     * and not from the original price's unit_amount_decimal,
     * as it can be affected by the discounting.
     * Right now we have a solution that targets specifically discounted prices,
     * but this should be generalized.
     */
    ...(price?.pricing_model === PricingModel.perUnit && { unit_amount_decimal: unitAmountDecimal }),
    ...(typeof itemValues.unit_amount === 'number' &&
      Number.isInteger(itemValues.unit_amount) && {
        unit_amount: itemValues.unit_amount,
        ...(coupon && {
          unit_amount_decimal: toDineroFromInteger(itemValues.unit_amount).toUnit().toString(),
        }),
      }),
    ...(Number.isInteger(itemValues.before_discount_unit_amount) && {
      before_discount_unit_amount: itemValues.before_discount_unit_amount,
    }),
    ...(Number.isInteger(itemValues.unit_discount_amount) && { unit_discount_amount: itemValues.unit_discount_amount }),
    ...(Number.isInteger(itemValues.unit_amount_net) && { unit_amount_net: itemValues.unit_amount_net }),
    ...(Number.isInteger(itemValues.unit_discount_amount_net) && {
      unit_discount_amount_net: itemValues.unit_discount_amount_net,
    }),
    ...(Number.isInteger(itemValues.unit_amount_gross) && { unit_amount_gross: itemValues.unit_amount_gross }),
    amount_subtotal: itemValues.amount_subtotal,
    amount_total: itemValues.amount_total,
    ...(itemValues.discount_amount && { discount_amount: itemValues.discount_amount }),
    ...(typeof itemValues.discount_percentage === 'number' && { discount_percentage: itemValues.discount_percentage }),
    ...(Number.isInteger(itemValues.cashback_amount) && {
      cashback_amount: itemValues.cashback_amount,
    }),
    ...(itemValues.cashback_amount_decimal && { cashback_amount_decimal: itemValues.cashback_amount_decimal }),
    ...(Number.isInteger(itemValues.after_cashback_amount_total) && {
      after_cashback_amount_total: itemValues.after_cashback_amount_total,
    }),
    ...(itemValues.after_cashback_amount_total_decimal && {
      after_cashback_amount_total_decimal: itemValues.after_cashback_amount_total_decimal,
    }),
    ...(itemValues.before_discount_amount_total && {
      before_discount_amount_total: itemValues.before_discount_amount_total,
    }),
    amount_tax: itemValues.amount_tax,
    ...(Number.isInteger(itemValues.tax_discount_amount) && { tax_discount_amount: itemValues.tax_discount_amount }),
    ...(Number.isInteger(itemValues.before_discount_tax_amount) && {
      before_discount_tax_amount: itemValues.before_discount_tax_amount,
    }),
    ...(itemValues.tiers_details && {
      tiers_details: itemValues.tiers_details,
    }),
    ...(itemValues.get_ag && { get_ag: itemValues.get_ag }),
    taxes: [
      {
        ...(priceTax ? { tax: priceTax } : { rate: 'nontaxable', rateValue: 0 }),
        amount: itemValues.amount_tax,
      },
    ],
    ...(priceItem?._product && { _product: mapToProductSnapshot(priceItem._product) }),
    _price: {
      ...mapToPriceSnapshot(price),
      ...(itemValues.price_display_in_journeys && {
        price_display_in_journeys: itemValues.price_display_in_journeys ?? price?.price_display_in_journeys,
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
    unit_amount_net_decimal: toDineroFromInteger(priceItem.unit_amount_net).toUnit().toString(),
  }),
  ...(typeof priceItem.unit_discount_amount_net === 'number' && {
    unit_discount_amount_net: toDineroFromInteger(priceItem.unit_discount_amount_net)
      .convertPrecision(precision)
      .getAmount(),
    unit_discount_amount_net_decimal: toDineroFromInteger(priceItem.unit_discount_amount_net).toUnit().toString(),
  }),
  ...(typeof priceItem.unit_amount_gross === 'number' && {
    unit_amount_gross_decimal: toDineroFromInteger(priceItem.unit_amount_gross).toUnit().toString(),
  }),
  unit_amount_gross: toDineroFromInteger(priceItem.unit_amount_gross!).convertPrecision(precision).getAmount(),
  amount_subtotal: toDineroFromInteger(priceItem.amount_subtotal!).convertPrecision(precision).getAmount(),
  amount_subtotal_decimal: toDineroFromInteger(priceItem.amount_subtotal!).toUnit().toString(),
  amount_total: toDineroFromInteger(priceItem.amount_total!).convertPrecision(precision).getAmount(),
  amount_total_decimal: toDineroFromInteger(priceItem.amount_total!).toUnit().toString(),
  ...(typeof priceItem.discount_amount === 'number' && {
    discount_amount: toDineroFromInteger(priceItem.discount_amount).convertPrecision(precision).getAmount(),
    discount_amount_decimal: toDineroFromInteger(priceItem.discount_amount).toUnit().toString(),
  }),
  ...(typeof priceItem.discount_percentage === 'number' && { discount_percentage: priceItem.discount_percentage }),
  ...(typeof priceItem.before_discount_amount_total === 'number' && {
    before_discount_amount_total: toDineroFromInteger(priceItem.before_discount_amount_total)
      .convertPrecision(precision)
      .getAmount(),
    before_discount_amount_total_decimal: toDineroFromInteger(priceItem.before_discount_amount_total)
      .toUnit()
      .toString(),
  }),
  ...(typeof priceItem.cashback_amount === 'number' && {
    cashback_amount: toDineroFromInteger(priceItem.cashback_amount).convertPrecision(precision).getAmount(),
    cashback_amount_decimal: toDineroFromInteger(priceItem.cashback_amount).toUnit().toString(),
  }),
  ...(typeof priceItem.after_cashback_amount_total === 'number' && {
    after_cashback_amount_total: toDineroFromInteger(priceItem.after_cashback_amount_total)
      .convertPrecision(precision)
      .getAmount(),
    after_cashback_amount_total_decimal: toDineroFromInteger(priceItem.after_cashback_amount_total).toUnit().toString(),
  }),
  amount_tax: toDineroFromInteger(priceItem.amount_tax || 0)
    .convertPrecision(precision)
    .getAmount(),
  ...(typeof priceItem.tax_discount_amount === 'number' && {
    tax_discount_amount: toDineroFromInteger(priceItem.tax_discount_amount).convertPrecision(precision).getAmount(),
    tax_discount_amount_decimal: toDineroFromInteger(priceItem.tax_discount_amount).toUnit().toString(),
  }),
  ...(typeof priceItem.before_discount_tax_amount === 'number' && {
    before_discount_tax_amount: toDineroFromInteger(priceItem.before_discount_tax_amount)
      .convertPrecision(precision)
      .getAmount(),
    before_discount_tax_amount_decimal: toDineroFromInteger(priceItem.before_discount_tax_amount).toUnit().toString(),
  }),
  taxes: priceItem.taxes!.map((tax) => ({
    ...tax,
    amount: toDineroFromInteger(tax.amount || 0)
      .convertPrecision(precision)
      .getAmount(),
  })),
  ...(priceItem.tiers_details && {
    tiers_details: priceItem.tiers_details.map((tier) => {
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
    (priceItem.pricing_model === PricingModel.externalGetAG ||
      priceItem._price?.pricing_model === PricingModel.externalGetAG) && {
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
        cashbacks: details.total_details?.breakdown?.cashbacks?.map((cashback) => ({
          ...cashback,
          amount_total: toDineroFromInteger(cashback.amount_total!).convertPrecision(precision).getAmount(),
        })),
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

/**
 * Determines if a price item is approved based on its display mode and approval property.
 *
 * If price item has a parent item, it is always cosidered approved if the display mode is not 'show_as_on_request'.
 *
 * @param priceItem - The price item to check, which can be either a `PriceItem` or a `CompositePriceItem`.
 * @param parentPriceItem - An optional parent composite price item, used for additional context when checking unit amounts.
 * @returns `true` if the price item is approved, `false` otherwise.
 */
export const isPriceItemApproved = (
  priceItem: PriceItem | CompositePriceItem,
  parentPriceItem?: CompositePriceItem,
) => {
  if (isCompositePriceItem(priceItem)) {
    const hasHiddenPriceComponents = (priceItem.item_components ?? []).some(isDisplayModeRequiringApproval);

    return hasHiddenPriceComponents
      ? Boolean(priceItem.on_request_approved)
      : Boolean(!isDisplayModeRequiringApproval(priceItem) || priceItem?.on_request_approved);
  } else {
    if (parentPriceItem) {
      return Boolean(
        priceItem._price?.price_display_in_journeys !== 'show_as_on_request' || parentPriceItem?.on_request_approved,
      );
    }

    return Boolean(!isDisplayModeRequiringApproval(priceItem) || priceItem?.on_request_approved);
  }
};

const isOnRequestUnitAmountApproved = (
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
      return Boolean(parentPriceItem?.on_request_approved);
    }

    return true;
  }

  return Boolean(priceDisplayInJourneys !== 'show_as_on_request' || priceItem?.on_request_approved);
};

/**
 * Determines if a price item or composite price item requires approval.
 *
 * This function checks if the given price item or any of its components (if it is a composite price)
 * require approval based on their display mode.
 *
 * @param priceItem - The price item or composite price item to check.
 * @returns `true` if the price item or any of its components require approval, otherwise `false`.
 */
export const isRequiringApproval = (priceItem: PriceItem | CompositePriceItem): boolean => {
  const isRequiringApproval = isDisplayModeRequiringApproval(priceItem);

  if (isCompositePriceItem(priceItem)) {
    return (
      isRequiringApproval ||
      Boolean(priceItem.item_components?.some((component) => isDisplayModeRequiringApproval(component)))
    );
  }

  return isRequiringApproval;
};

const isDisplayModeRequiringApproval = (priceItem: PriceItem | CompositePriceItem): boolean => {
  return (
    priceItem._price?.price_display_in_journeys === 'show_as_on_request' ||
    priceItem._price?.price_display_in_journeys === 'show_as_starting_price'
  );
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

export const getRecurrencesWithEstimatedPrices = (lineItems: PriceItems | undefined) => {
  const recurrences: Record<string, boolean> = {};

  lineItems?.forEach((lineItem) => {
    if (isCompositePriceItem(lineItem)) {
      lineItem.item_components?.forEach((component) => {
        const recurrence = component._price?.type === 'recurring' ? component._price?.billing_period : component.type;

        if (recurrence !== undefined) {
          recurrences[recurrence] =
            recurrences[recurrence] || component._price?.price_display_in_journeys === 'estimated_price';
        }
      });
    } else {
      const recurrence =
        lineItem._price?.type === 'recurring' ? lineItem._price?.billing_period : lineItem._price?.type;

      if (recurrence !== undefined) {
        recurrences[recurrence] =
          recurrences[recurrence] || lineItem._price?.price_display_in_journeys === 'estimated_price';
      }
    }
  });

  return recurrences;
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
