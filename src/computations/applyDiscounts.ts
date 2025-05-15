import type { Currency, Dinero, PriceItemDto, Tax, Coupon, BillingPeriod } from '../shared/types';
import { PriceItemsTotals } from '../prices/types';
import { clamp } from '../shared/clamp';
import { isCashbackCoupon, isFixedValueCoupon, isPercentageCoupon } from '../coupons/guards';
import { toDineroFromInteger, toDinero } from '../money/toDinero';
import { PricingModel } from '../prices/constants';
import { getTaxValue } from '../taxes/getTaxValue';
import { normalizeTimeFrequencyFromDineroInputValue } from '../time-frequency/normalizers';

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
  const taxRate = getTaxValue(tax);
  let discountPercentage: number | undefined;
  let unitDiscountAmount: Dinero | undefined;
  let unitDiscountAmountNet: Dinero | undefined;
  let unitCashbackAmount: Dinero | undefined;
  let afterCashbackAmountTotal: Dinero | undefined;

  const unitAmountNet = toDineroFromInteger(itemValues.unit_amount_net!, currency);
  const unitAmountGross = toDineroFromInteger(itemValues.unit_amount_gross!, currency);

  // Handle cashback coupons
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
      after_cashback_amount_total: afterCashbackAmountTotal.getAmount(),
    };
  }

  // Handle graduated tiered prices
  if (priceItem._price?.pricing_model === PricingModel.tieredGraduated && itemValues.tiers_details) {
    // Apply discount to each tier and sum up the results
    const discountedTiers = itemValues.tiers_details.map((tier) => {
      const tierUnitAmountNet = toDineroFromInteger(tier.unit_amount_net!, currency);
      const tierUnitAmountGross = toDineroFromInteger(tier.unit_amount_gross!, currency);

      // Calculate discount amounts
      if (isPercentageCoupon(coupon)) {
        discountPercentage = clamp(Number(coupon.percentage_value), 0, 100);
        if (isTaxInclusive) {
          unitDiscountAmount = tierUnitAmountGross.multiply(discountPercentage).divide(100);
          unitDiscountAmountNet = unitDiscountAmount.divide(1 + taxRate);
        } else {
          unitDiscountAmountNet = tierUnitAmountNet.multiply(discountPercentage).divide(100);
          unitDiscountAmount = unitDiscountAmountNet.multiply(1 + taxRate);
        }
      } else {
        const fixedDiscountAmount = toDinero(coupon.fixed_value_decimal, coupon.fixed_value_currency as Currency);
        if (isTaxInclusive) {
          unitDiscountAmount = fixedDiscountAmount.greaterThan(tierUnitAmountGross)
            ? tierUnitAmountGross
            : fixedDiscountAmount;
          unitDiscountAmountNet = unitDiscountAmount.divide(1 + taxRate);
        } else {
          unitDiscountAmountNet = fixedDiscountAmount.greaterThan(tierUnitAmountNet)
            ? tierUnitAmountNet
            : fixedDiscountAmount;
          unitDiscountAmount = unitDiscountAmountNet.multiply(1 + taxRate);
        }
      }

      const afterDiscountUnitAmountNet = tierUnitAmountNet.subtract(unitDiscountAmountNet);
      const afterDiscountUnitAmountGross = isTaxInclusive
        ? tierUnitAmountGross.subtract(unitDiscountAmount)
        : afterDiscountUnitAmountNet.multiply(1 + taxRate);

      const beforeDiscountTaxAmount = isTaxInclusive
        ? tierUnitAmountGross.subtract(tierUnitAmountNet)
        : tierUnitAmountNet.multiply(taxRate);

      const afterDiscountTaxAmount = afterDiscountUnitAmountGross
        .subtract(afterDiscountUnitAmountNet)
        .multiply(tier.quantity);
      const taxDiscountAmount = isTaxInclusive
        ? unitDiscountAmount.subtract(unitDiscountAmountNet).multiply(tier.quantity)
        : unitDiscountAmountNet.multiply(taxRate).multiply(tier.quantity);

      return {
        quantity: tier.quantity,
        unit_amount_gross: afterDiscountUnitAmountGross.getAmount(),
        unit_amount_net: afterDiscountUnitAmountNet.getAmount(),
        amount_subtotal: afterDiscountUnitAmountNet.multiply(tier.quantity).getAmount(),
        amount_total: afterDiscountUnitAmountGross.multiply(tier.quantity).getAmount(),
        amount_tax: afterDiscountTaxAmount.getAmount(),
        unit_discount_amount: unitDiscountAmount.getAmount(),
        before_discount_unit_amount: isTaxInclusive ? tierUnitAmountGross.getAmount() : tierUnitAmountNet.getAmount(),
        before_discount_unit_amount_gross: tierUnitAmountGross.getAmount(),
        before_discount_unit_amount_net: tierUnitAmountNet.getAmount(),
        unit_discount_amount_net: unitDiscountAmountNet.getAmount(),
        tax_discount_amount: taxDiscountAmount.getAmount(),
        before_discount_tax_amount: beforeDiscountTaxAmount.multiply(tier.quantity).getAmount(),
        discount_amount: unitDiscountAmount.multiply(tier.quantity).getAmount(),
        discount_amount_net: unitDiscountAmountNet.multiply(tier.quantity).getAmount(),
        before_discount_amount_total: tierUnitAmountGross.multiply(tier.quantity).getAmount(),
      };
    });

    // Sum up all the discounted tier values
    const totals = discountedTiers.reduce(
      (acc, tier) => ({
        unit_amount_gross: toDineroFromInteger(acc.unit_amount_gross!)
          .add(toDineroFromInteger(tier.unit_amount_gross!))
          .getAmount(),
        unit_amount_net: toDineroFromInteger(acc.unit_amount_net!)
          .add(toDineroFromInteger(tier.unit_amount_net!))
          .getAmount(),
        amount_subtotal: toDineroFromInteger(acc.amount_subtotal)
          .add(toDineroFromInteger(tier.amount_subtotal))
          .getAmount(),
        amount_total: toDineroFromInteger(acc.amount_total).add(toDineroFromInteger(tier.amount_total)).getAmount(),
        amount_tax: toDineroFromInteger(acc.amount_tax).add(toDineroFromInteger(tier.amount_tax)).getAmount(),
        unit_discount_amount: toDineroFromInteger(acc.unit_discount_amount || 0)
          .add(toDineroFromInteger(tier.unit_discount_amount))
          .getAmount(),
        before_discount_unit_amount: toDineroFromInteger(acc.before_discount_unit_amount || 0)
          .add(toDineroFromInteger(tier.before_discount_unit_amount))
          .getAmount(),
        before_discount_unit_amount_gross: toDineroFromInteger(acc.before_discount_unit_amount_gross || 0)
          .add(toDineroFromInteger(tier.before_discount_unit_amount_gross))
          .getAmount(),
        before_discount_unit_amount_net: toDineroFromInteger(acc.before_discount_unit_amount_net || 0)
          .add(toDineroFromInteger(tier.before_discount_unit_amount_net))
          .getAmount(),
        unit_discount_amount_net: toDineroFromInteger(acc.unit_discount_amount_net || 0)
          .add(toDineroFromInteger(tier.unit_discount_amount_net))
          .getAmount(),
        tax_discount_amount: toDineroFromInteger(acc.tax_discount_amount || 0)
          .add(toDineroFromInteger(tier.tax_discount_amount))
          .getAmount(),
        before_discount_tax_amount: toDineroFromInteger(acc.before_discount_tax_amount || 0)
          .add(toDineroFromInteger(tier.before_discount_tax_amount))
          .getAmount(),
        discount_amount: toDineroFromInteger(acc.discount_amount || 0)
          .add(toDineroFromInteger(tier.discount_amount))
          .getAmount(),
        discount_amount_net: toDineroFromInteger(acc.discount_amount_net || 0)
          .add(toDineroFromInteger(tier.discount_amount_net))
          .getAmount(),
        before_discount_amount_total: toDineroFromInteger(acc.before_discount_amount_total || 0)
          .add(toDineroFromInteger(tier.before_discount_amount_total))
          .getAmount(),
      }),
      {
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
      } as PriceItemsTotals,
    );

    return {
      ...itemValues,
      ...totals,
      tiers_details: itemValues.tiers_details,
      ...(typeof discountPercentage === 'number' && { discount_percentage: discountPercentage }),
    };
  }

  // Handle all other pricing models
  if (isPercentageCoupon(coupon)) {
    discountPercentage = clamp(Number(coupon.percentage_value), 0, 100);
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
    before_discount_unit_amount_gross: unitAmountGross.getAmount(),
    before_discount_unit_amount_net: unitAmountNet.getAmount(),
    unit_discount_amount_net: unitDiscountAmountNet.getAmount(),
    tax_discount_amount: taxDiscountAmount.getAmount(),
    before_discount_tax_amount: beforeDiscountTaxAmount.multiply(unitAmountMultiplier).getAmount(),
    discount_amount: unitDiscountAmount.multiply(unitAmountMultiplier).getAmount(),
    discount_amount_net: unitDiscountAmountNet.multiply(unitAmountMultiplier).getAmount(),
    ...(typeof discountPercentage === 'number' && { discount_percentage: discountPercentage }),
    before_discount_amount_total: unitAmountGross.multiply(unitAmountMultiplier).getAmount(),
  };
};
