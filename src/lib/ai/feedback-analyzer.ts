/**
 * @file feedback-analyzer.ts
 * @description AI-анализ отзыва пациента о лекарстве через DeepSeek.
 * Извлекает структурированные данные: побочные эффекты, симптомы, рекомендации.
 * Результат кэшируется для одинаковых текстов.
 * @created 2026-02-22
 */

import OpenAI from 'openai';
import { createHash } from 'crypto';

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
});

export interface FeedbackAnalysis {
  /** Список выявленных побочных эффектов */
  sideEffects: string[];
  /** Симптомы улучшения (если упомянуты) */
  positiveEffects: string[];
  /** Ключевые тезисы из свободного текста */
  keyPoints: string[];
  /** Уровень беспокойства: low / medium / high */
  concernLevel: 'low' | 'medium' | 'high';
  /** Рекомендация системы: продолжать / проконсультироваться / срочно к врачу */
  recommendation: 'continue' | 'consult_doctor' | 'urgent';
  /** Анонимизированный краткий итог (без ПД) */
  anonymizedSummary: string;
}

const ANALYSIS_CACHE = new Map<string, FeedbackAnalysis>();

/** Анализирует отзыв пациента с помощью DeepSeek, кэшируя результат */
export async function analyzeFeedback(
  medicationName: string,
  dosage: string,
  freeText: string,
  sideEffects: string | null | undefined
): Promise<FeedbackAnalysis> {
  const textToAnalyze = [freeText, sideEffects].filter(Boolean).join(' | ');
  const cacheKey = createHash('sha256')
    .update(`${medicationName}:${dosage}:${textToAnalyze}`)
    .digest('hex')
    .slice(0, 16);

  const cached = ANALYSIS_CACHE.get(cacheKey);
  if (cached) return cached;

  const prompt = `Ты — медицинский AI-ассистент. Проанализируй отзыв пациента о лекарстве.

Лекарство: ${medicationName}, дозировка: ${dosage}
Отзыв: ${textToAnalyze}

Верни JSON строго по схеме:
{
  "sideEffects": ["список побочных эффектов или []"],
  "positiveEffects": ["симптомы улучшения или []"],
  "keyPoints": ["2-3 ключевых тезиса"],
  "concernLevel": "low|medium|high",
  "recommendation": "continue|consult_doctor|urgent",
  "anonymizedSummary": "краткий итог без личных данных, 1-2 предложения"
}

Правила:
- concernLevel=high если есть опасные симптомы (одышка, боль в груди, отёки, аллергия)
- recommendation=urgent если concernLevel=high
- anonymizedSummary не должен содержать имён, возраста, адресов`;

  try {
    const response = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 500,
      temperature: 0.1,
    });

    const content = response.choices[0]?.message.content ?? '{}';
    const analysis = JSON.parse(content) as FeedbackAnalysis;

    ANALYSIS_CACHE.set(cacheKey, analysis);
    setTimeout(() => ANALYSIS_CACHE.delete(cacheKey), 60 * 60 * 1000); // TTL 1 час

    return analysis;
  } catch {
    // Возвращаем базовый анализ при ошибке AI
    return {
      sideEffects: sideEffects ? [sideEffects] : [],
      positiveEffects: [],
      keyPoints: [freeText?.slice(0, 100) ?? ''],
      concernLevel: 'low',
      recommendation: 'continue',
      anonymizedSummary: 'Анализ временно недоступен',
    };
  }
}
