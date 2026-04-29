import { getAppliedCompositeCashbackCoupons } from '../coupons/utils';
import { toDinero } from '../money/to-dinero';
import { convertCashbackAmountsPrecision } from '../prices/convert-precision';
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

  const appliedCashbacksWithAmounts: Coupon[] = [];
  const cashbacks = [...(itemBreakdown.total_details?.breakdown?.cashbacks ?? [])];

  for (const cashbackCoupon of appliedCashbackCoupons ?? []) {
    let unitCashbackAmount: Dinero | undefined;

    unitCashbackAmount = toDinero(cashbackCoupon.fixed_value_decimal, cashbackCoupon.fixed_value_currency);

    const unitAmountMultiplier = getSafeQuantity(compositePriceItem.quantity);
    const cashbackAmount = unitCashbackAmount.multiply(unitAmountMultiplier);
    const cashback_amount = cashbackAmount.getAmount();
    const cashbackPeriod = cashbackCoupon?.cashback_period ?? '0';

    // Update applied cashbacks with amounts
    const cashbackAmountWithPrecision = convertCashbackAmountsPrecision(cashback_amount, undefined, 2);
    appliedCashbacksWithAmounts.push({
      ...cashbackCoupon,
      cashback_amount: cashbackAmountWithPrecision.cashback_amount!,
      cashback_amount_decimal: cashbackAmountWithPrecision.cashback_amount_decimal!,
    });

    // Preserve one entry per applied cashback rather than summing entries
    // that share the same cashback_period, so consumers can render each
    // cashback as its own line.
    cashbacks.push({
      cashback_period: cashbackPeriod,
      amount_total: cashback_amount,
      ...(cashbackCoupon.name && { cashback_name: cashbackCoupon.name }),
    });
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
    ...(appliedCashbackCoupons && { _coupons: appliedCashbacksWithAmounts }),
  };
};
