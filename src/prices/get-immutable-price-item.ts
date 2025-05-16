import type { PriceItem, CompositePriceItem, PricingDetails } from '@epilot/pricing-client';
import { toDinero } from '../money/to-dinero';

const convertAmountsToDinero = <Item extends PriceItem | CompositePriceItem>(item: Item): Item => {
  const dineroTotal = toDinero(item.amount_total_decimal || '0');
  const dineroSubtotal = toDinero(item.amount_subtotal_decimal || '0');
  const amountTax = dineroTotal.subtract(dineroSubtotal).getAmount();

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
