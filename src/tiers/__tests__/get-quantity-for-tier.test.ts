import { describe, it, expect } from 'vitest';
import { getQuantityForTier } from '../get-quantity-for-tier';

describe('getQuantityForTier', () => {
  it('should return the difference between max and min when quantity >= max', () => {
    const result = getQuantityForTier({ min: 10, max: 100, quantity: 150 });

    // Should be max - min = 100 - 10 = 90
    expect(result).toBe(90);
  });

  it('should return the difference between quantity and min when min <= quantity < max', () => {
    const result = getQuantityForTier({ min: 10, max: 100, quantity: 50 });

    // Should be quantity - min = 50 - 10 = 40
    expect(result).toBe(40);

    // Edge case: quantity just below max
    const result2 = getQuantityForTier({ min: 10, max: 100, quantity: 99.9 });
    expect(result2).toBe(89.9);

    // Edge case: quantity equal to min
    const result3 = getQuantityForTier({ min: 10, max: 100, quantity: 10 });
    expect(result3).toBe(0);
  });

  it('should throw error when min is not a number', () => {
    expect(() => {
      // @ts-ignore - Testing runtime validation
      getQuantityForTier({ min: 'not-a-number', max: 100, quantity: 50 });
    }).toThrow('Tier min quantity must be a number');

    expect(() => {
      getQuantityForTier({ min: NaN, max: 100, quantity: 50 });
    }).toThrow('Tier min quantity must be a number');
  });

  it('should throw error when max is not a number', () => {
    expect(() => {
      // @ts-ignore - Testing runtime validation
      getQuantityForTier({ min: 10, max: 'not-a-number', quantity: 50 });
    }).toThrow('Tier max quantity must be a number');

    expect(() => {
      getQuantityForTier({ min: 10, max: NaN, quantity: 50 });
    }).toThrow('Tier max quantity must be a number');
  });

  it('should throw error when min >= max', () => {
    expect(() => {
      getQuantityForTier({ min: 100, max: 100, quantity: 150 });
    }).toThrow('Tier min quantity must be less than tier max quantity');

    expect(() => {
      getQuantityForTier({ min: 110, max: 100, quantity: 150 });
    }).toThrow('Tier min quantity must be less than tier max quantity');
  });

  it('should throw error when quantity < min', () => {
    expect(() => {
      getQuantityForTier({ min: 50, max: 100, quantity: 40 });
    }).toThrow('Normalized quantity must be greater than tier min quantity');

    expect(() => {
      getQuantityForTier({ min: 50, max: 100, quantity: 49.9 });
    }).toThrow('Normalized quantity must be greater than tier min quantity');
  });

  it('should handle decimal values correctly', () => {
    // All decimal values
    const result = getQuantityForTier({ min: 10.5, max: 100.5, quantity: 50.5 });
    expect(result).toBe(40);

    // Quantity at max boundary
    const result2 = getQuantityForTier({ min: 10.5, max: 100.5, quantity: 100.5 });
    expect(result2).toBe(90);
  });
});
