/**
 * @file report.prompt.ts
 * @description Промпт для AI-генерации текстового резюме отчёта для врача.
 * Анализирует дисциплину приёма, побочные эффекты, самочувствие.
 * @created 2026-02-22
 */

import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
});

export interface ReportData {
  patientName: string;
  periodDays: number;
  medications: {
    name: string;
    dosage: string;
    takenCount: number;
    missedCount: number;
    disciplinePercent: number;
  }[];
  avgDisciplinePercent: number;
  journalEntries: {
    date: string;
    moodScore: number | null;
    painLevel: number | null;
    sleepQuality: number | null;
    energyLevel: number | null;
  }[];
  feedbacks: {
    medicationName: string;
    effectivenessScore: number | null;
    sideEffects: string | null;
  }[];
}

export interface ReportSummary {
  overallAssessment: string;
  disciplineComment: string;
  wellbeingTrend: string;
  medicationsComment: string;
  recommendations: string[];
  doctorNote: string;
}

/** Генерирует текстовое резюме для врача через DeepSeek */
export async function generateReportSummary(data: ReportData): Promise<ReportSummary> {
  const medicationsSummary = data.medications
    .map(
      (m) =>
        `${m.name} ${m.dosage}: принято ${m.takenCount}, пропущено ${m.missedCount} (${m.disciplinePercent}%)`
    )
    .join('\n');

  const feedbackSummary = data.feedbacks
    .map(
      (f) =>
        `${f.medicationName}: эффективность ${f.effectivenessScore ?? 'не оценена'}/5, побочки: ${f.sideEffects ?? 'нет'}`
    )
    .join('\n');

  const journalSummary =
    data.journalEntries.length > 0
      ? `Среднее настроение: ${avgOrNull(data.journalEntries.map((e) => e.moodScore))},
       средняя боль: ${avgOrNull(data.journalEntries.map((e) => e.painLevel))},
       средний сон: ${avgOrNull(data.journalEntries.map((e) => e.sleepQuality))},
       средняя энергия: ${avgOrNull(data.journalEntries.map((e) => e.energyLevel))}`
      : 'Дневник не вёлся';

  const prompt = `Ты — медицинский AI-ассистент. Составь краткое резюме для врача на основе данных пациента.

Период: последние ${data.periodDays} дней
Средняя дисциплина: ${data.avgDisciplinePercent}%

Лекарства:
${medicationsSummary}

Самочувствие из дневника (шкала 1-5):
${journalSummary}

Отзывы о лекарствах:
${feedbackSummary || 'Отзывов нет'}

Верни JSON строго по схеме:
{
  "overallAssessment": "1-2 предложения общей оценки",
  "disciplineComment": "комментарий о соблюдении режима",
  "wellbeingTrend": "тренд самочувствия за период",
  "medicationsComment": "заметки о конкретных лекарствах",
  "recommendations": ["2-3 рекомендации для врача"],
  "doctorNote": "особые наблюдения, требующие внимания врача"
}

Пиши профессионально, на русском, без воды. Не ставь диагнозы.`;

  try {
    const response = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 800,
      temperature: 0.2,
    });

    return JSON.parse(response.choices[0]?.message.content ?? '{}') as ReportSummary;
  } catch {
    return {
      overallAssessment: `Средняя дисциплина за период: ${data.avgDisciplinePercent}%.`,
      disciplineComment:
        data.avgDisciplinePercent >= 80
          ? 'Пациент соблюдает режим приёма.'
          : 'Наблюдаются нарушения режима приёма.',
      wellbeingTrend: 'Данные дневника самочувствия: ' + journalSummary,
      medicationsComment: medicationsSummary,
      recommendations: ['Обсудить соблюдение режима', 'Уточнить наличие побочных эффектов'],
      doctorNote: 'AI-анализ временно недоступен. Данные предоставлены без интерпретации.',
    };
  }
}

function avgOrNull(values: (number | null)[]): string {
  const nums = values.filter((v): v is number => v !== null);
  if (nums.length === 0) return 'нет данных';
  return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1);
}
