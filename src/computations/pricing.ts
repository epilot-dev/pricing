import { toDineroFromInteger } from '../money/toDinero';
import type { CompositePriceItem, PriceItem, PricingDetails } from '../types';
import { PricingModel } from '../prices/constants';

export const convertPriceComponentsPrecision = (items: PriceItem[], precision = 2): PriceItem[] =>
  items.map((component) => convertPriceItemPrecision(component, precision));

/**
 * Converts all integer amounts from a precision of DECIMAL_PRECISION to a given precision.
 * e.g: 10.00 with precision DECIMAL_PRECISION, represented as 10(+12 zeros) with precision 2
 * would be 1000(only 2 zeros on the decimal component).
 */
export const convertPriceItemPrecision = (priceItem: PriceItem, precision = 2): PriceItem => ({
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
export const convertPricingPrecision = (details: PricingDetails, precision: number): PricingDetails => ({
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
