import { Currency } from 'dinero.js';

import { PricingModel } from '../pricing';
import { PriceTier } from '../types';

import { getDisplayTierByQuantity, getDisplayTiersByQuantity, getTierDescription } from './index';

const baseTiers: PriceTier[] = [
  { up_to: 10, unit_amount: 1000, unit_amount_decimal: '10.00' },
  { up_to: 20, unit_amount: 900, unit_amount_decimal: '9.00' },
  { up_to: null, unit_amount: 800, unit_amount_decimal: '8.00' },
];
const mockTranslations = {
  ['selectvalues.Price.unit.kWh' as string]: 'kWh',
  ['selectvalues.Price.unit.unit' as string]: 'unit',
  ['starts_at' as string]: 'Starts at',
};

const t = jest.fn().mockImplementation((key: string) => mockTranslations[key] || key);

describe('getDisplayTierByQuantity', () => {
  it.each`
    tiers        | quantity     | pricingModel                    | expected
    ${baseTiers} | ${-1}        | ${PricingModel.tieredGraduated} | ${undefined}
    ${baseTiers} | ${0}         | ${PricingModel.tieredGraduated} | ${undefined}
    ${baseTiers} | ${5}         | ${PricingModel.tieredGraduated} | ${[baseTiers[0]]}
    ${baseTiers} | ${10}        | ${PricingModel.tieredGraduated} | ${[baseTiers[0]]}
    ${baseTiers} | ${10.999}    | ${PricingModel.tieredGraduated} | ${[baseTiers[0], baseTiers[1]]}
    ${baseTiers} | ${15}        | ${PricingModel.tieredGraduated} | ${[baseTiers[0], baseTiers[1]]}
    ${baseTiers} | ${20}        | ${PricingModel.tieredGraduated} | ${[baseTiers[0], baseTiers[1]]}
    ${baseTiers} | ${21}        | ${PricingModel.tieredGraduated} | ${baseTiers}
    ${baseTiers} | ${100}       | ${PricingModel.tieredGraduated} | ${baseTiers}
    ${undefined} | ${30}        | ${PricingModel.tieredGraduated} | ${undefined}
    ${baseTiers} | ${undefined} | ${PricingModel.tieredGraduated} | ${undefined}
    ${baseTiers} | ${-1}        | ${PricingModel.tieredVolume}    | ${undefined}
    ${baseTiers} | ${0}         | ${PricingModel.tieredVolume}    | ${undefined}
    ${undefined} | ${0}         | ${PricingModel.tieredVolume}    | ${undefined}
    ${baseTiers} | ${undefined} | ${PricingModel.tieredVolume}    | ${undefined}
    ${baseTiers} | ${5}         | ${PricingModel.tieredVolume}    | ${[baseTiers[0]]}
    ${baseTiers} | ${10}        | ${PricingModel.tieredVolume}    | ${[baseTiers[0]]}
    ${baseTiers} | ${10.999}    | ${PricingModel.tieredVolume}    | ${[baseTiers[1]]}
    ${baseTiers} | ${15}        | ${PricingModel.tieredVolume}    | ${[baseTiers[1]]}
    ${baseTiers} | ${20}        | ${PricingModel.tieredVolume}    | ${[baseTiers[1]]}
    ${baseTiers} | ${21}        | ${PricingModel.tieredVolume}    | ${[baseTiers[2]]}
    ${baseTiers} | ${100}       | ${PricingModel.tieredVolume}    | ${[baseTiers[2]]}
    ${baseTiers} | ${0}         | ${PricingModel.tieredFlatFee}   | ${undefined}
    ${undefined} | ${0}         | ${PricingModel.tieredFlatFee}   | ${undefined}
    ${baseTiers} | ${undefined} | ${PricingModel.tieredFlatFee}   | ${undefined}
    ${baseTiers} | ${5}         | ${PricingModel.tieredFlatFee}   | ${[baseTiers[0]]}
    ${baseTiers} | ${10}        | ${PricingModel.tieredFlatFee}   | ${[baseTiers[0]]}
    ${baseTiers} | ${10.999}    | ${PricingModel.tieredFlatFee}   | ${[baseTiers[1]]}
    ${baseTiers} | ${15}        | ${PricingModel.tieredFlatFee}   | ${[baseTiers[1]]}
    ${baseTiers} | ${20}        | ${PricingModel.tieredFlatFee}   | ${[baseTiers[1]]}
    ${baseTiers} | ${21}        | ${PricingModel.tieredFlatFee}   | ${[baseTiers[2]]}
    ${baseTiers} | ${100}       | ${PricingModel.tieredFlatFee}   | ${[baseTiers[2]]}
    ${baseTiers} | ${100}       | ${undefined}                    | ${undefined}
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
    ${baseTiers} | ${-1}                              | ${PricingModel.tieredGraduated} | ${undefined}
    ${baseTiers} | ${Math.floor(Math.random() * 100)} | ${PricingModel.tieredGraduated} | ${baseTiers[0]}
    ${undefined} | ${Math.floor(Math.random() * 100)} | ${PricingModel.tieredGraduated} | ${undefined}
    ${baseTiers} | ${undefined}                       | ${PricingModel.tieredGraduated} | ${undefined}
    ${baseTiers} | ${-1}                              | ${PricingModel.tieredVolume}    | ${undefined}
    ${baseTiers} | ${0}                               | ${PricingModel.tieredVolume}    | ${undefined}
    ${undefined} | ${0}                               | ${PricingModel.tieredVolume}    | ${undefined}
    ${baseTiers} | ${undefined}                       | ${PricingModel.tieredVolume}    | ${undefined}
    ${baseTiers} | ${5}                               | ${PricingModel.tieredVolume}    | ${baseTiers[0]}
    ${baseTiers} | ${10}                              | ${PricingModel.tieredVolume}    | ${baseTiers[0]}
    ${baseTiers} | ${10.999}                          | ${PricingModel.tieredVolume}    | ${baseTiers[1]}
    ${baseTiers} | ${15}                              | ${PricingModel.tieredVolume}    | ${baseTiers[1]}
    ${baseTiers} | ${20}                              | ${PricingModel.tieredVolume}    | ${baseTiers[1]}
    ${baseTiers} | ${21}                              | ${PricingModel.tieredVolume}    | ${baseTiers[2]}
    ${baseTiers} | ${100}                             | ${PricingModel.tieredVolume}    | ${baseTiers[2]}
    ${baseTiers} | ${0}                               | ${PricingModel.tieredFlatFee}   | ${undefined}
    ${undefined} | ${0}                               | ${PricingModel.tieredFlatFee}   | ${undefined}
    ${baseTiers} | ${undefined}                       | ${PricingModel.tieredFlatFee}   | ${undefined}
    ${baseTiers} | ${5}                               | ${PricingModel.tieredFlatFee}   | ${baseTiers[0]}
    ${baseTiers} | ${10}                              | ${PricingModel.tieredFlatFee}   | ${baseTiers[0]}
    ${baseTiers} | ${10.999}                          | ${PricingModel.tieredFlatFee}   | ${baseTiers[1]}
    ${baseTiers} | ${15}                              | ${PricingModel.tieredFlatFee}   | ${baseTiers[1]}
    ${baseTiers} | ${20}                              | ${PricingModel.tieredFlatFee}   | ${baseTiers[1]}
    ${baseTiers} | ${21}                              | ${PricingModel.tieredFlatFee}   | ${baseTiers[2]}
    ${baseTiers} | ${100}                             | ${PricingModel.tieredFlatFee}   | ${baseTiers[2]}
    ${baseTiers} | ${100}                             | ${undefined}                    | ${undefined}
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

  const tierWithUnitAmountUndefined = ({
    up_to: 10,
    unit_amount: undefined,
    unit_amount_decimal: undefined,
  } as unknown) as PriceTier;

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

  const tierWithFlatFeeAmountUndefined = ({
    up_to: 10,
    flat_fee_amount: undefined,
    flat_fee_amount_decimal: undefined,
  } as unknown) as PriceTier;

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
