/**
 * @file actions.ts
 * @description Server Actions для аутентификации: вход и регистрация
 * @dependencies next-auth, bcryptjs, prisma, zod
 * @created 2026-02-22
 */

'use server';

import { signIn } from '@/lib/auth';
import { AuthError } from 'next-auth';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { redirect } from 'next/navigation';

/** Схема валидации формы входа */
const loginSchema = z.object({
  email: z.string().email('Некорректный адрес электронной почты'),
  password: z.string().min(1, 'Введите пароль'),
});

/** Схема валидации формы регистрации */
const registerSchema = z.object({
  email: z.string().email('Некорректный адрес электронной почты'),
  password: z.string().min(8, 'Пароль должен быть не менее 8 символов'),
  fullName: z.string().min(2, 'Имя слишком короткое').max(100, 'Имя слишком длинное'),
  role: z.enum(['patient', 'relative']),
  consentGiven: z
    .union([z.boolean(), z.string()])
    .transform((v) => v === true || v === 'on' || v === 'true'),
  feedbackConsent: z
    .union([z.boolean(), z.string()])
    .transform((v) => v === true || v === 'on' || v === 'true')
    .optional()
    .default(false),
});

export interface ActionResult {
  error?: string;
  success?: boolean;
}

/**
 * Server Action: вход по email + пароль
 * Использует NextAuth signIn и перенаправляет на дашборд
 */
export async function loginAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Некорректные данные' };
  }

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Неверный email или пароль' };
        default:
          return { error: 'Ошибка входа. Попробуйте снова.' };
      }
    }
    throw error;
  }

  redirect('/dashboard');
}

/**
 * Server Action: регистрация нового пользователя
 * Создаёт пользователя и профиль, затем выполняет вход
 */
export async function registerAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = registerSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    fullName: formData.get('fullName'),
    role: formData.get('role'),
    consentGiven: formData.get('consentGiven'),
    feedbackConsent: formData.get('feedbackConsent'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Некорректные данные' };
  }

  const { email, password, fullName, role, consentGiven, feedbackConsent } = parsed.data;

  if (!consentGiven) {
    return { error: 'Необходимо принять политику обработки персональных данных' };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: 'Пользователь с таким email уже существует' };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      role,
      consentGiven,
      feedbackConsent: feedbackConsent ?? false,
      profile: {
        create: { fullName },
      },
    },
  });

  try {
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
  } catch {
    return { error: 'Аккаунт создан, но вход не выполнен. Войдите вручную.' };
  }

  redirect('/dashboard');
}
