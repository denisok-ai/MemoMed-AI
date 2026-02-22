/**
 * @file next.config.ts
 * @description Конфигурация Next.js: standalone output, PWA, security headers
 * @dependencies @ducanh2912/next-pwa
 * @created 2026-02-22
 */

import type { NextConfig } from 'next';
import withPWAInit from '@ducanh2912/next-pwa';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const withPWA = withPWAInit({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        // Страницы приложения — Network First (берём свежее, при ошибке — кэш)
        urlPattern: /^https?:\/\/[^/]+\/(dashboard|medications|history|chat|feed).*/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'pages-cache',
          networkTimeoutSeconds: 10,
          expiration: { maxEntries: 20, maxAgeSeconds: 24 * 60 * 60 },
        },
      },
      {
        // API: никогда не кэшируем (данные должны быть актуальными)
        urlPattern: /^https?:\/\/[^/]+\/api\/.*/,
        handler: 'NetworkOnly',
      },
      {
        // Статические ресурсы — Cache First
        urlPattern: /\.(js|css|woff2?|png|jpg|svg|ico)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'static-cache',
          expiration: { maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 },
        },
      },
    ],
  },
});

// При сборке для Capacitor используем статический экспорт (output: 'export')
const isCapacitorBuild = process.env.BUILD_TARGET === 'capacitor';

const nextConfig: NextConfig = {
  output: isCapacitorBuild ? 'export' : 'standalone',
  // Capacitor-сборка требует trailingSlash для корректной работы роутинга
  ...(isCapacitorBuild ? { trailingSlash: true } : {}),

  env: {
    NEXT_PUBLIC_BUILD_VERSION: process.env.npm_package_version ?? '0.0.0',
    NEXT_PUBLIC_BUILD_DATE: new Date().toISOString(),
    NEXT_PUBLIC_BUILD_COMMIT: process.env.COMMIT_SHA ?? 'dev',
  },

  serverExternalPackages: ['@prisma/client', 'bcryptjs'],

  turbopack: {},

  images: {
    remotePatterns: [
      // S3/MinIO хранилище (если настроено)
      ...(process.env.S3_ENDPOINT
        ? [{ protocol: 'https' as const, hostname: new URL(process.env.S3_ENDPOINT).hostname }]
        : []),
    ],
    // Локальные загрузки через /uploads/
    localPatterns: [{ pathname: '/uploads/**' }],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=self, microphone=(), geolocation=self',
          },
        ],
      },
    ];
  },
};

export default withNextIntl(withPWA(nextConfig));
