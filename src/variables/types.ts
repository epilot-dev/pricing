import type {
  CompositePriceItem,
  Order,
  PriceItem,
  Product,
  RecurrenceAmount,
  RecurrenceAmountWithTax,
} from '@epilot/pricing-client';

export type PriceItemWithParent =
  | (PriceItem & { parent_item: CompositePriceItem })
  | (CompositePriceItem & { parent_item: CompositePriceItem });

export type PriceDisplayType = 'show_as_on_request' | 'show_as_starting_price';

export type StaticFee = BaseFee;

export type GetTieredUnitAmountOptions = {
  isUnitAmountApproved: boolean;
  useUnitAmountNet: boolean;
};

export type ExternalFeesMetadata = {
  billing_period: string;
  inputs: {
    consumptionHT?: number;
    consumptionNT?: number;
    type?: 'power' | 'gas';
  };
  breakdown: {
    static: {
      [key: string]: StaticFee;
    };
    variable: {
      [key: string]: VariableFee;
    };
    variable_ht: {
      [key: string]: VariableFee;
    };
    variable_nt?: {
      [key: string]: VariableFee;
    };
    // Display static
    display_static?: string;
    display_static_yearly?: string;
    // Display variable (same as HT if no NT)
    display_variable?: string;
    display_variable_yearly?: string;
    display_variable_per_unit?: string;
    // Display variable_ht
    display_variable_ht?: string;
    display_variable_ht_yearly?: string;
    display_variable_ht_per_unit?: string;
    // Display variable_nt
    display_variable_nt?: string;
    display_variable_nt_yearly?: string;
    display_variable_nt_per_unit?: string;
  };
};

type BaseFee = {
  /** Billing period based amount */
  amount: number | string;
  amount_decimal: string;

  /** Yearly amounts */
  amount_yearly?: number | string;
  amount_yearly_decimal?: string;

  /** Display label */
  label: string;
};

export type VariableFee = BaseFee & {
  /** Per unit amounts */
  unit_amount?: number | string;
  unit_amount_decimal?: string;
};

type Cashback = {
  name: string;
  period: string;
  amount: string | number;
};

type Breakdown = {
  recurrences?: RecurrenceAmount[];
};

export interface RecurrenceByBillingPeriod {
  totalLabel?: string;
  billing_period: 'weekly' | 'monthly' | 'every_quarter' | 'every_6_months' | 'yearly';
  amount_total: string | number;
  amount_total_decimal: string;
  amount_subtotal: number;
  amount_subtotal_decimal: string;
  amount_tax?: number;
  amount_tax_decimal?: string;
  full_amount_tax: string;
  type: string;
  is_discount_recurrence: boolean;
  recurrencesByTax: RecurrenceAmountWithTax[];
}

export type OrderTableData = Omit<Order, 'products'> & {
  products: Product[];
  total_details: Order['total_details'] & {
    amount_tax: string;
    cashbacks?: Cashback[];
    breakdown: Breakdown;
    recurrences: RecurrenceByBillingPeriod[];
    recurrencesByTax: {
      [key: string]: RecurrenceAmountWithTax;
    };
    ['one-time']?: RecurrenceAmount;
    ['weekly']?: RecurrenceAmount;
    ['monthly']?: RecurrenceAmount;
    ['every_quarter']?: RecurrenceAmount;
    ['every_6_months']?: RecurrenceAmount;
    ['yearly']?: RecurrenceAmount;
  };
};

export interface ExternalFeesDetailsFee extends StaticFee, VariableFee {}

export interface ExternalFeesDetailsGroup {
  fees: Record<string, ExternalFeesDetailsFee>;
  label: string;
  display_fees_unit_price: string;
  display_fees_yearly: string;
}

export interface ExternalFeesDetails {
  unit_price_period: string;
  tax_behavior?: string;
  unit?: string;
  headers?: {
    unit_price: string;
    yearly_price: string;
  };
  groups: Record<string, ExternalFeesDetailsGroup>;
  display_fees_unit_price: string;
  display_fees_yearly: string;
}
