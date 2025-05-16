export const isTruthy = <T>(
  value: T | '' | 0 | null | undefined | false,
): value is Exclude<T, '' | 0 | null | undefined | false> => Boolean(value);
