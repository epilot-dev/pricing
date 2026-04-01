import { describe, expect, it } from 'vitest';
import { computePriceDiff } from './compute-price-diff';

describe('computePriceDiff', () => {
  describe('returns null', () => {
    it('when current amount is zero', () => {
      expect(computePriceDiff('10.00', '0.00', { format: 'absolute' })).toBeNull();
    });

    it('when offer and current amounts are equal', () => {
      expect(computePriceDiff('30.00', '30.00', { format: 'absolute' })).toBeNull();
    });

    it('when offer is worse and onlyIfBetter is true', () => {
      expect(computePriceDiff('40.00', '30.00', { format: 'absolute', onlyIfBetter: true })).toBeNull();
    });
  });

  describe('percentage format', () => {
    it('returns correct percentage when offer is better (lower)', () => {
      const result = computePriceDiff('25.00', '30.00', { format: 'percentage' });
      expect(result).not.toBeNull();
      expect(result!.isBetter).toBe(true);
      expect(result!.formattedDiff).toBe('16.7%');
    });

    it('returns correct percentage when offer is worse (higher)', () => {
      const result = computePriceDiff('36.00', '30.00', { format: 'percentage' });
      expect(result).not.toBeNull();
      expect(result!.isBetter).toBe(false);
      expect(result!.formattedDiff).toBe('20.0%');
    });
  });

  describe('absolute format', () => {
    it('returns formatted absolute diff when offer is better', () => {
      const result = computePriceDiff('25.00', '30.00', { format: 'absolute', currency: 'EUR', locale: 'de-DE' });
      expect(result).not.toBeNull();
      expect(result!.isBetter).toBe(true);
      expect(result!.formattedDiff).toContain('5');
    });

    it('returns formatted absolute diff when offer is worse', () => {
      const result = computePriceDiff('35.00', '30.00', { format: 'absolute', currency: 'EUR', locale: 'de-DE' });
      expect(result).not.toBeNull();
      expect(result!.isBetter).toBe(false);
      expect(result!.formattedDiff).toContain('5');
    });
  });

  describe('onlyIfBetter', () => {
    it('returns result when offer is better and onlyIfBetter is true', () => {
      const result = computePriceDiff('20.00', '30.00', { format: 'percentage', onlyIfBetter: true });
      expect(result).not.toBeNull();
      expect(result!.isBetter).toBe(true);
    });

    it('returns result when offer is worse and onlyIfBetter is false', () => {
      const result = computePriceDiff('40.00', '30.00', { format: 'percentage', onlyIfBetter: false });
      expect(result).not.toBeNull();
      expect(result!.isBetter).toBe(false);
    });
  });
});
