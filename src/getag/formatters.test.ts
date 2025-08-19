import { describe, expect, it } from 'vitest';
import { formatFeeAmountFromString } from './formatters';

describe('formatFeeAmountFromString', () => {
  describe('default behavior (enableSubunitDisplay = false)', () => {
    it.each`
      decimalAmount     | expected               | description
      ${'100'}          | ${'100,00\xa0€'}       | ${'integer shows 2 decimals'}
      ${'100.1234'}     | ${'100,12\xa0€'}       | ${'rounds to 2 decimals'}
      ${'100.999'}      | ${'101,00\xa0€'}       | ${'rounds up to 2 decimals'}
      ${'0.5'}          | ${'0,50\xa0€'}         | ${'fractional shows 2 decimals'}
      ${'0.1234'}       | ${'0,12\xa0€'}         | ${'fractional rounds to 2 decimals'}
      ${'0.005'}        | ${'0,01\xa0€'}         | ${'small fractional rounds up'}
      ${'0'}            | ${'0,00\xa0€'}         | ${'zero shows 2 decimals'}
      ${'-100.5'}       | ${'-100,50\xa0€'}      | ${'negative shows 2 decimals'}
      ${'1000000.1234'} | ${'1.000.000,12\xa0€'} | ${'large amount with formatting'}
    `('should format $decimalAmount as $expected ($description)', ({ decimalAmount, expected }) => {
      expect(formatFeeAmountFromString({ decimalAmount })).toStrictEqual(expected);
    });
  });

  describe('high precision for variable pricing (enableSubunitDisplay = true)', () => {
    it.each`
      decimalAmount | expected        | description
      ${'0.01'}     | ${'1,00 Cent'}  | ${'small amount displays as cents'}
      ${'0.0123'}   | ${'1,23 Cent'}  | ${'precision applied to cent value'}
      ${'0.0105'}   | ${'1,05 Cent'}  | ${'3rd decimal 0, 4th not 0 in cent value'}
      ${'0.0100'}   | ${'1,00 Cent'}  | ${'trailing zeros in cent value'}
      ${'0.0567'}   | ${'5,67 Cent'}  | ${'multiple digits in cent value'}
      ${'0.01234'}  | ${'1,234 Cent'} | ${'precision rules apply to cent decimal part'}
      ${'1.01'}     | ${'1,01\xa0€'}  | ${'amounts >= 1 show decimals'}
    `('should handle subunit display: $description', ({ decimalAmount, expected }) => {
      expect(formatFeeAmountFromString({ decimalAmount, enableSubunitDisplay: true })).toStrictEqual(expected);
    });
    it.each`
      decimalAmount | expected         | description
      ${'0.05123'}  | ${'5,123 Cent'}  | ${'precise cents per kWh'}
      ${'0.001234'} | ${'0,1234 Cent'} | ${'maximum precision'}
      ${'0.0105'}   | ${'1,05 Cent'}   | ${'smart precision handling'}
      ${'0.0500'}   | ${'5,00 Cent'}   | ${'minimum 2 decimals in cents'}
      ${'0.01'}     | ${'1,00 Cent'}   | ${'basic cent display'}
      ${'1.23'}     | ${'1,23\xa0€'}   | ${'amounts >= 1 use standard formatting'}
    `('should format $decimalAmount as $expected ($description)', ({ decimalAmount, expected }) => {
      expect(formatFeeAmountFromString({ decimalAmount, enableSubunitDisplay: true })).toStrictEqual(expected);
    });

    it('should use standard formatting when enableSubunitDisplay is false', () => {
      expect(formatFeeAmountFromString({ decimalAmount: '0.01', enableSubunitDisplay: false })).toStrictEqual(
        '0,01\xa0€',
      );
    });
  });

  describe('currencies and locales', () => {
    it.each`
      decimalAmount | currency | locale  | expected
      ${'100.1234'} | ${'EUR'} | ${'de'} | ${'100,12\xa0€'}
      ${'100.1234'} | ${'USD'} | ${'en'} | ${'$100.12'}
      ${'100.1234'} | ${'CHF'} | ${'de'} | ${'100,12\xa0CHF'}
      ${'0.0123'}   | ${'USD'} | ${'en'} | ${'$0.01'}
    `(
      'should format $decimalAmount as $expected for $currency/$locale',
      ({ decimalAmount, currency, locale, expected }) => {
        expect(formatFeeAmountFromString({ decimalAmount, currency, locale })).toStrictEqual(expected);
      },
    );
  });

  describe('complex input parsing', () => {
    it.each`
      decimalAmount   | expected           | description
      ${'1,000.1234'} | ${'1.000,12\xa0€'} | ${'US format input'}
      ${'1.000,1234'} | ${'1.000,12\xa0€'} | ${'EU format input'}
      ${'1000,1200'}  | ${'1.000,12\xa0€'} | ${'mixed format input'}
    `('should parse and format $decimalAmount correctly ($description)', ({ decimalAmount, expected }) => {
      expect(formatFeeAmountFromString({ decimalAmount })).toStrictEqual(expected);
    });
  });
});
