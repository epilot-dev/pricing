import { Currency } from 'dinero.js';

import { DEFAULT_CURRENCY } from './currencies';
import { d, toDinero } from './formatters';
import { isCompositePrice, isUnitAmountApproved, convertPriceItemPrecision, recomputeDetailTotals } from './pricing';
import { PriceItemsDto, PricingDetails } from './types';

export function getDiscounts(priceItems: PriceItemsDto): { [key: string]: number } | undefined {
  const discounts = priceItems
    .filter((priceItem) => priceItem._price?.unit_amount < 0)
    .reduce((discountsPerRecurrency: { [key: string]: number }, discountItem) => {
      const billingPeriod =
        discountItem._price?.type === 'recurring' ? discountItem._price?.billing_period : 'one_time';
      const currency = (discountItem._price?.unit_amount_currency || DEFAULT_CURRENCY) as Currency;

      discountsPerRecurrency[billingPeriod] = d(
        d(discountsPerRecurrency[billingPeriod] || 0, currency)
          .add(toDinero(discountItem._price?.unit_amount_decimal, currency))
          .getAmount(),
      ).getAmount();

      return discountsPerRecurrency;
    }, {});

  if (Object.keys(discounts).length) {
    return discounts;
  }
}

/**
 * Applies the discounts computing logic assuming displayed prices are NET.
 * In such a case, we don't care about the final user display value, and taxes are added on top of
 * the net prices minus the discount.
 */
export function applyDiscounts(priceDetails: PricingDetails, discounts: { [key: string]: number }): PricingDetails {
  const items = priceDetails.items?.reduce(
    (_details, item, index) => {
      if (item._price?.unit_amount < 0 && !isCompositePrice(item)) {
        return {
          ..._details,
          items: [..._details.items!, convertPriceItemPrecision(item, 2)],
        };
      }

      if (isCompositePrice(item)) {
        /**
         * TODO: Composite Prices with discounts are not supported yet.
         */
        return _details;
      } else {
        const recurrenceDiscount = discounts[item._price?.billing_period || 'one_time'];
        const { amount_subtotal: recurrenceSubTotal } =
          priceDetails.total_details?.breakdown?.recurrences?.find((recurrence) => {
            return recurrence.billing_period === item._price?.billing_period;
          }) || {};

        const proportion = d(item.amount_subtotal || 0)
          .divide(recurrenceSubTotal || 0)
          .getAmount();

        const proportionalDiscount = d(proportion).multiply(recurrenceDiscount).getAmount();
        const amountSubtotal = d(item.amount_subtotal || 0).add(d(proportionalDiscount));
        const amountTotal = amountSubtotal.multiply(1.19);

        const updatedItem = {
          ...item,
          amount_subtotal: amountSubtotal.getAmount(),
          amount_total: amountTotal.getAmount(),
        };

        const updatedTotals =
          isUnitAmountApproved(updatedItem, updatedItem?._price?.price_display_in_journeys, null!) &&
          (updatedItem?.unit_amount || 0) > 0
            ? recomputeDetailTotals(_details, updatedItem!, updatedItem)
            : {
                unit_amount_gross: _details.unit_amount_gross,
                amount_subtotal: _details.amount_subtotal,
                amount_total: _details.amount_total,
                total_details: _details.total_details,
              };

        return {
          ...updatedTotals,
          items: [..._details.items!, convertPriceItemPrecision(updatedItem, 2)],
        };
      }
    },
    {
      items: [],
      unit_amount_gross: 0,
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
    } as any,
  ) as any;

  return items;
}
