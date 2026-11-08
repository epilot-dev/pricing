import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Currency } from '../shared/types';
import { GENERIC_UNIT_DISPLAY_LABEL } from './constants';
import {
  formatAmount,
  formatAmountFromString,
  formatPriceUnit,
  omitTrailingDecimalZeros,
  parseDecimalValue,
  toIntegerAmount,
  unitDisplayLabels,
} from './formatters';
import { toDinero } from './to-dinero';

describe('formatAmount', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be resilient by formatting invalid amounts. defaulting to zero and providing a good log msg', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedAmount = formatAmount({ amount: { invalid: 'thing' } as any });

    expect(formattedAmount).toEqual('0,00\xa0€');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'formatAmount: expects an integer amount, received this instead "[object Object]", fallbacks to zero.',
      new Error('NaN error, unable to cast [object Object] to number.'),
    );
  });

  it('should formats an integer amount', () => {
    const formattedAmount = formatAmount({ amount: 100023 });

    expect(formattedAmount).toEqual('1.000,23\xa0€');
  });

  it.each`
    amount     | enableSubunitDisplay | expected
    ${23}      | ${true}              | ${'23 Cent'}
    ${-107360} | ${true}              | ${'-1.073,60\xa0€'}
    ${-3}      | ${true}              | ${'-3 Cent'}
    ${78}      | ${false}             | ${'0,78\xa0€'}
  `(
    'should format an integer amount to cents when price is between -1 and 1',
    ({
      amount,
      enableSubunitDisplay,
      expected,
    }: {
      amount: number;
      enableSubunitDisplay: boolean;
      expected: string;
    }) => {
      const formattedAmount = formatAmount({ amount, enableSubunitDisplay });

      expect(formattedAmount).toEqual(expected);
    },
  );

  it('should formats an integer amount as string', () => {
    const formattedAmount = formatAmount({ amount: '100023', locale: 'de-DE' });

    expect(formattedAmount).toEqual('1.000,23\xa0€');
  });

  it('should formats an integer amount as string', () => {
    const formattedAmount = formatAmount({ amount: '100023', locale: 'en-GB' });

    expect(formattedAmount).toEqual('€1,000.23');
  });

  it('should formats an integer amount, with a currency into a formatted text string', () => {
    const formattedAmount = formatAmount({
      amount: 100023,
      currency: 'EUR',
      format: '$0,0.00',
    });

    expect(formattedAmount).toEqual('1.000,23\xa0€');
  });

  it('should formats an integer amount as string, with a currency into a formatted text string', () => {
    const formattedAmount = formatAmount({
      amount: '100023',
      currency: 'EUR',
      format: '$0,0.00',
    });

    expect(formattedAmount).toEqual('1.000,23\xa0€');
  });

  it('should formats an integer amount, based on the locale', () => {
    const formattedAmount = formatAmount({
      amount: 100023,
      currency: 'EUR',
      format: '$0,0.00',
      locale: 'de-DE',
    });

    expect(formattedAmount).toEqual('1.000,23\xa0€');
  });

  it('should formats an integer amount as string, based on the locale', () => {
    const formattedAmount = formatAmount({
      amount: '100023',
      currency: 'EUR',
      format: '$0,0.00',
      locale: 'de-DE',
    });

    expect(formattedAmount).toEqual('1.000,23\xa0€');
  });

  it('should format if the amount is invalid with fallback to zero', () => {
    expect(() => {
      formatAmount({ amount: 'invalid_amount' });
    }).not.toThrow();
  });

  it.each`
    amount       | expected
    ${100.5}     | ${'1,01\xa0€'}
    ${100.4}     | ${'1,00\xa0€'}
    ${-100.5}    | ${'-1,00\xa0€'}
    ${-0.4}      | ${'0,00\xa0€'}
    ${Infinity}  | ${'0,00\xa0€'}
    ${-Infinity} | ${'0,00\xa0€'}
    ${NaN}       | ${'0,00\xa0€'}
  `(
    'should never throw: rounds finite floats and falls back to zero for non-finite amounts ($amount)',
    ({ amount, expected }: { amount: number; expected: string }) => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);

      let formattedAmount = '';
      expect(() => {
        formattedAmount = formatAmount({ amount });
      }).not.toThrow();

      expect(formattedAmount).toEqual(expected);
    },
  );

  it('should round a finite float to the nearest minor unit without logging an error', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(formatAmount({ amount: 100.5 })).toEqual('1,01\xa0€');
    expect(formatAmount({ amount: 100.4 })).toEqual('1,00\xa0€');
    expect(formatAmount({ amount: -100.5 })).toEqual('-1,00\xa0€');
    // Math.round(-0.4) === -0, normalised to +0 so no spurious minus sign is shown
    expect(formatAmount({ amount: -0.4 })).toEqual('0,00\xa0€');

    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should fall back to zero and log an error for a non-finite amount', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(formatAmount({ amount: Infinity })).toEqual('0,00\xa0€');

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'formatAmount: expects an integer amount, received this instead "Infinity", fallbacks to zero.',
      new Error('NaN error, unable to cast Infinity to number.'),
    );
  });

  it('should round a finite float before the subunit (cents) display path', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    // Math.round(22.6) === 23 -> 0,23 € -> displayed as cents
    expect(formatAmount({ amount: 22.6, enableSubunitDisplay: true })).toEqual('23 Cent');

    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
});

describe('formatAmountFromString', () => {
  it.each`
    unitAmountDecimal | currency | locale     | enableSubunitDisplay | precision    | expected
    ${'0.0100'}       | ${'EUR'} | ${'de'}    | ${true}              | ${undefined} | ${'1,00 Cent'}
    ${'0.0200'}       | ${'EUR'} | ${'de-DE'} | ${true}              | ${undefined} | ${'2,00 Cent'}
    ${'-1.0100'}      | ${'EUR'} | ${'de'}    | ${true}              | ${undefined} | ${'-1,01\xa0€'}
    ${'-0.0300'}      | ${'EUR'} | ${'de'}    | ${true}              | ${undefined} | ${'-3,00 Cent'}
    ${'1.0205'}       | ${'EUR'} | ${'de'}    | ${true}              | ${undefined} | ${'1,02\xa0€'}
    ${'0.0205'}       | ${'USD'} | ${'en'}    | ${true}              | ${undefined} | ${'2.05 cents'}
    ${'0.0205123'}    | ${'USD'} | ${'en'}    | ${true}              | ${4}         | ${'2.0512 cents'}
    ${'10.0205'}      | ${'USD'} | ${'en'}    | ${true}              | ${undefined} | ${'$10.02'}
    ${'0.0100'}       | ${'JPY'} | ${'en'}    | ${true}              | ${undefined} | ${'1.00 cent' /* JPY is not supported, fallback to cents */}
    ${'0.0100'}       | ${'EUR'} | ${'de'}    | ${false}             | ${undefined} | ${'0,01\xa0€'}
    ${'10.00'}        | ${'EUR'} | ${'de'}    | ${false}             | ${undefined} | ${'10,00\xa0€'}
    ${'10.50'}        | ${'EUR'} | ${'de'}    | ${false}             | ${undefined} | ${'10,50\xa0€'}
    ${'10.51234'}     | ${'EUR'} | ${'de'}    | ${false}             | ${4}         | ${'10,5123\xa0€'}
  `(
    'should format an amount in cents when price is between -1 and 1',
    ({
      unitAmountDecimal,
      currency,
      locale,
      enableSubunitDisplay,
      precision,
      expected,
    }: {
      unitAmountDecimal: string;
      currency: Currency;
      locale: string;
      enableSubunitDisplay: boolean;
      precision: number;
      expected: string;
    }) => {
      const formattedAmount = formatAmountFromString({
        decimalAmount: unitAmountDecimal,
        currency,
        locale,
        precision,
        enableSubunitDisplay,
      });

      expect(formattedAmount).toBe(expected);
    },
  );

  it('should convert a decimal string to a formatted amount with default parameters', () => {
    const formattedAmount = formatAmountFromString({ decimalAmount: '1000.2332878348' });

    expect(formattedAmount).toEqual('1.000,23\xa0€');
  });

  it.each`
    unitAmountDecimal    | expected
    ${'1000.2332878348'} | ${'1.000,2332878348\xa0€'}
    ${'10.055055'}       | ${'10,055055\xa0€'}
    ${'9.5'}             | ${'9,50\xa0€'}
    ${'0.020511'}        | ${'2,0511 Cent'}
    ${'0.03'}            | ${'3,00 Cent'}
    ${'0.4'}             | ${'40,00 Cent'}
    ${'10.06'}           | ${'10,06\xa0€'}
  `(
    'should convert a decimal string to a formatted amount without rounding when using real precision',
    ({ unitAmountDecimal, expected }: { unitAmountDecimal: string; expected: string }) => {
      const formattedAmount = formatAmountFromString({
        decimalAmount: unitAmountDecimal,
        useRealPrecision: true,
        enableSubunitDisplay: true,
      });

      expect(formattedAmount).toEqual(expected);
    },
  );

  it.each`
    unitAmountDecimal    | expected
    ${'1000.2332878348'} | ${'1.000,2332878348\xa0€'}
    ${'10.055055'}       | ${'10,055055\xa0€'}
    ${'9.5'}             | ${'9,50\xa0€'}
    ${'0.020511'}        | ${'0,020511\xa0€'}
    ${'0.03'}            | ${'0,03\xa0€'}
    ${'0.4'}             | ${'0,40\xa0€'}
    ${'10.06'}           | ${'10,06\xa0€'}
    ${'0.054'}           | ${'0,054\xa0€'}
    ${'1000,00'}         | ${'1.000,00\xa0€'}
    ${'1,000.00'}        | ${'1.000,00\xa0€'}
    ${'1.000.000,00'}    | ${'1.000.000,00\xa0€'}
    ${'1.000.000.50'}    | ${'100.000.050,00\xa0€'}
    ${'1,000,000,50'}    | ${'100.000.050,00\xa0€'}
    ${'1.000.000.50,20'} | ${'100.000.050,20\xa0€'}
    ${'1,000,000,50.20'} | ${'100.000.050,20\xa0€'}
  `(
    'should convert a decimal string to a formatted amount without rounding when useRealPrecision=true and enableSubunitDisplay=false',
    ({ unitAmountDecimal, expected }: { unitAmountDecimal: string; expected: string }) => {
      const formattedAmount = formatAmountFromString({
        decimalAmount: unitAmountDecimal,
        useRealPrecision: true,
        enableSubunitDisplay: false,
      });

      expect(formattedAmount).toEqual(expected);
    },
  );

  it('should convert a decimal string to a formatted amount with input parameters', () => {
    const formattedAmount = formatAmountFromString({
      decimalAmount: '1000.2332878348',
      precision: 5,
      currency: 'EUR',
      format: '$0,0.00000',
    });

    expect(formattedAmount).toEqual('1.000,23329\xa0€');
    const result = toIntegerAmount('12345');
    expect(result).toEqual(1234500);
  });

  it('should convert a decimal string to formatted amount based on locale', () => {
    const formattedAmount = formatAmountFromString({
      decimalAmount: '1000.2332878348',
      precision: 5,
      currency: 'EUR',
      format: '$0,0.00000',
      locale: 'de-DE',
    });

    expect(formattedAmount).toEqual('1.000,23329\xa0€');
  });
});

describe('toDinero', () => {
  it('should convert a unit decimal with currency to a dinero object', () => {
    const dineroAmount = toDinero('1000.2332878348', 'EUR');

    expect(dineroAmount.getAmount()).toStrictEqual(1000233287834800);
    expect(dineroAmount.convertPrecision(2).getAmount()).toStrictEqual(100023);
    expect(dineroAmount.convertPrecision(2).toFormat()).toStrictEqual('€1,000.23');
  });
});

describe('formatPriceUnit', () => {
  describe('given hideGenericUnitLabel = false', () => {
    it.each(['', ' ', null, undefined])(
      'should return the generic unit display label when the input unit is %o',
      (unit) => {
        const result = formatPriceUnit(unit as Parameters<typeof formatPriceUnit>[0]);

        expect(result).toStrictEqual(GENERIC_UNIT_DISPLAY_LABEL);
      },
    );
  });

  describe('given hideGenericUnitLabel = true', () => {
    it.each(['', ' ', null, undefined])(
      'should return an empty unit display label when the input unit is %o',
      (unit) => {
        const result = formatPriceUnit(unit as Parameters<typeof formatPriceUnit>[0], true);

        expect(result).toStrictEqual('');
      },
    );

    it("should return the same value when a price unit doesn't have a display label", () => {
      const unit = 'not_unit';
      const expectedResult = 'not_unit';
      const result = formatPriceUnit(unit as Parameters<typeof formatPriceUnit>[0], true);

      expect(result).toStrictEqual(expectedResult);
    });
  });

  it.each(Object.keys(unitDisplayLabels))(
    'should return the expected value for unit %o when the price unit is formatted',
    (unitCode) => {
      const result = formatPriceUnit(unitCode);

      expect(result).toStrictEqual(unitDisplayLabels[unitCode as keyof typeof unitDisplayLabels]);
    },
  );
});

describe('omitTrailingDecimalZeros', () => {
  it.each`
    price                | expected
    ${'10.00 €'}         | ${'10 €'}
    ${'10,00 €'}         | ${'10 €'}
    ${'1.000,00 €'}      | ${'1.000 €'}
    ${'10.50 €'}         | ${'10.50 €'}
    ${'10,50 €'}         | ${'10,50 €'}
    ${'€10.00'}          | ${'€10'}
    ${'€10.00/Stück'}    | ${'€10/Stück'}
    ${'€10,00/Stück'}    | ${'€10/Stück'}
    ${'10.00 € / Monat'} | ${'10 € / Monat'}
    ${'10,00 € / Monat'} | ${'10 € / Monat'}
    ${'0.00 €'}          | ${'0 €'}
    ${'10.20 €'}         | ${'10.20 €'}
  `('should transform "$price" into "$expected"', ({ price, expected }) => {
    expect(omitTrailingDecimalZeros(price)).toEqual(expected);
  });
});

describe('parseDecimalValue', () => {
  it.each`
    value                | expected
    ${'1000,00'}         | ${'1000.00'}
    ${'1,000.00'}        | ${'1000.00'}
    ${'1.000.000,00'}    | ${'1000000.00'}
    ${'1.000.000.50'}    | ${'100000050.00'}
    ${'1,000,000,50'}    | ${'100000050.00'}
    ${'1.000.000.50,20'} | ${'100000050.20'}
    ${'1,000,000,50.20'} | ${'100000050.20'}
  `('should parse $value into $expected', ({ value, expected }) => {
    expect(parseDecimalValue(value)).toEqual(expected);
  });
});
