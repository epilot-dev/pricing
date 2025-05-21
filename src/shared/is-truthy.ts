/**
 * Returns true if the value is truthy, and works as a type guard.
 * This is an improvement over the native Boolean() function,
 * which does not narrow the type to exclude the falsy values.
 * @example
 * const getUppercaseValues = (values: (string | undefined)[]) =>
 *   values
 *     .filter(isTruthy)
 *     // TypeScript will now know that the values are strings,
 *     // and not undefined or null, which is not the case with Boolean()
 *     .map((value) => value.toUpperCase());
 */
export const isTruthy = <T>(
  value: T | '' | 0 | null | undefined | false,
): value is Exclude<T, '' | 0 | null | undefined | false> => Boolean(value);
