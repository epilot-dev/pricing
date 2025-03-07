import {
  CompositePriceItem,
  Order,
  PriceItem,
  Product,
  RecurrenceAmount,
  RecurrenceAmountWithTax,
} from '@epilot/pricing-client';

export interface PriceItemWithParent extends PriceItem, CompositePriceItem {
  parent_item: CompositePriceItem;
}

export type PriceDisplayType = 'show_as_on_request' | 'show_as_starting_price';

export type StaticFee = BaseFee;

export interface GetTieredUnitAmountOptions {
  isUnitAmountApproved: boolean;
  useUnitAmountNet: boolean;
}

export interface ExternalFeesMetadata {
  billing_period: string;
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
}

export interface BaseFee {
  /** Billing period based amount */
  amount: number | string;
  amount_decimal: string;

  /** Yearly amounts */
  amount_yearly?: number | string;
  amount_yearly_decimal?: string;

  /** Display label */
  label: string;
}

export interface VariableFee extends BaseFee {
  /** Per unit amounts */
  unit_amount?: number | string;
  unit_amount_decimal?: string;
}

export interface Cashback {
  name: string;
  period: string;
  amount: string | number;
}

export interface Breakdown {
  recurrences?: RecurrenceAmount[];
}

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
  recurrencesByTax: RecurrenceAmountWithTax;
}

export interface OrderTableData extends Omit<Order, 'products'> {
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
}
