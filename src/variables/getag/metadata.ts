import type { Currency } from 'dinero.js';
import { formatPriceUnit } from '../../money/formatters';
import type { I18n } from '../../shared/types';
import type { TimeFrequency } from '../../time-frequency/types';
import type { ExternalFeesMetadata } from '../types';
import { safeFormatAmount } from '../utils';
import { normalizeToYearlyAmounts } from './utils';

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
