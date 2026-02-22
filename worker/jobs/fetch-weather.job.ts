/**
 * @file fetch-weather.job.ts
 * @description BullMQ Worker: получение метеоданных с OpenWeather API для всех пациентов.
 * Запускается каждые 3 часа. Опциональный — пропускается если OPENWEATHER_API_KEY не задан.
 * @dependencies bullmq, ioredis, prisma
 * @created 2026-02-22
 */

import { Worker, Queue } from 'bullmq';
import type { Job } from 'bullmq';
import { redisConnection } from '../lib/redis';
import { prisma } from '../lib/prisma';

const QUEUE_NAME = 'fetch-weather';
const OPENWEATHER_BASE = 'https://api.openweathermap.org/data/2.5';

interface WeatherJobData {
  patientId: string;
  regionCode: string;
}

interface OpenWeatherResponse {
  main: {
    temp: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{ main: string }>;
}

async function fetchWeatherForRegion(
  regionCode: string,
  apiKey: string
): Promise<{
  temperature: number;
  humidity: number;
  pressure: number;
  weatherMain: string;
} | null> {
  try {
    const url = `${OPENWEATHER_BASE}/weather?q=${encodeURIComponent(regionCode)}&appid=${apiKey}&units=metric&lang=ru`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as OpenWeatherResponse;
    return {
      temperature: data.main.temp,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      weatherMain: data.weather[0]?.main ?? 'Unknown',
    };
  } catch {
    return null;
  }
}

async function processWeatherJob(job: Job<WeatherJobData>) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    console.log('[Weather] OPENWEATHER_API_KEY не задан, пропускаю');
    return;
  }

  const { patientId, regionCode } = job.data;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Проверяем, не записывали ли уже сегодня
  const existing = await prisma.meteoLog.findUnique({
    where: { patientId_logDate: { patientId, logDate: today } },
  });
  if (existing) return;

  const weather = await fetchWeatherForRegion(regionCode, apiKey);
  if (!weather) {
    console.warn(`[Weather] Не удалось получить данные для ${regionCode}`);
    return;
  }

  await prisma.meteoLog.create({
    data: {
      patientId,
      logDate: today,
      temperature: weather.temperature,
      humidity: weather.humidity,
      pressure: weather.pressure,
      weatherMain: weather.weatherMain,
      regionCode,
    },
  });

  console.log(
    `[Weather] Записаны данные для пациента ${patientId} (${regionCode}): ${weather.temperature}°C`
  );
}

export const fetchWeatherWorker = new Worker<WeatherJobData>(QUEUE_NAME, processWeatherJob, {
  connection: redisConnection,
  concurrency: 3,
});

fetchWeatherWorker.on('failed', (job, err) => {
  console.error(`[Weather] Job failed: ${job?.id}`, err);
});

// Cron-планировщик: запускает сбор данных для всех пациентов каждые 3 часа
export const weatherQueue = new Queue<WeatherJobData>(QUEUE_NAME, { connection: redisConnection });

export async function scheduleWeatherJobs() {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    console.log('[Weather] Пропускаю расписание: OPENWEATHER_API_KEY не задан');
    return;
  }

  const profiles = await prisma.profile.findMany({
    where: { regionCode: { not: null } },
    select: { userId: true, regionCode: true },
  });

  for (const profile of profiles) {
    if (!profile.regionCode) continue;
    await weatherQueue.add(
      'fetch',
      { patientId: profile.userId, regionCode: profile.regionCode },
      { removeOnComplete: 50, removeOnFail: 20 }
    );
  }

  console.log(`[Weather] Запланировано ${profiles.length} задач сбора метеоданных`);
}
