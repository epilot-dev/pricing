import { getAppliedCompositeCashbackCoupons } from '../coupons/utils';
import { toDinero, toDineroFromInteger } from '../money/to-dinero';
import { convertCashbackAmountsPrecision, convertCashbackTotalsPrecision } from '../prices/convert-precision';
import { getSafeQuantity } from '../shared/get-safe-quantity';
import type { RedeemedPromo, PricingDetails, CompositePriceItem, Dinero, Coupon } from '../shared/types';

/**
 * Computes cashback amounts for composite price items with top-level cashback coupons.
 */
export const computeCompositePriceCashbacks = (
  compositePriceItem: CompositePriceItem,
  itemBreakdown: PricingDetails,
  redeemedPromos: Array<RedeemedPromo> = [],
) => {
  const appliedCashbackCoupons = getAppliedCompositeCashbackCoupons(compositePriceItem, redeemedPromos);

  const cashbackTotals: Record<string, Dinero> = {};
  const appliedCashbacksWithAmounts: Coupon[] = [];
  const cashbacks = [...(itemBreakdown.total_details?.breakdown?.cashbacks ?? [])];

  for (const cashbackCoupon of appliedCashbackCoupons ?? []) {
    let unitCashbackAmount: Dinero | undefined;

    unitCashbackAmount = toDinero(cashbackCoupon.fixed_value_decimal, cashbackCoupon.fixed_value_currency);

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
    itemMetadata: {
      ...(Object.keys(cashbackTotals).length > 0 && {
        cashback_totals: convertCashbackTotalsPrecision(cashbackTotals),
      }),
      ...(appliedCashbackCoupons && { _coupons: appliedCashbacksWithAmounts }),
    },
  };
};
