import type { Price } from '../shared/types';
import { normalizePriceMappingInput } from './mapping';

const oneTimePrice = {
  type: 'one_time',
} as Price;

const recurringPrice = {
  type: 'recurring',
  billing_period: 'monthly',
} as Price;

describe('normalizePriceMappingInput', () => {
  it.each`
    priceMapping                                       | price             | expected
    ${{ value: 0.35435, frequency_unit: undefined }}   | ${oneTimePrice}   | ${0.35435}
    ${{ value: 0.35435, frequency_unit: 'monthly' }}   | ${oneTimePrice}   | ${0.35435}
    ${{ value: 0.2, frequency_unit: 'yearly' }}        | ${recurringPrice} | ${0.016666666667}
    ${{ value: undefined, frequency_unit: 'monthly' }} | ${recurringPrice} | ${1}
    ${{ value: undefined, frequency_unit: undefined }} | ${oneTimePrice}   | ${undefined}
    ${{ value: undefined, frequency_unit: 'monthly' }} | ${undefined}      | ${undefined}
    ${undefined}                                       | ${recurringPrice} | ${undefined}
  `(
    `should return $expected when priceMaping is $priceMapping, and price is $price`,
    ({ priceMapping, price, expected }) => {
      expect(normalizePriceMappingInput(priceMapping, price)?.toUnit()).toStrictEqual(expected);
    },
  );
});
