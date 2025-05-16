import * as samples from '../__tests__/fixtures/price.samples';
import type { Price, PriceItemDto } from '../shared/types';
import { mapToPriceSnapshot, ENTITY_FIELDS_EXCLUSION_LIST, mapToProductSnapshot } from './map-to-snapshots';

describe('mapToPriceSnapshot', () => {
  it('should return an empty object if price is falsy', () => {
    const result = mapToPriceSnapshot(null as unknown as Price);

    expect(result).toStrictEqual({});
  });

  it('should exclude keys defined in the exclusion list', () => {
    const result = mapToPriceSnapshot(samples.compositePrice as Price);

    expect(result).not.toHaveProperty(Array.from(ENTITY_FIELDS_EXCLUSION_LIST));
  });

  it("should ignore price_components if it doesn't exist or is falsy", () => {
    const priceItem1 = {
      ...samples.compositePrice,
      price_components: undefined,
    };

    const result = mapToPriceSnapshot(priceItem1 as unknown as Price);

    expect(result).toStrictEqual(expect.objectContaining({ price_components: undefined }));
  });
});

describe('mapToProductSnapshot', () => {
  it('should return undefined if product is falsy', () => {
    const result = mapToProductSnapshot(null as unknown as PriceItemDto['_product']);

    expect(result).toStrictEqual(undefined);
  });

  it('should exclude keys defined in the exclusion list', () => {
    const result = mapToProductSnapshot(samples.compositePriceWithTaxChanges._product);

    expect(result).not.toHaveProperty(Array.from(ENTITY_FIELDS_EXCLUSION_LIST));
  });
});
