/**
 * @file route.ts
 * @description API: GET /api/analysis/:patientId — AI-анализ корреляций.
 * Кэшируется в Redis на 24 часа. Доступ: пациент или привязанный родственник.
 * Rate limit: 3 запроса / час / пользователь.
 * @dependencies deepseek.service, analyze.prompt, prisma, redis
 * @created 2026-02-22
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { redis } from '@/lib/db/redis';
import { createChatCompletion } from '@/lib/ai/deepseek.service';
import {
  buildAnalysisPrompt,
  ANALYSIS_TEMPERATURE,
  ANALYSIS_MAX_TOKENS,
  type AnalysisInput,
} from '@/lib/ai/prompts/analyze.prompt';

const CACHE_TTL = 24 * 60 * 60;
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW = 60 * 60;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const { patientId } = await params;
  const userId = session.user.id;

  // Проверка доступа
  if (userId !== patientId) {
    const connection = await prisma.connection.findFirst({
      where: { patientId, relativeId: userId, status: 'active' },
    });
    if (!connection) {
      return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
    }
  }

  // Rate limiting
  const rlKey = `analysis_rl:${userId}`;
  const rlCount = await redis.incr(rlKey);
  if (rlCount === 1) await redis.expire(rlKey, RATE_LIMIT_WINDOW);
  if (rlCount > RATE_LIMIT_MAX) {
    return NextResponse.json(
      { error: 'Слишком много запросов. Попробуйте через час.' },
      { status: 429 }
    );
  }

  // Проверяем кэш
  const cacheKey = `analysis:${patientId}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    try {
      return NextResponse.json({ ...JSON.parse(cached), cached: true });
    } catch {
      // Кэш повреждён — перегенерируем
    }
  }

  // Собираем данные за 30 дней
  const since = new Date();
  since.setDate(since.getDate() - 30);
  since.setHours(0, 0, 0, 0);

  const [medications, logs, journal, meteo] = await Promise.all([
    prisma.medication.findMany({
      where: { patientId, isActive: true },
      select: { name: true, dosage: true, scheduledTime: true },
    }),
    prisma.medicationLog.findMany({
      where: { medication: { patientId }, scheduledAt: { gte: since } },
      select: { status: true, scheduledAt: true },
    }),
    prisma.healthJournal.findMany({
      where: { patientId, logDate: { gte: since } },
      select: {
        logDate: true,
        moodScore: true,
        painLevel: true,
        sleepQuality: true,
        energyLevel: true,
        freeText: true,
      },
      orderBy: { logDate: 'asc' },
    }),
    prisma.meteoLog.findMany({
      where: { patientId, logDate: { gte: since } },
      select: {
        logDate: true,
        temperature: true,
        humidity: true,
        pressure: true,
        weatherMain: true,
      },
      orderBy: { logDate: 'asc' },
    }),
  ]);

  if (medications.length === 0) {
    return NextResponse.json({
      patterns: [],
      recommendations: ['Добавьте лекарства в приложение для начала анализа.'],
      overallAssessment: 'Недостаточно данных: не добавлено ни одного лекарства.',
      riskLevel: 'low',
      cached: false,
    });
  }

  // Рассчитываем метрики
  const takenCount = logs.filter((l) => l.status === 'taken').length;
  const missedCount = logs.filter((l) => l.status === 'missed').length;
  const total = takenCount + missedCount;
  const disciplinePercent = total > 0 ? Math.round((takenCount / total) * 100) : 0;

  // Даты пропусков
  const missedDates = [
    ...new Set(
      logs.filter((l) => l.status === 'missed').map((l) => l.scheduledAt.toISOString().slice(0, 10))
    ),
  ];

  const analysisInput: AnalysisInput = {
    medications,
    disciplinePercent,
    avgDelayMinutes: 0,
    journalSummary: journal.map((j) => ({
      date: j.logDate.toISOString().slice(0, 10),
      mood: j.moodScore,
      pain: j.painLevel,
      sleep: j.sleepQuality,
      energy: j.energyLevel,
      notes: j.freeText,
    })),
    missedDates,
    meteoData:
      meteo.length > 0
        ? meteo.map((m) => ({
            date: m.logDate.toISOString().slice(0, 10),
            temperature: m.temperature,
            humidity: m.humidity,
            pressure: m.pressure,
            weatherMain: m.weatherMain,
          }))
        : undefined,
  };

  const prompt = buildAnalysisPrompt(analysisInput);

  try {
    const rawResponse = await createChatCompletion({
      messages: [{ role: 'user', content: prompt }],
      temperature: ANALYSIS_TEMPERATURE,
      maxTokens: ANALYSIS_MAX_TOKENS,
    });

    // Парсим JSON из ответа (AI может обернуть в ```json...```)
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI не вернул валидный JSON');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Кэшируем
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(analysis));

    return NextResponse.json({ ...analysis, cached: false });
  } catch (error) {
    console.error('[Analysis] AI error:', error);

    // Возвращаем fallback без AI
    return NextResponse.json({
      patterns: [],
      recommendations: [
        'AI-анализ временно недоступен. Попробуйте позже.',
        'Ведите дневник самочувствия для более точного анализа.',
      ],
      overallAssessment:
        journal.length < 7
          ? 'Недостаточно записей дневника для полноценного анализа. Ведите дневник ежедневно.'
          : `Дисциплина приёма: ${disciplinePercent}%. Пропусков: ${missedCount} за 30 дней.`,
      riskLevel: disciplinePercent < 70 ? 'medium' : 'low',
      cached: false,
      aiError: true,
    });
  }
}
