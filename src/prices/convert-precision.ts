import type { CashbackAmount, PriceGetAg, TaxAmount, TaxAmountBreakdown } from '@epilot/sdk/pricing';
import { toDineroFromInteger } from '../money/to-dinero';
import { PricingModel } from '../prices/constants';
import type {
  CompositePriceItem,
  Price,
  PriceItem,
  PriceItemDto,
  PricingDetails,
  RecurrenceAmount,
  RecurrenceAmountWithTax,
  TierDetails,
} from '../shared/types';

/**
 * Converts an integer amount from DECIMAL_PRECISION to the given precision.
 */
const convertIntegerPrecision = (amount: number, precision: number): number =>
  toDineroFromInteger(amount).convertPrecision(precision).getAmount();

/**
 * Converts an integer amount with DECIMAL_PRECISION to its decimal string representation, e.g. 10.5
 */
export const toDecimalString = (amount: number): string => toDineroFromInteger(amount).toUnit().toString();

/**
 * Optional price item amounts which, when set, are converted and accompanied by a `<field>_decimal` value.
 * The order of each list defines the order of the keys in the output, so don't reorder them.
 */
const UNIT_AMOUNT_FIELDS = [
  'unit_amount',
  'before_discount_unit_amount',
  'before_discount_unit_amount_gross',
  'before_discount_unit_amount_net',
  'unit_discount_amount',
  'unit_amount_net',
  'unit_discount_amount_net',
  'unit_amount_gross',
] as const;

const DISCOUNT_AND_CASHBACK_AMOUNT_FIELDS = [
  'discount_amount',
  'before_discount_amount_total',
  'before_discount_amount_subtotal',
  'cashback_amount',
  'after_cashback_amount_total',
] as const;

const TAX_DISCOUNT_AMOUNT_FIELDS = [
  'tax_discount_amount',
  'discount_amount_net',
  'before_discount_tax_amount',
] as const;

/**
 * Converts every field holding a number, adding its `<field>_decimal` counterpart right after it.
 */
const convertAmountFieldsWithDecimals = (
  item: PriceItem,
  fields: ReadonlyArray<keyof PriceItem>,
  precision: number,
): Partial<PriceItem> =>
  Object.fromEntries(
    fields.flatMap((field) => {
      const amount = item[field];

      return typeof amount === 'number'
        ? [
            [field, convertIntegerPrecision(amount, precision)],
            [`${field}_decimal`, toDecimalString(amount)],
          ]
        : [];
    }),
  );

const hasPricingModel = (priceItem: PriceItem, pricingModel: PricingModel): boolean =>
  priceItem.pricing_model === pricingModel || priceItem._price?.pricing_model === pricingModel;

/**
 * @todo Also output the decimal values
 */
const convertTierDetailsPrecision = (tier: TierDetails, precision: number): TierDetails => ({
  ...tier,
  unit_amount_gross: convertIntegerPrecision(tier.unit_amount_gross, precision),
  unit_amount_net: convertIntegerPrecision(tier.unit_amount_net, precision),
  amount_total: convertIntegerPrecision(tier.amount_total, precision),
  amount_subtotal: convertIntegerPrecision(tier.amount_subtotal, precision),
  amount_tax: convertIntegerPrecision(tier.amount_tax, precision),
});

type AdditionalMarkups = NonNullable<PriceGetAg['additional_markups']>;

const convertAdditionalMarkupsPrecision = (additionalMarkups: AdditionalMarkups, precision: number) => {
  const convertIfInteger = (amount: number | undefined) =>
    Number.isInteger(amount) ? convertIntegerPrecision(amount!, precision) : undefined;
  const toDecimalStringIfInteger = (amount: number | undefined) =>
    Number.isInteger(amount) ? toDecimalString(amount!) : undefined;

  return Object.fromEntries(
    Object.entries(additionalMarkups).map(([key, value]) => [
      key,
      {
        amount: value.amount,
        amount_decimal: value.amount_decimal,
        amount_net: convertIfInteger(value.amount_net),
        amount_gross: convertIfInteger(value.amount_gross),
        amount_net_decimal: toDecimalStringIfInteger(value.amount_net),
        amount_gross_decimal: toDecimalStringIfInteger(value.amount_gross),
      },
    ]),
  );
};

const convertGetAgPrecision = (getAg: PriceGetAg, precision: number): PriceGetAg => ({
  ...getAg,
  unit_amount_net: convertIntegerPrecision(getAg.unit_amount_net, precision),
  unit_amount_gross: convertIntegerPrecision(getAg.unit_amount_gross, precision),
  unit_amount_net_decimal: toDecimalString(getAg.unit_amount_net),
  unit_amount_gross_decimal: toDecimalString(getAg.unit_amount_gross),
  markup_amount_net: convertIntegerPrecision(getAg.markup_amount_net!, precision),
  markup_amount_net_decimal: toDecimalString(getAg.markup_amount_net!),
  markup_amount_gross: convertIntegerPrecision(getAg.markup_amount_gross!, precision),
  markup_amount_gross_decimal: toDecimalString(getAg.markup_amount_gross!),
  ...(getAg.additional_markups_enabled &&
    getAg.additional_markups && {
      additional_markups: convertAdditionalMarkupsPrecision(getAg.additional_markups, precision),
    }),
  markup_total_amount_net: convertIntegerPrecision(getAg.markup_total_amount_net!, precision),
  markup_total_amount_net_decimal: toDecimalString(getAg.markup_total_amount_net!),
  markup_total_amount_gross: convertIntegerPrecision(getAg.markup_total_amount_gross!, precision),
  markup_total_amount_gross_decimal: toDecimalString(getAg.markup_total_amount_gross!),
});

type DynamicTariff = NonNullable<PriceItem['dynamic_tariff']>;

/**
 * Unlike the other amounts, dynamic tariff amounts of 0 are omitted (set to undefined).
 */
const convertDynamicTariffPrecision = (dynamicTariff: DynamicTariff, precision: number): DynamicTariff => {
  const convertIfSet = (amount: number | undefined) =>
    amount ? convertIntegerPrecision(amount, precision) : undefined;
  const toDecimalStringIfSet = (amount: number | undefined) => (amount ? toDecimalString(amount) : undefined);

  return {
    ...dynamicTariff,
    unit_amount_net: convertIfSet(dynamicTariff.unit_amount_net),
    unit_amount_gross: convertIfSet(dynamicTariff.unit_amount_gross),
    unit_amount_net_decimal: toDecimalStringIfSet(dynamicTariff.unit_amount_net),
    unit_amount_gross_decimal: toDecimalStringIfSet(dynamicTariff.unit_amount_gross),
    markup_amount_net: convertIfSet(dynamicTariff.markup_amount_net),
    markup_amount_net_decimal: toDecimalStringIfSet(dynamicTariff.markup_amount_net),
    markup_amount_gross: convertIfSet(dynamicTariff.markup_amount_gross),
    markup_amount_gross_decimal: toDecimalStringIfSet(dynamicTariff.markup_amount_gross),
  };
};

export const convertPriceComponentsPrecision = (items: PriceItem[], precision = 2): PriceItem[] =>
  items.map((component) => convertPriceItemPrecision(component, precision));

/**
 * Converts all integer amounts from a precision of DECIMAL_PRECISION to a given precision.
 * e.g: 10.00 with precision DECIMAL_PRECISION, represented as 10(+12 zeros) with precision 2
 * would be 1000(only 2 zeros on the decimal component).
 */
export const convertPriceItemPrecision = (priceItem: PriceItem, precision = 2): PriceItem => ({
  ...priceItem,
  ...convertAmountFieldsWithDecimals(priceItem, UNIT_AMOUNT_FIELDS, precision),
  amount_subtotal: convertIntegerPrecision(priceItem.amount_subtotal!, precision),
  amount_subtotal_decimal: toDecimalString(priceItem.amount_subtotal!),
  amount_total: convertIntegerPrecision(priceItem.amount_total!, precision),
  amount_total_decimal: toDecimalString(priceItem.amount_total!),
  ...convertAmountFieldsWithDecimals(priceItem, DISCOUNT_AND_CASHBACK_AMOUNT_FIELDS, precision),
  amount_tax: convertIntegerPrecision(priceItem.amount_tax || 0, precision),
  ...convertAmountFieldsWithDecimals(priceItem, TAX_DISCOUNT_AMOUNT_FIELDS, precision),
  taxes: priceItem.taxes!.map((tax: TaxAmount) => ({
    ...tax,
    amount: convertIntegerPrecision(tax.amount || 0, precision),
  })),
  ...(priceItem.tiers_details && {
    tiers_details: priceItem.tiers_details.map((tier) => convertTierDetailsPrecision(tier, precision)),
  }),
  ...(priceItem.get_ag &&
    hasPricingModel(priceItem, PricingModel.externalGetAG) && {
      get_ag: convertGetAgPrecision(priceItem.get_ag, precision),
    }),
  ...(priceItem.dynamic_tariff &&
    hasPricingModel(priceItem, PricingModel.dynamicTariff) && {
      dynamic_tariff: convertDynamicTariffPrecision(priceItem.dynamic_tariff, precision),
    }),
});

const isPricingDetails = (details: unknown): details is PricingDetails =>
  Boolean(
    details &&
      typeof details === 'object' &&
      'amount_tax' in details &&
      (details as { amount_tax: unknown }).amount_tax !== undefined,
  );

/**
 * Optional recurrence amounts, only converted when they hold an integer.
 * The order defines the order of the keys in the output, so don't reorder it.
 */
const OPTIONAL_RECURRENCE_AMOUNT_FIELDS = [
  'discount_amount',
  'before_discount_amount_total',
  'before_discount_amount_subtotal',
  'after_cashback_amount_total',
] as const;

const convertRecurrencePrecision = (recurrence: RecurrenceAmount, precision: number): RecurrenceAmount => ({
  ...recurrence,
  unit_amount_gross: convertIntegerPrecision(recurrence.unit_amount_gross!, precision),
  ...(Number.isInteger(recurrence.unit_amount_net) && {
    unit_amount_net: convertIntegerPrecision(recurrence.unit_amount_net!, precision),
  }),
  amount_subtotal: convertIntegerPrecision(recurrence.amount_subtotal, precision),
  amount_total: convertIntegerPrecision(recurrence.amount_total, precision),
  amount_tax: convertIntegerPrecision(recurrence.amount_tax!, precision),
  ...Object.fromEntries(
    OPTIONAL_RECURRENCE_AMOUNT_FIELDS.filter((field) => Number.isInteger(recurrence[field])).map((field) => [
      field,
      convertIntegerPrecision(recurrence[field]!, precision),
    ]),
  ),
});

const convertRecurrenceByTaxPrecision = (
  recurrence: RecurrenceAmountWithTax,
  precision: number,
): RecurrenceAmountWithTax => ({
  ...recurrence,
  amount_total: convertIntegerPrecision(recurrence.amount_total, precision),
  amount_subtotal: convertIntegerPrecision(recurrence.amount_subtotal, precision),
  amount_tax: convertIntegerPrecision(recurrence.amount_tax!, precision),
  tax: {
    ...recurrence.tax,
    amount: convertIntegerPrecision(recurrence.tax?.amount!, precision),
  },
});

const convertBreakDownPrecision = (details: PricingDetails | CompositePriceItem, precision: number): PricingDetails => {
  const breakdown = details.total_details?.breakdown;

  return {
    amount_subtotal: convertIntegerPrecision(details.amount_subtotal!, precision),
    amount_total: convertIntegerPrecision(details.amount_total!, precision),
    ...(isPricingDetails(details) && {
      amount_tax: convertIntegerPrecision(details.amount_tax!, precision),
    }),
    total_details: {
      ...details.total_details,
      amount_tax: convertIntegerPrecision(details.total_details?.amount_tax!, precision),
      breakdown: {
        ...breakdown,
        taxes: breakdown?.taxes!.map((tax: TaxAmountBreakdown) => ({
          ...tax,
          amount: convertIntegerPrecision(tax.amount!, precision),
        })),
        recurrences: breakdown?.recurrences!.map((recurrence) => convertRecurrencePrecision(recurrence, precision)),
        recurrencesByTax: breakdown?.recurrencesByTax!.map((recurrence) =>
          convertRecurrenceByTaxPrecision(recurrence, precision),
        ),
        cashbacks: breakdown?.cashbacks?.map((cashback: CashbackAmount) => ({
          ...cashback,
          amount_total: convertIntegerPrecision(cashback.amount_total!, precision),
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
  items: details.items!.map((item: PriceItem | CompositePriceItem) => {
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
 * Values computed when applying coupons, which don't belong in a price item dto.
 */
const COUPON_COMPUTED_FIELDS = [
  'before_discount_amount_total',
  'before_discount_amount_total_decimal',
  'before_discount_amount_subtotal',
  'before_discount_amount_subtotal_decimal',
  'before_discount_unit_amount',
  'before_discount_unit_amount_decimal',
  'before_discount_unit_amount_gross',
  'before_discount_unit_amount_gross_decimal',
  'before_discount_unit_amount_net',
  'before_discount_unit_amount_net_decimal',
  'before_discount_tax_amount',
  'before_discount_tax_amount_decimal',
  'discount_amount',
  'discount_amount_decimal',
  'discount_percentage',
  'discount_amount_net',
  'discount_amount_net_decimal',
  'tax_discount_amount',
  'tax_discount_amount_decimal',
  'unit_discount_amount',
  'unit_discount_amount_decimal',
  'unit_discount_amount_net',
  'unit_discount_amount_net_decimal',
  'cashback_amount',
  'cashback_amount_decimal',
  'after_cashback_amount_total',
  'after_cashback_amount_total_decimal',
  'cashback_period',
] as const satisfies ReadonlyArray<keyof PriceItem>;

/**
 * Removes all computed values from a price item and returns a price item dto.
 */
export const convertPriceItemWithCouponAppliedToPriceItemDto = (priceItemWithCoupon: PriceItem): PriceItemDto => {
  const { before_discount_unit_amount, before_discount_unit_amount_decimal } = priceItemWithCoupon;
  const priceItem: Partial<PriceItem> = { ...priceItemWithCoupon };

  for (const field of COUPON_COMPUTED_FIELDS) {
    delete priceItem[field];
  }

  return {
    ...priceItem,
    ...(before_discount_unit_amount && {
      unit_amount: before_discount_unit_amount,
      unit_amount_decimal: before_discount_unit_amount_decimal,
    }),
    _price: priceItem._price as Price,
  } as PriceItemDto;
};

export const convertCashbackAmountsPrecision = (
  cashbackAmount: number | undefined,
  afterCashbackAmountTotal: number | undefined,
  precision = 2,
) => {
  return {
    ...(cashbackAmount &&
      typeof cashbackAmount === 'number' && {
        cashback_amount: convertIntegerPrecision(cashbackAmount, precision),
        cashback_amount_decimal: toDecimalString(cashbackAmount),
      }),
    ...(afterCashbackAmountTotal &&
      typeof afterCashbackAmountTotal === 'number' && {
        after_cashback_amount_total: convertIntegerPrecision(afterCashbackAmountTotal, precision),
        after_cashback_amount_total_decimal: toDecimalString(afterCashbackAmountTotal),
      }),
  };
};
