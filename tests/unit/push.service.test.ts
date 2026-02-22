/**
 * @file push.service.test.ts
 * @description Тесты buildMedicationReminderPayload — формирование текста push-уведомлений
 * @created 2026-02-22
 */

import { describe, it, expect } from 'vitest';
import { buildMedicationReminderPayload } from '@/lib/push/push.service';

describe('buildMedicationReminderPayload', () => {
  it('T+0: заголовок «Время принять», время «в HH:MM»', () => {
    const payload = buildMedicationReminderPayload('Метформин', '500 мг', '08:00', 0);
    expect(payload.title).toBe('Время принять Метформин');
    expect(payload.body).toContain('запланировано в 08:00');
    expect(payload.tag).toBe('reminder-Метформин');
    expect(payload.data?.url).toBe('/dashboard');
    expect(payload.actions).toHaveLength(2);
  });

  it('T+10: заголовок «Не забыли про», время «10 минут назад»', () => {
    const payload = buildMedicationReminderPayload('Амлодипин', '5 мг', '09:30', 10);
    expect(payload.title).toBe('Не забыли про Амлодипин?');
    expect(payload.body).toContain('10 минут назад');
    expect(payload.body).toContain('5 мг');
  });

  it('T+20: «20 минут назад»', () => {
    const payload = buildMedicationReminderPayload('Тест', '1 таб', '12:00', 20);
    expect(payload.body).toContain('20 минут назад');
  });

  it('T+30: «30 минут назад»', () => {
    const payload = buildMedicationReminderPayload('Тест', '1 таб', '12:00', 30);
    expect(payload.body).toContain('30 минут назад');
  });

  it('содержит actions для taken и snooze', () => {
    const payload = buildMedicationReminderPayload('X', '1', '08:00', 0);
    const actions = payload.actions ?? [];
    expect(actions.some((a) => a.action === 'taken')).toBe(true);
    expect(actions.some((a) => a.action === 'snooze')).toBe(true);
  });
});
