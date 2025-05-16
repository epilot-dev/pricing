import type { PriceTier, Tax, Price } from '@epilot/pricing-client';
import type { Currency } from 'dinero.js';
import { toDineroFromInteger } from '../money/toDinero';
import type { PriceItemsTotals } from '../prices/types';
import { getPriceTiersForQuantity } from '../tiers/getPriceTiersForQuantity';
import { getQuantityForTier } from '../tiers/getQuantityForTier';
import { computePerUnitPriceItemValues } from './computePerUnitPriceItemValues';

export const computeTieredGraduatedPriceItemValues = ({
  tiers = [],
  currency,
  isTaxInclusive,
  quantityToSelectTier,
  tax,
  quantity,
  isUsingPriceMappingToSelectTier,
  unchangedPriceDisplayInJourneys,
}: {
  tiers?: PriceTier[];
  currency: Currency;
  isTaxInclusive: boolean;
  quantityToSelectTier: number;
  tax?: Tax;
  quantity: number;
  isUsingPriceMappingToSelectTier: boolean;
  unchangedPriceDisplayInJourneys: Price['price_display_in_journeys'];
}): PriceItemsTotals => {
  const priceTiersForQuantity = getPriceTiersForQuantity(tiers, quantityToSelectTier);

  const totals = priceTiersForQuantity.reduce(
    (totals, tier, index) => {
      const tierMinQuantity = index === 0 ? 0 : (tiers[index - 1].up_to ?? undefined);
      const tierMaxQuantity = tier.up_to || Infinity;
      const graduatedQuantity = getQuantityForTier({
        min: tierMinQuantity,
        max: tierMaxQuantity,
        quantity: quantityToSelectTier,
      });

      const tierValues = computePerUnitPriceItemValues({
        unitAmountDecimal: tier.unit_amount_decimal,
        currency,
        isTaxInclusive,
        unitAmountMultiplier: graduatedQuantity,
        tax,
      });

      const displayMode: Price['price_display_in_journeys'] =
        tier?.display_mode === 'on_request' ? 'show_as_on_request' : unchangedPriceDisplayInJourneys;

      return {
        tiers_details: [
          ...(totals.tiers_details || []),
          {
            quantity: graduatedQuantity,
            unit_amount: tier.unit_amount || 0,
            unit_amount_decimal: tier.unit_amount_decimal || '0',
            unit_amount_net: tierValues.unit_amount_net || 0,
            unit_amount_gross: tierValues.unit_amount_gross || 0,
            amount_subtotal: tierValues.amount_subtotal || 0,
            amount_total: tierValues.amount_total || 0,
            amount_tax: tierValues.amount_tax || 0,
          },
        ],
        unit_amount_gross: toDineroFromInteger(totals.unit_amount_gross!)
          .add(toDineroFromInteger(tierValues.unit_amount_gross!))
          .getAmount(),
        unit_amount_net: toDineroFromInteger(totals.unit_amount_net!)
          .add(toDineroFromInteger(tierValues.unit_amount_net!))
          .getAmount(),
        amount_subtotal: toDineroFromInteger(totals.amount_subtotal)
          .add(toDineroFromInteger(tierValues.amount_subtotal))
          .getAmount(),
        amount_total: toDineroFromInteger(totals.amount_total)
          .add(toDineroFromInteger(tierValues.amount_total))
          .getAmount(),
        amount_tax: toDineroFromInteger(totals.amount_tax).add(toDineroFromInteger(tierValues.amount_tax)).getAmount(),
        price_display_in_journeys: displayMode,
      };
    },
    {
      unit_amount_gross: 0,
      unit_amount_net: 0,
      amount_subtotal: 0,
      amount_total: 0,
      amount_tax: 0,
    } as PriceItemsTotals,
  );

  /**
   * If the price mapping is used to select the tier, we need to multiply the totals by the quantity.
   * Otherwise, the quantity is only used to select the tier.
   */
  const quantityToMultiply = isUsingPriceMappingToSelectTier ? quantity : 1;

  return {
    ...totals,
    amount_subtotal: toDineroFromInteger(totals.amount_subtotal).multiply(quantityToMultiply).getAmount(),
    amount_total: toDineroFromInteger(totals.amount_total).multiply(quantityToMultiply).getAmount(),
    amount_tax: toDineroFromInteger(totals.amount_tax).multiply(quantityToMultiply).getAmount(),
  };
};
