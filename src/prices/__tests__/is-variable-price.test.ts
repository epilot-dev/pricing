import type { CompositePrice, CompositePriceItem, Price, PriceItem } from '../../shared/types';
import { isVariablePrice, isVariablePriceItem } from '../is-variable-price';

const makePrice = (overrides: Partial<Price> = {}): Price =>
  ({
    pricing_model: 'per_unit',
    ...overrides,
  }) as Price;

describe('isVariablePrice', () => {
  it('returns true for per_unit with variable_price true', () => {
    expect(isVariablePrice(makePrice({ pricing_model: 'per_unit', variable_price: true }))).toBe(true);
  });

  it('returns false for per_unit with variable_price false', () => {
    expect(isVariablePrice(makePrice({ pricing_model: 'per_unit', variable_price: false }))).toBe(false);
  });

  it('returns false for per_unit without variable_price', () => {
    expect(isVariablePrice(makePrice({ pricing_model: 'per_unit' }))).toBe(false);
  });

  it.each(['tiered_volume', 'tiered_graduated', 'tiered_flatfee'] as const)(
    'returns true for tiered model: %s',
    (pricing_model) => {
      expect(isVariablePrice(makePrice({ pricing_model }))).toBe(true);
    },
  );

  it('returns true for dynamic_tariff', () => {
    expect(isVariablePrice(makePrice({ pricing_model: 'dynamic_tariff' }))).toBe(true);
  });

  it('returns true for external_getag with work_price', () => {
    expect(isVariablePrice(makePrice({ pricing_model: 'external_getag', get_ag: { type: 'work_price' } }))).toBe(true);
  });

  it('returns true for external_getag with base_price and tiered_flatfee markup', () => {
    expect(
      isVariablePrice(
        makePrice({
          pricing_model: 'external_getag',
          get_ag: { type: 'base_price', markup_pricing_model: 'tiered_flatfee' },
        }),
      ),
    ).toBe(true);
  });

  it('returns false for external_getag with base_price and non-tiered markup', () => {
    expect(isVariablePrice(makePrice({ pricing_model: 'external_getag', get_ag: { type: 'base_price' } }))).toBe(false);
  });

  it('returns false for external_getag without get_ag', () => {
    expect(isVariablePrice(makePrice({ pricing_model: 'external_getag' }))).toBe(false);
  });

  it('returns false for CompositePrice', () => {
    const composite = { price_components: [makePrice()] } as unknown as CompositePrice;

    expect(isVariablePrice(composite)).toBe(false);
  });
});

describe('isVariablePriceItem', () => {
  it('returns true when _price is variable', () => {
    const item = { _price: makePrice({ pricing_model: 'tiered_volume' }) } as PriceItem;

    expect(isVariablePriceItem(item)).toBe(true);
  });

  it('returns false when _price is not variable', () => {
    const item = { _price: makePrice({ pricing_model: 'per_unit', variable_price: false }) } as PriceItem;

    expect(isVariablePriceItem(item)).toBe(false);
  });

  it('returns false for CompositePriceItem', () => {
    const item = {
      is_composite_price: true,
      _price: { is_composite_price: true, price_components: [] },
    } as unknown as CompositePriceItem;

    expect(isVariablePriceItem(item)).toBe(false);
  });

  it('returns false when _price is missing', () => {
    const item = {} as PriceItem;

    expect(isVariablePriceItem(item)).toBe(false);
  });
});
