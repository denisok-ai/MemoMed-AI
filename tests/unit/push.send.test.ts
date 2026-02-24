/**
 * @file push.send.test.ts
 * @description Unit-тесты для sendPushToUser (при pushConfigured=false возврат без вызовов)
 * @created 2026-02-24
 */

import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    pushSubscription: { findMany: vi.fn(), deleteMany: vi.fn() },
  },
}));

import { prisma } from '@/lib/db/prisma';
import { sendPushToUser } from '@/lib/push/push.service';

describe('sendPushToUser', () => {
  it('не вызывает prisma при отсутствии VAPID (pushConfigured=false)', async () => {
    vi.mocked(prisma.pushSubscription.findMany).mockClear();
    await sendPushToUser('user-1', { title: 'Test', body: 'Body' });
    expect(prisma.pushSubscription.findMany).not.toHaveBeenCalled();
  });
});
