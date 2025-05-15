import type { PriceTier } from '../../types';

export const baseTiersUnitAmount: PriceTier[] = [
  { up_to: 10, unit_amount: 1000, unit_amount_decimal: '10.00' },
  { up_to: 20, unit_amount: 900, unit_amount_decimal: '9.00' },
  { up_to: null, unit_amount: 800, unit_amount_decimal: '8.00' },
];

export const baseTiersFlatFeeAmount: PriceTier[] = [
  { up_to: 10, flat_fee_amount: 1000, flat_fee_amount_decimal: '10.00' },
  { up_to: 20, flat_fee_amount: 900, flat_fee_amount_decimal: '9.00' },
  { up_to: null, flat_fee_amount: 800, flat_fee_amount_decimal: '8.00' },
];

export const mockTranslations = {
  ['selectvalues.Price.unit.kWh']: 'kWh',
  ['selectvalues.Price.unit.unit']: 'unit',
  ['selectvalues.Price.unit.m']: 'm',
  ['starts_at']: 'Starts at',
};
