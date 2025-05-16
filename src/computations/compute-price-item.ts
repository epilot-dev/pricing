import type {
  ExternalFeeMapping,
  PriceItemDto,
  Tax,
  PriceInputMapping,
  RedeemedPromo,
  PriceItem,
  Price,
} from '@epilot/pricing-client';
import type { Currency } from 'dinero.js';
import { isValidCoupon } from '../coupons/guards';
import { getCouponOrder } from '../coupons/utils';
import { DEFAULT_CURRENCY } from '../money/constants';
import { PricingModel } from '../prices/constants';
import { convertPriceItemWithCouponAppliedToPriceItemDto } from '../prices/convert-precision';
import { getPriceTax } from '../prices/get-price-tax';
import { mapToProductSnapshot, mapToPriceSnapshot } from '../prices/map-to-snapshots';
import { normalizePriceMappingInput } from '../prices/mapping';
import type { PriceItemsTotals } from '../prices/types';
import { isPriceItemWithCouponApplied, isTaxInclusivePrice } from '../prices/utils';
import { getSafeQuantity } from '../shared/get-safe-quantity';
import { normalizeValueToFrequencyUnit } from '../time-frequency/normalizers';
import type { TimeFrequency } from '../time-frequency/types';
import { applyDiscounts } from './apply-discounts';
import { computeExternalDynamicTariffValues } from './compute-external-dynamic-tariff-values';
import { computeExternalGetAGItemValues } from './compute-external-get-agitem-values';
import { computePerUnitPriceItemValues } from './compute-per-unit-price-item-values';
import { computeTieredFlatFeePriceItemValues } from './compute-tiered-flat-fee-price-item-values';
import { computeTieredGraduatedPriceItemValues } from './compute-tiered-graduated-price-item-values';
import { computeTieredVolumePriceItemValues } from './compute-tiered-volume-price-item-values';

const computeExternalFee = (
  externalFeeMapping: ExternalFeeMapping | undefined,
  priceBillingPeriod: TimeFrequency | undefined,
): string | undefined => {
  if (!externalFeeMapping || !externalFeeMapping.amount_total_decimal) {
    return;
  }

  if (!priceBillingPeriod) {
    return externalFeeMapping.amount_total_decimal;
  }

  return normalizeValueToFrequencyUnit(
    externalFeeMapping.amount_total_decimal,
    externalFeeMapping.frequency_unit as TimeFrequency,
    priceBillingPeriod,
  ) as string;
};

export const computeQuantities = (price: Price | undefined, quantity: number, priceMapping?: PriceInputMapping) => {
  const safeQuantity = getSafeQuantity(quantity);
  const normalizedPriceMappingInput = normalizePriceMappingInput(priceMapping, price);
  const quantityToSelectTier = normalizedPriceMappingInput ? normalizedPriceMappingInput.toUnit() : 1;
  const unitAmountMultiplier = normalizedPriceMappingInput
    ? normalizedPriceMappingInput.multiply(safeQuantity).toUnit()
    : safeQuantity;

  return {
    safeQuantity,
    quantityToSelectTier,
    unitAmountMultiplier,
    isUsingPriceMappingToSelectTier: Boolean(normalizedPriceMappingInput),
  };
};

/**
 * Computes all price item total amounts to integers with a decimal precision of DECIMAL_PRECISION.
 */
export const computePriceItem = (
  _priceItem: PriceItemDto,
  {
    tax: applicableTax,
    quantity,
    priceMapping,
    externalFeeMapping,
    redeemedPromos,
  }: {
    tax?: Tax;
    quantity: number;
    priceMapping?: PriceInputMapping;
    externalFeeMapping?: ExternalFeeMapping;
    redeemedPromos: Array<RedeemedPromo>;
  },
): PriceItem => {
  /**
   * In some circunstances computePriceItem is being called with already computed price items.
   * In this case, we don't want we want to "revert" some of the computations, so they're not applied twice.
   * @todo We should broaden the type of priceItem to include PriceItem and CompositePriceItem
   * in addition to PriceItemDto and CompositePriceItemDto,
   * to cover the scenario in which recomputations are occurring.
   */
  const priceItem = isPriceItemWithCouponApplied(_priceItem)
    ? convertPriceItemWithCouponAppliedToPriceItemDto(_priceItem)
    : _priceItem;

  const price = priceItem._price;
  const currency = (price?.unit_amount_currency || DEFAULT_CURRENCY).toUpperCase() as Currency;
  const priceItemDescription = priceItem.description ?? price?.description;

  const priceTax = getPriceTax(applicableTax, price, priceItem.taxes);
  const isTaxInclusive = priceItem.is_tax_inclusive ?? isTaxInclusivePrice(price);

  const { safeQuantity, quantityToSelectTier, unitAmountMultiplier, isUsingPriceMappingToSelectTier } =
    computeQuantities(price, quantity, priceMapping);

  const externalFeeAmountDecimal = computeExternalFee(
    externalFeeMapping,
    priceItem.billing_period || price?.billing_period,
  );

  let itemValues: PriceItemsTotals;

  switch (price?.pricing_model) {
    case PricingModel.tieredVolume:
      itemValues = computeTieredVolumePriceItemValues({
        tiers: price.tiers,
        currency,
        isTaxInclusive,
        quantityToSelectTier,
        tax: priceTax,
        unitAmountMultiplier,
        unchangedPriceDisplayInJourneys: priceItem._price?.unchanged_price_display_in_journeys,
      });
      break;
    case PricingModel.tieredFlatFee:
      itemValues = computeTieredFlatFeePriceItemValues({
        tiers: price.tiers,
        currency,
        isTaxInclusive,
        quantityToSelectTier,
        tax: priceTax,
        quantity: safeQuantity,
        isUsingPriceMappingToSelectTier,
        unchangedPriceDisplayInJourneys: priceItem._price?.unchanged_price_display_in_journeys,
      });
      break;
    case PricingModel.tieredGraduated:
      itemValues = computeTieredGraduatedPriceItemValues({
        tiers: price.tiers,
        currency,
        isTaxInclusive,
        quantityToSelectTier,
        tax: priceTax,
        quantity: safeQuantity,
        isUsingPriceMappingToSelectTier,
        unchangedPriceDisplayInJourneys: priceItem._price?.unchanged_price_display_in_journeys,
      });
      break;
    case PricingModel.dynamicTariff:
      itemValues = computeExternalDynamicTariffValues({
        dynamicTariff: price.dynamic_tariff!,
        currency,
        isTaxInclusive,
        unitAmountMultiplier,
        externalFeeAmountDecimal,
        tax: priceTax,
      });
      break;
    case PricingModel.externalGetAG:
      itemValues = computeExternalGetAGItemValues({
        getAg: price.get_ag!,
        currency,
        isTaxInclusive,
        unitAmountMultiplier,
        userInput: quantityToSelectTier,
        externalFeeAmountDecimal,
        tax: priceTax,
      });
      break;
    case PricingModel.perUnit:
    default:
      itemValues = computePerUnitPriceItemValues({
        unitAmountDecimal: priceItem.unit_amount_decimal || price?.unit_amount_decimal || '0',
        currency,
        isTaxInclusive,
        unitAmountMultiplier,
        tax: priceTax,
      });
  }

  const redeemedPromoCouponIds = redeemedPromos.flatMap(({ coupons }) => coupons?.map(({ _id }) => _id));

  const coupons = priceItem._coupons
    ?.filter(isValidCoupon)
    .filter((coupon) => (coupon.requires_promo_code ? redeemedPromoCouponIds.includes(coupon._id) : true))
    .sort(getCouponOrder);

  /* Only apply the first coupon */
  const appliedCoupons = coupons?.slice(0, 1);

  const [coupon] = appliedCoupons ?? [];

  if (coupon) {
    const multiplier = price?.pricing_model === PricingModel.tieredFlatFee ? safeQuantity : unitAmountMultiplier;

    itemValues = applyDiscounts(itemValues, {
      priceItem,
      currency,
      isTaxInclusive,
      unitAmountMultiplier: multiplier,
      tax: priceTax,
      coupon,
    });
  }

  /* If there's a coupon cashback period output it */
  const cashbackPeriod = coupon?.cashback_period;
  const type = priceItem?.type ?? price?.type;

  return {
    ...priceItem,
    ...itemValues,
    ...(appliedCoupons && { _coupons: appliedCoupons }),
    currency,
    ...(priceItemDescription && { description: priceItemDescription }),
    ...(Number.isInteger(itemValues.cashback_amount) && { cashback_period: cashbackPeriod ?? '0' }),
    taxes: [
      {
        ...(priceTax ? { tax: priceTax } : { rate: 'nontaxable', rateValue: 0 }),
        amount: itemValues.amount_tax,
      },
    ],
    ...(priceItem._product && { _product: mapToProductSnapshot(priceItem._product) }),
    type,
    ...(type === 'recurring' && { billing_period: priceItem.billing_period ?? price?.billing_period }),
    _price: {
      ...mapToPriceSnapshot(price),
      ...(itemValues.price_display_in_journeys && {
        price_display_in_journeys: itemValues.price_display_in_journeys ?? price?.price_display_in_journeys,
        unchanged_price_display_in_journeys:
          priceItem._price?.unchanged_price_display_in_journeys ?? price?.price_display_in_journeys,
      }),
    },
    is_tax_inclusive: isTaxInclusive,
  };
};
