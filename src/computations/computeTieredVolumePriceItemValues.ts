import type { PriceTier, Tax, Price } from '@epilot/pricing-client';
import type { Currency } from 'dinero.js';
import { toDineroFromInteger } from '../money/toDinero';
import { PriceItemsTotals } from '../prices/types';
import { getPriceTierForQuantity } from '../tiers/getPriceTiersForQuantity';
import { computePerUnitPriceItemValues } from './computePerUnitPriceItemValues';

export const computeTieredVolumePriceItemValues = ({
  tiers = [],
  currency,
  isTaxInclusive,
  quantityToSelectTier,
  tax,
  unitAmountMultiplier,
  unchangedPriceDisplayInJourneys,
}: {
  tiers?: PriceTier[];
  currency: Currency;
  isTaxInclusive: boolean;
  quantityToSelectTier: number;
  tax: Tax | undefined;
  unitAmountMultiplier: number;
  unchangedPriceDisplayInJourneys: Price['price_display_in_journeys'];
}): PriceItemsTotals => {
  const tier = getPriceTierForQuantity(tiers, quantityToSelectTier);

  const tierValues = computePerUnitPriceItemValues({
    unitAmountDecimal: tier?.unit_amount_decimal,
    currency,
    isTaxInclusive,
    unitAmountMultiplier,
    tax,
  });

  const displayMode = tier?.display_mode === 'on_request' ? 'show_as_on_request' : unchangedPriceDisplayInJourneys;

  return {
    tiers_details: [
      {
        quantity: unitAmountMultiplier,
        unit_amount: tier?.unit_amount || 0,
        unit_amount_decimal: tier?.unit_amount_decimal || '0',
        unit_amount_net: tierValues.unit_amount_net || 0,
        unit_amount_gross: tierValues.unit_amount_gross || 0,
        amount_subtotal: tierValues.amount_subtotal || 0,
        amount_total: tierValues.amount_total || 0,
        amount_tax: tierValues.amount_tax || 0,
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
