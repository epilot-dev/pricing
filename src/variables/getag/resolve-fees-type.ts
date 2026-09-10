import type { CompositePriceItem, PriceItem } from '@epilot/sdk/pricing';
import { extractGetAgConfig } from '../../getag/extract-config';
import type { ExternalFeesMetadata } from '../types';

export type ExternalFeesType = 'power' | 'gas';

/**
 * Breakdown keys that only the getag *gas* computation emits.
 * @see pricing-api `getComputedGasPriceDetails`
 */
const GAS_ONLY_FEE_KEYS = [
  'gas_tax',
  'gas_storage',
  'gas_conversion_charge',
  'co2',
  'grid_fee',
  'performance',
  'control_energy',
  'neutrality_charge',
  'invoice_fee',
  'metering_reading_fee',
] as const;

/**
 * Breakdown keys that only the getag *power* computation emits.
 * @see pricing-api `getComputedPowerPriceDetails`
 */
const POWER_ONLY_FEE_KEYS = [
  'power_tax',
  'power_kwh_ht',
  'power_kwh_nt',
  'chp',
  'extra_charge',
  'offshore_liability_fee',
  'interruptible_load',
] as const;

const isExternalFeesType = (value: unknown): value is ExternalFeesType => value === 'power' || value === 'gas';

const collectBreakdownKeys = (externalFeesMetadata: ExternalFeesMetadata): Set<string> => {
  const { static: staticFees, variable, variable_ht, variable_nt } = externalFeesMetadata.breakdown ?? {};

  return new Set([staticFees, variable, variable_ht, variable_nt].flatMap((fees) => (fees ? Object.keys(fees) : [])));
};

const resolveTypeFromBreakdown = (externalFeesMetadata: ExternalFeesMetadata): ExternalFeesType | undefined => {
  const keys = collectBreakdownKeys(externalFeesMetadata);

  if (GAS_ONLY_FEE_KEYS.some((key) => keys.has(key))) {
    return 'gas';
  }

  if (POWER_ONLY_FEE_KEYS.some((key) => keys.has(key))) {
    return 'power';
  }

  return undefined;
};

const resolveTypeFromPriceConfig = (item: PriceItem | CompositePriceItem): ExternalFeesType | undefined => {
  const category = (
    extractGetAgConfig(item, { type: 'work_price', tariffType: 'HT' }) ??
    extractGetAgConfig(item, { type: 'work_price', tariffType: 'NT' }) ??
    extractGetAgConfig(item, { type: 'base_price' })
  )?.category;

  return isExternalFeesType(category) ? category : undefined;
};

/**
 * Resolves whether getag fee metadata describes a power or a gas tariff.
 *
 * `external_fees_metadata.inputs.type` is only attached by the journey app; orders created through
 * other channels carry the raw compute result without it. In that case the commodity is derived from
 * the fee keys the pricing API emitted (they differ per commodity), then from the price's getag
 * category, and only as a last resort defaults to `power`.
 */
export const resolveExternalFeesType = (
  externalFeesMetadata: ExternalFeesMetadata,
  item?: PriceItem | CompositePriceItem,
): ExternalFeesType => {
  const declaredType = externalFeesMetadata.inputs?.type;

  if (isExternalFeesType(declaredType)) {
    return declaredType;
  }

  return resolveTypeFromBreakdown(externalFeesMetadata) ?? (item && resolveTypeFromPriceConfig(item)) ?? 'power';
};
