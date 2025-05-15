import type { Price, Product } from '../types';

export const ENTITY_FIELDS_EXCLUSION_LIST: Set<keyof Price> = new Set([
  '_org',
  '_schema',
  '_created_at',
  '_updated_at',
  '_owners',
  '_acl',
  '_acl_sync',
  '_viewers',
  '_relations',
  '$relation',
  'file',
  '_files',
  'workflows',
  '_slug',
]);

/**
 * @todo Should narrow down the checks to ensure each item matches the Price type
 */
const isArrayOfPrices = (prices: unknown): prices is Price[] => Array.isArray(prices);

/**
 * Converts a Price entity into a PriceDTO without all fields present on the entity fields exclusion list.
 */
export const mapToPriceSnapshot = (price?: Price): Price =>
  price
    ? (Object.fromEntries(
        Object.entries(price)
          .filter(([key]) => !ENTITY_FIELDS_EXCLUSION_LIST.has(key))
          .map(([key, value]) => {
            if (key === 'price_components' && isArrayOfPrices(value)) {
              return [key, value.map((price) => mapToPriceSnapshot(price))];
            } else {
              return [key, value];
            }
          }),
      ) as Price)
    : ({} as Price);

/**
 * Converts a Product entity into a ProductDTO without all fields present on the entity fields exclusion list.
 */
export const mapToProductSnapshot = (product?: Product): Product | undefined =>
  product
    ? (Object.fromEntries(Object.entries(product).filter(([key]) => !ENTITY_FIELDS_EXCLUSION_LIST.has(key))) as Product)
    : undefined;
