import fs from 'fs';
import esbuild from 'esbuild';
import packageJson from './package.json' with { type: 'json' };

const externalDeps = [
  ...Object.keys(packageJson.peerDependencies ?? {}),
  ...Object.keys(packageJson.dependencies ?? {}),
];

const buildFormats = [
  {
    format: 'esm',
    outfile: 'dist/esm/index.js',
    platform: 'node',
  },
  {
    format: 'cjs',
    outfile: 'dist/cjs/index.js',
    platform: 'node',
  },
];

function buildForFormat({ format, outfile, platform }) {
  return esbuild.build({
    entryPoints: ['./src/index.ts'],
    bundle: true,
    outfile,
    platform,
    format,
    sourcemap: true,
    target: 'node18',
    minify: true,
    treeShaking: true,
    external: externalDeps,
    metafile: true,
    plugins: [
      {
        name: 'log-bundle-size',
        setup(build) {
          build.onEnd(() => {
            const size = fs.statSync(outfile).size;
            const sizeInMB = (size / (1024 * 1024)).toFixed(2);
            console.log(`\n[${format.toUpperCase()}] ${outfile}: ${sizeInMB} MB (${size} bytes)`);
          });
        },
      },
    ],
  });
}

async function buildAll() {
  for (const { format, outfile, platform } of buildFormats) {
    await buildForFormat({ format, outfile, platform }).then(async (result) => {
      // Output analysis to console
      console.log(await esbuild.analyzeMetafile(result.metafile));
    });
  }
}

if (process.argv.includes('--watch')) {
  // Watch mode - only build the first format
  buildForFormat(buildFormats[0]).then((context) => {
    context.watch();
    console.log('Watching for changes...');
  });
} else {
  // Build mode with analysis
  buildAll().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
