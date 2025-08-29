import type { PriceGetAg, TariffTypeGetAg } from '@epilot/pricing-client';
import { describe, expect, it, vi } from 'vitest';
import { tax19percent } from '../../__tests__/fixtures/tax.samples';
import type { Currency, I18n } from '../../shared/types';
import type { TimeFrequency } from '../../time-frequency/types';
import type { ExternalFeesMetadata, StaticFee, VariableFee } from '../types';
import { getDetailsFee, getMarkupDetailsFee } from './utils';

describe('getDetailsFee', () => {
  const mockI18n: I18n = {
    t: ((key: string) => {
      if (key.includes('billing_period.monthly')) return 'per month';
      if (key.includes('billing_period.yearly')) return 'per year';
      return key;
    }) as never,
    language: 'en',
  };

  const defaultParams = {
    currency: 'EUR' as Currency,
    i18n: mockI18n,
    billingPeriod: 'monthly' as TimeFrequency,
    unitPricePeriod: 'monthly' as TimeFrequency,
    label: 'Test Fee',
  };

  describe('when fee is undefined', () => {
    it('should return undefined', () => {
      const result = getDetailsFee({
        ...defaultParams,
        fee: undefined,
      });

      expect(result).toBeUndefined();
    });
  });

  describe('when fee is a static fee', () => {
    const staticFee: StaticFee = {
      amount: 1000,
      amount_decimal: '10.00',
      label: 'Static Fee',
    };

    it('should return formatted static fee details', () => {
      const result = getDetailsFee({
        ...defaultParams,
        fee: staticFee,
      });

      expect(result).toEqual({
        amount: '€10.00 per month',
        amount_decimal: '10.00',
        amount_yearly_decimal: '120',
        amount_yearly: '€120.00',
        label: 'Test Fee',
      });
    });

    it('should apply tax when provided', () => {
      const result = getDetailsFee({
        ...defaultParams,
        fee: staticFee,
        tax: tax19percent,
      });

      expect(result).toEqual({
        amount: '€11.90 per month',
        amount_decimal: '11.9',
        amount_yearly_decimal: '142.8',
        amount_yearly: '€142.80',
        label: 'Test Fee',
      });
    });

    it('should handle different billing and unit price periods', () => {
      const result = getDetailsFee({
        ...defaultParams,
        fee: staticFee,
        billingPeriod: 'yearly' as TimeFrequency,
        unitPricePeriod: 'monthly' as TimeFrequency,
      });

      expect(result).toEqual({
        amount: '83.3333 cents per month',
        amount_decimal: '10.00',
        amount_yearly_decimal: '10',
        amount_yearly: '€10.00',
        label: 'Test Fee',
      });
    });

    it('should return default values when amount is missing', () => {
      const feeWithoutAmount: StaticFee = {
        amount: 0,
        amount_decimal: '',
        label: 'Empty Fee',
      };

      const result = getDetailsFee({
        ...defaultParams,
        fee: feeWithoutAmount,
      });

      expect(result).toEqual({
        amount: '-',
        amount_decimal: '0',
        amount_yearly_decimal: '0',
        amount_yearly: '-',
        label: 'Test Fee',
      });
    });
  });

  describe('when fee is a variable fee', () => {
    const variableFee: VariableFee = {
      amount: 500,
      amount_decimal: '5.00',
      unit_amount: 50,
      unit_amount_decimal: '0.50',
      label: 'Variable Fee',
    };

    it('should return formatted variable fee details', () => {
      const result = getDetailsFee({
        ...defaultParams,
        fee: variableFee,
        variableUnit: 'kWh',
      });

      expect(result).toEqual({
        amount: '50.00 cents/kWh',
        amount_decimal: '5.00',
        amount_yearly_decimal: '60',
        amount_yearly: '€60.00',
        label: 'Test Fee',
      });
    });

    it('should apply tax to variable fee', () => {
      const result = getDetailsFee({
        ...defaultParams,
        fee: variableFee,
        tax: tax19percent,
        variableUnit: 'kWh',
      });

      expect(result).toEqual({
        amount: '59.50 cents/kWh',
        amount_decimal: '5.95',
        amount_yearly_decimal: '71.4',
        amount_yearly: '€71.40',
        label: 'Test Fee',
      });
    });

    it('should handle missing unit amount', () => {
      const feeWithoutUnitAmount: VariableFee = {
        amount: 500,
        amount_decimal: '5.00',
        unit_amount: 0,
        unit_amount_decimal: '',
        label: 'Variable Fee No Unit',
      };

      const result = getDetailsFee({
        ...defaultParams,
        fee: feeWithoutUnitAmount,
        variableUnit: 'kWh',
      });

      expect(result).toEqual({
        amount: '-',
        amount_decimal: '5.00',
        amount_yearly_decimal: '60',
        amount_yearly: '€60.00',
        label: 'Test Fee',
      });
    });

    it('should handle missing amount but present unit amount', () => {
      const feeWithoutAmount: VariableFee = {
        amount: 0,
        amount_decimal: '',
        unit_amount: 50,
        unit_amount_decimal: '0.50',
        label: 'Variable Fee No Amount',
      };

      const result = getDetailsFee({
        ...defaultParams,
        fee: feeWithoutAmount,
        variableUnit: 'kWh',
      });

      expect(result).toEqual({
        amount: '50.00 cents/kWh',
        amount_decimal: '0',
        amount_yearly_decimal: '0',
        amount_yearly: '-',
        label: 'Test Fee',
      });
    });
  });
});

describe('getMarkupDetailsFee', () => {
  const mockI18n: I18n = {
    t: ((key: string) => {
      if (key.includes('markup_procurement')) return 'Procurement Markup';
      if (key.includes('markup_base_price')) return 'Base Price Markup';
      if (key.includes('markup_work_price')) return 'Work Price Markup';
      if (key.includes('billing_period.monthly')) return 'per month';
      return key;
    }) as never,
    language: 'en',
  };

  const defaultParams = {
    currency: 'EUR' as Currency,
    i18n: mockI18n,
    billingPeriod: 'monthly' as TimeFrequency,
    unitPricePeriod: 'monthly' as TimeFrequency,
    variableUnit: 'kWh',
  };

  const mockExternalFeesMetadata: ExternalFeesMetadata = {
    billing_period: 'monthly',
    inputs: {
      consumptionHT: 1000,
      consumptionNT: 500,
      type: 'power',
    },
    breakdown: {
      static: {},
      variable: {},
      variable_ht: {},
    },
  };

  describe('when priceGetAgConfig is undefined', () => {
    it('should return undefined', () => {
      const result = getMarkupDetailsFee({
        ...defaultParams,
        priceGetAgConfig: undefined,
        externalFeesMetadata: mockExternalFeesMetadata,
        options: { type: 'base_price' },
      });

      expect(result).toBeUndefined();
    });
  });

  describe('when options.type is "additional_markup"', () => {
    const priceGetAgConfigWithAdditionalMarkups: PriceGetAg = {
      category: 'power',
      markup_amount: 10,
      markup_amount_decimal: '0.10',
      markup_amount_gross_decimal: '0.10',
      unit_amount_gross: 0,
      unit_amount_net: 0,
      additional_markups_enabled: true,
      additional_markups: {
        procurement: {
          amount: 5,
          amount_decimal: '0.05',
          amount_gross_decimal: '0.05',
        },
      },
    };

    it('should return procurement markup fee for HT tariff', () => {
      const result = getMarkupDetailsFee({
        ...defaultParams,
        priceGetAgConfig: priceGetAgConfigWithAdditionalMarkups,
        externalFeesMetadata: mockExternalFeesMetadata,
        options: {
          type: 'additional_markup',
          tariffType: 'HT' as TariffTypeGetAg,
          key: 'procurement',
        },
      });

      expect(result).toEqual({
        label: 'Procurement Markup',
        amount: '5.00 cents/kWh',
        amount_decimal: '0.05',
        amount_yearly_decimal: '50',
        amount_yearly: '€50.00',
      });
    });

    it('should return undefined when additional_markups_enabled is false', () => {
      const priceGetAgConfigWithoutMarkups: PriceGetAg = {
        category: 'power',
        markup_amount: 10,
        markup_amount_decimal: '0.10',
        markup_amount_gross_decimal: '0.10',
        unit_amount_gross: 0,
        unit_amount_net: 0,
        additional_markups_enabled: false,
      };

      const result = getMarkupDetailsFee({
        ...defaultParams,
        priceGetAgConfig: priceGetAgConfigWithoutMarkups,
        externalFeesMetadata: mockExternalFeesMetadata,
        options: {
          type: 'additional_markup',
          tariffType: 'HT' as TariffTypeGetAg,
          key: 'procurement',
        },
      });

      expect(result).toBeUndefined();
    });

    it('should return undefined when procurement markup is missing', () => {
      const priceGetAgConfigWithoutProcurement: PriceGetAg = {
        category: 'power',
        markup_amount: 10,
        markup_amount_decimal: '0.10',
        markup_amount_gross_decimal: '0.10',
        unit_amount_gross: 0,
        unit_amount_net: 0,
        additional_markups_enabled: true,
        additional_markups: {},
      };

      const result = getMarkupDetailsFee({
        ...defaultParams,
        priceGetAgConfig: priceGetAgConfigWithoutProcurement,
        externalFeesMetadata: mockExternalFeesMetadata,
        options: {
          type: 'additional_markup',
          tariffType: 'HT' as TariffTypeGetAg,
          key: 'procurement',
        },
      });

      expect(result).toBeUndefined();
    });
  });

  describe('when options.type is "base_price"', () => {
    const priceGetAgConfig: PriceGetAg = {
      category: 'power',
      markup_amount: 1000,
      markup_amount_decimal: '10.00',
      markup_amount_gross_decimal: '10.00',
      unit_amount_gross: 0,
      unit_amount_net: 0,
    };

    it('should return base price markup fee', () => {
      const result = getMarkupDetailsFee({
        ...defaultParams,
        priceGetAgConfig,
        externalFeesMetadata: mockExternalFeesMetadata,
        options: { type: 'base_price' },
      });

      expect(result).toEqual({
        amount: '€10.00 per month',
        amount_decimal: '10.00',
        amount_yearly_decimal: '120',
        amount_yearly: '€120.00',
        label: 'Base Price Markup',
      });
    });

    it('should handle missing markup amounts', () => {
      const priceGetAgConfigWithoutMarkup: PriceGetAg = {
        category: 'power',
        markup_amount: 0,
        markup_amount_decimal: '',
        markup_amount_gross_decimal: '',
        unit_amount_gross: 0,
        unit_amount_net: 0,
      };

      const result = getMarkupDetailsFee({
        ...defaultParams,
        priceGetAgConfig: priceGetAgConfigWithoutMarkup,
        externalFeesMetadata: mockExternalFeesMetadata,
        options: { type: 'base_price' },
      });

      expect(result).toEqual({
        amount: '-',
        amount_decimal: '0',
        amount_yearly_decimal: '0',
        amount_yearly: '-',
        label: 'Base Price Markup',
      });
    });
  });

  describe('when options.type is "work_price"', () => {
    const priceGetAgConfig: PriceGetAg = {
      category: 'power',
      markup_amount: 10,
      markup_amount_decimal: '0.10',
      markup_amount_gross_decimal: '0.10',
      unit_amount_gross: 0,
      unit_amount_net: 0,
    };

    it('should return work price markup fee for HT tariff', () => {
      const result = getMarkupDetailsFee({
        ...defaultParams,
        priceGetAgConfig,
        externalFeesMetadata: mockExternalFeesMetadata,
        options: {
          type: 'work_price',
          tariffType: 'HT' as TariffTypeGetAg,
        },
      });

      expect(result).toEqual({
        amount: '10.00 cents/kWh',
        amount_decimal: '0.10',
        amount_yearly_decimal: '100',
        amount_yearly: '€100.00',
        label: 'Work Price Markup',
      });
    });

    it('should return work price markup fee for NT tariff', () => {
      const result = getMarkupDetailsFee({
        ...defaultParams,
        priceGetAgConfig,
        externalFeesMetadata: mockExternalFeesMetadata,
        options: {
          type: 'work_price',
          tariffType: 'NT' as TariffTypeGetAg,
        },
      });

      expect(result).toEqual({
        amount: '10.00 cents/kWh',
        amount_decimal: '0.10',
        amount_yearly_decimal: '50',
        amount_yearly: '€50.00',
        label: 'Work Price Markup',
      });
    });

    it('should handle missing markup amounts', () => {
      const priceGetAgConfigWithoutMarkup: PriceGetAg = {
        category: 'power',
        markup_amount: 0,
        markup_amount_decimal: '',
        markup_amount_gross_decimal: '',
        unit_amount_gross: 0,
        unit_amount_net: 0,
      };

      const result = getMarkupDetailsFee({
        ...defaultParams,
        priceGetAgConfig: priceGetAgConfigWithoutMarkup,
        externalFeesMetadata: mockExternalFeesMetadata,
        options: {
          type: 'work_price',
          tariffType: 'HT' as TariffTypeGetAg,
        },
      });

      expect(result).toEqual({
        amount: '-',
        amount_decimal: '0',
        amount_yearly_decimal: '0',
        amount_yearly: '-',
        label: 'Work Price Markup',
      });
    });
  });
});
