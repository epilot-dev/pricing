import { PriceItemDto } from "./../../types";

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
        type: "one_time",
        _slug: "price",
        _schema: "price",
        pricing_model: "external_getag",
        is_tax_inclusive: true,
        variable_price: false,
        get_ag: {
          category: "power",
          markup_amount: 1000,
          markup_amount_decimal: "10.00"
        }
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
          {
            active: true,
            description: "New Tax",
            region: "DE",
            rate: "12",
            type: "VAT",
            _schema: "tax",
            _id: "8d3a3f9a-b6a6-4695-99ed-abd52c8f3854",
            _org: "739224",
            _owners: [
              {
                org_id: "739224",
                user_id: "11000895"
              }
            ],
            _created_at: "2023-12-21T16:46:50.200Z",
            _updated_at: "2023-12-21T16:46:50.200Z",
            _title: "New Tax",
            _acl: {
              view: [
                "org_739224"
              ],
              edit: [
                "org_739224"
              ],
              delete: [
                "org_739224"
              ]
            }
          }
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
          type: "one_time",
          _slug: "price",
          _schema: "price",
          pricing_model: "external_getag",
          is_tax_inclusive: true,
          variable_price: false,
          get_ag: {
            category: "power",
            markup_amount: 1000,
            markup_amount_decimal: "10.00"
          }
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
            {
              active: true,
              description: "New Tax",
              region: "DE",
              rate: "12",
              type: "VAT",
              _schema: "tax",
              _id: "8d3a3f9a-b6a6-4695-99ed-abd52c8f3854",
              _org: "739224",
              _owners: [
                {
                  org_id: "739224",
                  user_id: "11000895"
                }
              ],
              _created_at: "2023-12-21T16:46:50.200Z",
              _updated_at: "2023-12-21T16:46:50.200Z",
              _title: "New Tax",
              _acl: {
                view: [
                  "org_739224"
                ],
                edit: [
                  "org_739224"
                ],
                delete: [
                  "org_739224"
                ]
              }
            }
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
      getag_price: {
        amount_total: 3126,
        amount_total_decimal: "31.26",
        amount_static: 3126,
        amount_static_decimal: "31.26",
        amount_variable: 0,
        amount_variable_decimal: "0.000000000000",
        currency: "EUR",
        billing_period: "yearly",
        breakdown: {
          static: {
            basic_fee: {
              amount: 1921,
              amount_decimal: "19.21"
            },
            maintenance_fee: {
              amount: 1205,
              amount_decimal: "12.05"
            }
          },
          variable: {
            offshore_liability_fee: {
              amount: 0,
              amount_decimal: "0"
            },
            interruptible_load: {
              amount: 0,
              amount_decimal: "0"
            },
            extra_charge: {
              amount: 0,
              amount_decimal: "0"
            },
            chp: {
              amount: 0,
              amount_decimal: "0"
            },
            power_kwh: {
              amount: 0,
              amount_decimal: "0"
            },
            concession: {
              amount: 0,
              amount_decimal: "0"
            }
          }
        }
      }
    },
    price_mappings: [
      { price_id: 'comp#2', value: 12000, frequency_unit: 'yearly' }
    ],
    external_fees_mappings: [
      { price_id: 'comp#1', amount_total: 3126, amount_total_decimal: '31.26' ,frequency_unit: 'yearly' },
      { price_id: 'comp#2', amount_total: 0, amount_total_decimal: '0.00' ,frequency_unit: 'yearly' }
    ]
  } as any


  // Variable
  // 0 + 1000*0.10 = 100

  // Static
  // 31.26 + 10.00 = 41.26

  // Total
  // 100 + 41.26 = 141.26