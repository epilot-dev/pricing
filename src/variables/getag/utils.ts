import type { PriceGetAg, TariffTypeGetAg } from '@epilot/pricing-client';
import { formatFeeAmountFromString } from '../../getag/formatters';
import { DEFAULT_CURRENCY } from '../../money/constants';
import { toDinero } from '../../money/to-dinero';
import type { Currency, I18n, Tax } from '../../shared/types';
import { getAmountWithTax } from '../../taxes/get-amount-with-tax';
import { normalizeValueToFrequencyUnit } from '../../time-frequency/normalizers';
import type { TimeFrequency } from '../../time-frequency/types';
import type { ExternalFeesMetadata, ExternalFeesDetailsFee, StaticFee, VariableFee } from '../types';
import { safeFormatAmount } from '../utils';

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
    const unitAmountDecimal = tax?.rate
      ? getAmountWithTax(fee.unit_amount_decimal, tax?.rate / 100)
      : fee.unit_amount_decimal;
    const amountDecimal = tax?.rate ? getAmountWithTax(fee.amount_decimal, tax?.rate / 100) : fee.amount_decimal;
    const yearlyAmountDecimal = getYearlyDecimalAmount(amountDecimal, billingPeriod);

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
      amount_yearly_decimal: yearlyAmountDecimal,
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
    const amountDecimal = tax?.rate ? getAmountWithTax(fee.amount_decimal, tax?.rate / 100) : fee.amount_decimal;
    const yearlyAmountDecimal = getYearlyDecimalAmount(amountDecimal, billingPeriod);

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
      amount_yearly_decimal: yearlyAmountDecimal,
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

    const yearlyAmountDecimal = getConsumptionBasedAmounts(
      procurementMarkup?.amount_gross_decimal,
      options.tariffType === 'HT'
        ? externalFeesMetadata.inputs.consumptionHT
        : externalFeesMetadata.inputs.consumptionNT,
      billingPeriod,
    ).yearlyAmountDecimal;

    return {
      label: i18n.t(`table_order.getag_details_table.groups.sales_and_procurement_costs.fees.markup_procurement`),
      amount: procurementMarkup?.amount_gross_decimal
        ? formatFeeAmountFromString({
            decimalAmount: procurementMarkup?.amount_gross_decimal,
            currency,
            locale: i18n.language,
            enableSubunitDisplay: true,
          }) + `/${variableUnit}`
        : '-',
      amount_decimal: procurementMarkup?.amount_gross_decimal || '0',
      amount_yearly_decimal: yearlyAmountDecimal,
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
    const yearlyAmountDecimal = priceGetAgConfig?.markup_amount_gross_decimal
      ? getYearlyDecimalAmount(priceGetAgConfig?.markup_amount_gross_decimal, billingPeriod)
      : undefined;

    return {
      amount: priceGetAgConfig?.markup_amount_gross_decimal
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
      amount_yearly_decimal: yearlyAmountDecimal,
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
    const yearlyAmountDecimal = getConsumptionBasedAmounts(
      priceGetAgConfig?.markup_amount_gross_decimal,
      options.tariffType === 'HT'
        ? externalFeesMetadata.inputs.consumptionHT
        : externalFeesMetadata.inputs.consumptionNT,
      billingPeriod,
      currency,
    ).yearlyAmountDecimal;

    return {
      amount: priceGetAgConfig?.markup_amount_gross_decimal
        ? formatFeeAmountFromString({
            decimalAmount: priceGetAgConfig?.markup_amount_gross_decimal,
            currency,
            locale: i18n.language,
            enableSubunitDisplay: true,
          }) + `/${variableUnit}`
        : '-',
      amount_decimal: priceGetAgConfig?.markup_amount_gross_decimal || '0',
      amount_yearly_decimal: yearlyAmountDecimal,
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

export {
  getConsumptionBasedAmounts,
  getNormalizedAmountDecimal,
  getYearlyDecimalAmount,
  getDetailsFee,
  getMarkupDetailsFee,
  normalizeToYearlyAmounts,
  isVariableFee,
};
