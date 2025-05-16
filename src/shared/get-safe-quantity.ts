/**
 * Returns a safe quantity, it's a number and not NaN. If invalid, it returns 1.
 */
export const getSafeQuantity = (quantity: number | undefined) =>
  typeof quantity === 'number' && !Number.isNaN(quantity) ? quantity : 1;
