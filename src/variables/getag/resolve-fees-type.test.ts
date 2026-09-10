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

const itemWithGetAg = (getAg: Record<string, unknown>) => ({ get_ag: getAg }) as unknown as PriceItem;

/** Shape of the pricing API gas compute result. */
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
    expect(resolveExternalFeesType(metadata(powerBreakdown, { type: 'gas' }), itemWithGetAg({}))).toBe('gas');
    expect(resolveExternalFeesType(metadata(gasBreakdown, { type: 'power' }), itemWithGetAg({}))).toBe('power');
  });

  describe('when inputs.type is missing', () => {
    it('uses the getag category of a work_price item', () => {
      const item = itemWithGetAg({
        category: 'gas',
        consumption_type: 'household',
        tariff_type: 'HT',
        type: 'work_price',
        markup_amount: 11,
        markup_amount_decimal: '0.1054',
      });

      expect(resolveExternalFeesType(metadata(powerBreakdown), item)).toBe('gas');
    });

    it('uses the getag category of a base_price item', () => {
      const item = itemWithGetAg({ category: 'gas', consumption_type: 'household', type: 'base_price' });

      expect(resolveExternalFeesType(metadata(powerBreakdown), item)).toBe('gas');
    });

    it('uses the getag category even when get_ag omits the optional type', () => {
      const item = itemWithGetAg({ category: 'gas', consumption_type: 'household' });

      expect(resolveExternalFeesType(metadata(powerBreakdown), item)).toBe('gas');
    });

    it('uses the getag category of the first composite component that carries one', () => {
      const item = {
        is_composite_price: true,
        item_components: [
          { _id: 'no-getag-component' },
          { get_ag: { type: 'base_price', category: 'gas' } },
          { get_ag: { type: 'work_price', tariff_type: 'HT', category: 'gas' } },
        ],
      } as unknown as CompositePriceItem;

      expect(resolveExternalFeesType(metadata(powerBreakdown), item)).toBe('gas');
    });

    it('ignores inputs without a valid type', () => {
      const item = itemWithGetAg({ category: 'gas', type: 'work_price', tariff_type: 'HT' });

      expect(resolveExternalFeesType(metadata(gasBreakdown, { consumptionHT: 1000 }), item)).toBe('gas');
    });

    /** Seen in production: a `category: 'power'` price carrying a gas compute result. */
    it('follows the getag category even when the breakdown disagrees with it', () => {
      const item = itemWithGetAg({ category: 'power', type: 'work_price', tariff_type: 'HT' });

      expect(resolveExternalFeesType(metadata(gasBreakdown), item)).toBe('power');
    });
  });

  describe('when the item carries no getag category', () => {
    it('defaults to power', () => {
      expect(resolveExternalFeesType(metadata(gasBreakdown), {} as PriceItem)).toBe('power');
      expect(resolveExternalFeesType(metadata(powerBreakdown), itemWithGetAg({}))).toBe('power');
      expect(resolveExternalFeesType(metadata(gasBreakdown), { is_composite_price: true } as CompositePriceItem)).toBe(
        'power',
      );
    });
  });

  it('tolerates a missing breakdown entirely', () => {
    const item = itemWithGetAg({ category: 'gas', type: 'work_price', tariff_type: 'HT' });

    expect(resolveExternalFeesType({ billing_period: 'monthly' } as ExternalFeesMetadata, item)).toBe('gas');
  });
});
