import { cloneDeep } from 'lodash';
import { formatAmount, formatAmountFromString, formatPriceUnit } from '../money/formatters';
import { toDinero } from '../money/to-dinero';
import { PricingModel } from '../prices/constants';
import { isTruthy } from '../shared/is-truthy';
import type {
  Currency,
  BillingPeriod,
  CompositePrice,
  CompositePriceItem,
  Price,
  PriceItem,
  RecurrenceAmount,
  Tax,
  TierDetails,
  I18n,
  TFunction,
  Coupon,
} from '../shared/types';
import { getDisplayTierByQuantity, getTierDescription } from '../tiers/utils';
import { normalizeTimeFrequency, normalizeValueToFrequencyUnit } from '../time-frequency/normalizers';
import type { TimeFrequency } from '../time-frequency/types';
import { RECURRENCE_ORDERING } from './constants';
import type { ExternalFeesMetadata, GetTieredUnitAmountOptions, PriceDisplayType, PriceItemWithParent } from './types';

export const EMPTY_VALUE_PLACEHOLDER = '---';
const TEMPORARY_TAX_MAPPER = {
  standard: '19%',
  reduced: '7%',
} as const;

type TaxRateName = keyof typeof TEMPORARY_TAX_MAPPER;

export const safeFormatAmount = ({
  amount,
  currency,
  locale,
  enableSubunitDisplay,
}: {
  amount: number | string;
  currency?: Currency;
  locale?: string;
  enableSubunitDisplay?: boolean;
}) => {
  try {
    if (!amount) {
      return formatAmount({
        amount: 0,
        currency: currency,
        locale,
        enableSubunitDisplay,
      });
    }

    if (typeof amount === 'string') {
      return formatAmountFromString({
        decimalAmount: amount,
        currency: currency,
        locale,
        useRealPrecision: true,
        enableSubunitDisplay,
      });
    }

    return formatAmount({
      amount: typeof amount === 'number' ? amount : 0,
      currency: currency,
      locale,
      enableSubunitDisplay,
    });
  } catch (e) {
    /**
     * @todo Should cast to string,
     * as most places where `safeFormatAmount` is used expect a string
     */
    return amount;
  }
};

const safeFormatAmountWithPrefix = ({
  prefix,
  ...options
}: {
  amount: number | string;
  currency?: Currency;
  locale?: string;
  enableSubunitDisplay?: boolean;
} & { prefix?: string }) => {
  const formattedValue = safeFormatAmount(options);

  return prefix ? `${prefix} ${formattedValue}` : formattedValue;
};

export const computeRecurrenceAmounts = <
  Recurrence extends Pick<RecurrenceAmount, 'amount_total' | 'amount_subtotal' | 'amount_tax'>,
>(
  recurrence: Recurrence,
  { currency, locale }: { currency: Currency; locale: string },
) => {
  const formatAmount = (amount: number) => safeFormatAmount({ amount, currency, locale });

  return {
    amount_total: formatAmount(recurrence.amount_total || 0),
    ...(!isNaN(Number(recurrence.amount_total)) && {
      amount_total_decimal: String(recurrence.amount_total / 100),
    }),
    amount_subtotal: formatAmount(recurrence.amount_subtotal || 0),
    ...(!isNaN(Number(recurrence.amount_subtotal)) && {
      amount_subtotal_decimal: String(recurrence.amount_subtotal / 100),
    }),
    amount_tax: formatAmount(recurrence.amount_tax || 0),
    ...(typeof recurrence.amount_tax !== 'undefined' &&
      !isNaN(Number(recurrence.amount_tax)) && {
        amount_tax_decimal: String(recurrence.amount_tax / 100),
      }),
  };
};

export const getRecurrenceInterval = (
  recurrence: Pick<RecurrenceAmount, 'billing_period' | 'type'>,
): BillingPeriod | 'one-time' =>
  recurrence.type === 'recurring' ? recurrence.billing_period! : (recurrence.type as 'one-time');

// valid line items must have _price snapshot and not have _position (not flattened)
export const withValidLineItem = (item: any) => !!item?.['_price'] && !item?.['_position'];

/**
 * @todo Use String.padEnd instead
 */
export const fillPostSpaces = (value: string, fillLength: number) => {
  if (value) {
    const fillSpaces = fillLength - value.length;
    for (let i = 0; i < fillSpaces; i++) {
      value = value + '&nbsp;';
    }
  }

  return value;
};

export const unitAmountApproved = (item: PriceItemWithParent): boolean => {
  const itemDisplayType = getPriceDisplayType(item._price);
  const parentDisplayType = getPriceDisplayType(item.parent_item?._price);

  const hasNonHiddenPrice = !isHiddenPriceType(itemDisplayType);
  const hasNonHiddenParentPrice = !isHiddenPriceType(parentDisplayType);

  const isHiddenPriceApproved = item.on_request_approved || item.parent_item?.on_request_approved;

  if (isCompositePrice(item)) {
    const hasNonHiddenComponent = !findHiddenComponent(item);

    return Boolean((hasNonHiddenComponent && hasNonHiddenPrice) || isHiddenPriceApproved);
  } else {
    return Boolean((hasNonHiddenPrice && hasNonHiddenParentPrice) || isHiddenPriceApproved);
  }
};

export const getUnitAmount = (
  item: PriceItemWithParent,
  i18n: I18n,
  {
    isUnitAmountApproved,
    useUnitAmountNet,
    isDiscountCoupon,
    isCashbackCoupon,
    isItemContainingDiscountCoupon,
  }: GetTieredUnitAmountOptions & {
    isDiscountCoupon: boolean;
    isCashbackCoupon: boolean;
    isItemContainingDiscountCoupon: boolean;
  },
) => {
  if (item._price?.is_composite_price) {
    return undefined;
  }

  if (
    item._price?.pricing_model === PricingModel.tieredGraduated ||
    item._price?.pricing_model === PricingModel.tieredVolume ||
    item._price?.pricing_model === PricingModel.tieredFlatFee
  ) {
    return getTieredUnitAmount(item, i18n, { isUnitAmountApproved, useUnitAmountNet });
  }

  if (item._price?.pricing_model === PricingModel.externalGetAG) {
    return getGetAgUnitAmount(item as PriceItem, i18n, useUnitAmountNet);
  }

  let amount;

  if (isDiscountCoupon) {
    amount = useUnitAmountNet ? -item.unit_discount_amount_net! : -item.unit_discount_amount!;
  } else if (isCashbackCoupon) {
    return undefined;
  } else if (isItemContainingDiscountCoupon) {
    /**
     * @todo Seems we're missing before_discount_unit_amount_net
     * on pricing lib computations, should return it
     */
    amount = useUnitAmountNet ? item.before_discount_unit_amount : item.before_discount_unit_amount;
  } else {
    amount = useUnitAmountNet ? item.unit_amount_net : item.unit_amount_decimal || item._price?.unit_amount_decimal;
  }

  return safeFormatAmount({
    amount: amount || 0,
    currency: item.currency as any,
    locale: i18n.language,
  });
};

const getTieredUnitAmount = (
  item: PriceItemWithParent,
  i18n: I18n,
  { isUnitAmountApproved, useUnitAmountNet }: GetTieredUnitAmountOptions,
) => {
  if (!item._price?.tiers?.length) {
    return EMPTY_VALUE_PLACEHOLDER;
  }

  const language = i18n.language;
  const parentItem = item.parent_item;
  const itemPriceMapping = (item.price_mappings || parentItem?.price_mappings)?.find(
    (mapping) => mapping.price_id === item.price_id,
  );
  const { value: numberInput, frequency_unit: frequencyUnit } = itemPriceMapping || {};
  const tax = useUnitAmountNet
    ? {
        isInclusive: item.is_tax_inclusive ?? item._price?.is_tax_inclusive ?? true,
        rate: item.taxes?.[0]?.tax?.rate || item.taxes?.[0]?.rateValue || 0,
      }
    : undefined;

  /**
   * @todo Instead of using normalizeTimeFrequency, use normalizeValueToFrequencyUnit
   */
  const normalizedInput =
    item._price?.pricing_model !== PricingModel.tieredGraduated &&
    numberInput &&
    normalizeTimeFrequency(
      numberInput,
      (frequencyUnit as TimeFrequency) || (item._price.billing_period as TimeFrequency),
      item._price.billing_period as TimeFrequency,
    );

  // always return the first tier when using cumulative tiers since this is just used when displaying the masked "Starts At" price
  const displayableTier = getDisplayTierByQuantity(
    item._price.tiers,
    item._price.pricing_model === PricingModel.tieredGraduated ? 1 : normalizedInput || item.quantity!,
    item._price.pricing_model as PricingModel,
  );

  const descriptionUnit = '';
  const descriptionCurrency = item.currency as Currency;
  const descriptionTranslationFactory = (key: string) => i18n.t(`table_order.${key}`);

  switch (item._price.pricing_model) {
    case PricingModel.tieredGraduated: {
      if (item._price.price_display_in_journeys !== 'show_as_starting_price') {
        return '';
      }

      return getTierDescription(
        PricingModel.tieredGraduated,
        displayableTier,
        descriptionUnit,
        language,
        descriptionCurrency,
        descriptionTranslationFactory,
        { showStartsAt: false },
        tax,
      )?.split('/')[0]; // remove the unit part as it is not needed
    }

    case PricingModel.tieredVolume: {
      return getTierDescription(
        PricingModel.tieredVolume,
        displayableTier,
        descriptionUnit,
        language,
        descriptionCurrency,
        descriptionTranslationFactory,
        { showStartsAt: false, showOnRequest: !isUnitAmountApproved },
        tax,
      )?.split('/')[0]; // remove the unit part as it is not needed
    }

    case PricingModel.tieredFlatFee: {
      return getTierDescription(
        PricingModel.tieredFlatFee,
        displayableTier,
        descriptionUnit,
        language,
        descriptionCurrency,
        descriptionTranslationFactory,
        { showStartsAt: false },
        tax,
      )?.split('/')[0]; // remove the unit part as it is not needed
    }

    default:
      return EMPTY_VALUE_PLACEHOLDER;
  }
};

const getGetAgUnitAmount = (item: PriceItem, i18n: I18n, useUnitAmountNet: boolean) => {
  const amount = useUnitAmountNet
    ? item.unit_amount_net || 0
    : ((item.is_tax_inclusive ?? item._price?.is_tax_inclusive) ? item.unit_amount_gross : item.unit_amount_net) || 0;

  if (!item._price?.is_composite_price) {
    return safeFormatAmount({
      amount,
      currency: item.currency as any,
      locale: i18n.language,
    });
  }
};

export const getSafeAmount = (value: unknown) =>
  typeof value !== 'object' && typeof value !== 'undefined' ? value : undefined;

export const processRecurrences = (
  item: any,
  { currency }: { currency?: Currency },
  { language: locale, t }: I18n,
  prefix?: string,
) =>
  RECURRENCE_ORDERING
    /* Get recurrences in the right order */
    .map((interval) =>
      item.total_details?.breakdown?.recurrences?.find(
        (item: PriceItem) => item.type == interval || (item.type === 'recurring' && item.billing_period === interval),
      ),
    )
    /* Filter out any which weren't matched */
    .filter(isTruthy)
    .map(({ amount_total = 0, amount_subtotal = 0, amount_tax = 0, billing_period, ...recurrence }) => ({
      ...recurrence,
      amount_total: safeFormatAmountWithPrefix({ amount: amount_total, currency, locale, prefix }),
      amount_subtotal: safeFormatAmountWithPrefix({ amount: amount_subtotal, currency, locale, prefix }),
      amount_tax: safeFormatAmountWithPrefix({ amount: amount_tax, currency, locale, prefix }),
      billing_period: billing_period ? t(`table_order.recurrences.billing_period.${billing_period}`) : '',
    }));

export const getHiddenAmountString = (t: TFunction, displayInJourneys?: PriceDisplayType, value?: string | number) => {
  const valueStr = (value === 0 ? '0' : value) ? ` ${value}` : '';

  return !displayInJourneys
    ? EMPTY_VALUE_PLACEHOLDER
    : displayInJourneys === 'show_as_starting_price'
      ? `${t(displayInJourneys, EMPTY_VALUE_PLACEHOLDER)}${valueStr}`
      : t(displayInJourneys, EMPTY_VALUE_PLACEHOLDER);
};

export const getPriceDisplayInJourneys = (
  priceItem: PriceItem | CompositePriceItem | (PriceItem & { parent_item: CompositePriceItem }),
): PriceDisplayType | undefined => {
  const itemDisplayType = getPriceDisplayType(priceItem._price);
  if (isHiddenPriceType(itemDisplayType)) {
    return itemDisplayType;
  }

  if (isCompositePrice(priceItem)) {
    return findHiddenComponentDisplayInJourney(priceItem);
  } else {
    const parentDisplayType = getPriceDisplayType((priceItem as PriceItemWithParent).parent_item?._price);

    return isHiddenPriceType(parentDisplayType) ? parentDisplayType : itemDisplayType;
  }
};

export const processTaxRecurrences = (
  /**
   * @todo Type narrowly
   */
  item: any,
  i18n: I18n,
) => {
  const taxes: Tax[] = [];
  for (let index = 0; index < item.total_details.breakdown.taxes.length; index++) {
    taxes.push({
      tax: getTaxRate(item.total_details.breakdown, i18n, index),
      amount: safeFormatAmount({
        amount: item.total_details.breakdown.taxes[index].amount || 0,
        currency: item.currency,
        locale: i18n.language,
      }),
    } as never);
  }

  return taxes;
};

export const getTaxRate = (source: any, i18n: any, index = 0) => {
  const tax = source.taxes?.[index]?.tax;

  if (tax !== undefined) {
    const rate = tax.rate;
    const description = tax.description;

    if (rate === null) {
      return description || i18n.t('table_order.no_tax', '(no tax)');
    }

    const mappedRate = TEMPORARY_TAX_MAPPER[rate as TaxRateName];
    if (mappedRate) {
      return mappedRate;
    }

    return rate ? `${rate}%` : i18n.t('table_order.no_tax', '(no tax)');
  }

  return i18n.t('table_order.no_tax', '(no tax)');
};

export const getFormattedTieredDetails = (
  tiersDetails: Array<TierDetails & { _position: number }> | undefined,
  item: PriceItem,
  isUnitAmountApproved: boolean,
  locale: string,
) => {
  if (
    !Array.isArray(tiersDetails) ||
    item._price?.pricing_model !== PricingModel.tieredGraduated ||
    !isUnitAmountApproved
  ) {
    return;
  }

  const currency = item._price.currency;

  return (
    tiersDetails.map((tierDetails) => {
      const unit = formatPriceUnit(item._price?.unit, true);

      return {
        _position: tierDetails._position,
        quantity: unit ? `${tierDetails.quantity} ${unit}` : tierDetails.quantity,
        unit_amount: safeFormatAmount({
          amount: tierDetails.unit_amount_decimal || 0,
          currency: currency,
          locale,
        }),
        unit_amount_net: safeFormatAmount({
          amount: tierDetails.unit_amount_net || 0,
          currency: currency,
          locale,
        }),
        amount_total: safeFormatAmount({
          amount: tierDetails.amount_total || 0,
          currency: currency,
          locale,
        }),
        amount_subtotal: safeFormatAmount({
          amount: tierDetails.amount_subtotal || 0,
          currency: currency,
          locale,
        }),
        amount_tax: safeFormatAmount({
          amount: tierDetails.amount_tax || 0,
          currency: currency,
          locale,
        }),
      };
    }) ?? []
  );
};

export const isCompositePrice = (priceItem: PriceItem | CompositePriceItem): priceItem is CompositePriceItem =>
  Boolean(priceItem.is_composite_price || priceItem._price?.is_composite_price);

export const getQuantity = (item: PriceItem, parentItem?: PriceItem) => {
  if (!parentItem && item._price?.variable_price) {
    const itemPriceMapping = item.price_mappings?.find((mapping) => mapping.price_id === item.price_id);
    const quantity =
      typeof itemPriceMapping?.value === 'number'
        ? `${itemPriceMapping?.value} ${formatPriceUnit(item?._price?.unit, true)}`
        : EMPTY_VALUE_PLACEHOLDER;

    return item.quantity == 1 ? quantity : `${item.quantity} x ${quantity}`;
  }
  if (parentItem && !item._price?.variable_price) {
    return parentItem.quantity == 1 ? `${item.quantity}` : `${parentItem.quantity} x ${item.quantity}`;
  }
  if (parentItem && item._price?.variable_price) {
    const itemPriceMapping = parentItem.price_mappings?.find((mapping) => mapping.price_id === item.price_id);

    const quantity =
      typeof itemPriceMapping?.value === 'number'
        ? `${itemPriceMapping?.value} ${formatPriceUnit(item._price?.unit, true)}`
        : EMPTY_VALUE_PLACEHOLDER;

    return parentItem.quantity == 1 ? quantity : `${parentItem.quantity} x ${quantity}`;
  }

  return `${item.quantity}`;
};

export const getDisplayUnit = (item: PriceItem) => {
  if (
    item._price?.pricing_model === PricingModel.tieredFlatFee ||
    item._price?.price_display_in_journeys === 'show_as_on_request'
  ) {
    return;
  }

  const unit = formatPriceUnit(item._price?.unit, true);

  return unit ? `/${unit}` : '';
};

export const processExternalFeesMetadata = (
  externalFeesMetadata: ExternalFeesMetadata,
  currency: Currency,
  i18n: I18n,
  variableUnit?: string,
) => {
  const billingPeriod = externalFeesMetadata.billing_period;

  const result = {
    ...externalFeesMetadata,
    billing_period: i18n.t('table_order.recurrences.billing_period.' + billingPeriod),
    is_tax_inclusive: false,
    tax_behavior_display: i18n.t('table_order.external_fees.tax_behavior'),
  };

  // Process static breakdowns
  processStaticBreakdown(externalFeesMetadata, result, currency, i18n, billingPeriod);

  // Process variable breakdowns
  processVariableBreakdown('variable', externalFeesMetadata, result, currency, i18n, billingPeriod, variableUnit);
  processVariableBreakdown('variable_ht', externalFeesMetadata, result, currency, i18n, billingPeriod, variableUnit);
  processVariableBreakdown('variable_nt', externalFeesMetadata, result, currency, i18n, billingPeriod, variableUnit);

  // Add aggregated breakdowns
  processAggregatedDisplayBreakdown(result);

  return result;
};

const getPriceDisplayType = (price?: Price | CompositePrice): PriceDisplayType | undefined =>
  price?.price_display_in_journeys;

const isHiddenPriceType = (displayType?: PriceDisplayType): boolean =>
  displayType === 'show_as_on_request' || displayType === 'show_as_starting_price';

const findHiddenComponent = (item: CompositePriceItem): PriceItem | undefined =>
  item.item_components?.find((component) => isHiddenPriceType(getPriceDisplayType(component._price)));

const findHiddenComponentDisplayInJourney = (item: CompositePriceItem): PriceDisplayType | undefined => {
  const hiddenComponent = findHiddenComponent(item);

  return hiddenComponent ? getPriceDisplayType(hiddenComponent._price) : undefined;
};

const processVariableBreakdown = (
  variableName: keyof Pick<ExternalFeesMetadata['breakdown'], 'variable' | 'variable_nt' | 'variable_ht'>,
  externalFeesMetadata: ExternalFeesMetadata,
  result: ExternalFeesMetadata,
  currency: Currency,
  i18n: I18n,
  billingPeriod: string,
  variableUnit?: string,
) => {
  const breakdown = externalFeesMetadata.breakdown[variableName];
  const resultBreakdown = result.breakdown[variableName];
  if (!breakdown || !resultBreakdown) return;

  for (const key in breakdown) {
    const fee = breakdown[key];
    if (!fee) continue;

    resultBreakdown[key] = {
      ...fee,
      label: i18n.t('table_order.external_fees.get_ag.' + key),
      amount: safeFormatAmount({
        amount: fee.amount || 0,
        currency,
        locale: i18n.language,
      }),
      unit_amount: `${safeFormatAmount({
        amount: fee.unit_amount_decimal || 0,
        currency,
        locale: i18n.language,
        enableSubunitDisplay: true,
      })}${variableUnit ? ` / ${formatPriceUnit(variableUnit, true)}` : ''}`,
      ...normalizeToYearlyAmounts(fee.amount_decimal, billingPeriod as TimeFrequency, currency, i18n),
    };
  }
};

const processStaticBreakdown = (
  externalFeesMetadata: ExternalFeesMetadata,
  result: ExternalFeesMetadata,
  currency: Currency,
  i18n: I18n,
  billingPeriod: string,
) => {
  if (result.breakdown.static) {
    for (const key in externalFeesMetadata.breakdown.static) {
      if (externalFeesMetadata.breakdown.static[key]) {
        const label = i18n.t('table_order.external_fees.get_ag.' + key);
        result.breakdown.static[key].label = label;
        result.breakdown.static[key].amount = safeFormatAmount({
          amount: externalFeesMetadata.breakdown.static[key].amount || 0,
          currency,
          locale: i18n.language,
        });

        const yearlyAmounts = normalizeToYearlyAmounts(
          externalFeesMetadata.breakdown.static[key].amount_decimal,
          billingPeriod as TimeFrequency,
          currency,
          i18n,
        );

        result.breakdown.static[key] = {
          ...result.breakdown.static[key],
          ...yearlyAmounts,
        };
      }
    }
  }
};

const processAggregatedDisplayBreakdown = (result: ExternalFeesMetadata) => {
  // static
  if (result.breakdown.static) {
    result.breakdown.display_static = Object.values(result.breakdown.static)
      .map((fee) => `${fee.label} - ${fee.amount}`)
      .join(', ');
  }

  // variable
  if (result.breakdown.variable) {
    result.breakdown.display_variable = Object.values(result.breakdown.variable)
      .map((fee) => `${fee.label} - ${fee.amount}`)
      .join(', ');
    result.breakdown.display_variable_per_unit = Object.values(result.breakdown.variable)
      .map((fee) => `${fee.label} - ${fee.unit_amount}`)
      .join(', ');
    result.breakdown.display_static_yearly = Object.values(result.breakdown.static)
      .map((fee) => `${fee.label} - ${fee.amount_yearly}`)
      .join(', ');
    result.breakdown.display_variable_yearly = Object.values(result.breakdown.variable)
      .map((fee) => `${fee.label} - ${fee.amount_yearly}`)
      .join(', ');
  }

  // variable_ht
  if (result.breakdown.variable_ht) {
    result.breakdown.display_variable_ht = Object.values(result.breakdown.variable_ht)
      .map((fee) => `${fee.label} - ${fee.amount}`)
      .join(', ');
    result.breakdown.display_variable_ht_per_unit = Object.values(result.breakdown.variable_ht)
      .map((fee) => `${fee.label} - ${fee.unit_amount}`)
      .join(', ');
    result.breakdown.display_variable_ht_yearly = Object.values(result.breakdown.variable_ht)
      .map((fee) => `${fee.label} - ${fee.amount_yearly}`)
      .join(', ');
  }

  // variable_nt
  if (result.breakdown.variable_nt) {
    result.breakdown.display_variable_nt = Object.values(result.breakdown.variable_nt)
      .map((fee) => `${fee.label} - ${fee.amount}`)
      .join(', ');
    result.breakdown.display_variable_nt_per_unit = Object.values(result.breakdown.variable_nt)
      .map((fee) => `${fee.label} - ${fee.unit_amount}`)
      .join(', ');
    result.breakdown.display_variable_nt_yearly = Object.values(result.breakdown.variable_nt)
      .map((fee) => `${fee.label} - ${fee.amount_yearly}`)
      .join(', ');
  }
};

const normalizeToYearlyAmounts = (
  amount: number | string | undefined,
  billingPeriod: TimeFrequency,
  currency: Currency,
  i18n: I18n,
) => {
  const yearlyDecimalAmountNormalized = normalizeValueToFrequencyUnit(
    amount || 0,
    billingPeriod as TimeFrequency,
    'yearly',
  );

  const normalizedAmountDecimal = yearlyDecimalAmountNormalized.toString();
  const normalizedAmount = toDinero(normalizedAmountDecimal).convertPrecision(2).getAmount();

  return {
    amount_yearly: `${safeFormatAmount({
      amount: normalizedAmount,
      currency,
      locale: i18n.language,
    })}`,
    amount_yearly_decimal: normalizedAmountDecimal,
  };
};

export const getCouponItems = (item: PriceItem): (PriceItem & { coupon: Coupon })[] => {
  const clonedItem = cloneDeep(item);

  const couponItems = ((clonedItem._coupons as Array<Coupon> | undefined) ?? [])?.map<PriceItem & { coupon: Coupon }>(
    (coupon) => ({ ...clonedItem, coupon }),
  );

  return couponItems;
};
