import type { Price, RecurrenceAmount, RecurrenceAmountWithTax, Tax } from '@epilot/pricing-client';

export const getPriceRecurrence = (price: Price | undefined, recurrences: RecurrenceAmount[]) => {
  if (price?.type === 'recurring') {
    return recurrences.find(
      (recurrenceItem) => recurrenceItem.type === price.type && recurrenceItem.billing_period === price.billing_period,
    );
  }

  return recurrences.find((recurrenceItem) => recurrenceItem.type === 'one_time');
};

export const getPriceRecurrenceByTax = (
  price: Price | undefined,
  recurrencesByTax: RecurrenceAmountWithTax[],
  taxRate?: Tax['rate'],
) => {
  if (price?.type === 'recurring') {
    return recurrencesByTax.find(
      (recurrenceItem) =>
        recurrenceItem.type === price.type &&
        recurrenceItem.billing_period === price.billing_period &&
        (!taxRate || recurrenceItem.tax?.tax?.rate === taxRate),
    );
  }

  return recurrencesByTax.find(
    (recurrenceItem) => recurrenceItem.type === 'one_time' && (!taxRate || recurrenceItem.tax?.tax?.rate === taxRate),
  );
};
