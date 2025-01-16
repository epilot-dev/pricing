import type { Currency, Dinero } from 'dinero.js';

import { DEFAULT_CURRENCY } from '../currencies';
import { toDineroFromInteger, toDinero } from '../formatters';
import { TaxRates } from '../formatters/constants';
import { normalizeTimeFrequencyFromDineroInputValue } from '../normalizers';
import { MarkupPricingModel, TypeGetAg } from '../pricing';
import type { BillingPeriod, Coupon, Price, PriceGetAg, PriceItem, PriceItemDto, PriceTier, Tax } from '../types';

import { isPercentageCoupon, isCashbackCoupon, isFixedValueCoupon } from './guards/coupon';

export type PriceItemsTotals = Pick<
  PriceItem,
  | 'unit_amount'
  | 'unit_discount_amount'
  | 'unit_discount_amount_decimal'
  | 'before_discount_unit_amount'
  | 'unit_amount_net'
  | 'unit_amount_net_decimal'
  | 'unit_discount_amount_net'
  | 'unit_discount_amount_net_decimal'
  | 'unit_amount_gross'
  | 'unit_amount_gross_decimal'
  | 'tax_discount_amount'
  | 'tax_discount_amount_decimal'
  | 'before_discount_tax_amount'
  | 'before_discount_tax_amount_decimal'
  | 'discount_amount_net'
  | 'discount_amount_net_decimal'
  | 'discount_amount'
  | 'discount_percentage'
  | 'before_discount_amount_total'
  | 'cashback_amount'
  | 'cashback_amount_decimal'
  | 'after_cashback_amount_total'
  | 'after_cashback_amount_total_decimal'
  | 'get_ag'
  | 'tiers_details'
> & {
  /* These are marked as optional on the original type */
  amount_subtotal: number;
  amount_total: number;
  amount_tax: number;
  /* price_display_in_journeys arrives as unknown in PriceItem */
  price_display_in_journeys?: Price['price_display_in_journeys'];
};

export const getTaxValue = (tax?: Tax): number => {
  if (!tax) {
    return TaxRates.nontaxable;
  }

  if (Array.isArray(tax)) {
    return (Number(tax[0]?.rate) || 0) / 100;
  }

  return (Number(tax.rate) || 0) / 100;
};

/**
 * Checks whether a price is tax inclusive or not.
 *
 * @param price the price object
 * @returns true if the price is tax inclusive, false otherwise. defaults to true.
 */
export const isTaxInclusivePrice = (price?: Price): boolean => {
  return price?.is_tax_inclusive ?? true;
};

/**
 * Gets the quantity for a specific tier.
 * @param min The minimum quantity for the tier.
 * @param max The maximum quantity for the tier.
 * @param quantity The normalized quantity.
 * @returns The quantity to be considered for the tier totals computation.
 */
export const getQuantityForTier = ({ min, max, quantity }: { min?: number; max: number; quantity: number }) => {
  if (typeof min !== 'number' || isNaN(min)) {
    throw new Error('Tier min quantity must be a number');
  }

  if (typeof max !== 'number' || isNaN(max)) {
    throw new Error('Tier max quantity must be a number');
  }

  if (min >= max) {
    throw new Error('Tier min quantity must be less than tier max quantity');
  }

  if (quantity < min) {
    throw new Error('Normalized quantity must be greater than tier min quantity');
  }

  if (quantity >= max) {
    return toDinero(max.toString(), DEFAULT_CURRENCY).subtract(toDinero(min.toString(), DEFAULT_CURRENCY)).toUnit();
  }

  return toDinero(quantity.toString(), DEFAULT_CURRENCY).subtract(toDinero(min.toString(), DEFAULT_CURRENCY)).toUnit();
};

const clamp = (value: number, minimum: number, maximum: number) => Math.min(Math.max(value, minimum), maximum);

export const computePriceItemValues = ({
  unitAmountDecimal,
  currency,
  isTaxInclusive,
  unitAmountMultiplier,
  tax,
}: {
  unitAmountDecimal?: string;
  currency: Currency;
  isTaxInclusive: boolean;
  unitAmountMultiplier: number;
  tax?: Tax;
}): PriceItemsTotals => {
  const unitAmount = toDinero(unitAmountDecimal, currency);
  const taxRate = getTaxValue(tax);

  let unitAmountNet: Dinero;
  let unitTaxAmount: Dinero;

  if (isTaxInclusive) {
    unitAmountNet = unitAmount.divide(1 + taxRate);
    unitTaxAmount = unitAmount.subtract(unitAmountNet);
  } else {
    unitAmountNet = unitAmount;
    unitTaxAmount = unitAmount.multiply(taxRate);
  }

  const unitAmountGross = unitAmountNet.add(unitTaxAmount);
  const taxAmount = unitTaxAmount.multiply(unitAmountMultiplier);
  const amountSubtotal = unitAmountNet.multiply(unitAmountMultiplier);
  const amountTotal = unitAmountGross.multiply(unitAmountMultiplier);

  return {
    unit_amount: unitAmount.getAmount(),
    unit_amount_net: unitAmountNet.getAmount(),
    unit_amount_net_decimal: unitAmountNet.toUnit().toString(),
    unit_amount_gross: unitAmountGross.getAmount(),
    unit_amount_gross_decimal: unitAmountGross.toUnit().toString(),
    amount_subtotal: amountSubtotal.getAmount(),
    amount_total: amountTotal.getAmount(),
    amount_tax: taxAmount.getAmount(),
  };
};

export const applyDiscounts = (
  itemValues: PriceItemsTotals,
  {
    priceItem,
    currency,
    isTaxInclusive,
    unitAmountMultiplier,
    tax,
    coupon,
  }: {
    priceItem: PriceItemDto;
    currency: Currency;
    isTaxInclusive: boolean;
    unitAmountMultiplier: number;
    tax?: Tax;
    coupon: Coupon;
  },
): PriceItemsTotals => {
  const unitAmountNet = toDineroFromInteger(itemValues.unit_amount_net!, currency);
  const unitAmountGross = toDineroFromInteger(itemValues.unit_amount_gross!, currency);
  const taxRate = getTaxValue(tax);

  let discountPercentage: number | undefined;
  let unitDiscountAmount: Dinero | undefined;
  let unitDiscountAmountNet: Dinero | undefined;
  let unitCashbackAmount: Dinero | undefined;
  let afterCashbackAmountTotal: Dinero | undefined;

  if (isCashbackCoupon(coupon)) {
    if (isFixedValueCoupon(coupon)) {
      unitCashbackAmount = toDinero(coupon.fixed_value_decimal, coupon.fixed_value_currency);
    } else {
      const cashbackPercentage = clamp(Number(coupon.percentage_value), 0, 100);
      unitCashbackAmount = unitAmountGross.multiply(cashbackPercentage).divide(100);
    }

    const cashbackAmount = unitCashbackAmount.multiply(unitAmountMultiplier);

    const normalizedCashbackAmount = normalizeTimeFrequencyFromDineroInputValue(
      cashbackAmount,
      'yearly',
      priceItem?._price?.billing_period as BillingPeriod,
    );

    afterCashbackAmountTotal = unitAmountGross.subtract(normalizedCashbackAmount);

    return {
      ...itemValues,
      cashback_amount: cashbackAmount.getAmount(),
      cashback_amount_decimal: cashbackAmount.toUnit().toString(),
      after_cashback_amount_total: afterCashbackAmountTotal.getAmount(),
      after_cashback_amount_total_decimal: afterCashbackAmountTotal.toUnit().toString(),
    };
  }

  if (isPercentageCoupon(coupon)) {
    discountPercentage = clamp(Number(coupon.percentage_value), 0, 100);
    /* For tax-exclusive prices, apply discount to net amount */
    if (isTaxInclusive) {
      unitDiscountAmount = unitAmountGross.multiply(discountPercentage).divide(100);
      unitDiscountAmountNet = unitDiscountAmount.divide(1 + taxRate);
    } else {
      unitDiscountAmountNet = unitAmountNet.multiply(discountPercentage).divide(100);
      unitDiscountAmount = unitDiscountAmountNet.multiply(1 + taxRate);
    }
  } else {
    const fixedDiscountAmount = toDinero(coupon.fixed_value_decimal, coupon.fixed_value_currency as Currency);
    if (isTaxInclusive) {
      unitDiscountAmount = fixedDiscountAmount.greaterThan(unitAmountGross) ? unitAmountGross : fixedDiscountAmount;
      unitDiscountAmountNet = unitDiscountAmount.divide(1 + taxRate);
    } else {
      unitDiscountAmountNet = fixedDiscountAmount.greaterThan(unitAmountNet) ? unitAmountNet : fixedDiscountAmount;
      unitDiscountAmount = unitDiscountAmountNet.multiply(1 + taxRate);
    }
  }

  const afterDiscountUnitAmountNet = unitAmountNet.subtract(unitDiscountAmountNet);

  /* For tax-exclusive, calculate gross after applying tax to discounted net */
  const afterDiscountUnitAmountGross = isTaxInclusive
    ? unitAmountGross.subtract(unitDiscountAmount)
    : afterDiscountUnitAmountNet.multiply(1 + taxRate);

  const beforeDiscountTaxAmount = isTaxInclusive
    ? unitAmountGross.subtract(unitAmountNet)
    : unitAmountNet.multiply(taxRate);

  const afterDiscountTaxAmount = afterDiscountUnitAmountGross
    .subtract(afterDiscountUnitAmountNet)
    .multiply(unitAmountMultiplier);
  const taxDiscountAmount = isTaxInclusive
    ? unitDiscountAmount.subtract(unitDiscountAmountNet).multiply(unitAmountMultiplier)
    : unitDiscountAmountNet.multiply(taxRate).multiply(unitAmountMultiplier);

  return {
    ...itemValues,
    unit_amount: isTaxInclusive ? afterDiscountUnitAmountGross.getAmount() : afterDiscountUnitAmountNet.getAmount(),
    unit_amount_gross: afterDiscountUnitAmountGross.getAmount(),
    unit_amount_net: afterDiscountUnitAmountNet.getAmount(),
    amount_subtotal: afterDiscountUnitAmountNet.multiply(unitAmountMultiplier).getAmount(),
    amount_total: afterDiscountUnitAmountGross.multiply(unitAmountMultiplier).getAmount(),
    amount_tax: afterDiscountTaxAmount.getAmount(),
    unit_discount_amount: unitDiscountAmount.getAmount(),
    before_discount_unit_amount: isTaxInclusive ? unitAmountGross.getAmount() : unitAmountNet.getAmount(),
    unit_discount_amount_net: unitDiscountAmountNet.getAmount(),
    tax_discount_amount: taxDiscountAmount.getAmount(),
    before_discount_tax_amount: beforeDiscountTaxAmount.multiply(unitAmountMultiplier).getAmount(),
    discount_amount: unitDiscountAmount.multiply(unitAmountMultiplier).getAmount(),
    discount_amount_net: unitDiscountAmountNet.multiply(unitAmountMultiplier).getAmount(),
    ...(typeof discountPercentage === 'number' && { discount_percentage: discountPercentage }),
    before_discount_amount_total: unitAmountGross.multiply(unitAmountMultiplier).getAmount(),
  };
};

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

const getPriceTierForQuantity = (tiers: PriceTier[], quantity: number): PriceTier | null => {
  const selectedTiers = tiers.filter(byPriceTiersForQuantity(tiers, quantity));

  return selectedTiers[selectedTiers.length - 1] ?? null;
};

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

  const tierValues = computePriceItemValues({
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

  const tierValues = computePriceItemValues({
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
      const tierMinQuantity = index === 0 ? 0 : tiers[index - 1].up_to ?? undefined;
      const tierMaxQuantity = tier.up_to || Infinity;
      const graduatedQuantity = getQuantityForTier({
        min: tierMinQuantity,
        max: tierMaxQuantity,
        quantity: quantityToSelectTier,
      });

      const tierValues = computePriceItemValues({
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
      },
    };
  }

  const taxRate = getTaxValue(tax);

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
        } as PriceItemsTotals);

  const relevantTier = markupValues.tiers_details?.[0]; // Changed ?. to && since we need both checks
  const unitAmountGetAgFeeNet =
    getAg.type === TypeGetAg.basePrice
      ? toDinero(externalFeeAmountDecimal)
      : toDinero(externalFeeAmountDecimal).divide(userInput);
  const unitAmountGetAgFeeGross = unitAmountGetAgFeeNet.multiply(1 + taxRate);

  // Unit Amount = Markup amount + Fee Amount
  const unitAmountNet = unitAmountGetAgFeeNet.add(toDineroFromInteger(markupValues.unit_amount_net || 0));

  const unitAmountGross = unitAmountNet.multiply(1 + taxRate);
  const unitTaxAmount = unitAmountGross.subtract(unitAmountNet);
  const unitAmountMarkupNet = toDineroFromInteger(markupValues.unit_amount_net || 0);

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
      markup_amount: (relevantTier ? relevantTier?.unit_amount : getAg.markup_amount) || 0,
      // ToDo: Move the computation of the decimal value on the convert precision step
      markup_amount_decimal: (relevantTier ? relevantTier?.unit_amount_decimal : getAg.markup_amount_decimal) || '0',
    },
  };
};

export const isNotPieceUnit = (unit: string | undefined) => unit !== undefined && unit !== 'unit';

export const isTruthy = <T>(
  value: T | '' | 0 | null | undefined | false,
): value is Exclude<T, '' | 0 | null | undefined | false> => Boolean(value);
