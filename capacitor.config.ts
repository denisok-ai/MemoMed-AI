/**
 * @file capacitor.config.ts
 * @description Конфигурация Capacitor для сборки Android/iOS приложения.
 * Упаковывает Next.js PWA в нативное приложение с нативными push-уведомлениями и камерой.
 * @dependencies @capacitor/core, @capacitor/android
 * @created 2026-02-22
 */

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ai.memomed.app',
  appName: 'MemoMed AI',

  // В продакшне — URL приложения; при локальной разработке используется livereload
  webDir: 'out',

  // Сервер для live reload при разработке (раскомментировать при отладке на устройстве)
  // server: {
  //   url: 'http://192.168.1.100:3000',
  //   cleartext: true,
  // },

  android: {
    buildOptions: {
      releaseType: 'AAB',
    },
  },

  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    Camera: {
      quality: 70,
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#7e57c2',
      showSpinner: false,
    },
  },
};

export default config;
