/**
 * @file llm.actions.ts
 * @description Server Actions для управления LLM провайдерами
 * @dependencies prisma, zod
 * @created 2026-02-22
 */

'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth';

const llmSchema = z.object({
  name: z.string().min(1, 'Название обязательно').max(100),
  baseUrl: z.string().url('Некорректный URL'),
  model: z.string().min(1, 'Модель обязательна'),
  apiKey: z.string().optional(),
  temperature: z.coerce.number().min(0).max(2).default(0.7),
  maxTokens: z.coerce.number().int().min(100).max(32000).default(500),
  notes: z.string().max(500).optional(),
});

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') redirect('/login');
  return session;
}

export async function createLlmProviderAction(formData: FormData) {
  await requireAdmin();

  const parsed = llmSchema.safeParse({
    name: formData.get('name'),
    baseUrl: formData.get('baseUrl'),
    model: formData.get('model'),
    apiKey: formData.get('apiKey') ?? undefined,
    temperature: formData.get('temperature'),
    maxTokens: formData.get('maxTokens'),
    notes: formData.get('notes') ?? undefined,
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const { apiKey, ...data } = parsed.data;
  const apiKeyHash = apiKey ? `...${apiKey.slice(-4)}` : undefined;

  await prisma.llmProvider.create({
    data: { ...data, apiKeyHash, isActive: false },
  });

  revalidatePath('/admin/llm');
  redirect('/admin/llm');
}

export async function updateLlmProviderAction(id: string, formData: FormData) {
  await requireAdmin();

  const parsed = llmSchema.safeParse({
    name: formData.get('name'),
    baseUrl: formData.get('baseUrl'),
    model: formData.get('model'),
    apiKey: formData.get('apiKey') ?? undefined,
    temperature: formData.get('temperature'),
    maxTokens: formData.get('maxTokens'),
    notes: formData.get('notes') ?? undefined,
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const { apiKey, ...data } = parsed.data;
  const updateData: Record<string, unknown> = { ...data };
  if (apiKey) updateData.apiKeyHash = `...${apiKey.slice(-4)}`;

  await prisma.llmProvider.update({ where: { id }, data: updateData });
  revalidatePath('/admin/llm');
  redirect('/admin/llm');
}

export async function activateLlmProviderAction(id: string) {
  await requireAdmin();
  await prisma.$transaction([
    prisma.llmProvider.updateMany({ data: { isActive: false } }),
    prisma.llmProvider.update({ where: { id }, data: { isActive: true } }),
  ]);
  revalidatePath('/admin/llm');
}

export async function deleteLlmProviderAction(id: string) {
  await requireAdmin();
  const active = await prisma.llmProvider.findUnique({ where: { id }, select: { isActive: true } });
  if (active?.isActive) return { error: 'Нельзя удалить активный провайдер' };
  await prisma.llmProvider.delete({ where: { id } });
  revalidatePath('/admin/llm');
}
