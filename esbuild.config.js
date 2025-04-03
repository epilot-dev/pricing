const path = require('path');
const esbuild = require('esbuild');
const fs = require('fs');

const buildOptions = {
  entryPoints: ['./src/index.ts'],
  bundle: true,
  outfile: 'dist/index.js',
  platform: 'node',
  format: 'cjs',
  sourcemap: true,
  target: 'node18',
  minify: true,
  treeShaking: true,
  external: [
    ...Object.keys(require('./package.json').peerDependencies || {}),
    ...Object.keys(require('./package.json').dependencies || {})
  ],
  plugins: [{
    name: 'log-bundle-size',
    setup(build) {
      build.onEnd(() => {
        const filePath = 'dist/index.js';
        const size = fs.statSync(filePath).size;
        const sizeInMB = (size / (1024 * 1024)).toFixed(2);
        console.log(`\nBundle size: ${sizeInMB} MB (${size} bytes)`);
      });
    }
  }],
  metafile: true,
};

if (process.argv.includes('--watch')) {
  // Watch mode
  esbuild.context(buildOptions).then(context => {
    context.watch();
    console.log('Watching for changes...');
  });
} else {
  // Build mode with analysis
  esbuild.build(buildOptions).then(async (result) => {
    // Output analysis to console
    console.log(await esbuild.analyzeMetafile(result.metafile));
  }).catch(() => process.exit(1));
} 