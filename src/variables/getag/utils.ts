import type { PriceGetAg, TariffTypeGetAg } from '@epilot/pricing-client';
import { formatFeeAmountFromString } from '../../getag/formatters';
import { DEFAULT_CURRENCY } from '../../money/constants';
import { toDinero } from '../../money/to-dinero';
import type { Currency, I18n, Tax } from '../../shared/types';
import { getAmountWithTax } from '../../taxes/get-amount-with-tax';
import { normalizeValueToFrequencyUnit } from '../../time-frequency/normalizers';
import type { TimeFrequency } from '../../time-frequency/types';
import type { ExternalFeesMetadata, ExternalFeesDetailsFee, StaticFee, VariableFee, AdditionalMarkup } from '../types';

const getConsumptionBasedAmounts = (
  unitAmountDecimal: string | undefined,
  consumption = 0,
  billingPeriod: TimeFrequency,
  currency: Currency = DEFAULT_CURRENCY,
): {
  yearlyAmountDecimal: string | undefined;
  amountDecimal: string | undefined;
} => {
  if (!unitAmountDecimal || !consumption) {
    return {
      yearlyAmountDecimal: undefined,
      amountDecimal: undefined,
    };
  }

  const dineroObjectFromUnitAmountDecimal = toDinero(unitAmountDecimal, currency);

  const yearlyTotal = dineroObjectFromUnitAmountDecimal.multiply(consumption).toUnit().toString();

  const normalizedBillingPeriod = normalizeValueToFrequencyUnit(
    yearlyTotal,
    'yearly',
    billingPeriod as TimeFrequency,
    12,
  ).toString();

  return {
    yearlyAmountDecimal: yearlyTotal,
    amountDecimal: normalizedBillingPeriod,
  };
};

const getNormalizedAmountDecimal = (
  amountDecimal: string,
  billingPeriod: TimeFrequency,
  unitPricePeriod: TimeFrequency,
) => {
  if (billingPeriod === unitPricePeriod) {
    return amountDecimal;
  }

  return normalizeValueToFrequencyUnit(amountDecimal, billingPeriod, unitPricePeriod, 12).toString();
};

const getYearlyDecimalAmount = (decimalAmount: string | undefined, billingPeriod: TimeFrequency) => {
  return normalizeValueToFrequencyUnit(decimalAmount || '0', billingPeriod as TimeFrequency, 'yearly').toString();
};

const isVariableFee = (fee: StaticFee | VariableFee): fee is VariableFee => {
  return fee != null && 'unit_amount' in fee;
};

const getDetailsFee = ({
  fee,
  label,
  currency,
  i18n,
  billingPeriod,
  unitPricePeriod,
  tax,
  variableUnit,
}: {
  fee: StaticFee | VariableFee | undefined;
  label: string;
  currency: Currency;
  i18n: I18n;
  billingPeriod: TimeFrequency;
  unitPricePeriod: TimeFrequency;
  tax?: Tax;
  variableUnit?: string;
}): ExternalFeesDetailsFee | undefined => {
  if (!fee) {
    return undefined;
  }

  if (isVariableFee(fee)) {
    const unitAmountDecimal = isValidAmount(fee, true)
      ? tax?.rate
        ? getAmountWithTax(fee.unit_amount_decimal, tax?.rate / 100)
        : fee.unit_amount_decimal
      : undefined;
    const amountDecimal = isValidAmount(fee)
      ? tax?.rate
        ? getAmountWithTax(fee.amount_decimal, tax?.rate / 100)
        : fee.amount_decimal
      : undefined;
    const yearlyAmountDecimal = amountDecimal ? getYearlyDecimalAmount(amountDecimal, billingPeriod) : undefined;

    return {
      amount: unitAmountDecimal
        ? formatFeeAmountFromString({
            decimalAmount: unitAmountDecimal,
            currency,
            locale: i18n.language,
            enableSubunitDisplay: true,
          }) + `/${variableUnit}`
        : '-',
      amount_decimal: amountDecimal || '0',
      amount_yearly_decimal: yearlyAmountDecimal || '0',
      amount_yearly: yearlyAmountDecimal
        ? formatFeeAmountFromString({
            decimalAmount: yearlyAmountDecimal,
            currency,
            locale: i18n.language,
          })
        : '-',
      label,
    };
  } else {
    const amountDecimal = isValidAmount(fee)
      ? tax?.rate
        ? getAmountWithTax(fee.amount_decimal, tax?.rate / 100)
        : fee.amount_decimal
      : undefined;
    const yearlyAmountDecimal = amountDecimal ? getYearlyDecimalAmount(amountDecimal, billingPeriod) : undefined;

    return {
      amount: amountDecimal
        ? formatFeeAmountFromString({
            decimalAmount: getNormalizedAmountDecimal(amountDecimal, billingPeriod, unitPricePeriod),
            currency,
            locale: i18n.language,
            enableSubunitDisplay: true,
          }) + ` ${i18n.t(`table_order.recurrences.billing_period.${unitPricePeriod}`)}`
        : '-',
      amount_decimal: amountDecimal || '0',
      amount_yearly_decimal: yearlyAmountDecimal || '0',
      amount_yearly: yearlyAmountDecimal
        ? formatFeeAmountFromString({
            decimalAmount: yearlyAmountDecimal,
            currency,
            locale: i18n.language,
          })
        : '-',
      label,
    };
  }
};

const getMarkupDetailsFee = ({
  priceGetAgConfig,
  externalFeesMetadata,
  options,
  currency,
  i18n,
  billingPeriod,
  unitPricePeriod,
  variableUnit,
}: {
  priceGetAgConfig: PriceGetAg | undefined;
  externalFeesMetadata: ExternalFeesMetadata;
  options:
    | {
        type: 'base_price';
      }
    | {
        type: 'work_price';
        tariffType: TariffTypeGetAg;
      }
    | {
        type: 'additional_markup';
        tariffType: TariffTypeGetAg;
        key: string;
      };
  currency: Currency;
  i18n: I18n;
  billingPeriod: TimeFrequency;
  unitPricePeriod: TimeFrequency;
  variableUnit?: string;
}): ExternalFeesDetailsFee | undefined => {
  if (!priceGetAgConfig) {
    return undefined;
  }

  if (options.type === 'additional_markup' && priceGetAgConfig.additional_markups_enabled) {
    const procurementMarkup = priceGetAgConfig?.additional_markups?.procurement;

    if (!procurementMarkup) {
      return undefined;
    }

    const isValid = isValidAdditionalMarkupAmount(procurementMarkup);

    const yearlyAmountDecimal = isValid
      ? getConsumptionBasedAmounts(
          procurementMarkup?.amount_gross_decimal,
          options.tariffType === 'HT'
            ? externalFeesMetadata.inputs.consumptionHT
            : externalFeesMetadata.inputs.consumptionNT,
          billingPeriod,
        ).yearlyAmountDecimal
      : undefined;

    return {
      label: i18n.t(`table_order.getag_details_table.groups.sales_and_procurement_costs.fees.markup_procurement`),
      amount: isValid
        ? formatFeeAmountFromString({
            decimalAmount: procurementMarkup?.amount_gross_decimal,
            currency,
            locale: i18n.language,
            enableSubunitDisplay: true,
          }) + `/${variableUnit}`
        : '-',
      amount_decimal: procurementMarkup?.amount_gross_decimal || '0',
      amount_yearly_decimal: yearlyAmountDecimal || '0',
      amount_yearly: yearlyAmountDecimal
        ? formatFeeAmountFromString({
            decimalAmount: yearlyAmountDecimal,
            currency,
            locale: i18n.language,
          })
        : '-',
    };
  }

  if (options.type === 'base_price') {
    const isValid = isValidMarkupAmount(priceGetAgConfig);

    const yearlyAmountDecimal = isValid
      ? getYearlyDecimalAmount(priceGetAgConfig?.markup_amount_gross_decimal, billingPeriod)
      : undefined;

    return {
      amount: isValid
        ? formatFeeAmountFromString({
            decimalAmount: getNormalizedAmountDecimal(
              priceGetAgConfig?.markup_amount_gross_decimal,
              billingPeriod,
              unitPricePeriod,
            ),
            currency,
            locale: i18n.language,
            enableSubunitDisplay: true,
          }) + ` ${i18n.t(`table_order.recurrences.billing_period.${unitPricePeriod}`)}`
        : '-',
      amount_decimal: priceGetAgConfig?.markup_amount_gross_decimal || '0',
      amount_yearly_decimal: yearlyAmountDecimal || '0',
      amount_yearly: yearlyAmountDecimal
        ? formatFeeAmountFromString({
            decimalAmount: yearlyAmountDecimal,
            currency,
            locale: i18n.language,
          })
        : '-',
      label: i18n.t('table_order.getag_details_table.groups.sales_and_procurement_costs.fees.markup_base_price'),
    };
  }

  if (options.type === 'work_price') {
    const isValid = isValidMarkupAmount(priceGetAgConfig);

    const yearlyAmountDecimal = isValid
      ? getConsumptionBasedAmounts(
          priceGetAgConfig?.markup_amount_gross_decimal,
          options.tariffType === 'HT'
            ? externalFeesMetadata.inputs.consumptionHT
            : externalFeesMetadata.inputs.consumptionNT,
          billingPeriod,
          currency,
        ).yearlyAmountDecimal
      : undefined;

    return {
      amount: isValid
        ? formatFeeAmountFromString({
            decimalAmount: priceGetAgConfig?.markup_amount_gross_decimal,
            currency,
            locale: i18n.language,
            enableSubunitDisplay: true,
          }) + `/${variableUnit}`
        : '-',
      amount_decimal: priceGetAgConfig?.markup_amount_gross_decimal || '0',
      amount_yearly_decimal: yearlyAmountDecimal || '0',
      amount_yearly: yearlyAmountDecimal
        ? formatFeeAmountFromString({
            decimalAmount: yearlyAmountDecimal,
            currency,
            locale: i18n.language,
          })
        : '-',
      label: i18n.t(`table_order.getag_details_table.groups.sales_and_procurement_costs.fees.markup_work_price`),
    };
  }

  return undefined;
};

const isValidAmount = (fee: StaticFee | VariableFee | undefined, isUnit = false): boolean => {
  if (!fee) return false;

  if (isUnit && isVariableFee(fee)) {
    return Boolean(fee.unit_amount && fee.unit_amount_decimal);
  }

  return Boolean(fee.amount && fee.amount_decimal);
};

const isValidMarkupAmount = (
  getAgConfig: PriceGetAg | undefined,
): getAgConfig is PriceGetAg & {
  markup_amount: number;
  markup_amount_gross_decimal: string;
} => {
  if (!getAgConfig) return false;

  return Boolean(getAgConfig.markup_amount && getAgConfig.markup_amount_gross_decimal);
};

const isValidAdditionalMarkupAmount = (
  additionalMarkup: AdditionalMarkup | undefined,
): additionalMarkup is AdditionalMarkup & {
  amount: number;
  amount_gross_decimal: string;
} => {
  if (!additionalMarkup) return false;

  return Boolean(additionalMarkup.amount && additionalMarkup.amount_gross_decimal);
};

export {
  getConsumptionBasedAmounts,
  getNormalizedAmountDecimal,
  getYearlyDecimalAmount,
  getDetailsFee,
  getMarkupDetailsFee,
  isVariableFee,
};
