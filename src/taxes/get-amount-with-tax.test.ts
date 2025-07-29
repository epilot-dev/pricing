import { describe, expect, it } from 'vitest';
import { getAmountWithTax } from './get-amount-with-tax';

describe('getAmountWithTax', () => {
  it.each`
    amount_decimal | taxRate | expected
    ${'100'}       | ${0.1}  | ${'110'}
    ${'100'}       | ${0.2}  | ${'120'}
    ${'100'}       | ${0.3}  | ${'130'}
    ${'100'}       | ${0.4}  | ${'140'}
    ${'100'}       | ${0.5}  | ${'150'}
    ${'100'}       | ${0.6}  | ${'160'}
    ${'100'}       | ${0.7}  | ${'170'}
    ${'100'}       | ${0.8}  | ${'180'}
    ${'100'}       | ${0.9}  | ${'190'}
    ${'100'}       | ${1}    | ${'200'}
  `('should return the correct decimal value with tax', ({ amount_decimal, taxRate, expected }) => {
    expect(getAmountWithTax(amount_decimal, taxRate)).toBe(expected);
  });
});
