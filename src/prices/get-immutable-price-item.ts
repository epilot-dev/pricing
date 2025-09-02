import type { PriceItem, CompositePriceItem, PricingDetails } from '@epilot/pricing-client';
import { isValidCoupon } from '../coupons/guards';
import { toDinero } from '../money/to-dinero';

const convertAmountsToDinero = <Item extends PriceItem | CompositePriceItem>(item: Item): Item => {
  const dineroTotal = toDinero(item.amount_total_decimal || '0');
  const dineroSubtotal = toDinero(item.amount_subtotal_decimal || '0');
  const amountTax = dineroTotal.subtract(dineroSubtotal).getAmount();
  const coupon = item._coupons?.filter(isValidCoupon)?.[0];

  return {
    ...item,
    amount_total: dineroTotal.getAmount(),
    amount_subtotal: dineroSubtotal.getAmount(),
    unit_amount_gross: toDinero(item.unit_amount_gross_decimal || '0').getAmount(),
    unit_amount_net: toDinero(item.unit_amount_net_decimal || '0').getAmount(),
    unit_amount: toDinero(item.unit_amount_decimal || '0').getAmount(),
    amount_tax: amountTax,
    ...(item.taxes &&
      Array.isArray(item.taxes) &&
      item.taxes[0] && {
        taxes: [{ ...item.taxes[0], amount: amountTax }, ...item.taxes.slice(1)],
      }),
    ...(coupon &&
      coupon.category === 'discount' && {
        discount_amount: toDinero(item.discount_amount_decimal || '0').getAmount(),
        discount_amount_net: toDinero(item.discount_amount_net_decimal || '0').getAmount(),
        before_discount_amount_total: toDinero(item.before_discount_amount_total_decimal || '0').getAmount(),
        before_discount_tax_amount: toDinero(item.before_discount_tax_amount_decimal || '0').getAmount(),
        before_discount_unit_amount: toDinero(item.before_discount_unit_amount_decimal || '0').getAmount(),
        before_discount_unit_amount_gross: toDinero(item.before_discount_unit_amount_gross_decimal || '0').getAmount(),
        before_discount_unit_amount_net: toDinero(item.before_discount_unit_amount_net_decimal || '0').getAmount(),
        tax_discount_amount: toDinero(item.tax_discount_amount_decimal || '0').getAmount(),
        unit_discount_amount: toDinero(item.unit_discount_amount_decimal || '0').getAmount(),
        unit_discount_amount_net: toDinero(item.unit_discount_amount_net_decimal || '0').getAmount(),
      }),
    ...(coupon &&
      coupon.category === 'cashback' && {
        cashback_amount: toDinero(item.cashback_amount_decimal || '0').getAmount(),
        after_cashback_amount_total: toDinero(item.after_cashback_amount_total_decimal || '0').getAmount(),
      }),
  };
};

export const getImmutablePriceItem = (
  immutablePricingDetails: PricingDetails | undefined,
): PriceItem | CompositePriceItem | undefined => {
  const immutablePriceItem = immutablePricingDetails?.items?.[0];

  if (!immutablePriceItem) {
    return undefined;
  }

  if (immutablePriceItem.is_composite_price) {
    const compositePriceItem = immutablePriceItem as CompositePriceItem;

    return {
      ...convertAmountsToDinero(compositePriceItem),
      item_components: compositePriceItem.item_components?.map((component) => convertAmountsToDinero(component)),
    };
  }

  return convertAmountsToDinero(immutablePriceItem);
};
