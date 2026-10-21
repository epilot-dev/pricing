import * as DineroModule from 'dinero.js';
import type DineroFactory from 'dinero.js';

/**
 * dinero.js v1 ships a CJS build (`main`) and an ESM build (`module`, `export default`).
 * When a consumer bundles this package's CJS entry with `mainFields: ['module', 'main']`
 * (e.g. esbuild for Lambdas), `require('dinero.js')` resolves to the ESM build and the
 * default import becomes the module namespace instead of the factory
 * ("TypeError: (0, x.default) is not a function"). Unwrap nested `default`s so the factory
 * is found regardless of how the consumer resolved the package.
 */
const resolveFactory = (mod: unknown): typeof DineroFactory => {
  let current = mod as { default?: unknown };
  for (let depth = 0; depth < 3 && typeof current !== 'function'; depth++) {
    current = current?.default as { default?: unknown };
  }
  return current as unknown as typeof DineroFactory;
};

export const dinero = resolveFactory(DineroModule);
