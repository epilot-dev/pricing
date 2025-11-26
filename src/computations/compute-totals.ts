import { DEFAULT_CURRENCY } from '../money/constants';
import { toDineroFromInteger } from '../money/to-dinero';
import { isOnRequestUnitAmountApproved } from '../prices/approval';
import {
  convertPriceComponentsPrecision,
  convertPriceItemPrecision,
  convertPricingPrecision,
} from '../prices/convert-precision';
import { getImmutablePriceItem } from '../prices/get-immutable-price-item';
import { getPriceRecurrence, getPriceRecurrenceByTax } from '../prices/get-price-recurrence';
import { isCompositePriceItemDto } from '../prices/utils';
import type {
  RedeemedPromo,
  PriceItemsDto,
  PricingDetails,
  CompositePriceItem,
  PriceItemDto,
  Price,
  PriceItem,
  Tax,
  Currency,
} from '../shared/types';
import { computeCompositePrice } from './compute-composite-price';
import { computeCompositePriceCashbacks } from './compute-composite-price-cashbacks';
import { computePriceItem } from './compute-price-item';
import { computeRecurrenceAfterCashbackAmounts } from './compute-recurrence-after-cashback-amounts';

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

      const itemBreakdown = recomputeDetailTotalsFromCompositePrice(
        undefined,
        compositePriceItemToAppend,
        redeemedPromos,
      );
      const updatedTotals = recomputeDetailTotalsFromCompositePrice(
        details,
        compositePriceItemToAppend,
        redeemedPromos,
      );

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
        priceItem as PriceItem,
        priceItemToAppend?._price?.price_display_in_journeys ?? price?.price_display_in_journeys,
        undefined,
      )
        ? recomputeDetailTotals(details, price, priceItemToAppend as PriceItem)
        : details;

      const newItem = convertPriceItemPrecision(priceItemToAppend as PriceItem, 2);

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
  const recurrence = getPriceRecurrence(
    {
      ...priceItemToAppend,
      type: priceItemToAppend.type ?? price?.type,
      billing_period: priceItemToAppend.billing_period ?? price?.billing_period,
    },
    recurrences,
  );

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
    const type = priceItemToAppend.type ?? price?.type;

    recurrences.push({
      type: type === 'recurring' ? type : 'one_time',
      ...(type === 'recurring' && { billing_period: priceItemToAppend?.billing_period ?? price?.billing_period }),
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
      // If recurrence doesn't have before_discount_amount_total yet, initialize it with current total (before adding this item)
      const initializedExistingTotal =
        existingRecurrenceBeforeDiscountAmountTotal ??
        toDineroFromInteger(recurrence.amount_total).subtract(priceTotal);

      const baseAmount = priceBeforeDiscountAmountTotal || priceTotal;
      const recurrenceBeforeDiscountAmountTotal = initializedExistingTotal.add(baseAmount);
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
    const type = priceItemToAppend.type || price?.type;

    recurrencesByTax.push({
      type: type === 'recurring' ? type : 'one_time',
      ...(type === 'recurring' && { billing_period: recurrence?.billing_period ?? price?.billing_period }),
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
  redeemedPromos: Array<RedeemedPromo> = [],
): PricingDetails & { cashbacksMetadata?: Record<string, unknown> } => {
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

  const isItemBreakdown = !details;

  const totalDetailsComponents = (compositePriceItem.item_components ?? []).reduce((detailTotals, itemComponent) => {
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

  const { pricingDetails: totalDetailsWithCashbacks, ...metadata } = computeCompositePriceCashbacks(
    compositePriceItem,
    totalDetailsComponents,
    redeemedPromos,
  );

  const totalDetails = {
    ...totalDetailsComponents,
    ...totalDetailsWithCashbacks,
    ...(isItemBreakdown && {
      ...metadata,
    }),
  };

  return totalDetails;
};
