/**
 * @file admin.llm.actions.test.ts
 * @description Unit-тесты для createLlmProviderAction, updateLlmProviderAction, activateLlmProviderAction, deleteLlmProviderAction
 * @created 2026-02-24
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    llmProvider: {
      create: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({}),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      findUnique: vi.fn(),
      delete: vi.fn().mockResolvedValue({}),
    },
    $transaction: vi.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
  },
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import {
  createLlmProviderAction,
  updateLlmProviderAction,
  activateLlmProviderAction,
  deleteLlmProviderAction,
} from '@/lib/admin/llm.actions';

const adminSession = {
  user: { id: 'a1', email: 'a@test.ru', role: 'admin' },
  expires: '',
};

describe('createLlmProviderAction', () => {
  beforeEach(() => vi.clearAllMocks());

  it('редиректит на /login при отсутствии прав admin', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const formData = new FormData();
    formData.set('name', 'DeepSeek');
    formData.set('baseUrl', 'https://api.deepseek.com/v1');
    formData.set('model', 'deepseek-chat');
    await expect(createLlmProviderAction(formData)).rejects.toThrow('REDIRECT:/login');
  });

  it('возвращает ошибку при невалидных данных', async () => {
    vi.mocked(auth).mockResolvedValue(adminSession as never);
    const formData = new FormData();
    formData.set('name', '');
    formData.set('baseUrl', 'invalid');
    formData.set('model', 'x');
    const result = await createLlmProviderAction(formData);
    expect(result).toHaveProperty('error');
  });

  it('создаёт провайдера и редиректит при успехе', async () => {
    vi.mocked(auth).mockResolvedValue(adminSession as never);
    vi.mocked(prisma.llmProvider.create).mockResolvedValue({} as never);
    const formData = new FormData();
    formData.set('name', 'DeepSeek');
    formData.set('baseUrl', 'https://api.deepseek.com/v1');
    formData.set('model', 'deepseek-chat');
    formData.set('temperature', '0.7');
    formData.set('maxTokens', '500');
    await expect(createLlmProviderAction(formData)).rejects.toThrow('REDIRECT:/admin/llm');
    expect(prisma.llmProvider.create).toHaveBeenCalled();
  });
});

describe('updateLlmProviderAction', () => {
  beforeEach(() => vi.clearAllMocks());

  it('возвращает ошибку при невалидных данных', async () => {
    vi.mocked(auth).mockResolvedValue(adminSession as never);
    const formData = new FormData();
    formData.set('name', '');
    formData.set('baseUrl', 'https://x.com');
    formData.set('model', 'x');
    const result = await updateLlmProviderAction('llm-1', formData);
    expect(result).toHaveProperty('error');
  });
});

describe('activateLlmProviderAction', () => {
  beforeEach(() => vi.clearAllMocks());

  it('редиректит на /login при отсутствии прав admin', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    await expect(activateLlmProviderAction('llm-1')).rejects.toThrow('REDIRECT:/login');
  });

  it('активирует провайдера при успехе', async () => {
    vi.mocked(auth).mockResolvedValue(adminSession as never);
    vi.mocked(prisma.$transaction).mockResolvedValue([] as never);
    await activateLlmProviderAction('llm-1');
    expect(prisma.$transaction).toHaveBeenCalled();
  });
});

describe('deleteLlmProviderAction', () => {
  beforeEach(() => vi.clearAllMocks());

  it('редиректит на /login при отсутствии прав admin', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    await expect(deleteLlmProviderAction('llm-1')).rejects.toThrow('REDIRECT:/login');
  });

  it('возвращает ошибку при попытке удалить активный провайдер', async () => {
    vi.mocked(auth).mockResolvedValue(adminSession as never);
    vi.mocked(prisma.llmProvider.findUnique).mockResolvedValue({
      id: 'llm-1',
      isActive: true,
    } as never);
    const result = await deleteLlmProviderAction('llm-1');
    expect(result).toEqual({ error: 'Нельзя удалить активный провайдер' });
    expect(prisma.llmProvider.delete).not.toHaveBeenCalled();
  });

  it('удаляет неактивный провайдер', async () => {
    vi.mocked(auth).mockResolvedValue(adminSession as never);
    vi.mocked(prisma.llmProvider.findUnique).mockResolvedValue({
      id: 'llm-1',
      isActive: false,
    } as never);
    vi.mocked(prisma.llmProvider.delete).mockResolvedValue({} as never);
    await deleteLlmProviderAction('llm-1');
    expect(prisma.llmProvider.delete).toHaveBeenCalledWith({ where: { id: 'llm-1' } });
  });
});
