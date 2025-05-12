import epilotConfig from '@epilot/eslint-config';
import js from '@eslint/js';
import prettier from 'prettier';

const prettierOptions = await prettier.resolveConfig('./package.json');

export default [
  js.configs.recommended,
  ...epilotConfig,
  {
    ignores: ['node_modules', 'dist'],
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        ecmaVersion: 'latest',
      },
    },
    rules: {
      'import/order': ['warn'],
      'spaced-comment': ['warn'],
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'warn',
      'prettier/prettier': ['warn', prettierOptions],
    },
    settings: {
      cache: true,
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.d.ts'],
          paths: ['src'],
        },
      },
    },
  },
];
