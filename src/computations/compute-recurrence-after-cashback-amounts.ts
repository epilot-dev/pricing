import { toDineroFromInteger } from '../money/to-dinero';
import type { RecurrenceAmount, CashbackAmount } from '../shared/types';
import { normalizeTimeFrequencyFromDineroInputValue } from '../time-frequency/normalizers';

/**
 * Recurrence amounts after cashbacks can only be computed
 * after all recurrences and cashbacks have been computed.
 *
 * Each cashback entry is subtracted from the recurrence total. Multiple
 * entries may share the same cashback_period (one entry per applied
 * cashback coupon) so we accumulate across the full array.
 */
export const computeRecurrenceAfterCashbackAmounts = (recurrence: RecurrenceAmount, cashbacks: CashbackAmount[]) => {
  if (!recurrence.type) {
    return recurrence;
  }

  const validCashbacks = cashbacks.filter(Boolean);

  if (!validCashbacks.length) {
    return recurrence;
  }

  const summedCashback = validCashbacks.reduce(
    (acc, cashback) => acc.add(toDineroFromInteger(cashback.amount_total)),
    toDineroFromInteger(0),
  );

  const normalizedCashbackAmount =
    recurrence.type === 'recurring'
      ? normalizeTimeFrequencyFromDineroInputValue(summedCashback, 'yearly', recurrence.billing_period!)
      : summedCashback;

  const afterCashbackAmountTotal = toDineroFromInteger(recurrence.amount_total).subtract(normalizedCashbackAmount);

  return {
    ...recurrence,
    after_cashback_amount_total: afterCashbackAmountTotal.getAmount(),
    after_cashback_amount_total_decimal: afterCashbackAmountTotal.toUnit().toString(),
  };
};
