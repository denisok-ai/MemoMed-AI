/**
 * @file vitest.config.ts
 * @description Vitest configuration for unit and integration tests
 * @created 2026-02-22
 */

import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    environmentOptions: {
      jsdom: { url: 'http://localhost' },
    },
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.{test,spec}.{ts,tsx}', 'src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['tests/e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/app/**',
        'src/types/**',
        'src/components/**',
        'src/hooks/**',
        'src/middleware.ts',
        'src/i18n/**',
        '**/*.d.ts',
        '**/index.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 60,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      // Заглушки для опциональных зависимостей, которых нет в тестовой среде
      '@aws-sdk/client-s3': resolve(__dirname, './tests/mocks/aws-sdk-s3.ts'),
    },
  },
});
