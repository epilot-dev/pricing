import { describe, it, expect } from 'vitest';
import { isPriceItemApproved, isOnRequestUnitAmountApproved, isRequiringApproval } from '../approval';
import * as samples from './../../__tests__/fixtures/price-approval.samples';

describe('Validate approval', () => {
  describe('isPriceItemApproved', () => {
    it('should return true for regular price items', () => {
      expect(isPriceItemApproved(samples.regularPriceItem)).toBe(true);
    });

    it('should return false for on-request price items without approval', () => {
      expect(isPriceItemApproved(samples.onRequestPriceItem)).toBe(false);
    });

    it('should return true for on-request price items with approval', () => {
      expect(isPriceItemApproved(samples.approvedOnRequestPriceItem)).toBe(true);
    });

    it('should return false for starting price items without approval', () => {
      expect(isPriceItemApproved(samples.startingPricePriceItem)).toBe(false);
    });

    it('should return true for starting price items with approval', () => {
      expect(isPriceItemApproved(samples.approvedStartingPricePriceItem)).toBe(true);
    });

    it('should handle composite price items correctly', () => {
      // Regular composite price item with no on-request components
      expect(isPriceItemApproved(samples.regularCompositePriceItem)).toBe(true);

      // Composite price item with on-request component, but no approval
      expect(isPriceItemApproved(samples.compositeWithOnRequestComponent)).toBe(false);

      // Composite price item with on-request component and approval
      expect(isPriceItemApproved(samples.approvedCompositeWithOnRequestComponent)).toBe(true);
    });

    it('should handle price items with parent item', () => {
      // Price item with a regular parent (not requiring approval)
      expect(isPriceItemApproved(samples.regularPriceItem, samples.regularCompositePriceItem)).toBe(true);

      // On-request price item with a regular parent
      expect(isPriceItemApproved(samples.onRequestPriceItem, samples.regularCompositePriceItem)).toBe(false);

      // On-request price item with approved parent
      expect(isPriceItemApproved(samples.onRequestPriceItem, samples.approvedCompositeWithOnRequestComponent)).toBe(
        true,
      );
    });
  });

  describe('isOnRequestUnitAmountApproved', () => {
    it('should return true for regular price items', () => {
      expect(isOnRequestUnitAmountApproved(samples.regularPriceItem, 'show_price')).toBe(true);
    });

    it('should return false for on-request price items without approval', () => {
      expect(isOnRequestUnitAmountApproved(samples.onRequestPriceItem, 'show_as_on_request')).toBe(false);
    });

    it('should return true for on-request price items with approval', () => {
      expect(isOnRequestUnitAmountApproved(samples.approvedOnRequestPriceItem, 'show_as_on_request')).toBe(true);
    });

    it('should handle price items with parent item', () => {
      // Regular price item with regular parent
      expect(
        isOnRequestUnitAmountApproved(samples.regularPriceItem, 'show_price', samples.regularCompositePriceItem),
      ).toBe(true);
      // Regular price item with parent that has hidden components
      expect(
        isOnRequestUnitAmountApproved(samples.regularPriceItem, 'show_price', samples.compositeWithOnRequestComponent),
      ).toBe(false);
      // Regular price item with parent that has hidden components and is approved
      expect(
        isOnRequestUnitAmountApproved(
          samples.regularPriceItem,
          'show_price',
          samples.approvedCompositeWithOnRequestComponent,
        ),
      ).toBe(true);
    });

    it('should handle parent items with on-request display mode', () => {
      expect(isOnRequestUnitAmountApproved(samples.regularPriceItem, 'show_price', samples.parentWithOnRequest)).toBe(
        false,
      );
      expect(
        isOnRequestUnitAmountApproved(samples.regularPriceItem, 'show_price', samples.approvedParentWithOnRequest),
      ).toBe(true);
    });
  });

  describe('isRequiringApproval', () => {
    it('should return false for regular price items', () => {
      expect(isRequiringApproval(samples.regularPriceItem)).toBe(false);
    });

    it('should return true for on-request price items', () => {
      expect(isRequiringApproval(samples.onRequestPriceItem)).toBe(true);
      expect(isRequiringApproval(samples.approvedOnRequestPriceItem)).toBe(true); // Still requires approval, just already approved
    });

    it('should return true for starting price items', () => {
      expect(isRequiringApproval(samples.startingPricePriceItem)).toBe(true);
      expect(isRequiringApproval(samples.approvedStartingPricePriceItem)).toBe(true);
    });

    it('should handle composite price items correctly', () => {
      expect(isRequiringApproval(samples.regularCompositePriceItem)).toBe(false);
      expect(isRequiringApproval(samples.compositeWithOnRequestComponent)).toBe(true);
      expect(isRequiringApproval(samples.compositeWithOnRequestMode)).toBe(true);
    });
  });
});
