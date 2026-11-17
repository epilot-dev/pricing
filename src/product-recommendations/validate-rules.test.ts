import { describe, expect, it } from 'vitest';
import type { ProductRecommendationRule } from './types';
import { validateProductRecommendationRules } from './validate-rules';

const offer = (id = 'g1', productId = 'prod-x', priceId = 'price-x') => ({
  id,
  items: [{ product_id: productId, price_id: priceId }],
});

const rule = (
  id: string,
  source: ProductRecommendationRule['source'],
  offerGroups = [offer(`${id}-g1`)],
): ProductRecommendationRule => ({ id, source, offer_groups: offerGroups });

const codes = (rules?: ProductRecommendationRule[]) => validateProductRecommendationRules(rules).map((e) => e.code);

describe('validateProductRecommendationRules', () => {
  it('returns no errors for a valid rule table', () => {
    const rules = [
      rule('r1', { product_id: 'prod-a', price_id: 'price-a' }),
      rule('r2', { product_id: 'prod-a', price_id: 'price-b' }, [offer('g2'), { ...offer('g3'), target_id: 't1' }]),
      rule('r3', null),
    ];

    expect(validateProductRecommendationRules(rules)).toStrictEqual([]);
  });

  it('accepts a fallback-only rule table', () => {
    expect(validateProductRecommendationRules([rule('r1', null)])).toStrictEqual([]);
  });

  it.each([undefined, []])('requires at least one rule (%s)', (rules) => {
    expect(validateProductRecommendationRules(rules)).toStrictEqual([
      { code: 'RULES_REQUIRED', message: 'Add at least one rule.' },
    ]);
  });

  it.each([
    { product_id: 'prod-a', price_id: '' },
    { product_id: '', price_id: 'price-a' },
  ])('requires a complete source %o', (source) => {
    expect(validateProductRecommendationRules([rule('r1', source)])).toStrictEqual([
      expect.objectContaining({ code: 'RULE_SOURCE_REQUIRED', rule_id: 'r1' }),
    ]);
  });

  it('rejects duplicate sources on the later rule', () => {
    const rules = [
      rule('r1', { product_id: 'prod-a', price_id: 'price-a' }),
      rule('r2', { product_id: 'prod-a', price_id: 'price-a' }),
    ];

    expect(validateProductRecommendationRules(rules)).toStrictEqual([
      expect.objectContaining({ code: 'DUPLICATE_SOURCE', rule_id: 'r2', message: expect.stringContaining('"r1"') }),
    ]);
  });

  it('allows the same source product with different prices', () => {
    const rules = [
      rule('r1', { product_id: 'prod-a', price_id: 'price-a' }),
      rule('r2', { product_id: 'prod-a', price_id: 'price-b' }),
    ];

    expect(codes(rules)).toStrictEqual([]);
  });

  it('allows only one fallback', () => {
    const rules = [rule('r1', null), rule('r2', null), rule('r3', null)];

    expect(validateProductRecommendationRules(rules)).toStrictEqual([
      expect.objectContaining({ code: 'MULTIPLE_FALLBACKS', rule_id: 'r2' }),
      expect.objectContaining({ code: 'MULTIPLE_FALLBACKS', rule_id: 'r3' }),
    ]);
  });

  it('requires offer groups', () => {
    expect(validateProductRecommendationRules([rule('r1', null, [])])).toStrictEqual([
      expect.objectContaining({ code: 'OFFERS_REQUIRED', rule_id: 'r1' }),
    ]);
  });

  it('requires items in every offer group', () => {
    const rules = [rule('r1', null, [offer('g1'), { id: 'g2', items: [] }])];

    expect(validateProductRecommendationRules(rules)).toStrictEqual([
      expect.objectContaining({ code: 'OFFERS_REQUIRED', rule_id: 'r1', offer_group_id: 'g2' }),
    ]);
  });

  it('requires a product and a price on every offer item', () => {
    const rules = [
      rule('r1', null, [
        {
          id: 'g1',
          items: [
            { product_id: 'prod-x', price_id: 'price-x' },
            { product_id: 'prod-y', price_id: '' },
          ],
        },
      ]),
    ];

    expect(validateProductRecommendationRules(rules)).toStrictEqual([
      expect.objectContaining({ code: 'OFFERS_REQUIRED', rule_id: 'r1', offer_group_id: 'g1', item_index: 1 }),
    ]);
  });

  it('rejects a rule offering its own source', () => {
    const rules = [
      rule('r1', { product_id: 'prod-a', price_id: 'price-a' }, [
        { id: 'g1', items: [{ product_id: 'prod-a', price_id: 'price-b' }] },
        {
          id: 'g2',
          items: [
            { product_id: 'prod-x', price_id: 'price-x' },
            { product_id: 'prod-a', price_id: 'price-a' },
          ],
        },
      ]),
    ];

    expect(validateProductRecommendationRules(rules)).toStrictEqual([
      expect.objectContaining({ code: 'OFFER_IS_OWN_SOURCE', rule_id: 'r1', offer_group_id: 'g2', item_index: 1 }),
    ]);
  });

  it('rejects duplicate rule ids', () => {
    const rules = [
      rule('r1', { product_id: 'prod-a', price_id: 'price-a' }),
      rule('r1', { product_id: 'prod-b', price_id: 'price-b' }),
    ];

    expect(validateProductRecommendationRules(rules)).toStrictEqual([
      expect.objectContaining({ code: 'DUPLICATE_RULE_ID', rule_id: 'r1' }),
    ]);
  });

  it('reports every problem in one pass', () => {
    const rules = [
      rule('r1', { product_id: 'prod-a', price_id: 'price-a' }, [offer('g1', 'prod-a', 'price-a')]),
      rule('r1', { product_id: 'prod-a', price_id: 'price-a' }, []),
      rule('r2', null),
      rule('r3', null, [{ id: 'g9', items: [] }]),
    ];

    expect(codes(rules)).toStrictEqual([
      'OFFER_IS_OWN_SOURCE',
      'DUPLICATE_RULE_ID',
      'DUPLICATE_SOURCE',
      'OFFERS_REQUIRED',
      'MULTIPLE_FALLBACKS',
      'OFFERS_REQUIRED',
    ]);
  });
});
