import { processOrderTableData } from '.';

describe('processOrderTableData', () => {

  const input = {
    line_items: [
      {
        description: "PH With Discount",
        internal_description: "PH With Discount",
        pricing_model: "per_unit",
        unit_amount: "10,00 €",
        unit_amount_currency: "EUR",
        unit_amount_decimal: "8",
        is_tax_inclusive: true,
        price_display_in_journeys: "show_price",
        active: true,
        variable_price: null,
        type: "one_time",
        billing_period: null,
        billing_duration_amount: null,
        billing_duration_unit: null,
        notice_time_amount: null,
        notice_time_unit: null,
        termination_time_amount: null,
        termination_time_unit: null,
        renewal_duration_amount: null,
        renewal_duration_unit: null,
        price_components: null,
        _tags: [],
        _schema: "price",
        _id: "d99e348e-8769-4612-afa6-baba0ed1a573",
        _org: "739224",
        _owners: [
          {
            org_id: "739224",
            user_id: "11000894"
          }
        ],
        _created_at: "2024-10-20T15:43:08.270Z",
        _updated_at: "2024-10-20T15:43:08.270Z",
        _title: "PH With Discount",
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
        },
        _relations: [
          {
            entity_id: "c3a1cbae-ad35-4b1f-bce7-10f8fbeacfd6",
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
          },
          {
            entity_id: "11ca8a7b-9759-4673-85cf-8477caa1e17d",
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
          },
          {
            entity_id: "13baa027-4916-487e-805c-09ba6356e85d",
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
          },
          {
            entity_id: "411d1a27-24b7-4748-a3cc-dff959fcbca1",
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
        _viewers: {},
        _coupons: [
          {
            name: "Autumn sale",
            type: "percentage",
            percentage_value: "20",
            fixed_value: 0,
            fixed_value_currency: "EUR",
            fixed_value_decimal: "0.00",
            active: true,
            prices: [
              {
                _id: "4ed29406-14dd-4b52-824e-5aa467308d42",
                description: "Charge Amps Dawn 22 kW Normal Price",
                internal_description: "Charge Amps Dawn 22 kW Normal Price",
                pricing_model: "per_unit",
                unit_amount: 10000,
                unit_amount_currency: "EUR",
                unit_amount_decimal: "100",
                is_tax_inclusive: false,
                price_display_in_journeys: "show_as_starting_price",
                active: true,
                variable_price: null,
                type: "one_time",
                billing_period: null,
                billing_duration_amount: null,
                billing_duration_unit: null,
                notice_time_amount: null,
                notice_time_unit: null,
                termination_time_amount: null,
                termination_time_unit: null,
                renewal_duration_amount: null,
                renewal_duration_unit: null,
                price_components: null,
                _tags: [],
                _schema: "price",
                _org: "739224",
                _owners: [
                  {
                    org_id: "739224",
                    user_id: "11000622"
                  }
                ],
                _created_at: "2024-09-11T15:50:44.148Z",
                _updated_at: "2024-10-04T11:45:29.908Z",
                _title: "Charge Amps Dawn 22 kW Normal Price",
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
                },
                tax: [
                  {
                    type: "VAT",
                    description: "Custom VAT 10%",
                    rate: "10",
                    active: true,
                    region: "DE",
                    _schema: "tax",
                    _id: "dce22931-ee0f-4d29-9273-efe66c8e1707",
                    _org: "739224",
                    _owners: [
                      {
                        org_id: "739224",
                        user_id: "11000913"
                      }
                    ],
                    _created_at: "2024-10-04T11:44:10.056Z",
                    _updated_at: "2024-10-04T11:44:10.056Z",
                    _title: "Custom VAT 10%",
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
                $relation: {
                  entity_id: "4ed29406-14dd-4b52-824e-5aa467308d42",
                  _tags: [],
                  _schema: "price"
                }
              },
              {
                _id: "d99e348e-8769-4612-afa6-baba0ed1a573",
                description: "PH With Discount",
                internal_description: "PH With Discount",
                pricing_model: "per_unit",
                unit_amount: 1000,
                unit_amount_currency: "EUR",
                unit_amount_decimal: "10.00",
                is_tax_inclusive: true,
                price_display_in_journeys: "show_price",
                active: true,
                variable_price: null,
                type: "one_time",
                billing_period: null,
                billing_duration_amount: null,
                billing_duration_unit: null,
                notice_time_amount: null,
                notice_time_unit: null,
                termination_time_amount: null,
                termination_time_unit: null,
                renewal_duration_amount: null,
                renewal_duration_unit: null,
                price_components: null,
                _tags: [],
                _schema: "price",
                _org: "739224",
                _owners: [
                  {
                    org_id: "739224",
                    user_id: "11000894"
                  }
                ],
                _created_at: "2024-10-20T15:43:08.270Z",
                _updated_at: "2024-10-20T15:43:08.270Z",
                _title: "PH With Discount",
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
                },
                $relation: {
                  entity_id: "d99e348e-8769-4612-afa6-baba0ed1a573",
                  _tags: [],
                  _schema: "price"
                }
              },
              {
                _id: "1ac662d0-a14f-4d0d-b85b-fd64fd30f508",
                _manifest: [
                  "ef9ca04c-e11f-4d00-8c70-c0de487c269e",
                  "42d37b24-a946-469d-af3d-da3279a1a710",
                  "31dadaf8-497d-427f-8630-5502dd3e6a8e"
                ],
                _schema: "price",
                _tags: [
                  "Breitband"
                ],
                active: true,
                billing_duration_unit: "months",
                description: "test 2",
                is_tax_inclusive: true,
                notice_time_unit: "months",
                price_display_in_journeys: "show_price",
                pricing_model: "per_unit",
                renewal_duration_unit: "months",
                tax: [
                  {
                    _manifest: [
                      "df12de4c-b99f-4048-b989-6cc86a498d65"
                    ],
                    _schema: "tax",
                    active: true,
                    description: "sales",
                    rate: "19",
                    region: "DE",
                    type: "VAT",
                    _id: "5bf667e2-e7f8-4bb0-a890-c55211456f70",
                    _org: "739224",
                    _owners: [
                      {
                        org_id: "739224",
                        user_id: "11000037"
                      }
                    ],
                    _created_at: "2024-11-13T14:15:33.590Z",
                    _updated_at: "2024-11-14T14:46:53.251Z",
                    _title: "sales",
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
                termination_time_unit: "months",
                tiers: [],
                type: "recurring",
                unit: "m",
                unit_amount: 10000,
                unit_amount_currency: "EUR",
                unit_amount_decimal: "100",
                variable_price: true,
                _purpose: [
                  "61926312-7910-409d-8762-77e86de4f838"
                ],
                _slug: "price",
                billing_duration_amount: "24",
                billing_period: "monthly",
                internal_description: "test 2",
                notice_time_amount: "3",
                price_components: null,
                renewal_duration_amount: "1",
                termination_time_amount: "3",
                _org: "739224",
                _owners: [
                  {
                    org_id: "739224",
                    user_id: "11000037"
                  }
                ],
                _created_at: "2024-11-13T14:15:34.034Z",
                _updated_at: "2024-11-14T12:33:10.722Z",
                _title: "test 2",
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
                },
                $relation: {
                  entity_id: "1ac662d0-a14f-4d0d-b85b-fd64fd30f508",
                  _tags: [],
                  _schema: "price"
                }
              },
              {
                _id: "667a518f-4b3c-4623-aab4-c63c7f2bdb97",
                pricing_model: "tiered_flatfee",
                unit_amount: 0,
                unit_amount_currency: "EUR",
                unit_amount_decimal: "0.00",
                is_tax_inclusive: true,
                price_display_in_journeys: "show_price",
                active: true,
                type: "recurring",
                billing_period: "monthly",
                billing_duration_unit: "years",
                notice_time_unit: "months",
                termination_time_unit: "months",
                renewal_duration_unit: "months",
                _tags: [],
                _slug: "price",
                _schema: "price",
                _owners: [
                  {
                    org_id: "739224",
                    user_id: "10009172"
                  }
                ],
                _title: "testest",
                description: "testest",
                variable_price: true,
                tiers: [
                  {
                    up_to: 90.555555,
                    unit_amount: 0,
                    unit_amount_decimal: "0",
                    flat_fee_amount: 10000,
                    flat_fee_amount_decimal: "100"
                  },
                  {
                    up_to: 300,
                    unit_amount: 0,
                    unit_amount_decimal: "0",
                    flat_fee_amount: 20000,
                    flat_fee_amount_decimal: "200",
                    display_mode: "on_request"
                  },
                  {
                    up_to: 600,
                    unit_amount: 0,
                    unit_amount_decimal: "0",
                    flat_fee_amount: 30000,
                    flat_fee_amount_decimal: "300",
                    display_mode: "on_request"
                  },
                  {
                    up_to: null,
                    unit_amount: 0,
                    unit_amount_decimal: "0",
                    flat_fee_amount: 50000,
                    flat_fee_amount_decimal: "500"
                  }
                ],
                _org: "739224",
                _created_at: "2023-05-29T16:01:53.679Z",
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
                },
                internal_description: "testest",
                billing_duration_amount: "3",
                _updated_at: "2024-10-23T10:42:52.545Z",
                $relation: {
                  entity_id: "667a518f-4b3c-4623-aab4-c63c7f2bdb97",
                  _tags: []
                }
              }
            ],
            _schema: "coupon",
            _id: "411d1a27-24b7-4748-a3cc-dff959fcbca1",
            _org: "739224",
            _owners: [
              {
                org_id: "739224",
                user_id: "11000622"
              }
            ],
            _created_at: "2024-09-11T20:34:31.419Z",
            _updated_at: "2024-11-29T15:24:00.314Z",
            _title: "Autumn sale",
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
            },
            category: "discount",
            description: "Test",
            cashback_period: "0",
            _relations: [
              {
                entity_id: "4ed29406-14dd-4b52-824e-5aa467308d42",
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
              },
              {
                entity_id: "667a518f-4b3c-4623-aab4-c63c7f2bdb97",
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
              },
              {
                entity_id: "d99e348e-8769-4612-afa6-baba0ed1a573",
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
              },
              {
                entity_id: "1ac662d0-a14f-4d0d-b85b-fd64fd30f508",
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
            _viewers: {}
          }
        ],
        blockMappingData: {},
        quantity: 1,
        _price: {
          description: "PH With Discount",
          internal_description: "PH With Discount",
          pricing_model: "per_unit",
          unit_amount: 1000,
          unit_amount_currency: "EUR",
          unit_amount_decimal: "10.00",
          is_tax_inclusive: true,
          price_display_in_journeys: "show_price",
          active: true,
          variable_price: null,
          type: "one_time",
          billing_period: null,
          billing_duration_amount: null,
          billing_duration_unit: null,
          notice_time_amount: null,
          notice_time_unit: null,
          termination_time_amount: null,
          termination_time_unit: null,
          renewal_duration_amount: null,
          renewal_duration_unit: null,
          price_components: null,
          _tags: [],
          _id: "d99e348e-8769-4612-afa6-baba0ed1a573",
          _title: "PH With Discount",
          _coupons: [
            {
              name: "Autumn sale",
              type: "percentage",
              percentage_value: "20",
              fixed_value: 0,
              fixed_value_currency: "EUR",
              fixed_value_decimal: "0.00",
              active: true,
              prices: [
                {
                  _id: "4ed29406-14dd-4b52-824e-5aa467308d42",
                  description: "Charge Amps Dawn 22 kW Normal Price",
                  internal_description: "Charge Amps Dawn 22 kW Normal Price",
                  pricing_model: "per_unit",
                  unit_amount: 10000,
                  unit_amount_currency: "EUR",
                  unit_amount_decimal: "100",
                  is_tax_inclusive: false,
                  price_display_in_journeys: "show_as_starting_price",
                  active: true,
                  variable_price: null,
                  type: "one_time",
                  billing_period: null,
                  billing_duration_amount: null,
                  billing_duration_unit: null,
                  notice_time_amount: null,
                  notice_time_unit: null,
                  termination_time_amount: null,
                  termination_time_unit: null,
                  renewal_duration_amount: null,
                  renewal_duration_unit: null,
                  price_components: null,
                  _tags: [],
                  _schema: "price",
                  _org: "739224",
                  _owners: [
                    {
                      org_id: "739224",
                      user_id: "11000622"
                    }
                  ],
                  _created_at: "2024-09-11T15:50:44.148Z",
                  _updated_at: "2024-10-04T11:45:29.908Z",
                  _title: "Charge Amps Dawn 22 kW Normal Price",
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
                  },
                  tax: [
                    {
                      type: "VAT",
                      description: "Custom VAT 10%",
                      rate: "10",
                      active: true,
                      region: "DE",
                      _schema: "tax",
                      _id: "dce22931-ee0f-4d29-9273-efe66c8e1707",
                      _org: "739224",
                      _owners: [
                        {
                          org_id: "739224",
                          user_id: "11000913"
                        }
                      ],
                      _created_at: "2024-10-04T11:44:10.056Z",
                      _updated_at: "2024-10-04T11:44:10.056Z",
                      _title: "Custom VAT 10%",
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
                  $relation: {
                    entity_id: "4ed29406-14dd-4b52-824e-5aa467308d42",
                    _tags: [],
                    _schema: "price"
                  }
                },
                {
                  _id: "d99e348e-8769-4612-afa6-baba0ed1a573",
                  description: "PH With Discount",
                  internal_description: "PH With Discount",
                  pricing_model: "per_unit",
                  unit_amount: 1000,
                  unit_amount_currency: "EUR",
                  unit_amount_decimal: "10.00",
                  is_tax_inclusive: true,
                  price_display_in_journeys: "show_price",
                  active: true,
                  variable_price: null,
                  type: "one_time",
                  billing_period: null,
                  billing_duration_amount: null,
                  billing_duration_unit: null,
                  notice_time_amount: null,
                  notice_time_unit: null,
                  termination_time_amount: null,
                  termination_time_unit: null,
                  renewal_duration_amount: null,
                  renewal_duration_unit: null,
                  price_components: null,
                  _tags: [],
                  _schema: "price",
                  _org: "739224",
                  _owners: [
                    {
                      org_id: "739224",
                      user_id: "11000894"
                    }
                  ],
                  _created_at: "2024-10-20T15:43:08.270Z",
                  _updated_at: "2024-10-20T15:43:08.270Z",
                  _title: "PH With Discount",
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
                  },
                  $relation: {
                    entity_id: "d99e348e-8769-4612-afa6-baba0ed1a573",
                    _tags: [],
                    _schema: "price"
                  }
                },
                {
                  _id: "1ac662d0-a14f-4d0d-b85b-fd64fd30f508",
                  _manifest: [
                    "ef9ca04c-e11f-4d00-8c70-c0de487c269e",
                    "42d37b24-a946-469d-af3d-da3279a1a710",
                    "31dadaf8-497d-427f-8630-5502dd3e6a8e"
                  ],
                  _schema: "price",
                  _tags: [
                    "Breitband"
                  ],
                  active: true,
                  billing_duration_unit: "months",
                  description: "test 2",
                  is_tax_inclusive: true,
                  notice_time_unit: "months",
                  price_display_in_journeys: "show_price",
                  pricing_model: "per_unit",
                  renewal_duration_unit: "months",
                  tax: [
                    {
                      _manifest: [
                        "df12de4c-b99f-4048-b989-6cc86a498d65"
                      ],
                      _schema: "tax",
                      active: true,
                      description: "sales",
                      rate: "19",
                      region: "DE",
                      type: "VAT",
                      _id: "5bf667e2-e7f8-4bb0-a890-c55211456f70",
                      _org: "739224",
                      _owners: [
                        {
                          org_id: "739224",
                          user_id: "11000037"
                        }
                      ],
                      _created_at: "2024-11-13T14:15:33.590Z",
                      _updated_at: "2024-11-14T14:46:53.251Z",
                      _title: "sales",
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
                  termination_time_unit: "months",
                  tiers: [],
                  type: "recurring",
                  unit: "m",
                  unit_amount: 10000,
                  unit_amount_currency: "EUR",
                  unit_amount_decimal: "100",
                  variable_price: true,
                  _purpose: [
                    "61926312-7910-409d-8762-77e86de4f838"
                  ],
                  _slug: "price",
                  billing_duration_amount: "24",
                  billing_period: "monthly",
                  internal_description: "test 2",
                  notice_time_amount: "3",
                  price_components: null,
                  renewal_duration_amount: "1",
                  termination_time_amount: "3",
                  _org: "739224",
                  _owners: [
                    {
                      org_id: "739224",
                      user_id: "11000037"
                    }
                  ],
                  _created_at: "2024-11-13T14:15:34.034Z",
                  _updated_at: "2024-11-14T12:33:10.722Z",
                  _title: "test 2",
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
                  },
                  $relation: {
                    entity_id: "1ac662d0-a14f-4d0d-b85b-fd64fd30f508",
                    _tags: [],
                    _schema: "price"
                  }
                },
                {
                  _id: "667a518f-4b3c-4623-aab4-c63c7f2bdb97",
                  pricing_model: "tiered_flatfee",
                  unit_amount: 0,
                  unit_amount_currency: "EUR",
                  unit_amount_decimal: "0.00",
                  is_tax_inclusive: true,
                  price_display_in_journeys: "show_price",
                  active: true,
                  type: "recurring",
                  billing_period: "monthly",
                  billing_duration_unit: "years",
                  notice_time_unit: "months",
                  termination_time_unit: "months",
                  renewal_duration_unit: "months",
                  _tags: [],
                  _slug: "price",
                  _schema: "price",
                  _owners: [
                    {
                      org_id: "739224",
                      user_id: "10009172"
                    }
                  ],
                  _title: "testest",
                  description: "testest",
                  variable_price: true,
                  tiers: [
                    {
                      up_to: 90.555555,
                      unit_amount: 0,
                      unit_amount_decimal: "0",
                      flat_fee_amount: 10000,
                      flat_fee_amount_decimal: "100"
                    },
                    {
                      up_to: 300,
                      unit_amount: 0,
                      unit_amount_decimal: "0",
                      flat_fee_amount: 20000,
                      flat_fee_amount_decimal: "200",
                      display_mode: "on_request"
                    },
                    {
                      up_to: 600,
                      unit_amount: 0,
                      unit_amount_decimal: "0",
                      flat_fee_amount: 30000,
                      flat_fee_amount_decimal: "300",
                      display_mode: "on_request"
                    },
                    {
                      up_to: null,
                      unit_amount: 0,
                      unit_amount_decimal: "0",
                      flat_fee_amount: 50000,
                      flat_fee_amount_decimal: "500"
                    }
                  ],
                  _org: "739224",
                  _created_at: "2023-05-29T16:01:53.679Z",
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
                  },
                  internal_description: "testest",
                  billing_duration_amount: "3",
                  _updated_at: "2024-10-23T10:42:52.545Z",
                  $relation: {
                    entity_id: "667a518f-4b3c-4623-aab4-c63c7f2bdb97",
                    _tags: []
                  }
                }
              ],
              _schema: "coupon",
              _id: "411d1a27-24b7-4748-a3cc-dff959fcbca1",
              _org: "739224",
              _owners: [
                {
                  org_id: "739224",
                  user_id: "11000622"
                }
              ],
              _created_at: "2024-09-11T20:34:31.419Z",
              _updated_at: "2024-11-29T15:24:00.314Z",
              _title: "Autumn sale",
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
              },
              category: "discount",
              description: "Test",
              cashback_period: "0",
              _relations: [
                {
                  entity_id: "4ed29406-14dd-4b52-824e-5aa467308d42",
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
                },
                {
                  entity_id: "667a518f-4b3c-4623-aab4-c63c7f2bdb97",
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
                },
                {
                  entity_id: "d99e348e-8769-4612-afa6-baba0ed1a573",
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
                },
                {
                  entity_id: "1ac662d0-a14f-4d0d-b85b-fd64fd30f508",
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
              _viewers: {}
            }
          ],
          blockMappingData: {}
        },
        _product: {
          name: "PH With Discount",
          internal_name: "PH With Discount",
          type: "product",
          active: true,
          _id: "c3a1cbae-ad35-4b1f-bce7-10f8fbeacfd6",
          _title: "PH With Discount"
        },
        blockConfiguration: {
          isRequired: true,
          showQuantity: false,
          blockPath: "2/Products/ProductSelectionControl"
        },
        unit_amount_net: "10,00 €",
        unit_amount_gross: 800,
        amount_subtotal: "8,00 €",
        amount_total: "10,00 €",
        amount_tax: "0,00 €",
        unit_discount_amount: 200,
        before_discount_unit_amount: 1000,
        before_discount_unit_amount_gross: 1000,
        before_discount_unit_amount_net: 1000,
        unit_discount_amount_net: 200,
        tax_discount_amount: 0,
        before_discount_tax_amount: 0,
        discount_amount: 200,
        discount_amount_net: 200,
        discount_percentage: 20,
        before_discount_amount_total: 1000,
        currency: "EUR",
        taxes: [
          {
            rate: "nontaxable",
            rateValue: 0,
            amount: 0
          }
        ],
        before_discount_unit_amount_decimal: "10",
        before_discount_unit_amount_gross_decimal: "10",
        before_discount_unit_amount_net_decimal: "10",
        unit_discount_amount_decimal: "2",
        unit_amount_net_decimal: "8",
        unit_discount_amount_net_decimal: "2",
        unit_amount_gross_decimal: "8",
        amount_subtotal_decimal: "8",
        amount_total_decimal: "8",
        discount_amount_decimal: "2",
        before_discount_amount_total_decimal: "10",
        tax_discount_amount_decimal: "0",
        discount_amount_net_decimal: "2",
        before_discount_tax_amount_decimal: "0",
        _position: "1.&nbsp;&nbsp;"
      },
      {
        description: "PH With Discount",
        internal_description: "PH With Discount",
        pricing_model: "per_unit",
        unit_amount: "-2,00 €",
        unit_amount_currency: "EUR",
        unit_amount_decimal: "8",
        is_tax_inclusive: true,
        price_display_in_journeys: "show_price",
        active: true,
        variable_price: null,
        type: "one_time",
        billing_period: null,
        billing_duration_amount: null,
        billing_duration_unit: null,
        notice_time_amount: null,
        notice_time_unit: null,
        termination_time_amount: null,
        termination_time_unit: null,
        renewal_duration_amount: null,
        renewal_duration_unit: null,
        price_components: null,
        _tags: [],
        _schema: "price",
        _id: "d99e348e-8769-4612-afa6-baba0ed1a573",
        _org: "739224",
        _owners: [
          {
            org_id: "739224",
            user_id: "11000894"
          }
        ],
        _created_at: "2024-10-20T15:43:08.270Z",
        _updated_at: "2024-10-20T15:43:08.270Z",
        _title: "PH With Discount",
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
        },
        _relations: [
          {
            entity_id: "c3a1cbae-ad35-4b1f-bce7-10f8fbeacfd6",
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
          },
          {
            entity_id: "11ca8a7b-9759-4673-85cf-8477caa1e17d",
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
          },
          {
            entity_id: "13baa027-4916-487e-805c-09ba6356e85d",
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
          },
          {
            entity_id: "411d1a27-24b7-4748-a3cc-dff959fcbca1",
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
        _viewers: {},
        _coupons: [
          {
            name: "Autumn sale",
            type: "percentage",
            percentage_value: "20",
            fixed_value: 0,
            fixed_value_currency: "EUR",
            fixed_value_decimal: "0.00",
            active: true,
            prices: [
              {
                _id: "4ed29406-14dd-4b52-824e-5aa467308d42",
                description: "Charge Amps Dawn 22 kW Normal Price",
                internal_description: "Charge Amps Dawn 22 kW Normal Price",
                pricing_model: "per_unit",
                unit_amount: 10000,
                unit_amount_currency: "EUR",
                unit_amount_decimal: "100",
                is_tax_inclusive: false,
                price_display_in_journeys: "show_as_starting_price",
                active: true,
                variable_price: null,
                type: "one_time",
                billing_period: null,
                billing_duration_amount: null,
                billing_duration_unit: null,
                notice_time_amount: null,
                notice_time_unit: null,
                termination_time_amount: null,
                termination_time_unit: null,
                renewal_duration_amount: null,
                renewal_duration_unit: null,
                price_components: null,
                _tags: [],
                _schema: "price",
                _org: "739224",
                _owners: [
                  {
                    org_id: "739224",
                    user_id: "11000622"
                  }
                ],
                _created_at: "2024-09-11T15:50:44.148Z",
                _updated_at: "2024-10-04T11:45:29.908Z",
                _title: "Charge Amps Dawn 22 kW Normal Price",
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
                },
                tax: [
                  {
                    type: "VAT",
                    description: "Custom VAT 10%",
                    rate: "10",
                    active: true,
                    region: "DE",
                    _schema: "tax",
                    _id: "dce22931-ee0f-4d29-9273-efe66c8e1707",
                    _org: "739224",
                    _owners: [
                      {
                        org_id: "739224",
                        user_id: "11000913"
                      }
                    ],
                    _created_at: "2024-10-04T11:44:10.056Z",
                    _updated_at: "2024-10-04T11:44:10.056Z",
                    _title: "Custom VAT 10%",
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
                $relation: {
                  entity_id: "4ed29406-14dd-4b52-824e-5aa467308d42",
                  _tags: [],
                  _schema: "price"
                }
              },
              {
                _id: "d99e348e-8769-4612-afa6-baba0ed1a573",
                description: "PH With Discount",
                internal_description: "PH With Discount",
                pricing_model: "per_unit",
                unit_amount: 1000,
                unit_amount_currency: "EUR",
                unit_amount_decimal: "10.00",
                is_tax_inclusive: true,
                price_display_in_journeys: "show_price",
                active: true,
                variable_price: null,
                type: "one_time",
                billing_period: null,
                billing_duration_amount: null,
                billing_duration_unit: null,
                notice_time_amount: null,
                notice_time_unit: null,
                termination_time_amount: null,
                termination_time_unit: null,
                renewal_duration_amount: null,
                renewal_duration_unit: null,
                price_components: null,
                _tags: [],
                _schema: "price",
                _org: "739224",
                _owners: [
                  {
                    org_id: "739224",
                    user_id: "11000894"
                  }
                ],
                _created_at: "2024-10-20T15:43:08.270Z",
                _updated_at: "2024-10-20T15:43:08.270Z",
                _title: "PH With Discount",
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
                },
                $relation: {
                  entity_id: "d99e348e-8769-4612-afa6-baba0ed1a573",
                  _tags: [],
                  _schema: "price"
                }
              },
              {
                _id: "1ac662d0-a14f-4d0d-b85b-fd64fd30f508",
                _manifest: [
                  "ef9ca04c-e11f-4d00-8c70-c0de487c269e",
                  "42d37b24-a946-469d-af3d-da3279a1a710",
                  "31dadaf8-497d-427f-8630-5502dd3e6a8e"
                ],
                _schema: "price",
                _tags: [
                  "Breitband"
                ],
                active: true,
                billing_duration_unit: "months",
                description: "test 2",
                is_tax_inclusive: true,
                notice_time_unit: "months",
                price_display_in_journeys: "show_price",
                pricing_model: "per_unit",
                renewal_duration_unit: "months",
                tax: [
                  {
                    _manifest: [
                      "df12de4c-b99f-4048-b989-6cc86a498d65"
                    ],
                    _schema: "tax",
                    active: true,
                    description: "sales",
                    rate: "19",
                    region: "DE",
                    type: "VAT",
                    _id: "5bf667e2-e7f8-4bb0-a890-c55211456f70",
                    _org: "739224",
                    _owners: [
                      {
                        org_id: "739224",
                        user_id: "11000037"
                      }
                    ],
                    _created_at: "2024-11-13T14:15:33.590Z",
                    _updated_at: "2024-11-14T14:46:53.251Z",
                    _title: "sales",
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
                termination_time_unit: "months",
                tiers: [],
                type: "recurring",
                unit: "m",
                unit_amount: 10000,
                unit_amount_currency: "EUR",
                unit_amount_decimal: "100",
                variable_price: true,
                _purpose: [
                  "61926312-7910-409d-8762-77e86de4f838"
                ],
                _slug: "price",
                billing_duration_amount: "24",
                billing_period: "monthly",
                internal_description: "test 2",
                notice_time_amount: "3",
                price_components: null,
                renewal_duration_amount: "1",
                termination_time_amount: "3",
                _org: "739224",
                _owners: [
                  {
                    org_id: "739224",
                    user_id: "11000037"
                  }
                ],
                _created_at: "2024-11-13T14:15:34.034Z",
                _updated_at: "2024-11-14T12:33:10.722Z",
                _title: "test 2",
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
                },
                $relation: {
                  entity_id: "1ac662d0-a14f-4d0d-b85b-fd64fd30f508",
                  _tags: [],
                  _schema: "price"
                }
              },
              {
                _id: "667a518f-4b3c-4623-aab4-c63c7f2bdb97",
                pricing_model: "tiered_flatfee",
                unit_amount: 0,
                unit_amount_currency: "EUR",
                unit_amount_decimal: "0.00",
                is_tax_inclusive: true,
                price_display_in_journeys: "show_price",
                active: true,
                type: "recurring",
                billing_period: "monthly",
                billing_duration_unit: "years",
                notice_time_unit: "months",
                termination_time_unit: "months",
                renewal_duration_unit: "months",
                _tags: [],
                _slug: "price",
                _schema: "price",
                _owners: [
                  {
                    org_id: "739224",
                    user_id: "10009172"
                  }
                ],
                _title: "testest",
                description: "testest",
                variable_price: true,
                tiers: [
                  {
                    up_to: 90.555555,
                    unit_amount: 0,
                    unit_amount_decimal: "0",
                    flat_fee_amount: 10000,
                    flat_fee_amount_decimal: "100"
                  },
                  {
                    up_to: 300,
                    unit_amount: 0,
                    unit_amount_decimal: "0",
                    flat_fee_amount: 20000,
                    flat_fee_amount_decimal: "200",
                    display_mode: "on_request"
                  },
                  {
                    up_to: 600,
                    unit_amount: 0,
                    unit_amount_decimal: "0",
                    flat_fee_amount: 30000,
                    flat_fee_amount_decimal: "300",
                    display_mode: "on_request"
                  },
                  {
                    up_to: null,
                    unit_amount: 0,
                    unit_amount_decimal: "0",
                    flat_fee_amount: 50000,
                    flat_fee_amount_decimal: "500"
                  }
                ],
                _org: "739224",
                _created_at: "2023-05-29T16:01:53.679Z",
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
                },
                internal_description: "testest",
                billing_duration_amount: "3",
                _updated_at: "2024-10-23T10:42:52.545Z",
                $relation: {
                  entity_id: "667a518f-4b3c-4623-aab4-c63c7f2bdb97",
                  _tags: []
                }
              }
            ],
            _schema: "coupon",
            _id: "411d1a27-24b7-4748-a3cc-dff959fcbca1",
            _org: "739224",
            _owners: [
              {
                org_id: "739224",
                user_id: "11000622"
              }
            ],
            _created_at: "2024-09-11T20:34:31.419Z",
            _updated_at: "2024-11-29T15:24:00.314Z",
            _title: "Autumn sale",
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
            },
            category: "discount",
            description: "Test",
            cashback_period: "0",
            _relations: [
              {
                entity_id: "4ed29406-14dd-4b52-824e-5aa467308d42",
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
              },
              {
                entity_id: "667a518f-4b3c-4623-aab4-c63c7f2bdb97",
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
              },
              {
                entity_id: "d99e348e-8769-4612-afa6-baba0ed1a573",
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
              },
              {
                entity_id: "1ac662d0-a14f-4d0d-b85b-fd64fd30f508",
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
            _viewers: {}
          }
        ],
        blockMappingData: {},
        quantity: 1,
        _price: {
          description: "PH With Discount",
          internal_description: "PH With Discount",
          pricing_model: "per_unit",
          unit_amount: 1000,
          unit_amount_currency: "EUR",
          unit_amount_decimal: "10.00",
          is_tax_inclusive: true,
          price_display_in_journeys: "show_price",
          active: true,
          variable_price: null,
          type: "one_time",
          billing_period: null,
          billing_duration_amount: null,
          billing_duration_unit: null,
          notice_time_amount: null,
          notice_time_unit: null,
          termination_time_amount: null,
          termination_time_unit: null,
          renewal_duration_amount: null,
          renewal_duration_unit: null,
          price_components: null,
          _tags: [],
          _id: "d99e348e-8769-4612-afa6-baba0ed1a573",
          _title: "PH With Discount",
          _coupons: [
            {
              name: "Autumn sale",
              type: "percentage",
              percentage_value: "20",
              fixed_value: 0,
              fixed_value_currency: "EUR",
              fixed_value_decimal: "0.00",
              active: true,
              prices: [
                {
                  _id: "4ed29406-14dd-4b52-824e-5aa467308d42",
                  description: "Charge Amps Dawn 22 kW Normal Price",
                  internal_description: "Charge Amps Dawn 22 kW Normal Price",
                  pricing_model: "per_unit",
                  unit_amount: 10000,
                  unit_amount_currency: "EUR",
                  unit_amount_decimal: "100",
                  is_tax_inclusive: false,
                  price_display_in_journeys: "show_as_starting_price",
                  active: true,
                  variable_price: null,
                  type: "one_time",
                  billing_period: null,
                  billing_duration_amount: null,
                  billing_duration_unit: null,
                  notice_time_amount: null,
                  notice_time_unit: null,
                  termination_time_amount: null,
                  termination_time_unit: null,
                  renewal_duration_amount: null,
                  renewal_duration_unit: null,
                  price_components: null,
                  _tags: [],
                  _schema: "price",
                  _org: "739224",
                  _owners: [
                    {
                      org_id: "739224",
                      user_id: "11000622"
                    }
                  ],
                  _created_at: "2024-09-11T15:50:44.148Z",
                  _updated_at: "2024-10-04T11:45:29.908Z",
                  _title: "Charge Amps Dawn 22 kW Normal Price",
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
                  },
                  tax: [
                    {
                      type: "VAT",
                      description: "Custom VAT 10%",
                      rate: "10",
                      active: true,
                      region: "DE",
                      _schema: "tax",
                      _id: "dce22931-ee0f-4d29-9273-efe66c8e1707",
                      _org: "739224",
                      _owners: [
                        {
                          org_id: "739224",
                          user_id: "11000913"
                        }
                      ],
                      _created_at: "2024-10-04T11:44:10.056Z",
                      _updated_at: "2024-10-04T11:44:10.056Z",
                      _title: "Custom VAT 10%",
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
                  $relation: {
                    entity_id: "4ed29406-14dd-4b52-824e-5aa467308d42",
                    _tags: [],
                    _schema: "price"
                  }
                },
                {
                  _id: "d99e348e-8769-4612-afa6-baba0ed1a573",
                  description: "PH With Discount",
                  internal_description: "PH With Discount",
                  pricing_model: "per_unit",
                  unit_amount: 1000,
                  unit_amount_currency: "EUR",
                  unit_amount_decimal: "10.00",
                  is_tax_inclusive: true,
                  price_display_in_journeys: "show_price",
                  active: true,
                  variable_price: null,
                  type: "one_time",
                  billing_period: null,
                  billing_duration_amount: null,
                  billing_duration_unit: null,
                  notice_time_amount: null,
                  notice_time_unit: null,
                  termination_time_amount: null,
                  termination_time_unit: null,
                  renewal_duration_amount: null,
                  renewal_duration_unit: null,
                  price_components: null,
                  _tags: [],
                  _schema: "price",
                  _org: "739224",
                  _owners: [
                    {
                      org_id: "739224",
                      user_id: "11000894"
                    }
                  ],
                  _created_at: "2024-10-20T15:43:08.270Z",
                  _updated_at: "2024-10-20T15:43:08.270Z",
                  _title: "PH With Discount",
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
                  },
                  $relation: {
                    entity_id: "d99e348e-8769-4612-afa6-baba0ed1a573",
                    _tags: [],
                    _schema: "price"
                  }
                },
                {
                  _id: "1ac662d0-a14f-4d0d-b85b-fd64fd30f508",
                  _manifest: [
                    "ef9ca04c-e11f-4d00-8c70-c0de487c269e",
                    "42d37b24-a946-469d-af3d-da3279a1a710",
                    "31dadaf8-497d-427f-8630-5502dd3e6a8e"
                  ],
                  _schema: "price",
                  _tags: [
                    "Breitband"
                  ],
                  active: true,
                  billing_duration_unit: "months",
                  description: "test 2",
                  is_tax_inclusive: true,
                  notice_time_unit: "months",
                  price_display_in_journeys: "show_price",
                  pricing_model: "per_unit",
                  renewal_duration_unit: "months",
                  tax: [
                    {
                      _manifest: [
                        "df12de4c-b99f-4048-b989-6cc86a498d65"
                      ],
                      _schema: "tax",
                      active: true,
                      description: "sales",
                      rate: "19",
                      region: "DE",
                      type: "VAT",
                      _id: "5bf667e2-e7f8-4bb0-a890-c55211456f70",
                      _org: "739224",
                      _owners: [
                        {
                          org_id: "739224",
                          user_id: "11000037"
                        }
                      ],
                      _created_at: "2024-11-13T14:15:33.590Z",
                      _updated_at: "2024-11-14T14:46:53.251Z",
                      _title: "sales",
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
                  termination_time_unit: "months",
                  tiers: [],
                  type: "recurring",
                  unit: "m",
                  unit_amount: 10000,
                  unit_amount_currency: "EUR",
                  unit_amount_decimal: "100",
                  variable_price: true,
                  _purpose: [
                    "61926312-7910-409d-8762-77e86de4f838"
                  ],
                  _slug: "price",
                  billing_duration_amount: "24",
                  billing_period: "monthly",
                  internal_description: "test 2",
                  notice_time_amount: "3",
                  price_components: null,
                  renewal_duration_amount: "1",
                  termination_time_amount: "3",
                  _org: "739224",
                  _owners: [
                    {
                      org_id: "739224",
                      user_id: "11000037"
                    }
                  ],
                  _created_at: "2024-11-13T14:15:34.034Z",
                  _updated_at: "2024-11-14T12:33:10.722Z",
                  _title: "test 2",
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
                  },
                  $relation: {
                    entity_id: "1ac662d0-a14f-4d0d-b85b-fd64fd30f508",
                    _tags: [],
                    _schema: "price"
                  }
                },
                {
                  _id: "667a518f-4b3c-4623-aab4-c63c7f2bdb97",
                  pricing_model: "tiered_flatfee",
                  unit_amount: 0,
                  unit_amount_currency: "EUR",
                  unit_amount_decimal: "0.00",
                  is_tax_inclusive: true,
                  price_display_in_journeys: "show_price",
                  active: true,
                  type: "recurring",
                  billing_period: "monthly",
                  billing_duration_unit: "years",
                  notice_time_unit: "months",
                  termination_time_unit: "months",
                  renewal_duration_unit: "months",
                  _tags: [],
                  _slug: "price",
                  _schema: "price",
                  _owners: [
                    {
                      org_id: "739224",
                      user_id: "10009172"
                    }
                  ],
                  _title: "testest",
                  description: "testest",
                  variable_price: true,
                  tiers: [
                    {
                      up_to: 90.555555,
                      unit_amount: 0,
                      unit_amount_decimal: "0",
                      flat_fee_amount: 10000,
                      flat_fee_amount_decimal: "100"
                    },
                    {
                      up_to: 300,
                      unit_amount: 0,
                      unit_amount_decimal: "0",
                      flat_fee_amount: 20000,
                      flat_fee_amount_decimal: "200",
                      display_mode: "on_request"
                    },
                    {
                      up_to: 600,
                      unit_amount: 0,
                      unit_amount_decimal: "0",
                      flat_fee_amount: 30000,
                      flat_fee_amount_decimal: "300",
                      display_mode: "on_request"
                    },
                    {
                      up_to: null,
                      unit_amount: 0,
                      unit_amount_decimal: "0",
                      flat_fee_amount: 50000,
                      flat_fee_amount_decimal: "500"
                    }
                  ],
                  _org: "739224",
                  _created_at: "2023-05-29T16:01:53.679Z",
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
                  },
                  internal_description: "testest",
                  billing_duration_amount: "3",
                  _updated_at: "2024-10-23T10:42:52.545Z",
                  $relation: {
                    entity_id: "667a518f-4b3c-4623-aab4-c63c7f2bdb97",
                    _tags: []
                  }
                }
              ],
              _schema: "coupon",
              _id: "411d1a27-24b7-4748-a3cc-dff959fcbca1",
              _org: "739224",
              _owners: [
                {
                  org_id: "739224",
                  user_id: "11000622"
                }
              ],
              _created_at: "2024-09-11T20:34:31.419Z",
              _updated_at: "2024-11-29T15:24:00.314Z",
              _title: "Autumn sale",
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
              },
              category: "discount",
              description: "Test",
              cashback_period: "0",
              _relations: [
                {
                  entity_id: "4ed29406-14dd-4b52-824e-5aa467308d42",
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
                },
                {
                  entity_id: "667a518f-4b3c-4623-aab4-c63c7f2bdb97",
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
                },
                {
                  entity_id: "d99e348e-8769-4612-afa6-baba0ed1a573",
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
                },
                {
                  entity_id: "1ac662d0-a14f-4d0d-b85b-fd64fd30f508",
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
              _viewers: {}
            }
          ],
          blockMappingData: {}
        },
        _product: {
          name: "PH With Discount",
          internal_name: "PH With Discount",
          type: "product",
          active: true,
          _id: "c3a1cbae-ad35-4b1f-bce7-10f8fbeacfd6",
          _title: "PH With Discount"
        },
        blockConfiguration: {
          isRequired: true,
          showQuantity: false,
          blockPath: "2/Products/ProductSelectionControl"
        },
        unit_amount_net: "-2,00 €",
        unit_amount_gross: 800,
        amount_subtotal: "0,00 €",
        amount_total: "-2,00 €",
        amount_tax: "0,00 €",
        unit_discount_amount: 200,
        before_discount_unit_amount: 1000,
        before_discount_unit_amount_gross: 1000,
        before_discount_unit_amount_net: 1000,
        unit_discount_amount_net: 200,
        tax_discount_amount: 0,
        before_discount_tax_amount: 0,
        discount_amount: 200,
        discount_amount_net: 200,
        discount_percentage: 20,
        before_discount_amount_total: 1000,
        currency: "EUR",
        taxes: [
          {
            rate: "nontaxable",
            rateValue: 0,
            amount: 0
          }
        ],
        before_discount_unit_amount_decimal: "10",
        before_discount_unit_amount_gross_decimal: "10",
        before_discount_unit_amount_net_decimal: "10",
        unit_discount_amount_decimal: "2",
        unit_amount_net_decimal: "8",
        unit_discount_amount_net_decimal: "2",
        unit_amount_gross_decimal: "8",
        amount_subtotal_decimal: "8",
        amount_total_decimal: "8",
        discount_amount_decimal: "2",
        before_discount_amount_total_decimal: "10",
        tax_discount_amount_decimal: "0",
        discount_amount_net_decimal: "2",
        before_discount_tax_amount_decimal: "0",
        _position: "1.&nbsp;&nbsp;",
        coupon: {
          name: "Autumn sale",
          type: "percentage",
          percentage_value: "20",
          fixed_value: 0,
          fixed_value_currency: "EUR",
          fixed_value_decimal: "0.00",
          active: true,
          prices: [
            {
              _id: "4ed29406-14dd-4b52-824e-5aa467308d42",
              description: "Charge Amps Dawn 22 kW Normal Price",
              internal_description: "Charge Amps Dawn 22 kW Normal Price",
              pricing_model: "per_unit",
              unit_amount: 10000,
              unit_amount_currency: "EUR",
              unit_amount_decimal: "100",
              is_tax_inclusive: false,
              price_display_in_journeys: "show_as_starting_price",
              active: true,
              variable_price: null,
              type: "one_time",
              billing_period: null,
              billing_duration_amount: null,
              billing_duration_unit: null,
              notice_time_amount: null,
              notice_time_unit: null,
              termination_time_amount: null,
              termination_time_unit: null,
              renewal_duration_amount: null,
              renewal_duration_unit: null,
              price_components: null,
              _tags: [],
              _schema: "price",
              _org: "739224",
              _owners: [
                {
                  org_id: "739224",
                  user_id: "11000622"
                }
              ],
              _created_at: "2024-09-11T15:50:44.148Z",
              _updated_at: "2024-10-04T11:45:29.908Z",
              _title: "Charge Amps Dawn 22 kW Normal Price",
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
              },
              tax: [
                {
                  type: "VAT",
                  description: "Custom VAT 10%",
                  rate: "10",
                  active: true,
                  region: "DE",
                  _schema: "tax",
                  _id: "dce22931-ee0f-4d29-9273-efe66c8e1707",
                  _org: "739224",
                  _owners: [
                    {
                      org_id: "739224",
                      user_id: "11000913"
                    }
                  ],
                  _created_at: "2024-10-04T11:44:10.056Z",
                  _updated_at: "2024-10-04T11:44:10.056Z",
                  _title: "Custom VAT 10%",
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
              $relation: {
                entity_id: "4ed29406-14dd-4b52-824e-5aa467308d42",
                _tags: [],
                _schema: "price"
              }
            },
            {
              _id: "d99e348e-8769-4612-afa6-baba0ed1a573",
              description: "PH With Discount",
              internal_description: "PH With Discount",
              pricing_model: "per_unit",
              unit_amount: 1000,
              unit_amount_currency: "EUR",
              unit_amount_decimal: "10.00",
              is_tax_inclusive: true,
              price_display_in_journeys: "show_price",
              active: true,
              variable_price: null,
              type: "one_time",
              billing_period: null,
              billing_duration_amount: null,
              billing_duration_unit: null,
              notice_time_amount: null,
              notice_time_unit: null,
              termination_time_amount: null,
              termination_time_unit: null,
              renewal_duration_amount: null,
              renewal_duration_unit: null,
              price_components: null,
              _tags: [],
              _schema: "price",
              _org: "739224",
              _owners: [
                {
                  org_id: "739224",
                  user_id: "11000894"
                }
              ],
              _created_at: "2024-10-20T15:43:08.270Z",
              _updated_at: "2024-10-20T15:43:08.270Z",
              _title: "PH With Discount",
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
              },
              $relation: {
                entity_id: "d99e348e-8769-4612-afa6-baba0ed1a573",
                _tags: [],
                _schema: "price"
              }
            },
            {
              _id: "1ac662d0-a14f-4d0d-b85b-fd64fd30f508",
              _manifest: [
                "ef9ca04c-e11f-4d00-8c70-c0de487c269e",
                "42d37b24-a946-469d-af3d-da3279a1a710",
                "31dadaf8-497d-427f-8630-5502dd3e6a8e"
              ],
              _schema: "price",
              _tags: [
                "Breitband"
              ],
              active: true,
              billing_duration_unit: "months",
              description: "test 2",
              is_tax_inclusive: true,
              notice_time_unit: "months",
              price_display_in_journeys: "show_price",
              pricing_model: "per_unit",
              renewal_duration_unit: "months",
              tax: [
                {
                  _manifest: [
                    "df12de4c-b99f-4048-b989-6cc86a498d65"
                  ],
                  _schema: "tax",
                  active: true,
                  description: "sales",
                  rate: "19",
                  region: "DE",
                  type: "VAT",
                  _id: "5bf667e2-e7f8-4bb0-a890-c55211456f70",
                  _org: "739224",
                  _owners: [
                    {
                      org_id: "739224",
                      user_id: "11000037"
                    }
                  ],
                  _created_at: "2024-11-13T14:15:33.590Z",
                  _updated_at: "2024-11-14T14:46:53.251Z",
                  _title: "sales",
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
              termination_time_unit: "months",
              tiers: [],
              type: "recurring",
              unit: "m",
              unit_amount: 10000,
              unit_amount_currency: "EUR",
              unit_amount_decimal: "100",
              variable_price: true,
              _purpose: [
                "61926312-7910-409d-8762-77e86de4f838"
              ],
              _slug: "price",
              billing_duration_amount: "24",
              billing_period: "monthly",
              internal_description: "test 2",
              notice_time_amount: "3",
              price_components: null,
              renewal_duration_amount: "1",
              termination_time_amount: "3",
              _org: "739224",
              _owners: [
                {
                  org_id: "739224",
                  user_id: "11000037"
                }
              ],
              _created_at: "2024-11-13T14:15:34.034Z",
              _updated_at: "2024-11-14T12:33:10.722Z",
              _title: "test 2",
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
              },
              $relation: {
                entity_id: "1ac662d0-a14f-4d0d-b85b-fd64fd30f508",
                _tags: [],
                _schema: "price"
              }
            },
            {
              _id: "667a518f-4b3c-4623-aab4-c63c7f2bdb97",
              pricing_model: "tiered_flatfee",
              unit_amount: 0,
              unit_amount_currency: "EUR",
              unit_amount_decimal: "0.00",
              is_tax_inclusive: true,
              price_display_in_journeys: "show_price",
              active: true,
              type: "recurring",
              billing_period: "monthly",
              billing_duration_unit: "years",
              notice_time_unit: "months",
              termination_time_unit: "months",
              renewal_duration_unit: "months",
              _tags: [],
              _slug: "price",
              _schema: "price",
              _owners: [
                {
                  org_id: "739224",
                  user_id: "10009172"
                }
              ],
              _title: "testest",
              description: "testest",
              variable_price: true,
              tiers: [
                {
                  up_to: 90.555555,
                  unit_amount: 0,
                  unit_amount_decimal: "0",
                  flat_fee_amount: 10000,
                  flat_fee_amount_decimal: "100"
                },
                {
                  up_to: 300,
                  unit_amount: 0,
                  unit_amount_decimal: "0",
                  flat_fee_amount: 20000,
                  flat_fee_amount_decimal: "200",
                  display_mode: "on_request"
                },
                {
                  up_to: 600,
                  unit_amount: 0,
                  unit_amount_decimal: "0",
                  flat_fee_amount: 30000,
                  flat_fee_amount_decimal: "300",
                  display_mode: "on_request"
                },
                {
                  up_to: null,
                  unit_amount: 0,
                  unit_amount_decimal: "0",
                  flat_fee_amount: 50000,
                  flat_fee_amount_decimal: "500"
                }
              ],
              _org: "739224",
              _created_at: "2023-05-29T16:01:53.679Z",
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
              },
              internal_description: "testest",
              billing_duration_amount: "3",
              _updated_at: "2024-10-23T10:42:52.545Z",
              $relation: {
                entity_id: "667a518f-4b3c-4623-aab4-c63c7f2bdb97",
                _tags: []
              }
            }
          ],
          _schema: "coupon",
          _id: "411d1a27-24b7-4748-a3cc-dff959fcbca1",
          _org: "739224",
          _owners: [
            {
              org_id: "739224",
              user_id: "11000622"
            }
          ],
          _created_at: "2024-09-11T20:34:31.419Z",
          _updated_at: "2024-11-29T15:24:00.314Z",
          _title: "Autumn sale",
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
          },
          category: "discount",
          description: "Test",
          cashback_period: "0",
          _relations: [
            {
              entity_id: "4ed29406-14dd-4b52-824e-5aa467308d42",
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
            },
            {
              entity_id: "667a518f-4b3c-4623-aab4-c63c7f2bdb97",
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
            },
            {
              entity_id: "d99e348e-8769-4612-afa6-baba0ed1a573",
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
            },
            {
              entity_id: "1ac662d0-a14f-4d0d-b85b-fd64fd30f508",
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
          _viewers: {}
        }
      }
    ],
    total_details: {
      amount_tax: 0,
      breakdown: {
        taxes: [
          {
            tax: {
              rate: 0
            },
            amount: 0
          }
        ],
        recurrences: [
          {
            type: "one_time",
            unit_amount_gross: 800,
            unit_amount_net: 800,
            amount_subtotal: "8,00 €",
            amount_total: "8,00 €",
            amount_subtotal_decimal: "8",
            amount_total_decimal: "8",
            amount_tax: "0,00 €",
            before_discount_amount_total: 1000,
            before_discount_amount_total_decimal: "10",
            discount_amount: 200,
            discount_amount_decimal: "2",
            amount_tax_decimal: "0"
          }
        ],
        recurrencesByTax: [
          {
            type: "one_time",
            amount_total: 800,
            amount_subtotal: 800,
            amount_tax: 0,
            tax: {
              tax: {
                rate: 0
              },
              amount: 0
            }
          }
        ],
        cashbacks: []
      },
      cashbacks: [],
      recurrences: [
        {
          is_discount_recurrence: true,
          amount_total: "-2,00 €"
        },
        {
          billing_period: "table_order.recurrences.billing_period.one_time",
          amount_total: "8,00 €",
          amount_total_decimal: "8",
          amount_subtotal: "8,00 €",
          amount_subtotal_decimal: "8",
          amount_tax: "0,00 €",
          amount_tax_decimal: "0",
          full_amount_tax: "table_order.incl_vat",
          type: "one_time"
        }
      ],
      recurrencesByTax: {},
      one_time: {
        billing_period: "table_order.recurrences.billing_period.one_time",
        amount_total: "8,00 €",
        amount_total_decimal: "8",
        amount_subtotal: "8,00 €",
        amount_subtotal_decimal: "8",
        amount_tax: "0,00 €",
        amount_tax_decimal: "0",
        full_amount_tax: "table_order.incl_vat",
        type: "one_time"
      }
    },
    products: [
      {
        description: "PH With Discount",
        internal_description: "PH With Discount",
        pricing_model: "per_unit",
        unit_amount: "10,00 €",
        unit_amount_currency: "EUR",
        unit_amount_decimal: "8",
        is_tax_inclusive: true,
        price_display_in_journeys: "show_price",
        active: true,
        variable_price: null,
        type: "product",
        billing_period: null,
        billing_duration_amount: null,
        billing_duration_unit: null,
        notice_time_amount: null,
        notice_time_unit: null,
        termination_time_amount: null,
        termination_time_unit: null,
        renewal_duration_amount: null,
        renewal_duration_unit: null,
        price_components: null,
        _tags: [],
        _schema: "price",
        _id: "c3a1cbae-ad35-4b1f-bce7-10f8fbeacfd6",
        _org: "739224",
        _owners: [
          {
            org_id: "739224",
            user_id: "11000894"
          }
        ],
        _created_at: "2024-10-20T15:43:08.270Z",
        _updated_at: "2024-10-20T15:43:08.270Z",
        _title: "PH With Discount",
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
        },
        _relations: [
          {
            entity_id: "c3a1cbae-ad35-4b1f-bce7-10f8fbeacfd6",
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
          },
          {
            entity_id: "11ca8a7b-9759-4673-85cf-8477caa1e17d",
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
          },
          {
            entity_id: "13baa027-4916-487e-805c-09ba6356e85d",
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
          },
          {
            entity_id: "411d1a27-24b7-4748-a3cc-dff959fcbca1",
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
        _viewers: {},
        _coupons: [
          {
            name: "Autumn sale",
            type: "percentage",
            percentage_value: "20",
            fixed_value: 0,
            fixed_value_currency: "EUR",
            fixed_value_decimal: "0.00",
            active: true,
            prices: [
              {
                _id: "4ed29406-14dd-4b52-824e-5aa467308d42",
                description: "Charge Amps Dawn 22 kW Normal Price",
                internal_description: "Charge Amps Dawn 22 kW Normal Price",
                pricing_model: "per_unit",
                unit_amount: 10000,
                unit_amount_currency: "EUR",
                unit_amount_decimal: "100",
                is_tax_inclusive: false,
                price_display_in_journeys: "show_as_starting_price",
                active: true,
                variable_price: null,
                type: "one_time",
                billing_period: null,
                billing_duration_amount: null,
                billing_duration_unit: null,
                notice_time_amount: null,
                notice_time_unit: null,
                termination_time_amount: null,
                termination_time_unit: null,
                renewal_duration_amount: null,
                renewal_duration_unit: null,
                price_components: null,
                _tags: [],
                _schema: "price",
                _org: "739224",
                _owners: [
                  {
                    org_id: "739224",
                    user_id: "11000622"
                  }
                ],
                _created_at: "2024-09-11T15:50:44.148Z",
                _updated_at: "2024-10-04T11:45:29.908Z",
                _title: "Charge Amps Dawn 22 kW Normal Price",
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
                },
                tax: [
                  {
                    type: "VAT",
                    description: "Custom VAT 10%",
                    rate: "10",
                    active: true,
                    region: "DE",
                    _schema: "tax",
                    _id: "dce22931-ee0f-4d29-9273-efe66c8e1707",
                    _org: "739224",
                    _owners: [
                      {
                        org_id: "739224",
                        user_id: "11000913"
                      }
                    ],
                    _created_at: "2024-10-04T11:44:10.056Z",
                    _updated_at: "2024-10-04T11:44:10.056Z",
                    _title: "Custom VAT 10%",
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
                $relation: {
                  entity_id: "4ed29406-14dd-4b52-824e-5aa467308d42",
                  _tags: [],
                  _schema: "price"
                }
              },
              {
                _id: "d99e348e-8769-4612-afa6-baba0ed1a573",
                description: "PH With Discount",
                internal_description: "PH With Discount",
                pricing_model: "per_unit",
                unit_amount: 1000,
                unit_amount_currency: "EUR",
                unit_amount_decimal: "10.00",
                is_tax_inclusive: true,
                price_display_in_journeys: "show_price",
                active: true,
                variable_price: null,
                type: "one_time",
                billing_period: null,
                billing_duration_amount: null,
                billing_duration_unit: null,
                notice_time_amount: null,
                notice_time_unit: null,
                termination_time_amount: null,
                termination_time_unit: null,
                renewal_duration_amount: null,
                renewal_duration_unit: null,
                price_components: null,
                _tags: [],
                _schema: "price",
                _org: "739224",
                _owners: [
                  {
                    org_id: "739224",
                    user_id: "11000894"
                  }
                ],
                _created_at: "2024-10-20T15:43:08.270Z",
                _updated_at: "2024-10-20T15:43:08.270Z",
                _title: "PH With Discount",
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
                },
                $relation: {
                  entity_id: "d99e348e-8769-4612-afa6-baba0ed1a573",
                  _tags: [],
                  _schema: "price"
                }
              },
              {
                _id: "1ac662d0-a14f-4d0d-b85b-fd64fd30f508",
                _manifest: [
                  "ef9ca04c-e11f-4d00-8c70-c0de487c269e",
                  "42d37b24-a946-469d-af3d-da3279a1a710",
                  "31dadaf8-497d-427f-8630-5502dd3e6a8e"
                ],
                _schema: "price",
                _tags: [
                  "Breitband"
                ],
                active: true,
                billing_duration_unit: "months",
                description: "test 2",
                is_tax_inclusive: true,
                notice_time_unit: "months",
                price_display_in_journeys: "show_price",
                pricing_model: "per_unit",
                renewal_duration_unit: "months",
                tax: [
                  {
                    _manifest: [
                      "df12de4c-b99f-4048-b989-6cc86a498d65"
                    ],
                    _schema: "tax",
                    active: true,
                    description: "sales",
                    rate: "19",
                    region: "DE",
                    type: "VAT",
                    _id: "5bf667e2-e7f8-4bb0-a890-c55211456f70",
                    _org: "739224",
                    _owners: [
                      {
                        org_id: "739224",
                        user_id: "11000037"
                      }
                    ],
                    _created_at: "2024-11-13T14:15:33.590Z",
                    _updated_at: "2024-11-14T14:46:53.251Z",
                    _title: "sales",
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
                termination_time_unit: "months",
                tiers: [],
                type: "recurring",
                unit: "m",
                unit_amount: 10000,
                unit_amount_currency: "EUR",
                unit_amount_decimal: "100",
                variable_price: true,
                _purpose: [
                  "61926312-7910-409d-8762-77e86de4f838"
                ],
                _slug: "price",
                billing_duration_amount: "24",
                billing_period: "monthly",
                internal_description: "test 2",
                notice_time_amount: "3",
                price_components: null,
                renewal_duration_amount: "1",
                termination_time_amount: "3",
                _org: "739224",
                _owners: [
                  {
                    org_id: "739224",
                    user_id: "11000037"
                  }
                ],
                _created_at: "2024-11-13T14:15:34.034Z",
                _updated_at: "2024-11-14T12:33:10.722Z",
                _title: "test 2",
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
                },
                $relation: {
                  entity_id: "1ac662d0-a14f-4d0d-b85b-fd64fd30f508",
                  _tags: [],
                  _schema: "price"
                }
              },
              {
                _id: "667a518f-4b3c-4623-aab4-c63c7f2bdb97",
                pricing_model: "tiered_flatfee",
                unit_amount: 0,
                unit_amount_currency: "EUR",
                unit_amount_decimal: "0.00",
                is_tax_inclusive: true,
                price_display_in_journeys: "show_price",
                active: true,
                type: "recurring",
                billing_period: "monthly",
                billing_duration_unit: "years",
                notice_time_unit: "months",
                termination_time_unit: "months",
                renewal_duration_unit: "months",
                _tags: [],
                _slug: "price",
                _schema: "price",
                _owners: [
                  {
                    org_id: "739224",
                    user_id: "10009172"
                  }
                ],
                _title: "testest",
                description: "testest",
                variable_price: true,
                tiers: [
                  {
                    up_to: 90.555555,
                    unit_amount: 0,
                    unit_amount_decimal: "0",
                    flat_fee_amount: 10000,
                    flat_fee_amount_decimal: "100"
                  },
                  {
                    up_to: 300,
                    unit_amount: 0,
                    unit_amount_decimal: "0",
                    flat_fee_amount: 20000,
                    flat_fee_amount_decimal: "200",
                    display_mode: "on_request"
                  },
                  {
                    up_to: 600,
                    unit_amount: 0,
                    unit_amount_decimal: "0",
                    flat_fee_amount: 30000,
                    flat_fee_amount_decimal: "300",
                    display_mode: "on_request"
                  },
                  {
                    up_to: null,
                    unit_amount: 0,
                    unit_amount_decimal: "0",
                    flat_fee_amount: 50000,
                    flat_fee_amount_decimal: "500"
                  }
                ],
                _org: "739224",
                _created_at: "2023-05-29T16:01:53.679Z",
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
                },
                internal_description: "testest",
                billing_duration_amount: "3",
                _updated_at: "2024-10-23T10:42:52.545Z",
                $relation: {
                  entity_id: "667a518f-4b3c-4623-aab4-c63c7f2bdb97",
                  _tags: []
                }
              }
            ],
            _schema: "coupon",
            _id: "411d1a27-24b7-4748-a3cc-dff959fcbca1",
            _org: "739224",
            _owners: [
              {
                org_id: "739224",
                user_id: "11000622"
              }
            ],
            _created_at: "2024-09-11T20:34:31.419Z",
            _updated_at: "2024-11-29T15:24:00.314Z",
            _title: "Autumn sale",
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
            },
            category: "discount",
            description: "Test",
            cashback_period: "0",
            _relations: [
              {
                entity_id: "4ed29406-14dd-4b52-824e-5aa467308d42",
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
              },
              {
                entity_id: "667a518f-4b3c-4623-aab4-c63c7f2bdb97",
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
              },
              {
                entity_id: "d99e348e-8769-4612-afa6-baba0ed1a573",
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
              },
              {
                entity_id: "1ac662d0-a14f-4d0d-b85b-fd64fd30f508",
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
            _viewers: {}
          }
        ],
        blockMappingData: {},
        quantity: 1,
        blockConfiguration: {
          isRequired: true,
          showQuantity: false,
          blockPath: "2/Products/ProductSelectionControl"
        },
        unit_amount_net: "10,00 €",
        unit_amount_gross: 800,
        amount_subtotal: "8,00 €",
        amount_total: "10,00 €",
        amount_tax: "0,00 €",
        unit_discount_amount: 200,
        before_discount_unit_amount: 1000,
        before_discount_unit_amount_gross: 1000,
        before_discount_unit_amount_net: 1000,
        unit_discount_amount_net: 200,
        tax_discount_amount: 0,
        before_discount_tax_amount: 0,
        discount_amount: 200,
        discount_amount_net: 200,
        discount_percentage: 20,
        before_discount_amount_total: 1000,
        currency: "EUR",
        taxes: [
          {
            rate: "nontaxable",
            rateValue: 0,
            amount: 0
          }
        ],
        before_discount_unit_amount_decimal: "10",
        before_discount_unit_amount_gross_decimal: "10",
        before_discount_unit_amount_net_decimal: "10",
        unit_discount_amount_decimal: "2",
        unit_amount_net_decimal: "8",
        unit_discount_amount_net_decimal: "2",
        unit_amount_gross_decimal: "8",
        amount_subtotal_decimal: "8",
        amount_total_decimal: "8",
        discount_amount_decimal: "2",
        before_discount_amount_total_decimal: "10",
        tax_discount_amount_decimal: "0",
        discount_amount_net_decimal: "2",
        before_discount_tax_amount_decimal: "0",
        _position: "1.&nbsp;&nbsp;",
        price: {
          type: "one_time",
          description: "PH With Discount",
          unit_amount: "10,00 €",
          unit_amount_net: "10,00 €",
          amount_subtotal: "8,00 €",
          amount_total: "10,00 €",
          tax: {
            rate: "table_order.no_tax",
            amount: "0,00 €"
          },
          tax_rate: "table_order.no_tax",
          amount_tax: "0,00 €",
          price_display_in_journeys: "show_price",
          billing_period: "table_order.recurrences.billing_period.one_time",
          quantity: "1",
          unit: "",
          display_unit: "",
          is_tiered_price: false
        },
        name: "PH With Discount",
        internal_name: "PH With Discount"
      },
      {
        description: "table_order.discount",
        internal_description: "PH With Discount",
        pricing_model: "per_unit",
        unit_amount: "-2,00 €",
        unit_amount_currency: "EUR",
        unit_amount_decimal: "8",
        is_tax_inclusive: true,
        price_display_in_journeys: "show_price",
        active: true,
        variable_price: null,
        type: "product",
        billing_period: null,
        billing_duration_amount: null,
        billing_duration_unit: null,
        notice_time_amount: null,
        notice_time_unit: null,
        termination_time_amount: null,
        termination_time_unit: null,
        renewal_duration_amount: null,
        renewal_duration_unit: null,
        price_components: null,
        _tags: [],
        _schema: "price",
        _id: "c3a1cbae-ad35-4b1f-bce7-10f8fbeacfd6",
        _org: "739224",
        _owners: [
          {
            org_id: "739224",
            user_id: "11000894"
          }
        ],
        _created_at: "2024-10-20T15:43:08.270Z",
        _updated_at: "2024-10-20T15:43:08.270Z",
        _title: "PH With Discount",
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
        },
        _relations: [
          {
            entity_id: "c3a1cbae-ad35-4b1f-bce7-10f8fbeacfd6",
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
          },
          {
            entity_id: "11ca8a7b-9759-4673-85cf-8477caa1e17d",
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
          },
          {
            entity_id: "13baa027-4916-487e-805c-09ba6356e85d",
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
          },
          {
            entity_id: "411d1a27-24b7-4748-a3cc-dff959fcbca1",
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
        _viewers: {},
        _coupons: [
          {
            name: "Autumn sale",
            type: "percentage",
            percentage_value: "20",
            fixed_value: 0,
            fixed_value_currency: "EUR",
            fixed_value_decimal: "0.00",
            active: true,
            prices: [
              {
                _id: "4ed29406-14dd-4b52-824e-5aa467308d42",
                description: "Charge Amps Dawn 22 kW Normal Price",
                internal_description: "Charge Amps Dawn 22 kW Normal Price",
                pricing_model: "per_unit",
                unit_amount: 10000,
                unit_amount_currency: "EUR",
                unit_amount_decimal: "100",
                is_tax_inclusive: false,
                price_display_in_journeys: "show_as_starting_price",
                active: true,
                variable_price: null,
                type: "one_time",
                billing_period: null,
                billing_duration_amount: null,
                billing_duration_unit: null,
                notice_time_amount: null,
                notice_time_unit: null,
                termination_time_amount: null,
                termination_time_unit: null,
                renewal_duration_amount: null,
                renewal_duration_unit: null,
                price_components: null,
                _tags: [],
                _schema: "price",
                _org: "739224",
                _owners: [
                  {
                    org_id: "739224",
                    user_id: "11000622"
                  }
                ],
                _created_at: "2024-09-11T15:50:44.148Z",
                _updated_at: "2024-10-04T11:45:29.908Z",
                _title: "Charge Amps Dawn 22 kW Normal Price",
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
                },
                tax: [
                  {
                    type: "VAT",
                    description: "Custom VAT 10%",
                    rate: "10",
                    active: true,
                    region: "DE",
                    _schema: "tax",
                    _id: "dce22931-ee0f-4d29-9273-efe66c8e1707",
                    _org: "739224",
                    _owners: [
                      {
                        org_id: "739224",
                        user_id: "11000913"
                      }
                    ],
                    _created_at: "2024-10-04T11:44:10.056Z",
                    _updated_at: "2024-10-04T11:44:10.056Z",
                    _title: "Custom VAT 10%",
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
                $relation: {
                  entity_id: "4ed29406-14dd-4b52-824e-5aa467308d42",
                  _tags: [],
                  _schema: "price"
                }
              },
              {
                _id: "d99e348e-8769-4612-afa6-baba0ed1a573",
                description: "PH With Discount",
                internal_description: "PH With Discount",
                pricing_model: "per_unit",
                unit_amount: 1000,
                unit_amount_currency: "EUR",
                unit_amount_decimal: "10.00",
                is_tax_inclusive: true,
                price_display_in_journeys: "show_price",
                active: true,
                variable_price: null,
                type: "one_time",
                billing_period: null,
                billing_duration_amount: null,
                billing_duration_unit: null,
                notice_time_amount: null,
                notice_time_unit: null,
                termination_time_amount: null,
                termination_time_unit: null,
                renewal_duration_amount: null,
                renewal_duration_unit: null,
                price_components: null,
                _tags: [],
                _schema: "price",
                _org: "739224",
                _owners: [
                  {
                    org_id: "739224",
                    user_id: "11000894"
                  }
                ],
                _created_at: "2024-10-20T15:43:08.270Z",
                _updated_at: "2024-10-20T15:43:08.270Z",
                _title: "PH With Discount",
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
                },
                $relation: {
                  entity_id: "d99e348e-8769-4612-afa6-baba0ed1a573",
                  _tags: [],
                  _schema: "price"
                }
              },
              {
                _id: "1ac662d0-a14f-4d0d-b85b-fd64fd30f508",
                _manifest: [
                  "ef9ca04c-e11f-4d00-8c70-c0de487c269e",
                  "42d37b24-a946-469d-af3d-da3279a1a710",
                  "31dadaf8-497d-427f-8630-5502dd3e6a8e"
                ],
                _schema: "price",
                _tags: [
                  "Breitband"
                ],
                active: true,
                billing_duration_unit: "months",
                description: "test 2",
                is_tax_inclusive: true,
                notice_time_unit: "months",
                price_display_in_journeys: "show_price",
                pricing_model: "per_unit",
                renewal_duration_unit: "months",
                tax: [
                  {
                    _manifest: [
                      "df12de4c-b99f-4048-b989-6cc86a498d65"
                    ],
                    _schema: "tax",
                    active: true,
                    description: "sales",
                    rate: "19",
                    region: "DE",
                    type: "VAT",
                    _id: "5bf667e2-e7f8-4bb0-a890-c55211456f70",
                    _org: "739224",
                    _owners: [
                      {
                        org_id: "739224",
                        user_id: "11000037"
                      }
                    ],
                    _created_at: "2024-11-13T14:15:33.590Z",
                    _updated_at: "2024-11-14T14:46:53.251Z",
                    _title: "sales",
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
                termination_time_unit: "months",
                tiers: [],
                type: "recurring",
                unit: "m",
                unit_amount: 10000,
                unit_amount_currency: "EUR",
                unit_amount_decimal: "100",
                variable_price: true,
                _purpose: [
                  "61926312-7910-409d-8762-77e86de4f838"
                ],
                _slug: "price",
                billing_duration_amount: "24",
                billing_period: "monthly",
                internal_description: "test 2",
                notice_time_amount: "3",
                price_components: null,
                renewal_duration_amount: "1",
                termination_time_amount: "3",
                _org: "739224",
                _owners: [
                  {
                    org_id: "739224",
                    user_id: "11000037"
                  }
                ],
                _created_at: "2024-11-13T14:15:34.034Z",
                _updated_at: "2024-11-14T12:33:10.722Z",
                _title: "test 2",
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
                },
                $relation: {
                  entity_id: "1ac662d0-a14f-4d0d-b85b-fd64fd30f508",
                  _tags: [],
                  _schema: "price"
                }
              },
              {
                _id: "667a518f-4b3c-4623-aab4-c63c7f2bdb97",
                pricing_model: "tiered_flatfee",
                unit_amount: 0,
                unit_amount_currency: "EUR",
                unit_amount_decimal: "0.00",
                is_tax_inclusive: true,
                price_display_in_journeys: "show_price",
                active: true,
                type: "recurring",
                billing_period: "monthly",
                billing_duration_unit: "years",
                notice_time_unit: "months",
                termination_time_unit: "months",
                renewal_duration_unit: "months",
                _tags: [],
                _slug: "price",
                _schema: "price",
                _owners: [
                  {
                    org_id: "739224",
                    user_id: "10009172"
                  }
                ],
                _title: "testest",
                description: "testest",
                variable_price: true,
                tiers: [
                  {
                    up_to: 90.555555,
                    unit_amount: 0,
                    unit_amount_decimal: "0",
                    flat_fee_amount: 10000,
                    flat_fee_amount_decimal: "100"
                  },
                  {
                    up_to: 300,
                    unit_amount: 0,
                    unit_amount_decimal: "0",
                    flat_fee_amount: 20000,
                    flat_fee_amount_decimal: "200",
                    display_mode: "on_request"
                  },
                  {
                    up_to: 600,
                    unit_amount: 0,
                    unit_amount_decimal: "0",
                    flat_fee_amount: 30000,
                    flat_fee_amount_decimal: "300",
                    display_mode: "on_request"
                  },
                  {
                    up_to: null,
                    unit_amount: 0,
                    unit_amount_decimal: "0",
                    flat_fee_amount: 50000,
                    flat_fee_amount_decimal: "500"
                  }
                ],
                _org: "739224",
                _created_at: "2023-05-29T16:01:53.679Z",
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
                },
                internal_description: "testest",
                billing_duration_amount: "3",
                _updated_at: "2024-10-23T10:42:52.545Z",
                $relation: {
                  entity_id: "667a518f-4b3c-4623-aab4-c63c7f2bdb97",
                  _tags: []
                }
              }
            ],
            _schema: "coupon",
            _id: "411d1a27-24b7-4748-a3cc-dff959fcbca1",
            _org: "739224",
            _owners: [
              {
                org_id: "739224",
                user_id: "11000622"
              }
            ],
            _created_at: "2024-09-11T20:34:31.419Z",
            _updated_at: "2024-11-29T15:24:00.314Z",
            _title: "Autumn sale",
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
            },
            category: "discount",
            description: "Test",
            cashback_period: "0",
            _relations: [
              {
                entity_id: "4ed29406-14dd-4b52-824e-5aa467308d42",
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
              },
              {
                entity_id: "667a518f-4b3c-4623-aab4-c63c7f2bdb97",
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
              },
              {
                entity_id: "d99e348e-8769-4612-afa6-baba0ed1a573",
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
              },
              {
                entity_id: "1ac662d0-a14f-4d0d-b85b-fd64fd30f508",
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
            _viewers: {}
          }
        ],
        blockMappingData: {},
        quantity: 1,
        blockConfiguration: {
          isRequired: true,
          showQuantity: false,
          blockPath: "2/Products/ProductSelectionControl"
        },
        unit_amount_net: "-2,00 €",
        unit_amount_gross: 800,
        amount_subtotal: "0,00 €",
        amount_total: "-2,00 €",
        amount_tax: "0,00 €",
        unit_discount_amount: 200,
        before_discount_unit_amount: 1000,
        before_discount_unit_amount_gross: 1000,
        before_discount_unit_amount_net: 1000,
        unit_discount_amount_net: 200,
        tax_discount_amount: 0,
        before_discount_tax_amount: 0,
        discount_amount: 200,
        discount_amount_net: 200,
        discount_percentage: 20,
        before_discount_amount_total: 1000,
        currency: "EUR",
        taxes: [
          {
            rate: "nontaxable",
            rateValue: 0,
            amount: 0
          }
        ],
        before_discount_unit_amount_decimal: "10",
        before_discount_unit_amount_gross_decimal: "10",
        before_discount_unit_amount_net_decimal: "10",
        unit_discount_amount_decimal: "2",
        unit_amount_net_decimal: "8",
        unit_discount_amount_net_decimal: "2",
        unit_amount_gross_decimal: "8",
        amount_subtotal_decimal: "8",
        amount_total_decimal: "8",
        discount_amount_decimal: "2",
        before_discount_amount_total_decimal: "10",
        tax_discount_amount_decimal: "0",
        discount_amount_net_decimal: "2",
        before_discount_tax_amount_decimal: "0",
        _position: "1.&nbsp;&nbsp;",
        coupon: {
          name: "Autumn sale",
          type: "percentage",
          percentage_value: "20",
          fixed_value: 0,
          fixed_value_currency: "EUR",
          fixed_value_decimal: "0.00",
          active: true,
          prices: [
            {
              _id: "4ed29406-14dd-4b52-824e-5aa467308d42",
              description: "Charge Amps Dawn 22 kW Normal Price",
              internal_description: "Charge Amps Dawn 22 kW Normal Price",
              pricing_model: "per_unit",
              unit_amount: 10000,
              unit_amount_currency: "EUR",
              unit_amount_decimal: "100",
              is_tax_inclusive: false,
              price_display_in_journeys: "show_as_starting_price",
              active: true,
              variable_price: null,
              type: "one_time",
              billing_period: null,
              billing_duration_amount: null,
              billing_duration_unit: null,
              notice_time_amount: null,
              notice_time_unit: null,
              termination_time_amount: null,
              termination_time_unit: null,
              renewal_duration_amount: null,
              renewal_duration_unit: null,
              price_components: null,
              _tags: [],
              _schema: "price",
              _org: "739224",
              _owners: [
                {
                  org_id: "739224",
                  user_id: "11000622"
                }
              ],
              _created_at: "2024-09-11T15:50:44.148Z",
              _updated_at: "2024-10-04T11:45:29.908Z",
              _title: "Charge Amps Dawn 22 kW Normal Price",
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
              },
              tax: [
                {
                  type: "VAT",
                  description: "Custom VAT 10%",
                  rate: "10",
                  active: true,
                  region: "DE",
                  _schema: "tax",
                  _id: "dce22931-ee0f-4d29-9273-efe66c8e1707",
                  _org: "739224",
                  _owners: [
                    {
                      org_id: "739224",
                      user_id: "11000913"
                    }
                  ],
                  _created_at: "2024-10-04T11:44:10.056Z",
                  _updated_at: "2024-10-04T11:44:10.056Z",
                  _title: "Custom VAT 10%",
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
              $relation: {
                entity_id: "4ed29406-14dd-4b52-824e-5aa467308d42",
                _tags: [],
                _schema: "price"
              }
            },
            {
              _id: "d99e348e-8769-4612-afa6-baba0ed1a573",
              description: "PH With Discount",
              internal_description: "PH With Discount",
              pricing_model: "per_unit",
              unit_amount: 1000,
              unit_amount_currency: "EUR",
              unit_amount_decimal: "10.00",
              is_tax_inclusive: true,
              price_display_in_journeys: "show_price",
              active: true,
              variable_price: null,
              type: "one_time",
              billing_period: null,
              billing_duration_amount: null,
              billing_duration_unit: null,
              notice_time_amount: null,
              notice_time_unit: null,
              termination_time_amount: null,
              termination_time_unit: null,
              renewal_duration_amount: null,
              renewal_duration_unit: null,
              price_components: null,
              _tags: [],
              _schema: "price",
              _org: "739224",
              _owners: [
                {
                  org_id: "739224",
                  user_id: "11000894"
                }
              ],
              _created_at: "2024-10-20T15:43:08.270Z",
              _updated_at: "2024-10-20T15:43:08.270Z",
              _title: "PH With Discount",
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
              },
              $relation: {
                entity_id: "d99e348e-8769-4612-afa6-baba0ed1a573",
                _tags: [],
                _schema: "price"
              }
            },
            {
              _id: "1ac662d0-a14f-4d0d-b85b-fd64fd30f508",
              _manifest: [
                "ef9ca04c-e11f-4d00-8c70-c0de487c269e",
                "42d37b24-a946-469d-af3d-da3279a1a710",
                "31dadaf8-497d-427f-8630-5502dd3e6a8e"
              ],
              _schema: "price",
              _tags: [
                "Breitband"
              ],
              active: true,
              billing_duration_unit: "months",
              description: "test 2",
              is_tax_inclusive: true,
              notice_time_unit: "months",
              price_display_in_journeys: "show_price",
              pricing_model: "per_unit",
              renewal_duration_unit: "months",
              tax: [
                {
                  _manifest: [
                    "df12de4c-b99f-4048-b989-6cc86a498d65"
                  ],
                  _schema: "tax",
                  active: true,
                  description: "sales",
                  rate: "19",
                  region: "DE",
                  type: "VAT",
                  _id: "5bf667e2-e7f8-4bb0-a890-c55211456f70",
                  _org: "739224",
                  _owners: [
                    {
                      org_id: "739224",
                      user_id: "11000037"
                    }
                  ],
                  _created_at: "2024-11-13T14:15:33.590Z",
                  _updated_at: "2024-11-14T14:46:53.251Z",
                  _title: "sales",
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
              termination_time_unit: "months",
              tiers: [],
              type: "recurring",
              unit: "m",
              unit_amount: 10000,
              unit_amount_currency: "EUR",
              unit_amount_decimal: "100",
              variable_price: true,
              _purpose: [
                "61926312-7910-409d-8762-77e86de4f838"
              ],
              _slug: "price",
              billing_duration_amount: "24",
              billing_period: "monthly",
              internal_description: "test 2",
              notice_time_amount: "3",
              price_components: null,
              renewal_duration_amount: "1",
              termination_time_amount: "3",
              _org: "739224",
              _owners: [
                {
                  org_id: "739224",
                  user_id: "11000037"
                }
              ],
              _created_at: "2024-11-13T14:15:34.034Z",
              _updated_at: "2024-11-14T12:33:10.722Z",
              _title: "test 2",
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
              },
              $relation: {
                entity_id: "1ac662d0-a14f-4d0d-b85b-fd64fd30f508",
                _tags: [],
                _schema: "price"
              }
            },
            {
              _id: "667a518f-4b3c-4623-aab4-c63c7f2bdb97",
              pricing_model: "tiered_flatfee",
              unit_amount: 0,
              unit_amount_currency: "EUR",
              unit_amount_decimal: "0.00",
              is_tax_inclusive: true,
              price_display_in_journeys: "show_price",
              active: true,
              type: "recurring",
              billing_period: "monthly",
              billing_duration_unit: "years",
              notice_time_unit: "months",
              termination_time_unit: "months",
              renewal_duration_unit: "months",
              _tags: [],
              _slug: "price",
              _schema: "price",
              _owners: [
                {
                  org_id: "739224",
                  user_id: "10009172"
                }
              ],
              _title: "testest",
              description: "testest",
              variable_price: true,
              tiers: [
                {
                  up_to: 90.555555,
                  unit_amount: 0,
                  unit_amount_decimal: "0",
                  flat_fee_amount: 10000,
                  flat_fee_amount_decimal: "100"
                },
                {
                  up_to: 300,
                  unit_amount: 0,
                  unit_amount_decimal: "0",
                  flat_fee_amount: 20000,
                  flat_fee_amount_decimal: "200",
                  display_mode: "on_request"
                },
                {
                  up_to: 600,
                  unit_amount: 0,
                  unit_amount_decimal: "0",
                  flat_fee_amount: 30000,
                  flat_fee_amount_decimal: "300",
                  display_mode: "on_request"
                },
                {
                  up_to: null,
                  unit_amount: 0,
                  unit_amount_decimal: "0",
                  flat_fee_amount: 50000,
                  flat_fee_amount_decimal: "500"
                }
              ],
              _org: "739224",
              _created_at: "2023-05-29T16:01:53.679Z",
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
              },
              internal_description: "testest",
              billing_duration_amount: "3",
              _updated_at: "2024-10-23T10:42:52.545Z",
              $relation: {
                entity_id: "667a518f-4b3c-4623-aab4-c63c7f2bdb97",
                _tags: []
              }
            }
          ],
          _schema: "coupon",
          _id: "411d1a27-24b7-4748-a3cc-dff959fcbca1",
          _org: "739224",
          _owners: [
            {
              org_id: "739224",
              user_id: "11000622"
            }
          ],
          _created_at: "2024-09-11T20:34:31.419Z",
          _updated_at: "2024-11-29T15:24:00.314Z",
          _title: "Autumn sale",
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
          },
          category: "discount",
          description: "Test",
          cashback_period: "0",
          _relations: [
            {
              entity_id: "4ed29406-14dd-4b52-824e-5aa467308d42",
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
            },
            {
              entity_id: "667a518f-4b3c-4623-aab4-c63c7f2bdb97",
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
            },
            {
              entity_id: "d99e348e-8769-4612-afa6-baba0ed1a573",
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
            },
            {
              entity_id: "1ac662d0-a14f-4d0d-b85b-fd64fd30f508",
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
          _viewers: {}
        },
        price: {
          type: "one_time",
          description: "PH With Discount",
          unit_amount: "-2,00 €",
          unit_amount_net: "-2,00 €",
          amount_subtotal: "0,00 €",
          amount_total: "-2,00 €",
          tax: {
            rate: "table_order.no_tax",
            amount: "0,00 €"
          },
          amount_tax: "0,00 €",
          price_display_in_journeys: "show_price",
          billing_period: "table_order.recurrences.billing_period.one_time",
          unit: "",
          display_unit: "",
          is_tiered_price: false
        },
        name: "Autumn sale",
        internal_name: "PH With Discount"
      }
    ],
    product: {
      description: "PH With Discount",
      internal_description: "PH With Discount",
      pricing_model: "per_unit",
      unit_amount: "10,00 €",
      unit_amount_currency: "EUR",
      unit_amount_decimal: "8",
      is_tax_inclusive: true,
      price_display_in_journeys: "show_price",
      active: true,
      variable_price: null,
      type: "product",
      billing_period: null,
      billing_duration_amount: null,
      billing_duration_unit: null,
      notice_time_amount: null,
      notice_time_unit: null,
      termination_time_amount: null,
      termination_time_unit: null,
      renewal_duration_amount: null,
      renewal_duration_unit: null,
      price_components: null,
      _tags: [],
      _schema: "price",
      _id: "c3a1cbae-ad35-4b1f-bce7-10f8fbeacfd6",
      _org: "739224",
      _owners: [
        {
          org_id: "739224",
          user_id: "11000894"
        }
      ],
      _created_at: "2024-10-20T15:43:08.270Z",
      _updated_at: "2024-10-20T15:43:08.270Z",
      _title: "PH With Discount",
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
      },
      _relations: [
        {
          entity_id: "c3a1cbae-ad35-4b1f-bce7-10f8fbeacfd6",
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
        },
        {
          entity_id: "11ca8a7b-9759-4673-85cf-8477caa1e17d",
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
        },
        {
          entity_id: "13baa027-4916-487e-805c-09ba6356e85d",
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
        },
        {
          entity_id: "411d1a27-24b7-4748-a3cc-dff959fcbca1",
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
      _viewers: {},
      _coupons: [
        {
          name: "Autumn sale",
          type: "percentage",
          percentage_value: "20",
          fixed_value: 0,
          fixed_value_currency: "EUR",
          fixed_value_decimal: "0.00",
          active: true,
          prices: [
            {
              _id: "4ed29406-14dd-4b52-824e-5aa467308d42",
              description: "Charge Amps Dawn 22 kW Normal Price",
              internal_description: "Charge Amps Dawn 22 kW Normal Price",
              pricing_model: "per_unit",
              unit_amount: 10000,
              unit_amount_currency: "EUR",
              unit_amount_decimal: "100",
              is_tax_inclusive: false,
              price_display_in_journeys: "show_as_starting_price",
              active: true,
              variable_price: null,
              type: "one_time",
              billing_period: null,
              billing_duration_amount: null,
              billing_duration_unit: null,
              notice_time_amount: null,
              notice_time_unit: null,
              termination_time_amount: null,
              termination_time_unit: null,
              renewal_duration_amount: null,
              renewal_duration_unit: null,
              price_components: null,
              _tags: [],
              _schema: "price",
              _org: "739224",
              _owners: [
                {
                  org_id: "739224",
                  user_id: "11000622"
                }
              ],
              _created_at: "2024-09-11T15:50:44.148Z",
              _updated_at: "2024-10-04T11:45:29.908Z",
              _title: "Charge Amps Dawn 22 kW Normal Price",
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
              },
              tax: [
                {
                  type: "VAT",
                  description: "Custom VAT 10%",
                  rate: "10",
                  active: true,
                  region: "DE",
                  _schema: "tax",
                  _id: "dce22931-ee0f-4d29-9273-efe66c8e1707",
                  _org: "739224",
                  _owners: [
                    {
                      org_id: "739224",
                      user_id: "11000913"
                    }
                  ],
                  _created_at: "2024-10-04T11:44:10.056Z",
                  _updated_at: "2024-10-04T11:44:10.056Z",
                  _title: "Custom VAT 10%",
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
              $relation: {
                entity_id: "4ed29406-14dd-4b52-824e-5aa467308d42",
                _tags: [],
                _schema: "price"
              }
            },
            {
              _id: "d99e348e-8769-4612-afa6-baba0ed1a573",
              description: "PH With Discount",
              internal_description: "PH With Discount",
              pricing_model: "per_unit",
              unit_amount: 1000,
              unit_amount_currency: "EUR",
              unit_amount_decimal: "10.00",
              is_tax_inclusive: true,
              price_display_in_journeys: "show_price",
              active: true,
              variable_price: null,
              type: "one_time",
              billing_period: null,
              billing_duration_amount: null,
              billing_duration_unit: null,
              notice_time_amount: null,
              notice_time_unit: null,
              termination_time_amount: null,
              termination_time_unit: null,
              renewal_duration_amount: null,
              renewal_duration_unit: null,
              price_components: null,
              _tags: [],
              _schema: "price",
              _org: "739224",
              _owners: [
                {
                  org_id: "739224",
                  user_id: "11000894"
                }
              ],
              _created_at: "2024-10-20T15:43:08.270Z",
              _updated_at: "2024-10-20T15:43:08.270Z",
              _title: "PH With Discount",
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
              },
              $relation: {
                entity_id: "d99e348e-8769-4612-afa6-baba0ed1a573",
                _tags: [],
                _schema: "price"
              }
            },
            {
              _id: "1ac662d0-a14f-4d0d-b85b-fd64fd30f508",
              _manifest: [
                "ef9ca04c-e11f-4d00-8c70-c0de487c269e",
                "42d37b24-a946-469d-af3d-da3279a1a710",
                "31dadaf8-497d-427f-8630-5502dd3e6a8e"
              ],
              _schema: "price",
              _tags: [
                "Breitband"
              ],
              active: true,
              billing_duration_unit: "months",
              description: "test 2",
              is_tax_inclusive: true,
              notice_time_unit: "months",
              price_display_in_journeys: "show_price",
              pricing_model: "per_unit",
              renewal_duration_unit: "months",
              tax: [
                {
                  _manifest: [
                    "df12de4c-b99f-4048-b989-6cc86a498d65"
                  ],
                  _schema: "tax",
                  active: true,
                  description: "sales",
                  rate: "19",
                  region: "DE",
                  type: "VAT",
                  _id: "5bf667e2-e7f8-4bb0-a890-c55211456f70",
                  _org: "739224",
                  _owners: [
                    {
                      org_id: "739224",
                      user_id: "11000037"
                    }
                  ],
                  _created_at: "2024-11-13T14:15:33.590Z",
                  _updated_at: "2024-11-14T14:46:53.251Z",
                  _title: "sales",
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
              termination_time_unit: "months",
              tiers: [],
              type: "recurring",
              unit: "m",
              unit_amount: 10000,
              unit_amount_currency: "EUR",
              unit_amount_decimal: "100",
              variable_price: true,
              _purpose: [
                "61926312-7910-409d-8762-77e86de4f838"
              ],
              _slug: "price",
              billing_duration_amount: "24",
              billing_period: "monthly",
              internal_description: "test 2",
              notice_time_amount: "3",
              price_components: null,
              renewal_duration_amount: "1",
              termination_time_amount: "3",
              _org: "739224",
              _owners: [
                {
                  org_id: "739224",
                  user_id: "11000037"
                }
              ],
              _created_at: "2024-11-13T14:15:34.034Z",
              _updated_at: "2024-11-14T12:33:10.722Z",
              _title: "test 2",
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
              },
              $relation: {
                entity_id: "1ac662d0-a14f-4d0d-b85b-fd64fd30f508",
                _tags: [],
                _schema: "price"
              }
            },
            {
              _id: "667a518f-4b3c-4623-aab4-c63c7f2bdb97",
              pricing_model: "tiered_flatfee",
              unit_amount: 0,
              unit_amount_currency: "EUR",
              unit_amount_decimal: "0.00",
              is_tax_inclusive: true,
              price_display_in_journeys: "show_price",
              active: true,
              type: "recurring",
              billing_period: "monthly",
              billing_duration_unit: "years",
              notice_time_unit: "months",
              termination_time_unit: "months",
              renewal_duration_unit: "months",
              _tags: [],
              _slug: "price",
              _schema: "price",
              _owners: [
                {
                  org_id: "739224",
                  user_id: "10009172"
                }
              ],
              _title: "testest",
              description: "testest",
              variable_price: true,
              tiers: [
                {
                  up_to: 90.555555,
                  unit_amount: 0,
                  unit_amount_decimal: "0",
                  flat_fee_amount: 10000,
                  flat_fee_amount_decimal: "100"
                },
                {
                  up_to: 300,
                  unit_amount: 0,
                  unit_amount_decimal: "0",
                  flat_fee_amount: 20000,
                  flat_fee_amount_decimal: "200",
                  display_mode: "on_request"
                },
                {
                  up_to: 600,
                  unit_amount: 0,
                  unit_amount_decimal: "0",
                  flat_fee_amount: 30000,
                  flat_fee_amount_decimal: "300",
                  display_mode: "on_request"
                },
                {
                  up_to: null,
                  unit_amount: 0,
                  unit_amount_decimal: "0",
                  flat_fee_amount: 50000,
                  flat_fee_amount_decimal: "500"
                }
              ],
              _org: "739224",
              _created_at: "2023-05-29T16:01:53.679Z",
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
              },
              internal_description: "testest",
              billing_duration_amount: "3",
              _updated_at: "2024-10-23T10:42:52.545Z",
              $relation: {
                entity_id: "667a518f-4b3c-4623-aab4-c63c7f2bdb97",
                _tags: []
              }
            }
          ],
          _schema: "coupon",
          _id: "411d1a27-24b7-4748-a3cc-dff959fcbca1",
          _org: "739224",
          _owners: [
            {
              org_id: "739224",
              user_id: "11000622"
            }
          ],
          _created_at: "2024-09-11T20:34:31.419Z",
          _updated_at: "2024-11-29T15:24:00.314Z",
          _title: "Autumn sale",
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
          },
          category: "discount",
          description: "Test",
          cashback_period: "0",
          _relations: [
            {
              entity_id: "4ed29406-14dd-4b52-824e-5aa467308d42",
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
            },
            {
              entity_id: "667a518f-4b3c-4623-aab4-c63c7f2bdb97",
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
            },
            {
              entity_id: "d99e348e-8769-4612-afa6-baba0ed1a573",
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
            },
            {
              entity_id: "1ac662d0-a14f-4d0d-b85b-fd64fd30f508",
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
          _viewers: {}
        }
      ],
      blockMappingData: {},
      quantity: 1,
      blockConfiguration: {
        isRequired: true,
        showQuantity: false,
        blockPath: "2/Products/ProductSelectionControl"
      },
      unit_amount_net: "10,00 €",
      unit_amount_gross: 800,
      amount_subtotal: "8,00 €",
      amount_total: "10,00 €",
      amount_tax: "0,00 €",
      unit_discount_amount: 200,
      before_discount_unit_amount: 1000,
      before_discount_unit_amount_gross: 1000,
      before_discount_unit_amount_net: 1000,
      unit_discount_amount_net: 200,
      tax_discount_amount: 0,
      before_discount_tax_amount: 0,
      discount_amount: 200,
      discount_amount_net: 200,
      discount_percentage: 20,
      before_discount_amount_total: 1000,
      currency: "EUR",
      taxes: [
        {
          rate: "nontaxable",
          rateValue: 0,
          amount: 0
        }
      ],
      before_discount_unit_amount_decimal: "10",
      before_discount_unit_amount_gross_decimal: "10",
      before_discount_unit_amount_net_decimal: "10",
      unit_discount_amount_decimal: "2",
      unit_amount_net_decimal: "8",
      unit_discount_amount_net_decimal: "2",
      unit_amount_gross_decimal: "8",
      amount_subtotal_decimal: "8",
      amount_total_decimal: "8",
      discount_amount_decimal: "2",
      before_discount_amount_total_decimal: "10",
      tax_discount_amount_decimal: "0",
      discount_amount_net_decimal: "2",
      before_discount_tax_amount_decimal: "0",
      _position: "1.&nbsp;&nbsp;",
      price: {
        type: "one_time",
        description: "PH With Discount",
        unit_amount: "10,00 €",
        unit_amount_net: "10,00 €",
        amount_subtotal: "8,00 €",
        amount_total: "10,00 €",
        tax: {
          rate: "table_order.no_tax",
          amount: "0,00 €"
        },
        tax_rate: "table_order.no_tax",
        amount_tax: "0,00 €",
        price_display_in_journeys: "show_price",
        billing_period: "table_order.recurrences.billing_period.one_time",
        quantity: "1",
        unit: "",
        display_unit: "",
        is_tiered_price: false
      },
      name: "PH With Discount",
      internal_name: "PH With Discount"
    },
    amount_total: "0,00 €",
    amount_subtotal: "0,00 €"
  }

  it('should work', () => {
    const result = processOrderTableData({}, input, { t: (key: any) => key })

    console.log({ result });
  });
});