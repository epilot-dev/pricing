import { Currency } from 'dinero.js';

import { PricingModel } from '../pricing';
import { PriceTier } from '../types';

import {
  computeCumulativeValue,
  getDisplayTierByQuantity,
  getDisplayTiersByQuantity,
  getTierDescription,
} from './index';

const baseTiers: PriceTier[] = [
  { up_to: 10, unit_amount: 1000, unit_amount_decimal: '10.00' },
  { up_to: 20, unit_amount: 900, unit_amount_decimal: '9.00' },
  { up_to: null, unit_amount: 800, unit_amount_decimal: '8.00' },
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

const mockTranslations = {
  ['selectvalues.Price.unit.kWh' as string]: 'kWh',
  ['selectvalues.Price.unit.unit' as string]: 'unit',
  ['selectvalues.Price.unit.m' as string]: 'm',
  ['starts_at' as string]: 'Starts at',
};

const t = jest.fn().mockImplementation((key: string, { defaultValue }) => mockTranslations[key] ?? defaultValue ?? key);

describe('getDisplayTierByQuantity', () => {
  it.each`
    tiers        | quantity     | pricingModel                    | expected
    ${baseTiers} | ${-1}        | ${PricingModel.tieredGraduated} | ${[baseTiers[0]]}
    ${baseTiers} | ${0}         | ${PricingModel.tieredGraduated} | ${[baseTiers[0]]}
    ${baseTiers} | ${5}         | ${PricingModel.tieredGraduated} | ${[baseTiers[0]]}
    ${baseTiers} | ${10}        | ${PricingModel.tieredGraduated} | ${[baseTiers[0]]}
    ${baseTiers} | ${10.999}    | ${PricingModel.tieredGraduated} | ${[baseTiers[0], baseTiers[1]]}
    ${baseTiers} | ${15}        | ${PricingModel.tieredGraduated} | ${[baseTiers[0], baseTiers[1]]}
    ${baseTiers} | ${20}        | ${PricingModel.tieredGraduated} | ${[baseTiers[0], baseTiers[1]]}
    ${baseTiers} | ${21}        | ${PricingModel.tieredGraduated} | ${baseTiers}
    ${baseTiers} | ${100}       | ${PricingModel.tieredGraduated} | ${baseTiers}
    ${undefined} | ${30}        | ${PricingModel.tieredGraduated} | ${undefined}
    ${baseTiers} | ${undefined} | ${PricingModel.tieredGraduated} | ${[baseTiers[0]]}
    ${baseTiers} | ${-1}        | ${PricingModel.tieredVolume}    | ${[baseTiers[0]]}
    ${baseTiers} | ${0}         | ${PricingModel.tieredVolume}    | ${[baseTiers[0]]}
    ${undefined} | ${0}         | ${PricingModel.tieredVolume}    | ${undefined}
    ${baseTiers} | ${undefined} | ${PricingModel.tieredVolume}    | ${[baseTiers[0]]}
    ${baseTiers} | ${5}         | ${PricingModel.tieredVolume}    | ${[baseTiers[0]]}
    ${baseTiers} | ${10}        | ${PricingModel.tieredVolume}    | ${[baseTiers[0]]}
    ${baseTiers} | ${10.999}    | ${PricingModel.tieredVolume}    | ${[baseTiers[1]]}
    ${baseTiers} | ${15}        | ${PricingModel.tieredVolume}    | ${[baseTiers[1]]}
    ${baseTiers} | ${20}        | ${PricingModel.tieredVolume}    | ${[baseTiers[1]]}
    ${baseTiers} | ${21}        | ${PricingModel.tieredVolume}    | ${[baseTiers[2]]}
    ${baseTiers} | ${100}       | ${PricingModel.tieredVolume}    | ${[baseTiers[2]]}
    ${baseTiers} | ${0}         | ${PricingModel.tieredFlatFee}   | ${[baseTiers[0]]}
    ${undefined} | ${0}         | ${PricingModel.tieredFlatFee}   | ${undefined}
    ${baseTiers} | ${undefined} | ${PricingModel.tieredFlatFee}   | ${[baseTiers[0]]}
    ${baseTiers} | ${5}         | ${PricingModel.tieredFlatFee}   | ${[baseTiers[0]]}
    ${baseTiers} | ${10}        | ${PricingModel.tieredFlatFee}   | ${[baseTiers[0]]}
    ${baseTiers} | ${10.999}    | ${PricingModel.tieredFlatFee}   | ${[baseTiers[1]]}
    ${baseTiers} | ${15}        | ${PricingModel.tieredFlatFee}   | ${[baseTiers[1]]}
    ${baseTiers} | ${20}        | ${PricingModel.tieredFlatFee}   | ${[baseTiers[1]]}
    ${baseTiers} | ${21}        | ${PricingModel.tieredFlatFee}   | ${[baseTiers[2]]}
    ${baseTiers} | ${100}       | ${PricingModel.tieredFlatFee}   | ${[baseTiers[2]]}
    ${baseTiers} | ${100}       | ${undefined}                    | ${[baseTiers[0]]}
  `(
    'should return correctly for quantity=$quantity and pricingModel=$pricingModel',
    ({
      tiers,
      quantity,
      pricingModel,
      expected,
    }: {
      tiers: PriceTier[];
      quantity: number;
      pricingModel: PricingModel;
      expected: PriceTier[] | undefined;
    }) => {
      expect(getDisplayTiersByQuantity(tiers, quantity, pricingModel)).toEqual(expected);
    },
  );
});

describe('getDisplayTiersByQuantity', () => {
  it.each`
    tiers        | quantity                           | pricingModel                    | expected
    ${baseTiers} | ${-1}                              | ${PricingModel.tieredGraduated} | ${baseTiers[0]}
    ${baseTiers} | ${Math.floor(Math.random() * 100)} | ${PricingModel.tieredGraduated} | ${baseTiers[0]}
    ${undefined} | ${Math.floor(Math.random() * 100)} | ${PricingModel.tieredGraduated} | ${undefined}
    ${baseTiers} | ${undefined}                       | ${PricingModel.tieredGraduated} | ${baseTiers[0]}
    ${baseTiers} | ${-1}                              | ${PricingModel.tieredVolume}    | ${baseTiers[0]}
    ${baseTiers} | ${0}                               | ${PricingModel.tieredVolume}    | ${baseTiers[0]}
    ${undefined} | ${0}                               | ${PricingModel.tieredVolume}    | ${undefined}
    ${baseTiers} | ${undefined}                       | ${PricingModel.tieredVolume}    | ${baseTiers[0]}
    ${baseTiers} | ${5}                               | ${PricingModel.tieredVolume}    | ${baseTiers[0]}
    ${baseTiers} | ${10}                              | ${PricingModel.tieredVolume}    | ${baseTiers[0]}
    ${baseTiers} | ${10.999}                          | ${PricingModel.tieredVolume}    | ${baseTiers[1]}
    ${baseTiers} | ${15}                              | ${PricingModel.tieredVolume}    | ${baseTiers[1]}
    ${baseTiers} | ${20}                              | ${PricingModel.tieredVolume}    | ${baseTiers[1]}
    ${baseTiers} | ${21}                              | ${PricingModel.tieredVolume}    | ${baseTiers[2]}
    ${baseTiers} | ${100}                             | ${PricingModel.tieredVolume}    | ${baseTiers[2]}
    ${baseTiers} | ${0}                               | ${PricingModel.tieredFlatFee}   | ${baseTiers[0]}
    ${undefined} | ${0}                               | ${PricingModel.tieredFlatFee}   | ${undefined}
    ${baseTiers} | ${undefined}                       | ${PricingModel.tieredFlatFee}   | ${baseTiers[0]}
    ${baseTiers} | ${5}                               | ${PricingModel.tieredFlatFee}   | ${baseTiers[0]}
    ${baseTiers} | ${10}                              | ${PricingModel.tieredFlatFee}   | ${baseTiers[0]}
    ${baseTiers} | ${10.999}                          | ${PricingModel.tieredFlatFee}   | ${baseTiers[1]}
    ${baseTiers} | ${15}                              | ${PricingModel.tieredFlatFee}   | ${baseTiers[1]}
    ${baseTiers} | ${20}                              | ${PricingModel.tieredFlatFee}   | ${baseTiers[1]}
    ${baseTiers} | ${21}                              | ${PricingModel.tieredFlatFee}   | ${baseTiers[2]}
    ${baseTiers} | ${100}                             | ${PricingModel.tieredFlatFee}   | ${baseTiers[2]}
    ${baseTiers} | ${100}                             | ${undefined}                    | ${baseTiers[0]}
  `(
    'should return correctly for quantity=$quantity and pricingModel=$pricingModel',
    ({
      tiers,
      quantity,
      pricingModel,
      expected,
    }: {
      tiers: PriceTier[];
      quantity: number;
      pricingModel: PricingModel;
      expected: string;
    }) => {
      expect(getDisplayTierByQuantity(tiers, quantity, pricingModel)).toEqual(expected);
    },
  );
});

describe('getTierDescription', () => {
  const tierWithUnitAmount = {
    up_to: 10,
    unit_amount: 1000,
    unit_amount_decimal: '10',
  };

  const tierWithSubunitAmount = {
    up_to: 10,
    unit_amount: 5,
    unit_amount_decimal: '0.05',
  };

  const tierWithUnitAmountZero = {
    up_to: 10,
    unit_amount: 0,
    unit_amount_decimal: '0',
  };

  const tierWithUnitAmountUndefined = {
    up_to: 10,
    unit_amount: undefined,
    unit_amount_decimal: undefined,
  } as unknown as PriceTier;

  const tierWithFlatFeeAmount = {
    up_to: 10,
    flat_fee_amount: 1000,
    flat_fee_amount_decimal: '10',
  };

  const tierWithFlatFeeAmountZero = {
    up_to: 10,
    flat_fee_amount: 0,
    flat_fee_amount_decimal: '0',
  };

  const tierWithFlatFeeAmountUndefined = {
    up_to: 10,
    flat_fee_amount: undefined,
    flat_fee_amount_decimal: undefined,
  } as unknown as PriceTier;

  const tierInvalid = {
    up_to: 10,
  };

  it.each`
    pricingModel                    | tier                              | unit         | locale       | currency     | t    | showStartsAt | enableSubunitDisplay | expected
    ${PricingModel.tieredGraduated} | ${tierWithUnitAmount}             | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${t} | ${true}      | ${false}             | ${'Starts at €10.00/kWh'}
    ${PricingModel.tieredVolume}    | ${tierWithUnitAmount}             | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${t} | ${true}      | ${false}             | ${'Starts at €10.00/kWh'}
    ${PricingModel.tieredVolume}    | ${tierWithUnitAmount}             | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${t} | ${false}     | ${false}             | ${'€10.00/kWh'}
    ${PricingModel.tieredVolume}    | ${tierWithUnitAmount}             | ${'kWh'}     | ${'de'}      | ${'EUR'}     | ${t} | ${true}      | ${false}             | ${'Starts at 10,00 €/kWh'}
    ${PricingModel.tieredVolume}    | ${tierWithUnitAmount}             | ${'kWh'}     | ${'en'}      | ${'USD'}     | ${t} | ${true}      | ${false}             | ${'Starts at $10.00/kWh'}
    ${PricingModel.tieredVolume}    | ${tierWithUnitAmount}             | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${t} | ${true}      | ${true}              | ${'Starts at €10.00/kWh'}
    ${PricingModel.tieredVolume}    | ${tierWithSubunitAmount}          | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${t} | ${true}      | ${true}              | ${'Starts at 5.00 cents/kWh'}
    ${PricingModel.tieredVolume}    | ${tierWithUnitAmount}             | ${undefined} | ${'en'}      | ${'EUR'}     | ${t} | ${true}      | ${false}             | ${'Starts at €10.00/unit'}
    ${PricingModel.tieredVolume}    | ${tierWithUnitAmount}             | ${'kWh'}     | ${undefined} | ${'EUR'}     | ${t} | ${true}      | ${false}             | ${'Starts at 10,00 €/kWh'}
    ${PricingModel.tieredVolume}    | ${tierWithUnitAmount}             | ${'kWh'}     | ${'en'}      | ${undefined} | ${t} | ${true}      | ${false}             | ${'Starts at €10.00/kWh'}
    ${PricingModel.tieredVolume}    | ${tierWithUnitAmount}             | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${t} | ${undefined} | ${false}             | ${'Starts at €10.00/kWh'}
    ${PricingModel.tieredVolume}    | ${tierWithUnitAmountZero}         | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${t} | ${true}      | ${false}             | ${'Starts at €0.00/kWh'}
    ${PricingModel.tieredVolume}    | ${tierWithUnitAmountUndefined}    | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${t} | ${true}      | ${false}             | ${undefined}
    ${PricingModel.tieredVolume}    | ${tierInvalid}                    | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${t} | ${true}      | ${false}             | ${undefined}
    ${PricingModel.tieredFlatFee}   | ${tierWithFlatFeeAmount}          | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${t} | ${true}      | ${false}             | ${'Starts at €10.00'}
    ${PricingModel.tieredFlatFee}   | ${tierWithFlatFeeAmountZero}      | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${t} | ${true}      | ${false}             | ${'Starts at €0.00'}
    ${PricingModel.tieredFlatFee}   | ${tierWithFlatFeeAmountUndefined} | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${t} | ${true}      | ${false}             | ${undefined}
  `(
    'should return correct for the tier, when pricingModel=$pricingModel, unit=$unit, locale=$locale, currency=$currency, showStartsAt=$showStartsAt',
    ({
      pricingModel,
      tier,
      unit,
      locale,
      currency,
      t,
      showStartsAt,
      enableSubunitDisplay,
      expected,
    }: {
      pricingModel: PricingModel;
      tier: PriceTier;
      unit: string;
      locale: string;
      currency: Currency;
      t: jest.Mock;
      showStartsAt: boolean;
      enableSubunitDisplay: boolean;
      expected: string;
    }) => {
      const result = getTierDescription(pricingModel, tier, unit, locale, currency, t, {
        showStartsAt,
        enableSubunitDisplay,
      });

      expect(result?.replace(/\s+/g, ' ').trim()).toEqual(expected);
    },
  );
});

describe('computeCumulativeValue', () => {
  it.each`
    tiers             | quantityToSelectTier | unit        | locale       | currency | expected
    ${baseTiers}      | ${1}                 | ${'kWh'}    | ${undefined} | ${'EUR'} | ${{ total: '10,00\xa0€', average: '10,00\xa0€/kWh', breakdown: [{ quantityUsed: '1 kWh', tierAmountDecimal: '10,00\xa0€/kWh', totalAmountDecimal: '10,00\xa0€' }] }}
    ${baseTiers}      | ${2}                 | ${'m'}      | ${'de'}      | ${'EUR'} | ${{ total: '20,00\xa0€', average: '10,00\xa0€/m', breakdown: [{ quantityUsed: '2 m', tierAmountDecimal: '10,00\xa0€/m', totalAmountDecimal: '20,00\xa0€' }] }}
    ${baseTiers}      | ${5}                 | ${'kWh'}    | ${'en'}      | ${'EUR'} | ${{ total: '€50.00', average: '€10.00/kWh', breakdown: [{ quantityUsed: '5 kWh', tierAmountDecimal: '€10.00/kWh', totalAmountDecimal: '€50.00' }] }}
    ${baseTiers}      | ${15}                | ${'banana'} | ${'en'}      | ${'EUR'} | ${{ total: '€145.00', average: '€9.67/banana', breakdown: [{ quantityUsed: '10 banana', tierAmountDecimal: '€10.00/banana', totalAmountDecimal: '€100.00' }, { quantityUsed: '5 banana', tierAmountDecimal: '€9.00/banana', totalAmountDecimal: '€45.00' }] }}
    ${baseTiers}      | ${30}                | ${'kWh'}    | ${'en'}      | ${'USD'} | ${{ total: '$270.00', average: '$9.00/kWh', breakdown: [{ quantityUsed: '10 kWh', tierAmountDecimal: '$10.00/kWh', totalAmountDecimal: '$100.00' }, { quantityUsed: '10 kWh', tierAmountDecimal: '$9.00/kWh', totalAmountDecimal: '$90.00' }, { quantityUsed: '10 kWh', tierAmountDecimal: '$8.00/kWh', totalAmountDecimal: '$80.00' }] }}
    ${subunitTiers}   | ${5}                 | ${'kWh'}    | ${'en'}      | ${'USD'} | ${{ total: '5.00 cents', average: '1.00 cent/kWh', breakdown: [{ quantityUsed: '5 kWh', tierAmountDecimal: '1.00 cent/kWh', totalAmountDecimal: '5.00 cents' }] }}
    ${subunitTiers}   | ${1396}              | ${'kWh'}    | ${'en'}      | ${'USD'} | ${{ total: '$11.198', average: '0.80 cents/kWh', breakdown: [{ quantityUsed: '10 kWh', tierAmountDecimal: '1.00 cent/kWh', totalAmountDecimal: '10.00 cents' }, { quantityUsed: '10 kWh', tierAmountDecimal: '0.90 cents/kWh', totalAmountDecimal: '9.00 cents' }, { quantityUsed: '1,376 kWh', tierAmountDecimal: '0.80 cents/kWh', totalAmountDecimal: '$11.008' }] }}
    ${zeroTiers}      | ${1}                 | ${'kWh'}    | ${'en'}      | ${'USD'} | ${{ total: '$0.00', average: '$0.00/kWh', breakdown: [{ quantityUsed: '1 kWh', tierAmountDecimal: '$0.00/kWh', totalAmountDecimal: '$0.00' }] }}
    ${onRequestTiers} | ${5}                 | ${'kWh'}    | ${'en'}      | ${'EUR'} | ${{ total: '€50.00', average: '€10.00/kWh', breakdown: [{ quantityUsed: '5 kWh', tierAmountDecimal: '€10.00/kWh', totalAmountDecimal: '€50.00' }] }}
    ${onRequestTiers} | ${15}                | ${'kWh'}    | ${'en'}      | ${'EUR'} | ${'Price on request'}
  `(
    'should compute cumulative value correctly when quantityToSelectTier=$quantityToSelectTier',
    ({ tiers, quantityToSelectTier, unit, locale, currency, expected }) => {
      expect(computeCumulativeValue(tiers, quantityToSelectTier, unit, locale, currency, t)).toEqual(expected);
    },
  );
});
