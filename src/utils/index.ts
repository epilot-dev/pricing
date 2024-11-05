import type { Currency, Dinero } from 'dinero.js';

import { toDineroFromInteger, toDinero } from '../formatters';
import { MarkupPricingModel, TypeGetAg } from '../pricing';
import { Coupon, Price, PriceGetAg, PriceTier, Tax } from '../types';

import { isPercentageCoupon, isValidCoupon, isCashbackCoupon, isFixedValueCoupon } from './guards/coupon';

/**
 * @todo Inherit from Components.Schemas.PriceItem rather than duplicating the type
 */
export type PriceItemsTotals = {
  unit_amount?: number;
  unit_discount_amount?: number;
  unit_discount_amount_decimal?: string;
  before_discount_unit_amount?: number;
  unit_amount_net?: number;
  unit_amount_net_decimal?: string;
  unit_discount_amount_net?: number;
  unit_discount_amount_net_decimal?: string;
  unit_amount_gross?: number;
  unit_amount_gross_decimal?: string;
  amount_subtotal: number;
  amount_total: number;
  amount_tax: number;
  tax_discount_amount?: number;
  tax_discount_amount_decimal?: string;
  before_discount_tax_amount?: number;
  before_discount_tax_amount_decimal?: string;
  discount_amount?: number;
  discount_percentage?: number;
  before_discount_amount_total?: number;
  cashback_amount?: number;
  cashback_amount_decimal?: string;
  price_display_in_journeys?: Price['price_display_in_journeys'];
  get_ag?: PriceGetAg;
  tiers_details?: {
    quantity: number;
    unit_amount: number;
    unit_amount_decimal: string;
    unit_amount_net: number;
    unit_amount_gross: number;
    amount_subtotal: number;
    amount_total: number;
    amount_tax: number;
  }[];
};

export const TaxRates = Object.freeze({
  standard: 0.19,
  reduced: 0.07,
  nontaxable: 0,
});

export const getTaxValue = (tax?: Tax): number => {
  if (Array.isArray(tax)) {
    return (+tax?.[0]?.rate || 0.0) / 100;
  }

  if (tax) {
    return (+tax?.rate || 0.0) / 100;
  }

  return TaxRates.nontaxable;
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
 * @param tierMinQuantity The minimum quantity for the tier.
 * @param tierMaxQuantity The maximum quantity for the tier.
 * @param normalizedQuantity The normalized quantity.
 * @returns The quantity to be considered for the tier totals computation.
 */
export const getQuantityForTier = (tierMinQuantity: number, tierMaxQuantity: number, normalizedQuantity: number) => {
  if (typeof tierMinQuantity !== 'number' || isNaN(tierMinQuantity)) {
    throw new Error('Tier min quantity must be a number');
  }

  if (typeof tierMaxQuantity !== 'number' || isNaN(tierMaxQuantity)) {
    throw new Error('Tier max quantity must be a number');
  }

  if (tierMinQuantity >= tierMaxQuantity) {
    throw new Error('Tier min quantity must be less than tier max quantity');
  }

  if (normalizedQuantity < tierMinQuantity) {
    throw new Error('Normalized quantity must be greater than tier min quantity');
  }

  if (normalizedQuantity >= tierMaxQuantity) {
    return toDinero(tierMaxQuantity.toString(), 'EUR').subtract(toDinero(tierMinQuantity.toString(), 'EUR')).toUnit();
  }

  return toDinero(normalizedQuantity.toString(), 'EUR').subtract(toDinero(tierMinQuantity.toString(), 'EUR')).toUnit();
};

const clamp = (value: number, minimum: number, maximum: number) => Math.min(Math.max(value, minimum), maximum);

export const computePriceItemValues = (
  unitAmountDecimal: string,
  currency: Currency,
  isTaxInclusive: boolean,
  unitAmountMultiplier: number,
  tax?: Tax,
  coupons: ReadonlyArray<Coupon> = [],
): PriceItemsTotals => {
  const [coupon] = coupons.filter(isValidCoupon);

  let unitAmount = toDinero(unitAmountDecimal, currency);

  let unitAmountBeforeDiscount: Dinero | undefined;
  let discountPercentage: number | undefined;
  let unitDiscountAmount: Dinero | undefined;
  let unitDiscountAmountNet: Dinero | undefined;
  let cashbackAmount: Dinero | undefined;

  if (coupon) {
    if (isCashbackCoupon(coupon)) {
      if (isFixedValueCoupon(coupon)) {
        cashbackAmount = toDinero(coupon.fixed_value_decimal, coupon.fixed_value_currency);
      } else {
        const cashbackPercentage = clamp(Number(coupon.percentage_value), 0, 100);
        cashbackAmount = unitAmount.multiply(cashbackPercentage).divide(100);
      }
    } else {
      unitAmountBeforeDiscount = unitAmount;
      if (isPercentageCoupon(coupon)) {
        discountPercentage = clamp(Number(coupon.percentage_value), 0, 100);
        unitDiscountAmount = unitAmount.multiply(discountPercentage).divide(100);
      } else {
        const fixedDiscountAmount = toDinero(coupon.fixed_value_decimal, coupon.fixed_value_currency);
        unitDiscountAmount = fixedDiscountAmount.greaterThan(unitAmount) ? unitAmount : fixedDiscountAmount;
      }
      unitAmount = unitAmount.subtract(unitDiscountAmount);
    }
  }

  const taxRate = getTaxValue(tax);

  let unitAmountNet: Dinero;
  let unitTaxAmount: Dinero;
  let unitAmountBeforeDiscountNet: Dinero | undefined;
  let beforeDiscountUnitTaxAmount: Dinero | undefined;

  if (isTaxInclusive) {
    unitAmountNet = unitAmount.divide(1 + taxRate);
    unitDiscountAmountNet = unitDiscountAmount?.divide(1 + taxRate);
    unitAmountBeforeDiscountNet = unitAmountBeforeDiscount?.divide(1 + taxRate);
    unitTaxAmount = unitAmount.subtract(unitAmountNet);
    beforeDiscountUnitTaxAmount =
      unitAmountBeforeDiscountNet && unitAmountBeforeDiscount?.subtract(unitAmountBeforeDiscountNet);
  } else {
    unitAmountNet = unitAmount;
    unitAmountBeforeDiscountNet = unitAmountBeforeDiscount;
    unitDiscountAmountNet = unitDiscountAmount;
    unitTaxAmount = unitAmount.multiply(taxRate);
    beforeDiscountUnitTaxAmount = unitAmountBeforeDiscount?.multiply(taxRate);
  }

  const unitAmountGross = unitAmountNet.add(unitTaxAmount);

  const taxDiscountAmount =
    unitDiscountAmountNet && unitDiscountAmount
      ? isTaxInclusive
        ? unitDiscountAmount.subtract(unitDiscountAmountNet).multiply(unitAmountMultiplier)
        : unitDiscountAmountNet.multiply(taxRate).multiply(unitAmountMultiplier)
      : undefined;
  const taxAmount = unitTaxAmount.multiply(unitAmountMultiplier);
  const beforeDiscountTaxAmount = beforeDiscountUnitTaxAmount?.multiply(unitAmountMultiplier);
  const beforeDiscountUnitAmountGross =
    beforeDiscountUnitTaxAmount && unitAmountBeforeDiscountNet?.add(beforeDiscountUnitTaxAmount);
  const discountAmount = unitDiscountAmount?.multiply(unitAmountMultiplier);
  const amountSubtotal = unitAmountNet.multiply(unitAmountMultiplier);
  const amountTotal = unitAmountGross.multiply(unitAmountMultiplier);

  const beforeDiscountAmountTotal = beforeDiscountUnitAmountGross?.multiply(unitAmountMultiplier);

  return {
    unit_amount: unitAmount.getAmount(),
    unit_amount_net: unitAmountNet.getAmount(),
    unit_amount_net_decimal: unitAmountNet.toUnit().toString(),
    unit_amount_gross: unitAmountGross.getAmount(),
    unit_amount_gross_decimal: unitAmountGross.toUnit().toString(),
    amount_subtotal: amountSubtotal.getAmount(),
    amount_total: amountTotal.getAmount(),
    amount_tax: taxAmount.getAmount(),
    ...(unitDiscountAmount && {
      unit_discount_amount: unitDiscountAmount?.getAmount(),
      unit_discount_amount_decimal: unitDiscountAmount?.toUnit().toString(),
      before_discount_unit_amount: unitAmountBeforeDiscount?.getAmount(),
      unit_discount_amount_net: unitDiscountAmountNet?.getAmount(),
      unit_discount_amount_net_decimal: unitDiscountAmountNet?.toUnit().toString(),
      tax_discount_amount: taxDiscountAmount?.getAmount(),
      tax_discount_amount_decimal: taxDiscountAmount?.toUnit().toString(),
      before_discount_tax_amount: beforeDiscountTaxAmount?.getAmount(),
      before_discount_tax_amount_decimal: beforeDiscountTaxAmount?.toUnit().toString(),
      discount_amount: discountAmount?.getAmount(),
      discount_percentage: discountPercentage,
      before_discount_amount_total: beforeDiscountAmountTotal?.getAmount(),
    }),
    ...(cashbackAmount && {
      cashback_amount: cashbackAmount.getAmount(),
      cashback_amount_decimal: cashbackAmount.toUnit().toString(),
    }),
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
export const getPriceTiersForQuantity = (tiers: PriceTier[], quantity: number): PriceTier[] => {
  const selectedTiers = tiers?.filter(byPriceTiersForQuantity(tiers, quantity));

  if (selectedTiers?.length) {
    return selectedTiers;
  }

  return [];
};

const getPriceTierForQuantity = (tiers: PriceTier[], quantity: number): PriceTier | null | undefined => {
  const selectedTiers = tiers.filter(byPriceTiersForQuantity(tiers, quantity));

  if (selectedTiers.length) {
    return selectedTiers.pop();
  }

  return null;
};

export const computeTieredVolumePriceItemValues = (
  tiers: PriceTier[] = [],
  currency: Currency,
  isTaxInclusive: boolean,
  quantityToSelectTier: number,
  tax: Tax | undefined,
  unitAmountMultiplier: number,
  unchangedPriceDisplayInJourneys: Price['price_display_in_journeys'],
): PriceItemsTotals => {
  const tier = getPriceTierForQuantity(tiers, quantityToSelectTier);

  const tierValues = computePriceItemValues(
    tier?.unit_amount_decimal!,
    currency,
    isTaxInclusive,
    unitAmountMultiplier,
    tax,
  );

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

export const computeTieredFlatFeePriceItemValues = (
  tiers: PriceTier[] = [],
  currency: Currency,
  isTaxInclusive: boolean,
  quantityToSelectTier: number,
  tax: Tax | undefined,
  quantity: number,
  isUsingPriceMappingToSelectTier: boolean,
  unchangedPriceDisplayInJourneys: Price['price_display_in_journeys'],
): PriceItemsTotals => {
  const tier = getPriceTierForQuantity(tiers, quantityToSelectTier);
  /**
   * If the price mapping is used to select the tier, we need to multiply the totals by the quantity.
   * Otherwise, the quantity is only used to select the tier.
   */
  const quantityToMultiply = isUsingPriceMappingToSelectTier ? quantity : 1;

  const tierValues = computePriceItemValues(
    tier?.flat_fee_amount_decimal!,
    currency,
    isTaxInclusive,
    quantityToMultiply,
    tax,
  );

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

export const computeTieredGraduatedPriceItemValues = (
  tiers: PriceTier[] = [],
  currency: Currency,
  isTaxInclusive: boolean,
  quantityToSelectTier: number,
  tax: Tax | undefined,
  quantity: number,
  isUsingPriceMappingToSelectTier: boolean,
  unchangedPriceDisplayInJourneys: Price['price_display_in_journeys'],
): PriceItemsTotals => {
  const priceTiersForQuantity = getPriceTiersForQuantity(tiers, quantityToSelectTier);

  const totals = priceTiersForQuantity.reduce(
    (totals, tier, index) => {
      const tierMinQuantity = index === 0 ? 0 : tiers[index - 1].up_to;
      const tierMaxQuantity = tier.up_to || Infinity;
      const graduatedQuantity = getQuantityForTier(tierMinQuantity!, tierMaxQuantity, quantityToSelectTier);

      const tierValues = computePriceItemValues(
        tier.unit_amount_decimal!,
        currency,
        isTaxInclusive,
        graduatedQuantity,
        tax,
      );

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

export const computeExternalGetAGItemValues = (
  getAg: PriceGetAg,
  currency: Currency,
  isTaxInclusive: boolean,
  unitAmountMultiplier: number,
  userInput: number,
  externalFeeAmountDecimal: string | undefined,
  tax?: Tax,
): PriceItemsTotals => {
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
      ? computeTieredVolumePriceItemValues(
          getAg.markup_tiers,
          currency,
          isTaxInclusive,
          userInput,
          tax,
          userInput,
          'show_price',
        )
      : getAg.markup_pricing_model === MarkupPricingModel.tieredFlatFee && getAg.markup_tiers
      ? computeTieredFlatFeePriceItemValues(
          getAg.markup_tiers,
          currency,
          isTaxInclusive,
          userInput,
          tax,
          userInput,
          true,
          'show_price',
        )
      : ({
          unit_amount_net: isTaxInclusive
            ? toDinero(getAg.markup_amount_decimal)
                .divide(1 + taxRate)
                .getAmount()
            : toDinero(getAg.markup_amount_decimal).getAmount(),
        } as PriceItemsTotals);

  const relevantTier = markupValues.tiers_details?.[0];
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
