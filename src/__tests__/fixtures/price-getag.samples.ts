import { PriceItemDto } from "./../../types";
import { tax19percent } from "./tax.samples";

export const priceGetAG: PriceItemDto = {
  quantity: 1,
  product_id: 'prod-id#1',
  price_id: 'price#1',
  _price: {
    _id: 'price#1',
    unit_amount_currency: 'EUR',
    is_tax_inclusive: true,
    pricing_model: 'external_getag',
    get_ag: {
      category: "power",
      markup_amount: 10,
      markup_amount_decimal: "0.10"
    },
    billing_period: 'monthly',
    tax: [tax19percent],
  },
  _product: {
    _tags: [],
  },
  type: 'recurring',
  pricing_model: 'external_getag',
  get_ag: {
    category: "power",
    markup_amount: 10,
    markup_amount_decimal: "0.10"
  },
  price_mappings: [
    { price_id: 'price#1', value: 12000, frequency_unit: 'yearly' }
  ],
  external_fees_mappings: [
    { price_id: 'price#1', amount_total: 142632, amount_total_decimal: '1426.32' ,frequency_unit: 'yearly' }
  ],
  billing_period: 'monthly',
  taxes: [
    {
      tax: tax19percent,
    },
  ]
} as any

export const compositePriceGetAG: PriceItemDto = {
    description: "Test GetAG Composite",
    price_components: [
      {
        _id: "comp#1",
        unit_amount: 5,
        unit_amount_currency: "EUR",
        unit_amount_decimal: "0.046789",
        sales_tax: "standard",
        active: true,
        price_display_in_journeys: "show_price",
        type: "recurring",
        billing_period: 'monthly',
        _slug: "price",
        _schema: "price",
        pricing_model: "external_getag",
        is_tax_inclusive: true,
        variable_price: false,
        get_ag: {
          category: "power",
          markup_amount: 1000,
          markup_amount_decimal: "10.00"
        },
        taxes: [
          {
            tax: tax19percent,
          },
        ]
      },
      {
        _id: "comp#2",
        pricing_model: "external_getag",
        is_tax_inclusive: true,
        price_display_in_journeys: "show_price",
        active: true,
        variable_price: true,
        type: "recurring",
        billing_period: 'monthly',
        _slug: "price",
        _schema: "price",
        _title: "Consumption",
        taxes: [
          {
            tax: tax19percent,
          },
        ],
        get_ag: {
          category: "power",
          markup_amount: 10,
          markup_amount_decimal: "0.10"
        }
      },
    ],
    is_composite_price: true,
    _tags: [
      "composite"
    ],
    _schema: "price",
    _id: "price#1",
    _price: {
      description: "Test GetAG Composite",
      active: true,
      pricing_model: "per_unit",
      price_components: [
        {
          _id: "comp#1",
          unit_amount: 5,
          unit_amount_currency: "EUR",
          unit_amount_decimal: "0.046789",
          sales_tax: "standard",
          active: true,
          price_display_in_journeys: "show_price",
          type: "recurring",
          billing_period: 'monthly',
          _slug: "price",
          _schema: "price",
          pricing_model: "external_getag",
          is_tax_inclusive: true,
          variable_price: false,
          get_ag: {
            category: "power",
            markup_amount: 1000,
            markup_amount_decimal: "10.00"
          },
          tax: [
            tax19percent
          ]
        },
        {
          _id: "comp#2",
          pricing_model: "external_getag",
          is_tax_inclusive: true,
          price_display_in_journeys: "show_price",
          active: true,
          variable_price: true,
          type: "recurring",
          billing_period: 'monthly',
          _slug: "price",
          _schema: "price",
          _title: "Consumption",
          tax: [
            tax19percent
          ],
          get_ag: {
            category: "power",
            markup_amount: 10,
            markup_amount_decimal: "0.10"
          }
        },
      ],
      is_composite_price: true,
      _schema: "price",
      _id: "price#1",
    },
    price_mappings: [
      { price_id: 'comp#2', value: 12000, frequency_unit: 'yearly' }
    ],
    external_fees_mappings: [
      { price_id: 'comp#1', amount_total: 5426, amount_total_decimal: '54.26' ,frequency_unit: 'yearly' },
      { price_id: 'comp#2', amount_total: 142632, amount_total_decimal: '1426.32' ,frequency_unit: 'yearly' }
    ]
  } as any
  


export const compositePriceGetAGWithZeroInputMapping: PriceItemDto = {
    description: "Test GetAG Composite",
    price_components: [
      {
        _id: "comp#1",
        unit_amount: 5,
        unit_amount_currency: "EUR",
        unit_amount_decimal: "0.046789",
        sales_tax: "standard",
        active: true,
        price_display_in_journeys: "show_price",
        type: "recurring",
        billing_period: 'monthly',
        _slug: "price",
        _schema: "price",
        pricing_model: "external_getag",
        is_tax_inclusive: true,
        variable_price: false,
        get_ag: {
          category: "power",
          markup_amount: 1000,
          markup_amount_decimal: "10.00"
        },
        taxes: [
          {
            tax: tax19percent,
          },
        ]
      },
      {
        _id: "comp#2",
        pricing_model: "external_getag",
        is_tax_inclusive: true,
        price_display_in_journeys: "show_price",
        active: true,
        variable_price: true,
        type: "recurring",
        billing_period: 'monthly',
        _slug: "price",
        _schema: "price",
        _title: "Consumption",
        taxes: [
          {
            tax: tax19percent,
          },
        ],
        get_ag: {
          category: "power",
          markup_amount: 10,
          markup_amount_decimal: "0.10"
        }
      },
    ],
    is_composite_price: true,
    _tags: [
      "composite"
    ],
    _schema: "price",
    _id: "price#1",
    _price: {
      description: "Test GetAG Composite",
      active: true,
      pricing_model: "per_unit",
      price_components: [
        {
          _id: "comp#1",
          unit_amount: 5,
          unit_amount_currency: "EUR",
          unit_amount_decimal: "0.046789",
          sales_tax: "standard",
          active: true,
          price_display_in_journeys: "show_price",
          type: "recurring",
          billing_period: 'monthly',
          _slug: "price",
          _schema: "price",
          pricing_model: "external_getag",
          is_tax_inclusive: true,
          variable_price: false,
          get_ag: {
            category: "power",
            markup_amount: 1000,
            markup_amount_decimal: "10.00"
          },
          tax: [
            tax19percent
          ]
        },
        {
          _id: "comp#2",
          pricing_model: "external_getag",
          is_tax_inclusive: true,
          price_display_in_journeys: "show_price",
          active: true,
          variable_price: true,
          type: "recurring",
          billing_period: 'monthly',
          _slug: "price",
          _schema: "price",
          _title: "Consumption",
          tax: [
            tax19percent
          ],
          get_ag: {
            category: "power",
            markup_amount: 10,
            markup_amount_decimal: "0.10"
          }
        },
      ],
      is_composite_price: true,
      _schema: "price",
      _id: "price#1",
    },
    price_mappings: [
      { price_id: 'comp#2', value: 0, frequency_unit: 'yearly' }
    ],
    external_fees_mappings: [
      { price_id: 'comp#1', amount_total: 5426, amount_total_decimal: '54.26' ,frequency_unit: 'yearly' },
      { price_id: 'comp#2', amount_total: 142632, amount_total_decimal: '1426.32' ,frequency_unit: 'yearly' }
    ]
  } as any
  