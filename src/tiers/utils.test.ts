import type { Currency } from 'dinero.js';
import type { Mock } from 'vitest';
import { describe, expect, it } from 'vitest';
import { PricingModel } from '../prices/constants';
import type { PriceTier, Tax } from '../shared/types';
import { mockedTranslationFn } from './__tests__/mocks';
import { baseTiersUnitAmount, baseTiersFlatFeeAmount } from './__tests__/tiers.fixtures';
import { getDisplayTierByQuantity, getDisplayTiersByQuantity, getTierDescription } from './utils';

describe('getDisplayTierByQuantity', () => {
  it.each`
    tiers                     | quantity     | pricingModel                    | isTaxInclusive | tax             | expected
    ${baseTiersUnitAmount}    | ${-1}        | ${PricingModel.tieredGraduated} | ${true}        | ${{ rate: 19 }} | ${[{ ...baseTiersUnitAmount[0], unit_amount_gross: 1000, unit_amount_gross_decimal: '10' }]}
    ${baseTiersUnitAmount}    | ${-1}        | ${PricingModel.tieredGraduated} | ${false}       | ${{ rate: 19 }} | ${[{ ...baseTiersUnitAmount[0], unit_amount_gross: 1190, unit_amount_gross_decimal: '11.9' }]}
    ${baseTiersUnitAmount}    | ${0}         | ${PricingModel.tieredGraduated} | ${true}        | ${{ rate: 19 }} | ${[{ ...baseTiersUnitAmount[0], unit_amount_gross: 1000, unit_amount_gross_decimal: '10' }]}
    ${baseTiersUnitAmount}    | ${5}         | ${PricingModel.tieredGraduated} | ${true}        | ${{ rate: 19 }} | ${[{ ...baseTiersUnitAmount[0], unit_amount_gross: 1000, unit_amount_gross_decimal: '10' }]}
    ${baseTiersUnitAmount}    | ${5}         | ${PricingModel.tieredGraduated} | ${false}       | ${{ rate: 19 }} | ${[{ ...baseTiersUnitAmount[0], unit_amount_gross: 1190, unit_amount_gross_decimal: '11.9' }]}
    ${baseTiersUnitAmount}    | ${10}        | ${PricingModel.tieredGraduated} | ${true}        | ${{ rate: 19 }} | ${[{ ...baseTiersUnitAmount[0], unit_amount_gross: 1000, unit_amount_gross_decimal: '10' }]}
    ${baseTiersUnitAmount}    | ${10.999}    | ${PricingModel.tieredGraduated} | ${true}        | ${{ rate: 19 }} | ${[{ ...baseTiersUnitAmount[0], unit_amount_gross: 1000, unit_amount_gross_decimal: '10' }, { ...baseTiersUnitAmount[1], unit_amount_gross: 900, unit_amount_gross_decimal: '9' }]}
    ${baseTiersUnitAmount}    | ${15}        | ${PricingModel.tieredGraduated} | ${true}        | ${{ rate: 19 }} | ${[{ ...baseTiersUnitAmount[0], unit_amount_gross: 1000, unit_amount_gross_decimal: '10' }, { ...baseTiersUnitAmount[1], unit_amount_gross: 900, unit_amount_gross_decimal: '9' }]}
    ${baseTiersUnitAmount}    | ${20}        | ${PricingModel.tieredGraduated} | ${true}        | ${{ rate: 19 }} | ${[{ ...baseTiersUnitAmount[0], unit_amount_gross: 1000, unit_amount_gross_decimal: '10' }, { ...baseTiersUnitAmount[1], unit_amount_gross: 900, unit_amount_gross_decimal: '9' }]}
    ${baseTiersUnitAmount}    | ${21}        | ${PricingModel.tieredGraduated} | ${true}        | ${{ rate: 19 }} | ${[{ ...baseTiersUnitAmount[0], unit_amount_gross: 1000, unit_amount_gross_decimal: '10' }, { ...baseTiersUnitAmount[1], unit_amount_gross: 900, unit_amount_gross_decimal: '9' }, { ...baseTiersUnitAmount[2], unit_amount_gross: 800, unit_amount_gross_decimal: '8' }]}
    ${baseTiersUnitAmount}    | ${21}        | ${PricingModel.tieredGraduated} | ${false}       | ${{ rate: 19 }} | ${[{ ...baseTiersUnitAmount[0], unit_amount_gross: 1190, unit_amount_gross_decimal: '11.9' }, { ...baseTiersUnitAmount[1], unit_amount_gross: 1071, unit_amount_gross_decimal: '10.71' }, { ...baseTiersUnitAmount[2], unit_amount_gross: 952, unit_amount_gross_decimal: '9.52' }]}
    ${baseTiersUnitAmount}    | ${100}       | ${PricingModel.tieredGraduated} | ${true}        | ${{ rate: 19 }} | ${[{ ...baseTiersUnitAmount[0], unit_amount_gross: 1000, unit_amount_gross_decimal: '10' }, { ...baseTiersUnitAmount[1], unit_amount_gross: 900, unit_amount_gross_decimal: '9' }, { ...baseTiersUnitAmount[2], unit_amount_gross: 800, unit_amount_gross_decimal: '8' }]}
    ${baseTiersUnitAmount}    | ${100}       | ${PricingModel.tieredGraduated} | ${undefined}   | ${{ rate: 19 }} | ${[{ ...baseTiersUnitAmount[0], unit_amount_gross: 1000, unit_amount_gross_decimal: '10' }, { ...baseTiersUnitAmount[1], unit_amount_gross: 900, unit_amount_gross_decimal: '9' }, { ...baseTiersUnitAmount[2], unit_amount_gross: 800, unit_amount_gross_decimal: '8' }]}
    ${baseTiersUnitAmount}    | ${100}       | ${PricingModel.tieredGraduated} | ${undefined}   | ${undefined}    | ${[{ ...baseTiersUnitAmount[0], unit_amount_gross: 1000, unit_amount_gross_decimal: '10' }, { ...baseTiersUnitAmount[1], unit_amount_gross: 900, unit_amount_gross_decimal: '9' }, { ...baseTiersUnitAmount[2], unit_amount_gross: 800, unit_amount_gross_decimal: '8' }]}
    ${undefined}              | ${30}        | ${PricingModel.tieredGraduated} | ${true}        | ${{ rate: 19 }} | ${undefined}
    ${baseTiersUnitAmount}    | ${undefined} | ${PricingModel.tieredGraduated} | ${true}        | ${{ rate: 19 }} | ${[{ ...baseTiersUnitAmount[0], unit_amount_gross: 1000, unit_amount_gross_decimal: '10' }]}
    ${baseTiersUnitAmount}    | ${-1}        | ${PricingModel.tieredVolume}    | ${true}        | ${{ rate: 19 }} | ${[{ ...baseTiersUnitAmount[0], unit_amount_gross: 1000, unit_amount_gross_decimal: '10' }]}
    ${baseTiersUnitAmount}    | ${0}         | ${PricingModel.tieredVolume}    | ${true}        | ${{ rate: 19 }} | ${[{ ...baseTiersUnitAmount[0], unit_amount_gross: 1000, unit_amount_gross_decimal: '10' }]}
    ${undefined}              | ${0}         | ${PricingModel.tieredVolume}    | ${true}        | ${{ rate: 19 }} | ${undefined}
    ${baseTiersUnitAmount}    | ${undefined} | ${PricingModel.tieredVolume}    | ${true}        | ${{ rate: 19 }} | ${[{ ...baseTiersUnitAmount[0], unit_amount_gross: 1000, unit_amount_gross_decimal: '10' }]}
    ${baseTiersUnitAmount}    | ${5}         | ${PricingModel.tieredVolume}    | ${true}        | ${{ rate: 19 }} | ${[{ ...baseTiersUnitAmount[0], unit_amount_gross: 1000, unit_amount_gross_decimal: '10' }]}
    ${baseTiersUnitAmount}    | ${5}         | ${PricingModel.tieredVolume}    | ${false}       | ${{ rate: 19 }} | ${[{ ...baseTiersUnitAmount[0], unit_amount_gross: 1190, unit_amount_gross_decimal: '11.9' }]}
    ${baseTiersUnitAmount}    | ${10}        | ${PricingModel.tieredVolume}    | ${true}        | ${{ rate: 19 }} | ${[{ ...baseTiersUnitAmount[0], unit_amount_gross: 1000, unit_amount_gross_decimal: '10' }]}
    ${baseTiersUnitAmount}    | ${10.999}    | ${PricingModel.tieredVolume}    | ${true}        | ${{ rate: 19 }} | ${[{ ...baseTiersUnitAmount[1], unit_amount_gross: 900, unit_amount_gross_decimal: '9' }]}
    ${baseTiersUnitAmount}    | ${15}        | ${PricingModel.tieredVolume}    | ${true}        | ${{ rate: 19 }} | ${[{ ...baseTiersUnitAmount[1], unit_amount_gross: 900, unit_amount_gross_decimal: '9' }]}
    ${baseTiersUnitAmount}    | ${15}        | ${PricingModel.tieredVolume}    | ${false}       | ${{ rate: 19 }} | ${[{ ...baseTiersUnitAmount[1], unit_amount_gross: 1071, unit_amount_gross_decimal: '10.71' }]}
    ${baseTiersUnitAmount}    | ${20}        | ${PricingModel.tieredVolume}    | ${true}        | ${{ rate: 19 }} | ${[{ ...baseTiersUnitAmount[1], unit_amount_gross: 900, unit_amount_gross_decimal: '9' }]}
    ${baseTiersUnitAmount}    | ${21}        | ${PricingModel.tieredVolume}    | ${true}        | ${{ rate: 19 }} | ${[{ ...baseTiersUnitAmount[2], unit_amount_gross: 800, unit_amount_gross_decimal: '8' }]}
    ${baseTiersUnitAmount}    | ${100}       | ${PricingModel.tieredVolume}    | ${true}        | ${{ rate: 19 }} | ${[{ ...baseTiersUnitAmount[2], unit_amount_gross: 800, unit_amount_gross_decimal: '8' }]}
    ${baseTiersFlatFeeAmount} | ${0}         | ${PricingModel.tieredFlatFee}   | ${true}        | ${{ rate: 19 }} | ${[{ ...baseTiersFlatFeeAmount[0], flat_fee_amount_gross: 1000, flat_fee_amount_gross_decimal: '10' }]}
    ${undefined}              | ${0}         | ${PricingModel.tieredFlatFee}   | ${true}        | ${{ rate: 19 }} | ${undefined}
    ${baseTiersFlatFeeAmount} | ${undefined} | ${PricingModel.tieredFlatFee}   | ${true}        | ${{ rate: 19 }} | ${[{ ...baseTiersFlatFeeAmount[0], flat_fee_amount_gross: 1000, flat_fee_amount_gross_decimal: '10' }]}
    ${baseTiersFlatFeeAmount} | ${5}         | ${PricingModel.tieredFlatFee}   | ${true}        | ${{ rate: 19 }} | ${[{ ...baseTiersFlatFeeAmount[0], flat_fee_amount_gross: 1000, flat_fee_amount_gross_decimal: '10' }]}
    ${baseTiersFlatFeeAmount} | ${10}        | ${PricingModel.tieredFlatFee}   | ${true}        | ${{ rate: 19 }} | ${[{ ...baseTiersFlatFeeAmount[0], flat_fee_amount_gross: 1000, flat_fee_amount_gross_decimal: '10' }]}
    ${baseTiersFlatFeeAmount} | ${10}        | ${PricingModel.tieredFlatFee}   | ${false}       | ${{ rate: 19 }} | ${[{ ...baseTiersFlatFeeAmount[0], flat_fee_amount_gross: 1190, flat_fee_amount_gross_decimal: '11.9' }]}
    ${baseTiersFlatFeeAmount} | ${10.999}    | ${PricingModel.tieredFlatFee}   | ${true}        | ${{ rate: 19 }} | ${[{ ...baseTiersFlatFeeAmount[1], flat_fee_amount_gross: 900, flat_fee_amount_gross_decimal: '9' }]}
    ${baseTiersFlatFeeAmount} | ${15}        | ${PricingModel.tieredFlatFee}   | ${true}        | ${{ rate: 19 }} | ${[{ ...baseTiersFlatFeeAmount[1], flat_fee_amount_gross: 900, flat_fee_amount_gross_decimal: '9' }]}
    ${baseTiersFlatFeeAmount} | ${20}        | ${PricingModel.tieredFlatFee}   | ${true}        | ${{ rate: 19 }} | ${[{ ...baseTiersFlatFeeAmount[1], flat_fee_amount_gross: 900, flat_fee_amount_gross_decimal: '9' }]}
    ${baseTiersFlatFeeAmount} | ${21}        | ${PricingModel.tieredFlatFee}   | ${true}        | ${{ rate: 19 }} | ${[{ ...baseTiersFlatFeeAmount[2], flat_fee_amount_gross: 800, flat_fee_amount_gross_decimal: '8' }]}
    ${baseTiersFlatFeeAmount} | ${21}        | ${PricingModel.tieredFlatFee}   | ${false}       | ${{ rate: 19 }} | ${[{ ...baseTiersFlatFeeAmount[2], flat_fee_amount_gross: 952, flat_fee_amount_gross_decimal: '9.52' }]}
    ${baseTiersFlatFeeAmount} | ${100}       | ${PricingModel.tieredFlatFee}   | ${true}        | ${{ rate: 19 }} | ${[{ ...baseTiersFlatFeeAmount[2], flat_fee_amount_gross: 800, flat_fee_amount_gross_decimal: '8' }]}
  `(
    'should return correctly for quantity=$quantity and pricingModel=$pricingModel',
    ({
      tiers,
      quantity,
      pricingModel,
      isTaxInclusive,
      tax,
      expected,
    }: {
      tiers: PriceTier[];
      quantity: number;
      pricingModel: PricingModel;
      isTaxInclusive: boolean;
      tax: Tax;
      expected: PriceTier[] | undefined;
    }) => {
      expect(getDisplayTiersByQuantity(tiers, quantity, pricingModel, isTaxInclusive, tax)).toEqual(expected);
    },
  );
});

describe('getDisplayTierByQuantity', () => {
  it.each`
    tiers                     | quantity                           | pricingModel                    | isTaxInclusive | tax             | expected
    ${baseTiersUnitAmount}    | ${-1}                              | ${PricingModel.tieredGraduated} | ${true}        | ${{ rate: 19 }} | ${{ ...baseTiersUnitAmount[0], unit_amount_gross: 1000, unit_amount_gross_decimal: '10' }}
    ${baseTiersUnitAmount}    | ${Math.floor(Math.random() * 100)} | ${PricingModel.tieredGraduated} | ${true}        | ${{ rate: 19 }} | ${{ ...baseTiersUnitAmount[0], unit_amount_gross: 1000, unit_amount_gross_decimal: '10' }}
    ${baseTiersUnitAmount}    | ${Math.floor(Math.random() * 100)} | ${PricingModel.tieredGraduated} | ${false}       | ${undefined}    | ${{ ...baseTiersUnitAmount[0], unit_amount_gross: 1000, unit_amount_gross_decimal: '10' }}
    ${baseTiersUnitAmount}    | ${Math.floor(Math.random() * 100)} | ${PricingModel.tieredGraduated} | ${false}       | ${{ rate: 19 }} | ${{ ...baseTiersUnitAmount[0], unit_amount_gross: 1190, unit_amount_gross_decimal: '11.9' }}
    ${undefined}              | ${Math.floor(Math.random() * 100)} | ${PricingModel.tieredGraduated} | ${true}        | ${{ rate: 19 }} | ${undefined}
    ${baseTiersUnitAmount}    | ${undefined}                       | ${PricingModel.tieredGraduated} | ${true}        | ${{ rate: 19 }} | ${{ ...baseTiersUnitAmount[0], unit_amount_gross: 1000, unit_amount_gross_decimal: '10' }}
    ${baseTiersUnitAmount}    | ${-1}                              | ${PricingModel.tieredVolume}    | ${true}        | ${{ rate: 19 }} | ${{ ...baseTiersUnitAmount[0], unit_amount_gross: 1000, unit_amount_gross_decimal: '10' }}
    ${baseTiersUnitAmount}    | ${0}                               | ${PricingModel.tieredVolume}    | ${true}        | ${{ rate: 19 }} | ${{ ...baseTiersUnitAmount[0], unit_amount_gross: 1000, unit_amount_gross_decimal: '10' }}
    ${baseTiersUnitAmount}    | ${0}                               | ${PricingModel.tieredVolume}    | ${false}       | ${{ rate: 19 }} | ${{ ...baseTiersUnitAmount[0], unit_amount_gross: 1190, unit_amount_gross_decimal: '11.9' }}
    ${undefined}              | ${0}                               | ${PricingModel.tieredVolume}    | ${true}        | ${{ rate: 19 }} | ${undefined}
    ${baseTiersUnitAmount}    | ${undefined}                       | ${PricingModel.tieredVolume}    | ${true}        | ${{ rate: 19 }} | ${{ ...baseTiersUnitAmount[0], unit_amount_gross: 1000, unit_amount_gross_decimal: '10' }}
    ${baseTiersUnitAmount}    | ${5}                               | ${PricingModel.tieredVolume}    | ${true}        | ${{ rate: 19 }} | ${{ ...baseTiersUnitAmount[0], unit_amount_gross: 1000, unit_amount_gross_decimal: '10' }}
    ${baseTiersUnitAmount}    | ${10}                              | ${PricingModel.tieredVolume}    | ${true}        | ${{ rate: 19 }} | ${{ ...baseTiersUnitAmount[0], unit_amount_gross: 1000, unit_amount_gross_decimal: '10' }}
    ${baseTiersUnitAmount}    | ${10}                              | ${PricingModel.tieredVolume}    | ${false}       | ${{ rate: 19 }} | ${{ ...baseTiersUnitAmount[0], unit_amount_gross: 1190, unit_amount_gross_decimal: '11.9' }}
    ${baseTiersUnitAmount}    | ${10}                              | ${PricingModel.tieredVolume}    | ${false}       | ${undefined}    | ${{ ...baseTiersUnitAmount[0], unit_amount_gross: 1000, unit_amount_gross_decimal: '10' }}
    ${baseTiersUnitAmount}    | ${10.999}                          | ${PricingModel.tieredVolume}    | ${true}        | ${{ rate: 19 }} | ${{ ...baseTiersUnitAmount[1], unit_amount_gross: 900, unit_amount_gross_decimal: '9' }}
    ${baseTiersUnitAmount}    | ${15}                              | ${PricingModel.tieredVolume}    | ${true}        | ${{ rate: 19 }} | ${{ ...baseTiersUnitAmount[1], unit_amount_gross: 900, unit_amount_gross_decimal: '9' }}
    ${baseTiersUnitAmount}    | ${20}                              | ${PricingModel.tieredVolume}    | ${true}        | ${{ rate: 19 }} | ${{ ...baseTiersUnitAmount[1], unit_amount_gross: 900, unit_amount_gross_decimal: '9' }}
    ${baseTiersUnitAmount}    | ${20}                              | ${PricingModel.tieredVolume}    | ${true}        | ${{ rate: 19 }} | ${{ ...baseTiersUnitAmount[1], unit_amount_gross: 900, unit_amount_gross_decimal: '9' }}
    ${baseTiersUnitAmount}    | ${20}                              | ${PricingModel.tieredVolume}    | ${false}       | ${{ rate: 19 }} | ${{ ...baseTiersUnitAmount[1], unit_amount_gross: 1071, unit_amount_gross_decimal: '10.71' }}
    ${baseTiersUnitAmount}    | ${20}                              | ${PricingModel.tieredVolume}    | ${false}       | ${undefined}    | ${{ ...baseTiersUnitAmount[1], unit_amount_gross: 900, unit_amount_gross_decimal: '9' }}
    ${baseTiersUnitAmount}    | ${21}                              | ${PricingModel.tieredVolume}    | ${true}        | ${{ rate: 19 }} | ${{ ...baseTiersUnitAmount[2], unit_amount_gross: 800, unit_amount_gross_decimal: '8' }}
    ${baseTiersUnitAmount}    | ${21}                              | ${PricingModel.tieredVolume}    | ${false}       | ${{ rate: 19 }} | ${{ ...baseTiersUnitAmount[2], unit_amount_gross: 952, unit_amount_gross_decimal: '9.52' }}
    ${baseTiersUnitAmount}    | ${100}                             | ${PricingModel.tieredVolume}    | ${true}        | ${{ rate: 19 }} | ${{ ...baseTiersUnitAmount[2], unit_amount_gross: 800, unit_amount_gross_decimal: '8' }}
    ${baseTiersFlatFeeAmount} | ${0}                               | ${PricingModel.tieredFlatFee}   | ${true}        | ${{ rate: 19 }} | ${{ ...baseTiersFlatFeeAmount[0], flat_fee_amount_gross: 1000, flat_fee_amount_gross_decimal: '10' }}
    ${undefined}              | ${0}                               | ${PricingModel.tieredFlatFee}   | ${true}        | ${{ rate: 19 }} | ${undefined}
    ${baseTiersFlatFeeAmount} | ${undefined}                       | ${PricingModel.tieredFlatFee}   | ${true}        | ${{ rate: 19 }} | ${{ ...baseTiersFlatFeeAmount[0], flat_fee_amount_gross: 1000, flat_fee_amount_gross_decimal: '10' }}
    ${baseTiersFlatFeeAmount} | ${5}                               | ${PricingModel.tieredFlatFee}   | ${true}        | ${{ rate: 19 }} | ${{ ...baseTiersFlatFeeAmount[0], flat_fee_amount_gross: 1000, flat_fee_amount_gross_decimal: '10' }}
    ${baseTiersFlatFeeAmount} | ${10}                              | ${PricingModel.tieredFlatFee}   | ${true}        | ${{ rate: 19 }} | ${{ ...baseTiersFlatFeeAmount[0], flat_fee_amount_gross: 1000, flat_fee_amount_gross_decimal: '10' }}
    ${baseTiersFlatFeeAmount} | ${10.999}                          | ${PricingModel.tieredFlatFee}   | ${true}        | ${{ rate: 19 }} | ${{ ...baseTiersFlatFeeAmount[1], flat_fee_amount_gross: 900, flat_fee_amount_gross_decimal: '9' }}
    ${baseTiersFlatFeeAmount} | ${15}                              | ${PricingModel.tieredFlatFee}   | ${true}        | ${{ rate: 19 }} | ${{ ...baseTiersFlatFeeAmount[1], flat_fee_amount_gross: 900, flat_fee_amount_gross_decimal: '9' }}
    ${baseTiersFlatFeeAmount} | ${20}                              | ${PricingModel.tieredFlatFee}   | ${true}        | ${{ rate: 19 }} | ${{ ...baseTiersFlatFeeAmount[1], flat_fee_amount_gross: 900, flat_fee_amount_gross_decimal: '9' }}
    ${baseTiersFlatFeeAmount} | ${21}                              | ${PricingModel.tieredFlatFee}   | ${true}        | ${{ rate: 19 }} | ${{ ...baseTiersFlatFeeAmount[2], flat_fee_amount_gross: 800, flat_fee_amount_gross_decimal: '8' }}
    ${baseTiersFlatFeeAmount} | ${100}                             | ${PricingModel.tieredFlatFee}   | ${true}        | ${{ rate: 19 }} | ${{ ...baseTiersFlatFeeAmount[2], flat_fee_amount_gross: 800, flat_fee_amount_gross_decimal: '8' }}
    ${baseTiersFlatFeeAmount} | ${100}                             | ${PricingModel.tieredFlatFee}   | ${false}       | ${{ rate: 19 }} | ${{ ...baseTiersFlatFeeAmount[2], flat_fee_amount_gross: 952, flat_fee_amount_gross_decimal: '9.52' }}
    ${baseTiersFlatFeeAmount} | ${100}                             | ${PricingModel.tieredFlatFee}   | ${false}       | ${undefined}    | ${{ ...baseTiersFlatFeeAmount[2], flat_fee_amount_gross: 800, flat_fee_amount_gross_decimal: '8' }}
    ${baseTiersFlatFeeAmount} | ${100}                             | ${undefined}                    | ${true}        | ${{ rate: 19 }} | ${{ ...baseTiersFlatFeeAmount[0], flat_fee_amount_gross: 1000, flat_fee_amount_gross_decimal: '10' }}
  `(
    'should return correctly for quantity=$quantity and pricingModel=$pricingModel',
    ({
      tiers,
      quantity,
      pricingModel,
      isTaxInclusive,
      tax,
      expected,
    }: {
      tiers: PriceTier[];
      quantity: number;
      pricingModel: PricingModel;
      isTaxInclusive: boolean;
      tax: Tax;
      expected: string;
    }) => {
      expect(getDisplayTierByQuantity(tiers, quantity, pricingModel, isTaxInclusive, tax)).toEqual(expected);
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
    unit_amount_decimal: '0.05123412',
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
    pricingModel                    | tier                              | unit         | locale       | currency     | t                      | showStartsAt | enableSubunitDisplay | shouldDisplayOnRequest | precision    | expected
    ${PricingModel.tieredGraduated} | ${tierWithUnitAmount}             | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${mockedTranslationFn} | ${true}      | ${false}             | ${undefined}           | ${undefined} | ${'Starts at €10.00/kWh'}
    ${PricingModel.tieredVolume}    | ${tierWithUnitAmount}             | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${mockedTranslationFn} | ${true}      | ${false}             | ${undefined}           | ${undefined} | ${'Starts at €10.00/kWh'}
    ${PricingModel.tieredVolume}    | ${tierWithUnitAmount}             | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${mockedTranslationFn} | ${false}     | ${false}             | ${undefined}           | ${undefined} | ${'€10.00/kWh'}
    ${PricingModel.tieredVolume}    | ${tierWithUnitAmount}             | ${'kWh'}     | ${'de'}      | ${'EUR'}     | ${mockedTranslationFn} | ${true}      | ${false}             | ${undefined}           | ${undefined} | ${'Starts at 10,00 €/kWh'}
    ${PricingModel.tieredVolume}    | ${tierWithUnitAmount}             | ${'kWh'}     | ${'en'}      | ${'USD'}     | ${mockedTranslationFn} | ${true}      | ${false}             | ${undefined}           | ${undefined} | ${'Starts at $10.00/kWh'}
    ${PricingModel.tieredVolume}    | ${tierWithUnitAmount}             | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${mockedTranslationFn} | ${true}      | ${true}              | ${undefined}           | ${undefined} | ${'Starts at €10.00/kWh'}
    ${PricingModel.tieredVolume}    | ${tierWithSubunitAmount}          | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${mockedTranslationFn} | ${true}      | ${true}              | ${undefined}           | ${undefined} | ${'Starts at 5.12 cents/kWh'}
    ${PricingModel.tieredVolume}    | ${tierWithSubunitAmount}          | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${mockedTranslationFn} | ${true}      | ${true}              | ${undefined}           | ${4}         | ${'Starts at 5.1234 cents/kWh'}
    ${PricingModel.tieredVolume}    | ${tierWithUnitAmount}             | ${undefined} | ${'en'}      | ${'EUR'}     | ${mockedTranslationFn} | ${true}      | ${false}             | ${undefined}           | ${undefined} | ${'Starts at €10.00'}
    ${PricingModel.tieredVolume}    | ${tierWithUnitAmount}             | ${'unit'}    | ${'en'}      | ${'EUR'}     | ${mockedTranslationFn} | ${true}      | ${false}             | ${undefined}           | ${undefined} | ${'Starts at €10.00'}
    ${PricingModel.tieredVolume}    | ${tierWithUnitAmount}             | ${'kWh'}     | ${undefined} | ${'EUR'}     | ${mockedTranslationFn} | ${true}      | ${false}             | ${undefined}           | ${undefined} | ${'Starts at 10,00 €/kWh'}
    ${PricingModel.tieredVolume}    | ${tierWithUnitAmount}             | ${'kWh'}     | ${'en'}      | ${undefined} | ${mockedTranslationFn} | ${true}      | ${false}             | ${undefined}           | ${undefined} | ${'Starts at €10.00/kWh'}
    ${PricingModel.tieredVolume}    | ${tierWithUnitAmount}             | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${mockedTranslationFn} | ${undefined} | ${false}             | ${undefined}           | ${undefined} | ${'Starts at €10.00/kWh'}
    ${PricingModel.tieredVolume}    | ${tierWithUnitAmountZero}         | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${mockedTranslationFn} | ${true}      | ${false}             | ${undefined}           | ${undefined} | ${'Starts at €0.00/kWh'}
    ${PricingModel.tieredVolume}    | ${tierWithUnitAmountUndefined}    | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${mockedTranslationFn} | ${true}      | ${false}             | ${undefined}           | ${undefined} | ${undefined}
    ${PricingModel.tieredVolume}    | ${tierInvalid}                    | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${mockedTranslationFn} | ${true}      | ${false}             | ${undefined}           | ${undefined} | ${undefined}
    ${PricingModel.tieredFlatFee}   | ${tierWithFlatFeeAmount}          | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${mockedTranslationFn} | ${true}      | ${false}             | ${undefined}           | ${undefined} | ${'Starts at €10.00'}
    ${PricingModel.tieredFlatFee}   | ${tierWithFlatFeeAmountZero}      | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${mockedTranslationFn} | ${true}      | ${false}             | ${undefined}           | ${undefined} | ${'Starts at €0.00'}
    ${PricingModel.tieredFlatFee}   | ${tierWithFlatFeeAmountUndefined} | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${mockedTranslationFn} | ${true}      | ${false}             | ${undefined}           | ${undefined} | ${undefined}
    ${PricingModel.tieredVolume}    | ${tierWithUnitAmountOnRequest}    | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${mockedTranslationFn} | ${true}      | ${false}             | ${true}                | ${undefined} | ${'Price on request'}
    ${PricingModel.tieredFlatFee}   | ${tierWithFlatFeeAmountOnRequest} | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${mockedTranslationFn} | ${true}      | ${false}             | ${true}                | ${undefined} | ${'Price on request'}
    ${PricingModel.tieredVolume}    | ${tierWithUnitAmountOnRequest}    | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${mockedTranslationFn} | ${true}      | ${false}             | ${false}               | ${undefined} | ${'Starts at €10.00/kWh'}
    ${PricingModel.tieredFlatFee}   | ${tierWithFlatFeeAmountOnRequest} | ${'kWh'}     | ${'en'}      | ${'EUR'}     | ${mockedTranslationFn} | ${true}      | ${false}             | ${false}               | ${undefined} | ${'Starts at €10.00'}
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
      precision,
      expected,
    }: {
      pricingModel: PricingModel;
      tier: PriceTier;
      unit: string;
      locale: string;
      currency: Currency;
      t: Mock;
      showStartsAt: boolean;
      enableSubunitDisplay: boolean;
      shouldDisplayOnRequest?: boolean;
      precision?: number;
      expected: string;
    }) => {
      const result = getTierDescription(pricingModel, tier, unit, locale, currency, t, {
        showStartsAt,
        enableSubunitDisplay,
        showOnRequest: shouldDisplayOnRequest,
        precision,
      });

      expect(result?.replace(/\s+/g, ' ').trim()).toEqual(expected);
    },
  );

  it.each`
    pricingModel                    | tier                     | unit     | locale  | currency | t                      | showStartsAt | enableSubunitDisplay | shouldDisplayOnRequest | tax                                | expected
    ${PricingModel.tieredGraduated} | ${tierWithUnitAmount}    | ${'kWh'} | ${'en'} | ${'EUR'} | ${mockedTranslationFn} | ${true}      | ${false}             | ${undefined}           | ${{ isInclusive: true, rate: 10 }} | ${'Starts at €9.09/kWh'}
    ${PricingModel.tieredVolume}    | ${tierWithUnitAmount}    | ${'kWh'} | ${'en'} | ${'EUR'} | ${mockedTranslationFn} | ${true}      | ${false}             | ${undefined}           | ${{ isInclusive: true, rate: 10 }} | ${'Starts at €9.09/kWh'}
    ${PricingModel.tieredVolume}    | ${tierWithSubunitAmount} | ${'kWh'} | ${'en'} | ${'EUR'} | ${mockedTranslationFn} | ${true}      | ${true}              | ${undefined}           | ${{ isInclusive: true, rate: 10 }} | ${'Starts at 4.66 cents/kWh'}
    ${PricingModel.tieredFlatFee}   | ${tierWithFlatFeeAmount} | ${'kWh'} | ${'en'} | ${'EUR'} | ${mockedTranslationFn} | ${true}      | ${false}             | ${undefined}           | ${{ isInclusive: true, rate: 10 }} | ${'Starts at €9.09'}
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
      t: Mock;
      showStartsAt: boolean;
      enableSubunitDisplay: boolean;
      shouldDisplayOnRequest?: boolean;
      tax: { isInclusive: boolean; rate: number };
      expected: string;
    }) => {
      const result = getTierDescription(
        pricingModel,
        tier,
        unit,
        locale,
        currency,
        t,
        {
          showStartsAt,
          enableSubunitDisplay,
          showOnRequest: shouldDisplayOnRequest,
        },
        tax,
      );

      expect(result?.replace(/\s+/g, ' ').trim()).toEqual(expected);
    },
  );
});
