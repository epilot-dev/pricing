import { describe, expect, it } from 'vitest';
import { extractProductRecommendationRuleRelations } from './extract-rule-relations';
import type { ProductRecommendationRule } from './types';

const empty = { $relation: [] };

describe('extractProductRecommendationRuleRelations', () => {
  it('returns empty relations when there are no rules', () => {
    const expected = { source_products: empty, source_prices: empty, offer_products: empty, offer_prices: empty };

    expect(extractProductRecommendationRuleRelations()).toStrictEqual(expected);
    expect(extractProductRecommendationRuleRelations([])).toStrictEqual(expected);
  });

  it('extracts source and offer relations de-duplicated in order of first appearance', () => {
    const rules: ProductRecommendationRule[] = [
      {
        id: 'r1',
        source: { product_id: 'prod-a', price_id: 'price-a1' },
        offer_groups: [
          {
            id: 'g1',
            items: [
              { product_id: 'prod-x', price_id: 'price-x1' },
              { product_id: 'prod-y', price_id: 'price-y1', highlight_config: { badge: 'Best' } },
            ],
          },
          { id: 'g2', target_id: 't1', items: [{ product_id: 'prod-x', price_id: 'price-x2' }] },
        ],
      },
      {
        id: 'r2',
        source: { product_id: 'prod-a', price_id: 'price-a2' },
        offer_groups: [{ id: 'g3', items: [{ product_id: 'prod-y', price_id: 'price-y1' }] }],
      },
      {
        id: 'r3',
        source: null,
        offer_groups: [{ id: 'g4', items: [{ product_id: 'prod-z', price_id: 'price-x1' }] }],
      },
    ];

    expect(extractProductRecommendationRuleRelations(rules)).toStrictEqual({
      source_products: { $relation: [{ entity_id: 'prod-a', _schema: 'product' }] },
      source_prices: {
        $relation: [
          { entity_id: 'price-a1', _schema: 'price' },
          { entity_id: 'price-a2', _schema: 'price' },
        ],
      },
      offer_products: {
        $relation: [
          { entity_id: 'prod-x', _schema: 'product' },
          { entity_id: 'prod-y', _schema: 'product' },
          { entity_id: 'prod-z', _schema: 'product' },
        ],
      },
      offer_prices: {
        $relation: [
          { entity_id: 'price-x1', _schema: 'price' },
          { entity_id: 'price-y1', _schema: 'price' },
          { entity_id: 'price-x2', _schema: 'price' },
        ],
      },
    });
  });

  it('returns empty source relations for a fallback-only table', () => {
    const rules: ProductRecommendationRule[] = [
      { id: 'r1', source: null, offer_groups: [{ id: 'g1', items: [{ product_id: 'prod-x', price_id: 'price-x' }] }] },
    ];

    const result = extractProductRecommendationRuleRelations(rules);

    expect(result.source_products).toStrictEqual(empty);
    expect(result.source_prices).toStrictEqual(empty);
    expect(result.offer_products.$relation).toStrictEqual([{ entity_id: 'prod-x', _schema: 'product' }]);
    expect(result.offer_prices.$relation).toStrictEqual([{ entity_id: 'price-x', _schema: 'price' }]);
  });

  it('skips missing ids and empty offer groups', () => {
    const rules = [
      {
        id: 'r1',
        source: { product_id: 'prod-a', price_id: '' },
        offer_groups: [
          { id: 'g1', items: [] },
          { id: 'g2', items: [{ product_id: '', price_id: 'price-x' }] },
        ],
      },
      { id: 'r2', source: null, offer_groups: [] },
    ] as ProductRecommendationRule[];

    expect(extractProductRecommendationRuleRelations(rules)).toStrictEqual({
      source_products: { $relation: [{ entity_id: 'prod-a', _schema: 'product' }] },
      source_prices: empty,
      offer_products: empty,
      offer_prices: { $relation: [{ entity_id: 'price-x', _schema: 'price' }] },
    });
  });
});
