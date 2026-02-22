/**
 * @file analyze.prompt.test.ts
 * @description Тесты для функции buildAnalysisPrompt — проверяем корректность формирования промпта
 * @created 2026-02-22
 */

import { describe, it, expect } from 'vitest';
import { buildAnalysisPrompt, type AnalysisInput } from '@/lib/ai/prompts/analyze.prompt';

const baseMedications = [
  { name: 'Аспирин', dosage: '100 мг', scheduledTime: '08:00' },
  { name: 'Метформин', dosage: '500 мг', scheduledTime: '20:00' },
];

const baseInput: AnalysisInput = {
  medications: baseMedications,
  disciplinePercent: 85,
  avgDelayMinutes: 12,
  journalSummary: [],
  missedDates: [],
};

describe('buildAnalysisPrompt', () => {
  it('включает названия лекарств в промпт', () => {
    const prompt = buildAnalysisPrompt(baseInput);
    expect(prompt).toContain('Аспирин');
    expect(prompt).toContain('Метформин');
  });

  it('включает процент дисциплины', () => {
    const prompt = buildAnalysisPrompt(baseInput);
    expect(prompt).toContain('85%');
  });

  it('включает среднюю задержку', () => {
    const prompt = buildAnalysisPrompt(baseInput);
    expect(prompt).toContain('12');
  });

  it('указывает на отсутствие пропусков если missedDates пустой', () => {
    const prompt = buildAnalysisPrompt(baseInput);
    expect(prompt).toContain('Пропусков лекарств не зафиксировано');
  });

  it('перечисляет даты пропусков если они есть', () => {
    const input = { ...baseInput, missedDates: ['2026-02-10', '2026-02-15'] };
    const prompt = buildAnalysisPrompt(input);
    expect(prompt).toContain('2026-02-10');
    expect(prompt).toContain('2026-02-15');
  });

  it('добавляет секцию с записями дневника самочувствия', () => {
    const input: AnalysisInput = {
      ...baseInput,
      journalSummary: [
        { date: '2026-02-20', mood: 4, pain: 2, sleep: 3, energy: 4, notes: 'Хороший день' },
      ],
    };
    const prompt = buildAnalysisPrompt(input);
    expect(prompt).toContain('2026-02-20');
    expect(prompt).toContain('настроение: 4/5');
    expect(prompt).toContain('Хороший день');
  });

  it('включает метеоданные если они переданы', () => {
    const input: AnalysisInput = {
      ...baseInput,
      meteoData: [
        {
          date: '2026-02-20',
          temperature: -5.2,
          humidity: 75,
          pressure: 1013,
          weatherMain: 'Snow',
        },
      ],
    };
    const prompt = buildAnalysisPrompt(input);
    expect(prompt).toContain('-5.2°C');
    expect(prompt).toContain('Snow');
    expect(prompt).toContain('1013 гПа');
  });

  it('добавляет задачу анализа погоды если есть метеоданные', () => {
    const input: AnalysisInput = {
      ...baseInput,
      meteoData: [
        { date: '2026-02-20', temperature: 10, humidity: 60, pressure: 1020, weatherMain: 'Clear' },
      ],
    };
    const prompt = buildAnalysisPrompt(input);
    expect(prompt).toContain('погодными условиями');
  });

  it('НЕ добавляет задачу анализа погоды если meteoData отсутствует', () => {
    const prompt = buildAnalysisPrompt(baseInput);
    expect(prompt).not.toContain('погодными условиями');
  });

  it('требует JSON в ответе с корректными полями', () => {
    const prompt = buildAnalysisPrompt(baseInput);
    expect(prompt).toContain('"patterns"');
    expect(prompt).toContain('"recommendations"');
    expect(prompt).toContain('"overallAssessment"');
    expect(prompt).toContain('"riskLevel"');
  });

  it('содержит медицинский дисклеймер (не врач)', () => {
    const prompt = buildAnalysisPrompt(baseInput);
    expect(prompt).toContain('НЕ врач');
  });

  it('указывает что нет записей дневника', () => {
    const prompt = buildAnalysisPrompt({ ...baseInput, journalSummary: [] });
    expect(prompt).toContain('Нет записей дневника');
  });
});
