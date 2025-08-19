import { describe, expect, it } from 'vitest';
import { formatFeeAmountFromString } from './formatters';

describe('formatFeeAmountFromString', () => {
  describe('formatting amounts >= 1 with no decimals', () => {
    it.each`
      decimalAmount   | expected      | description
      ${'100'}        | ${'100\xa0€'} | ${'integer amount shows no decimals'}
      ${'100.00'}     | ${'100\xa0€'} | ${'round and hide decimals'}
      ${'100.0000'}   | ${'100\xa0€'} | ${'round and hide decimals'}
      ${'100.00000'}  | ${'100\xa0€'} | ${'round and hide decimals'}
      ${'100.000000'} | ${'100\xa0€'} | ${'round and hide decimals'}
      ${'100.101'}    | ${'100\xa0€'} | ${'round down and hide decimals'}
      ${'100.1234'}   | ${'100\xa0€'} | ${'round and hide decimals'}
      ${'100.1200'}   | ${'100\xa0€'} | ${'round and hide decimals'}
      ${'100.1230'}   | ${'100\xa0€'} | ${'round and hide decimals'}
      ${'100.1005'}   | ${'100\xa0€'} | ${'round and hide decimals'}
      ${'100.2007'}   | ${'100\xa0€'} | ${'round and hide decimals'}
      ${'100.12345'}  | ${'100\xa0€'} | ${'round and hide decimals'}
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
      ${'1.01'}     | ${true}              | ${'1\xa0€'}     | ${'amounts >= 1 show no decimals'}
      ${'0.01'}     | ${false}             | ${'0,01\xa0€'}  | ${'subunit display disabled'}
    `('should handle subunit display: $description', ({ decimalAmount, enableSubunitDisplay, expected }) => {
      expect(formatFeeAmountFromString({ decimalAmount, enableSubunitDisplay })).toStrictEqual(expected);
    });

    describe('precision behavior in subunit display', () => {
      it.each`
        decimalAmount | enableSubunitDisplay | expected       | description
        ${'0.005'}    | ${true}              | ${'0,50 Cent'} | ${'show 0.5 cents with precision'}
        ${'0.0055'}   | ${true}              | ${'0,55 Cent'} | ${'show 0.55 cents with precision'}
        ${'0.0195'}   | ${true}              | ${'1,95 Cent'} | ${'show 1.95 cents with precision'}
        ${'0.099'}    | ${true}              | ${'9,90 Cent'} | ${'show 9.9 cents with precision'}
        ${'0.0999'}   | ${true}              | ${'9,99 Cent'} | ${'show 9.99 cents with precision'}
        ${'0.095'}    | ${true}              | ${'9,50 Cent'} | ${'show 9.5 cents with precision'}
        ${'0.0505'}   | ${true}              | ${'5,05 Cent'} | ${'show 5.05 cents with precision'}
        ${'0.0500'}   | ${true}              | ${'5,00 Cent'} | ${'show 5 cents without extra decimals'}
      `('should format cents with precision: $description', ({ decimalAmount, enableSubunitDisplay, expected }) => {
        expect(formatFeeAmountFromString({ decimalAmount, enableSubunitDisplay })).toStrictEqual(expected);
      });
    });
  });

  describe('different currencies and locales', () => {
    it.each`
      decimalAmount | currency | locale  | expected
      ${'100.1234'} | ${'EUR'} | ${'de'} | ${'100\xa0€'}
      ${'100.1234'} | ${'USD'} | ${'en'} | ${'$100'}
      ${'100.1234'} | ${'CHF'} | ${'de'} | ${'100\xa0CHF'}
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
      decimalAmount     | expected            | description
      ${'0'}            | ${'0,00\xa0€'}      | ${'zero amount'}
      ${'0.0'}          | ${'0,00\xa0€'}      | ${'zero with decimal'}
      ${'0.00'}         | ${'0,00\xa0€'}      | ${'zero with two decimals'}
      ${'0.0000'}       | ${'0,00\xa0€'}      | ${'zero with many decimals'}
      ${'1000000'}      | ${'1.000.000\xa0€'} | ${'large integer amount'}
      ${'1000000.1234'} | ${'1.000.000\xa0€'} | ${'large amount with decimals'}
    `('should handle edge case: $description', ({ decimalAmount, expected }) => {
      expect(formatFeeAmountFromString({ decimalAmount })).toStrictEqual(expected);
    });
  });

  describe('precision edge cases for amounts >= 1 (hidden decimals)', () => {
    it.each`
      decimalAmount | expected      | description
      ${'100.1'}    | ${'100\xa0€'} | ${'hide decimals'}
      ${'100.12'}   | ${'100\xa0€'} | ${'hide decimals'}
      ${'100.123'}  | ${'100\xa0€'} | ${'hide decimals'}
      ${'100.1000'} | ${'100\xa0€'} | ${'hide decimals'}
      ${'100.1010'} | ${'100\xa0€'} | ${'hide decimals'}
      ${'100.1001'} | ${'100\xa0€'} | ${'hide decimals'}
      ${'100.1002'} | ${'100\xa0€'} | ${'hide decimals'}
      ${'100.1009'} | ${'100\xa0€'} | ${'hide decimals'}
    `('should apply getFeePrecision rules: $description', ({ decimalAmount, expected }) => {
      expect(formatFeeAmountFromString({ decimalAmount })).toStrictEqual(expected);
    });
  });

  describe('rounding behavior for amounts >= 1', () => {
    it.each`
      decimalAmount | expected        | description
      ${'100.5'}    | ${'101\xa0€'}   | ${'round up at 0.5'}
      ${'100.6'}    | ${'101\xa0€'}   | ${'round up above 0.5'}
      ${'100.75'}   | ${'101\xa0€'}   | ${'round up with multiple decimals'}
      ${'100.999'}  | ${'101\xa0€'}   | ${'round up close to next integer'}
      ${'99.5'}     | ${'100\xa0€'}   | ${'round up crossing hundred boundary'}
      ${'99.99'}    | ${'100\xa0€'}   | ${'round up with high decimals'}
      ${'999.5'}    | ${'1.000\xa0€'} | ${'round up crossing thousand boundary'}
      ${'1.5'}      | ${'2\xa0€'}     | ${'round up small amount'}
      ${'100.4'}    | ${'100\xa0€'}   | ${'round down below 0.5'}
      ${'99.4'}     | ${'99\xa0€'}    | ${'round down below 0.5'}
      ${'1.4'}      | ${'1\xa0€'}     | ${'round down small amount'}
      ${'-100.5'}   | ${'-101\xa0€'}  | ${'round negative amounts correctly'}
      ${'-1.5'}     | ${'-2\xa0€'}    | ${'round negative small amounts correctly'}
      ${'-0.5'}     | ${'-0,50\xa0€'} | ${'negative fractional amounts stay as decimals'}
    `('should round correctly: $description', ({ decimalAmount, expected }) => {
      expect(formatFeeAmountFromString({ decimalAmount })).toStrictEqual(expected);
    });
  });

  describe('fractional amounts < 1 with precision rules', () => {
    it.each`
      decimalAmount | expected         | description
      ${'0.5'}      | ${'0,50\xa0€'}   | ${'show two decimals for 0.5'}
      ${'0.9'}      | ${'0,90\xa0€'}   | ${'show two decimals for 0.9'}
      ${'0.05'}     | ${'0,05\xa0€'}   | ${'show two decimals for small fraction'}
      ${'0.005'}    | ${'0,005\xa0€'}  | ${'show three decimals when needed'}
      ${'0.0005'}   | ${'0,0005\xa0€'} | ${'show four decimals when needed'}
    `('should format fractional amounts: $description', ({ decimalAmount, expected }) => {
      expect(formatFeeAmountFromString({ decimalAmount })).toStrictEqual(expected);
    });

    describe('trailing zeros in fractional amounts', () => {
      it.each`
        decimalAmount | expected         | description
        ${'0.1230'}   | ${'0,123\xa0€'}  | ${'remove trailing zero from 0.1230'}
        ${'0.1200'}   | ${'0,12\xa0€'}   | ${'remove trailing zeros from 0.1200'}
        ${'0.1000'}   | ${'0,10\xa0€'}   | ${'keep minimum 2 decimals from 0.1000'}
        ${'0.1005'}   | ${'0,1005\xa0€'} | ${'show 4 decimals when 3rd is 0 but 4th is not'}
        ${'0.1050'}   | ${'0,105\xa0€'}  | ${'remove trailing zero from 0.1050'}
        ${'0.1234'}   | ${'0,1234\xa0€'} | ${'show all 4 significant decimals'}
        ${'0.123400'} | ${'0,1234\xa0€'} | ${'remove multiple trailing zeros from 0.123400'}
        ${'0.10000'}  | ${'0,10\xa0€'}   | ${'keep minimum 2 decimals from 0.10000'}
        ${'0.50000'}  | ${'0,50\xa0€'}   | ${'keep minimum 2 decimals from 0.50000'}
      `('should handle trailing zeros: $description', ({ decimalAmount, expected }) => {
        expect(formatFeeAmountFromString({ decimalAmount })).toStrictEqual(expected);
      });
    });
  });

  describe('complex decimal parsing with formatters', () => {
    it.each`
      decimalAmount   | expected        | description
      ${'1,000.1234'} | ${'1.000\xa0€'} | ${'US format input, hide decimals for >=1'}
      ${'1.000,1234'} | ${'1.000\xa0€'} | ${'EU format input, hide decimals for >=1'}
      ${'1000,1005'}  | ${'1.000\xa0€'} | ${'hide decimals for >=1'}
      ${'1000,1200'}  | ${'1.000\xa0€'} | ${'hide decimals for >=1'}
    `('should parse and format complex decimals: $description', ({ decimalAmount, expected }) => {
      expect(formatFeeAmountFromString({ decimalAmount })).toStrictEqual(expected);
    });
  });
});
