import type { ProductRecommendationRule, ProductRecommendationRuleValidationError } from './types';

const toSourceKey = (productId: string, priceId: string) => `${productId}:${priceId}`;

/**
 * Validates the rule table of a `product_recommendation` entity.
 *
 * Pure and synchronous: it only checks the structure of the rules. Checking that referenced
 * products and prices exist and are not archived or deleted is the caller's job.
 *
 * Error codes:
 * - `RULES_REQUIRED`: there are no rules
 * - `DUPLICATE_RULE_ID`: two rules share the same id
 * - `RULE_SOURCE_REQUIRED`: a source has a product but no price, or a price but no product (a fallback rule is `source: null`)
 * - `MULTIPLE_FALLBACKS`: more than one rule has `source: null`
 * - `DUPLICATE_SOURCE`: two rules have the same source product + price
 * - `OFFERS_REQUIRED`: a rule has no offer groups, an offer group has no items, or an offer item lacks a product or price
 * - `OFFER_IS_OWN_SOURCE`: a rule offers its own source product + price
 *
 * @param rules the rule table of the product recommendation
 * @returns the validation errors; an empty array means the rules are valid
 */
export const validateProductRecommendationRules = (
  rules?: ProductRecommendationRule[],
): ProductRecommendationRuleValidationError[] => {
  if (!rules?.length) {
    return [{ code: 'RULES_REQUIRED', message: 'Add at least one rule.' }];
  }

  const errors: ProductRecommendationRuleValidationError[] = [];
  const seenRuleIds = new Set<string>();
  const ruleIdBySource = new Map<string, string>();
  let fallbackRuleId: string | undefined;

  for (const rule of rules) {
    const ruleId = rule.id;

    if (seenRuleIds.has(ruleId)) {
      errors.push({
        code: 'DUPLICATE_RULE_ID',
        rule_id: ruleId,
        message: `Rule id "${ruleId}" is used more than once.`,
      });
    }
    seenRuleIds.add(ruleId);

    const source = rule.source;
    let sourceKey: string | undefined;

    if (!source) {
      if (fallbackRuleId !== undefined) {
        errors.push({ code: 'MULTIPLE_FALLBACKS', rule_id: ruleId, message: 'Only one fallback rule is allowed.' });
      } else {
        fallbackRuleId = ruleId;
      }
    } else if (!source.product_id || !source.price_id) {
      errors.push({
        code: 'RULE_SOURCE_REQUIRED',
        rule_id: ruleId,
        message: 'Select both a source product and a source price.',
      });
    } else {
      sourceKey = toSourceKey(source.product_id, source.price_id);
      const firstRuleId = ruleIdBySource.get(sourceKey);
      if (firstRuleId !== undefined) {
        errors.push({
          code: 'DUPLICATE_SOURCE',
          rule_id: ruleId,
          message: `This source product and price is already used by rule "${firstRuleId}".`,
        });
      } else {
        ruleIdBySource.set(sourceKey, ruleId);
      }
    }

    const offerGroups = rule.offer_groups ?? [];
    if (!offerGroups.length) {
      errors.push({ code: 'OFFERS_REQUIRED', rule_id: ruleId, message: 'Add at least one offer.' });
    }

    for (const group of offerGroups) {
      const items = group?.items ?? [];
      if (!items.length) {
        errors.push({
          code: 'OFFERS_REQUIRED',
          rule_id: ruleId,
          offer_group_id: group?.id,
          message: 'Add at least one offer to this group.',
        });
      }

      items.forEach((item, itemIndex) => {
        if (!item?.product_id || !item?.price_id) {
          errors.push({
            code: 'OFFERS_REQUIRED',
            rule_id: ruleId,
            offer_group_id: group?.id,
            item_index: itemIndex,
            message: 'Select both a product and a price for this offer.',
          });
          return;
        }

        if (sourceKey && toSourceKey(item.product_id, item.price_id) === sourceKey) {
          errors.push({
            code: 'OFFER_IS_OWN_SOURCE',
            rule_id: ruleId,
            offer_group_id: group?.id,
            item_index: itemIndex,
            message: 'A rule cannot offer its own source product and price.',
          });
        }
      });
    }
  }

  return errors;
};
