import type { Currency } from 'dinero.js';

import { DEFAULT_CURRENCY } from './currencies';
import { toDineroFromInteger, toDinero, getSafeQuantity } from './formatters';
import {
  normalizePriceMappingInput,
  normalizeTimeFrequencyFromDineroInputValue,
  normalizeValueToFrequencyUnit,
} from './normalizers';
import type {
  CashbackAmount,
  CompositePriceItem,
  CompositePriceItemDto,
  ExternalFeeMapping,
  Price,
  PriceInputMapping,
  PriceItem,
  PriceItemDto,
  PriceItems,
  PriceItemsDto,
  PricingDetails,
  Product,
  RecurrenceAmount,
  RecurrenceAmountWithTax,
  RedeemedPromo,
  Tax,
  TaxAmountDto,
  TimeFrequency,
} from './types';
import {
  computeExternalGetAGItemValues,
  computeExternalDynamicTariffValues,
  computePerUnitPriceItemValues,
  computeTieredFlatFeePriceItemValues,
  computeTieredGraduatedPriceItemValues,
  computeTieredVolumePriceItemValues,
  isTaxInclusivePrice,
  PriceItemsTotals,
  applyDiscounts,
  convertPriceItemWithCouponAppliedToPriceItemDto,
  isPriceItemWithCouponApplied,
} from './utils';
import { isValidCoupon, getCouponOrder } from './utils/guards/coupon';

export enum PricingModel {
  perUnit = 'per_unit',
  tieredGraduated = 'tiered_graduated',
  tieredVolume = 'tiered_volume',
  tieredFlatFee = 'tiered_flatfee',
  dynamicTariff = 'dynamic_tariff',
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

export enum ModeDynamicTariff {
  dayAheadMarket = 'day_ahead_market',
  manual = 'manual',
}

export enum IntervalDynamicTariff {
  hourly = 'hourly',
  monthly = 'monthly_average',
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

export const isCompositePriceItemDto = (
  priceItem: PriceItemDto | CompositePriceItemDto,
): priceItem is CompositePriceItemDto => Boolean(priceItem.is_composite_price || priceItem._price?.is_composite_price);

const isCompositePriceItem = (priceItem: PriceItem | CompositePriceItem): priceItem is CompositePriceItem =>
  Boolean(priceItem.is_composite_price || priceItem._price?.is_composite_price);

type ComputePriceComponentOptions = {
  redeemedPromos?: Array<RedeemedPromo>;
};

export const computePriceComponent = (
  priceItemComponent: PriceItemDto,
  priceItem: CompositePriceItemDto,
  { redeemedPromos = [] }: ComputePriceComponentOptions = {},
): PriceItem => {
  const tax = priceItemComponent.taxes?.[0]?.tax;
  const priceMapping = priceItem.price_mappings?.find(({ price_id }) => priceItemComponent._price!._id === price_id);

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
    _price: mapToPriceSnapshot(priceItem._price as Price | undefined),
    currency: priceItem._price?.unit_amount_currency || DEFAULT_CURRENCY,
    ...(itemDescription && { description: itemDescription }),
    item_components: computedItemComponents,
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
 * Recurrence amounts after cashbacks can only be computed
 * after all recurrences and cashbacks have been computed.
 */
const computeRecurrenceAfterCashbackAmounts = (recurrence: RecurrenceAmount, cashbacks: CashbackAmount[]) => {
  /* Only the first cashback is taken into account */
  const cashback = cashbacks[0];

  if (!cashback || !recurrence.type) {
    return recurrence;
  }

  const cashbackAmount = toDineroFromInteger(cashback.amount_total);

  const normalizedCashbackAmount =
    recurrence.type === 'recurring'
      ? normalizeTimeFrequencyFromDineroInputValue(cashbackAmount, 'yearly', recurrence.billing_period!)
      : cashbackAmount;

  const afterCashbackAmountTotal = toDineroFromInteger(recurrence.amount_total).subtract(normalizedCashbackAmount);

  return {
    ...recurrence,
    after_cashback_amount_total: afterCashbackAmountTotal.getAmount(),
    after_cashback_amount_total_decimal: afterCashbackAmountTotal.toUnit().toString(),
  };
};

type ComputeAggregatedAndPriceTotalsOptions = {
  redeemedPromos?: Array<RedeemedPromo>;
};

/**
 * Computes all the integer amounts for the price items using the string decimal representation defined on prices unit_amount field.
 * All totals are computed with a decimal precision of DECIMAL_PRECISION.
 * After the calculations the integer amounts are scaled to a precision of 2.
 *
 * This function computes both line items and aggregated totals.
 */
export const computeAggregatedAndPriceTotals = (
  priceItems: PriceItemsDto,
  { redeemedPromos = [] }: ComputeAggregatedAndPriceTotalsOptions = {},
): PricingDetails => {
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
        cashbacks: [],
      },
    },
    ...(redeemedPromos.length && { redeemed_promos: redeemedPromos }),
  };

  const priceDetails = priceItems.reduce((details, priceItem) => {
    const immutablePriceItem = getImmutablePriceItem(priceItem._immutable_pricing_details);

    if (isCompositePriceItemDto(priceItem)) {
      const compositePriceItemToAppend =
        (immutablePriceItem as CompositePriceItem | undefined) ?? computeCompositePrice(priceItem, { redeemedPromos });

      const itemBreakdown = recomputeDetailTotalsFromCompositePrice(undefined, compositePriceItemToAppend);
      const updatedTotals = recomputeDetailTotalsFromCompositePrice(details, compositePriceItemToAppend);

      const newItem = {
        ...compositePriceItemToAppend,
        ...itemBreakdown,
        ...(typeof itemBreakdown?.amount_subtotal === 'number' && {
          amount_subtotal_decimal: toDineroFromInteger(itemBreakdown.amount_subtotal).toUnit().toString(),
        }),
        ...(typeof itemBreakdown?.amount_total === 'number' && {
          amount_total_decimal: toDineroFromInteger(itemBreakdown.amount_total).toUnit().toString(),
        }),
        item_components: convertPriceComponentsPrecision(compositePriceItemToAppend.item_components ?? [], 2),
      };

      return {
        ...updatedTotals,
        items: details.items.concat(newItem),
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

      const priceItemToAppend =
        (immutablePriceItem as PriceItemDto | undefined) ??
        computePriceItem(priceItem, {
          tax,
          quantity: priceItem.quantity!,
          priceMapping,
          externalFeeMapping,
          redeemedPromos,
        });

      const updatedTotals = isOnRequestUnitAmountApproved(
        priceItem,
        priceItemToAppend?._price?.price_display_in_journeys ?? price?.price_display_in_journeys,
        undefined,
      )
        ? recomputeDetailTotals(details, price, priceItemToAppend)
        : details;

      const newItem = convertPriceItemPrecision(priceItemToAppend, 2);

      return {
        ...updatedTotals,
        items: details.items.concat(newItem),
      };
    }
  }, initialPricingDetails);

  priceDetails.currency = (priceDetails.items[0]?.currency as Currency) || DEFAULT_CURRENCY;

  const cashbacks = priceDetails.total_details?.breakdown?.cashbacks;

  if (cashbacks?.length) {
    priceDetails.total_details!.breakdown!.recurrences = priceDetails.total_details?.breakdown?.recurrences?.map(
      (recurrence) => computeRecurrenceAfterCashbackAmounts(recurrence, cashbacks),
    );
  }

  return convertPricingPrecision(priceDetails, 2);
};

/**
 * Computes the pricing details for a given PriceItem in isolation.
 * The computed price item will be the only entry from the PricingDetails items array.
 *
 * @param priceItem - the price item to compute
 * @returns the pricing details
 */
export const computePriceItemDetails = (
  priceItem: PriceItemDto | CompositePriceItemDto,
  options?: ComputeAggregatedAndPriceTotalsOptions,
) => computeAggregatedAndPriceTotals([priceItem], options);

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

  const priceBeforeDiscountAmountTotal =
    typeof priceItemToAppend.before_discount_amount_total !== 'undefined'
      ? toDineroFromInteger(priceItemToAppend.before_discount_amount_total!)
      : undefined;
  const priceTax = toDineroFromInteger(priceItemToAppend.taxes?.[0]?.amount || priceItemToAppend.amount_tax || 0);

  /**
   * Taxes
   */
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

  /**
   * Recurrences
   */
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
        before_discount_amount_total: priceBeforeDiscountAmountTotal.getAmount(),
        before_discount_amount_total_decimal: priceBeforeDiscountAmountTotal.toUnit().toString(),
      }),
      ...(priceDiscountAmount && {
        discount_amount: priceDiscountAmount.getAmount(),
        discount_amount_decimal: priceDiscountAmount.toUnit().toString(),
      }),
    });
  } else {
    const unitAmountGrossAmount = toDineroFromInteger(recurrence.unit_amount_gross!).add(priceUnitAmountGross);
    const unitAmountNetAmount = recurrence.unit_amount_net
      ? toDineroFromInteger(recurrence.unit_amount_net).add(priceUnitAmountNet!)
      : undefined;
    const subTotalAmount = toDineroFromInteger(recurrence.amount_subtotal).add(priceSubtotal);
    const totalAmount = toDineroFromInteger(recurrence.amount_total).add(priceTotal);
    const taxAmount = toDineroFromInteger(recurrence.amount_tax!).add(priceTax);

    recurrence.unit_amount_gross = unitAmountGrossAmount.getAmount();
    recurrence.unit_amount_net = unitAmountNetAmount?.getAmount();
    recurrence.amount_subtotal = subTotalAmount.getAmount();
    recurrence.amount_subtotal_decimal = subTotalAmount.toUnit().toString();
    recurrence.amount_total = totalAmount.getAmount();
    recurrence.amount_total_decimal = totalAmount.toUnit().toString();
    recurrence.amount_tax = taxAmount.getAmount();

    const existingRecurrenceBeforeDiscountAmountTotal =
      typeof recurrence.before_discount_amount_total !== 'undefined'
        ? toDineroFromInteger(recurrence.before_discount_amount_total)
        : undefined;
    const discountAmount =
      typeof recurrence.discount_amount !== 'undefined' ? toDineroFromInteger(recurrence.discount_amount) : undefined;

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

  /**
   * Recurrences by tax
   */
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
    const totalAmount = toDineroFromInteger(recurrenceByTax.amount_total).add(priceTotal);
    const subTotalAmount = toDineroFromInteger(recurrenceByTax.amount_subtotal).add(priceSubtotal);
    const taxAmount = toDineroFromInteger(recurrenceByTax.amount_tax!).add(priceTax);

    recurrenceByTax.amount_total = totalAmount.getAmount();
    recurrenceByTax.amount_subtotal = subTotalAmount.getAmount();
    recurrenceByTax.amount_tax = taxAmount.getAmount();
  }

  /**
   * Cashbacks
   */
  const coupon = (priceItemToAppend as PriceItemDto)?._coupons?.[0];
  const cashbackPeriod = priceItemToAppend.cashback_period ?? '0';
  const priceCashBackAmount =
    typeof priceItemToAppend.cashback_amount !== 'undefined'
      ? toDineroFromInteger(priceItemToAppend.cashback_amount!)
      : undefined;

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
    ...details,
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
    amount_subtotal: 0,
    amount_total: 0,
    total_details: {
      amount_shipping: 0,
      amount_tax: 0,
      breakdown: {
        taxes: [],
        recurrences: [],
        recurrencesByTax: [],
        cashbacks: [],
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
      ...detailTotals,
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
  _priceItem: PriceItemDto,
  {
    tax: applicableTax,
    quantity,
    priceMapping,
    externalFeeMapping,
    redeemedPromos,
  }: {
    tax?: Tax;
    quantity: number;
    priceMapping?: PriceInputMapping;
    externalFeeMapping?: ExternalFeeMapping;
    redeemedPromos: Array<RedeemedPromo>;
  },
): PriceItem => {
  /**
   * In some circunstances computePriceItem is being called with already computed price items.
   * In this case, we don't want we want to "revert" some of the computations, so they're not applied twice.
   * @todo We should broaden the type of priceItem to include PriceItem and CompositePriceItem
   * in addition to PriceItemDto and CompositePriceItemDto,
   * to cover the scenario in which recomputations are occurring.
   */
  const priceItem = isPriceItemWithCouponApplied(_priceItem)
    ? convertPriceItemWithCouponAppliedToPriceItemDto(_priceItem)
    : _priceItem;

  const price = priceItem._price;
  const currency = (price?.unit_amount_currency || DEFAULT_CURRENCY).toUpperCase() as Currency;
  const priceItemDescription = priceItem.description ?? price?.description;

  const priceTax = getPriceTax(applicableTax, price, priceItem.taxes);
  const isTaxInclusive = priceItem.is_tax_inclusive ?? isTaxInclusivePrice(price);

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
        isUsingPriceMappingToSelectTier,
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
        isUsingPriceMappingToSelectTier,
        unchangedPriceDisplayInJourneys: priceItem._price?.unchanged_price_display_in_journeys,
      });
      break;
    case PricingModel.dynamicTariff:
      itemValues = computeExternalDynamicTariffValues({
        dynamicTariff: price.dynamic_tariff!,
        currency,
        isTaxInclusive,
        unitAmountMultiplier,
        externalFeeAmountDecimal,
        tax: priceTax,
      });
      break;
    case PricingModel.externalGetAG:
      itemValues = computeExternalGetAGItemValues({
        getAg: price.get_ag!,
        currency,
        isTaxInclusive,
        unitAmountMultiplier,
        userInput: quantityToSelectTier,
        externalFeeAmountDecimal,
        tax: priceTax,
      });
      break;
    case PricingModel.perUnit:
    default:
      itemValues = computePerUnitPriceItemValues({
        unitAmountDecimal: priceItem.unit_amount_decimal || price?.unit_amount_decimal || '0',
        currency,
        isTaxInclusive,
        unitAmountMultiplier,
        tax: priceTax,
      });
  }

  const redeemedPromoCouponIds = redeemedPromos.flatMap(({ coupons }) => coupons?.map(({ _id }) => _id));

  const coupons = priceItem._coupons
    ?.filter(isValidCoupon)
    .filter((coupon) => (coupon.requires_promo_code ? redeemedPromoCouponIds.includes(coupon._id) : true))
    .sort(getCouponOrder);

  /* Only apply the first coupon */
  const appliedCoupons = coupons?.slice(0, 1);

  const [coupon] = appliedCoupons ?? [];

  if (coupon) {
    const multiplier =
      price?.pricing_model === PricingModel.tieredFlatFee || price?.pricing_model === PricingModel.tieredGraduated
        ? safeQuantity
        : unitAmountMultiplier;

    itemValues = applyDiscounts(itemValues, {
      priceItem,
      currency,
      isTaxInclusive,
      unitAmountMultiplier: multiplier,
      tax: priceTax,
      coupon,
    });
  }

  /* If there's a coupon cashback period output it */
  const cashbackPeriod = coupon?.cashback_period;

  return {
    ...priceItem,
    ...itemValues,
    ...(appliedCoupons && { _coupons: appliedCoupons }),
    currency,
    ...(priceItemDescription && { description: priceItemDescription }),
    ...(Number.isInteger(itemValues.cashback_amount) && { cashback_period: cashbackPeriod ?? '0' }),
    taxes: [
      {
        ...(priceTax ? { tax: priceTax } : { rate: 'nontaxable', rateValue: 0 }),
        amount: itemValues.amount_tax,
      },
    ],
    ...(priceItem._product && { _product: mapToProductSnapshot(priceItem._product) }),
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
    unit_amount_decimal: toDineroFromInteger(priceItem.unit_amount).toUnit().toString(),
  }),
  ...(typeof priceItem.before_discount_unit_amount === 'number' && {
    before_discount_unit_amount: toDineroFromInteger(priceItem.before_discount_unit_amount)
      .convertPrecision(precision)
      .getAmount(),
    before_discount_unit_amount_decimal: toDineroFromInteger(priceItem.before_discount_unit_amount).toUnit().toString(),
  }),
  ...(typeof priceItem.before_discount_unit_amount_gross === 'number' && {
    before_discount_unit_amount_gross: toDineroFromInteger(priceItem.before_discount_unit_amount_gross)
      .convertPrecision(precision)
      .getAmount(),
    before_discount_unit_amount_gross_decimal: toDineroFromInteger(priceItem.before_discount_unit_amount_gross)
      .toUnit()
      .toString(),
  }),
  ...(typeof priceItem.before_discount_unit_amount_net === 'number' && {
    before_discount_unit_amount_net: toDineroFromInteger(priceItem.before_discount_unit_amount_net)
      .convertPrecision(precision)
      .getAmount(),
    before_discount_unit_amount_net_decimal: toDineroFromInteger(priceItem.before_discount_unit_amount_net)
      .toUnit()
      .toString(),
  }),
  ...(typeof priceItem.unit_discount_amount === 'number' && {
    unit_discount_amount: toDineroFromInteger(priceItem.unit_discount_amount).convertPrecision(precision).getAmount(),
    unit_discount_amount_decimal: toDineroFromInteger(priceItem.unit_discount_amount).toUnit().toString(),
  }),
  ...(typeof priceItem.unit_amount_net === 'number' && {
    unit_amount_net: toDineroFromInteger(priceItem.unit_amount_net).convertPrecision(precision).getAmount(),
    unit_amount_net_decimal: toDineroFromInteger(priceItem.unit_amount_net).toUnit().toString(),
  }),
  ...(typeof priceItem.unit_discount_amount_net === 'number' && {
    unit_discount_amount_net: toDineroFromInteger(priceItem.unit_discount_amount_net)
      .convertPrecision(precision)
      .getAmount(),
    unit_discount_amount_net_decimal: toDineroFromInteger(priceItem.unit_discount_amount_net).toUnit().toString(),
  }),
  ...(typeof priceItem.unit_amount_gross === 'number' && {
    unit_amount_gross: toDineroFromInteger(priceItem.unit_amount_gross).convertPrecision(precision).getAmount(),
    unit_amount_gross_decimal: toDineroFromInteger(priceItem.unit_amount_gross).toUnit().toString(),
  }),
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
  ...(typeof priceItem.discount_amount_net === 'number' && {
    discount_amount_net: toDineroFromInteger(priceItem.discount_amount_net).convertPrecision(precision).getAmount(),
    discount_amount_net_decimal: toDineroFromInteger(priceItem.discount_amount_net).toUnit().toString(),
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
      /**
       * @todo Also output the decimal values
       */
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
  ...(priceItem.dynamic_tariff &&
    (priceItem.pricing_model === PricingModel.dynamicTariff ||
      priceItem._price?.pricing_model === PricingModel.dynamicTariff) && {
      dynamic_tariff: {
        ...priceItem.dynamic_tariff,
        unit_amount_net: priceItem.dynamic_tariff.unit_amount_net
          ? toDineroFromInteger(priceItem.dynamic_tariff.unit_amount_net).convertPrecision(precision).getAmount()
          : undefined,
        unit_amount_gross: priceItem.dynamic_tariff.unit_amount_gross
          ? toDineroFromInteger(priceItem.dynamic_tariff.unit_amount_gross).convertPrecision(precision).getAmount()
          : undefined,
        unit_amount_net_decimal: priceItem.dynamic_tariff.unit_amount_net
          ? toDineroFromInteger(priceItem.dynamic_tariff.unit_amount_net).toUnit().toString()
          : undefined,
        unit_amount_gross_decimal: priceItem.dynamic_tariff.unit_amount_gross
          ? toDineroFromInteger(priceItem.dynamic_tariff.unit_amount_gross).toUnit().toString()
          : undefined,
        markup_amount_net: priceItem.dynamic_tariff.markup_amount_net
          ? toDineroFromInteger(priceItem.dynamic_tariff.markup_amount_net).convertPrecision(precision).getAmount()
          : undefined,
        markup_amount_net_decimal: priceItem.dynamic_tariff.markup_amount_net
          ? toDineroFromInteger(priceItem.dynamic_tariff.markup_amount_net).toUnit().toString()
          : undefined,
        markup_amount_gross: priceItem.dynamic_tariff.markup_amount_gross
          ? toDineroFromInteger(priceItem.dynamic_tariff.markup_amount_gross).convertPrecision(precision).getAmount()
          : undefined,
        markup_amount_gross_decimal: priceItem.dynamic_tariff.markup_amount_gross
          ? toDineroFromInteger(priceItem.dynamic_tariff.markup_amount_gross).toUnit().toString()
          : undefined,
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
            ...(Number.isInteger(recurrence.unit_amount_net) && {
              unit_amount_net: toDineroFromInteger(recurrence.unit_amount_net!).convertPrecision(precision).getAmount(),
            }),
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
            ...(typeof recurrence.after_cashback_amount_total === 'number' &&
              Number.isInteger(recurrence.after_cashback_amount_total) && {
                after_cashback_amount_total: toDineroFromInteger(recurrence.after_cashback_amount_total)
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
  const existingPriceTax = Array.isArray(price?.tax) && price!.tax[0];

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
      : !isDisplayModeRequiringApproval(priceItem) || Boolean(priceItem.on_request_approved);
  } else if (parentPriceItem) {
    return (
      priceItem._price?.price_display_in_journeys !== 'show_as_on_request' ||
      Boolean(parentPriceItem.on_request_approved)
    );
  } else {
    return !isDisplayModeRequiringApproval(priceItem) || Boolean(priceItem.on_request_approved);
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
      return Boolean(parentPriceItem.on_request_approved);
    }

    return true;
  }

  return Boolean(priceDisplayInJourneys !== 'show_as_on_request' || priceItem.on_request_approved);
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
  const safeQuantity = getSafeQuantity(quantity);
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
        const recurrence = component._price?.type === 'recurring' ? component._price.billing_period : component.type;

        if (recurrence !== undefined) {
          recurrences[recurrence] =
            recurrences[recurrence] || component._price?.price_display_in_journeys === 'estimated_price';
        }
      });
    } else {
      const recurrence = lineItem._price?.type === 'recurring' ? lineItem._price.billing_period : lineItem._price?.type;

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
