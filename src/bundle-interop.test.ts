import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { build } from 'esbuild';
import { beforeAll, describe, expect, it } from 'vitest';

const root = path.resolve(__dirname, '..');

/**
 * Regression: consumers that bundle this package's CJS entry with
 * `mainFields: ['module', 'main']` resolved `require('dinero.js')` to dinero's ESM build, so
 * `.default` was the module namespace and `formatAmount` threw
 * "TypeError: (0, x.default) is not a function".
 */
describe('dist bundle interop', () => {
  beforeAll(() => {
    execFileSync('node', ['esbuild.config.js'], { cwd: root, stdio: 'ignore' });
  }, 60_000);

  it('does not leave a bare dinero.js import in dist', () => {
    for (const file of ['dist/cjs/index.cjs', 'dist/esm/index.mjs']) {
      const code = fs.readFileSync(path.join(root, file), 'utf8');
      expect(code).not.toMatch(/require\(["']dinero\.js["']\)|from\s*["']dinero\.js["']/);
    }
  });

  it.each([
    ['cjs', 'dist/cjs/index.cjs'],
    ['esm', 'dist/esm/index.mjs'],
  ] as const)('formatAmount works when the %s entry is re-bundled with mainFields module,main', async (_, entry) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pricing-interop-'));
    try {
      const outfile = path.join(dir, 'out.mjs');
      await build({
        stdin: {
          contents: `import { formatAmount } from ${JSON.stringify(path.join(root, entry))};
console.log(formatAmount({ amount: 12345, currency: 'EUR', locale: 'en' }));`,
          resolveDir: root,
        },
        outfile,
        bundle: true,
        platform: 'node',
        format: 'esm',
        mainFields: ['module', 'main'],
        banner: { js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);" },
        logLevel: 'silent',
      });
      const out = execFileSync('node', [outfile], { encoding: 'utf8' });
      expect(out).toMatch(/123[.,]45/);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
