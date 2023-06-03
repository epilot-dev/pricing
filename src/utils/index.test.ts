import { getQuantityForTier } from '.';

describe('getQuantityForTier', () => {
  it('should return the correct result when quantity is 1', () => {
    const result = getQuantityForTier(0, 10, 1);
    expect(result).toBe(1);
  });

  it('should return the correct result when quantity is 10', () => {
    const result = getQuantityForTier(0, 10, 10);
    expect(result).toBe(10);
  });

  it('should return the correct result when quantity is 15', () => {
    const result = getQuantityForTier(0, 10, 15);
    expect(result).toBe(10);
  });

  it('should return the correct result when quantity is 25', () => {
    const result = getQuantityForTier(20, 30, 25);
    expect(result).toBe(5);
  });

  it('should return the correct result when quantity is 100', () => {
    const result = getQuantityForTier(10, 20, 100);
    expect(result).toBe(10);
  });
});
