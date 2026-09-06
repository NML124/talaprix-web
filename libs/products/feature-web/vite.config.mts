/// <reference types='vitest' />
import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import { resolve } from 'node:path';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../../node_modules/.vite/libs/products/feature-web',
  plugins: [
    angular({ tsconfig: resolve(import.meta.dirname, 'tsconfig.spec.json') }),
  ],
  resolve: { tsconfigPaths: true },
  test: {
    name: 'products-feature-web',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    setupFiles: ['src/test-setup.ts'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../../coverage/libs/products/feature-web',
      provider: 'v8' as const,
    },
  },
}));
