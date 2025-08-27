import { toDinero } from '../../money/to-dinero';
import type { Currency, I18n } from '../../shared/types';
import { normalizeValueToFrequencyUnit } from '../../time-frequency/normalizers';
import type { TimeFrequency } from '../../time-frequency/types';
import { safeFormatAmount } from '../utils';

export const normalizeToYearlyAmounts = (
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
