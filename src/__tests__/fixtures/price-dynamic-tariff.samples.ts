import type { PriceItemDto } from './../../types';
import { tax19percent } from './tax.samples';

export const priceDynamicManual: PriceItemDto = {
  quantity: 1,
  product_id: 'prod-id#1',
  price_id: 'price#1',
  _price: {
    _id: 'price#1',
    unit_amount_currency: 'EUR',
    is_tax_inclusive: false,
    pricing_model: 'dynamic_tariff',
    dynamic_tariff: {
      mode: 'manual',
      average_price: 33,
      average_price_decimal: '0.33',
    },
    billing_period: 'monthly',
    tax: [tax19percent],
  },
  _product: {
    _tags: [],
  },
  type: 'recurring',
  dynamic_tariff: {
    mode: 'manual',
    average_price: 33,
    average_price_decimal: '0.33',
  },
  price_mappings: [{ price_id: 'price#1', value: 12000, frequency_unit: 'yearly' }],
  external_fees_mappings: [
    { price_id: 'price#1', amount_total: 11.4, amount_total_decimal: '0.114', frequency_unit: undefined },
  ],
  billing_period: 'monthly',
  taxes: [
    {
      tax: tax19percent,
    },
  ],
} as any;

export const priceDynamicRealtime: PriceItemDto = {
  quantity: 1,
  product_id: 'prod-id#1',
  price_id: 'price#1',
  _price: {
    _id: 'price#1',
    unit_amount_currency: 'EUR',
    is_tax_inclusive: false,
    pricing_model: 'dynamic_tariff',
    dynamic_tariff: {
      mode: 'day_ahead_market',
      interval: 'hourly',
      markup: 18,
      markup_amount_decimal: '0.18',
    },
    billing_period: 'monthly',
    tax: [tax19percent],
  },
  _product: {
    _tags: [],
  },
  type: 'recurring',
  dynamic_tariff: {
    mode: 'day_ahead_market',
    interval: 'hourly',
    markup: 18,
    markup_amount_decimal: '0.18',
  },
  price_mappings: [{ price_id: 'price#1', value: 12000, frequency_unit: 'yearly' }],
  external_fees_mappings: [
    { price_id: 'price#1', amount_total: 11.4, amount_total_decimal: '0.114', frequency_unit: undefined },
  ],
  billing_period: 'monthly',
  taxes: [
    {
      tax: tax19percent,
    },
  ],
} as any;

export const priceDynamicRealtimeTaxinclusive: PriceItemDto = {
  quantity: 1,
  product_id: 'prod-id#1',
  price_id: 'price#1',
  _price: {
    _id: 'price#1',
    unit_amount_currency: 'EUR',
    is_tax_inclusive: true,
    pricing_model: 'dynamic_tariff',
    dynamic_tariff: {
      mode: 'day_ahead_market',
      interval: 'hourly',
      markup: 25,
      markup_amount_decimal: '0.25',
    },
    billing_period: 'monthly',
    tax: [tax19percent],
  },
  _product: {
    _tags: [],
  },
  type: 'recurring',
  dynamic_tariff: {
    mode: 'day_ahead_market',
    interval: 'hourly',
    markup: 25,
    markup_amount_decimal: '0.25',
  },
  price_mappings: [{ price_id: 'price#1', value: 12000, frequency_unit: 'yearly' }],
  external_fees_mappings: [
    { price_id: 'price#1', amount_total: 11.4, amount_total_decimal: '0.114', frequency_unit: 'yearly' },
  ],
  billing_period: 'monthly',
  taxes: [
    {
      tax: tax19percent,
    },
  ],
} as any;

export const compositePriceDynamicManual: PriceItemDto = {
  description: 'Test Dynamic Tariff Composite',
  is_composite_price: true,
  _tags: ['composite'],
  _schema: 'price',
  _id: 'price#1',
  _price: {
    description: 'Test Dynamic Tariff Composite',
    active: true,
    pricing_model: 'per_unit',
    price_components: [
      {
        _id: 'comp#1',
        unit_amount: 1190,
        unit_amount_currency: 'EUR',
        unit_amount_decimal: '11.90',
        sales_tax: 'standard',
        active: true,
        price_display_in_journeys: 'show_price',
        type: 'recurring',
        billing_period: 'monthly',
        _slug: 'price',
        _schema: 'price',
        pricing_model: 'per_unit',
        is_tax_inclusive: true,
        variable_price: false,
        tax: [tax19percent],
      },
      {
        _id: 'comp#2',
        pricing_model: 'dynamic_tariff',
        is_tax_inclusive: false,
        price_display_in_journeys: 'estimated_price',
        active: true,
        variable_price: true,
        type: 'recurring',
        billing_period: 'monthly',
        _slug: 'price',
        _schema: 'price',
        _title: 'Consumption',
        tax: [tax19percent],
        dynamic_tariff: {
          mode: 'manual',
          average_price: 33,
          average_price_decimal: '0.33',
        },
      },
    ],
    is_composite_price: true,
    _schema: 'price',
    _id: 'price#1',
  },
  price_mappings: [{ price_id: 'comp#2', value: 12000, frequency_unit: 'yearly' }],
  external_fees_mappings: [
    { price_id: 'comp#2', amount_total: 11.4, amount_total_decimal: '0.114', frequency_unit: undefined },
  ],
} as any;

export const compositePriceDynamicRealtime: PriceItemDto = {
  description: 'Test Dynamic Tariff Composite',
  is_composite_price: true,
  _tags: ['composite'],
  _schema: 'price',
  _id: 'price#1',
  _price: {
    description: 'Test Dynamic Tariff Composite',
    active: true,
    pricing_model: 'per_unit',
    price_components: [
      {
        _id: 'comp#1',
        unit_amount: 1190,
        unit_amount_currency: 'EUR',
        unit_amount_decimal: '11.90',
        sales_tax: 'standard',
        active: true,
        price_display_in_journeys: 'show_price',
        type: 'recurring',
        billing_period: 'monthly',
        _slug: 'price',
        _schema: 'price',
        pricing_model: 'per_unit',
        is_tax_inclusive: true,
        variable_price: false,
        tax: [tax19percent],
      },
      {
        _id: 'comp#2',
        pricing_model: 'dynamic_tariff',
        is_tax_inclusive: false,
        price_display_in_journeys: 'estimated_price',
        active: true,
        variable_price: true,
        type: 'recurring',
        billing_period: 'monthly',
        _slug: 'price',
        _schema: 'price',
        _title: 'Consumption',
        tax: [tax19percent],
        dynamic_tariff: {
          mode: 'day_ahead_market',
          interval: 'hourly',
          markup: 18,
          markup_amount_decimal: '0.18',
        },
      },
    ],
    is_composite_price: true,
    _schema: 'price',
    _id: 'price#1',
  },
  price_mappings: [{ price_id: 'comp#2', value: 12000, frequency_unit: 'yearly' }],
  external_fees_mappings: [
    { price_id: 'comp#2', amount_total: 11.4, amount_total_decimal: '0.114', frequency_unit: undefined },
  ],
} as any;

export const compositePriceDynamicRealtimeTaxInclusive: PriceItemDto = {
  description: 'Test Dynamic Tariff Composite',
  is_composite_price: true,
  _tags: ['composite'],
  _schema: 'price',
  _id: 'price#1',
  _price: {
    description: 'Test Dynamic Tariff Composite',
    active: true,
    pricing_model: 'per_unit',
    price_components: [
      {
        _id: 'comp#1',
        unit_amount: 1190,
        unit_amount_currency: 'EUR',
        unit_amount_decimal: '11.90',
        sales_tax: 'standard',
        active: true,
        price_display_in_journeys: 'show_price',
        type: 'recurring',
        billing_period: 'monthly',
        _slug: 'price',
        _schema: 'price',
        pricing_model: 'per_unit',
        is_tax_inclusive: true,
        variable_price: false,
        tax: [tax19percent],
      },
      {
        _id: 'comp#2',
        pricing_model: 'dynamic_tariff',
        is_tax_inclusive: false,
        price_display_in_journeys: 'estimated_price',
        active: true,
        variable_price: true,
        type: 'recurring',
        billing_period: 'monthly',
        _slug: 'price',
        _schema: 'price',
        _title: 'Consumption',
        tax: [tax19percent],
        dynamic_tariff: {
          mode: 'day_ahead_market',
          interval: 'hourly',
          markup: 25,
          markup_amount_decimal: '0.25',
        },
      },
    ],
    is_composite_price: true,
    _schema: 'price',
    _id: 'price#1',
  },
  price_mappings: [{ price_id: 'comp#2', value: 12000, frequency_unit: 'yearly' }],
  external_fees_mappings: [
    { price_id: 'comp#2', amount_total: 11.4, amount_total_decimal: '0.114', frequency_unit: undefined },
  ],
} as any;
