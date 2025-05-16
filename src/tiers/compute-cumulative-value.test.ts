import type { PriceTier } from '../shared/types';
import { mockedTranslationFn } from './__tests__/mocks';
import { baseTiersUnitAmount } from './__tests__/tiers.fixtures';
import { computeCumulativeValue } from './compute-cumulative-value';

const decimalTiers: PriceTier[] = [
  {
    up_to: 5,
    unit_amount: 6,
    unit_amount_decimal: '0.055451',
    flat_fee_amount: 0,
    flat_fee_amount_decimal: '0',
  },
  {
    up_to: 7,
    unit_amount: 5,
    unit_amount_decimal: '0.05433',
    flat_fee_amount: 0,
    flat_fee_amount_decimal: '0',
  },
  {
    up_to: 9,
    unit_amount: 5,
    unit_amount_decimal: '0.053234',
    flat_fee_amount: 0,
    flat_fee_amount_decimal: '0',
  },
  {
    up_to: null,
    unit_amount: 5,
    unit_amount_decimal: '0.05432',
    flat_fee_amount: 0,
    flat_fee_amount_decimal: '0',
  },
];
const subunitTiers: PriceTier[] = [
  { up_to: 10, unit_amount: 1, unit_amount_decimal: '0.01' },
  { up_to: 20, unit_amount: 0.9, unit_amount_decimal: '0.009' },
  { up_to: null, unit_amount: 0.8, unit_amount_decimal: '0.008' },
];

const zeroTiers: PriceTier[] = [
  { up_to: 10, unit_amount: 0, unit_amount_decimal: '0.00' },
  { up_to: 20, unit_amount: 0, unit_amount_decimal: '0.00' },
  { up_to: null, unit_amount: 0, unit_amount_decimal: '0.00' },
];

const onRequestTiers: PriceTier[] = [
  { up_to: 10, unit_amount: 1000, unit_amount_decimal: '10.00' },
  { up_to: 20, unit_amount: 900, unit_amount_decimal: '9.00', display_mode: 'on_request' },
  { up_to: null, unit_amount: 800, unit_amount_decimal: '8.00', display_mode: 'on_request' },
];

describe('computeCumulativeValue', () => {
  it.each`
    tiers                  | quantityToSelectTier | unit        | locale       | currency | isTaxInclusive | showOnRequest | showStartsAt | tax             | expected
    ${baseTiersUnitAmount} | ${1}                 | ${'kWh'}    | ${undefined} | ${'EUR'} | ${true}        | ${undefined}  | ${undefined} | ${{ rate: 19 }} | ${{ total: '10,00\xa0€', totalWithPrecision: '10,00\xa0€', average: '10,00\xa0€/kWh', subtotal: '8,40\xa0€', subtotalWithPrecision: '8,403361344538\xa0€', subAverage: '8,40\xa0€/kWh', breakdown: [{ quantityUsed: '1 kWh', tierAmountDecimal: '10,00\xa0€/kWh', totalAmountDecimal: '10,00\xa0€' }] }}
    ${baseTiersUnitAmount} | ${1}                 | ${'kWh'}    | ${undefined} | ${'EUR'} | ${undefined}   | ${undefined}  | ${undefined} | ${{ rate: 19 }} | ${{ total: '10,00\xa0€', totalWithPrecision: '10,00\xa0€', average: '10,00\xa0€/kWh', subtotal: '8,40\xa0€', subtotalWithPrecision: '8,403361344538\xa0€', subAverage: '8,40\xa0€/kWh', breakdown: [{ quantityUsed: '1 kWh', tierAmountDecimal: '10,00\xa0€/kWh', totalAmountDecimal: '10,00\xa0€' }] }}
    ${baseTiersUnitAmount} | ${1}                 | ${'kWh'}    | ${undefined} | ${'EUR'} | ${false}       | ${undefined}  | ${undefined} | ${{ rate: 19 }} | ${{ total: '11,90\xa0€', totalWithPrecision: '11,90\xa0€', average: '11,90\xa0€/kWh', subtotal: '10,00\xa0€', subtotalWithPrecision: '10,00\xa0€', subAverage: '10,00\xa0€/kWh', breakdown: [{ quantityUsed: '1 kWh', tierAmountDecimal: '10,00\xa0€/kWh', totalAmountDecimal: '10,00\xa0€' }] }}
    ${baseTiersUnitAmount} | ${1}                 | ${'kWh'}    | ${undefined} | ${'EUR'} | ${false}       | ${undefined}  | ${undefined} | ${undefined}    | ${{ total: '10,00\xa0€', totalWithPrecision: '10,00\xa0€', average: '10,00\xa0€/kWh', subtotal: '10,00\xa0€', subtotalWithPrecision: '10,00\xa0€', subAverage: '10,00\xa0€/kWh', breakdown: [{ quantityUsed: '1 kWh', tierAmountDecimal: '10,00\xa0€/kWh', totalAmountDecimal: '10,00\xa0€' }] }}
    ${baseTiersUnitAmount} | ${2}                 | ${'kWh'}    | ${undefined} | ${'EUR'} | ${true}        | ${undefined}  | ${undefined} | ${{ rate: 19 }} | ${{ total: '20,00\xa0€', totalWithPrecision: '20,00\xa0€', average: '10,00\xa0€/kWh', subtotal: '16,81\xa0€', subtotalWithPrecision: '16,806722689076\xa0€', subAverage: '8,40\xa0€/kWh', breakdown: [{ quantityUsed: '2 kWh', tierAmountDecimal: '10,00\xa0€/kWh', totalAmountDecimal: '20,00\xa0€' }] }}
    ${baseTiersUnitAmount} | ${2}                 | ${'kWh'}    | ${undefined} | ${'EUR'} | ${undefined}   | ${undefined}  | ${undefined} | ${{ rate: 19 }} | ${{ total: '20,00\xa0€', totalWithPrecision: '20,00\xa0€', average: '10,00\xa0€/kWh', subtotal: '16,81\xa0€', subtotalWithPrecision: '16,806722689076\xa0€', subAverage: '8,40\xa0€/kWh', breakdown: [{ quantityUsed: '2 kWh', tierAmountDecimal: '10,00\xa0€/kWh', totalAmountDecimal: '20,00\xa0€' }] }}
    ${baseTiersUnitAmount} | ${2}                 | ${'kWh'}    | ${undefined} | ${'EUR'} | ${false}       | ${undefined}  | ${undefined} | ${{ rate: 19 }} | ${{ total: '23,80\xa0€', totalWithPrecision: '23,80\xa0€', average: '11,90\xa0€/kWh', subtotal: '20,00\xa0€', subtotalWithPrecision: '20,00\xa0€', subAverage: '10,00\xa0€/kWh', breakdown: [{ quantityUsed: '2 kWh', tierAmountDecimal: '10,00\xa0€/kWh', totalAmountDecimal: '20,00\xa0€' }] }}
    ${baseTiersUnitAmount} | ${2}                 | ${'kWh'}    | ${undefined} | ${'EUR'} | ${false}       | ${undefined}  | ${undefined} | ${undefined}    | ${{ total: '20,00\xa0€', totalWithPrecision: '20,00\xa0€', average: '10,00\xa0€/kWh', subtotal: '20,00\xa0€', subtotalWithPrecision: '20,00\xa0€', subAverage: '10,00\xa0€/kWh', breakdown: [{ quantityUsed: '2 kWh', tierAmountDecimal: '10,00\xa0€/kWh', totalAmountDecimal: '20,00\xa0€' }] }}
    ${baseTiersUnitAmount} | ${5}                 | ${'kWh'}    | ${'en'}      | ${'EUR'} | ${undefined}   | ${undefined}  | ${undefined} | ${{ rate: 19 }} | ${{ total: '€50.00', totalWithPrecision: '€50.00', average: '€10.00/kWh', subAverage: '€8.40/kWh', subtotal: '€42.02', subtotalWithPrecision: '€42.016806722689', breakdown: [{ quantityUsed: '5 kWh', tierAmountDecimal: '€10.00/kWh', totalAmountDecimal: '€50.00' }] }}
    ${baseTiersUnitAmount} | ${15}                | ${'banana'} | ${'en'}      | ${'EUR'} | ${undefined}   | ${undefined}  | ${undefined} | ${{ rate: 19 }} | ${{ total: '€145.00', totalWithPrecision: '€145.00', average: '€9.67/banana', subAverage: '€8.12/banana', subtotal: '€121.85', subtotalWithPrecision: '€121.848739495798', breakdown: [{ quantityUsed: '10 banana', tierAmountDecimal: '€10.00/banana', totalAmountDecimal: '€100.00' }, { quantityUsed: '5 banana', tierAmountDecimal: '€9.00/banana', totalAmountDecimal: '€45.00' }] }}
    ${baseTiersUnitAmount} | ${30}                | ${'kWh'}    | ${'en'}      | ${'USD'} | ${undefined}   | ${undefined}  | ${undefined} | ${{ rate: 19 }} | ${{ total: '$270.00', totalWithPrecision: '$270.00', average: '$9.00/kWh', subAverage: '$7.56/kWh', subtotal: '$226.89', subtotalWithPrecision: '$226.890756302521', breakdown: [{ quantityUsed: '10 kWh', tierAmountDecimal: '$10.00/kWh', totalAmountDecimal: '$100.00' }, { quantityUsed: '10 kWh', tierAmountDecimal: '$9.00/kWh', totalAmountDecimal: '$90.00' }, { quantityUsed: '10 kWh', tierAmountDecimal: '$8.00/kWh', totalAmountDecimal: '$80.00' }] }}
    ${baseTiersUnitAmount} | ${0}                 | ${'kWh'}    | ${'en'}      | ${'USD'} | ${undefined}   | ${undefined}  | ${undefined} | ${{ rate: 19 }} | ${{ total: '$0.00', totalWithPrecision: '$0.00', average: '$0.00/kWh', subAverage: '$0.00/kWh', subtotal: '$0.00', subtotalWithPrecision: '$0.00', breakdown: [{ quantityUsed: '0 kWh', tierAmountDecimal: '$10.00/kWh', totalAmountDecimal: '$0.00' }] }}
    ${subunitTiers}        | ${5}                 | ${'kWh'}    | ${'en'}      | ${'USD'} | ${undefined}   | ${undefined}  | ${undefined} | ${{ rate: 19 }} | ${{ total: '5.00 cents', totalWithPrecision: '5.00 cents', average: '1.00 cent/kWh', subAverage: '0.84 cents/kWh', subtotal: '4.20 cents', subtotalWithPrecision: '4.201681 cents', breakdown: [{ quantityUsed: '5 kWh', tierAmountDecimal: '1.00 cent/kWh', totalAmountDecimal: '5.00 cents' }] }}
    ${zeroTiers}           | ${1}                 | ${'kWh'}    | ${'en'}      | ${'USD'} | ${undefined}   | ${undefined}  | ${undefined} | ${{ rate: 19 }} | ${{ total: '$0.00', totalWithPrecision: '$0.00', average: '$0.00/kWh', subAverage: '$0.00/kWh', subtotal: '$0.00', subtotalWithPrecision: '$0.00', breakdown: [{ quantityUsed: '1 kWh', tierAmountDecimal: '$0.00/kWh', totalAmountDecimal: '$0.00' }] }}
    ${onRequestTiers}      | ${5}                 | ${'kWh'}    | ${'en'}      | ${'EUR'} | ${undefined}   | ${true}       | ${undefined} | ${{ rate: 19 }} | ${{ total: '€50.00', totalWithPrecision: '€50.00', average: '€10.00/kWh', subAverage: '€8.40/kWh', subtotal: '€42.02', subtotalWithPrecision: '€42.016806722689', breakdown: [{ quantityUsed: '5 kWh', tierAmountDecimal: '€10.00/kWh', totalAmountDecimal: '€50.00' }] }}
    ${onRequestTiers}      | ${15}                | ${'kWh'}    | ${'en'}      | ${'EUR'} | ${undefined}   | ${true}       | ${undefined} | ${{ rate: 19 }} | ${'Price on request'}
    ${onRequestTiers}      | ${15}                | ${'kWh'}    | ${'en'}      | ${'EUR'} | ${undefined}   | ${false}      | ${undefined} | ${{ rate: 19 }} | ${{ total: '€145.00', totalWithPrecision: '€145.00', average: '€9.67/kWh', subAverage: '€8.12/kWh', subtotal: '€121.85', subtotalWithPrecision: '€121.848739495798', breakdown: [{ quantityUsed: '10 kWh', tierAmountDecimal: '€10.00/kWh', totalAmountDecimal: '€100.00' }, { quantityUsed: '5 kWh', tierAmountDecimal: '€9.00/kWh', totalAmountDecimal: '€45.00' }] }}
    ${decimalTiers}        | ${7}                 | ${'kWh'}    | ${'en'}      | ${'EUR'} | ${undefined}   | ${false}      | ${undefined} | ${{ rate: 19 }} | ${{ total: '38.59 cents', totalWithPrecision: '38.5915 cents', average: '5.51 cents/kWh', subAverage: '4.63 cents/kWh', subtotal: '32.43 cents', subtotalWithPrecision: '32.429832 cents', breakdown: [{ quantityUsed: '5 kWh', tierAmountDecimal: '5.5451 cents/kWh', totalAmountDecimal: '27.7255 cents' }, { quantityUsed: '2 kWh', tierAmountDecimal: '5.433 cents/kWh', totalAmountDecimal: '10.866 cents' }] }}
    ${decimalTiers}        | ${7}                 | ${'kWh'}    | ${'en'}      | ${'EUR'} | ${undefined}   | ${false}      | ${true}      | ${{ rate: 19 }} | ${{ total: 'Starts at 38.59 cents', totalWithPrecision: 'Starts at 38.5915 cents', average: '5.51 cents/kWh', subAverage: '4.63 cents/kWh', subtotal: 'Starts at 32.43 cents', subtotalWithPrecision: 'Starts at 32.429832 cents', breakdown: [{ quantityUsed: '5 kWh', tierAmountDecimal: '5.5451 cents/kWh', totalAmountDecimal: '27.7255 cents' }, { quantityUsed: '2 kWh', tierAmountDecimal: '5.433 cents/kWh', totalAmountDecimal: '10.866 cents' }] }}
  `(
    'should compute cumulative value correctly when quantityToSelectTier=$quantityToSelectTier, isTaxInclusive=$isTaxInclusive and tax=$tax',
    ({
      tiers,
      quantityToSelectTier,
      unit,
      locale,
      currency,
      showOnRequest,
      showStartsAt,
      isTaxInclusive,
      tax,
      expected,
    }) => {
      const result = computeCumulativeValue(
        tiers,
        quantityToSelectTier,
        unit,
        locale,
        currency,
        mockedTranslationFn,
        isTaxInclusive,
        {
          showOnRequest,
          showStartsAt,
        },
        tax,
      );
      expect(result).toEqual(expected);
    },
  );
});
