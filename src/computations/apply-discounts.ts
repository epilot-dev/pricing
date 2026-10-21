import type { TaxItem } from '@epilot/sdk/pricing';
import { isCashbackCoupon, isFixedValueCoupon, isPercentageCoupon } from '../coupons/guards';
import { toDineroFromInteger, toDinero } from '../money/to-dinero';
import { PricingModel } from '../prices/constants';
import type { PriceItemsTotals } from '../prices/types';
import { clamp } from '../shared/clamp';
import type { Currency, Dinero, PriceItemDto, Tax, Coupon, BillingPeriod, TierDetails } from '../shared/types';
import { getTaxValue } from '../taxes/get-tax-value';
import { normalizeTimeFrequencyFromDineroInputValue } from '../time-frequency/normalizers';

type DiscountOptions = {
  coupon: Coupon;
  isTaxInclusive: boolean;
  taxRate: number;
};

/**
 * Computes the discount for a single unit, capping fixed discounts at the unit amount.
 */
const computeUnitDiscount = (
  unitAmountNet: Dinero,
  unitAmountGross: Dinero,
  { coupon, isTaxInclusive, taxRate }: DiscountOptions,
): { discountPercentage?: number; unitDiscountAmount: Dinero; unitDiscountAmountNet: Dinero } => {
  if (isPercentageCoupon(coupon)) {
    const discountPercentage = clamp(Number(coupon.percentage_value), 0, 100);

    if (isTaxInclusive) {
      const unitDiscountAmount = unitAmountGross.multiply(discountPercentage).divide(100);

      return { discountPercentage, unitDiscountAmount, unitDiscountAmountNet: unitDiscountAmount.divide(1 + taxRate) };
    }

    const unitDiscountAmountNet = unitAmountNet.multiply(discountPercentage).divide(100);

    return {
      discountPercentage,
      unitDiscountAmount: unitDiscountAmountNet.multiply(1 + taxRate),
      unitDiscountAmountNet,
    };
  }

  const fixedDiscountAmount = toDinero(coupon.fixed_value_decimal, coupon.fixed_value_currency as Currency);

  if (isTaxInclusive) {
    const unitDiscountAmount = fixedDiscountAmount.greaterThan(unitAmountGross) ? unitAmountGross : fixedDiscountAmount;

    return { unitDiscountAmount, unitDiscountAmountNet: unitDiscountAmount.divide(1 + taxRate) };
  }

  const unitDiscountAmountNet = fixedDiscountAmount.greaterThan(unitAmountNet) ? unitAmountNet : fixedDiscountAmount;

  return { unitDiscountAmount: unitDiscountAmountNet.multiply(1 + taxRate), unitDiscountAmountNet };
};

/**
 * Computes the discounted amounts for `quantity` units with the given unit amounts.
 */
const computeDiscountedAmounts = (
  unitAmountNet: Dinero,
  unitAmountGross: Dinero,
  quantity: number,
  options: DiscountOptions,
) => {
  const { isTaxInclusive, taxRate } = options;
  const { discountPercentage, unitDiscountAmount, unitDiscountAmountNet } = computeUnitDiscount(
    unitAmountNet,
    unitAmountGross,
    options,
  );

  const afterDiscountUnitAmountNet = unitAmountNet.subtract(unitDiscountAmountNet);
  const afterDiscountUnitAmountGross = isTaxInclusive
    ? unitAmountGross.subtract(unitDiscountAmount)
    : afterDiscountUnitAmountNet.multiply(1 + taxRate);

  const beforeDiscountTaxAmount = isTaxInclusive
    ? unitAmountGross.subtract(unitAmountNet)
    : unitAmountNet.multiply(taxRate);

  const afterDiscountTaxAmount = afterDiscountUnitAmountGross.subtract(afterDiscountUnitAmountNet).multiply(quantity);
  const taxDiscountAmount = isTaxInclusive
    ? unitDiscountAmount.subtract(unitDiscountAmountNet).multiply(quantity)
    : unitDiscountAmountNet.multiply(taxRate).multiply(quantity);

  return {
    discountPercentage,
    afterDiscountUnitAmount: isTaxInclusive ? afterDiscountUnitAmountGross : afterDiscountUnitAmountNet,
    amounts: {
      unit_amount_gross: afterDiscountUnitAmountGross.getAmount(),
      unit_amount_net: afterDiscountUnitAmountNet.getAmount(),
      amount_subtotal: afterDiscountUnitAmountNet.multiply(quantity).getAmount(),
      amount_total: afterDiscountUnitAmountGross.multiply(quantity).getAmount(),
      amount_tax: afterDiscountTaxAmount.getAmount(),
      unit_discount_amount: unitDiscountAmount.getAmount(),
      before_discount_unit_amount: isTaxInclusive ? unitAmountGross.getAmount() : unitAmountNet.getAmount(),
      before_discount_unit_amount_gross: unitAmountGross.getAmount(),
      before_discount_unit_amount_net: unitAmountNet.getAmount(),
      unit_discount_amount_net: unitDiscountAmountNet.getAmount(),
      tax_discount_amount: taxDiscountAmount.getAmount(),
      before_discount_tax_amount: beforeDiscountTaxAmount.multiply(quantity).getAmount(),
      discount_amount: unitDiscountAmount.multiply(quantity).getAmount(),
      discount_amount_net: unitDiscountAmountNet.multiply(quantity).getAmount(),
      before_discount_amount_total: unitAmountGross.multiply(quantity).getAmount(),
      before_discount_amount_subtotal: unitAmountNet.multiply(quantity).getAmount(),
    },
  };
};

type DiscountedAmounts = ReturnType<typeof computeDiscountedAmounts>['amounts'];

const sumDiscountedAmounts = (amounts: DiscountedAmounts[]): DiscountedAmounts => {
  const totals = {
    unit_amount_gross: 0,
    unit_amount_net: 0,
    amount_subtotal: 0,
    amount_total: 0,
    amount_tax: 0,
    unit_discount_amount: 0,
    before_discount_unit_amount: 0,
    before_discount_unit_amount_gross: 0,
    before_discount_unit_amount_net: 0,
    unit_discount_amount_net: 0,
    tax_discount_amount: 0,
    before_discount_tax_amount: 0,
    discount_amount: 0,
    discount_amount_net: 0,
    before_discount_amount_total: 0,
    before_discount_amount_subtotal: 0,
  };
  const fields = Object.keys(totals) as Array<keyof DiscountedAmounts>;

  for (const tierAmounts of amounts) {
    for (const field of fields) {
      totals[field] = toDineroFromInteger(totals[field]).add(toDineroFromInteger(tierAmounts[field])).getAmount();
    }
  }

  return totals;
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
    tax?: Tax | TaxItem;
    coupon: Coupon;
  },
): PriceItemsTotals => {
  const taxRate = getTaxValue(tax);

  const unitAmountNet = toDineroFromInteger(itemValues.unit_amount_net!, currency);
  const unitAmountGross = toDineroFromInteger(itemValues.unit_amount_gross!, currency);

  // Handle cashback coupons
  if (isCashbackCoupon(coupon)) {
    let unitCashbackAmount: Dinero;

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

    const afterCashbackAmountTotal = unitAmountGross.subtract(normalizedCashbackAmount);

    return {
      ...itemValues,
      cashback_amount: cashbackAmount.getAmount(),
      after_cashback_amount_total: afterCashbackAmountTotal.getAmount(),
    };
  }

  const discountOptions: DiscountOptions = { coupon, isTaxInclusive, taxRate };

  // Handle graduated tiered prices: apply the discount to each tier and sum up the results
  if (priceItem._price?.pricing_model === PricingModel.tieredGraduated && itemValues.tiers_details) {
    const discountedTiers = itemValues.tiers_details.map((tier: TierDetails) =>
      computeDiscountedAmounts(
        toDineroFromInteger(tier.unit_amount_net!, currency),
        toDineroFromInteger(tier.unit_amount_gross!, currency),
        tier.quantity,
        discountOptions,
      ),
    );
    const discountPercentage = discountedTiers[discountedTiers.length - 1]?.discountPercentage;

    return {
      ...itemValues,
      ...sumDiscountedAmounts(discountedTiers.map(({ amounts }) => amounts)),
      ...(typeof discountPercentage === 'number' && { discount_percentage: discountPercentage }),
    };
  }

  // Handle all other pricing models
  const { discountPercentage, afterDiscountUnitAmount, amounts } = computeDiscountedAmounts(
    unitAmountNet,
    unitAmountGross,
    unitAmountMultiplier,
    discountOptions,
  );
  // Kept apart so discount_percentage stays at its historical position in the output
  const { before_discount_amount_total, before_discount_amount_subtotal, ...discountedAmounts } = amounts;

  return {
    ...itemValues,
    unit_amount: afterDiscountUnitAmount.getAmount(),
    ...discountedAmounts,
    ...(typeof discountPercentage === 'number' && { discount_percentage: discountPercentage }),
    before_discount_amount_total,
    before_discount_amount_subtotal,
  };
};
