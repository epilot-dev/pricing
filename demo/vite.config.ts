import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/pricing-playground/',
  plugins: [react()],
  resolve: {
    alias: {
      '@epilot/pricing': path.resolve(__dirname, '../src/index.ts'),
      '@epilot/pricing-client': path.resolve(__dirname, '../node_modules/@epilot/pricing-client'),
      'dinero.js': path.resolve(__dirname, '../node_modules/dinero.js'),
      i18next: path.resolve(__dirname, '../node_modules/i18next'),
    },
  },
  optimizeDeps: {
    include: ['dinero.js', 'react', 'react-dom'],
  },
});
