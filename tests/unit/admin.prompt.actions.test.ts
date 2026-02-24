/**
 * @file admin.prompt.actions.test.ts
 * @description Unit-тесты для updatePromptAction, deletePromptAction
 * @created 2026-02-24
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    promptTemplate: { findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
  },
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { updatePromptAction, deletePromptAction } from '@/lib/admin/prompt.actions';

describe('updatePromptAction', () => {
  beforeEach(() => vi.clearAllMocks());

  it('возвращает ошибку при отсутствии прав admin', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const result = await updatePromptAction('prompt-1', {
      personaBlock: 'p',
      contextBlock: 'c',
      taskBlock: 't',
    });
    expect(result).toEqual({ error: 'Недостаточно прав' });
  });

  it('возвращает ошибку при пустом taskBlock', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'a1', email: 'a@test.ru', role: 'admin' },
      expires: '',
    });
    const result = await updatePromptAction('prompt-1', {
      personaBlock: 'p',
      contextBlock: 'c',
      taskBlock: '   ',
    });
    expect(result).toEqual({ error: 'Блок задачи не может быть пустым' });
  });

  it('возвращает ошибку если промпт не найден', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'a1', email: 'a@test.ru', role: 'admin' },
      expires: '',
    });
    vi.mocked(prisma.promptTemplate.findUnique).mockResolvedValue(null);
    const result = await updatePromptAction('unknown', {
      personaBlock: 'p',
      contextBlock: 'c',
      taskBlock: 't',
    });
    expect(result).toEqual({ error: 'Промпт не найден' });
  });

  it('обновляет промпт при успехе', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'a1', email: 'a@test.ru', role: 'admin' },
      expires: '',
    });
    vi.mocked(prisma.promptTemplate.findUnique).mockResolvedValue({
      id: 'prompt-1',
      version: 1,
    } as never);
    vi.mocked(prisma.promptTemplate.update).mockResolvedValue({} as never);
    const result = await updatePromptAction('prompt-1', {
      personaBlock: '  persona  ',
      contextBlock: '  context  ',
      taskBlock: '  task  ',
    });
    expect(result).toEqual({ success: true });
    expect(prisma.promptTemplate.update).toHaveBeenCalledWith({
      where: { id: 'prompt-1' },
      data: {
        personaBlock: 'persona',
        contextBlock: 'context',
        taskBlock: 'task',
        version: 2,
      },
    });
  });
});

describe('deletePromptAction', () => {
  beforeEach(() => vi.clearAllMocks());

  it('возвращает ошибку при отсутствии прав admin', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'patient' } } as never);
    const result = await deletePromptAction('prompt-1');
    expect(result).toEqual({ error: 'Недостаточно прав' });
  });

  it('удаляет промпт при успехе', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'a1', email: 'a@test.ru', role: 'admin' },
      expires: '',
    });
    vi.mocked(prisma.promptTemplate.delete).mockResolvedValue({} as never);
    const result = await deletePromptAction('prompt-1');
    expect(result).toEqual({ success: true });
    expect(prisma.promptTemplate.delete).toHaveBeenCalledWith({ where: { id: 'prompt-1' } });
  });
});
