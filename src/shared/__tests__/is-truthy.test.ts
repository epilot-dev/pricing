import { describe, it, expect } from 'vitest';
import { isTruthy } from '../is-truthy';

describe('isTruthy', () => {
  it('should return false for falsy values', () => {
    expect(isTruthy(false)).toBe(false);
    expect(isTruthy(0)).toBe(false);
    expect(isTruthy('')).toBe(false);
    expect(isTruthy(null)).toBe(false);
    expect(isTruthy(undefined)).toBe(false);
  });

  it('should return true for truthy values', () => {
    expect(isTruthy(true)).toBe(true);
    expect(isTruthy(1)).toBe(true);
    expect(isTruthy('string')).toBe(true);
    expect(isTruthy({})).toBe(true);
    expect(isTruthy([])).toBe(true);
    expect(isTruthy(() => {})).toBe(true);
  });

  it('should work with type filtering', () => {
    const values = ['value', '', undefined, null, 0, 42] as const;
    const filtered = values.filter(isTruthy);

    // Check that only truthy values remain
    expect(filtered).toEqual(['value', 42]);

    // TypeScript typing works correctly - no need to do runtime checks that TypeScript already enforces
  });
});
