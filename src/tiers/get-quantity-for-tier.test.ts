import { getQuantityForTier } from './get-quantity-for-tier';

describe('getQuantityForTier', () => {
  it('should return the correct result when quantity is 1', () => {
    const result = getQuantityForTier({ min: 0, max: 10, quantity: 1 });
    expect(result).toBe(1);
  });

  it('should return the correct result when quantity is 10', () => {
    const result = getQuantityForTier({ min: 0, max: 10, quantity: 10 });
    expect(result).toBe(10);
  });

  it('should return the correct result when quantity is 15', () => {
    const result = getQuantityForTier({ min: 0, max: 10, quantity: 15 });
    expect(result).toBe(10);
  });

  it('should return the correct result when quantity is 25', () => {
    const result = getQuantityForTier({ min: 20, max: 30, quantity: 25 });
    expect(result).toBe(5);
  });

  it('should return the correct result when quantity is 100', () => {
    const result = getQuantityForTier({ min: 10, max: 20, quantity: 100 });
    expect(result).toBe(10);
  });

  it('should return the correct result when quantity is 10.999', () => {
    const result = getQuantityForTier({ min: 10, max: 20, quantity: 10.999 });
    expect(result).toBe(0.999);
  });
});
