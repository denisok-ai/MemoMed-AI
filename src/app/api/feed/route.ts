/**
 * @file route.ts
 * @description API: GET /api/feed — Server-Sent Events для живой ленты родственника.
 * Отправляет события при появлении новых логов у подключённых пациентов.
 * Fallback: если SSE не поддерживается, клиент переходит на polling.
 * @dependencies prisma, next-auth
 * @created 2026-02-22
 */

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

/** Интервал опроса БД для новых событий (мс) */
const POLL_INTERVAL_MS = 5_000;

/** Время жизни SSE-соединения (мс) — закрываем сами чтобы не копить зомби */
const CONNECTION_TTL_MS = 5 * 60 * 1000;

export async function GET(): Promise<Response> {
  const session = await auth();

  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userId = session.user.id;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (eventName: string, data: unknown) => {
        try {
          controller.enqueue(
            encoder.encode(`event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          // Соединение уже закрыто
        }
      };

      // Отправляем ping сразу для подтверждения соединения
      send('connected', { userId, timestamp: Date.now() });

      // Запоминаем время последнего отправленного события
      let lastCheckedAt = new Date();

      // Таймер автоматического закрытия
      const closeTimer = setTimeout(() => {
        send('reconnect', { reason: 'ttl_expired' });
        controller.close();
      }, CONNECTION_TTL_MS);

      // Интервал поллинга новых событий
      const pollTimer = setInterval(async () => {
        try {
          // Получаем связи родственника
          const connections = await prisma.connection.findMany({
            where: { relativeId: userId, status: 'active' },
            select: { patientId: true },
          });

          if (connections.length === 0) {
            send('ping', { timestamp: Date.now() });
            return;
          }

          const patientIds = connections.map((c) => c.patientId);

          // Ищем новые логи после lastCheckedAt
          const newLogs = await prisma.medicationLog.findMany({
            where: {
              medication: { patientId: { in: patientIds } },
              createdAt: { gt: lastCheckedAt },
            },
            include: {
              medication: {
                select: {
                  name: true,
                  dosage: true,
                  scheduledTime: true,
                  patientId: true,
                  patient: {
                    include: { profile: { select: { fullName: true } } },
                  },
                },
              },
            },
            orderBy: { createdAt: 'asc' },
            take: 20,
          });

          for (const log of newLogs) {
            const scheduledMinutes = parseTimeToMinutes(log.medication.scheduledTime);
            const actualMinutes = log.actualAt
              ? timeToMinutes(log.actualAt)
              : null;
            const delayMinutes =
              actualMinutes !== null ? actualMinutes - scheduledMinutes : null;

            send('medication_log', {
              logId: log.id,
              status: log.status,
              medicationName: log.medication.name,
              dosage: log.medication.dosage,
              scheduledTime: log.medication.scheduledTime,
              actualAt: log.actualAt?.toISOString() ?? null,
              patientName: log.medication.patient.profile?.fullName ?? 'Пациент',
              patientId: log.medication.patientId,
              delayMinutes,
              color: getEventColor(log.status, delayMinutes),
              timestamp: log.createdAt.getTime(),
            });
          }

          if (newLogs.length > 0) {
            lastCheckedAt = new Date();
          } else {
            // Ping чтобы держать соединение живым
            send('ping', { timestamp: Date.now() });
          }
        } catch {
          send('error', { message: 'Ошибка загрузки событий' });
        }
      }, POLL_INTERVAL_MS);

      // Очистка при закрытии соединения клиентом
      return () => {
        clearInterval(pollTimer);
        clearTimeout(closeTimer);
      };
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

/** Определяет цвет события по статусу и задержке */
function getEventColor(
  status: string,
  delayMinutes: number | null
): 'green' | 'yellow' | 'red' {
  if (status === 'missed') return 'red';
  if (status === 'taken') {
    if (delayMinutes === null || delayMinutes <= 0) return 'green';
    if (delayMinutes <= 30) return 'yellow';
    return 'red';
  }
  return 'yellow';
}

/** HH:MM → минуты от полуночи */
function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/** Date → минуты от полуночи в локальном времени сервера */
function timeToMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}
