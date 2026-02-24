/**
 * @file report.prompt.test.ts
 * @description Unit-тесты для report.prompt: fallback при ошибке AI, структура данных
 * @created 2026-02-24
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(function () {
    return {
      chat: {
        completions: {
          create: vi.fn().mockImplementation(() => Promise.reject(new Error('API error'))),
        },
      },
    };
  }),
}));

import { generateReportSummary } from '@/lib/ai/report.prompt';

describe('generateReportSummary', () => {
  const baseData = {
    patientName: 'Иван Иванов',
    periodDays: 30,
    medications: [
      {
        name: 'Метформин',
        dosage: '500 мг',
        takenCount: 25,
        missedCount: 5,
        disciplinePercent: 83,
      },
    ],
    avgDisciplinePercent: 83,
    journalEntries: [
      {
        date: '2026-02-20',
        moodScore: 4,
        painLevel: 2,
        sleepQuality: 3,
        energyLevel: 4,
      },
    ],
    feedbacks: [
      {
        medicationName: 'Метформин',
        effectivenessScore: 4,
        sideEffects: 'нет',
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('возвращает fallback при ошибке AI', async () => {
    const result = await generateReportSummary(baseData);

    expect(result).toHaveProperty('overallAssessment');
    expect(result).toHaveProperty('disciplineComment');
    expect(result).toHaveProperty('wellbeingTrend');
    expect(result).toHaveProperty('medicationsComment');
    expect(result).toHaveProperty('recommendations');
    expect(result).toHaveProperty('doctorNote');

    expect(result.doctorNote).toContain('AI-анализ временно недоступен');
  });

  it('disciplineComment — соблюдение режима при avgDisciplinePercent >= 80', async () => {
    const result = await generateReportSummary({
      ...baseData,
      avgDisciplinePercent: 85,
    });
    expect(result.disciplineComment).toContain('соблюдает');
  });

  it('disciplineComment — нарушения при avgDisciplinePercent < 80', async () => {
    const result = await generateReportSummary({
      ...baseData,
      avgDisciplinePercent: 70,
    });
    expect(result.disciplineComment).toContain('нарушения');
  });

  it('wellbeingTrend содержит данные дневника при пустых записях', async () => {
    const result = await generateReportSummary({
      ...baseData,
      journalEntries: [],
    });
    expect(result.wellbeingTrend).toContain('Дневник не вёлся');
  });

  it('recommendations — массив из 2+ элементов', async () => {
    const result = await generateReportSummary(baseData);
    expect(Array.isArray(result.recommendations)).toBe(true);
    expect(result.recommendations.length).toBeGreaterThanOrEqual(2);
  });
});
