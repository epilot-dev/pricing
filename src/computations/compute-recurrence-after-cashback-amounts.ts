import { toDineroFromInteger } from '../money/to-dinero';
import type { RecurrenceAmount, CashbackAmount } from '../shared/types';
import { normalizeTimeFrequencyFromDineroInputValue } from '../time-frequency/normalizers';

/**
 * Recurrence amounts after cashbacks can only be computed
 * after all recurrences and cashbacks have been computed.
 */
export const computeRecurrenceAfterCashbackAmounts = (recurrence: RecurrenceAmount, cashbacks: CashbackAmount[]) => {
  /* Only the first cashback is taken into account */
  const cashback = cashbacks[0];

  if (!cashback || !recurrence.type) {
    return recurrence;
  }

  const cashbackAmount = toDineroFromInteger(cashback.amount_total);

  const normalizedCashbackAmount =
    recurrence.type === 'recurring'
      ? normalizeTimeFrequencyFromDineroInputValue(cashbackAmount, 'yearly', recurrence.billing_period!)
      : cashbackAmount;

  const afterCashbackAmountTotal = toDineroFromInteger(recurrence.amount_total).subtract(normalizedCashbackAmount);

  return {
    ...recurrence,
    after_cashback_amount_total: afterCashbackAmountTotal.getAmount(),
    after_cashback_amount_total_decimal: afterCashbackAmountTotal.toUnit().toString(),
  };
};
