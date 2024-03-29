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
    unit_amount_decimal: '10.00',
  };

  const tierWithUnitAmountOnRequest = {
    up_to: 10,
    unit_amount: 1000,
    unit_amount_decimal: '10.00',
    display_mode: 'on_request',
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
    flat_fee_amount_decimal: '10.00',
  };

  const tierWithFlatFeeAmountOnRequest = {
    up_to: 10,
    flat_fee_amount: 1000,
    flat_fee_amount_decimal: '10.00',
    display_mode: 'on_request',
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
    pricingModel                    | tier                              | unit         | locale       | currency     | t    | showStartsAt | enableSubunitDisplay | shouldDisplayOnRequest | expected
    ${PricingModel.tieredGraduated} | ${tierWithUnitAmount}             | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${t} | ${true}      | ${false}             | ${undefined}           | ${'Starts at €10.00/kWh'}
    ${PricingModel.tieredVolume}    | ${tierWithUnitAmount}             | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${t} | ${true}      | ${false}             | ${undefined}           | ${'Starts at €10.00/kWh'}
    ${PricingModel.tieredVolume}    | ${tierWithUnitAmount}             | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${t} | ${false}     | ${false}             | ${undefined}           | ${'€10.00/kWh'}
    ${PricingModel.tieredVolume}    | ${tierWithUnitAmount}             | ${'kWh'}     | ${'de'}      | ${'EUR'}     | ${t} | ${true}      | ${false}             | ${undefined}           | ${'Starts at 10,00 €/kWh'}
    ${PricingModel.tieredVolume}    | ${tierWithUnitAmount}             | ${'kWh'}     | ${'en'}      | ${'USD'}     | ${t} | ${true}      | ${false}             | ${undefined}           | ${'Starts at $10.00/kWh'}
    ${PricingModel.tieredVolume}    | ${tierWithUnitAmount}             | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${t} | ${true}      | ${true}              | ${undefined}           | ${'Starts at €10.00/kWh'}
    ${PricingModel.tieredVolume}    | ${tierWithSubunitAmount}          | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${t} | ${true}      | ${true}              | ${undefined}           | ${'Starts at 5.00 cents/kWh'}
    ${PricingModel.tieredVolume}    | ${tierWithUnitAmount}             | ${undefined} | ${'en'}      | ${'EUR'}     | ${t} | ${true}      | ${false}             | ${undefined}           | ${'Starts at €10.00'}
    ${PricingModel.tieredVolume}    | ${tierWithUnitAmount}             | ${'unit'}    | ${'en'}      | ${'EUR'}     | ${t} | ${true}      | ${false}             | ${undefined}           | ${'Starts at €10.00'}
    ${PricingModel.tieredVolume}    | ${tierWithUnitAmount}             | ${'kWh'}     | ${undefined} | ${'EUR'}     | ${t} | ${true}      | ${false}             | ${undefined}           | ${'Starts at 10,00 €/kWh'}
    ${PricingModel.tieredVolume}    | ${tierWithUnitAmount}             | ${'kWh'}     | ${'en'}      | ${undefined} | ${t} | ${true}      | ${false}             | ${undefined}           | ${'Starts at €10.00/kWh'}
    ${PricingModel.tieredVolume}    | ${tierWithUnitAmount}             | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${t} | ${undefined} | ${false}             | ${undefined}           | ${'Starts at €10.00/kWh'}
    ${PricingModel.tieredVolume}    | ${tierWithUnitAmountZero}         | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${t} | ${true}      | ${false}             | ${undefined}           | ${'Starts at €0.00/kWh'}
    ${PricingModel.tieredVolume}    | ${tierWithUnitAmountUndefined}    | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${t} | ${true}      | ${false}             | ${undefined}           | ${undefined}
    ${PricingModel.tieredVolume}    | ${tierInvalid}                    | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${t} | ${true}      | ${false}             | ${undefined}           | ${undefined}
    ${PricingModel.tieredFlatFee}   | ${tierWithFlatFeeAmount}          | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${t} | ${true}      | ${false}             | ${undefined}           | ${'Starts at €10.00'}
    ${PricingModel.tieredFlatFee}   | ${tierWithFlatFeeAmountZero}      | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${t} | ${true}      | ${false}             | ${undefined}           | ${'Starts at €0.00'}
    ${PricingModel.tieredFlatFee}   | ${tierWithFlatFeeAmountUndefined} | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${t} | ${true}      | ${false}             | ${undefined}           | ${undefined}
    ${PricingModel.tieredVolume}    | ${tierWithUnitAmountOnRequest}    | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${t} | ${true}      | ${false}             | ${true}                | ${'Price on request'}
    ${PricingModel.tieredFlatFee}   | ${tierWithFlatFeeAmountOnRequest} | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${t} | ${true}      | ${false}             | ${true}                | ${'Price on request'}
    ${PricingModel.tieredVolume}    | ${tierWithUnitAmountOnRequest}    | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${t} | ${true}      | ${false}             | ${false}               | ${'Starts at €10.00/kWh'}
    ${PricingModel.tieredFlatFee}   | ${tierWithFlatFeeAmountOnRequest} | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${t} | ${true}      | ${false}             | ${false}               | ${'Starts at €10.00'}
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
      shouldDisplayOnRequest,
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
      shouldDisplayOnRequest?: boolean;
      expected: string;
    }) => {
      const result = getTierDescription(pricingModel, tier, unit, locale, currency, t, {
        showStartsAt,
        enableSubunitDisplay,
        shouldDisplayOnRequest,
      });

      expect(result?.replace(/\s+/g, ' ').trim()).toEqual(expected);
    },
  );

  it.each`
    pricingModel                    | tier                              | unit         | locale       | currency     | t    | showStartsAt | enableSubunitDisplay | shouldDisplayOnRequest | tax | expected
    ${PricingModel.tieredGraduated} | ${tierWithUnitAmount}             | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${t} | ${true}      | ${false}             | ${undefined}           | ${{ isInclusive: true, rate: 10 }} | ${'Starts at €9.09/kWh'}
    ${PricingModel.tieredVolume}    | ${tierWithUnitAmount}             | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${t} | ${true}      | ${false}             | ${undefined}           | ${{ isInclusive: true, rate: 10 }} | ${'Starts at €9.09/kWh'}
    ${PricingModel.tieredVolume}    | ${tierWithSubunitAmount}          | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${t} | ${true}      | ${true}              | ${undefined}           | ${{ isInclusive: true, rate: 10 }} | ${'Starts at 4.55 cents/kWh'}
    ${PricingModel.tieredFlatFee}   | ${tierWithFlatFeeAmount}          | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${t} | ${true}      | ${false}             | ${undefined}           | ${{ isInclusive: true, rate: 10 }} | ${'Starts at €9.09'}

  `(
    'should return correct net values for the tier, when pricingModel=$pricingModel, unit=$unit, locale=$locale, currency=$currency, showStartsAt=$showStartsAt',
    ({
      pricingModel,
      tier,
      unit,
      locale,
      currency,
      t,
      showStartsAt,
      enableSubunitDisplay,
      shouldDisplayOnRequest,
      tax,
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
      shouldDisplayOnRequest?: boolean;
      tax: { isInclusive: boolean; rate: number };
      expected: string;
    }) => {
      const result = getTierDescription(pricingModel, tier, unit, locale, currency, t, {
        showStartsAt,
        enableSubunitDisplay,
        shouldDisplayOnRequest,
      }, tax);

      expect(result?.replace(/\s+/g, ' ').trim()).toEqual(expected);
    },
  )
});

describe('computeCumulativeValue', () => {
  it.each`
    tiers             | quantityToSelectTier | unit        | locale       | currency | shouldDisplayOnRequest | showStartsAt | expected
    ${baseTiers}      | ${1}                 | ${'kWh'}    | ${undefined} | ${'EUR'} | ${undefined}           | ${undefined} | ${{ total: '10,00\xa0€', totalWithPrecision: '10,00\xa0€', average: '10,00\xa0€/kWh', breakdown: [{ quantityUsed: '1 kWh', tierAmountDecimal: '10,00\xa0€/kWh', totalAmountDecimal: '10,00\xa0€' }] }}
    ${baseTiers}      | ${2}                 | ${'m'}      | ${'de'}      | ${'EUR'} | ${undefined}           | ${undefined} | ${{ total: '20,00\xa0€', totalWithPrecision: '20,00\xa0€', average: '10,00\xa0€/m', breakdown: [{ quantityUsed: '2 m', tierAmountDecimal: '10,00\xa0€/m', totalAmountDecimal: '20,00\xa0€' }] }}
    ${baseTiers}      | ${5}                 | ${'kWh'}    | ${'en'}      | ${'EUR'} | ${undefined}           | ${undefined} | ${{ total: '€50.00', totalWithPrecision: '€50.00', average: '€10.00/kWh', breakdown: [{ quantityUsed: '5 kWh', tierAmountDecimal: '€10.00/kWh', totalAmountDecimal: '€50.00' }] }}
    ${baseTiers}      | ${15}                | ${'banana'} | ${'en'}      | ${'EUR'} | ${undefined}           | ${undefined} | ${{ total: '€145.00', totalWithPrecision: '€145.00', average: '€9.67/banana', breakdown: [{ quantityUsed: '10 banana', tierAmountDecimal: '€10.00/banana', totalAmountDecimal: '€100.00' }, { quantityUsed: '5 banana', tierAmountDecimal: '€9.00/banana', totalAmountDecimal: '€45.00' }] }}
    ${baseTiers}      | ${30}                | ${'kWh'}    | ${'en'}      | ${'USD'} | ${undefined}           | ${undefined} | ${{ total: '$270.00', totalWithPrecision: '$270.00', average: '$9.00/kWh', breakdown: [{ quantityUsed: '10 kWh', tierAmountDecimal: '$10.00/kWh', totalAmountDecimal: '$100.00' }, { quantityUsed: '10 kWh', tierAmountDecimal: '$9.00/kWh', totalAmountDecimal: '$90.00' }, { quantityUsed: '10 kWh', tierAmountDecimal: '$8.00/kWh', totalAmountDecimal: '$80.00' }] }}
    ${baseTiers}      | ${0}                 | ${'kWh'}    | ${'en'}      | ${'USD'} | ${undefined}           | ${undefined} | ${{ total: '$0.00', totalWithPrecision: '$0.00', average: '$0.00/kWh', breakdown: [{ quantityUsed: '0 kWh', tierAmountDecimal: '$10.00/kWh', totalAmountDecimal: '$0.00' }] }}
    ${subunitTiers}   | ${5}                 | ${'kWh'}    | ${'en'}      | ${'USD'} | ${undefined}           | ${undefined} | ${{ total: '5.00 cents', totalWithPrecision: '5.00 cents', average: '1.00 cent/kWh', breakdown: [{ quantityUsed: '5 kWh', tierAmountDecimal: '1.00 cent/kWh', totalAmountDecimal: '5.00 cents' }] }}
    ${subunitTiers}   | ${1396}              | ${'kWh'}    | ${'en'}      | ${'USD'} | ${undefined}           | ${undefined} | ${{ total: '$11.20', totalWithPrecision: '$11.198', average: '0.80 cents/kWh', breakdown: [{ quantityUsed: '10 kWh', tierAmountDecimal: '1.00 cent/kWh', totalAmountDecimal: '10.00 cents' }, { quantityUsed: '10 kWh', tierAmountDecimal: '0.90 cents/kWh', totalAmountDecimal: '9.00 cents' }, { quantityUsed: '1,376 kWh', tierAmountDecimal: '0.80 cents/kWh', totalAmountDecimal: '$11.008' }] }}
    ${zeroTiers}      | ${1}                 | ${'kWh'}    | ${'en'}      | ${'USD'} | ${undefined}           | ${undefined} | ${{ total: '$0.00', totalWithPrecision: '$0.00', average: '$0.00/kWh', breakdown: [{ quantityUsed: '1 kWh', tierAmountDecimal: '$0.00/kWh', totalAmountDecimal: '$0.00' }] }}
    ${onRequestTiers} | ${5}                 | ${'kWh'}    | ${'en'}      | ${'EUR'} | ${true}                | ${undefined} | ${{ total: '€50.00', totalWithPrecision: '€50.00', average: '€10.00/kWh', breakdown: [{ quantityUsed: '5 kWh', tierAmountDecimal: '€10.00/kWh', totalAmountDecimal: '€50.00' }] }}
    ${onRequestTiers} | ${15}                | ${'kWh'}    | ${'en'}      | ${'EUR'} | ${true}                | ${undefined} | ${'Price on request'}
    ${onRequestTiers} | ${15}                | ${'kWh'}    | ${'en'}      | ${'EUR'} | ${false}               | ${undefined} | ${{ total: '€145.00', totalWithPrecision: '€145.00', average: '€9.67/kWh', breakdown: [{ quantityUsed: '10 kWh', tierAmountDecimal: '€10.00/kWh', totalAmountDecimal: '€100.00' }, { quantityUsed: '5 kWh', tierAmountDecimal: '€9.00/kWh', totalAmountDecimal: '€45.00' }] }}
    ${decimalTiers}   | ${7}                 | ${'kWh'}    | ${'en'}      | ${'EUR'} | ${false}               | ${undefined} | ${{ total: '38.59 cents', totalWithPrecision: '38.5915 cents', average: '5.51 cents/kWh', breakdown: [{ quantityUsed: '5 kWh', tierAmountDecimal: '5.5451 cents/kWh', totalAmountDecimal: '27.7255 cents' }, { quantityUsed: '2 kWh', tierAmountDecimal: '5.433 cents/kWh', totalAmountDecimal: '10.866 cents' }] }}
    ${decimalTiers}   | ${7}                 | ${'kWh'}    | ${'en'}      | ${'EUR'} | ${false}               | ${true}      | ${{ total: 'Starts at 38.59 cents', totalWithPrecision: 'Starts at 38.5915 cents', average: '5.51 cents/kWh', breakdown: [{ quantityUsed: '5 kWh', tierAmountDecimal: '5.5451 cents/kWh', totalAmountDecimal: '27.7255 cents' }, { quantityUsed: '2 kWh', tierAmountDecimal: '5.433 cents/kWh', totalAmountDecimal: '10.866 cents' }] }}
  `(
    'should compute cumulative value correctly when quantityToSelectTier=$quantityToSelectTier',
    ({ tiers, quantityToSelectTier, unit, locale, currency, shouldDisplayOnRequest, showStartsAt, expected }) => {
      expect(
        computeCumulativeValue(tiers, quantityToSelectTier, unit, locale, currency, t, { shouldDisplayOnRequest, showStartsAt }),
      ).toEqual(expected);
    },
  );

  it.each`
    tiers             | quantityToSelectTier | unit        | locale       | currency | shouldDisplayOnRequest | showStartsAt | tax | expected
    ${baseTiers}      | ${1}                 | ${'kWh'}    | ${undefined} | ${'EUR'} | ${undefined}           | ${undefined} | ${{
      isInclusive: true, rate: 10
    }} | ${{ amountSubtotal: '9,09\xa0€', amountSubtotalWithPrecision: '9,090909090909\xa0€', amountSubtotalAverage: '9,09\xa0€/kWh', total: '10,00\xa0€', totalWithPrecision: '10,00\xa0€', average: '10,00\xa0€/kWh', breakdown: [{ quantityUsed: '1 kWh', tierAmountDecimal: '10,00\xa0€/kWh', totalAmountDecimal: '10,00\xa0€' }] }}
    ${baseTiers}      | ${2}                 | ${'m'}      | ${'de'}      | ${'EUR'} | ${undefined}           | ${undefined} | ${{
      isInclusive: true, rate: 10
    }} | ${{ amountSubtotal: '18,18\xa0€', amountSubtotalWithPrecision: '18,181818181818\xa0€', amountSubtotalAverage: '9,09\xa0€/m', total: '20,00\xa0€', totalWithPrecision: '20,00\xa0€', average: '10,00\xa0€/m', breakdown: [{ quantityUsed: '2 m', tierAmountDecimal: '10,00\xa0€/m', totalAmountDecimal: '20,00\xa0€' }] }}
    ${baseTiers}      | ${50}                 | ${'kWh'}    | ${undefined} | ${'EUR'} | ${undefined}           | ${undefined} | ${{
      isInclusive: false, rate: 10
    }} | ${{ amountSubtotal: '430,00\xa0€', amountSubtotalWithPrecision: '430,00\xa0€', amountSubtotalAverage: '8,60\xa0€/kWh', total: '430,00\xa0€', totalWithPrecision: '430,00\xa0€', average: '8,60\xa0€/kWh', breakdown: [{ quantityUsed: '10 kWh', tierAmountDecimal: '10,00\xa0€/kWh', totalAmountDecimal: '100,00\xa0€' }, { quantityUsed: '10 kWh', tierAmountDecimal: '9,00\xa0€/kWh', totalAmountDecimal: '90,00\xa0€' }, { quantityUsed: '30 kWh', tierAmountDecimal: '8,00\xa0€/kWh', totalAmountDecimal: '240,00\xa0€' }] }}
  `(
    'should compute net cumulative value correctly when quantityToSelectTier=$quantityToSelectTier',
    ({ tiers, quantityToSelectTier, unit, locale, currency, shouldDisplayOnRequest, showStartsAt, tax, expected }) => {
      expect(
        computeCumulativeValue(tiers, quantityToSelectTier, unit, locale, currency, t, { shouldDisplayOnRequest, showStartsAt }, tax),
      ).toEqual(expected);
    },
  )
});
