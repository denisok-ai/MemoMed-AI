/**
 * @file route.ts
 * @description GET /api/reports/:patientId?period=30d — генерация PDF-отчёта для врача.
 * Доступно пациенту (для себя) и подключённым родственникам.
 * Данные включают: дисциплина, история приёмов, дневник, отзывы, AI-резюме.
 * @created 2026-02-22
 */

import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer';
import { createElement, type ReactElement, type JSXElementConstructor } from 'react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { checkRateLimit } from '@/lib/rate-limit';
import { generateReportSummary } from '@/lib/ai/report.prompt';
import { PdfReport } from '@/components/shared/pdf-report';

interface RouteParams {
  params: Promise<{ patientId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
  }

  const { patientId } = await params;

  // Rate limit: 5 PDF в час (тяжёлый запрос с AI)
  const rl = await checkRateLimit(`report:${session.user.id}`, 5, 3600);
  if (!rl.allowed) {
    return NextResponse.json(
      {
        error: `Слишком много запросов. Повторите через ${Math.ceil(rl.resetInSeconds / 60)} мин.`,
      },
      { status: 429 }
    );
  }

  const { searchParams } = request.nextUrl;
  const periodParam = searchParams.get('period') ?? '30d';
  const periodDays = parseInt(periodParam.replace('d', ''), 10) || 30;

  // Проверяем права доступа: сам пациент или его родственник
  const isOwn = session.user.id === patientId;
  if (!isOwn) {
    const connection = await prisma.connection.findFirst({
      where: {
        patientId,
        relativeId: session.user.id,
        status: 'active',
      },
    });
    if (!connection) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });
    }
  }

  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - periodDays);

  // Загружаем все данные параллельно
  const [patient, medications, logs, journalEntries, feedbacks] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: patientId } }),
    prisma.medication.findMany({
      where: { patientId, isActive: true },
    }),
    prisma.medicationLog.findMany({
      where: {
        medication: { patientId },
        scheduledAt: { gte: fromDate },
      },
      include: { medication: { select: { name: true, dosage: true } } },
    }),
    prisma.healthJournal.findMany({
      where: {
        patientId,
        logDate: { gte: fromDate },
      },
      orderBy: { logDate: 'desc' },
    }),
    prisma.medicationFeedback.findMany({
      where: { patientId },
      include: { medication: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);

  // Агрегируем статистику по лекарствам
  const medicationStats = medications.map((med) => {
    const medLogs = logs.filter((l) => l.medicationId === med.id);
    const takenCount = medLogs.filter((l) => l.status === 'taken').length;
    const missedCount = medLogs.filter((l) => l.status === 'missed').length;
    const total = takenCount + missedCount;
    const disciplinePercent = total > 0 ? Math.round((takenCount / total) * 100) : 100;

    return { name: med.name, dosage: med.dosage, takenCount, missedCount, disciplinePercent };
  });

  const avgDisciplinePercent =
    medicationStats.length > 0
      ? Math.round(
          medicationStats.reduce((sum, m) => sum + m.disciplinePercent, 0) / medicationStats.length
        )
      : 100;

  const reportData = {
    patientName: patient?.fullName ?? 'Пациент',
    periodDays,
    medications: medicationStats,
    avgDisciplinePercent,
    journalEntries: journalEntries.map((e) => ({
      date: e.logDate.toISOString().split('T')[0],
      moodScore: e.moodScore,
      painLevel: e.painLevel,
      sleepQuality: e.sleepQuality,
      energyLevel: e.energyLevel,
    })),
    feedbacks: feedbacks.map((f) => ({
      medicationName: f.medication.name,
      effectivenessScore: f.effectivenessScore,
      sideEffects: f.sideEffects,
    })),
  };

  // Генерируем AI-резюме
  const summary = await generateReportSummary(reportData);

  // Рендерим PDF
  const generatedAt = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const pdfElement = createElement(PdfReport, {
    data: reportData,
    summary,
    generatedAt,
  }) as ReactElement<DocumentProps, string | JSXElementConstructor<unknown>>;

  const buffer = await renderToBuffer(pdfElement);

  const filename = `memomed-report-${patientId.slice(0, 8)}-${new Date().toISOString().split('T')[0]}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
