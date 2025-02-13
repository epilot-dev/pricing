/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

const EsbuildPlugin = require('esbuild-loader').EsbuildPlugin;
const NodemonPlugin = require('nodemon-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  mode: 'production',
  resolve: { extensions: ['.ts'] },
  devtool: false,
  module: {
    rules: [
      {
        // Match js, jsx, ts & tsx files
        test: /\.[jt]sx?$/,
        loader: 'esbuild-loader',
      },
    ],
  },
  optimization: {
    minimizer: [new EsbuildPlugin()],
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'index.js',
    libraryTarget: 'commonjs',
  },
  plugins: [new NodemonPlugin()],
};
