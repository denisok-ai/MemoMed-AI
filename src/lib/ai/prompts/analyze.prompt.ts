/**
 * @file analyze.prompt.ts
 * @description Промпт для AI-анализа корреляций между приёмами лекарств и самочувствием.
 * Температура 0.1 — аналитика, не творчество.
 * @created 2026-02-22
 */

export interface MeteoEntry {
  date: string;
  temperature: number | null;
  humidity: number | null;
  pressure: number | null;
  weatherMain: string | null;
}

export interface AnalysisInput {
  medications: Array<{
    name: string;
    dosage: string;
    scheduledTime: string;
  }>;
  disciplinePercent: number;
  avgDelayMinutes: number;
  journalSummary: Array<{
    date: string;
    mood: number | null;
    pain: number | null;
    sleep: number | null;
    energy: number | null;
    notes: string | null;
  }>;
  missedDates: string[];
  meteoData?: MeteoEntry[];
}

export function buildAnalysisPrompt(input: AnalysisInput): string {
  const medList = input.medications
    .map((m) => `- ${m.name} (${m.dosage}), время: ${m.scheduledTime}`)
    .join('\n');

  const journalRows = input.journalSummary
    .map((j) => {
      const parts = [`Дата: ${j.date}`];
      if (j.mood !== null) parts.push(`настроение: ${j.mood}/5`);
      if (j.pain !== null) parts.push(`боль: ${j.pain}/5`);
      if (j.sleep !== null) parts.push(`сон: ${j.sleep}/5`);
      if (j.energy !== null) parts.push(`энергия: ${j.energy}/5`);
      if (j.notes) parts.push(`заметка: "${j.notes}"`);
      return parts.join(', ');
    })
    .join('\n');

  const missedStr =
    input.missedDates.length > 0
      ? `Даты пропусков лекарств: ${input.missedDates.join(', ')}`
      : 'Пропусков лекарств не зафиксировано.';

  const meteoSection =
    input.meteoData && input.meteoData.length > 0
      ? `\nМетеоданные:\n${input.meteoData
          .map((m) => {
            const parts = [`${m.date}`];
            if (m.temperature !== null) parts.push(`${m.temperature}°C`);
            if (m.humidity !== null) parts.push(`влажность ${m.humidity}%`);
            if (m.pressure !== null) parts.push(`давление ${m.pressure} гПа`);
            if (m.weatherMain) parts.push(m.weatherMain);
            return parts.join(', ');
          })
          .join('\n')}`
      : '';

  const hasMeteo = meteoSection.length > 0;

  return `Ты — медицинский AI-аналитик. Проанализируй данные пациента и найди корреляции.

ДАННЫЕ ПАЦИЕНТА:

Лекарства:
${medList}

Дисциплина приёма: ${input.disciplinePercent}% (средняя задержка: ${input.avgDelayMinutes} мин)
${missedStr}

Дневник самочувствия:
${journalRows || 'Нет записей дневника.'}
${meteoSection}

ЗАДАЧА:
1. Найди паттерны между пропусками лекарств и ухудшением самочувствия.
2. Определи, влияет ли регулярность приёма на показатели сна, настроения, боли, энергии.
3. Выяви тренды (улучшение/ухудшение со временем).
${hasMeteo ? '4. Найди корреляции между погодными условиями и самочувствием (давление, температура).\n5.' : '4.'} Сформулируй 2-3 конкретных рекомендации.

ФОРМАТ ОТВЕТА (строго JSON):
{
  "patterns": [
    { "type": "correlation" | "trend" | "anomaly", "description": "описание на русском", "confidence": "high" | "medium" | "low" }
  ],
  "recommendations": ["рекомендация 1", "рекомендация 2"],
  "overallAssessment": "краткая оценка состояния пациента (1-2 предложения)",
  "riskLevel": "low" | "medium" | "high"
}

ВАЖНО:
- Ты НЕ врач. Указывай, что это предварительный анализ, а не диагноз.
- Не давай советов по изменению дозировки или отмене лекарств.
- Если данных недостаточно — укажи это в overallAssessment.`;
}

export const ANALYSIS_TEMPERATURE = 0.1;
export const ANALYSIS_MAX_TOKENS = 800;
