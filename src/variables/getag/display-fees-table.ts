import type { ExternalFeesTable } from '../types';

export const processExternalDisplayFeesTable = (result: ExternalFeesTable) => {
  // Add aggregated display breakdowns for groups + result
  const groups = Object.values(result.groups || {});

  const unitSummary: string[] = [];
  const yearlySummary: string[] = [];

  groups.forEach((group) => {
    const unitPrices = [];
    const yearlyPrices = [];

    for (const fee of Object.values(group.fees || {})) {
      if (fee && fee.amount) unitPrices.push(`${fee.label}: ${fee.amount}`);
      if (fee && fee.amount_yearly) yearlyPrices.push(`${fee.label}: ${fee.amount_yearly}`);
    }

    group.display_fees_unit_price = unitPrices.join(', ');
    group.display_fees_yearly = yearlyPrices.join(', ');

    if (unitPrices.length) {
      unitSummary.push(`(${group.label}) ${group.display_fees_unit_price}`);
    }

    if (yearlyPrices.length) {
      yearlySummary.push(`(${group.label}) ${group.display_fees_yearly}`);
    }
  });

  result.display_fees_unit_price = unitSummary.join(', ');
  result.display_fees_yearly = yearlySummary.join(', ');
};
