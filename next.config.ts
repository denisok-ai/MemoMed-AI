/**
 * @file next.config.ts
 * @description Конфигурация Next.js: standalone output, PWA, security headers
 * @dependencies @ducanh2912/next-pwa
 * @created 2026-02-22
 */

import type { NextConfig } from 'next';
import withPWAInit from '@ducanh2912/next-pwa';

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

const nextConfig: NextConfig = {
  output: 'standalone',

  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
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

export default withPWA(nextConfig);
