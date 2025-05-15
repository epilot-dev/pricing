import { Currency } from 'dinero.js';

import { formatPriceUnit } from '../money/formatters';
import { getRecurrencesWithEstimatedPrices } from '../computations/getRecurrencesWithEstimatedPrices';
import { PricingModel } from '../prices/constants';

import { OrderTableData, RecurrenceByBillingPeriod } from './types';
import {
  computeRecurrenceAmounts,
  EMPTY_VALUE_PLACEHOLDER,
  fillPostSpaces,
  getDisplayUnit,
  getFormattedTieredDetails,
  getHiddenAmountString,
  getPriceDisplayInJourneys,
  getQuantity,
  getRecurrenceInterval,
  getSafeAmount,
  getTaxRate,
  getUnitAmount,
  isCompositePrice,
  processExternalFeesMetadata,
  processRecurrences,
  processTaxRecurrences,
  safeFormatAmount,
  unitAmountApproved,
  withValidLineItem,
} from './utils';
import type {
  I18n,
  Order,
  CompositePriceItem,
  Coupon,
  PriceItem,
  PriceItems,
  Product,
  RecurrenceAmount,
  RecurrenceAmountWithTax,
  RedeemedPromo,
  BillingPeriod,
} from '../types';
import { RECURRENCE_ORDERING } from './constants';

export const processOrderTableData = (order: Order, i18n: I18n) => {
  const data = {
    ...order,
    total_details: order.total_details as OrderTableData['total_details'],
  } as OrderTableData;
  /* Utility to avoid having to call safeFormatAmount and pass extensive options object */
  const formatAmount = (amount: number) =>
    safeFormatAmount({ amount, currency: data.currency as Currency, locale: i18n.language });

  if (data.total_details) {
    /* Create item for each cashback period */
    const cashbacks: Array<Record<string, any>> | undefined = data.total_details.breakdown?.cashbacks;

    data.total_details.cashbacks = cashbacks?.map((cashback) => {
      const period = i18n.t(`table_order.cashback_period.${cashback.cashback_period}`, 'immediately');

      const amount = formatAmount(cashback.amount_total ?? 0);

      const name = i18n.t('table_order.cashback', {
        value: '',
        cashbackPeriodLabel: '',
        redeemedPromo: '',
      });

      return { name, period, amount };
    });
  }

  /* Create item for each recurrence */
  /**
   * @todo Type RecurrenceAmount is missing amount_tax_decimal in spec
   */
  const recurrences = data.total_details?.breakdown?.recurrences;
  const estimatedIntervals = getRecurrencesWithEstimatedPrices(data.line_items);

  if (recurrences?.length) {
    const sortedRecurrences = RECURRENCE_ORDERING.map((interval) =>
      recurrences.find(
        ({ type, billing_period }) => type == interval || (type === 'recurring' && billing_period === interval),
      ),
    ).filter(Boolean);

    data.total_details.breakdown.recurrences = sortedRecurrences as RecurrenceAmount[];
    data.total_details.recurrences = [];
    data.total_details.recurrencesByTax = {};

    // build prices based on billing period for custom variables
    for (const value of sortedRecurrences) {
      const recurrence = value || ({} as RecurrenceAmount);
      /**
       * @todo Instead of mutating recurrence,
       * just compute properties when constructing recurrenceByBillingPeriodTotal
       * Should double check that doing so doesn't break anything
       */
      Object.assign(
        recurrence,
        computeRecurrenceAmounts(recurrence, { currency: data.currency as Currency, locale: i18n.language }),
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
          ? (`${i18n.t('table_order.estimated', {
              interval: i18n.t(`table_order.recurrences.billing_period.${interval}`),
            })}` as BillingPeriod)
          : (`${i18n.t(`table_order.recurrences.billing_period.${interval}`)}` as BillingPeriod),
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
        type: recurrence.type || 'one_time',
      } as RecurrenceByBillingPeriod;

      // This is required for some customers custom variables. Do not remove.
      data.total_details[interval] = recurrenceByBillingPeriodTotal as RecurrenceAmount;

      /* If recurrence has a discount associated, push another line containing the discount details */
      if ('discount_amount' in recurrence && typeof recurrence.discount_amount === 'number') {
        data.total_details.recurrences.push({
          is_discount_recurrence: true,
          amount_total: formatAmount(-recurrence.discount_amount) as string,
        } as RecurrenceByBillingPeriod);
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
            computeRecurrenceAmounts(recurrenceByTax, { currency: data.currency as Currency, locale: i18n.language }),
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
          const index = `${getRecurrenceInterval(
            recurrenceByTax as Pick<RecurrenceAmount, 'billing_period' | 'type'>,
          )}-${recurrenceByTax.tax}`;
          data.total_details.recurrencesByTax[index] = recurrenceByTax as unknown as RecurrenceAmountWithTax;
        });

        data.total_details.recurrences.push({
          ...recurrenceByBillingPeriodTotal,
          recurrencesByTax: recurrencesByBillingPeriodWithTaxes as unknown as RecurrenceAmountWithTax,
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
    const flattenLineItems = (
      data.line_items as Array<(PriceItem | CompositePriceItem) & { _position: string }>
    ).flatMap<PriceItems[number]>((item, itemIndex) => {
      const parentPosition = itemIndex + 1;
      item._position = fillPostSpaces(`${parentPosition}.`, 4);
      if (!isCompositePrice(item) && Array.isArray(item.tiers_details)) {
        item.tiers_details = (item.tiers_details as Array<any>).map((tierDetail, tierDetailIndex) => ({
          ...tierDetail,
          _position: fillPostSpaces(`${parentPosition}.${tierDetailIndex + 1}.`, 6),
        }));
      }

      let componentItems = [] as any;

      if (isCompositePrice(item)) {
        item.is_composite_price = true;
        if (Array.isArray(item.item_components)) {
          const clonedItem = clone(item);
          componentItems = (
            item.item_components as Array<
              PriceItem & { _position: string; is_composite_component: boolean; parent_item: CompositePriceItem }
            >
          ).flatMap((component, componentIndex) => {
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

            const couponItems = ((component._coupons as Array<Coupon> | undefined) ?? [])?.map<
              PriceItem & { coupon: Coupon }
            >((coupon) => ({ ...component, coupon }));

            return [component, ...couponItems];
          });
        }
      }

      const couponItems = ((item._coupons as Array<Coupon> | undefined) ?? [])?.map<PriceItem & { coupon: Coupon }>(
        (coupon) =>
          ({
            ...item,
            coupon,
          }) as any,
      );

      return [item, ...componentItems, ...couponItems];
    });

    /**
     * @todo Type flattenLineItems correctly to enable correct computation of products below
     */
    const lineItems = flattenLineItems.filter(Boolean) as any[];
    data.line_items = lineItems;

    const products = lineItems.map<Product>((item) => {
      /* If an item refers to a coupons, we want it to render the discount amounts */
      const isCoupon = Boolean(item.coupon);
      const isDiscountCoupon = item.coupon?.category === 'discount';
      const isCashbackCoupon = item.coupon?.category === 'cashback';
      /* If an item contains coupons, we want it to render the before discount amounts */
      const isItemContainingDiscountCoupon =
        !isCoupon && Boolean(item._coupons?.filter((coupon: Coupon) => coupon?.category === 'discount').length);

      const redeemedPromoCode: RedeemedPromo | undefined = data?.redeemed_promos?.find((promo: RedeemedPromo) =>
        promo.coupons.some((c) => c._id === item.coupon?._id),
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
        amountTotal = -((item as PriceItem).cashback_amount ?? 0);
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

          amountTotalFormatted = '';
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
      if (item._price?.variable_price) {
        const itemPriceMapping = (item.parent_item ?? item).price_mappings?.find(
          (mapping: { price_id: string }) => mapping.price_id === item.price_id,
        );
        if (item._price?.type !== 'one_time') {
          item.quantity_billing_period = itemPriceMapping?.frequency_unit
            ? i18n.t('table_order.recurrences.billing_period.' + itemPriceMapping?.frequency_unit)
            : '';
        }
      }

      // Remove unnecessary data
      delete item._product?.price_options;
      delete item._product?.product_images;
      delete item._product?._availability_files;
      delete item.item_components;

      const quantityDisplayValue = !isCoupon ? getQuantity(item, item.parent_item) : undefined;

      const unitAmountDisplayValue = isUnitAmountApproved ? originalUnitAmountFormatted : item.unit_amount;
      const unitAmountNetDisplayValue = isUnitAmountApproved ? originalUnitAmountNetFormatted : item.unit_amount_net;
      delete item.parent_item;

      // build custom variable
      const unit = formatPriceUnit(item._price?.unit, true);
      const tiersDetails = getFormattedTieredDetails(item.tiers_details, item, isUnitAmountApproved, i18n.language);

      if (item._price?.billing_period) {
        item._price.billing_period = i18n.t(
          'table_order.recurrences.billing_period.' + item._price?.billing_period,
          item._price?.billing_period,
        );
      }

      if (item.external_fees_metadata) {
        const unit =
          isCompositePrice(item) && Array.isArray(item._price?.price_components)
            ? item._price?.price_components.find((component) => component.variable_price && component.unit)?.unit
            : item._price?.unit;

        item.external_fees_metadata = processExternalFeesMetadata(
          item.external_fees_metadata,
          item.currency,
          i18n,
          unit,
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
        ...(tiersDetails && { tiers_details: tiersDetails }),
        price: {
          type: item._price?.type,
          description: item.is_composite_component
            ? (item.description ?? item._price?.description)
            : item._price?.description,
          long_description: item._price?.long_description,
          unit_amount: unitAmountDisplayValue || '',
          unit_amount_net: unitAmountNetDisplayValue || '',
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
            item._price?.type === 'recurring'
              ? item._price?.billing_period
              : i18n.t(`table_order.recurrences.billing_period.${item._price?.type}`),
          quantity: quantityDisplayValue,
          quantity_billing_period: item.quantity_billing_period,
          unit: unit,
          display_unit: getDisplayUnit(item),
          is_tiered_price:
            item._price?.pricing_model === PricingModel.tieredVolume ||
            item._price?.pricing_model === PricingModel.tieredGraduated ||
            item._price?.pricing_model === PricingModel.tieredFlatFee,
        },
        ...item._product,
        name: isCoupon ? item.coupon.name : item._product?.name || item.description,
        description: isCoupon
          ? getFormattedCouponDescription(item.coupon, i18n, redeemedPromoCode)
          : (item._product?.description ?? item.description),
        is_composite_price: item.is_composite_price,
        is_composite_component: item.is_composite_component,
        type: i18n.t(item._product?.type),
      };
    });

    /**
     * @HACK To support orders with products and prices attributes hydrated and also renamed to _products and _prices,
     * due to a bad design decision by sunwheel.
     *
     * Keep `products` and `prices` attribute values when present:
     * - For some reason, sunwheel removed/overwrote them, but these attributes when specified on an entity are needed and should NOT be overwritten.
     * - I'm prefixing them with an underscore to avoid conflicts with overwriter attributes (under use).
     *
     * Better approach: when we augment entities with extra data, we should place them under a proper namespace.
     * Such as `$computed.products` and `$computed.prices`.
     *
     * Additionally, I need to hydrate these relation attributes to be able to use them in the template.
     * I could hydrate them on the template root, but I wouldn't know what would break bcoz of that. Many parts of the code depend on
     * non hydrated entities `$relation`. Since the code seems to hydrate manually through some sort of cache.
     *
     * @author Pinho
     */
    // const [hydratedProducts = [], hydratedPrices = []] = await Promise.all([
    //   hydrateRelation(c, 'product', data.products),
    //   hydrateRelation(c, 'price', data.prices),
    // ]);

    /**
     * Hydrate cross sellable products
     * usecase: #meerbusch-poc-taskforce
     */
    // const hydratedProductsWithCrossSell = await hydrateCrossSellableProducts(c, hydratedProducts as Product[]);

    /**
     * TODO: we should come up with a v3 in which we drop support for these.
     */
    // data._products = hydratedProductsWithCrossSell;
    // data._prices = hydratedPrices;

    /**
     * From v1 onwards we make relation attributes available using the syntax of $<schema-name>.
     *
     * Since the process-order-table/order table transformer is destructive on the products and prices attributes,
     * we need to compute these $relation attributes here in an harded-code way.
     */
    // if (Array.isArray(hydratedProductsWithCrossSell) && hydratedProductsWithCrossSell.length) {
    //   data.$product = hydratedProductsWithCrossSell.filter(Boolean).map(
    //     /* Omit unecessary keys */
    //     ({ _acl, _relations, product_images, product_downloads, workflows, $relation, ...partialProduct }: Product) =>
    //       partialProduct,
    //   );
    // }

    // if (Array.isArray(hydratedPrices) && hydratedPrices.length) {
    //   data.$price = (hydratedPrices as unknown[] as Price[]).filter(Boolean).map((price) => {
    //     const { _acl, _relations, workflows, $relation, ...partialPrice } = price;

    //     return partialPrice;
    //   });
    // }

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
      }) as never;
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

  const redeemedPromoString = redeemedPromo?.code ? `(${redeemedPromo})` : null;

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

/**
 * @todo Use structuredClone
 */
const clone = <T>(item: T): T => {
  if (!item) {
    return item;
  }

  return JSON.parse(JSON.stringify(item));
};
