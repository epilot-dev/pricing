import type { Currency } from 'dinero.js';
import { formatPriceUnit } from '../money/formatters';
import { PricingModel } from '../prices/constants';
import { getRecurrencesWithEstimatedPrices } from '../prices/get-recurrences-with-estimated-prices';
import { isCompositePrice } from '../prices/utils';
import { isTruthy } from '../shared/is-truthy';
import type {
  I18n,
  CompositePriceItem,
  Coupon,
  PriceItem,
  PriceItems,
  Product,
  RecurrenceAmount,
  RecurrenceAmountWithTax,
  RedeemedPromo,
  Price,
} from '../shared/types';
import { RECURRENCE_ORDERING } from './constants';
import { processExternalFeesDetails } from './getag/details';
import {
  clone,
  computeRecurrenceAmounts,
  EMPTY_VALUE_PLACEHOLDER,
  fillPostSpaces,
  getCouponItems,
  getDisplayUnit,
  getFormattedTieredDetails,
  getHiddenAmountString,
  getPriceDisplayInJourneys,
  getQuantity,
  getRecurrenceInterval,
  getSafeAmount,
  getTaxRate,
  getUnitAmount,
  processRecurrences,
  processTaxRecurrences,
  safeFormatAmount,
  unitAmountApproved,
  withValidLineItem,
} from './utils';

export const processOrderTableData = (data: any, i18n: I18n) => {
  /* Utility to avoid having to call safeFormatAmount and pass extensive options object */
  const formatAmount = (amount: number) =>
    safeFormatAmount({ amount, currency: data.currency as Currency, locale: i18n.language });

  if (data.total_details) {
    /* Create item for each cashback period */
    const cashbacks: Array<Record<string, any>> | undefined = data.total_details.breakdown?.cashbacks;

    data.total_details.cashbacks = cashbacks?.map((cashback) => {
      const period = i18n.t(`table_order.cashback_period.${cashback.cashback_period}`, 'immediately');

      const name = i18n.t('table_order.cashback', {
        value: '',
        redeemedPromo: '',
        cashbackPeriodLabel: '',
      });

      const amount = formatAmount(cashback.amount_total ?? 0);

      return { name, period, amount };
    });
  }

  /* Create item for each recurrence */
  /**
   * @todo Type RecurrenceAmount is missing amount_tax_decimal in spec
   */
  const recurrences: Array<RecurrenceAmount & { amount_tax_decimal?: string }> | undefined =
    data.total_details?.breakdown?.recurrences;
  const estimatedIntervals = getRecurrencesWithEstimatedPrices(data.line_items);

  if (recurrences?.length) {
    const sortedRecurrences = RECURRENCE_ORDERING.map((interval) =>
      recurrences.find(
        ({ type, billing_period }) => type == interval || (type === 'recurring' && billing_period === interval),
      ),
    ).filter(isTruthy);

    data.total_details.breakdown.recurrences = sortedRecurrences;
    data.total_details.recurrences = [];
    data.total_details.recurrencesByTax = {};

    // build prices based on billing period for custom variables
    for (const recurrence of sortedRecurrences) {
      /**
       * @todo Instead of mutating recurrence,
       * just compute properties when constructing recurrenceByBillingPeriodTotal
       * Should double check that doing so doesn't break anything
       */
      Object.assign(
        recurrence,
        computeRecurrenceAmounts(recurrence, { currency: data.currency, locale: i18n.language }),
      );

      const recurrencesByTax =
        (data.total_details.breakdown.recurrencesByTax as Array<RecurrenceAmountWithTax> | undefined)?.filter?.(
          (recurrenceByTax) =>
            recurrenceByTax.type === recurrence.type && recurrenceByTax.billing_period === recurrence.billing_period,
        ) ?? [];

      const shouldShowDetailedRecurrence = recurrencesByTax.length > 1;

      const interval = getRecurrenceInterval(recurrence);

      const recurrenceByBillingPeriodTotal = {
        ...(shouldShowDetailedRecurrence && { totalLabel: i18n.t('table_order.gross_total') }),
        billing_period: estimatedIntervals[interval]
          ? `${i18n.t('table_order.estimated', {
              interval: i18n.t(`table_order.recurrences.billing_period.${interval}`),
            })}`
          : `${i18n.t(`table_order.recurrences.billing_period.${interval}`)}`,
        /**
         * @todo Instead of setting every property just spread the recurrence object
         */
        amount_total: recurrence.amount_total,
        amount_total_decimal: recurrence.amount_total_decimal,
        amount_subtotal: recurrence.amount_subtotal,
        amount_subtotal_decimal: recurrence.amount_subtotal_decimal,
        amount_tax: recurrence.amount_tax,
        amount_tax_decimal: recurrence.amount_tax_decimal,
        full_amount_tax: i18n.t('table_order.incl_vat').replace('!!amount!!', (recurrence.amount_tax || '').toString()),
        type: recurrence.type,
      };

      // This is required for some customers custom variables. Do not remove.
      data.total_details[interval] = recurrenceByBillingPeriodTotal;

      /* If recurrence has a discount associated, push another line containing the discount details */
      if ('discount_amount' in recurrence && typeof recurrence.discount_amount === 'number') {
        data.total_details.recurrences.push({
          is_discount_recurrence: true,
          amount_total: formatAmount(-recurrence.discount_amount),
        });
      }

      if (shouldShowDetailedRecurrence && recurrencesByTax.length) {
        for (const recurrenceByTax of recurrencesByTax) {
          /**
           * @todo Instead of mutating recurrence,
           * just compute properties when mapping over recurrencesByTax
           * Should double check that doing so doesn't break anything
           */
          Object.assign(
            recurrenceByTax,
            computeRecurrenceAmounts(recurrenceByTax, { currency: data.currency, locale: i18n.language }),
          );
        }
        const recurrencesByBillingPeriodWithTaxes = recurrencesByTax.map((recurrenceByTax) => ({
          ...recurrenceByTax,
          full_amount_tax: i18n.t('table_order.incl_vat').replace('!!amount!!', `${recurrenceByTax.amount_tax}`),
          billing_period: i18n.t(`table_order.recurrences.billing_period.${getRecurrenceInterval(recurrenceByTax)}`),
          tax: recurrenceByTax.tax?.tax?.rate ? `${recurrenceByTax.tax?.tax?.rate}%` : i18n.t('table_order.no_tax'),
        }));

        // This is required for some customers custom variables. Do not remove.
        recurrencesByBillingPeriodWithTaxes.forEach((recurrenceByTax) => {
          data.total_details.recurrencesByTax[
            `${getRecurrenceInterval(recurrenceByTax as Pick<RecurrenceAmount, 'billing_period' | 'type'>)}-${
              recurrenceByTax.tax
            }`
          ] = recurrenceByTax;
        });
        data.total_details.recurrences.push({
          ...recurrenceByBillingPeriodTotal,
          recurrencesByTax: recurrencesByBillingPeriodWithTaxes,
        });
      } else {
        data.total_details.recurrences.push(recurrenceByBillingPeriodTotal);
      }
    }
  }

  if (Array.isArray(data.line_items)) {
    const filteredValidLineItems = data.line_items.filter(withValidLineItem);

    if (!filteredValidLineItems.length) {
      return data;
    }

    data.line_items = filteredValidLineItems;

    /**
     * Line items arrive with 1 price per line, regardless of whether they're simple or composite.
     * We need to "unwrap" price components into individual line items.
     */
    const flattenLineItems = (data.line_items as Array<any>).flatMap<PriceItems[number]>((item, itemIndex) => {
      const parentPosition = itemIndex + 1;
      item._position = fillPostSpaces(`${parentPosition}.`, 4);
      if (Array.isArray(item.tiers_details)) {
        item.tiers_details = (item.tiers_details as Array<any>).map((tierDetail, tierDetailIndex) => ({
          ...tierDetail,
          _position: fillPostSpaces(`${parentPosition}.${tierDetailIndex + 1}.`, 6),
        }));
      }

      let componentItems: any = [];

      if (item.is_composite_price || item._price?.is_composite_price) {
        item.is_composite_price = true;
        if (Array.isArray(item.item_components)) {
          const clonedItem = clone(item);
          componentItems = (item.item_components as Array<any>).flatMap((component, componentIndex) => {
            const childPosition = `${parentPosition}.${componentIndex + 1}`;

            component._position = fillPostSpaces(`${childPosition}.`, 6);
            component.is_composite_component = true;
            component.parent_item = clonedItem;

            if (Array.isArray(component.tiers_details)) {
              component.tiers_details = (component.tiers_details as Array<any>).map((tierDetail, tierDetailIndex) => ({
                ...tierDetail,
                _position: fillPostSpaces(`${childPosition}.${tierDetailIndex + 1}.`, 8),
              }));
            }

            const couponItems = getCouponItems(component);

            return [component, ...couponItems];
          });
        }
      }

      const couponItems = getCouponItems(item);

      return [item, ...couponItems, ...componentItems];
    });

    /**
     * @todo Type flattenLineItems correctly to enable correct computation of products below
     */
    const lineItems = flattenLineItems.filter(isTruthy) as any[];
    data.line_items = lineItems;

    const products = lineItems.map<Product>((item) => {
      /* If an item refers to a coupons, we want it to render the discount amounts */
      const isCoupon = Boolean(item.coupon);
      const couponId = item.coupon?._id;
      const isDiscountCoupon = item.coupon?.category === 'discount';
      const isCashbackCoupon = item.coupon?.category === 'cashback';
      /* If an item contains coupons, we want it to render the before discount amounts */
      const isItemContainingDiscountCoupon =
        !isCoupon && Boolean(item._coupons?.filter((coupon: Coupon) => coupon?.category === 'discount').length);

      const redeemedPromoCode: RedeemedPromo | undefined = data?.redeemed_promos?.find((promo: RedeemedPromo) =>
        promo.coupons.some((c) => c._id === couponId),
      );

      /**
       * @todo Stop mutating original items
       */
      if (!item.unit_amount_net) {
        const taxDelta = item._price?.tax_behavior !== 'exclusive' ? item.taxes?.[0]?.amount || 0 : 0;
        const unitAmount =
          (typeof item.unit_amount === 'object' ? item.unit_amount?.unit_amount : item.unit_amount) ?? 0;
        item.unit_amount_net = unitAmount - taxDelta;
      }
      const isUnitAmountApproved = unitAmountApproved(item);

      const originalUnitAmountNetFormatted = getUnitAmount(item, i18n, {
        isUnitAmountApproved,
        useUnitAmountNet: true,
        isDiscountCoupon,
        isCashbackCoupon,
        isItemContainingDiscountCoupon,
      });
      const originalUnitAmountFormatted = getUnitAmount(item, i18n, {
        isUnitAmountApproved,
        useUnitAmountNet: false,
        isDiscountCoupon,
        isCashbackCoupon,
        isItemContainingDiscountCoupon,
      });

      let unitAmountNetFormatted = originalUnitAmountNetFormatted;
      let unitAmountFormatted = originalUnitAmountFormatted;

      const unitAmountSubtotal = isCoupon ? undefined : item.amount_subtotal || 0;

      let amountTax;

      if (isItemContainingDiscountCoupon) {
        amountTax = (item as PriceItem).before_discount_tax_amount ?? 0;
      } else if (isDiscountCoupon) {
        amountTax = -((item as PriceItem).tax_discount_amount ?? 0);
      } else if (isCashbackCoupon) {
        amountTax = 0;
      } else {
        amountTax = (item as PriceItem).amount_tax ?? 0;
      }

      let amountTotal;

      if (isItemContainingDiscountCoupon) {
        amountTotal = (item as PriceItem).before_discount_amount_total ?? 0;
      } else if (isDiscountCoupon) {
        amountTotal = -((item as PriceItem).discount_amount ?? 0);
      } else if (isCashbackCoupon) {
        if (isCompositePrice(item)) {
          // for composite prices we can have multiple cashback coupons
          // we need to find the one that belongs to the item of the current coupon product item
          amountTotal = -(
            (item as CompositePriceItem)._coupons?.find((coupon: Coupon) => coupon._id === couponId)?.cashback_amount ??
            0
          );
        } else {
          amountTotal = -((item as PriceItem).cashback_amount ?? 0);
        }
      } else {
        amountTotal = (item as PriceItem).amount_total ?? 0;
      }

      let unitAmountSubtotalFormatted = safeFormatAmount({
        amount: unitAmountSubtotal,
        currency: item.currency,
        locale: i18n.language,
      });

      let amountTaxFormatted = safeFormatAmount({
        amount: amountTax,
        currency: item.currency,
        locale: i18n.language,
      });

      let amountTotalFormatted = safeFormatAmount({
        amount: amountTotal,
        currency: item.currency,
        locale: i18n.language,
      });

      if (!isUnitAmountApproved || item.is_composite_price) {
        // Format total tax
        if (item.total_details) {
          item.total_details.amount_tax = safeFormatAmount({
            amount: item.total_details.amount_tax || 0,
            currency: item.currency,
            locale: i18n.language,
          });
        }

        // Format recurrence taxes
        if (Array.isArray(item.total_details?.breakdown?.taxes)) {
          item.total_details.breakdown.taxes = processTaxRecurrences(item, i18n);
        }
      }

      let recurrences;

      const displayInJourneys = getPriceDisplayInJourneys(item);

      /* Format amounts depending on whether they're approved and price is or not composite */
      if (isUnitAmountApproved || isCoupon) {
        let unitAmountDecimal = getSafeAmount(item.unit_amount?.unit_amount_decimal);
        const unitAmountDecimalAlternative = getSafeAmount(item.unit_amount_decimal);
        if (unitAmountDecimalAlternative) {
          unitAmountDecimal = unitAmountDecimalAlternative;
        }
        item.unit_amount_decimal = unitAmountDecimal;

        item.tiered_unit_amount_decimal = getSafeAmount(item._price?.tiers?.[0]?.unit_amount_decimal);

        item.tiered_flat_fee_amount_decimal = getSafeAmount(item._price?.tiers?.[0]?.flat_fee_amount_decimal);

        // Composite product
        if (item.is_composite_price) {
          if (Array.isArray(item.total_details?.breakdown?.recurrences)) {
            recurrences = processRecurrences(item, data as { currency?: Currency }, i18n);
          }

          if (!isCashbackCoupon) {
            amountTotalFormatted = '';
          }

          unitAmountNetFormatted = '';
          unitAmountFormatted = '';
          unitAmountSubtotalFormatted = '';
          amountTaxFormatted = '';
        }
      } else {
        if (Array.isArray(item.total_details?.breakdown?.recurrences) && displayInJourneys !== 'show_as_on_request') {
          const prefix = i18n.t(displayInJourneys!, EMPTY_VALUE_PLACEHOLDER);
          recurrences = processRecurrences(item, data as { currency?: Currency }, i18n, prefix);
        }

        unitAmountNetFormatted = getHiddenAmountString(i18n.t, displayInJourneys, unitAmountNetFormatted);
        unitAmountFormatted = getHiddenAmountString(i18n.t, displayInJourneys, unitAmountFormatted);
        unitAmountSubtotalFormatted = getHiddenAmountString(i18n.t, displayInJourneys, unitAmountSubtotalFormatted);
        amountTaxFormatted = getHiddenAmountString(i18n.t, displayInJourneys, amountTaxFormatted);
        amountTotalFormatted = getHiddenAmountString(i18n.t, displayInJourneys, amountTotalFormatted);
      }

      if (recurrences) {
        item.total_details.breakdown.recurrences = recurrences;
      }

      item.unit_amount_net = unitAmountNetFormatted;
      item.unit_amount = unitAmountFormatted;
      item.amount_subtotal = unitAmountSubtotalFormatted;
      item.amount_tax = amountTaxFormatted;
      item.amount_total = amountTotalFormatted;

      /**
       * Process Quantity data
       */
      if (item._price?.variable_price && !isCoupon) {
        const itemPriceMapping = (item.parent_item ?? item).price_mappings?.find(
          (mapping: any) => mapping.price_id === item.price_id,
        );
        if ((item.type && item.type !== 'one_time') || item._price?.type !== 'one_time') {
          item.quantity_billing_period = itemPriceMapping?.frequency_unit
            ? i18n.t('table_order.recurrences.billing_period.' + itemPriceMapping?.frequency_unit)
            : '';
        }
      }

      if (item.external_fees_metadata) {
        const unit =
          isCompositePrice(item) && Array.isArray(item._price?.price_components)
            ? item._price?.price_components.find((component: Price) => component.variable_price && component.unit)?.unit
            : item._price?.unit;

        item.external_fees_details = processExternalFeesDetails(
          item,
          item.external_fees_metadata,
          item.currency,
          i18n,
          unit,
        );
      }

      // Remove unnecessary data
      delete item._product?.price_options;
      delete item._product?._availability_files;
      delete item.item_components;

      const quantityDisplayValue = !isCoupon ? getQuantity(item, item.parent_item) : undefined;

      const unitAmountDisplayValue = isUnitAmountApproved ? originalUnitAmountFormatted : item.unit_amount;
      const unitAmountNetDisplayValue = isUnitAmountApproved ? originalUnitAmountNetFormatted : item.unit_amount_net;
      delete item.parent_item;

      // build custom variable
      const unit = formatPriceUnit(item._price?.unit, true);
      const tiersDetails = getFormattedTieredDetails(item.tiers_details, item, isUnitAmountApproved, i18n.language);

      if (item?.billing_period || item._price?.billing_period) {
        item.billing_period = i18n.t(
          'table_order.recurrences.billing_period.' + (item?.billing_period || item._price?.billing_period),
          item?.billing_period || item._price?.billing_period,
        );
      }

      const {
        _price,
        _product,
        item_components,
        parent_item,
        tiers_details,
        /* Not all item properties need to be included in product */
        ...baseProduct
      } = item;

      return {
        ...baseProduct,
        ...(tiersDetails && tiersDetails.length > 1 && { tiers_details: tiersDetails }),
        product_images: item._product?.product_images,
        price: {
          type: isCashbackCoupon ? 'one_time' : item.type || item._price?.type,
          description: item.is_composite_component
            ? (item.description ?? item._price?.description)
            : item._price?.description,
          long_description: item._price?.long_description,
          unit_amount: isCashbackCoupon ? '' : unitAmountDisplayValue || '',
          unit_amount_net: isCashbackCoupon ? '' : unitAmountNetDisplayValue || '',
          amount_subtotal: isUnitAmountApproved
            ? safeFormatAmount({
                amount: item.amount_subtotal || 0,
                currency: item.currency,
                locale: i18n.language,
              })
            : item.amount_subtotal,
          amount_total: isUnitAmountApproved
            ? safeFormatAmount({
                amount: item.amount_total || 0,
                currency: item.currency,
                locale: i18n.language,
              })
            : item.amount_total,
          tax: {
            rate: isUnitAmountApproved ? getTaxRate(item, i18n) : i18n.t('table_order.show_as_on_request'),
            amount: safeFormatAmount({
              amount: item.amount_tax,
              currency: item.currency,
              locale: i18n.language,
            }),
          },
          tax_rate: !isCoupon ? getTaxRate(item, i18n) : undefined,
          amount_tax: isUnitAmountApproved
            ? safeFormatAmount({
                amount: item.amount_tax,
                currency: item.currency,
                locale: i18n.language,
              })
            : item.amount_tax,
          price_display_in_journeys: i18n.t(item._price?.price_display_in_journeys),
          billing_period:
            item?.type === 'recurring' || item._price?.type === 'recurring'
              ? item?.billing_period
              : i18n.t(`table_order.recurrences.billing_period.${item?.type || item._price?.type}`),
          quantity: quantityDisplayValue,
          quantity_billing_period: item.quantity_billing_period,
          unit: unit,
          display_unit: getDisplayUnit(item),
          is_tiered_price:
            item._price?.pricing_model === PricingModel.tieredVolume ||
            item._price?.pricing_model === PricingModel.tieredGraduated ||
            item._price?.pricing_model === PricingModel.tieredFlatFee,
          ...(tiersDetails && tiersDetails.length === 1 && { ...tiersDetails[0] }),
        },
        ...item._product,
        name: isCoupon ? item.coupon.name : item?.product_name || item._product?.name || item.description,
        description: isCoupon
          ? getFormattedCouponDescription(item.coupon, i18n, redeemedPromoCode)
          : item?.product_description || item._product?.description || item.description,
        is_composite_price: item.is_composite_price,
        is_composite_component: item.is_composite_component,
        type: i18n.t(item._product?.type),
      };
    });

    data.products = products;
    data.product = products?.[0];

    delete data.prices;
    delete data.price;

    data.amount_total = safeFormatAmount({
      amount: data.amount_total || 0,
      currency: data.currency,
      locale: i18n.language,
    });
    data.amount_subtotal = safeFormatAmount({
      amount: data.amount_subtotal || 0,
      currency: data.currency,
      locale: i18n.language,
    });

    if (data.total_details?.amount_tax) {
      data.total_details.amount_tax = safeFormatAmount({
        amount: data.total_details.amount_tax || 0,
        currency: data.currency,
        locale: i18n.language,
      });
    }
  }

  return data;
};

const getFormattedCouponDescription = (
  { type, percentage_value, fixed_value, fixed_value_currency, category, cashback_period }: Coupon,
  i18n: I18n,
  redeemedPromo?: RedeemedPromo,
) => {
  const value =
    type === 'percentage'
      ? formatPercentage(percentage_value!)
      : safeFormatAmount({
          amount: fixed_value!,
          currency: fixed_value_currency as Currency,
          locale: i18n.language,
        });

  const redeemedPromoString = redeemedPromo?.code ? `(${redeemedPromo.code})` : null;

  if (category === 'cashback') {
    const cashbackPeriodLabel = `(${i18n.t(`table_order.cashback_period.${cashback_period ?? '0'}`, 'immediately')})`;

    return i18n.t('table_order.cashback', {
      value,
      redeemedPromo: redeemedPromoString,
      cashbackPeriodLabel,
    });
  } else {
    return i18n.t('table_order.discount', { value, redeemedPromo: redeemedPromoString });
  }
};

const formatPercentage = (formatPercentageValue: number | string) => `${formatPercentageValue}%`;
