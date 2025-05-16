import type { PriceDynamicTariff, Tax } from '@epilot/pricing-client';
import type { Currency } from 'dinero.js';
import { toDinero } from '../money/toDinero';
import { ModeDynamicTariff } from '../prices/constants';
import type { PriceItemsTotals } from '../prices/types';
import { getTaxValue } from '../taxes/getTaxValue';
import { computePerUnitPriceItemValues } from './computePerUnitPriceItemValues';

export const computeExternalDynamicTariffValues = ({
  dynamicTariff,
  currency,
  isTaxInclusive,
  unitAmountMultiplier,
  externalFeeAmountDecimal,
  tax,
}: {
  dynamicTariff: PriceDynamicTariff;
  currency: Currency;
  isTaxInclusive: boolean;
  unitAmountMultiplier: number;
  externalFeeAmountDecimal?: string;
  tax?: Tax;
}): PriceItemsTotals => {
  if (externalFeeAmountDecimal === undefined || dynamicTariff === undefined) {
    return {
      unit_amount_net: 0,
      unit_amount_gross: 0,
      amount_tax: 0,
      amount_subtotal: 0,
      amount_total: 0,
      dynamic_tariff: {
        ...dynamicTariff,
        unit_amount_net: 0,
        unit_amount_gross: 0,
        markup_amount_net: 0,
        markup_amount_gross: 0,
      },
    };
  }

  const taxRate = getTaxValue(tax);

  if (dynamicTariff.mode === ModeDynamicTariff.manual) {
    const unitAmountDecimal = toDinero(dynamicTariff.average_price_decimal);
    const markup_amount_net = isTaxInclusive
      ? unitAmountDecimal.divide(1 + taxRate).getAmount()
      : unitAmountDecimal.getAmount();
    const markup_amount_gross = isTaxInclusive
      ? unitAmountDecimal.getAmount()
      : unitAmountDecimal.multiply(1 + taxRate).getAmount();

    const basePerUnitPriceValues = computePerUnitPriceItemValues({
      unitAmountDecimal: unitAmountDecimal.toUnit().toString(),
      currency,
      isTaxInclusive,
      unitAmountMultiplier,
      tax,
    });

    return {
      ...basePerUnitPriceValues,
      dynamic_tariff: {
        ...dynamicTariff,
        markup_amount_net,
        markup_amount_gross,
        unit_amount_net: 0,
        unit_amount_gross: 0,
      },
    };
  }

  const markup = toDinero(dynamicTariff.markup_amount_decimal);
  const markup_amount_net = isTaxInclusive ? markup.divide(1 + taxRate).getAmount() : markup.getAmount();
  const markup_amount_gross = isTaxInclusive ? markup.getAmount() : markup.multiply(1 + taxRate).getAmount();

  const market_price = toDinero(externalFeeAmountDecimal);
  const unit_amount_net = market_price.getAmount();
  const unit_amount_gross = market_price.multiply(1 + taxRate).getAmount();

  // combined price per kWh - external market price + markup
  const unitAmountDecimal = isTaxInclusive
    ? market_price
        .multiply(1 + taxRate)
        .add(markup)
        .toUnit()
        .toString()
    : market_price.add(markup).toUnit().toString();

  const basePerUnitPriceValues = computePerUnitPriceItemValues({
    unitAmountDecimal,
    currency,
    isTaxInclusive,
    unitAmountMultiplier,
    tax,
  });

  return {
    ...basePerUnitPriceValues,
    dynamic_tariff: {
      ...dynamicTariff,
      markup_amount_net,
      markup_amount_gross,
      unit_amount_net,
      unit_amount_gross,
    },
  };
};
