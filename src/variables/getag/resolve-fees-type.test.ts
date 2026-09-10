import type { CompositePriceItem, PriceItem } from '@epilot/sdk/pricing';
import { describe, expect, it } from 'vitest';
import type { ExternalFeesMetadata } from '../types';
import { resolveExternalFeesType } from './resolve-fees-type';

const fee = { amount: 1, amount_decimal: '0.01' };

const metadata = (
  breakdown: Partial<ExternalFeesMetadata['breakdown']>,
  inputs?: ExternalFeesMetadata['inputs'],
): ExternalFeesMetadata =>
  ({
    billing_period: 'monthly',
    ...(inputs && { inputs }),
    breakdown: { static: {}, variable: {}, variable_ht: {}, ...breakdown },
  }) as ExternalFeesMetadata;

/** Shape of the pricing API gas compute result, as seen on order OR-2143 (org 16582003). */
const gasBreakdown: Partial<ExternalFeesMetadata['breakdown']> = {
  static: { basic_fee: fee, invoice_fee: fee, maintenance_fee: fee, metering_reading_fee: fee },
  variable: {
    concession: fee,
    grid_fee: fee,
    performance: fee,
    co2: fee,
    control_energy: fee,
    neutrality_charge: fee,
    gas_tax: fee,
    gas_storage: fee,
    gas_conversion_charge: fee,
  },
};

const powerBreakdown: Partial<ExternalFeesMetadata['breakdown']> = {
  static: { basic_fee: fee, maintenance_fee: fee },
  variable: { concession: fee, power_tax: fee, chp: fee, extra_charge: fee, offshore_liability_fee: fee },
};

describe('resolveExternalFeesType', () => {
  it('uses inputs.type when the journey attached it', () => {
    expect(resolveExternalFeesType(metadata(powerBreakdown, { type: 'gas' }))).toBe('gas');
    expect(resolveExternalFeesType(metadata(gasBreakdown, { type: 'power' }))).toBe('power');
  });

  it('derives gas from gas-only breakdown keys when inputs is missing', () => {
    expect(resolveExternalFeesType(metadata(gasBreakdown))).toBe('gas');
  });

  it('derives gas from gas-only static keys alone', () => {
    expect(resolveExternalFeesType(metadata({ static: { basic_fee: fee, invoice_fee: fee } }))).toBe('gas');
  });

  it('derives power from power-only breakdown keys when inputs is missing', () => {
    expect(resolveExternalFeesType(metadata(powerBreakdown))).toBe('power');
  });

  it('derives power from the HT/NT network fee keys', () => {
    expect(resolveExternalFeesType(metadata({ variable: { power_kwh_ht: fee, power_kwh_nt: fee } }))).toBe('power');
  });

  it('ignores inputs without a valid type and falls through to the breakdown', () => {
    expect(resolveExternalFeesType(metadata(gasBreakdown, { consumptionHT: 1000 }))).toBe('gas');
  });

  describe('when the breakdown only has commodity-agnostic keys', () => {
    const agnostic = metadata({ static: { basic_fee: fee }, variable: { concession: fee } });

    it('falls back to the getag category of a simple price item', () => {
      const item = { get_ag: { type: 'work_price', tariff_type: 'HT', category: 'gas' } } as unknown as PriceItem;

      expect(resolveExternalFeesType(agnostic, item)).toBe('gas');
    });

    it('falls back to the getag category of a composite price component', () => {
      const item = {
        is_composite_price: true,
        item_components: [
          { get_ag: { type: 'base_price', category: 'gas' } },
          { get_ag: { type: 'work_price', tariff_type: 'HT', category: 'gas' } },
        ],
      } as unknown as CompositePriceItem;

      expect(resolveExternalFeesType(agnostic, item)).toBe('gas');
    });

    it('defaults to power when nothing else is known', () => {
      expect(resolveExternalFeesType(agnostic)).toBe('power');
      expect(resolveExternalFeesType(agnostic, {} as PriceItem)).toBe('power');
    });
  });

  it('tolerates a missing breakdown entirely', () => {
    expect(resolveExternalFeesType({ billing_period: 'monthly' } as ExternalFeesMetadata)).toBe('power');
  });
});
