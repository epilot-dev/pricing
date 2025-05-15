import type { PriceItem, PriceItemDto, Price } from '@epilot/pricing-client';

/**
 * Removes all computed values from a price item and returns a price item dto.
 */
export const convertPriceItemWithCouponAppliedToPriceItemDto = ({
  before_discount_amount_total,
  before_discount_amount_total_decimal,
  before_discount_unit_amount,
  before_discount_unit_amount_decimal,
  before_discount_unit_amount_gross,
  before_discount_unit_amount_gross_decimal,
  before_discount_unit_amount_net,
  before_discount_unit_amount_net_decimal,
  before_discount_tax_amount,
  before_discount_tax_amount_decimal,
  discount_amount,
  discount_amount_decimal,
  discount_percentage,
  discount_amount_net,
  discount_amount_net_decimal,
  tax_discount_amount,
  tax_discount_amount_decimal,
  unit_discount_amount,
  unit_discount_amount_decimal,
  unit_discount_amount_net,
  unit_discount_amount_net_decimal,
  cashback_amount,
  cashback_amount_decimal,
  after_cashback_amount_total,
  after_cashback_amount_total_decimal,
  cashback_period,
  ...priceItem
}: PriceItem): PriceItemDto =>
  ({
    ...priceItem,
    ...(before_discount_unit_amount && {
      unit_amount: before_discount_unit_amount,
      unit_amount_decimal: before_discount_unit_amount_decimal,
    }),
    _price: priceItem._price as Price,
  }) as PriceItemDto;
