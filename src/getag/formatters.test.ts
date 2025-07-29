import { describe, expect, it } from 'vitest';
import { formatFeeAmountFromString } from './formatters';

describe('formatFeeAmountFromString', () => {
  describe('basic formatting with getFeePrecision rules', () => {
    it.each`
      decimalAmount   | expected           | description
      ${'100'}        | ${'100,00\xa0€'}   | ${'no decimals defaults to 2 precision'}
      ${'100.00'}     | ${'100,00\xa0€'}   | ${'both 3rd and 4th decimals are 0, show 2 decimals'}
      ${'100.0000'}   | ${'100,00\xa0€'}   | ${'both 3rd and 4th decimals are 0, show 2 decimals'}
      ${'100.00000'}  | ${'100,00\xa0€'}   | ${'both 3rd and 4th decimals are 0, show 2 decimals'}
      ${'100.000000'} | ${'100,00\xa0€'}   | ${'both 3rd and 4th decimals are 0, show 2 decimals'}
      ${'100.101'}    | ${'100,101\xa0€'}  | ${'3rd decimal is not 0, show 3 decimals'}
      ${'100.1234'}   | ${'100,1234\xa0€'} | ${'both 3rd and 4th decimals are not 0, show 4 decimals'}
      ${'100.1200'}   | ${'100,12\xa0€'}   | ${'trailing zeros removed, show 2 decimals'}
      ${'100.1230'}   | ${'100,123\xa0€'}  | ${'trailing zeros removed, show 3 decimals'}
      ${'100.1005'}   | ${'100,1005\xa0€'} | ${'3rd decimal is 0 but 4th is not, show 4 decimals'}
      ${'100.2007'}   | ${'100,2007\xa0€'} | ${'show all 4 decimals when needed'}
      ${'100.12345'}  | ${'100,1235\xa0€'} | ${'max 4 decimals, truncate beyond'}
    `('should format $decimalAmount correctly - $description', ({ decimalAmount, expected }) => {
      expect(formatFeeAmountFromString({ decimalAmount })).toStrictEqual(expected);
    });
  });

  describe('subunit display (cents) behavior', () => {
    it.each`
      decimalAmount | enableSubunitDisplay | expected        | description
      ${'0.01'}     | ${true}              | ${'1,00 Cent'}  | ${'small amount displays as cents'}
      ${'0.0123'}   | ${true}              | ${'1,23 Cent'}  | ${'precision applied to cent value'}
      ${'0.0105'}   | ${true}              | ${'1,05 Cent'}  | ${'3rd decimal 0, 4th not 0 in cent value'}
      ${'0.0100'}   | ${true}              | ${'1,00 Cent'}  | ${'trailing zeros in cent value'}
      ${'0.0567'}   | ${true}              | ${'5,67 Cent'}  | ${'multiple digits in cent value'}
      ${'0.01234'}  | ${true}              | ${'1,234 Cent'} | ${'precision rules apply to cent decimal part'}
      ${'1.01'}     | ${true}              | ${'1,01\xa0€'}  | ${'amounts >= 1 not displayed as cents'}
      ${'0.01'}     | ${false}             | ${'0,01\xa0€'}  | ${'subunit display disabled'}
    `('should handle subunit display: $description', ({ decimalAmount, enableSubunitDisplay, expected }) => {
      expect(formatFeeAmountFromString({ decimalAmount, enableSubunitDisplay })).toStrictEqual(expected);
    });
  });

  describe('different currencies and locales', () => {
    it.each`
      decimalAmount | currency | locale  | expected
      ${'100.1234'} | ${'EUR'} | ${'de'} | ${'100,1234\xa0€'}
      ${'100.1234'} | ${'USD'} | ${'en'} | ${'$100.1234'}
      ${'100.1234'} | ${'CHF'} | ${'de'} | ${'100,1234\xa0CHF'}
      ${'0.0123'}   | ${'USD'} | ${'en'} | ${'$0.0123'}
    `(
      'should format $decimalAmount with $currency/$locale as $expected',
      ({ decimalAmount, currency, locale, expected }) => {
        expect(formatFeeAmountFromString({ decimalAmount, currency, locale })).toStrictEqual(expected);
      },
    );
  });

  describe('edge cases and boundary conditions', () => {
    it.each`
      decimalAmount     | expected                 | description
      ${'0'}            | ${'0,00\xa0€'}           | ${'zero amount'}
      ${'0.0'}          | ${'0,00\xa0€'}           | ${'zero with decimal'}
      ${'0.00'}         | ${'0,00\xa0€'}           | ${'zero with two decimals'}
      ${'0.0000'}       | ${'0,00\xa0€'}           | ${'zero with many decimals'}
      ${'1000000'}      | ${'1.000.000,00\xa0€'}   | ${'large integer amount'}
      ${'1000000.1234'} | ${'1.000.000,1234\xa0€'} | ${'large amount with decimals'}
    `('should handle edge case: $description', ({ decimalAmount, expected }) => {
      expect(formatFeeAmountFromString({ decimalAmount })).toStrictEqual(expected);
    });
  });

  describe('precision edge cases based on getFeePrecision rules', () => {
    it.each`
      decimalAmount | expected           | description
      ${'100.1'}    | ${'100,10\xa0€'}   | ${'single decimal, minimum 2 precision'}
      ${'100.12'}   | ${'100,12\xa0€'}   | ${'two decimals, show as is'}
      ${'100.123'}  | ${'100,123\xa0€'}  | ${'three decimals, show as is'}
      ${'100.1000'} | ${'100,10\xa0€'}   | ${'trailing zeros removed, minimum 2'}
      ${'100.1010'} | ${'100,101\xa0€'}  | ${'trailing zero removed, show 3'}
      ${'100.1001'} | ${'100,1001\xa0€'} | ${'3rd decimal 0, 4th not 0, show 4'}
      ${'100.1002'} | ${'100,1002\xa0€'} | ${'3rd decimal 0, 4th not 0, show 4'}
      ${'100.1009'} | ${'100,1009\xa0€'} | ${'3rd decimal 0, 4th not 0, show 4'}
    `('should apply getFeePrecision rules: $description', ({ decimalAmount, expected }) => {
      expect(formatFeeAmountFromString({ decimalAmount })).toStrictEqual(expected);
    });
  });

  describe('complex decimal parsing with formatters', () => {
    it.each`
      decimalAmount   | expected             | description
      ${'1,000.1234'} | ${'1.000,1234\xa0€'} | ${'US format input with precision rules'}
      ${'1.000,1234'} | ${'1.000,1234\xa0€'} | ${'EU format input with precision rules'}
      ${'1000,1005'}  | ${'1.000,1005\xa0€'} | ${'3rd decimal 0, 4th not 0 rule'}
      ${'1000,1200'}  | ${'1.000,12\xa0€'}   | ${'trailing zeros removed'}
    `('should parse and format complex decimals: $description', ({ decimalAmount, expected }) => {
      expect(formatFeeAmountFromString({ decimalAmount })).toStrictEqual(expected);
    });
  });
});
