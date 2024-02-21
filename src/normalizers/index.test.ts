import { Price } from '../types';

import { normalizePriceMappingInput, normalizeTimeFrequency } from '.';

describe('normalizePriceMappingInput', () => {
  const oneTimePrice = {
    type: 'one_time',
  } as Price;

  const recurringPrice = {
    type: 'recurring',
    billing_period: 'monthly',
  } as Price;

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

describe('normalizeTimeFrequency', () => {
  it.each`
    timeValue   | timeValueFrequency  | targetTimeFrequency | expectedNormalizedValue
    ${100}      | ${'yearly'}         | ${'weekly'}         | ${1.9231}
    ${100}      | ${'yearly'}         | ${'monthly'}        | ${8.3333}
    ${100}      | ${'yearly'}         | ${'every_quarter'}  | ${25}
    ${100}      | ${'yearly'}         | ${'every_6_months'} | ${50}
    ${100}      | ${'yearly'}         | ${'yearly'}         | ${100}
    ${100}      | ${'every_6_months'} | ${'weekly'}         | ${3.8462}
    ${100}      | ${'every_6_months'} | ${'monthly'}        | ${16.6667}
    ${100}      | ${'every_6_months'} | ${'every_quarter'}  | ${50}
    ${100}      | ${'every_6_months'} | ${'every_6_months'} | ${100}
    ${100}      | ${'every_6_months'} | ${'yearly'}         | ${200}
    ${100}      | ${'every_quarter'}  | ${'weekly'}         | ${7.6923}
    ${100}      | ${'every_quarter'}  | ${'monthly'}        | ${33.3333}
    ${100}      | ${'every_quarter'}  | ${'every_quarter'}  | ${100}
    ${100}      | ${'every_quarter'}  | ${'every_6_months'} | ${200}
    ${100}      | ${'every_quarter'}  | ${'yearly'}         | ${400}
    ${1000}     | ${'monthly'}        | ${'weekly'}         | ${250}
    ${1000}     | ${'monthly'}        | ${'monthly'}        | ${1000}
    ${1000}     | ${'monthly'}        | ${'every_quarter'}  | ${3000}
    ${1000}     | ${'monthly'}        | ${'every_6_months'} | ${6000}
    ${1000}     | ${'monthly'}        | ${'yearly'}         | ${12000}
    ${1000}     | ${'weekly'}         | ${'weekly'}         | ${1000}
    ${1000}     | ${'weekly'}         | ${'monthly'}        | ${4000}
    ${1000}     | ${'weekly'}         | ${'every_quarter'}  | ${13000}
    ${1000}     | ${'weekly'}         | ${'every_6_months'} | ${26000}
    ${1000}     | ${'weekly'}         | ${'yearly'}         | ${52000}
    ${0.387676} | ${'weekly'}         | ${'monthly'}        | ${1.5507}
    ${36.32422} | ${'yearly'}         | ${'monthly'}        | ${3.027}
    ${24000}    | ${'yearly'}         | ${'Monthly'}        | ${2000}
    ${24000}    | ${'yearly'}         | ${undefined}        | ${24000}
    ${24000}    | ${undefined}        | ${'monthly'}        | ${24000}
    ${'2400.5'} | ${'monthly'}        | ${'weekly'}         | ${600.125}
    ${'1000'}   | ${'monthly'}        | ${'yearly'}         | ${12000}
    ${'1000.50'}| ${'monthly'}        | ${'yearly'}         | ${12006}
    ${'12006'}  | ${'yearly'}        | ${'monthly'}         | ${1000.50}
    ${'159.345'}| ${'yearly'}        | ${'monthly'}         | ${13.2788}
  `(
    `should normalize $timeValue/$timeValueFrequency properly to time frequency $targetTimeFrequency`,
    ({ timeValue, timeValueFrequency, targetTimeFrequency, expectedNormalizedValue }) => {
      expect(normalizeTimeFrequency(timeValue, timeValueFrequency, targetTimeFrequency)).toStrictEqual(
        expectedNormalizedValue,
      );
    },
  );
});
