import type { PriceTier } from '../types';

/**
 * Returns a function that checks whether a price tier is eligible for a given quantity.
 *
 * @param tiers a set of ordered price tiers
 * @param quantity the quantity to check
 */
const byPriceTiersForQuantity = (tiers: PriceTier[], quantity: number) => (_: PriceTier, index: number) => {
  if (index === 0) {
    return quantity >= 0;
  }

  return quantity > (tiers[index - 1]?.up_to || 0);
};

/**
 * Gets the price tiers for a quantity given the pricing model and price tiers.
 * @param {string} pricingModel - The pricing model.
 * @param {PriceTier[]} tiers - The price tiers.
 * @param {number} quantity - The quantity.
 * @return {PriceTier[]} - The result price tiers.
 */
export const getPriceTiersForQuantity = (tiers: PriceTier[], quantity: number): PriceTier[] =>
  tiers.filter(byPriceTiersForQuantity(tiers, quantity));

/**
 * Gets the last price tier for a quantity given the pricing model and price tiers.
 */
export const getPriceTierForQuantity = (tiers: PriceTier[], quantity: number): PriceTier | null => {
  const selectedTiers = getPriceTiersForQuantity(tiers, quantity);

  return selectedTiers[selectedTiers.length - 1] ?? null;
};
