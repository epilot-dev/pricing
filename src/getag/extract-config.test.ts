import type { CompositePriceItem, PriceGetAg, PriceItem, TariffTypeGetAg } from '@epilot/pricing-client';
import { describe, expect, it } from 'vitest';
import { extractGetAgConfig } from './extract-config';

describe('extractGetAgConfig', () => {
  describe('non-composite price items', () => {
    describe('base_price type', () => {
      it('should return get_ag config when type matches base_price', () => {
        const mockGetAgConfig: PriceGetAg = {
          type: 'base_price',
          category: 'power',
          markup_amount: 1000,
          markup_amount_decimal: '10.00',
          unit_amount_gross: 1000,
          unit_amount_net: 1000,
        };

        const priceItem: PriceItem = {
          is_composite_price: false,
          get_ag: mockGetAgConfig,
        } as PriceItem;

        const result = extractGetAgConfig(priceItem, { type: 'base_price' });

        expect(result).toEqual(mockGetAgConfig);
      });

      it('should return undefined when get_ag is undefined', () => {
        const priceItem: PriceItem = {
          is_composite_price: false,
          get_ag: undefined,
        } as PriceItem;

        const result = extractGetAgConfig(priceItem, { type: 'base_price' });

        expect(result).toBeUndefined();
      });
    });

    describe('work_price type', () => {
      it('should return get_ag config when type and tariff_type match (HT)', () => {
        const mockGetAgConfig: PriceGetAg = {
          type: 'work_price',
          tariff_type: 'HT',
          category: 'power',
          markup_amount: 1000,
          markup_amount_decimal: '10.00',
          unit_amount_gross: 1000,
          unit_amount_net: 1000,
        };

        const priceItem: PriceItem = {
          is_composite_price: false,
          get_ag: mockGetAgConfig,
        } as PriceItem;

        const result = extractGetAgConfig(priceItem, {
          type: 'work_price',
          tariffType: 'HT' as TariffTypeGetAg,
        });

        expect(result).toEqual(mockGetAgConfig);
      });

      it('should return get_ag config when type matches and tariff_type defaults to HT', () => {
        const mockGetAgConfig: PriceGetAg = {
          type: 'work_price',
          // tariff_type is undefined, should default to HT
          category: 'power',
          markup_amount: 1000,
          markup_amount_decimal: '10.00',
          unit_amount_gross: 1000,
          unit_amount_net: 1000,
        };

        const priceItem: PriceItem = {
          is_composite_price: false,
          get_ag: mockGetAgConfig,
        } as PriceItem;

        const result = extractGetAgConfig(priceItem, {
          type: 'work_price',
          tariffType: 'HT' as TariffTypeGetAg,
        });

        expect(result).toEqual(mockGetAgConfig);
      });

      it('should return get_ag config when type and tariff_type match (NT)', () => {
        const mockGetAgConfig: PriceGetAg = {
          type: 'work_price',
          tariff_type: 'NT',
          category: 'power',
          markup_amount: 1000,
          markup_amount_decimal: '10.00',
          unit_amount_gross: 1000,
          unit_amount_net: 1000,
        };

        const priceItem: PriceItem = {
          is_composite_price: false,
          get_ag: mockGetAgConfig,
        } as PriceItem;

        const result = extractGetAgConfig(priceItem, {
          type: 'work_price',
          tariffType: 'NT' as TariffTypeGetAg,
        });

        expect(result).toEqual(mockGetAgConfig);
      });

      it('should return undefined when type matches but tariff_type does not match', () => {
        const mockGetAgConfig: PriceGetAg = {
          type: 'work_price',
          tariff_type: 'HT',
          category: 'power',
          markup_amount: 1000,
          markup_amount_decimal: '10.00',
          unit_amount_gross: 1000,
          unit_amount_net: 1000,
        };

        const priceItem: PriceItem = {
          is_composite_price: false,
          get_ag: mockGetAgConfig,
        } as PriceItem;

        const result = extractGetAgConfig(priceItem, {
          type: 'work_price',
          tariffType: 'NT' as TariffTypeGetAg,
        });

        expect(result).toBeUndefined();
      });

      it('should return undefined when type does not match', () => {
        const mockGetAgConfig: PriceGetAg = {
          type: 'base_price',
          category: 'power',
          markup_amount: 1000,
          markup_amount_decimal: '10.00',
          unit_amount_gross: 1000,
          unit_amount_net: 1000,
        };

        const priceItem: PriceItem = {
          is_composite_price: false,
          get_ag: mockGetAgConfig,
        } as PriceItem;

        const result = extractGetAgConfig(priceItem, {
          type: 'work_price',
          tariffType: 'HT' as TariffTypeGetAg,
        });

        expect(result).toBeUndefined();
      });
    });
  });

  describe('composite price items', () => {
    it('should handle matching base_price and work_price when both are present', () => {
      const matchingGetAgConfigBasePrice: PriceGetAg = {
        type: 'base_price',
        category: 'power',
        markup_amount: 1000,
        markup_amount_decimal: '10.00',
        unit_amount_gross: 1000,
        unit_amount_net: 1000,
      };

      const matchingGetAgConfigWorkPrice: PriceGetAg = {
        type: 'work_price',
        tariff_type: 'HT',
        category: 'power',
        markup_amount: 500,
        markup_amount_decimal: '5.00',
        unit_amount_gross: 500,
        unit_amount_net: 500,
      };

      const compositePriceItem: CompositePriceItem = {
        is_composite_price: true,
        item_components: [
          {
            get_ag: matchingGetAgConfigWorkPrice,
          } as PriceItem,
          {
            get_ag: matchingGetAgConfigBasePrice,
          } as PriceItem,
        ],
      } as CompositePriceItem;

      const result1 = extractGetAgConfig(compositePriceItem, { type: 'base_price' });
      const result2 = extractGetAgConfig(compositePriceItem, {
        type: 'work_price',
        tariffType: 'HT' as TariffTypeGetAg,
      });

      expect(result1).toEqual(matchingGetAgConfigBasePrice);
      expect(result2).toEqual(matchingGetAgConfigWorkPrice);
    });
    it('should return undefined when no matching get_ag config is found', () => {
      const compositePriceItem: CompositePriceItem = {
        is_composite_price: true,
        item_components: [],
      } as CompositePriceItem;

      const result = extractGetAgConfig(compositePriceItem, { type: 'base_price' });

      expect(result).toBeUndefined();
    });
  });
});
