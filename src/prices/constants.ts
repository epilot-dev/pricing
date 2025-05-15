export enum PricingModel {
  perUnit = 'per_unit',
  tieredGraduated = 'tiered_graduated',
  tieredVolume = 'tiered_volume',
  tieredFlatFee = 'tiered_flatfee',
  dynamicTariff = 'dynamic_tariff',
  externalGetAG = 'external_getag',
}

export enum MarkupPricingModel {
  /**
   * Is currently not used.
   */
  perUnit = 'per_unit',
  tieredVolume = 'tiered_volume',
  tieredFlatFee = 'tiered_flatfee',
}

export enum TypeGetAg {
  basePrice = 'base_price',
  /**
   * Is currently not used.
   */
  workPrice = 'work_price',
}

export enum ModeDynamicTariff {
  /**
   * Is currently not used.
   */
  dayAheadMarket = 'day_ahead_market',
  manual = 'manual',
}
