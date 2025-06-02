import { describe, it, expect } from 'vitest';
import type { PriceItem, CompositePriceItem, Price, CompositePrice } from '../shared/types';
import { isPriceItemApproved, isOnRequestUnitAmountApproved, isRequiringApproval } from './approval';

const showAsOnRequestItem = {
  _price: { price_display_in_journeys: 'show_as_on_request' } as Price,
  on_request_approved: false,
} as PriceItem;

const showAsOnRequestApprovedItem = {
  ...showAsOnRequestItem,
  on_request_approved: true,
} as PriceItem;

const showPriceItem = {
  _price: { price_display_in_journeys: 'show_price' } as Price,
  on_request_approved: false,
} as PriceItem;

const showAsStartingPriceItem = {
  _price: { price_display_in_journeys: 'show_as_starting_price' } as Price,
  on_request_approved: false,
} as PriceItem;

const compositePriceItemBase = {
  is_composite_price: true,
  _price: { is_composite_price: true } as CompositePrice,
  on_request_approved: false,
} as CompositePriceItem;

const notApprovedShowPriceCompositePriceItem = {
  ...compositePriceItemBase,
  _price: { ...compositePriceItemBase._price, price_display_in_journeys: 'show_price' } as CompositePrice,
};

const approvedShowPriceCompositePriceItem = {
  ...notApprovedShowPriceCompositePriceItem,
  on_request_approved: true,
};

const showAsStartingPriceCompositePriceItem = {
  ...compositePriceItemBase,
  _price: { ...compositePriceItemBase._price, price_display_in_journeys: 'show_as_starting_price' } as CompositePrice,
};

const showAsOnRequestCompositePriceItem = {
  ...compositePriceItemBase,
  _price: { ...compositePriceItemBase._price, price_display_in_journeys: 'show_as_on_request' } as CompositePrice,
};

describe('isPriceItemApproved', () => {
  it('returns on_request_approved value when composite has hidden components', () => {
    const composite = {
      is_composite_price: true,
      item_components: [showAsOnRequestItem],
      _price: { price_display_in_journeys: 'show_price', is_composite_price: true } as CompositePrice,
    } as CompositePriceItem;
    expect(isPriceItemApproved({ ...composite, on_request_approved: true })).toBe(true);
    expect(isPriceItemApproved({ ...composite, on_request_approved: false })).toBe(false);
  });

  it('handles composite item without hidden components', () => {
    expect(
      isPriceItemApproved({
        is_composite_price: true,
        item_components: [showPriceItem],
        _price: { price_display_in_journeys: 'show_as_starting_price', is_composite_price: true } as CompositePrice,
        on_request_approved: false,
      } as CompositePriceItem),
    ).toBe(false);
    expect(
      isPriceItemApproved({
        ...notApprovedShowPriceCompositePriceItem,
        item_components: [showPriceItem],
      }),
    ).toBe(true);
  });

  it('checks child item approval with parent context', () => {
    expect(isPriceItemApproved(showAsOnRequestItem, approvedShowPriceCompositePriceItem)).toBe(true);
    expect(isPriceItemApproved(showAsOnRequestItem, notApprovedShowPriceCompositePriceItem)).toBe(false);
    expect(isPriceItemApproved(showPriceItem, notApprovedShowPriceCompositePriceItem)).toBe(true);
  });

  it('returns approval based on item display when no parent', () => {
    expect(isPriceItemApproved(showAsStartingPriceItem)).toBe(false);
    expect(isPriceItemApproved(showAsOnRequestApprovedItem)).toBe(true);
    expect(isPriceItemApproved(showPriceItem)).toBe(true);
  });
});

describe('isOnRequestUnitAmountApproved', () => {
  it('uses parent approval when parent has hidden components', () => {
    const parent = {
      ...approvedShowPriceCompositePriceItem,
      item_components: [showAsOnRequestItem],
    };
    expect(isOnRequestUnitAmountApproved(showPriceItem, undefined, parent)).toBe(true);
  });

  it('uses parent approval when parent display is hidden', () => {
    expect(isOnRequestUnitAmountApproved(showPriceItem, undefined, showAsOnRequestCompositePriceItem)).toBe(false);
  });

  it('returns true when parent is visible', () => {
    expect(isOnRequestUnitAmountApproved(showAsOnRequestItem, undefined, notApprovedShowPriceCompositePriceItem)).toBe(
      true,
    );
  });

  it('checks approval without parent', () => {
    expect(isOnRequestUnitAmountApproved(showAsOnRequestItem, 'show_as_on_request')).toBe(false);
    expect(isOnRequestUnitAmountApproved(showAsOnRequestApprovedItem, 'show_as_on_request')).toBe(true);
    expect(isOnRequestUnitAmountApproved(showPriceItem, 'show_price')).toBe(true);
  });
});

describe('isRequiringApproval', () => {
  it('returns true when simple item display is hidden', () => {
    expect(isRequiringApproval(showAsOnRequestItem)).toBe(true);
    expect(isRequiringApproval(showPriceItem)).toBe(false);
  });

  it('evaluates composite items correctly', () => {
    expect(isRequiringApproval(showAsStartingPriceCompositePriceItem)).toBe(true);
    expect(
      isRequiringApproval({ ...notApprovedShowPriceCompositePriceItem, item_components: [showAsOnRequestItem] }),
    ).toBe(true);
    expect(isRequiringApproval({ ...notApprovedShowPriceCompositePriceItem, item_components: [showPriceItem] })).toBe(
      false,
    );
  });
});

describe('edge cases for optional arrays', () => {
  it('treats missing item_components as empty array in composite approval', () => {
    expect(isPriceItemApproved({ ...notApprovedShowPriceCompositePriceItem, item_components: undefined })).toBe(true);
  });

  it('handles missing parent item_components when checking unit amount', () => {
    expect(
      isOnRequestUnitAmountApproved(showPriceItem, 'show_price', {
        ...approvedShowPriceCompositePriceItem,
        item_components: undefined,
      }),
    ).toBe(true);
  });
});

describe('handles missing _price object', () => {
  it('approves composite item when _price is absent and no components hidden', () => {
    const { _price, ...item } = notApprovedShowPriceCompositePriceItem;
    expect(isPriceItemApproved(item)).toBe(true);
    expect(isRequiringApproval(item)).toBe(false);
  });
});

describe('additional branch coverage', () => {
  it('approves non-composite item when _price is missing', () => {
    const item = { on_request_approved: false } as PriceItem;
    expect(isPriceItemApproved(item)).toBe(true);
    expect(isRequiringApproval(item)).toBe(false);
  });

  it('handles undefined priceDisplayInJourneys in unit amount approval', () => {
    expect(isOnRequestUnitAmountApproved(showPriceItem, undefined)).toBe(true);
  });
});

describe('optional _price in components', () => {
  it('ignores components without _price when checking composite approval', () => {
    expect(
      isPriceItemApproved({
        ...notApprovedShowPriceCompositePriceItem,
        item_components: [{} as PriceItem],
      }),
    ).toBe(true);
  });

  it('ignores parent components without _price in unit amount approval', () => {
    // since no hidden components and parent is not hidden, should return true regardless of parent approval
    expect(
      isOnRequestUnitAmountApproved(showPriceItem, 'show_price', {
        ...notApprovedShowPriceCompositePriceItem,
        item_components: [{} as PriceItem],
      }),
    ).toBe(true);
  });
});
