import type { CompositePrice, CompositePriceItem, PriceItem } from '../../shared/types';

// Basic price items for testing
export const regularPriceItem = {
  price_id: 'price-1',
  product_id: 'product-1',
  _price: {
    _id: 'price-1',
    price_display_in_journeys: 'show_price',
    is_tax_inclusive: true,
    pricing_model: 'per_unit',
  } as const,
  pricing_model: 'per_unit',
  is_tax_inclusive: true,
} as const;

export const onRequestPriceItem: PriceItem = {
  ...regularPriceItem,
  _price: {
    ...regularPriceItem._price,
    price_display_in_journeys: 'show_as_on_request',
  },
};

export const approvedOnRequestPriceItem: PriceItem = {
  ...onRequestPriceItem,
  on_request_approved: true,
};

export const startingPricePriceItem: PriceItem = {
  ...regularPriceItem,
  _price: {
    ...regularPriceItem._price,
    price_display_in_journeys: 'show_as_starting_price',
  },
};

export const approvedStartingPricePriceItem: PriceItem = {
  ...startingPricePriceItem,
  on_request_approved: true,
};

// Composite price items for testing
export const regularCompositePriceItem: CompositePriceItem = {
  ...regularPriceItem,
  is_composite_price: true,
  _price: {
    ...regularPriceItem._price,
    is_composite_price: true,
  },
  item_components: [regularPriceItem],
};

export const compositeWithOnRequestComponent: CompositePriceItem = {
  ...regularCompositePriceItem,
  item_components: [onRequestPriceItem],
};

export const approvedCompositeWithOnRequestComponent: CompositePriceItem = {
  ...compositeWithOnRequestComponent,
  on_request_approved: true,
};

export const parentWithOnRequest: CompositePriceItem = {
  ...regularCompositePriceItem,
  _price: {
    ...(regularCompositePriceItem._price as CompositePrice),
    price_display_in_journeys: 'show_as_on_request',
  },
};

export const approvedParentWithOnRequest: CompositePriceItem = {
  ...parentWithOnRequest,
  on_request_approved: true,
};

export const compositeWithOnRequestMode: CompositePriceItem = {
  ...regularCompositePriceItem,
  _price: {
    ...(regularCompositePriceItem._price as CompositePrice),
    price_display_in_journeys: 'show_as_on_request',
  },
};
