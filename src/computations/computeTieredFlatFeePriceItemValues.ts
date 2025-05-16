import type { PriceTier, Tax, Price } from '@epilot/pricing-client';
import type { Currency } from 'dinero.js';
import { toDineroFromInteger } from '../money/toDinero';
import type { PriceItemsTotals } from '../prices/types';
import { getPriceTierForQuantity } from '../tiers/getPriceTiersForQuantity';
import { computePerUnitPriceItemValues } from './computePerUnitPriceItemValues';

export const computeTieredFlatFeePriceItemValues = ({
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
  const tier = getPriceTierForQuantity(tiers, quantityToSelectTier);
  /**
   * If the price mapping is used to select the tier, we need to multiply the totals by the quantity.
   * Otherwise, the quantity is only used to select the tier.
   */
  const quantityToMultiply = isUsingPriceMappingToSelectTier ? quantity : 1;

  const tierValues = computePerUnitPriceItemValues({
    unitAmountDecimal: tier?.flat_fee_amount_decimal,
    currency,
    isTaxInclusive,
    unitAmountMultiplier: quantityToMultiply,
    tax,
  });

  const displayMode: Price['price_display_in_journeys'] =
    tier?.display_mode === 'on_request' ? 'show_as_on_request' : unchangedPriceDisplayInJourneys;

  return {
    tiers_details: [
      {
        quantity: quantityToSelectTier,
        unit_amount: tier?.flat_fee_amount || 0,
        unit_amount_decimal: tier?.flat_fee_amount_decimal || '0',
        unit_amount_net: tierValues.unit_amount_net || 0,
        unit_amount_gross: tierValues.unit_amount_gross || 0,
        amount_subtotal: tierValues.unit_amount_net || 0,
        amount_total: tierValues.unit_amount_gross || 0,
        amount_tax:
          toDineroFromInteger(tierValues.unit_amount_gross!)
            .subtract(toDineroFromInteger(tierValues.unit_amount_net!))
            .getAmount() || 0,
      },
    ],
    unit_amount_gross: toDineroFromInteger(tierValues.unit_amount_gross!).getAmount(),
    unit_amount_net: toDineroFromInteger(tierValues.unit_amount_net!).getAmount(),
    amount_subtotal: toDineroFromInteger(tierValues.amount_subtotal).getAmount(),
    amount_total: toDineroFromInteger(tierValues.amount_total).getAmount(),
    amount_tax: toDineroFromInteger(tierValues.amount_tax).getAmount(),
    price_display_in_journeys: displayMode,
  };
};
