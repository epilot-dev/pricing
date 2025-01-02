import { Price } from '../types';

import { normalizePriceMappingInput, normalizeValueToFrequencyUnit } from '.';

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

describe('normalizeNumberToFrequency', () => {
  it.each`
    timeValue    | timeValueFrequency  | targetTimeFrequency | precision    | expectedNormalizedValue
    ${100}       | ${'yearly'}         | ${'weekly'}         | ${4}         | ${1.9231}
    ${100}       | ${'yearly'}         | ${'monthly'}        | ${4}         | ${8.3333}
    ${100}       | ${'yearly'}         | ${'monthly'}        | ${6}         | ${8.333333}
    ${100}       | ${'yearly'}         | ${'every_quarter'}  | ${4}         | ${25}
    ${100}       | ${'yearly'}         | ${'every_6_months'} | ${4}         | ${50}
    ${100}       | ${'yearly'}         | ${'yearly'}         | ${4}         | ${100}
    ${100}       | ${'every_6_months'} | ${'weekly'}         | ${4}         | ${3.8462}
    ${100}       | ${'every_6_months'} | ${'monthly'}        | ${4}         | ${16.6667}
    ${100}       | ${'every_6_months'} | ${'every_quarter'}  | ${4}         | ${50}
    ${100}       | ${'every_6_months'} | ${'every_6_months'} | ${4}         | ${100}
    ${100}       | ${'every_6_months'} | ${'yearly'}         | ${4}         | ${200}
    ${100}       | ${'every_quarter'}  | ${'weekly'}         | ${4}         | ${7.6923}
    ${100}       | ${'every_quarter'}  | ${'monthly'}        | ${4}         | ${33.3333}
    ${100}       | ${'every_quarter'}  | ${'every_quarter'}  | ${4}         | ${100}
    ${100}       | ${'every_quarter'}  | ${'every_6_months'} | ${4}         | ${200}
    ${100}       | ${'every_quarter'}  | ${'yearly'}         | ${4}         | ${400}
    ${1000}      | ${'monthly'}        | ${'weekly'}         | ${4}         | ${250}
    ${1000}      | ${'monthly'}        | ${'monthly'}        | ${4}         | ${1000}
    ${1000}      | ${'monthly'}        | ${'every_quarter'}  | ${4}         | ${3000}
    ${1000}      | ${'monthly'}        | ${'every_6_months'} | ${4}         | ${6000}
    ${1000}      | ${'monthly'}        | ${'yearly'}         | ${4}         | ${12000}
    ${1000}      | ${'weekly'}         | ${'weekly'}         | ${4}         | ${1000}
    ${1000}      | ${'weekly'}         | ${'monthly'}        | ${4}         | ${4000}
    ${1000}      | ${'weekly'}         | ${'every_quarter'}  | ${4}         | ${13000}
    ${1000}      | ${'weekly'}         | ${'every_6_months'} | ${4}         | ${26000}
    ${1000}      | ${'weekly'}         | ${'yearly'}         | ${4}         | ${52000}
    ${0.387676}  | ${'weekly'}         | ${'monthly'}        | ${4}         | ${1.5507}
    ${36.32422}  | ${'yearly'}         | ${'monthly'}        | ${4}         | ${3.027}
    ${24000}     | ${'yearly'}         | ${'Monthly'}        | ${4}         | ${2000}
    ${24000}     | ${'yearly'}         | ${undefined}        | ${4}         | ${24000}
    ${24000}     | ${undefined}        | ${'monthly'}        | ${4}         | ${24000}
    ${'2400.5'}  | ${'monthly'}        | ${'weekly'}         | ${4}         | ${'600.125'}
    ${'1000'}    | ${'monthly'}        | ${'yearly'}         | ${4}         | ${'12000'}
    ${'1000.50'} | ${'monthly'}        | ${'yearly'}         | ${4}         | ${'12006'}
    ${'12006'}   | ${'yearly'}         | ${'monthly'}        | ${4}         | ${'1000.5'}
    ${'159.345'} | ${'yearly'}         | ${'monthly'}        | ${4}         | ${'13.2788'}
    ${'159.345'} | ${'yearly'}         | ${'monthly'}        | ${undefined} | ${'13.27875'}
    ${'159.345'} | ${'yearly'}         | ${'monthly'}        | ${12}        | ${'13.27875'}
    ${'10000'}   | ${'yearly'}         | ${'monthly'}        | ${12}        | ${'833.333333333333'}
    ${'10000'}   | ${'yearly'}         | ${'monthly'}        | ${2}         | ${'833.33'}
  `(
    `should normalize $timeValue/$timeValueFrequency properly to time frequency $targetTimeFrequency`,
    ({ timeValue, timeValueFrequency, targetTimeFrequency, precision, expectedNormalizedValue }) => {
      expect(
        normalizeValueToFrequencyUnit(timeValue, timeValueFrequency, targetTimeFrequency, precision),
      ).toStrictEqual(expectedNormalizedValue);
    },
  );
});
