import { describe, expect, it } from 'vitest';
import { convertUnitAmountToBillingAmount } from './converters';

describe('convertUnitAmountToBillingAmount', () => {
  it.each`
    unitAmountDecimal | quantity | quantityPeriod | desiredBillingPeriod | precision    | expected
    ${'0.10'}         | ${2000}  | ${'yearly'}    | ${'monthly'}         | ${12}        | ${'16.666666666667'}
    ${'0.10'}         | ${2000}  | ${'yearly'}    | ${'monthly'}         | ${4}         | ${'16.6667'}
    ${'0.10'}         | ${2000}  | ${'yearly'}    | ${'monthly'}         | ${1}         | ${'16.7'}
    ${'0.15'}         | ${2000}  | ${'yearly'}    | ${'monthly'}         | ${undefined} | ${'25'}
    ${'15'}           | ${10}    | ${'monthly'}   | ${'yearly'}          | ${undefined} | ${'1800'}
  `(
    'should convert a unit amount to a billing amount',
    ({ unitAmountDecimal, quantity, quantityPeriod, desiredBillingPeriod, precision, expected }) => {
      const result = convertUnitAmountToBillingAmount(
        unitAmountDecimal,
        quantity,
        quantityPeriod,
        desiredBillingPeriod,
        precision,
      );
      expect(result).toBe(expected);
    },
  );
});
