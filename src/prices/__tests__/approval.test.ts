import { describe, it, expect } from 'vitest';
import { compositePriceWithOnRequest } from '../../__tests__/fixtures/price.samples';
import type { CompositePriceItem, PriceItem } from '../../shared/types';
import { isPriceItemApproved, isOnRequestUnitAmountApproved, isRequiringApproval } from '../approval';

describe('approval', () => {
  // Basic price items for testing
  const regularPriceItem: PriceItem = {
    price_id: 'price-1',
    product_id: 'product-1',
    _price: {
      _id: 'price-1',
      price_display_in_journeys: 'show_price',
      is_tax_inclusive: true,
      pricing_model: 'per_unit',
    },
    pricing_model: 'per_unit',
    is_tax_inclusive: true,
  };

  const onRequestPriceItem: PriceItem = {
    ...regularPriceItem,
    _price: {
      ...regularPriceItem._price,
      price_display_in_journeys: 'show_as_on_request',
    },
  };

  const approvedOnRequestPriceItem: PriceItem = {
    ...onRequestPriceItem,
    on_request_approved: true,
  };

  const startingPricePriceItem: PriceItem = {
    ...regularPriceItem,
    _price: {
      ...regularPriceItem._price,
      price_display_in_journeys: 'show_as_starting_price',
    },
  };

  const approvedStartingPricePriceItem: PriceItem = {
    ...startingPricePriceItem,
    on_request_approved: true,
  };

  // Composite price items for testing
  const regularCompositePriceItem: CompositePriceItem = {
    ...regularPriceItem,
    is_composite_price: true,
    _price: {
      ...regularPriceItem._price,
      is_composite_price: true,
    },
    item_components: [
      {
        ...regularPriceItem,
      },
    ],
  };

  const compositeWithOnRequestComponent: CompositePriceItem = {
    ...regularCompositePriceItem,
    item_components: [
      {
        ...onRequestPriceItem,
      },
    ],
  };

  const approvedCompositeWithOnRequestComponent: CompositePriceItem = {
    ...compositeWithOnRequestComponent,
    on_request_approved: true,
  };

  describe('isPriceItemApproved', () => {
    it('should return true for regular price items', () => {
      expect(isPriceItemApproved(regularPriceItem)).toBe(true);
    });

    it('should return false for on-request price items without approval', () => {
      expect(isPriceItemApproved(onRequestPriceItem)).toBe(false);
    });

    it('should return true for on-request price items with approval', () => {
      expect(isPriceItemApproved(approvedOnRequestPriceItem)).toBe(true);
    });

    it('should return false for starting price items without approval', () => {
      expect(isPriceItemApproved(startingPricePriceItem)).toBe(false);
    });

    it('should return true for starting price items with approval', () => {
      expect(isPriceItemApproved(approvedStartingPricePriceItem)).toBe(true);
    });

    it('should handle composite price items correctly', () => {
      // Regular composite price item with no on-request components
      expect(isPriceItemApproved(regularCompositePriceItem)).toBe(true);

      // Composite price item with on-request component, but no approval
      expect(isPriceItemApproved(compositeWithOnRequestComponent)).toBe(false);

      // Composite price item with on-request component and approval
      expect(isPriceItemApproved(approvedCompositeWithOnRequestComponent)).toBe(true);
    });

    it('should handle price items with parent item', () => {
      // Price item with a regular parent (not requiring approval)
      expect(isPriceItemApproved(regularPriceItem, regularCompositePriceItem)).toBe(true);

      // On-request price item with a regular parent
      expect(isPriceItemApproved(onRequestPriceItem, regularCompositePriceItem)).toBe(false);

      // On-request price item with approved parent
      expect(isPriceItemApproved(onRequestPriceItem, approvedCompositeWithOnRequestComponent)).toBe(true);
    });
  });

  describe('isOnRequestUnitAmountApproved', () => {
    it('should return true for regular price items', () => {
      expect(isOnRequestUnitAmountApproved(regularPriceItem, 'show_price')).toBe(true);
    });

    it('should return false for on-request price items without approval', () => {
      expect(isOnRequestUnitAmountApproved(onRequestPriceItem, 'show_as_on_request')).toBe(false);
    });

    it('should return true for on-request price items with approval', () => {
      expect(isOnRequestUnitAmountApproved(approvedOnRequestPriceItem, 'show_as_on_request')).toBe(true);
    });

    it('should handle price items with parent item', () => {
      // Regular price item with regular parent
      expect(isOnRequestUnitAmountApproved(regularPriceItem, 'show_price', regularCompositePriceItem)).toBe(true);

      // Regular price item with parent that has hidden components
      expect(isOnRequestUnitAmountApproved(regularPriceItem, 'show_price', compositeWithOnRequestComponent)).toBe(
        false,
      );

      // Regular price item with parent that has hidden components and is approved
      expect(
        isOnRequestUnitAmountApproved(regularPriceItem, 'show_price', approvedCompositeWithOnRequestComponent),
      ).toBe(true);
    });

    it('should handle parent items with on-request display mode', () => {
      const parentWithOnRequest: CompositePriceItem = {
        ...regularCompositePriceItem,
        _price: {
          ...regularCompositePriceItem._price,
          price_display_in_journeys: 'show_as_on_request',
        },
      };

      const approvedParentWithOnRequest: CompositePriceItem = {
        ...parentWithOnRequest,
        on_request_approved: true,
      };

      expect(isOnRequestUnitAmountApproved(regularPriceItem, 'show_price', parentWithOnRequest)).toBe(false);
      expect(isOnRequestUnitAmountApproved(regularPriceItem, 'show_price', approvedParentWithOnRequest)).toBe(true);
    });
  });

  describe('isRequiringApproval', () => {
    it('should return false for regular price items', () => {
      expect(isRequiringApproval(regularPriceItem)).toBe(false);
    });

    it('should return true for on-request price items', () => {
      expect(isRequiringApproval(onRequestPriceItem)).toBe(true);
      expect(isRequiringApproval(approvedOnRequestPriceItem)).toBe(true); // Still requires approval, just already approved
    });

    it('should return true for starting price items', () => {
      expect(isRequiringApproval(startingPricePriceItem)).toBe(true);
      expect(isRequiringApproval(approvedStartingPricePriceItem)).toBe(true);
    });

    it('should handle composite price items correctly', () => {
      // Regular composite price item
      expect(isRequiringApproval(regularCompositePriceItem)).toBe(false);

      // Composite price item with on-request component
      expect(isRequiringApproval(compositeWithOnRequestComponent)).toBe(true);

      // Composite with on-request display mode
      const compositeWithOnRequestMode: CompositePriceItem = {
        ...regularCompositePriceItem,
        _price: {
          ...regularCompositePriceItem._price,
          price_display_in_journeys: 'show_as_on_request',
        },
      };
      expect(isRequiringApproval(compositeWithOnRequestMode)).toBe(true);
    });

    it('should handle real fixture data correctly', () => {
      // Create a properly formed CompositePriceItem from the fixture
      const compositeFixture: CompositePriceItem = {
        ...compositePriceWithOnRequest,
        is_composite_price: true,
        item_components: [
          {
            price_id: 'price#4-comp#1',
            product_id: 'prod-id#1234',
            _price: {
              price_display_in_journeys: 'show_as_on_request',
              is_tax_inclusive: true,
              pricing_model: 'per_unit',
            },
            pricing_model: 'per_unit',
            is_tax_inclusive: true,
          },
        ],
      } as unknown as CompositePriceItem;

      // The fixture now has a component with show_as_on_request
      expect(isRequiringApproval(compositeFixture)).toBe(true);
    });
  });
});
