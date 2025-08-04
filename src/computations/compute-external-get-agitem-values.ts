import type { PriceGetAg, Tax } from '@epilot/pricing-client';
import type { Currency } from 'dinero.js';
import { toDinero, toDineroFromInteger } from '../money/to-dinero';
import { MarkupPricingModel, TypeGetAg } from '../prices/constants';
import type { PriceItemsTotals } from '../prices/types';
import { getTaxValue } from '../taxes/get-tax-value';
import { computeTieredFlatFeePriceItemValues } from './compute-tiered-flat-fee-price-item-values';
import { computeTieredVolumePriceItemValues } from './compute-tiered-volume-price-item-values';

export const computeExternalGetAGItemValues = ({
  getAg,
  currency,
  isTaxInclusive,
  unitAmountMultiplier,
  userInput,
  externalFeeAmountDecimal,
  tax,
}: {
  getAg: PriceGetAg;
  currency: Currency;
  isTaxInclusive: boolean;
  unitAmountMultiplier: number;
  userInput: number;
  externalFeeAmountDecimal?: string;
  tax?: Tax;
}): PriceItemsTotals => {
  if (externalFeeAmountDecimal === undefined || getAg === undefined || userInput === 0) {
    return {
      unit_amount_net: 0,
      unit_amount_gross: 0,
      amount_tax: 0,
      amount_subtotal: 0,
      amount_total: 0,
      get_ag: {
        ...getAg,
        unit_amount_net: 0,
        unit_amount_gross: 0,
        markup_amount_net: 0,
        markup_amount_gross: 0,
        markup_total_amount_net: 0,
        markup_total_amount_gross: 0,
      },
    };
  }

  const taxRate = getTaxValue(tax);

  // Markup
  const markupValues =
    getAg.markup_pricing_model === MarkupPricingModel.tieredVolume && getAg.markup_tiers
      ? computeTieredVolumePriceItemValues({
          tiers: getAg.markup_tiers,
          currency,
          isTaxInclusive,
          quantityToSelectTier: userInput,
          tax,
          unitAmountMultiplier: userInput,
          unchangedPriceDisplayInJourneys: 'show_price',
        })
      : getAg.markup_pricing_model === MarkupPricingModel.tieredFlatFee && getAg.markup_tiers
        ? computeTieredFlatFeePriceItemValues({
            tiers: getAg.markup_tiers,
            currency,
            isTaxInclusive,
            quantityToSelectTier: userInput,
            tax,
            quantity: userInput,
            isUsingPriceMappingToSelectTier: true,
            unchangedPriceDisplayInJourneys: 'show_price',
          })
        : ({
            unit_amount_net: isTaxInclusive
              ? toDinero(getAg.markup_amount_decimal)
                  .divide(1 + taxRate)
                  .getAmount()
              : toDinero(getAg.markup_amount_decimal).getAmount(),
            unit_amount_gross: isTaxInclusive
              ? toDinero(getAg.markup_amount_decimal).getAmount()
              : toDinero(getAg.markup_amount_decimal)
                  .multiply(1 + taxRate)
                  .getAmount(),
          } as PriceItemsTotals);

  const relevantTier = markupValues.tiers_details?.[0]; // Changed ?. to && since we need both checks

  // Additional Markups - Unit Amounts
  const unitAmountsAdditionalMarkups =
    getAg.type === TypeGetAg.workPrice && getAg.additional_markups_enabled && getAg.additional_markups
      ? Object.entries(getAg.additional_markups).reduce(
          (acc, [key, value]) => ({
            ...acc,
            [key]: {
              amount_net: isTaxInclusive
                ? toDinero(value.amount_decimal)
                    .divide(1 + taxRate)
                    .getAmount()
                : toDinero(value.amount_decimal).getAmount(),
              amount_gross: isTaxInclusive
                ? toDinero(value.amount_decimal).getAmount()
                : toDinero(value.amount_decimal)
                    .multiply(1 + taxRate)
                    .getAmount(),
              amount_decimal: value.amount_decimal,
              amount: value.amount,
            },
          }),
          {} as PriceGetAg['additional_markups'],
        )
      : undefined;

  // Total Additional Markup Amounts (sum of all additional markups)
  const totalAdditionalMarkupValues = unitAmountsAdditionalMarkups
    ? Object.values(unitAmountsAdditionalMarkups).reduce(
        (acc, curr) => ({
          amount_net: toDineroFromInteger(acc.amount_net || 0)
            .add(toDineroFromInteger(curr.amount_net || 0))
            .getAmount(),
          amount_gross: toDineroFromInteger(acc.amount_gross || 0)
            .add(toDineroFromInteger(curr.amount_gross || 0))
            .getAmount(),
        }),
        { amount_net: 0, amount_gross: 0 },
      )
    : undefined;

  // Total Markups (sum of all markups)
  const totalMarkupValues = totalAdditionalMarkupValues
    ? {
        unit_amount_net: toDineroFromInteger(markupValues.unit_amount_net || 0)
          .add(toDineroFromInteger(totalAdditionalMarkupValues.amount_net || 0))
          .getAmount(),
        unit_amount_gross: toDineroFromInteger(markupValues.unit_amount_gross || 0)
          .add(toDineroFromInteger(totalAdditionalMarkupValues.amount_gross || 0))
          .getAmount(),
      }
    : markupValues;

  // Fee Amount
  const unitAmountGetAgFeeNet =
    getAg.type === TypeGetAg.basePrice
      ? toDinero(externalFeeAmountDecimal)
      : toDinero(externalFeeAmountDecimal).divide(userInput);
  const unitAmountGetAgFeeGross = unitAmountGetAgFeeNet.multiply(1 + taxRate);

  // Unit Amount = Markup amount + Fee Amount
  const unitAmountNet = unitAmountGetAgFeeNet.add(toDineroFromInteger(totalMarkupValues.unit_amount_net || 0));

  const unitAmountGross = unitAmountNet.multiply(1 + taxRate);
  const unitTaxAmount = unitAmountGross.subtract(unitAmountNet);

  const unitAmountMarkupNet = toDineroFromInteger(markupValues.unit_amount_net || 0);
  const unitAmountMarkupGross = toDineroFromInteger(markupValues.unit_amount_gross || 0);
  const unitAmountTotalMarkupNet = toDineroFromInteger(totalMarkupValues.unit_amount_net || 0);
  const unitAmountTotalMarkupGross = toDineroFromInteger(totalMarkupValues.unit_amount_gross || 0);

  // Amount Subtotal = Unit Amount Net * Quantity
  const amountSubtotal =
    getAg.type === TypeGetAg.basePrice ? unitAmountNet : unitAmountNet.multiply(unitAmountMultiplier);
  const amountTotal =
    getAg.type === TypeGetAg.basePrice ? unitAmountGross : unitAmountGross.multiply(unitAmountMultiplier);
  const amountTax = getAg.type === TypeGetAg.basePrice ? unitTaxAmount : unitTaxAmount.multiply(unitAmountMultiplier);

  return {
    unit_amount_net: unitAmountNet.getAmount(),
    unit_amount_gross: unitAmountGross.getAmount(),
    amount_tax: amountTax.getAmount(),
    amount_subtotal: amountSubtotal.getAmount(),
    amount_total: amountTotal.getAmount(),
    get_ag: {
      ...getAg,
      unit_amount_net: unitAmountGetAgFeeNet.getAmount(),
      unit_amount_gross: unitAmountGetAgFeeGross.getAmount(),
      markup_amount_net: unitAmountMarkupNet.getAmount(),
      markup_amount_gross: unitAmountMarkupGross.getAmount(),
      markup_amount: (relevantTier ? relevantTier?.unit_amount : getAg.markup_amount) || 0,
      markup_total_amount_net: unitAmountTotalMarkupNet.getAmount(),
      markup_total_amount_gross: unitAmountTotalMarkupGross.getAmount(),
      additional_markups: unitAmountsAdditionalMarkups,
      // ToDo: Move the computation of the decimal value on the convert precision step
      markup_amount_decimal: (relevantTier ? relevantTier?.unit_amount_decimal : getAg.markup_amount_decimal) || '0',
    },
  };
};
