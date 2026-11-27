import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';
import { resolve } from 'node:path';

export default defineConfig({
  root: import.meta.dirname,
  plugins: [
    angular({ tsconfig: resolve(import.meta.dirname, 'tsconfig.spec.json') }),
  ],
  resolve: { tsconfigPaths: true },
  test: {
    name: 'admin-feature-admin',
    environment: 'jsdom',
    setupFiles: ['../../shared/data-access/src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
    watch: false,
  },
});
