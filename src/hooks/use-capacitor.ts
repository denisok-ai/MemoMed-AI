/**
 * @file use-capacitor.ts
 * @description Хук для определения среды Capacitor и работы с нативными плагинами.
 * Безопасно деградирует до Web API при запуске в браузере.
 * @dependencies @capacitor/core
 * @created 2026-02-22
 */

'use client';

import { useEffect, useState } from 'react';

interface CapacitorEnv {
  /** true если приложение запущено внутри Capacitor (Android/iOS) */
  isNative: boolean;
  /** true если Android */
  isAndroid: boolean;
  /** true если iOS */
  isIos: boolean;
  /** Версия приложения из нативного контейнера */
  appVersion: string | null;
}

export function useCapacitorEnv(): CapacitorEnv {
  const [env, setEnv] = useState<CapacitorEnv>({
    isNative: false,
    isAndroid: false,
    isIos: false,
    appVersion: null,
  });

  useEffect(() => {
    let mounted = true;

    async function detectEnv() {
      try {
        const { Capacitor } = await import('@capacitor/core');
        if (!mounted) return;
        setEnv({
          isNative: Capacitor.isNativePlatform(),
          isAndroid: Capacitor.getPlatform() === 'android',
          isIos: Capacitor.getPlatform() === 'ios',
          appVersion: null,
        });
      } catch {
        // Не в Capacitor-среде — оставляем значения по умолчанию
      }
    }

    void detectEnv();
    return () => {
      mounted = false;
    };
  }, []);

  return env;
}

/**
 * Открывает нативную камеру (Capacitor) или input[type=file] (браузер).
 * Возвращает base64-строку изображения или null.
 */
export async function capturePhotoNative(): Promise<string | null> {
  try {
    const { Capacitor } = await import('@capacitor/core');
    if (!Capacitor.isNativePlatform()) return null;

    const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
    const photo = await Camera.getPhoto({
      quality: 70,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
    });
    return photo.base64String ? `data:image/jpeg;base64,${photo.base64String}` : null;
  } catch {
    return null;
  }
}

/**
 * Регистрирует нативные push-уведомления через Firebase (Capacitor).
 * При отказе — возвращает null.
 */
export async function registerNativePush(): Promise<string | null> {
  try {
    const { Capacitor } = await import('@capacitor/core');
    if (!Capacitor.isNativePlatform()) return null;

    const { PushNotifications } = await import('@capacitor/push-notifications');

    const permission = await PushNotifications.requestPermissions();
    if (permission.receive !== 'granted') return null;

    await PushNotifications.register();

    return new Promise((resolve) => {
      PushNotifications.addListener('registration', (token) => {
        resolve(token.value);
      });
      PushNotifications.addListener('registrationError', () => {
        resolve(null);
      });
    });
  } catch {
    return null;
  }
}
