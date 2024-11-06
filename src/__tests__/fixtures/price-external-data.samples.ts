import { PriceItemDto } from '../../types';


export const externalCompositePrice: PriceItemDto = {
  "_id": "price-12312414",
  "is_composite_price": true,
  "description": "Home Energy Package Composite",
  "pricing_model": "per_unit",
  "price_display_in_journeys": "show_price",
  "price_components": [
      {
          "_id": "price-12312414-component-0",
          "unit_amount_currency": "EUR",
          "description": "Working Price",
          "is_tax_inclusive": true,
          "unit_amount": 10,
          "unit_amount_decimal": "0.10",
          "unit": "kWh",
          "billing_period": "monthly",
          "type": "recurring",
          "active": true,
          "is_composite_price": false,
          "variable_price": true,
          "pricing_model": "per_unit",
          "price_display_in_journeys": "show_price",
          "blockMappingData": {}
      },
      {
          "_id": "price-12312414-component-1",
          "unit_amount_currency": "EUR",
          "description": "Extra Monthly Price",
          "is_tax_inclusive": false,
          "unit_amount": 5000,
          "unit_amount_decimal": "50",
          "billing_period": "monthly",
          "type": "recurring",
          "active": true,
          "tax": [
              {
                  "name": "Custom VAT",
                  "type": "VAT",
                  "rate": 20,
                  "region": "DE",
                  "_id": "tax-20-VAT"
              }
          ],
          "is_composite_price": false,
          "pricing_model": "per_unit",
          "price_display_in_journeys": "show_price",
          "blockMappingData": {}
      },
      {
          "_id": "price-12312414-component-2",
          "unit_amount_currency": "EUR",
          "description": "Base Price",
          "is_tax_inclusive": false,
          "unit_amount": 840,
          "unit_amount_decimal": "8.4",
          "type": "one_time",
          "active": true,
          "tax": [
              {
                  "name": "German VAT",
                  "type": "VAT",
                  "rate": 19,
                  "region": "DE",
                  "_id": "tax-19-VAT"
              }
          ],
          "is_composite_price": false,
          "pricing_model": "per_unit",
          "price_display_in_journeys": "show_price",
          "blockMappingData": {}
      }
  ],    
  "quantity": 1,
  "_price": {
      "_id": "price-12312414",
      "is_composite_price": true,
      "description": "Home Energy Package Composite",
      "pricing_model": "per_unit",
      "price_display_in_journeys": "show_price",
      "price_components": [
          {
              "_id": "price-12312414-component-0",
              "unit_amount_currency": "EUR",
              "description": "Working Price",
              "is_tax_inclusive": true,
              "unit_amount": 10,
              "unit_amount_decimal": "0.10",
              "unit": "kWh",
              "billing_period": "monthly",
              "type": "recurring",
              "active": true,
              "is_composite_price": false,
              "variable_price": true,
              "pricing_model": "per_unit",
              "price_display_in_journeys": "show_price",
              "blockMappingData": {}
          },
          {
              "_id": "price-12312414-component-1",
              "unit_amount_currency": "EUR",
              "description": "Extra Monthly Price",
              "is_tax_inclusive": false,
              "unit_amount": 5000,
              "unit_amount_decimal": "50",
              "billing_period": "monthly",
              "type": "recurring",
              "active": true,
              "tax": [
                  {
                      "name": "Custom VAT",
                      "type": "VAT",
                      "rate": 20,
                      "region": "DE",
                      "_id": "tax-20-VAT"
                  }
              ],
              "is_composite_price": false,
              "pricing_model": "per_unit",
              "price_display_in_journeys": "show_price",
              "blockMappingData": {}
          },
          {
              "_id": "price-12312414-component-2",
              "unit_amount_currency": "EUR",
              "description": "Base Price",
              "is_tax_inclusive": false,
              "unit_amount": 840,
              "unit_amount_decimal": "8.4",
              "type": "one_time",
              "active": true,
              "tax": [
                  {
                      "name": "German VAT",
                      "type": "VAT",
                      "rate": 19,
                      "region": "DE",
                      "_id": "tax-19-VAT"
                  }
              ],
              "is_composite_price": false,
              "pricing_model": "per_unit",
              "price_display_in_journeys": "show_price",
              "blockMappingData": {}
          }
      ]
  },
  "_product": {
      "_id": "12312414",
      "name": "Home Energy Package",
      "description": "Composite home energy solution with solar panels and battery",
      "type": "product",
      "feature": [
          {
              "feature": "4kW solar system"
          },
          {
              "feature": "10kWh battery storage"
          },
          {
              "feature": "Smart energy management"
          }
      ],
      "legal_footnote": "Installation and permitting fees may vary by location.",
      "product_images": [
          {
              "public_url": "https://epilot-dev-user-content.s3.eu-central-1.amazonaws.com/739224/13e79129-6087-4e6a-b801-3752e8e9490c/solar_panel_ph.jpeg",
              "access_control": "public-read",
              "_id": "",
              "_created_at": "2024-10-29T10:10:51.054Z",
              "_updated_at": "2024-10-29T10:10:51.054Z",
              "mime_type": "image/*",
              "filename": "solar_panel_ph.jpeg",
              "versions": [],
              "_schema": "file",
              "_org": "epilot"
          }
      ],
      "product_downloads": [
          {
              "public_url": "https://epilot-dev-user-content.s3.eu-central-1.amazonaws.com/739224/b1289717-9266-4940-8f02-b665b98c34fd/september-order.pdf",
              "access_control": "public-read",
              "_id": "",
              "_created_at": "2024-10-29T10:10:51.054Z",
              "_updated_at": "2024-10-29T10:10:51.054Z",
              "mime_type": "",
              "filename": "september-order.pdf",
              "versions": [],
              "_schema": "file",
              "_org": "epilot"
          }
      ],
      "_title": "Home Energy Package",
      "is_external": true
  },
  "_coupons": [],
  "_immutable_pricing_details": {
    "items": [
      {
                  "_id": "price-12312414",
                  "price_id": "price-12312414",
                  "is_composite_price": true,
                  "description": "Home Energy Package Composite",
                  "item_components": [
                      {
                          "_id": "price-12312414-component-0",
                          "price_id": "price-12312414-component-0",
                          "active": true,
                          "description": "Working Price",
                          "is_tax_inclusive": true,
                          "amount_total_decimal": "100",
                          "amount_total": 10000,
                          "amount_subtotal_decimal": "100",
                          "amount_subtotal": 10000,
                          "unit_amount": 10,
                          "unit_amount_gross": 10,
                          "unit_amount_gross_decimal": "0.10",
                          "unit_amount_net": 10,
                          "unit_amount_net_decimal": "0.10",
                          "unit": "kWh",
                          "billing_period": "monthly",
                          "type": "recurring",
                          "taxes": [
                              {
                                  "rate": "nontaxable",
                                  "rateValue": 0,
                                  "amount": 0
                              }
                          ],
                          "is_composite_price": false,
                          "variable_price": true,
                          "pricing_model": "per_unit",
                          "_price": {
                              "_id": "price-12312414-component-0",
                              "unit_amount_currency": "EUR",
                              "description": "Working Price",
                              "is_tax_inclusive": true,
                              "unit_amount": 10,
                              "unit_amount_decimal": "0.10",
                              "unit": "kWh",
                              "billing_period": "monthly",
                              "type": "recurring",
                              "active": true,
                              "is_composite_price": false,
                              "variable_price": true,
                              "pricing_model": "per_unit",
                              "price_display_in_journeys": "show_price"
                          }
                      },
                      {
                          "_id": "price-12312414-component-1",
                          "price_id": "price-12312414-component-1",
                          "active": true,                  
                          "description": "Extra Monthly Price",
                          "is_tax_inclusive": false,
                          "amount_total_decimal": "60",
                          "amount_total": 6000,
                          "amount_subtotal_decimal": "50",
                          "amount_subtotal": 5000,
                          "unit_amount": 5000,
                          "unit_amount_gross": 6000,
                          "unit_amount_gross_decimal": "60",
                          "unit_amount_net": 5000,
                          "unit_amount_net_decimal": "50",
                          "billing_period": "monthly",
                          "type": "recurring",
                          "taxes": [
                              {
                                  "tax": {
                                      "name": "Custom VAT",
                                      "type": "VAT",
                                      "rate": 20,
                                      "region": "DE",
                                      "_id": "tax-20-VAT"
                                  }
                              }
                          ],
                          "is_composite_price": false,
                          "pricing_model": "per_unit",
                          "_price": {
                              "_id": "price-12312414-component-1",
                              "unit_amount_currency": "EUR",
                              "description": "Extra Monthly Price",
                              "is_tax_inclusive": false,
                              "unit_amount": 5000,
                              "unit_amount_decimal": "50",
                              "billing_period": "monthly",
                              "type": "recurring",
                              "active": true,
                              "tax": [
                                  {
                                      "name": "Custom VAT",
                                      "type": "VAT",
                                      "rate": 20,
                                      "region": "DE",
                                      "_id": "tax-20-VAT"
                                  }
                              ],
                              "is_composite_price": false,
                              "pricing_model": "per_unit",
                              "price_display_in_journeys": "show_price"
                          }
                      },
                      {
                          "_id": "price-12312414-component-2",
                          "price_id": "price-12312414-component-2",
                          "active": true,
                          "description": "Base Price",
                          "is_tax_inclusive": false,
                          "amount_total_decimal": "10",
                          "amount_total": 1000,
                          "amount_subtotal_decimal": "8.4",
                          "amount_subtotal": 840,
                          "unit_amount": 840,
                          "unit_amount_gross": 1000,
                          "unit_amount_gross_decimal": "10",
                          "unit_amount_net": 840,
                          "unit_amount_net_decimal": "8.4",
                          "type": "one_time",
                          "taxes": [
                              {
                                  "tax": {
                                      "name": "German VAT",
                                      "type": "VAT",
                                      "rate": 19,
                                      "region": "DE",
                                      "_id": "tax-19-VAT"
                                  }
                              }
                          ],
                          "is_composite_price": false,
                          "pricing_model": "per_unit",
                          "_price": {
                              "_id": "price-12312414-component-2",
                              "unit_amount_currency": "EUR",
                              "description": "Base Price",
                              "is_tax_inclusive": false,
                              "unit_amount": 840,
                              "unit_amount_decimal": "8.4",
                              "type": "one_time",
                              "active": true,
                              "tax": [
                                  {
                                      "name": "German VAT",
                                      "type": "VAT",
                                      "rate": 19,
                                      "region": "DE",
                                      "_id": "tax-19-VAT"
                                  }
                              ],
                              "is_composite_price": false,
                              "pricing_model": "per_unit",
                              "price_display_in_journeys": "show_price"
                          }
                      }
                  ],
                  "total_details": {
                      "breakdown": {
                          "recurrences": [
                              {
                                  "type": "recurring",
                                  "billing_period": "monthly",
                                  "amount_subtotal_decimal": "150",
                                  "amount_total_decimal": "160",
                                  "amount_subtotal": 15000,
                                  "amount_total": 16000
                              },
                              {
                                  "type": "one_time",
                                  "amount_subtotal_decimal": "8.4",
                                  "amount_total_decimal": "10",
                                  "amount_subtotal": 840,
                                  "amount_total": 1000
                              }
                          ]
                      }
                  },
                  "_price": {
                      "_id": "price-12312414",
                      "is_composite_price": true,
                      "description": "Home Energy Package Composite",
                      "pricing_model": "per_unit",
                      "price_display_in_journeys": "show_price",
                      "price_components": [
                          {
                              "_id": "price-12312414-component-0",
                              "unit_amount_currency": "EUR",
                              "description": "Working Price",
                              "is_tax_inclusive": true,
                              "unit_amount": 10,
                              "unit_amount_decimal": "0.10",
                              "unit": "kWh",
                              "billing_period": "monthly",
                              "type": "recurring",
                              "active": true,
                              "is_composite_price": false,
                              "variable_price": true,
                              "pricing_model": "per_unit",
                              "price_display_in_journeys": "show_price"
                          },
                          {
                              "_id": "price-12312414-component-1",
                              "unit_amount_currency": "EUR",
                              "description": "Extra Monthly Price",
                              "is_tax_inclusive": false,
                              "unit_amount": 5000,
                              "unit_amount_decimal": "50",
                              "billing_period": "monthly",
                              "type": "recurring",
                              "active": true,
                              "tax": [
                                  {
                                      "name": "Custom VAT",
                                      "type": "VAT",
                                      "rate": 20,
                                      "region": "DE",
                                      "_id": "tax-20-VAT"
                                  }
                              ],
                              "is_composite_price": false,
                              "pricing_model": "per_unit",
                              "price_display_in_journeys": "show_price"
                          },
                          {
                              "_id": "price-12312414-component-2",
                              "unit_amount_currency": "EUR",
                              "description": "Base Price",
                              "is_tax_inclusive": false,
                              "unit_amount": 840,
                              "unit_amount_decimal": "8.4",
                              "type": "one_time",
                              "active": true,
                              "tax": [
                                  {
                                      "name": "German VAT",
                                      "type": "VAT",
                                      "rate": 19,
                                      "region": "DE",
                                      "_id": "tax-19-VAT"
                                  }
                              ],
                              "is_composite_price": false,
                              "pricing_model": "per_unit",
                              "price_display_in_journeys": "show_price"
                          }
                      ]
                  },
                  "_product": {
                      "_id": "12312414",
                      "name": "Home Energy Package",
                      "description": "Composite home energy solution with solar panels and battery",
                      "type": "product",
                      "feature": [
                          {
                              "feature": "4kW solar system"
                          },
                          {
                              "feature": "10kWh battery storage"
                          },
                          {
                              "feature": "Smart energy management"
                          }
                      ],
                      "legal_footnote": "Installation and permitting fees may vary by location.",
                      "product_images": [
                          {
                              "public_url": "https://epilot-dev-user-content.s3.eu-central-1.amazonaws.com/739224/13e79129-6087-4e6a-b801-3752e8e9490c/solar_panel_ph.jpeg",
                              "access_control": "public-read",
                              "_id": "",
                              "_created_at": "2024-10-29T10:10:51.054Z",
                              "_updated_at": "2024-10-29T10:10:51.054Z",
                              "mime_type": "image/*",
                              "filename": "solar_panel_ph.jpeg",
                              "versions": [],
                              "_schema": "file",
                              "_org": "epilot"
                          }
                      ],
                      "product_downloads": [
                          {
                              "public_url": "https://epilot-dev-user-content.s3.eu-central-1.amazonaws.com/739224/b1289717-9266-4940-8f02-b665b98c34fd/september-order.pdf",
                              "access_control": "public-read",
                              "_id": "",
                              "_created_at": "2024-10-29T10:10:51.054Z",
                              "_updated_at": "2024-10-29T10:10:51.054Z",
                              "mime_type": "",
                              "filename": "september-order.pdf",
                              "versions": [],
                              "_schema": "file",
                              "_org": "epilot"
                          }
                      ],
                      "_title": "Home Energy Package",
                      "is_external": true
                  }
              }
          ],
          "amount_subtotal": 0,
          "amount_total": 0,
          "unit_amount_gross": 0,
          "unit_amount_net": 0,
          "total_details": {
              "breakdown": {
                  "recurrences": [
                      {
                          "type": "recurring",
                          "billing_period": "monthly",
                          "amount_subtotal_decimal": "150",
                          "amount_total_decimal": "160",
                          "amount_subtotal": 15000,
                          "amount_total": 16000
                      },
                      {
                          "type": "one_time",
                          "amount_subtotal_decimal": "8.4",
                          "amount_total_decimal": "10",
                          "amount_subtotal": 840,
                          "amount_total": 1000
                      }
                  ]
              }
      }
  },
  "blockConfiguration": {
      "isRequired": true,
      "showQuantity": false,
      "blockPath": "2/Products Block Name/ProductSelectionControl"
  }
} as any;


export const internalCompositePrice: PriceItemDto = {
  "description": "Epilot Home Energy Package Composite",
  "internal_description": "Epilot Home Energy Package Composite",
  "pricing_model": null,
  "unit_amount": 0,
  "unit_amount_currency": "EUR",
  "unit_amount_decimal": "0.00",
  "is_tax_inclusive": null,
  "price_display_in_journeys": "show_price",
  "unit": null,
  "active": true,
  "variable_price": null,
  "type": null,
  "billing_period": null,
  "billing_duration_amount": null,
  "billing_duration_unit": null,
  "notice_time_amount": null,
  "notice_time_unit": null,
  "termination_time_amount": null,
  "termination_time_unit": null,
  "renewal_duration_amount": null,
  "renewal_duration_unit": null,
  "is_composite_price": true,
  "_tags": [
      "composite"
  ],
  "_schema": "price",
  "_id": "6d75a922-8b3b-4aa4-9438-da0357d470bd",
  "_org": "739224",
  "_owners": [
      {
          "org_id": "739224",
          "user_id": "10009151"
      }
  ],
  "_created_at": "2024-10-24T09:33:29.241Z",
  "_updated_at": "2024-10-28T11:50:59.142Z",
  "_title": "Epilot Home Energy Package Composite",
  "_acl": {
      "view": [
          "org_739224"
      ],
      "edit": [
          "org_739224"
      ],
      "delete": [
          "org_739224"
      ]
  },
  "price_components": [
      {
          "_id": "1731716e-b9ce-400c-a376-2d3f77c31d49",
          "description": "Working Price",
          "internal_description": "Working Price",
          "pricing_model": "per_unit",
          "unit_amount": 10,
          "unit_amount_currency": "EUR",
          "unit_amount_decimal": "0.10",
          "is_tax_inclusive": true,
          "price_display_in_journeys": "show_price",
          "unit": "kwh",
          "active": true,
          "variable_price": true,
          "type": "recurring",
          "billing_period": "monthly",
          "billing_duration_amount": null,
          "billing_duration_unit": null,
          "notice_time_amount": null,
          "notice_time_unit": null,
          "termination_time_amount": null,
          "termination_time_unit": null,
          "renewal_duration_amount": null,
          "renewal_duration_unit": null,
          "price_components": null,
          "_tags": [],
          "_slug": "price",
          "_schema": "price",
          "_owners": [
              {
                  "org_id": "739224",
                  "user_id": "10009151"
              }
          ],
          "_org": "739224",
          "_created_at": "2024-10-24T09:34:11.367Z",
          "_updated_at": "2024-10-24T09:34:11.367Z",
          "_title": "Working Price",
          "_acl": {
              "view": [
                  "org_739224"
              ],
              "edit": [
                  "org_739224"
              ],
              "delete": [
                  "org_739224"
              ]
          },
          "$relation": {
              "entity_id": "1731716e-b9ce-400c-a376-2d3f77c31d49",
              "_schema": "price",
              "_tags": []
          },
          "blockMappingData": {
              "numberInput": 1000,
              "frequencyUnit": "monthly"
          }
      },
      {
          "_id": "2a02df2e-941c-4b4e-b0bc-93b8902926cf",
          "description": "Epilot Extra Monthly Price",
          "internal_description": "Epilot Extra Monthly Price",
          "pricing_model": "per_unit",
          "unit_amount": 5000,
          "unit_amount_currency": "EUR",
          "unit_amount_decimal": "50",
          "is_tax_inclusive": false,
          "price_display_in_journeys": "show_price",
          "active": true,
          "variable_price": null,
          "type": "recurring",
          "billing_period": "monthly",
          "billing_duration_amount": null,
          "billing_duration_unit": null,
          "notice_time_amount": null,
          "notice_time_unit": null,
          "termination_time_amount": null,
          "termination_time_unit": null,
          "renewal_duration_amount": null,
          "renewal_duration_unit": null,
          "price_components": null,
          "_tags": [],
          "_slug": "price",
          "_schema": "price",
          "_owners": [
              {
                  "org_id": "739224",
                  "user_id": "10009151"
              }
          ],
          "_org": "739224",
          "_created_at": "2024-10-24T09:34:50.362Z",
          "_title": "Epilot Extra Monthly Price",
          "_acl": {
              "view": [
                  "org_739224"
              ],
              "edit": [
                  "org_739224"
              ],
              "delete": [
                  "org_739224"
              ]
          },
          "tax": [
              {
                  "type": "VAT",
                  "description": "20 Taxi",
                  "rate": "20",
                  "active": true,
                  "region": "DE",
                  "_schema": "tax",
                  "_id": "36ee1f76-aeeb-4fbe-ba0a-1b280b5cd56c",
                  "_org": "739224",
                  "_owners": [
                      {
                          "org_id": "739224",
                          "user_id": "10009151"
                      }
                  ],
                  "_created_at": "2024-10-25T13:03:27.291Z",
                  "_updated_at": "2024-10-25T13:03:27.291Z",
                  "_title": "20 Taxi",
                  "_acl": {
                      "view": [
                          "org_739224"
                      ],
                      "edit": [
                          "org_739224"
                      ],
                      "delete": [
                          "org_739224"
                      ]
                  }
              }
          ],
          "_updated_at": "2024-10-28T11:32:02.068Z",
          "$relation": {
              "entity_id": "2a02df2e-941c-4b4e-b0bc-93b8902926cf",
              "_schema": "price",
              "_tags": []
          },
          "blockMappingData": {}
      },
      {
          "_id": "a5c360b6-8c50-4652-b7a6-a5861d4f4210",
          "description": "Base price",
          "internal_description": "Base price",
          "pricing_model": "per_unit",
          "unit_amount": 1000,
          "unit_amount_currency": "EUR",
          "unit_amount_decimal": "10",
          "is_tax_inclusive": true,
          "price_display_in_journeys": "show_price",
          "active": true,
          "variable_price": null,
          "type": "one_time",
          "billing_period": null,
          "billing_duration_amount": null,
          "billing_duration_unit": null,
          "notice_time_amount": null,
          "notice_time_unit": null,
          "termination_time_amount": null,
          "termination_time_unit": null,
          "renewal_duration_amount": null,
          "renewal_duration_unit": null,
          "price_components": null,
          "_tags": [],
          "_slug": "price",
          "_schema": "price",
          "_owners": [
              {
                  "org_id": "739224",
                  "user_id": "10009151"
              }
          ],
          "_org": "739224",
          "_created_at": "2024-10-24T09:35:27.192Z",
          "_title": "Base price",
          "_acl": {
              "view": [
                  "org_739224"
              ],
              "edit": [
                  "org_739224"
              ],
              "delete": [
                  "org_739224"
              ]
          },
          "tax": [
              {
                  "_manifest": [
                      "ad2e7470-6e59-4e15-99e1-14b5ad78238f"
                  ],
                  "_schema": "tax",
                  "active": true,
                  "description": "19%",
                  "rate": "19",
                  "region": "DE",
                  "type": "VAT",
                  "_id": "19cfacd1-d22a-4d92-99dd-397961288588",
                  "_org": "739224",
                  "_owners": [
                      {
                          "org_id": "739224",
                          "user_id": "11000037"
                      }
                  ],
                  "_created_at": "2024-10-25T07:36:34.026Z",
                  "_updated_at": "2024-10-25T07:36:34.026Z",
                  "_title": "19%",
                  "_acl": {
                      "view": [
                          "org_739224"
                      ],
                      "edit": [
                          "org_739224"
                      ],
                      "delete": [
                          "org_739224"
                      ]
                  }
              }
          ],
          "_updated_at": "2024-10-28T11:50:58.494Z",
          "$relation": {
              "entity_id": "a5c360b6-8c50-4652-b7a6-a5861d4f4210",
              "_schema": "price",
              "_tags": []
          },
          "blockMappingData": {}
      }
  ],
  "_relations": [
      {
          "entity_id": "bf90c270-7541-42e6-b3e4-149d42776124",
          "_acl": {
              "view": [
                  "org_739224"
              ],
              "edit": [
                  "org_739224"
              ],
              "delete": [
                  "org_739224"
              ]
          }
      },
      {
          "entity_id": "c5695fb5-f02d-4e46-9fb2-a36dc4e9876f",
          "_acl": {
              "view": [
                  "org_739224"
              ],
              "edit": [
                  "org_739224"
              ],
              "delete": [
                  "org_739224"
              ]
          }
      },
      {
          "entity_id": "a5c360b6-8c50-4652-b7a6-a5861d4f4210",
          "_acl": {
              "view": [
                  "org_739224"
              ],
              "edit": [
                  "org_739224"
              ],
              "delete": [
                  "org_739224"
              ]
          }
      },
      {
          "entity_id": "2a02df2e-941c-4b4e-b0bc-93b8902926cf",
          "_acl": {
              "view": [
                  "org_739224"
              ],
              "edit": [
                  "org_739224"
              ],
              "delete": [
                  "org_739224"
              ]
          }
      },
      {
          "entity_id": "1731716e-b9ce-400c-a376-2d3f77c31d49",
          "_acl": {
              "view": [
                  "org_739224"
              ],
              "edit": [
                  "org_739224"
              ],
              "delete": [
                  "org_739224"
              ]
          }
      }
  ],
  "_viewers": {},
  "_coupons": [],
  "quantity": 1,
  "_price": {
      "description": "Epilot Home Energy Package Composite",
      "internal_description": "Epilot Home Energy Package Composite",
      "pricing_model": null,
      "unit_amount": 0,
      "unit_amount_currency": "EUR",
      "unit_amount_decimal": "0.00",
      "is_tax_inclusive": null,
      "price_display_in_journeys": "show_price",
      "unit": null,
      "active": true,
      "variable_price": null,
      "type": null,
      "billing_period": null,
      "billing_duration_amount": null,
      "billing_duration_unit": null,
      "notice_time_amount": null,
      "notice_time_unit": null,
      "termination_time_amount": null,
      "termination_time_unit": null,
      "renewal_duration_amount": null,
      "renewal_duration_unit": null,
      "is_composite_price": true,
      "_tags": [
          "composite"
      ],
      "_schema": "price",
      "_id": "6d75a922-8b3b-4aa4-9438-da0357d470bd",
      "_org": "739224",
      "_owners": [
          {
              "org_id": "739224",
              "user_id": "10009151"
          }
      ],
      "_created_at": "2024-10-24T09:33:29.241Z",
      "_updated_at": "2024-10-28T11:50:59.142Z",
      "_title": "Epilot Home Energy Package Composite",
      "_acl": {
          "view": [
              "org_739224"
          ],
          "edit": [
              "org_739224"
          ],
          "delete": [
              "org_739224"
          ]
      },
      "price_components": [
          {
              "_id": "1731716e-b9ce-400c-a376-2d3f77c31d49",
              "description": "Working Price",
              "internal_description": "Working Price",
              "pricing_model": "per_unit",
              "unit_amount": 10,
              "unit_amount_currency": "EUR",
              "unit_amount_decimal": "0.10",
              "is_tax_inclusive": true,
              "price_display_in_journeys": "show_price",
              "unit": "kwh",
              "active": true,
              "variable_price": true,
              "type": "recurring",
              "billing_period": "monthly",
              "billing_duration_amount": null,
              "billing_duration_unit": null,
              "notice_time_amount": null,
              "notice_time_unit": null,
              "termination_time_amount": null,
              "termination_time_unit": null,
              "renewal_duration_amount": null,
              "renewal_duration_unit": null,
              "price_components": null,
              "_tags": [],
              "_slug": "price",
              "_schema": "price",
              "_owners": [
                  {
                      "org_id": "739224",
                      "user_id": "10009151"
                  }
              ],
              "_org": "739224",
              "_created_at": "2024-10-24T09:34:11.367Z",
              "_updated_at": "2024-10-24T09:34:11.367Z",
              "_title": "Working Price",
              "_acl": {
                  "view": [
                      "org_739224"
                  ],
                  "edit": [
                      "org_739224"
                  ],
                  "delete": [
                      "org_739224"
                  ]
              },
              "$relation": {
                  "entity_id": "1731716e-b9ce-400c-a376-2d3f77c31d49",
                  "_schema": "price",
                  "_tags": []
              },
              "blockMappingData": {
                  "numberInput": 1000,
                  "frequencyUnit": "monthly"
              }
          },
          {
              "_id": "2a02df2e-941c-4b4e-b0bc-93b8902926cf",
              "description": "Epilot Extra Monthly Price",
              "internal_description": "Epilot Extra Monthly Price",
              "pricing_model": "per_unit",
              "unit_amount": 5000,
              "unit_amount_currency": "EUR",
              "unit_amount_decimal": "50",
              "is_tax_inclusive": false,
              "price_display_in_journeys": "show_price",
              "active": true,
              "variable_price": null,
              "type": "recurring",
              "billing_period": "monthly",
              "billing_duration_amount": null,
              "billing_duration_unit": null,
              "notice_time_amount": null,
              "notice_time_unit": null,
              "termination_time_amount": null,
              "termination_time_unit": null,
              "renewal_duration_amount": null,
              "renewal_duration_unit": null,
              "price_components": null,
              "_tags": [],
              "_slug": "price",
              "_schema": "price",
              "_owners": [
                  {
                      "org_id": "739224",
                      "user_id": "10009151"
                  }
              ],
              "_org": "739224",
              "_created_at": "2024-10-24T09:34:50.362Z",
              "_title": "Epilot Extra Monthly Price",
              "_acl": {
                  "view": [
                      "org_739224"
                  ],
                  "edit": [
                      "org_739224"
                  ],
                  "delete": [
                      "org_739224"
                  ]
              },
              "tax": [
                  {
                      "type": "VAT",
                      "description": "20 Taxi",
                      "rate": "20",
                      "active": true,
                      "region": "DE",
                      "_schema": "tax",
                      "_id": "36ee1f76-aeeb-4fbe-ba0a-1b280b5cd56c",
                      "_org": "739224",
                      "_owners": [
                          {
                              "org_id": "739224",
                              "user_id": "10009151"
                          }
                      ],
                      "_created_at": "2024-10-25T13:03:27.291Z",
                      "_updated_at": "2024-10-25T13:03:27.291Z",
                      "_title": "20 Taxi",
                      "_acl": {
                          "view": [
                              "org_739224"
                          ],
                          "edit": [
                              "org_739224"
                          ],
                          "delete": [
                              "org_739224"
                          ]
                      }
                  }
              ],
              "_updated_at": "2024-10-28T11:32:02.068Z",
              "$relation": {
                  "entity_id": "2a02df2e-941c-4b4e-b0bc-93b8902926cf",
                  "_schema": "price",
                  "_tags": []
              },
              "blockMappingData": {}
          },
          {
              "_id": "a5c360b6-8c50-4652-b7a6-a5861d4f4210",
              "description": "Base price",
              "internal_description": "Base price",
              "pricing_model": "per_unit",
              "unit_amount": 1000,
              "unit_amount_currency": "EUR",
              "unit_amount_decimal": "10",
              "is_tax_inclusive": true,
              "price_display_in_journeys": "show_price",
              "active": true,
              "variable_price": null,
              "type": "one_time",
              "billing_period": null,
              "billing_duration_amount": null,
              "billing_duration_unit": null,
              "notice_time_amount": null,
              "notice_time_unit": null,
              "termination_time_amount": null,
              "termination_time_unit": null,
              "renewal_duration_amount": null,
              "renewal_duration_unit": null,
              "price_components": null,
              "_tags": [],
              "_slug": "price",
              "_schema": "price",
              "_owners": [
                  {
                      "org_id": "739224",
                      "user_id": "10009151"
                  }
              ],
              "_org": "739224",
              "_created_at": "2024-10-24T09:35:27.192Z",
              "_title": "Base price",
              "_acl": {
                  "view": [
                      "org_739224"
                  ],
                  "edit": [
                      "org_739224"
                  ],
                  "delete": [
                      "org_739224"
                  ]
              },
              "tax": [
                  {
                      "_manifest": [
                          "ad2e7470-6e59-4e15-99e1-14b5ad78238f"
                      ],
                      "_schema": "tax",
                      "active": true,
                      "description": "19%",
                      "rate": "19",
                      "region": "DE",
                      "type": "VAT",
                      "_id": "19cfacd1-d22a-4d92-99dd-397961288588",
                      "_org": "739224",
                      "_owners": [
                          {
                              "org_id": "739224",
                              "user_id": "11000037"
                          }
                      ],
                      "_created_at": "2024-10-25T07:36:34.026Z",
                      "_updated_at": "2024-10-25T07:36:34.026Z",
                      "_title": "19%",
                      "_acl": {
                          "view": [
                              "org_739224"
                          ],
                          "edit": [
                              "org_739224"
                          ],
                          "delete": [
                              "org_739224"
                          ]
                      }
                  }
              ],
              "_updated_at": "2024-10-28T11:50:58.494Z",
              "$relation": {
                  "entity_id": "a5c360b6-8c50-4652-b7a6-a5861d4f4210",
                  "_schema": "price",
                  "_tags": []
              },
              "blockMappingData": {}
          }
      ],
      "_relations": [
          {
              "entity_id": "bf90c270-7541-42e6-b3e4-149d42776124",
              "_acl": {
                  "view": [
                      "org_739224"
                  ],
                  "edit": [
                      "org_739224"
                  ],
                  "delete": [
                      "org_739224"
                  ]
              }
          },
          {
              "entity_id": "c5695fb5-f02d-4e46-9fb2-a36dc4e9876f",
              "_acl": {
                  "view": [
                      "org_739224"
                  ],
                  "edit": [
                      "org_739224"
                  ],
                  "delete": [
                      "org_739224"
                  ]
              }
          },
          {
              "entity_id": "a5c360b6-8c50-4652-b7a6-a5861d4f4210",
              "_acl": {
                  "view": [
                      "org_739224"
                  ],
                  "edit": [
                      "org_739224"
                  ],
                  "delete": [
                      "org_739224"
                  ]
              }
          },
          {
              "entity_id": "2a02df2e-941c-4b4e-b0bc-93b8902926cf",
              "_acl": {
                  "view": [
                      "org_739224"
                  ],
                  "edit": [
                      "org_739224"
                  ],
                  "delete": [
                      "org_739224"
                  ]
              }
          },
          {
              "entity_id": "1731716e-b9ce-400c-a376-2d3f77c31d49",
              "_acl": {
                  "view": [
                      "org_739224"
                  ],
                  "edit": [
                      "org_739224"
                  ],
                  "delete": [
                      "org_739224"
                  ]
              }
          }
      ],
      "_viewers": {},
      "_coupons": []
  },
  "_product": {
      "name": "Epilot Home Energy Package",
      "internal_name": "Epilot Home Energy Package",
      "type": "product",
      "active": true,
      "description": "Composite home energy solution with solar panels and battery",
      "legal_footnote": "Installation and permitting fees may vary by location.",
      "product_images": [
          {
              "_id": "82e03707-72d8-4577-8bff-73dbac7b79ac",
              "_acl": {
                  "view": [
                      "org_739224"
                  ],
                  "edit": [
                      "org_739224"
                  ],
                  "delete": [
                      "org_739224"
                  ]
              },
              "_manifest": [
                  "6399cf0f-d9a9-4e2b-9714-2ac4ecc62472"
              ],
              "_purpose": [],
              "_tags": [],
              "_title": "Screenshot 2024-07-23 at 12.24.23.png",
              "access_control": "public-read",
              "filename": "Screenshot 2024-07-23 at 12.24.23.png",
              "mime_type": "image/png",
              "type": "image",
              "category": "unknown",
              "size_bytes": 89835,
              "readable_size": "87.73 KB",
              "public_url": "https://epilot-dev-user-content.s3.eu-central-1.amazonaws.com/739224/044d2b66-a33d-4946-ae09-f6aedd3c2c99/Screenshot%25202024-07-23%2520at%252012.24.23.png",
              "s3ref": {
                  "bucket": "epilot-dev-user-content",
                  "key": "739224/044d2b66-a33d-4946-ae09-f6aedd3c2c99/Screenshot%202024-07-23%20at%2012.24.23.png"
              },
              "versions": [
                  {
                      "_acl": {
                          "delete": [
                              "org_739224"
                          ],
                          "edit": [
                              "org_739224"
                          ],
                          "view": [
                              "org_739224"
                          ]
                      },
                      "_manifest": [
                          "6399cf0f-d9a9-4e2b-9714-2ac4ecc62472"
                      ],
                      "_purpose": [],
                      "_tags": [],
                      "_title": "Screenshot 2024-07-23 at 12.24.23.png",
                      "access_control": "public-read",
                      "filename": "Screenshot 2024-07-23 at 12.24.23.png",
                      "mime_type": "image/png",
                      "type": "image",
                      "category": "unknown",
                      "size_bytes": 89835,
                      "readable_size": "87.73 KB",
                      "public_url": "https://epilot-dev-user-content.s3.eu-central-1.amazonaws.com/739224/044d2b66-a33d-4946-ae09-f6aedd3c2c99/Screenshot%25202024-07-23%2520at%252012.24.23.png",
                      "s3ref": {
                          "bucket": "epilot-dev-user-content",
                          "key": "739224/044d2b66-a33d-4946-ae09-f6aedd3c2c99/Screenshot%202024-07-23%20at%2012.24.23.png"
                      }
                  }
              ],
              "_schema": "file",
              "_org": "739224",
              "_owners": [
                  {
                      "org_id": "739224",
                      "user_id": "11000933"
                  }
              ],
              "_created_at": "2024-10-23T12:10:09.190Z",
              "_updated_at": "2024-10-23T12:10:09.956Z",
              "source_url": "https://file.dev.sls.epilot.io/v1/files/public/links/739224-dPkcwGq3eIBT32tlV-CtK/Screenshot%202024-07-23%20at%2012.24.23.png",
              "$relation": {
                  "entity_id": "82e03707-72d8-4577-8bff-73dbac7b79ac"
              }
          }
      ],
      "product_downloads": [
          {
              "_id": "03182c3e-a8f7-4dad-adad-5e061483a3fc",
              "s3ref": {
                  "bucket": "epilot-dev-user-content",
                  "key": "739224/b1289717-9266-4940-8f02-b665b98c34fd/september-order.pdf"
              },
              "filename": "september-order.pdf",
              "access_control": "public-read",
              "size_bytes": 59641,
              "mime_type": "application/pdf",
              "readable_size": "58.24 KB",
              "type": "document",
              "public_url": "https://epilot-dev-user-content.s3.eu-central-1.amazonaws.com/739224/b1289717-9266-4940-8f02-b665b98c34fd/september-order.pdf",
              "versions": [
                  {
                      "s3ref": {
                          "bucket": "epilot-dev-user-content",
                          "key": "739224/b1289717-9266-4940-8f02-b665b98c34fd/september-order.pdf"
                      },
                      "filename": "september-order.pdf",
                      "access_control": "public-read",
                      "size_bytes": 59641,
                      "mime_type": "application/pdf",
                      "readable_size": "58.24 KB",
                      "type": "document",
                      "public_url": "https://epilot-dev-user-content.s3.eu-central-1.amazonaws.com/739224/b1289717-9266-4940-8f02-b665b98c34fd/september-order.pdf"
                  }
              ],
              "_schema": "file",
              "_org": "739224",
              "_owners": [
                  {
                      "org_id": "739224",
                      "user_id": "11000622"
                  }
              ],
              "_created_at": "2023-09-12T14:43:37.665Z",
              "_updated_at": "2024-07-23T14:19:03.190Z",
              "category": "unknown",
              "_title": "september-order.pdf",
              "_acl": {
                  "view": [
                      "org_739224",
                      "org_911486"
                  ],
                  "edit": [
                      "org_739224"
                  ],
                  "delete": [
                      "org_739224"
                  ]
              },
              "_acl_sync": "2024-07-23T14:18:54.175Z",
              "language": "de",
              "$relation": {
                  "entity_id": "03182c3e-a8f7-4dad-adad-5e061483a3fc"
              }
          }
      ],
      "_schema": "product",
      "_id": "bf90c270-7541-42e6-b3e4-149d42776124",
      "_org": "739224",
      "_owners": [
          {
              "org_id": "739224",
              "user_id": "10009151"
          }
      ],
      "_created_at": "2024-10-24T09:32:47.141Z",
      "_updated_at": "2024-10-25T10:17:22.610Z",
      "_title": "Epilot Home Energy Package",
      "_acl": {
          "view": [
              "org_739224"
          ],
          "edit": [
              "org_739224"
          ],
          "delete": [
              "org_739224"
          ]
      },
      "price_options": [
          {
              "_id": "6d75a922-8b3b-4aa4-9438-da0357d470bd",
              "description": "Epilot Home Energy Package Composite",
              "internal_description": "Epilot Home Energy Package Composite",
              "pricing_model": null,
              "unit_amount": 0,
              "unit_amount_currency": "EUR",
              "unit_amount_decimal": "0.00",
              "is_tax_inclusive": null,
              "price_display_in_journeys": "show_price",
              "unit": null,
              "active": true,
              "variable_price": null,
              "type": null,
              "billing_period": null,
              "billing_duration_amount": null,
              "billing_duration_unit": null,
              "notice_time_amount": null,
              "notice_time_unit": null,
              "termination_time_amount": null,
              "termination_time_unit": null,
              "renewal_duration_amount": null,
              "renewal_duration_unit": null,
              "is_composite_price": true,
              "_tags": [
                  "composite"
              ],
              "_schema": "price",
              "_org": "739224",
              "_owners": [
                  {
                      "org_id": "739224",
                      "user_id": "10009151"
                  }
              ],
              "_created_at": "2024-10-24T09:33:29.241Z",
              "_updated_at": "2024-10-28T11:50:59.142Z",
              "_title": "Epilot Home Energy Package Composite",
              "_acl": {
                  "view": [
                      "org_739224"
                  ],
                  "edit": [
                      "org_739224"
                  ],
                  "delete": [
                      "org_739224"
                  ]
              },
              "price_components": [],
              "$relation": {
                  "entity_id": "6d75a922-8b3b-4aa4-9438-da0357d470bd",
                  "_tags": [],
                  "_schema": "price"
              }
          },
          {
              "_id": "8a90d987-7597-45b8-af9d-7796e009ace5",
              "description": "Internal Solar Panel X2",
              "internal_description": "Internal Solar Panel X2",
              "pricing_model": "per_unit",
              "unit_amount": 2500,
              "unit_amount_currency": "EUR",
              "unit_amount_decimal": "25",
              "is_tax_inclusive": false,
              "price_display_in_journeys": "show_price",
              "active": true,
              "variable_price": null,
              "type": "one_time",
              "billing_period": null,
              "billing_duration_amount": null,
              "billing_duration_unit": null,
              "notice_time_amount": null,
              "notice_time_unit": null,
              "termination_time_amount": null,
              "termination_time_unit": null,
              "renewal_duration_amount": null,
              "renewal_duration_unit": null,
              "price_components": null,
              "_schema": "price",
              "_org": "739224",
              "_owners": [
                  {
                      "org_id": "739224",
                      "user_id": "10009151"
                  }
              ],
              "_created_at": "2024-10-25T09:12:53.074Z",
              "_updated_at": "2024-10-25T15:27:55.982Z",
              "_title": "Internal Solar Panel X2",
              "_acl": {
                  "view": [
                      "org_739224"
                  ],
                  "edit": [
                      "org_739224"
                  ],
                  "delete": [
                      "org_739224"
                  ]
              },
              "tax": [
                  {
                      "type": "VAT",
                      "description": "20 Taxi",
                      "rate": "20",
                      "active": true,
                      "region": "DE",
                      "_schema": "tax",
                      "_id": "36ee1f76-aeeb-4fbe-ba0a-1b280b5cd56c",
                      "_org": "739224",
                      "_owners": [
                          {
                              "org_id": "739224",
                              "user_id": "10009151"
                          }
                      ],
                      "_created_at": "2024-10-25T13:03:27.291Z",
                      "_updated_at": "2024-10-25T13:03:27.291Z",
                      "_title": "20 Taxi",
                      "_acl": {
                          "view": [
                              "org_739224"
                          ],
                          "edit": [
                              "org_739224"
                          ],
                          "delete": [
                              "org_739224"
                          ]
                      }
                  }
              ],
              "$relation": {
                  "entity_id": "8a90d987-7597-45b8-af9d-7796e009ace5",
                  "_tags": []
              }
          }
      ],
      "feature": [
          {
              "_id": "X-2gNzUGxn_qlRog-lmlX",
              "_tags": [],
              "value": "",
              "feature": "4kW solar system"
          },
          {
              "_id": "i_QMiNXkqe5Xc1zBwysIr",
              "_tags": [],
              "value": "",
              "feature": "  10kWh battery storage"
          },
          {
              "_id": "w8NXMYR-clvMG54zEZpZ_",
              "_tags": [],
              "value": "",
              "feature": "  Smart energy management"
          }
      ],
      "_relations": [
          {
              "entity_id": "03182c3e-a8f7-4dad-adad-5e061483a3fc",
              "_acl": {
                  "view": [
                      "org_739224",
                      "org_911486"
                  ],
                  "edit": [
                      "org_739224"
                  ],
                  "delete": [
                      "org_739224"
                  ]
              }
          },
          {
              "entity_id": "8a90d987-7597-45b8-af9d-7796e009ace5",
              "_acl": {
                  "view": [
                      "org_739224"
                  ],
                  "edit": [
                      "org_739224"
                  ],
                  "delete": [
                      "org_739224"
                  ]
              }
          },
          {
              "entity_id": "82e03707-72d8-4577-8bff-73dbac7b79ac",
              "_acl": {
                  "view": [
                      "org_739224"
                  ],
                  "edit": [
                      "org_739224"
                  ],
                  "delete": [
                      "org_739224"
                  ]
              }
          },
          {
              "entity_id": "6d75a922-8b3b-4aa4-9438-da0357d470bd",
              "_acl": {
                  "view": [
                      "org_739224"
                  ],
                  "edit": [
                      "org_739224"
                  ],
                  "delete": [
                      "org_739224"
                  ]
              }
          }
      ],
      "_viewers": {}
  },
  "blockConfiguration": {
      "isRequired": true,
      "showQuantity": false,
      "blockPath": "2/Products/ProductSelectionControl"
  },
  "price_mappings": [
      {
          "price_id": "1731716e-b9ce-400c-a376-2d3f77c31d49",
          "value": 1000,
          "frequency_unit": "monthly"
      }
  ]
} as any

export const internalSimplePrice: PriceItemDto = {
  "_id": "efe9ff76-865c-4287-8de9-422cfc741ff9",
  "description": "Basic Model - No Wifi.",
  "type": "one_time",
  "unit_amount_decimal": "230.4524",
  "unit_amount_currency": "EUR",
  "active": true,
  "sales_tax": "standard",
  "_schema": "price",
  "_org": "739224",
  "_created_at": "2021-12-15T12:34:59.579Z",
  "_updated_at": "2023-01-06T17:11:35.981Z",
  "_title": "Basic Model - No Wifi.",
  "_tags": [
      "basic-model",
      "wifi"
  ],
  "unit_amount": 23045,
  "price_display_in_journeys": "show_price",
  "tax": [
      {
          "_id": "d05c030b-1515-4c38-85fa-d2b9c3114608",
          "type": "VAT",
          "description": "MwSt.",
          "rate": 7,
          "behavior": "Inclusive",
          "active": true,
          "region": "DE",
          "region_label": "All Regions",
          "_schema": "tax",
          "_org": "739224",
          "_created_at": "2021-09-22T23:23:15.195Z",
          "_updated_at": "2023-06-28T15:35:50.057Z",
          "_title": "MwSt.",
          "_tags": [
              "german - tax"
          ],
          "_owners": [
              {
                  "org_id": "739224"
              }
          ],
          "_acl": {},
          "$relation": {
              "entity_id": "d05c030b-1515-4c38-85fa-d2b9c3114608"
          }
      }
  ],
  "variable_price": true,
  "unit": "m",
  "billing_period": "weekly",
  "billing_duration_unit": "months",
  "notice_time_unit": "months",
  "termination_time_unit": "months",
  "renewal_duration_unit": "months",
  "is_tax_inclusive": true,
  "pricing_model": "per_unit",
  "_owners": [
      {
          "org_id": "739224"
      }
  ],
  "_acl": {
      "view": [
          "org_739224"
      ],
      "edit": [
          "org_739224"
      ],
      "delete": [
          "org_739224"
      ]
  },
  "internal_description": "Basic Model - No Wifi.",
  "_relations": [
      {
          "entity_id": "beefa9f1-29a8-448e-94d5-ebf1963428f8",
          "_acl": {
              "view": [
                  "org_739224"
              ],
              "edit": [
                  "org_739224"
              ],
              "delete": [
                  "org_739224"
              ]
          }
      },
      {
          "entity_id": "664336ec-40b1-466e-95c9-3fad17ec4ddd"
      },
      {
          "entity_id": "5b59969f-65d1-4720-ae32-373baeb8cc43"
      },
      {
          "entity_id": "50861ec7-4d29-4584-9192-6b136caa76da"
      },
      {
          "entity_id": "eb6c4b62-0e07-411d-8a14-1374424e5246"
      },
      {
          "entity_id": "e678b007-893e-440d-974b-c02e81132a61"
      },
      {
          "entity_id": "0fe794f6-e7b5-4ec6-93cf-a881e7d0d37d"
      },
      {
          "entity_id": "9b267200-35e3-46ed-9d52-2030b9ec0b05"
      },
      {
          "entity_id": "acc8a9db-53d4-4063-bcd0-69eed979a31c"
      }
  ],
  "_viewers": {},
  "_coupons": [],
  "blockMappingData": {},
  "quantity": 1,
  "_price": {
      "_id": "efe9ff76-865c-4287-8de9-422cfc741ff9",
      "description": "Basic Model - No Wifi.",
      "type": "one_time",
      "unit_amount_decimal": "230.4524",
      "unit_amount_currency": "EUR",
      "active": true,
      "sales_tax": "standard",
      "_schema": "price",
      "_org": "739224",
      "_created_at": "2021-12-15T12:34:59.579Z",
      "_updated_at": "2023-01-06T17:11:35.981Z",
      "_title": "Basic Model - No Wifi.",
      "_tags": [
          "basic-model",
          "wifi"
      ],
      "unit_amount": 23045,
      "price_display_in_journeys": "show_price",
      "tax": [
          {
              "_id": "d05c030b-1515-4c38-85fa-d2b9c3114608",
              "type": "VAT",
              "description": "MwSt.",
              "rate": 7,
              "behavior": "Inclusive",
              "active": true,
              "region": "DE",
              "region_label": "All Regions",
              "_schema": "tax",
              "_org": "739224",
              "_created_at": "2021-09-22T23:23:15.195Z",
              "_updated_at": "2023-06-28T15:35:50.057Z",
              "_title": "MwSt.",
              "_tags": [
                  "german - tax"
              ],
              "_owners": [
                  {
                      "org_id": "739224"
                  }
              ],
              "_acl": {},
              "$relation": {
                  "entity_id": "d05c030b-1515-4c38-85fa-d2b9c3114608"
              }
          }
      ],
      "variable_price": true,
      "unit": "m",
      "billing_period": "weekly",
      "billing_duration_unit": "months",
      "notice_time_unit": "months",
      "termination_time_unit": "months",
      "renewal_duration_unit": "months",
      "is_tax_inclusive": true,
      "pricing_model": "per_unit",
      "_owners": [
          {
              "org_id": "739224"
          }
      ],
      "_acl": {
          "view": [
              "org_739224"
          ],
          "edit": [
              "org_739224"
          ],
          "delete": [
              "org_739224"
          ]
      },
      "internal_description": "Basic Model - No Wifi.",
      "_relations": [
          {
              "entity_id": "beefa9f1-29a8-448e-94d5-ebf1963428f8",
              "_acl": {
                  "view": [
                      "org_739224"
                  ],
                  "edit": [
                      "org_739224"
                  ],
                  "delete": [
                      "org_739224"
                  ]
              }
          },
          {
              "entity_id": "664336ec-40b1-466e-95c9-3fad17ec4ddd"
          },
          {
              "entity_id": "5b59969f-65d1-4720-ae32-373baeb8cc43"
          },
          {
              "entity_id": "50861ec7-4d29-4584-9192-6b136caa76da"
          },
          {
              "entity_id": "eb6c4b62-0e07-411d-8a14-1374424e5246"
          },
          {
              "entity_id": "e678b007-893e-440d-974b-c02e81132a61"
          },
          {
              "entity_id": "0fe794f6-e7b5-4ec6-93cf-a881e7d0d37d"
          },
          {
              "entity_id": "9b267200-35e3-46ed-9d52-2030b9ec0b05"
          },
          {
              "entity_id": "acc8a9db-53d4-4063-bcd0-69eed979a31c"
          }
      ],
      "_viewers": {},
      "_coupons": [],
      "blockMappingData": {}
  },
  "_product": {
      "name": "epilot Wallbox e-Prime",
      "type": "product",
      "code": "PWB",
      "active": true,
      "feature": [
          {
              "_tags": [],
              "feature": "Pure Energon Fueled"
          },
          {
              "_tags": [],
              "feature": "Mobile App Available"
          }
      ],
      "price_options": [
          {
              "_id": "efe9ff76-865c-4287-8de9-422cfc741ff9",
              "description": "Basic Model - No Wifi.",
              "type": "one_time",
              "unit_amount_decimal": "230.4524",
              "unit_amount_currency": "EUR",
              "active": true,
              "sales_tax": "standard",
              "_schema": "price",
              "_org": "739224",
              "_created_at": "2021-12-15T12:34:59.579Z",
              "_updated_at": "2023-01-06T17:11:35.981Z",
              "_title": "Basic Model - No Wifi.",
              "_tags": [
                  "basic-model",
                  "wifi"
              ],
              "unit_amount": 23045,
              "price_display_in_journeys": "show_price",
              "tax": [
                  {
                      "type": "VAT",
                      "description": "MwSt.",
                      "rate": 7,
                      "behavior": "Inclusive",
                      "active": true,
                      "region": "DE",
                      "region_label": "All Regions",
                      "_id": "d05c030b-1515-4c38-85fa-d2b9c3114608",
                      "_schema": "tax",
                      "_org": "739224",
                      "_created_at": "2021-09-22T23:23:15.195Z",
                      "_updated_at": "2023-06-28T15:35:50.057Z",
                      "_title": "MwSt.",
                      "_tags": [
                          "german - tax"
                      ],
                      "_owners": [
                          {
                              "org_id": "739224"
                          }
                      ],
                      "_acl": {}
                  }
              ],
              "variable_price": true,
              "unit": "m",
              "billing_period": "weekly",
              "billing_duration_unit": "months",
              "notice_time_unit": "months",
              "termination_time_unit": "months",
              "renewal_duration_unit": "months",
              "is_tax_inclusive": true,
              "pricing_model": "per_unit",
              "_owners": [
                  {
                      "org_id": "739224"
                  }
              ],
              "_acl": {
                  "view": [
                      "org_739224"
                  ],
                  "edit": [
                      "org_739224"
                  ],
                  "delete": [
                      "org_739224"
                  ]
              },
              "internal_description": "Basic Model - No Wifi.",
              "$relation": {
                  "entity_id": "efe9ff76-865c-4287-8de9-422cfc741ff9"
              }
          },
          {
              "_id": "799e6138-1969-4fe0-83a2-5acffa069db5",
              "description": "Optimus Prime E-Box",
              "type": "recurring",
              "unit_amount": 64000,
              "unit_amount_decimal": "640.00",
              "unit_amount_currency": "EUR",
              "billing_period": "every_6_months",
              "billing_duration_amount": "1",
              "billing_duration_unit": "years",
              "notice_time_amount": "1",
              "notice_time_unit": "months",
              "termination_time_amount": "1",
              "termination_time_unit": "months",
              "renewal_duration_amount": "1",
              "renewal_duration_unit": "years",
              "active": true,
              "sales_tax": "standard",
              "_schema": "price",
              "_org": "739224",
              "_created_at": "2021-12-15T12:36:25.031Z",
              "_updated_at": "2022-02-11T14:32:08.757Z",
              "_title": "Optimus Prime E-Box",
              "_tags": [
                  "energon",
                  "flash sale (-50% off)"
              ],
              "price_display_in_journeys": "show_price",
              "tax": [
                  {
                      "type": "VAT",
                      "description": "MwSt.",
                      "rate": 7,
                      "behavior": "Inclusive",
                      "active": true,
                      "region": "DE",
                      "region_label": "All Regions",
                      "_id": "d05c030b-1515-4c38-85fa-d2b9c3114608",
                      "_schema": "tax",
                      "_org": "739224",
                      "_created_at": "2021-09-22T23:23:15.195Z",
                      "_updated_at": "2023-06-28T15:35:50.057Z",
                      "_title": "MwSt.",
                      "_tags": [
                          "german - tax"
                      ],
                      "_owners": [
                          {
                              "org_id": "739224"
                          }
                      ],
                      "_acl": {}
                  }
              ],
              "internal_description": "Optimus Prime E-Box",
              "_owners": [
                  {
                      "org_id": "739224"
                  }
              ],
              "pricing_model": "per_unit",
              "is_tax_inclusive": true,
              "_acl": {
                  "view": [
                      "org_739224"
                  ],
                  "edit": [
                      "org_739224"
                  ],
                  "delete": [
                      "org_739224"
                  ]
              },
              "$relation": {
                  "entity_id": "799e6138-1969-4fe0-83a2-5acffa069db5"
              }
          },
          {
              "_id": "2dc8c8e3-1957-4890-b39b-d87ba29338e1",
              "description": "E-Box w/ Satellite Connection ~ Test1 12 ",
              "unit_amount": 1340035,
              "unit_amount_decimal": "13400.3455",
              "unit_amount_currency": "EUR",
              "active": true,
              "sales_tax": "reduced",
              "_tags": [
                  "satellitecon",
                  "wifi",
                  "eco-boost",
                  "premium"
              ],
              "_schema": "price",
              "_org": "739224",
              "_created_at": "2021-12-15T12:45:20.049Z",
              "_updated_at": "2022-01-05T15:23:35.956Z",
              "type": "one_time",
              "_title": "E-Box w/ Satellite Connection ~ Test1 12",
              "price_display_in_journeys": "show_price",
              "billing_period": "weekly",
              "billing_duration_unit": "months",
              "notice_time_unit": "months",
              "termination_time_unit": "months",
              "renewal_duration_unit": "months",
              "internal_description": "E-Box w/ Satellite Connection ~ Test1 12 ",
              "_owners": [
                  {
                      "org_id": "739224"
                  }
              ],
              "pricing_model": "per_unit",
              "is_tax_inclusive": true,
              "_acl": {
                  "view": [
                      "org_739224"
                  ],
                  "edit": [
                      "org_739224"
                  ],
                  "delete": [
                      "org_739224"
                  ]
              },
              "$relation": {
                  "entity_id": "2dc8c8e3-1957-4890-b39b-d87ba29338e1"
              }
          },
          {
              "_id": "864841b8-93c8-471b-bbe5-c06187fe1522",
              "unit_amount": 20000,
              "unit_amount_currency": "EUR",
              "unit_amount_decimal": "200",
              "sales_tax": "standard",
              "price_display_in_journeys": "show_price",
              "type": "one_time",
              "description": "test",
              "_schema": "price",
              "_org": "739224",
              "_created_at": "2022-01-05T15:04:39.482Z",
              "_updated_at": "2022-01-13T08:31:11.622Z",
              "_title": "test",
              "active": true,
              "billing_period": "weekly",
              "billing_duration_unit": "months",
              "notice_time_unit": "months",
              "termination_time_unit": "months",
              "renewal_duration_unit": "months",
              "internal_description": "test",
              "_owners": [
                  {
                      "org_id": "739224"
                  }
              ],
              "pricing_model": "per_unit",
              "is_tax_inclusive": true,
              "_acl": {
                  "view": [
                      "org_739224"
                  ],
                  "edit": [
                      "org_739224"
                  ],
                  "delete": [
                      "org_739224"
                  ]
              },
              "$relation": {
                  "entity_id": "864841b8-93c8-471b-bbe5-c06187fe1522"
              }
          },
          {
              "_id": "35618f02-f8e9-4c51-8035-655680cab2ee",
              "unit_amount": 1000,
              "unit_amount_currency": "EUR",
              "unit_amount_decimal": "10.00",
              "sales_tax": "standard",
              "price_display_in_journeys": "show_price",
              "type": "one_time",
              "_schema": "price",
              "_title": "Test With No Behaviour",
              "description": "Test With No Behaviour",
              "tax": [
                  {
                      "type": "VAT",
                      "description": "MwSt.",
                      "rate": 7,
                      "behavior": "Inclusive",
                      "active": true,
                      "region": "DE",
                      "region_label": "All Regions",
                      "_id": "d05c030b-1515-4c38-85fa-d2b9c3114608",
                      "_schema": "tax",
                      "_org": "739224",
                      "_created_at": "2021-09-22T23:23:15.195Z",
                      "_updated_at": "2023-06-28T15:35:50.057Z",
                      "_title": "MwSt.",
                      "_tags": [
                          "german - tax"
                      ],
                      "_owners": [
                          {
                              "org_id": "739224"
                          }
                      ],
                      "_acl": {}
                  }
              ],
              "_org": "739224",
              "_created_at": "2022-02-07T14:42:47.451Z",
              "_updated_at": "2022-02-07T14:42:47.451Z",
              "billing_period": "weekly",
              "billing_duration_unit": "months",
              "notice_time_unit": "months",
              "termination_time_unit": "months",
              "renewal_duration_unit": "months",
              "internal_description": "Test With No Behaviour",
              "_owners": [
                  {
                      "org_id": "739224"
                  }
              ],
              "pricing_model": "per_unit",
              "is_tax_inclusive": true,
              "active": true,
              "_acl": {
                  "view": [
                      "org_739224"
                  ],
                  "edit": [
                      "org_739224"
                  ],
                  "delete": [
                      "org_739224"
                  ]
              },
              "$relation": {
                  "entity_id": "35618f02-f8e9-4c51-8035-655680cab2ee",
                  "_tags": []
              }
          },
          {
              "_id": "dfbe996b-5c71-45b4-b33f-d20aae994f60",
              "unit_amount": 1000,
              "unit_amount_currency": "EUR",
              "unit_amount_decimal": "10.00",
              "sales_tax": "standard",
              "price_display_in_journeys": "show_price",
              "type": "one_time",
              "_schema": "price",
              "_title": "Test New Price Add Item",
              "description": "Test New Price Add Item",
              "_org": "739224",
              "_created_at": "2022-02-09T10:12:55.666Z",
              "_updated_at": "2022-12-06T11:46:22.862Z",
              "billing_period": "weekly",
              "billing_duration_unit": "months",
              "notice_time_unit": "months",
              "termination_time_unit": "months",
              "renewal_duration_unit": "months",
              "active": true,
              "internal_description": "Test New Price Add Item",
              "_owners": [
                  {
                      "org_id": "739224"
                  }
              ],
              "pricing_model": "per_unit",
              "is_tax_inclusive": true,
              "_acl": {
                  "view": [
                      "org_739224"
                  ],
                  "edit": [
                      "org_739224"
                  ],
                  "delete": [
                      "org_739224"
                  ]
              },
              "$relation": {
                  "entity_id": "dfbe996b-5c71-45b4-b33f-d20aae994f60",
                  "_tags": []
              }
          }
      ],
      "_schema": "product",
      "_id": "beefa9f1-29a8-448e-94d5-ebf1963428f8",
      "_org": "739224",
      "_created_at": "2021-12-15T12:35:08.438Z",
      "_updated_at": "2022-12-06T11:50:42.367Z",
      "_title": "epilot Wallbox e-Prime",
      "_tags": [
          "energon",
          "eco-friendly",
          "wallbox"
      ],
      "_images": {
          "type": "image",
          "attachments": [
              {
                  "key": "files/ckx7iukw9000009mq55z5fhvn/original",
                  "mime": "image/jpeg",
                  "name": "l-intro-1618185316.jpeg",
                  "size": 416684,
                  "image_url": "https://avkhavsdjq.cloudimg.io/v7/e-mage-sam-bucket-dev.s3.eu-central-1.amazonaws.com/files/ckx7iukw9000009mq55z5fhvn/original?w=100",
                  "download_url": "https://e-mage-sam-bucket-dev.s3.eu-central-1.amazonaws.com/files/ckx7iukw9000009mq55z5fhvn/original",
                  "alt_text": ""
              },
              {
                  "key": "files/ckx7iuqb4000208mp2tt2c04u/original",
                  "mime": "image/jpeg",
                  "name": "Optimus_Prime-Transformers_2007-Ketchup.jpeg",
                  "size": 376077,
                  "image_url": "https://avkhavsdjq.cloudimg.io/v7/e-mage-sam-bucket-dev.s3.eu-central-1.amazonaws.com/files/ckx7iuqb4000208mp2tt2c04u/original?w=100",
                  "download_url": "https://e-mage-sam-bucket-dev.s3.eu-central-1.amazonaws.com/files/ckx7iuqb4000208mp2tt2c04u/original",
                  "alt_text": ""
              },
              {
                  "key": "files/ckx7iv2ix000408i919ju74v8/original",
                  "mime": "image/png",
                  "name": "TUV-1000x1000.png",
                  "size": 265639,
                  "image_url": "https://avkhavsdjq.cloudimg.io/v7/e-mage-sam-bucket-dev.s3.eu-central-1.amazonaws.com/files/ckx7iv2ix000408i919ju74v8/original?w=100",
                  "download_url": "https://e-mage-sam-bucket-dev.s3.eu-central-1.amazonaws.com/files/ckx7iv2ix000408i919ju74v8/original",
                  "alt_text": ""
              },
              {
                  "key": "files/ckx7iv80s000408mp1v7rfe2t/original",
                  "mime": "image/jpeg",
                  "name": "wallbox_i9lcd_app_principal-1000x1000.jpeg",
                  "size": 98006,
                  "image_url": "https://avkhavsdjq.cloudimg.io/v7/e-mage-sam-bucket-dev.s3.eu-central-1.amazonaws.com/files/ckx7iv80s000408mp1v7rfe2t/original?w=100",
                  "download_url": "https://e-mage-sam-bucket-dev.s3.eu-central-1.amazonaws.com/files/ckx7iv80s000408mp1v7rfe2t/original",
                  "alt_text": ""
              },
              {
                  "key": "files/ckx7iva48000508mpgvr62jxv/original",
                  "mime": "image/jpeg",
                  "name": "wallbox_i9lcd_suporte-1000x1000.jpeg",
                  "size": 109652,
                  "image_url": "https://avkhavsdjq.cloudimg.io/v7/e-mage-sam-bucket-dev.s3.eu-central-1.amazonaws.com/files/ckx7iva48000508mpgvr62jxv/original?w=100",
                  "download_url": "https://e-mage-sam-bucket-dev.s3.eu-central-1.amazonaws.com/files/ckx7iva48000508mpgvr62jxv/original",
                  "alt_text": ""
              },
              {
                  "key": "files/ckx7ivcc9000608mp3hyhat6a/original",
                  "mime": "image/jpeg",
                  "name": "wallbox_i9lcd_tec2-1000x1000.jpeg",
                  "size": 117114,
                  "image_url": "https://avkhavsdjq.cloudimg.io/v7/e-mage-sam-bucket-dev.s3.eu-central-1.amazonaws.com/files/ckx7ivcc9000608mp3hyhat6a/original?w=100",
                  "download_url": "https://e-mage-sam-bucket-dev.s3.eu-central-1.amazonaws.com/files/ckx7ivcc9000608mp3hyhat6a/original",
                  "alt_text": ""
              },
              {
                  "key": "files/ckx7ive5p000708mp4w046ypa/original",
                  "mime": "image/jpeg",
                  "name": "wallbox-pulsar-plus-48-review.jpeg",
                  "size": 68647,
                  "image_url": "https://avkhavsdjq.cloudimg.io/v7/e-mage-sam-bucket-dev.s3.eu-central-1.amazonaws.com/files/ckx7ive5p000708mp4w046ypa/original?w=100",
                  "download_url": "https://e-mage-sam-bucket-dev.s3.eu-central-1.amazonaws.com/files/ckx7ive5p000708mp4w046ypa/original",
                  "alt_text": ""
              },
              {
                  "key": "files/ckx7ivg07000808mp14228hy6/original",
                  "mime": "image/jpeg",
                  "name": "wallboxlcd_i9principal-1000x1000.jpeg",
                  "size": 80604,
                  "image_url": "https://avkhavsdjq.cloudimg.io/v7/e-mage-sam-bucket-dev.s3.eu-central-1.amazonaws.com/files/ckx7ivg07000808mp14228hy6/original?w=100",
                  "download_url": "https://e-mage-sam-bucket-dev.s3.eu-central-1.amazonaws.com/files/ckx7ivg07000808mp14228hy6/original",
                  "alt_text": ""
              }
          ]
      },
      "_files": [
          {
              "_id": "d0b1b647-10e6-4787-9754-fa89c6a57946",
              "filename": "solar_panel_ph.jpeg",
              "access_control": "private",
              "size_bytes": 15256,
              "mime_type": "image/jpeg",
              "readable_size": "14.9 KB",
              "type": "image",
              "public_url": "https://epilot-dev-user-content.s3.eu-central-1.amazonaws.com/739224/507c47a5-a80d-4aa8-9410-91df79e7bdcd/solar_panel_ph.jpeg",
              "versions": [
                  {
                      "s3ref": {
                          "bucket": "epilot-dev-user-content",
                          "key": "739224/507c47a5-a80d-4aa8-9410-91df79e7bdcd/solar_panel_ph.jpeg"
                      },
                      "filename": "solar_panel_ph.jpeg",
                      "access_control": "private",
                      "size_bytes": 15256,
                      "mime_type": "image/jpeg",
                      "readable_size": "14.9 KB",
                      "type": "image",
                      "public_url": "https://epilot-dev-user-content.s3.eu-central-1.amazonaws.com/739224/507c47a5-a80d-4aa8-9410-91df79e7bdcd/solar_panel_ph.jpeg"
                  }
              ],
              "_schema": "file",
              "_org": "739224",
              "_created_at": "2022-01-10T16:09:55.722Z",
              "_updated_at": "2022-01-10T16:09:55.722Z",
              "_title": "solar_panel_ph.jpeg",
              "$relation": {
                  "entity_id": "d0b1b647-10e6-4787-9754-fa89c6a57946",
                  "_schema": "file",
                  "relationText": "solar_panel_ph.jpeg",
                  "size_bytes": 15256,
                  "mime_type": "image/jpeg",
                  "filename": "solar_panel_ph.jpeg",
                  "s3ref": {
                      "bucket": "epilot-dev-user-content",
                      "key": "739224/507c47a5-a80d-4aa8-9410-91df79e7bdcd/solar_panel_ph.jpeg"
                  },
                  "access_control": "private"
              }
          }
      ],
      "_attachments": {
          "type": "file",
          "attachments": [
              {
                  "key": "files/ckx7ixjwk000c08mpe7624d1u/original",
                  "mime": "application/pdf",
                  "name": "Copper-Series 22Kw Wallbox Pack (Adjustable 6A to 32A) 3-phase.pdf",
                  "size": 889078,
                  "image_url": "https://avkhavsdjq.cloudimg.io/v7/e-mage-sam-bucket-dev.s3.eu-central-1.amazonaws.com/files/ckx7ixjwk000c08mpe7624d1u/original?w=100",
                  "download_url": "https://e-mage-sam-bucket-dev.s3.eu-central-1.amazonaws.com/files/ckx7ixjwk000c08mpe7624d1u/original",
                  "alt_text": ""
              }
          ]
      },
      "__images": [
          {
              "access_control": "private",
              "filename": "2-20-2-21-23-39-29m.jpeg",
              "mime_type": "image/jpeg",
              "readable_size": "37.87 KB",
              "size_bytes": 38775,
              "type": "image",
              "file_entity_id": "beaf8166-a052-4767-b19b-d1a89306287b",
              "s3ref": {
                  "bucket": "epilot-dev-user-content",
                  "key": "739224/cf3caa8b-9b16-43b4-ad47-249187b5271a/2-20-2-21-23-39-29m.jpeg"
              }
          },
          {
              "access_control": "private",
              "filename": "0a3ad697-afec-4e0d-8dd1-c5a1a9ee2425_How-to-get-started-with-Google-AdWords-for-your-marketplace.-.jpg",
              "mime_type": "image/jpeg",
              "readable_size": "610.83 KB",
              "size_bytes": 625488,
              "type": "image",
              "file_entity_id": "657c1afd-58d2-483f-96fb-6b31ce0fe5de",
              "s3ref": {
                  "bucket": "epilot-dev-user-content",
                  "key": "739224/88e96835-5d17-48b3-aeaf-3d72c0f733b8/0a3ad697-afec-4e0d-8dd1-c5a1a9ee2425_How-to-get-started-with-Google-AdWords-for-your-marketplace.-.jpg"
              }
          }
      ],
      "attachments": {
          "_images": [
              {
                  "entity_id": "9c4de5db-53ca-49cc-b677-8dace3117099",
                  "size_bytes": 97378,
                  "mime_type": "image/webp",
                  "filename": "a077Rpv_700bwp.webp",
                  "s3ref": {
                      "bucket": "epilot-dev-user-content",
                      "key": "739224/ab2818ab-4b90-42a2-bd55-324f4a3860bb/a077Rpv_700bwp.webp"
                  },
                  "access_control": "private"
              },
              {
                  "entity_id": "665af01b-2490-4509-9706-9d2c2086bd87",
                  "size_bytes": 33430,
                  "mime_type": "image/webp",
                  "filename": "aLv9566_700bwp.webp",
                  "s3ref": {
                      "bucket": "epilot-dev-user-content",
                      "key": "739224/6c077ba7-db4c-4fab-91c0-65ce45bddc15/aLv9566_700bwp.webp"
                  },
                  "access_control": "private"
              }
          ]
      },
      "internal_name": "epilot Wallbox e-Prime",
      "_owners": [
          {
              "org_id": "739224"
          }
      ],
      "_acl": {
          "view": [
              "org_739224"
          ],
          "edit": [
              "org_739224"
          ],
          "delete": [
              "org_739224"
          ]
      },
      "_relations": [
          {
              "entity_id": "fa2a2681-b993-4676-82ec-f363c9bd71ec"
          },
          {
              "entity_id": "efe9ff76-865c-4287-8de9-422cfc741ff9",
              "_acl": {
                  "view": [
                      "org_739224"
                  ],
                  "edit": [
                      "org_739224"
                  ],
                  "delete": [
                      "org_739224"
                  ]
              }
          },
          {
              "entity_id": "c3f4c90e-8236-4358-8b59-e3381c56d3d7",
              "_acl": {
                  "view": [
                      "org_739224"
                  ],
                  "edit": [
                      "org_739224"
                  ],
                  "delete": [
                      "org_739224"
                  ]
              }
          },
          {
              "entity_id": "d0b1b647-10e6-4787-9754-fa89c6a57946"
          },
          {
              "entity_id": "dfbe996b-5c71-45b4-b33f-d20aae994f60",
              "_acl": {
                  "view": [
                      "org_739224"
                  ],
                  "edit": [
                      "org_739224"
                  ],
                  "delete": [
                      "org_739224"
                  ]
              }
          },
          {
              "entity_id": "c5b57511-d624-4b29-81aa-507056a1761f",
              "_acl": {
                  "view": [
                      "org_739224"
                  ],
                  "edit": [
                      "org_739224"
                  ],
                  "delete": [
                      "org_739224"
                  ]
              }
          },
          {
              "entity_id": "ccc5c742-e1c7-49c5-ac2e-5b11fd693c5a",
              "_acl": {
                  "view": [
                      "org_739224"
                  ],
                  "edit": [
                      "org_739224"
                  ],
                  "delete": [
                      "org_739224"
                  ]
              }
          },
          {
              "entity_id": "c117a7aa-e559-4147-a815-f4042a40eba8"
          },
          {
              "entity_id": "2dc8c8e3-1957-4890-b39b-d87ba29338e1",
              "_acl": {
                  "view": [
                      "org_739224"
                  ],
                  "edit": [
                      "org_739224"
                  ],
                  "delete": [
                      "org_739224"
                  ]
              }
          },
          {
              "entity_id": "35618f02-f8e9-4c51-8035-655680cab2ee",
              "_acl": {
                  "view": [
                      "org_739224"
                  ],
                  "edit": [
                      "org_739224"
                  ],
                  "delete": [
                      "org_739224"
                  ]
              }
          },
          {
              "entity_id": "39066fe4-42a6-4ddf-b94a-630c0262a48f"
          },
          {
              "entity_id": "1d0b36e0-395e-4c6a-96c7-7c30fa8824fe"
          },
          {
              "entity_id": "799e6138-1969-4fe0-83a2-5acffa069db5",
              "_acl": {
                  "view": [
                      "org_739224"
                  ],
                  "edit": [
                      "org_739224"
                  ],
                  "delete": [
                      "org_739224"
                  ]
              }
          },
          {
              "entity_id": "a75092d4-43bf-464a-97cc-7e3fc4ef3837",
              "_acl": {
                  "view": [
                      "org_739224"
                  ],
                  "edit": [
                      "org_739224"
                  ],
                  "delete": [
                      "org_739224"
                  ]
              }
          },
          {
              "entity_id": "864841b8-93c8-471b-bbe5-c06187fe1522",
              "_acl": {
                  "view": [
                      "org_739224"
                  ],
                  "edit": [
                      "org_739224"
                  ],
                  "delete": [
                      "org_739224"
                  ]
              }
          },
          {
              "entity_id": "4d06c007-d6e7-43ae-af70-c7129c89ec76",
              "_acl": {
                  "view": [
                      "org_739224"
                  ],
                  "edit": [
                      "org_739224"
                  ],
                  "delete": [
                      "org_739224"
                  ]
              }
          },
          {
              "entity_id": "455d903e-f87d-4b03-a46a-82edfa877416"
          }
      ],
      "_viewers": {}
  },
  "blockConfiguration": {
      "isRequired": false,
      "showQuantity": false,
      "blockPath": "3/Cross Products/ProductSelectionControl"
  }
} as any;

export const internalSimplePriceV2: PriceItemDto = {
    "_id": "efe9ff76-865c-4287-8de9-422cfc741ff8",
    "description": "Advanced Model- With Wifi.",
    "type": "one_time",
    "unit_amount_decimal": "240.4524",
    "unit_amount_currency": "EUR",
    "active": true,
    "sales_tax": "standard",
    "_schema": "price",
    "_org": "739224",
    "_created_at": "2021-12-15T12:34:59.579Z",
    "_updated_at": "2023-01-06T17:11:35.981Z",
    "_title": "Advanced Model- With Wifi.",
    "_tags": [
        "basic-model",
        "wifi"
    ],
    "unit_amount": 24045,
    "price_display_in_journeys": "show_price",
    "tax": [
        {
            "_id": "d05c030b-1515-4c38-85fa-d2b9c3114608",
            "type": "VAT",
            "description": "MwSt.",
            "rate": 7,
            "behavior": "Inclusive",
            "active": true,
            "region": "DE",
            "region_label": "All Regions",
            "_schema": "tax",
            "_org": "739224",
            "_created_at": "2021-09-22T23:23:15.195Z",
            "_updated_at": "2023-06-28T15:35:50.057Z",
            "_title": "MwSt.",
            "_tags": [
                "german - tax"
            ],
            "_owners": [
                {
                    "org_id": "739224"
                }
            ],
            "_acl": {},
            "$relation": {
                "entity_id": "d05c030b-1515-4c38-85fa-d2b9c3114608"
            }
        }
    ],
    "variable_price": true,
    "unit": "m",
    "billing_period": "weekly",
    "billing_duration_unit": "months",
    "notice_time_unit": "months",
    "termination_time_unit": "months",
    "renewal_duration_unit": "months",
    "is_tax_inclusive": true,
    "pricing_model": "per_unit",
    "_owners": [
        {
            "org_id": "739224"
        }
    ],
    "_acl": {
        "view": [
            "org_739224"
        ],
        "edit": [
            "org_739224"
        ],
        "delete": [
            "org_739224"
        ]
    },
    "internal_description": "Advanced Model- With Wifi.",
    "_relations": [
        {
            "entity_id": "beefa9f1-29a8-448e-94d5-ebf1963428f8",
            "_acl": {
                "view": [
                    "org_739224"
                ],
                "edit": [
                    "org_739224"
                ],
                "delete": [
                    "org_739224"
                ]
            }
        },
        {
            "entity_id": "664336ec-40b1-466e-95c9-3fad17ec4ddd"
        },
        {
            "entity_id": "5b59969f-65d1-4720-ae32-373baeb8cc43"
        },
        {
            "entity_id": "50861ec7-4d29-4584-9192-6b136caa76da"
        },
        {
            "entity_id": "eb6c4b62-0e07-411d-8a14-1374424e5246"
        },
        {
            "entity_id": "e678b007-893e-440d-974b-c02e81132a61"
        },
        {
            "entity_id": "0fe794f6-e7b5-4ec6-93cf-a881e7d0d37d"
        },
        {
            "entity_id": "9b267200-35e3-46ed-9d52-2030b9ec0b05"
        },
        {
            "entity_id": "acc8a9db-53d4-4063-bcd0-69eed979a31c"
        }
    ],
    "_viewers": {},
    "_coupons": [],
    "blockMappingData": {},
    "quantity": 1,
    "_price": {
        "_id": "efe9ff76-865c-4287-8de9-422cfc741ff8",
        "description": "Advanced Model- With Wifi.",
        "type": "one_time",
        "unit_amount_decimal": "240.4524",
        "unit_amount_currency": "EUR",
        "active": true,
        "sales_tax": "standard",
        "_schema": "price",
        "_org": "739224",
        "_created_at": "2021-12-15T12:34:59.579Z",
        "_updated_at": "2023-01-06T17:11:35.981Z",
        "_title": "Advanced Model- With Wifi.",
        "_tags": [
            "basic-model",
            "wifi"
        ],
        "unit_amount": 24045,
        "price_display_in_journeys": "show_price",
        "tax": [
            {
                "_id": "d05c030b-1515-4c38-85fa-d2b9c3114608",
                "type": "VAT",
                "description": "MwSt.",
                "rate": 7,
                "behavior": "Inclusive",
                "active": true,
                "region": "DE",
                "region_label": "All Regions",
                "_schema": "tax",
                "_org": "739224",
                "_created_at": "2021-09-22T23:23:15.195Z",
                "_updated_at": "2023-06-28T15:35:50.057Z",
                "_title": "MwSt.",
                "_tags": [
                    "german - tax"
                ],
                "_owners": [
                    {
                        "org_id": "739224"
                    }
                ],
                "_acl": {},
                "$relation": {
                    "entity_id": "d05c030b-1515-4c38-85fa-d2b9c3114608"
                }
            }
        ],
        "variable_price": true,
        "unit": "m",
        "billing_period": "weekly",
        "billing_duration_unit": "months",
        "notice_time_unit": "months",
        "termination_time_unit": "months",
        "renewal_duration_unit": "months",
        "is_tax_inclusive": true,
        "pricing_model": "per_unit",
        "_owners": [
            {
                "org_id": "739224"
            }
        ],
        "_acl": {
            "view": [
                "org_739224"
            ],
            "edit": [
                "org_739224"
            ],
            "delete": [
                "org_739224"
            ]
        },
        "internal_description": "Advanced Model- With Wifi.",
        "_relations": [
            {
                "entity_id": "beefa9f1-29a8-448e-94d5-ebf1963428f8",
                "_acl": {
                    "view": [
                        "org_739224"
                    ],
                    "edit": [
                        "org_739224"
                    ],
                    "delete": [
                        "org_739224"
                    ]
                }
            },
            {
                "entity_id": "664336ec-40b1-466e-95c9-3fad17ec4ddd"
            },
            {
                "entity_id": "5b59969f-65d1-4720-ae32-373baeb8cc43"
            },
            {
                "entity_id": "50861ec7-4d29-4584-9192-6b136caa76da"
            },
            {
                "entity_id": "eb6c4b62-0e07-411d-8a14-1374424e5246"
            },
            {
                "entity_id": "e678b007-893e-440d-974b-c02e81132a61"
            },
            {
                "entity_id": "0fe794f6-e7b5-4ec6-93cf-a881e7d0d37d"
            },
            {
                "entity_id": "9b267200-35e3-46ed-9d52-2030b9ec0b05"
            },
            {
                "entity_id": "acc8a9db-53d4-4063-bcd0-69eed979a31c"
            }
        ],
        "_viewers": {},
        "_coupons": [],
        "blockMappingData": {}
    },
    "_product": {
        "name": "epilot Wallbox e-Prime V2",
        "type": "product",
        "code": "PWB",
        "active": true,
        "feature": [
            {
                "_tags": [],
                "feature": "Pure Energon Fueled"
            },
            {
                "_tags": [],
                "feature": "Mobile App Available"
            }
        ],
        "price_options": [
            {
                "_id": "efe9ff76-865c-4287-8de9-422cfc741ff8",
                "description": "Advanced Model- With Wifi.",
                "type": "one_time",
                "unit_amount_decimal": "240.4524",
                "unit_amount_currency": "EUR",
                "active": true,
                "sales_tax": "standard",
                "_schema": "price",
                "_org": "739224",
                "_created_at": "2021-12-15T12:34:59.579Z",
                "_updated_at": "2023-01-06T17:11:35.981Z",
                "_title": "Advanced Model- With Wifi.",
                "_tags": [
                    "basic-model",
                    "wifi"
                ],
                "unit_amount": 24045,
                "price_display_in_journeys": "show_price",
                "tax": [
                    {
                        "type": "VAT",
                        "description": "MwSt.",
                        "rate": 7,
                        "behavior": "Inclusive",
                        "active": true,
                        "region": "DE",
                        "region_label": "All Regions",
                        "_id": "d05c030b-1515-4c38-85fa-d2b9c3114608",
                        "_schema": "tax",
                        "_org": "739224",
                        "_created_at": "2021-09-22T23:23:15.195Z",
                        "_updated_at": "2023-06-28T15:35:50.057Z",
                        "_title": "MwSt.",
                        "_tags": [
                            "german - tax"
                        ],
                        "_owners": [
                            {
                                "org_id": "739224"
                            }
                        ],
                        "_acl": {}
                    }
                ],
                "variable_price": true,
                "unit": "m",
                "billing_period": "weekly",
                "billing_duration_unit": "months",
                "notice_time_unit": "months",
                "termination_time_unit": "months",
                "renewal_duration_unit": "months",
                "is_tax_inclusive": true,
                "pricing_model": "per_unit",
                "_owners": [
                    {
                        "org_id": "739224"
                    }
                ],
                "_acl": {
                    "view": [
                        "org_739224"
                    ],
                    "edit": [
                        "org_739224"
                    ],
                    "delete": [
                        "org_739224"
                    ]
                },
                "internal_description": "Advanced Model- With Wifi.",
                "$relation": {
                    "entity_id": "efe9ff76-865c-4287-8de9-422cfc741ff8"
                }
            },
            {
                "_id": "799e6138-1969-4fe0-83a2-5acffa069db5",
                "description": "Optimus Prime E-Box",
                "type": "recurring",
                "unit_amount": 64000,
                "unit_amount_decimal": "640.00",
                "unit_amount_currency": "EUR",
                "billing_period": "every_6_months",
                "billing_duration_amount": "1",
                "billing_duration_unit": "years",
                "notice_time_amount": "1",
                "notice_time_unit": "months",
                "termination_time_amount": "1",
                "termination_time_unit": "months",
                "renewal_duration_amount": "1",
                "renewal_duration_unit": "years",
                "active": true,
                "sales_tax": "standard",
                "_schema": "price",
                "_org": "739224",
                "_created_at": "2021-12-15T12:36:25.031Z",
                "_updated_at": "2022-02-11T14:32:08.757Z",
                "_title": "Optimus Prime E-Box",
                "_tags": [
                    "energon",
                    "flash sale (-50% off)"
                ],
                "price_display_in_journeys": "show_price",
                "tax": [
                    {
                        "type": "VAT",
                        "description": "MwSt.",
                        "rate": 7,
                        "behavior": "Inclusive",
                        "active": true,
                        "region": "DE",
                        "region_label": "All Regions",
                        "_id": "d05c030b-1515-4c38-85fa-d2b9c3114608",
                        "_schema": "tax",
                        "_org": "739224",
                        "_created_at": "2021-09-22T23:23:15.195Z",
                        "_updated_at": "2023-06-28T15:35:50.057Z",
                        "_title": "MwSt.",
                        "_tags": [
                            "german - tax"
                        ],
                        "_owners": [
                            {
                                "org_id": "739224"
                            }
                        ],
                        "_acl": {}
                    }
                ],
                "internal_description": "Optimus Prime E-Box",
                "_owners": [
                    {
                        "org_id": "739224"
                    }
                ],
                "pricing_model": "per_unit",
                "is_tax_inclusive": true,
                "_acl": {
                    "view": [
                        "org_739224"
                    ],
                    "edit": [
                        "org_739224"
                    ],
                    "delete": [
                        "org_739224"
                    ]
                },
                "$relation": {
                    "entity_id": "799e6138-1969-4fe0-83a2-5acffa069db5"
                }
            },
            {
                "_id": "2dc8c8e3-1957-4890-b39b-d87ba29338e1",
                "description": "E-Box w/ Satellite Connection ~ Test1 12 ",
                "unit_amount": 1340035,
                "unit_amount_decimal": "13400.3455",
                "unit_amount_currency": "EUR",
                "active": true,
                "sales_tax": "reduced",
                "_tags": [
                    "satellitecon",
                    "wifi",
                    "eco-boost",
                    "premium"
                ],
                "_schema": "price",
                "_org": "739224",
                "_created_at": "2021-12-15T12:45:20.049Z",
                "_updated_at": "2022-01-05T15:23:35.956Z",
                "type": "one_time",
                "_title": "E-Box w/ Satellite Connection ~ Test1 12",
                "price_display_in_journeys": "show_price",
                "billing_period": "weekly",
                "billing_duration_unit": "months",
                "notice_time_unit": "months",
                "termination_time_unit": "months",
                "renewal_duration_unit": "months",
                "internal_description": "E-Box w/ Satellite Connection ~ Test1 12 ",
                "_owners": [
                    {
                        "org_id": "739224"
                    }
                ],
                "pricing_model": "per_unit",
                "is_tax_inclusive": true,
                "_acl": {
                    "view": [
                        "org_739224"
                    ],
                    "edit": [
                        "org_739224"
                    ],
                    "delete": [
                        "org_739224"
                    ]
                },
                "$relation": {
                    "entity_id": "2dc8c8e3-1957-4890-b39b-d87ba29338e1"
                }
            },
            {
                "_id": "864841b8-93c8-471b-bbe5-c06187fe1522",
                "unit_amount": 20000,
                "unit_amount_currency": "EUR",
                "unit_amount_decimal": "200",
                "sales_tax": "standard",
                "price_display_in_journeys": "show_price",
                "type": "one_time",
                "description": "test",
                "_schema": "price",
                "_org": "739224",
                "_created_at": "2022-01-05T15:04:39.482Z",
                "_updated_at": "2022-01-13T08:31:11.622Z",
                "_title": "test",
                "active": true,
                "billing_period": "weekly",
                "billing_duration_unit": "months",
                "notice_time_unit": "months",
                "termination_time_unit": "months",
                "renewal_duration_unit": "months",
                "internal_description": "test",
                "_owners": [
                    {
                        "org_id": "739224"
                    }
                ],
                "pricing_model": "per_unit",
                "is_tax_inclusive": true,
                "_acl": {
                    "view": [
                        "org_739224"
                    ],
                    "edit": [
                        "org_739224"
                    ],
                    "delete": [
                        "org_739224"
                    ]
                },
                "$relation": {
                    "entity_id": "864841b8-93c8-471b-bbe5-c06187fe1522"
                }
            },
            {
                "_id": "35618f02-f8e9-4c51-8035-655680cab2ee",
                "unit_amount": 1000,
                "unit_amount_currency": "EUR",
                "unit_amount_decimal": "10.00",
                "sales_tax": "standard",
                "price_display_in_journeys": "show_price",
                "type": "one_time",
                "_schema": "price",
                "_title": "Test With No Behaviour",
                "description": "Test With No Behaviour",
                "tax": [
                    {
                        "type": "VAT",
                        "description": "MwSt.",
                        "rate": 7,
                        "behavior": "Inclusive",
                        "active": true,
                        "region": "DE",
                        "region_label": "All Regions",
                        "_id": "d05c030b-1515-4c38-85fa-d2b9c3114608",
                        "_schema": "tax",
                        "_org": "739224",
                        "_created_at": "2021-09-22T23:23:15.195Z",
                        "_updated_at": "2023-06-28T15:35:50.057Z",
                        "_title": "MwSt.",
                        "_tags": [
                            "german - tax"
                        ],
                        "_owners": [
                            {
                                "org_id": "739224"
                            }
                        ],
                        "_acl": {}
                    }
                ],
                "_org": "739224",
                "_created_at": "2022-02-07T14:42:47.451Z",
                "_updated_at": "2022-02-07T14:42:47.451Z",
                "billing_period": "weekly",
                "billing_duration_unit": "months",
                "notice_time_unit": "months",
                "termination_time_unit": "months",
                "renewal_duration_unit": "months",
                "internal_description": "Test With No Behaviour",
                "_owners": [
                    {
                        "org_id": "739224"
                    }
                ],
                "pricing_model": "per_unit",
                "is_tax_inclusive": true,
                "active": true,
                "_acl": {
                    "view": [
                        "org_739224"
                    ],
                    "edit": [
                        "org_739224"
                    ],
                    "delete": [
                        "org_739224"
                    ]
                },
                "$relation": {
                    "entity_id": "35618f02-f8e9-4c51-8035-655680cab2ee",
                    "_tags": []
                }
            },
            {
                "_id": "dfbe996b-5c71-45b4-b33f-d20aae994f60",
                "unit_amount": 1000,
                "unit_amount_currency": "EUR",
                "unit_amount_decimal": "10.00",
                "sales_tax": "standard",
                "price_display_in_journeys": "show_price",
                "type": "one_time",
                "_schema": "price",
                "_title": "Test New Price Add Item",
                "description": "Test New Price Add Item",
                "_org": "739224",
                "_created_at": "2022-02-09T10:12:55.666Z",
                "_updated_at": "2022-12-06T11:46:22.862Z",
                "billing_period": "weekly",
                "billing_duration_unit": "months",
                "notice_time_unit": "months",
                "termination_time_unit": "months",
                "renewal_duration_unit": "months",
                "active": true,
                "internal_description": "Test New Price Add Item",
                "_owners": [
                    {
                        "org_id": "739224"
                    }
                ],
                "pricing_model": "per_unit",
                "is_tax_inclusive": true,
                "_acl": {
                    "view": [
                        "org_739224"
                    ],
                    "edit": [
                        "org_739224"
                    ],
                    "delete": [
                        "org_739224"
                    ]
                },
                "$relation": {
                    "entity_id": "dfbe996b-5c71-45b4-b33f-d20aae994f60",
                    "_tags": []
                }
            }
        ],
        "_schema": "product",
        "_id": "beefa9f1-29a8-448e-94d5-ebf1963428f8",
        "_org": "739224",
        "_created_at": "2021-12-15T12:35:08.438Z",
        "_updated_at": "2022-12-06T11:50:42.367Z",
        "_title": "epilot Wallbox e-Prime V2",
        "_tags": [
            "energon",
            "eco-friendly",
            "wallbox"
        ],
        "_images": {
            "type": "image",
            "attachments": [
                {
                    "key": "files/ckx7iukw9000009mq55z5fhvn/original",
                    "mime": "image/jpeg",
                    "name": "l-intro-1618185316.jpeg",
                    "size": 416684,
                    "image_url": "https://avkhavsdjq.cloudimg.io/v7/e-mage-sam-bucket-dev.s3.eu-central-1.amazonaws.com/files/ckx7iukw9000009mq55z5fhvn/original?w=100",
                    "download_url": "https://e-mage-sam-bucket-dev.s3.eu-central-1.amazonaws.com/files/ckx7iukw9000009mq55z5fhvn/original",
                    "alt_text": ""
                },
                {
                    "key": "files/ckx7iuqb4000208mp2tt2c04u/original",
                    "mime": "image/jpeg",
                    "name": "Optimus_Prime-Transformers_2007-Ketchup.jpeg",
                    "size": 376077,
                    "image_url": "https://avkhavsdjq.cloudimg.io/v7/e-mage-sam-bucket-dev.s3.eu-central-1.amazonaws.com/files/ckx7iuqb4000208mp2tt2c04u/original?w=100",
                    "download_url": "https://e-mage-sam-bucket-dev.s3.eu-central-1.amazonaws.com/files/ckx7iuqb4000208mp2tt2c04u/original",
                    "alt_text": ""
                },
                {
                    "key": "files/ckx7iv2ix000408i919ju74v8/original",
                    "mime": "image/png",
                    "name": "TUV-1000x1000.png",
                    "size": 265639,
                    "image_url": "https://avkhavsdjq.cloudimg.io/v7/e-mage-sam-bucket-dev.s3.eu-central-1.amazonaws.com/files/ckx7iv2ix000408i919ju74v8/original?w=100",
                    "download_url": "https://e-mage-sam-bucket-dev.s3.eu-central-1.amazonaws.com/files/ckx7iv2ix000408i919ju74v8/original",
                    "alt_text": ""
                },
                {
                    "key": "files/ckx7iv80s000408mp1v7rfe2t/original",
                    "mime": "image/jpeg",
                    "name": "wallbox_i9lcd_app_principal-1000x1000.jpeg",
                    "size": 98006,
                    "image_url": "https://avkhavsdjq.cloudimg.io/v7/e-mage-sam-bucket-dev.s3.eu-central-1.amazonaws.com/files/ckx7iv80s000408mp1v7rfe2t/original?w=100",
                    "download_url": "https://e-mage-sam-bucket-dev.s3.eu-central-1.amazonaws.com/files/ckx7iv80s000408mp1v7rfe2t/original",
                    "alt_text": ""
                },
                {
                    "key": "files/ckx7iva48000508mpgvr62jxv/original",
                    "mime": "image/jpeg",
                    "name": "wallbox_i9lcd_suporte-1000x1000.jpeg",
                    "size": 109652,
                    "image_url": "https://avkhavsdjq.cloudimg.io/v7/e-mage-sam-bucket-dev.s3.eu-central-1.amazonaws.com/files/ckx7iva48000508mpgvr62jxv/original?w=100",
                    "download_url": "https://e-mage-sam-bucket-dev.s3.eu-central-1.amazonaws.com/files/ckx7iva48000508mpgvr62jxv/original",
                    "alt_text": ""
                },
                {
                    "key": "files/ckx7ivcc9000608mp3hyhat6a/original",
                    "mime": "image/jpeg",
                    "name": "wallbox_i9lcd_tec2-1000x1000.jpeg",
                    "size": 117114,
                    "image_url": "https://avkhavsdjq.cloudimg.io/v7/e-mage-sam-bucket-dev.s3.eu-central-1.amazonaws.com/files/ckx7ivcc9000608mp3hyhat6a/original?w=100",
                    "download_url": "https://e-mage-sam-bucket-dev.s3.eu-central-1.amazonaws.com/files/ckx7ivcc9000608mp3hyhat6a/original",
                    "alt_text": ""
                },
                {
                    "key": "files/ckx7ive5p000708mp4w046ypa/original",
                    "mime": "image/jpeg",
                    "name": "wallbox-pulsar-plus-48-review.jpeg",
                    "size": 68647,
                    "image_url": "https://avkhavsdjq.cloudimg.io/v7/e-mage-sam-bucket-dev.s3.eu-central-1.amazonaws.com/files/ckx7ive5p000708mp4w046ypa/original?w=100",
                    "download_url": "https://e-mage-sam-bucket-dev.s3.eu-central-1.amazonaws.com/files/ckx7ive5p000708mp4w046ypa/original",
                    "alt_text": ""
                },
                {
                    "key": "files/ckx7ivg07000808mp14228hy6/original",
                    "mime": "image/jpeg",
                    "name": "wallboxlcd_i9principal-1000x1000.jpeg",
                    "size": 80604,
                    "image_url": "https://avkhavsdjq.cloudimg.io/v7/e-mage-sam-bucket-dev.s3.eu-central-1.amazonaws.com/files/ckx7ivg07000808mp14228hy6/original?w=100",
                    "download_url": "https://e-mage-sam-bucket-dev.s3.eu-central-1.amazonaws.com/files/ckx7ivg07000808mp14228hy6/original",
                    "alt_text": ""
                }
            ]
        },
        "_files": [
            {
                "_id": "d0b1b647-10e6-4787-9754-fa89c6a57946",
                "filename": "solar_panel_ph.jpeg",
                "access_control": "private",
                "size_bytes": 15256,
                "mime_type": "image/jpeg",
                "readable_size": "14.9 KB",
                "type": "image",
                "public_url": "https://epilot-dev-user-content.s3.eu-central-1.amazonaws.com/739224/507c47a5-a80d-4aa8-9410-91df79e7bdcd/solar_panel_ph.jpeg",
                "versions": [
                    {
                        "s3ref": {
                            "bucket": "epilot-dev-user-content",
                            "key": "739224/507c47a5-a80d-4aa8-9410-91df79e7bdcd/solar_panel_ph.jpeg"
                        },
                        "filename": "solar_panel_ph.jpeg",
                        "access_control": "private",
                        "size_bytes": 15256,
                        "mime_type": "image/jpeg",
                        "readable_size": "14.9 KB",
                        "type": "image",
                        "public_url": "https://epilot-dev-user-content.s3.eu-central-1.amazonaws.com/739224/507c47a5-a80d-4aa8-9410-91df79e7bdcd/solar_panel_ph.jpeg"
                    }
                ],
                "_schema": "file",
                "_org": "739224",
                "_created_at": "2022-01-10T16:09:55.722Z",
                "_updated_at": "2022-01-10T16:09:55.722Z",
                "_title": "solar_panel_ph.jpeg",
                "$relation": {
                    "entity_id": "d0b1b647-10e6-4787-9754-fa89c6a57946",
                    "_schema": "file",
                    "relationText": "solar_panel_ph.jpeg",
                    "size_bytes": 15256,
                    "mime_type": "image/jpeg",
                    "filename": "solar_panel_ph.jpeg",
                    "s3ref": {
                        "bucket": "epilot-dev-user-content",
                        "key": "739224/507c47a5-a80d-4aa8-9410-91df79e7bdcd/solar_panel_ph.jpeg"
                    },
                    "access_control": "private"
                }
            }
        ],
        "_attachments": {
            "type": "file",
            "attachments": [
                {
                    "key": "files/ckx7ixjwk000c08mpe7624d1u/original",
                    "mime": "application/pdf",
                    "name": "Copper-Series 22Kw Wallbox Pack (Adjustable 6A to 32A) 3-phase.pdf",
                    "size": 889078,
                    "image_url": "https://avkhavsdjq.cloudimg.io/v7/e-mage-sam-bucket-dev.s3.eu-central-1.amazonaws.com/files/ckx7ixjwk000c08mpe7624d1u/original?w=100",
                    "download_url": "https://e-mage-sam-bucket-dev.s3.eu-central-1.amazonaws.com/files/ckx7ixjwk000c08mpe7624d1u/original",
                    "alt_text": ""
                }
            ]
        },
        "__images": [
            {
                "access_control": "private",
                "filename": "2-20-2-21-23-39-29m.jpeg",
                "mime_type": "image/jpeg",
                "readable_size": "37.87 KB",
                "size_bytes": 38775,
                "type": "image",
                "file_entity_id": "beaf8166-a052-4767-b19b-d1a89306287b",
                "s3ref": {
                    "bucket": "epilot-dev-user-content",
                    "key": "739224/cf3caa8b-9b16-43b4-ad47-249187b5271a/2-20-2-21-23-39-29m.jpeg"
                }
            },
            {
                "access_control": "private",
                "filename": "0a3ad697-afec-4e0d-8dd1-c5a1a9ee2425_How-to-get-started-with-Google-AdWords-for-your-marketplace.-.jpg",
                "mime_type": "image/jpeg",
                "readable_size": "610.83 KB",
                "size_bytes": 625488,
                "type": "image",
                "file_entity_id": "657c1afd-58d2-483f-96fb-6b31ce0fe5de",
                "s3ref": {
                    "bucket": "epilot-dev-user-content",
                    "key": "739224/88e96835-5d17-48b3-aeaf-3d72c0f733b8/0a3ad697-afec-4e0d-8dd1-c5a1a9ee2425_How-to-get-started-with-Google-AdWords-for-your-marketplace.-.jpg"
                }
            }
        ],
        "attachments": {
            "_images": [
                {
                    "entity_id": "9c4de5db-53ca-49cc-b677-8dace3117099",
                    "size_bytes": 97378,
                    "mime_type": "image/webp",
                    "filename": "a077Rpv_700bwp.webp",
                    "s3ref": {
                        "bucket": "epilot-dev-user-content",
                        "key": "739224/ab2818ab-4b90-42a2-bd55-324f4a3860bb/a077Rpv_700bwp.webp"
                    },
                    "access_control": "private"
                },
                {
                    "entity_id": "665af01b-2490-4509-9706-9d2c2086bd87",
                    "size_bytes": 33430,
                    "mime_type": "image/webp",
                    "filename": "aLv9566_700bwp.webp",
                    "s3ref": {
                        "bucket": "epilot-dev-user-content",
                        "key": "739224/6c077ba7-db4c-4fab-91c0-65ce45bddc15/aLv9566_700bwp.webp"
                    },
                    "access_control": "private"
                }
            ]
        },
        "internal_name": "epilot Wallbox e-Prime V2",
        "_owners": [
            {
                "org_id": "739224"
            }
        ],
        "_acl": {
            "view": [
                "org_739224"
            ],
            "edit": [
                "org_739224"
            ],
            "delete": [
                "org_739224"
            ]
        },
        "_relations": [
            {
                "entity_id": "fa2a2681-b993-4676-82ec-f363c9bd71ec"
            },
            {
                "entity_id": "efe9ff76-865c-4287-8de9-422cfc741ff8",
                "_acl": {
                    "view": [
                        "org_739224"
                    ],
                    "edit": [
                        "org_739224"
                    ],
                    "delete": [
                        "org_739224"
                    ]
                }
            },
            {
                "entity_id": "c3f4c90e-8236-4358-8b59-e3381c56d3d7",
                "_acl": {
                    "view": [
                        "org_739224"
                    ],
                    "edit": [
                        "org_739224"
                    ],
                    "delete": [
                        "org_739224"
                    ]
                }
            },
            {
                "entity_id": "d0b1b647-10e6-4787-9754-fa89c6a57946"
            },
            {
                "entity_id": "dfbe996b-5c71-45b4-b33f-d20aae994f60",
                "_acl": {
                    "view": [
                        "org_739224"
                    ],
                    "edit": [
                        "org_739224"
                    ],
                    "delete": [
                        "org_739224"
                    ]
                }
            },
            {
                "entity_id": "c5b57511-d624-4b29-81aa-507056a1761f",
                "_acl": {
                    "view": [
                        "org_739224"
                    ],
                    "edit": [
                        "org_739224"
                    ],
                    "delete": [
                        "org_739224"
                    ]
                }
            },
            {
                "entity_id": "ccc5c742-e1c7-49c5-ac2e-5b11fd693c5a",
                "_acl": {
                    "view": [
                        "org_739224"
                    ],
                    "edit": [
                        "org_739224"
                    ],
                    "delete": [
                        "org_739224"
                    ]
                }
            },
            {
                "entity_id": "c117a7aa-e559-4147-a815-f4042a40eba8"
            },
            {
                "entity_id": "2dc8c8e3-1957-4890-b39b-d87ba29338e1",
                "_acl": {
                    "view": [
                        "org_739224"
                    ],
                    "edit": [
                        "org_739224"
                    ],
                    "delete": [
                        "org_739224"
                    ]
                }
            },
            {
                "entity_id": "35618f02-f8e9-4c51-8035-655680cab2ee",
                "_acl": {
                    "view": [
                        "org_739224"
                    ],
                    "edit": [
                        "org_739224"
                    ],
                    "delete": [
                        "org_739224"
                    ]
                }
            },
            {
                "entity_id": "39066fe4-42a6-4ddf-b94a-630c0262a48f"
            },
            {
                "entity_id": "1d0b36e0-395e-4c6a-96c7-7c30fa8824fe"
            },
            {
                "entity_id": "799e6138-1969-4fe0-83a2-5acffa069db5",
                "_acl": {
                    "view": [
                        "org_739224"
                    ],
                    "edit": [
                        "org_739224"
                    ],
                    "delete": [
                        "org_739224"
                    ]
                }
            },
            {
                "entity_id": "a75092d4-43bf-464a-97cc-7e3fc4ef3837",
                "_acl": {
                    "view": [
                        "org_739224"
                    ],
                    "edit": [
                        "org_739224"
                    ],
                    "delete": [
                        "org_739224"
                    ]
                }
            },
            {
                "entity_id": "864841b8-93c8-471b-bbe5-c06187fe1522",
                "_acl": {
                    "view": [
                        "org_739224"
                    ],
                    "edit": [
                        "org_739224"
                    ],
                    "delete": [
                        "org_739224"
                    ]
                }
            },
            {
                "entity_id": "4d06c007-d6e7-43ae-af70-c7129c89ec76",
                "_acl": {
                    "view": [
                        "org_739224"
                    ],
                    "edit": [
                        "org_739224"
                    ],
                    "delete": [
                        "org_739224"
                    ]
                }
            },
            {
                "entity_id": "455d903e-f87d-4b03-a46a-82edfa877416"
            }
        ],
        "_viewers": {}
    },
    "blockConfiguration": {
        "isRequired": false,
        "showQuantity": false,
        "blockPath": "3/Cross Products/ProductSelectionControl"
    }
} as any;

export const externalSimplePrice: PriceItemDto = {
    "_id": "price-73f857a4-0fbc-4aa6-983f-87c0d6d410a6",
    "unit_amount_currency": "EUR",
    "description": "Single Price",
    "is_tax_inclusive": true,
    "unit_amount": 2500,
    "unit_amount_decimal": "25",
    "type": "one_time",
    "active": true,
    "is_composite_price": false,
    "pricing_model": "per_unit",
    "price_display_in_journeys": "show_price",
    "blockMappingData": {},
    "quantity": 1,
    "_price": {
        "_id": "price-73f857a4-0fbc-4aa6-983f-87c0d6d410a6",
        "unit_amount_currency": "EUR",
        "description": "Single Price",
        "is_tax_inclusive": true,
        "unit_amount": 2500,
        "unit_amount_decimal": "25",
        "type": "one_time",
        "active": true,
        "is_composite_price": false,
        "pricing_model": "per_unit",
        "price_display_in_journeys": "show_price",
        "blockMappingData": {}
    },
    "_product": {
        "_id": "73f857a4-0fbc-4aa6-983f-87c0d6d410a6",
        "name": "Solar Panel X2",
        "description": "High-efficiency solar panel for residential use",
        "type": "product",
        "feature": [],
        "product_images": [
            {
                "public_url": "https://epilot-dev-user-content.s3.eu-central-1.amazonaws.com/739224/temp/379c442c-6e9b-40b9-806e-30ee5802754c/2-20-2-21-23-39-29m.jpeg",
                "access_control": "public-read",
                "_id": "",
                "_created_at": "2024-10-30T11:05:23.670Z",
                "_updated_at": "2024-10-30T11:05:23.670Z",
                "mime_type": "image/*",
                "filename": "2-20-2-21-23-39-29m.jpeg",
                "versions": [],
                "_schema": "file",
                "_org": "epilot"
            }
        ],
        "product_downloads": [],
        "_title": "Solar Panel X2",
        "is_external": true
    },
    "_coupons": [],
    "_immutable_pricing_details": {
            "items": [
                {
                    "_id": "price-73f857a4-0fbc-4aa6-983f-87c0d6d410a6",
                    "price_id": "price-73f857a4-0fbc-4aa6-983f-87c0d6d410a6",
                    "active": true,
                    "description": "Single Price",
                    "is_tax_inclusive": true,
                    "amount_total_decimal": "25",
                    "amount_total": 2500,
                    "amount_subtotal_decimal": "25",
                    "amount_subtotal": 2500,
                    "unit_amount": 2500,
                    "unit_amount_gross": 2500,
                    "unit_amount_gross_decimal": "25",
                    "unit_amount_net": 2500,
                    "unit_amount_net_decimal": "25",
                    "type": "one_time",
                    "taxes": [
                        {
                            "rate": "nontaxable",
                            "rateValue": 0,
                            "amount": 0
                        }
                    ],
                    "is_composite_price": false,
                    "pricing_model": "per_unit",
                    "_price": {
                        "_id": "price-73f857a4-0fbc-4aa6-983f-87c0d6d410a6",
                        "unit_amount_currency": "EUR",
                        "description": "Single Price",
                        "is_tax_inclusive": true,
                        "unit_amount": 2500,
                        "unit_amount_decimal": "25",
                        "type": "one_time",
                        "active": true,
                        "is_composite_price": false,
                        "pricing_model": "per_unit",
                        "price_display_in_journeys": "show_price"
                    }
                }
            ],
            "amount_subtotal": 2500,
            "amount_total": 2500,
            "unit_amount_gross": 2500,
            "unit_amount_net": 2500,
            "total_details": {
                "breakdown": {
                    "recurrences": [
                        {
                            "amount_subtotal": 2500,
                            "amount_total": 2500,
                            "amount_subtotal_decimal": "25",
                            "amount_total_decimal": "25",
                            "type": "one_time"
                        }
                    ]
                }
        }
    },
    "blockConfiguration": {
        "isRequired": true,
        "showQuantity": false,
        "blockPath": "2/Products Block Name/ProductSelectionControl"
    }
} as any;

export const pricesWithExternalData: PriceItemDto[] = [externalCompositePrice, internalCompositePrice, internalSimplePrice, internalSimplePriceV2, externalSimplePrice];
export const pricesWithExternalDataSingleSimple: PriceItemDto[] = [externalSimplePrice];
export const pricesWithExternalDataSingleComposite: PriceItemDto[] = [externalCompositePrice];