import { describe, it, expect } from 'vitest';
import type { RecurrenceAmount, CashbackAmount } from '../../shared/types';
import { computeRecurrenceAfterCashbackAmounts } from '../compute-recurrence-after-cashback-amounts';

const oneTimeRecurrence: RecurrenceAmount = {
  type: 'one_time',
  amount_total: 10000000000000, // 100.00
  amount_subtotal: 8403361344538, // 84.03
  amount_tax: 1596638655462, // 15.97
  amount_subtotal_decimal: '84.03361344538',
  amount_total_decimal: '100.00',
};

const recurringRecurrence: RecurrenceAmount = {
  type: 'recurring',
  billing_period: 'monthly',
  amount_total: 10000000000000, // 100.00
  amount_subtotal: 8403361344538, // 84.03
  amount_tax: 1596638655462, // 15.97
  amount_subtotal_decimal: '84.03361344538',
  amount_total_decimal: '100.00',
};

const cashbacks: CashbackAmount[] = [
  {
    cashback_period: '0',
    amount_total: 2000000000000, // 20.00
  },
];

const incompleteRecurrence: RecurrenceAmount = {
  // type is missing
  amount_total: 10000000000000,
  amount_subtotal: 8403361344538,
  amount_tax: 1596638655462,
  amount_subtotal_decimal: '84.03361344538',
  amount_total_decimal: '100.00',
};

describe('computeRecurrenceAfterCashbackAmounts', () => {
  it('should return original recurrence when no cashbacks are provided', () => {
    const result = computeRecurrenceAfterCashbackAmounts(oneTimeRecurrence, []);
    expect(result).toEqual(oneTimeRecurrence);
  });

  it('should return original recurrence when cashback is undefined', () => {
    const result = computeRecurrenceAfterCashbackAmounts(oneTimeRecurrence, [undefined as unknown as CashbackAmount]);
    expect(result).toEqual(oneTimeRecurrence);
  });

  it('should return original recurrence when recurrence.type is undefined', () => {
    const result = computeRecurrenceAfterCashbackAmounts(incompleteRecurrence, cashbacks);
    expect(result).toEqual(incompleteRecurrence);
  });

  it('should subtract cashback from one-time recurrence without normalization', () => {
    const result = computeRecurrenceAfterCashbackAmounts(oneTimeRecurrence, cashbacks);

    expect(result.after_cashback_amount_total).toBe(8000000000000); // 100 - 20 = 80
    expect(result.after_cashback_amount_total_decimal).toBe('8');
  });

  it('should normalize cashback amount for recurring recurrences', () => {
    const result = computeRecurrenceAfterCashbackAmounts(recurringRecurrence, cashbacks);

    // This will normalize the yearly 20.00 cashback to monthly (20/12 = 1.67)
    // Then subtract from the 100.00 recurrence (100 - 1.67 = 98.33)
    expect(result.after_cashback_amount_total).toBe(9833333333333);
    expect(result.after_cashback_amount_total_decimal).toBe('9.833333333333');
  });
});
