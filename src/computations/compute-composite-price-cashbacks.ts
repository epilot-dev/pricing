import { isFixedValueCoupon } from '../coupons/guards';
import { getAppliedCompositeCashbackCoupons } from '../coupons/utils';
import { DEFAULT_CURRENCY } from '../money/constants';
import { toDinero, toDineroFromInteger } from '../money/to-dinero';
import {
  convertCashbackAmountsPrecision,
} from '../prices/convert-precision';
import { clamp } from '../shared/clamp';
import { getSafeQuantity } from '../shared/get-safe-quantity';
import type {
  RedeemedPromo,
  PricingDetails,
  CompositePriceItem,
  Currency,
  CashbackTotals,
  Coupon,
  Dinero
} from '../shared/types';

/**
 * Computes cashback amounts for composite price items with top-level cashback coupons.
 */
export const computeCompositePriceCashbacks = (
  compositePriceItem: CompositePriceItem,
  itemBreakdown: PricingDetails,
  redeemedPromos: Array<RedeemedPromo> = [],
) => {
  // Extract cashback coupons from the composite price item
  const appliedCashbackCoupons = getAppliedCompositeCashbackCoupons(compositePriceItem, redeemedPromos);

  const cashbackTotals: Record<string, Dinero> = {};
  const appliedCashbacksWithAmounts: Coupon[] = [];
  const cashbacks = [...(itemBreakdown.total_details?.breakdown?.cashbacks ?? [])];

  for (const cashbackCoupon of appliedCashbackCoupons ?? []) {
    let unitCashbackAmount: Dinero | undefined;

    if (isFixedValueCoupon(cashbackCoupon)) {
      unitCashbackAmount = toDinero(cashbackCoupon.fixed_value_decimal, cashbackCoupon.fixed_value_currency);
    } else {
      const cashbackPercentage = clamp(Number(cashbackCoupon.percentage_value), 0, 100);
      const unitAmountGross = toDineroFromInteger(
        itemBreakdown.amount_total!,
        (compositePriceItem.currency || DEFAULT_CURRENCY).toUpperCase() as Currency,
      );
      unitCashbackAmount = unitAmountGross.multiply(cashbackPercentage).divide(100);
    }

    const unitAmountMultiplier = getSafeQuantity(compositePriceItem.quantity);
    const cashbackAmount = unitCashbackAmount.multiply(unitAmountMultiplier);
    const cashback_amount = cashbackAmount.getAmount();
    const cashbackPeriod = cashbackCoupon?.cashback_period ?? '0';

    // Update applied cashbacks with amounts - convert precision immediately
    const cashbackAmountWithPrecision = convertCashbackAmountsPrecision(cashback_amount, undefined, 2);
    appliedCashbacksWithAmounts.push({
      ...cashbackCoupon,
      cashback_amount: cashbackAmountWithPrecision.cashback_amount!,
      cashback_amount_decimal: cashbackAmountWithPrecision.cashback_amount_decimal!,
    });

    // Update cashback totals with full precision
    if (cashbackTotals[cashbackPeriod]) {
      cashbackTotals[cashbackPeriod] = cashbackTotals[cashbackPeriod].add(cashbackAmount);
    } else {
      cashbackTotals[cashbackPeriod] = cashbackAmount;
    }

    // Update existing breakdown for backward compatibility
    const cashbackMatch = cashbacks.find((cashback) => cashback.cashback_period === cashbackPeriod);

    if (cashbackMatch) {
      const cashbackAmountTotal = toDineroFromInteger(cashbackMatch.amount_total);
      cashbackMatch.amount_total = cashbackAmountTotal.add(toDineroFromInteger(cashback_amount)).getAmount();
    } else {
      cashbacks.push({
        cashback_period: cashbackPeriod,
        amount_total: cashback_amount,
      });
    }
  }

  // Convert totals to the desired precision
  const cashback_totals: CashbackTotals = {};
  for (const period in cashbackTotals) {
    const totalAmount = cashbackTotals[period];
    const convertedValues = convertCashbackAmountsPrecision(totalAmount.getAmount(), undefined, 2);
    cashback_totals[period] = {
      cashback_amount: convertedValues.cashback_amount!,
      cashback_amount_decimal: convertedValues.cashback_amount_decimal!,
    };
  }

  // Return all required data
  return {
    pricingDetails: {
      ...itemBreakdown,
      total_details: {
        ...itemBreakdown.total_details,
        breakdown: {
          ...itemBreakdown.total_details?.breakdown,
          cashbacks: cashbacks,
        },
      },
    },
    cashbacksMetadata: {
      ...(Object.keys(cashback_totals).length > 0 && { cashback_totals }),
      ...(appliedCashbackCoupons && { _coupons: appliedCashbacksWithAmounts }),
    },
  };
};