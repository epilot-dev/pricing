import { describe, expect, it } from 'vitest';
import { priceItem6 } from '../__tests__/fixtures/price.samples';
import { tax10percent } from '../__tests__/fixtures/tax.samples';
import type { PriceItem } from '../shared/types';
import { extractTaxFromPriceItem } from './extract-tax-from-price';

describe('extractTaxFromPriceItem', () => {
  it('should extract the tax from a price item', () => {
    const tax = extractTaxFromPriceItem(priceItem6 as PriceItem);

    expect(tax).toBe(tax10percent);
  });
});
