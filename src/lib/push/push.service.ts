/**
 * @file push.service.ts
 * @description Сервис Web Push уведомлений через VAPID.
 * Отправляет уведомления на все устройства пользователя.
 * @dependencies web-push, prisma
 * @created 2026-02-22
 */

import webpush from 'web-push';
import { prisma } from '@/lib/db/prisma';

/** Инициализируем VAPID один раз. При невалидных ключах push отключён. */
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY ?? '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY ?? '';
const vapidEmail = process.env.VAPID_EMAIL ?? 'mailto:admin@memomed.app';

let pushConfigured = false;
if (vapidPublicKey && vapidPrivateKey) {
  try {
    webpush.setVapidDetails(
      vapidEmail.startsWith('mailto:') ? vapidEmail : `mailto:${vapidEmail}`,
      vapidPublicKey,
      vapidPrivateKey
    );
    pushConfigured = true;
  } catch (e) {
    console.warn(
      '[push] VAPID ключи невалидны — push-уведомления отключены. Сгенерируйте: npx web-push generate-vapid-keys'
    );
  }
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: Array<{ action: string; title: string }>;
}

/**
 * Отправляет push-уведомление всем устройствам пользователя.
 * Невалидные подписки (410 Gone) автоматически удаляются.
 */
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<void> {
  if (!pushConfigured) {
    return;
  }

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  if (subscriptions.length === 0) return;

  const notificationPayload = JSON.stringify({
    ...payload,
    icon: payload.icon ?? '/icons/icon-192x192.png',
    badge: payload.badge ?? '/icons/icon-96x96.png',
  });

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        notificationPayload
      )
    )
  );

  // Удаляем протухшие подписки (HTTP 410 Gone)
  const staleEndpoints: string[] = [];
  results.forEach((result, i) => {
    if (
      result.status === 'rejected' &&
      result.reason instanceof webpush.WebPushError &&
      result.reason.statusCode === 410
    ) {
      staleEndpoints.push(subscriptions[i]!.endpoint);
    }
  });

  if (staleEndpoints.length > 0) {
    await prisma.pushSubscription.deleteMany({
      where: { endpoint: { in: staleEndpoints } },
    });
  }
}

/**
 * Формирует текст уведомления о лекарстве.
 * bodyOverride — персонализированный текст от AI (если передан).
 */
export function buildMedicationReminderPayload(
  medicationName: string,
  dosage: string,
  scheduledTime: string,
  delayMinutes = 0,
  bodyOverride?: string
): PushPayload {
  const timeStr = delayMinutes === 0 ? `в ${scheduledTime}` : `${delayMinutes} минут назад`;
  const defaultBody = `${dosage} — запланировано ${timeStr}`;

  return {
    title:
      delayMinutes === 0 ? `Время принять ${medicationName}` : `Не забыли про ${medicationName}?`,
    body: bodyOverride ?? defaultBody,
    tag: `reminder-${medicationName}`,
    data: { url: '/dashboard' },
    actions: [
      { action: 'taken', title: '✅ Принял(а)' },
      { action: 'snooze', title: '⏰ Напомнить позже' },
    ],
  };
}
