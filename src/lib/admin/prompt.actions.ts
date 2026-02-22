/**
 * @file prompt.actions.ts
 * @description Server Actions для управления промптами в админ-панели
 * @dependencies prisma, next-auth
 * @created 2026-02-22
 */

'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

interface ActionResult {
  error?: string;
  success?: boolean;
}

async function requireAdmin(): Promise<string | null> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') return 'Недостаточно прав';
  return null;
}

interface PromptBlocks {
  personaBlock: string;
  contextBlock: string;
  taskBlock: string;
}

export async function updatePromptAction(id: string, blocks: PromptBlocks): Promise<ActionResult> {
  const err = await requireAdmin();
  if (err) return { error: err };

  const { personaBlock, contextBlock, taskBlock } = blocks;
  if (!taskBlock.trim()) return { error: 'Блок задачи не может быть пустым' };

  const existing = await prisma.promptTemplate.findUnique({ where: { id } });
  if (!existing) return { error: 'Промпт не найден' };

  await prisma.promptTemplate.update({
    where: { id },
    data: {
      personaBlock: personaBlock.trim(),
      contextBlock: contextBlock.trim(),
      taskBlock: taskBlock.trim(),
      version: existing.version + 1,
    },
  });

  revalidatePath('/admin/prompts');
  return { success: true };
}

export async function deletePromptAction(id: string): Promise<ActionResult> {
  const err = await requireAdmin();
  if (err) return { error: err };

  await prisma.promptTemplate.delete({ where: { id } });
  revalidatePath('/admin/prompts');
  return { success: true };
}
