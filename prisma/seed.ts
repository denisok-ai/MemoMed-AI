/**
 * @file seed.ts
 * @description Заполнение БД тестовыми данными для разработки:
 *   50 пациентов, 5 врачей, 5 родственников, 1 администратор.
 *   Каждый пациент получает 5-10 лекарств, логи за 30 дней и записи дневника.
 * @dependencies prisma, bcryptjs, pg
 * @created 2026-02-22
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Prisma 7 + tsx не загружают .env автоматически — делаем вручную
const envPath = resolve(process.cwd(), '.env');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

import { PrismaClient, Role, MedicationLogStatus, SyncStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ DATABASE_URL не задана в .env');
  process.exit(1);
}

const pool = new Pool({ connectionString, max: 5 });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEV_PASSWORD = 'Test1234!';

// ─── Имена ───────────────────────────────────────────────────────────────────

const MALE_FIRST = [
  'Александр',
  'Дмитрий',
  'Сергей',
  'Андрей',
  'Алексей',
  'Михаил',
  'Николай',
  'Иван',
  'Василий',
  'Пётр',
  'Фёдор',
  'Геннадий',
  'Борис',
  'Владимир',
  'Анатолий',
  'Константин',
  'Леонид',
  'Виктор',
  'Евгений',
  'Юрий',
  'Тимофей',
  'Игорь',
  'Олег',
  'Роман',
  'Кирилл',
];

const FEMALE_FIRST = [
  'Елена',
  'Татьяна',
  'Ольга',
  'Людмила',
  'Наталья',
  'Светлана',
  'Галина',
  'Нина',
  'Тамара',
  'Антонина',
  'Зинаида',
  'Валентина',
  'Мария',
  'Анна',
  'Лидия',
  'Вера',
  'Надежда',
  'Любовь',
  'Ирина',
  'Екатерина',
  'Маргарита',
  'Раиса',
  'Клавдия',
  'Августина',
  'Инна',
];

const MALE_LAST = [
  'Иванов',
  'Смирнов',
  'Кузнецов',
  'Попов',
  'Васильев',
  'Петров',
  'Соколов',
  'Михайлов',
  'Новиков',
  'Фёдоров',
  'Морозов',
  'Волков',
  'Алексеев',
  'Лебедев',
  'Семёнов',
  'Егоров',
  'Козлов',
  'Никитин',
  'Соловьёв',
  'Степанов',
  'Киселёв',
  'Орлов',
  'Яковлев',
  'Зайцев',
  'Громов',
];

const FEMALE_LAST = [
  'Иванова',
  'Смирнова',
  'Кузнецова',
  'Попова',
  'Васильева',
  'Петрова',
  'Соколова',
  'Михайлова',
  'Новикова',
  'Фёдорова',
  'Морозова',
  'Волкова',
  'Алексеева',
  'Лебедева',
  'Семёнова',
  'Егорова',
  'Козлова',
  'Никитина',
  'Соловьёва',
  'Степанова',
  'Киселёва',
  'Орлова',
  'Яковлева',
  'Зайцева',
  'Громова',
];

// ─── Лекарства ────────────────────────────────────────────────────────────────

const MEDICATIONS = [
  {
    name: 'Метформин',
    dosage: '500 мг',
    time: '08:00',
    instruction: 'Принимать во время еды. Контроль сахара в крови обязателен.',
  },
  {
    name: 'Амлодипин',
    dosage: '5 мг',
    time: '08:00',
    instruction: 'Принимать утром независимо от еды. Контроль АД.',
  },
  {
    name: 'Лизиноприл',
    dosage: '10 мг',
    time: '08:00',
    instruction: 'Принимать утром натощак. При кашле сообщите врачу.',
  },
  {
    name: 'Аторвастатин',
    dosage: '20 мг',
    time: '21:00',
    instruction: 'Принимать вечером. Избегать грейпфрута.',
  },
  { name: 'Омепразол', dosage: '20 мг', time: '07:30', instruction: 'За 30 минут до завтрака.' },
  {
    name: 'Аспирин',
    dosage: '100 мг',
    time: '12:00',
    instruction: 'Принимать после еды. Не сочетать с алкоголем.',
  },
  {
    name: 'Бисопролол',
    dosage: '5 мг',
    time: '08:00',
    instruction: 'Принимать утром. Не прекращать приём резко.',
  },
  {
    name: 'Торасемид',
    dosage: '5 мг',
    time: '08:00',
    instruction: 'Принимать утром. Контроль баланса жидкости.',
  },
  {
    name: 'Варфарин',
    dosage: '2.5 мг',
    time: '17:00',
    instruction: 'Принимать в одно и то же время. Контроль МНО обязателен.',
  },
  {
    name: 'Эналаприл',
    dosage: '5 мг',
    time: '08:00',
    instruction: 'Принимать утром. Контроль АД через 2 часа.',
  },
  {
    name: 'Лозартан',
    dosage: '50 мг',
    time: '08:00',
    instruction: 'Принимать независимо от еды. Контроль АД.',
  },
  {
    name: 'Карведилол',
    dosage: '12.5 мг',
    time: '08:00',
    instruction: 'Принимать во время еды. Контроль пульса.',
  },
  {
    name: 'Левотироксин',
    dosage: '50 мкг',
    time: '07:00',
    instruction: 'Принимать строго натощак за 30 мин до еды.',
  },
  {
    name: 'Алендронат',
    dosage: '70 мг',
    time: '08:00',
    instruction: 'Принимать раз в неделю. Оставаться в вертикальном положении 30 мин.',
  },
  { name: 'Пантопразол', dosage: '40 мг', time: '07:30', instruction: 'За 30 минут до завтрака.' },
  {
    name: 'Глибенкламид',
    dosage: '5 мг',
    time: '07:30',
    instruction: 'Принимать за 20 мин до еды. Контроль сахара.',
  },
  {
    name: 'Теофиллин',
    dosage: '200 мг',
    time: '08:00',
    instruction: 'Принимать после еды. Не сочетать с кофе.',
  },
  {
    name: 'Дигоксин',
    dosage: '0.25 мг',
    time: '08:00',
    instruction: 'Строго по назначению. Контроль ЧСС.',
  },
  {
    name: 'Фуросемид',
    dosage: '40 мг',
    time: '08:00',
    instruction: 'Принимать утром. Контроль диуреза.',
  },
  {
    name: 'Нифедипин',
    dosage: '10 мг',
    time: '08:00',
    instruction: 'Принимать не разжёвывая. Контроль АД.',
  },
  {
    name: 'Верапамил',
    dosage: '80 мг',
    time: '08:00',
    instruction: 'Принимать во время еды. Контроль пульса.',
  },
  {
    name: 'Симвастатин',
    dosage: '20 мг',
    time: '21:00',
    instruction: 'Принимать вечером. Контроль печёночных ферментов.',
  },
  {
    name: 'Клопидогрел',
    dosage: '75 мг',
    time: '08:00',
    instruction: 'Принимать один раз в день. Не прерывать без назначения.',
  },
  {
    name: 'Рамиприл',
    dosage: '5 мг',
    time: '08:00',
    instruction: 'Принимать независимо от еды. Контроль АД.',
  },
  {
    name: 'Алмагель',
    dosage: '1 пак.',
    time: '13:00',
    instruction: 'Принимать за 30 минут до еды или через 1.5 часа после.',
  },
];

// ─── Специальности врачей ─────────────────────────────────────────────────────

const DOCTOR_SPECIALTIES = ['Кардиолог', 'Терапевт', 'Невролог', 'Эндокринолог', 'Гастроэнтеролог'];

// ─── Утилиты ──────────────────────────────────────────────────────────────────

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function setTime(date: Date, timeStr: string): Date {
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d;
}

// ─── Основная функция ─────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Начинаем заполнение тестовыми данными...\n');

  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 10);

  // ── 1. Администратор ────────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: 'admin@memomed.dev' },
    update: {},
    create: {
      email: 'admin@memomed.dev',
      passwordHash,
      role: Role.admin,
      consentGiven: true,
      feedbackConsent: true,
      profile: {
        create: {
          fullName: 'Администратор Системы',
          onboardingDone: true,
          aiDisclaimerShown: true,
        },
      },
    },
  });
  console.log(`✅ Администратор: ${admin.email}`);

  // ── 2. Врачи ────────────────────────────────────────────────────────────────
  const doctors: { id: string; email: string }[] = [];
  for (let i = 1; i <= 5; i++) {
    const isMale = i % 2 === 1;
    const firstName = isMale ? MALE_FIRST[i - 1] : FEMALE_FIRST[i - 1];
    const lastName = isMale ? MALE_LAST[i - 1] : FEMALE_LAST[i - 1];
    const specialty = DOCTOR_SPECIALTIES[i - 1];
    const email = `doctor${i}@memomed.dev`;

    const doctor = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash,
        role: Role.doctor,
        consentGiven: true,
        feedbackConsent: false,
        profile: {
          create: {
            fullName: `${lastName} ${firstName} — ${specialty}`,
            onboardingDone: true,
            aiDisclaimerShown: true,
          },
        },
      },
    });
    doctors.push({ id: doctor.id, email: doctor.email });
    console.log(`✅ Врач ${i}: ${doctor.email}`);
  }

  // ── 3. Родственники ──────────────────────────────────────────────────────────
  const relatives: { id: string; email: string }[] = [];
  for (let i = 1; i <= 5; i++) {
    const isMale = i % 2 === 0;
    const firstName = isMale ? MALE_FIRST[i + 5] : FEMALE_FIRST[i + 5];
    const lastName = isMale ? MALE_LAST[i + 5] : FEMALE_LAST[i + 5];
    const email = `relative${i}@memomed.dev`;

    const relative = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash,
        role: Role.relative,
        consentGiven: true,
        feedbackConsent: true,
        profile: {
          create: {
            fullName: `${lastName} ${firstName}`,
            onboardingDone: true,
            aiDisclaimerShown: false,
          },
        },
      },
    });
    relatives.push({ id: relative.id, email: relative.email });
    console.log(`✅ Родственник ${i}: ${relative.email}`);
  }

  // ── 4. Пациенты (50 шт.) ────────────────────────────────────────────────────
  console.log('\n📋 Создаём пациентов...');

  for (let i = 1; i <= 50; i++) {
    const isMale = i % 3 !== 0;
    const firstNames = isMale ? MALE_FIRST : FEMALE_FIRST;
    const lastNames = isMale ? MALE_LAST : FEMALE_LAST;
    const firstName = firstNames[(i - 1) % firstNames.length];
    const lastName = lastNames[(i - 1) % lastNames.length];
    const email = `patient${i}@memomed.dev`;

    const birthYear = rand(1940, 1965);
    const birthMonth = rand(1, 12);
    const birthDay = rand(1, 28);

    const patient = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash,
        role: Role.patient,
        consentGiven: true,
        feedbackConsent: i % 3 === 0,
        profile: {
          create: {
            fullName: `${lastName} ${firstName}`,
            dateOfBirth: new Date(birthYear, birthMonth - 1, birthDay),
            timezone: 'Europe/Moscow',
            regionCode: pick(['RU-MOW', 'RU-SPE', 'RU-SVE', 'RU-KDA', 'RU-TAT']),
            onboardingDone: true,
            aiDisclaimerShown: i % 4 === 0,
          },
        },
      },
    });

    // ── 4a. Связать с родственником (первые 25 пациентов) ──
    if (i <= 25) {
      const relative = relatives[(i - 1) % relatives.length];
      await prisma.connection.upsert({
        where: { patientId_relativeId: { patientId: patient.id, relativeId: relative.id } },
        update: {},
        create: {
          patientId: patient.id,
          relativeId: relative.id,
          status: 'active',
        },
      });
    }

    // ── 4b. Назначить лекарства (5-10 штук) ───────────────────────────────────
    const medCount = rand(5, 10);
    const selectedMeds = shuffle(MEDICATIONS).slice(0, medCount);

    for (const med of selectedMeds) {
      const medication = await prisma.medication.create({
        data: {
          patientId: patient.id,
          name: med.name,
          dosage: med.dosage,
          instruction: med.instruction,
          scheduledTime: med.time,
          isActive: true,
        },
      });

      // ── 4c. Логи за 30 дней ────────────────────────────────────────────────
      const logs: {
        medicationId: string;
        scheduledAt: Date;
        actualAt: Date | null;
        status: MedicationLogStatus;
        syncStatus: SyncStatus;
        createdAt: Date;
      }[] = [];

      for (let day = 29; day >= 0; day--) {
        const baseDate = daysAgo(day);
        const scheduledAt = setTime(baseDate, med.time);

        // Не создаём логи для будущего времени сегодня
        if (scheduledAt > new Date()) continue;

        const roll = Math.random();
        let status: MedicationLogStatus;
        let actualAt: Date | null = null;

        if (roll < 0.75) {
          status = MedicationLogStatus.taken;
          const delayMin = rand(0, 20);
          actualAt = new Date(scheduledAt.getTime() + delayMin * 60_000);
        } else if (roll < 0.9) {
          status = MedicationLogStatus.missed;
        } else {
          status = MedicationLogStatus.pending;
        }

        logs.push({
          medicationId: medication.id,
          scheduledAt,
          actualAt,
          status,
          syncStatus: SyncStatus.synced,
          createdAt: scheduledAt,
        });
      }

      if (logs.length > 0) {
        await prisma.medicationLog.createMany({ data: logs });
      }
    }

    // ── 4d. Дневник самочувствия (14 дней) ────────────────────────────────────
    for (let day = 13; day >= 0; day--) {
      const logDate = daysAgo(day);
      logDate.setHours(0, 0, 0, 0);

      await prisma.healthJournal.upsert({
        where: { patientId_logDate: { patientId: patient.id, logDate } },
        update: {},
        create: {
          patientId: patient.id,
          logDate,
          moodScore: rand(4, 10),
          painLevel: rand(0, 6),
          sleepQuality: rand(5, 10),
          energyLevel: rand(4, 9),
          freeText:
            day % 3 === 0
              ? pick([
                  'Чувствую себя неплохо, давление в норме.',
                  'Немного болит голова с утра.',
                  'Хорошо поспал, настроение бодрое.',
                  'Есть небольшие боли в суставах.',
                  'Принял все лекарства вовремя.',
                  'Немного кружится голова после приёма таблеток.',
                  'Погода влияет на самочувствие.',
                  'Гулял 30 минут, чувствую себя лучше.',
                ])
              : null,
          syncStatus: SyncStatus.synced,
        },
      });
    }

    if (i % 10 === 0) {
      console.log(`  ✅ Создано пациентов: ${i}/50`);
    }
  }

  // ── 5. Связи врач-пациент ─────────────────────────────────────────────────────
  // Каждый врач наблюдает 10 пациентов: врач1 → patient1-10, врач2 → patient11-20, etc.
  console.log('\n👨‍⚕️ Создаём связи врач-пациент...');

  const patientUsers = await prisma.user.findMany({
    where: { role: Role.patient },
    select: { id: true, email: true },
    orderBy: { email: 'asc' },
  });

  for (let di = 0; di < doctors.length; di++) {
    const doctor = doctors[di];
    const slice = patientUsers.slice(di * 10, di * 10 + 10);
    for (const patient of slice) {
      await prisma.connection.upsert({
        where: { patientId_relativeId: { patientId: patient.id, relativeId: doctor.id } },
        update: {},
        create: {
          patientId: patient.id,
          relativeId: doctor.id,
          status: 'active',
        },
      });
    }
    console.log(`  ✅ Врач ${di + 1} (${doctor.email}): ${slice.length} пациентов`);
  }

  // ── 6. LLM провайдеры ─────────────────────────────────────────────────────────
  console.log('\n🧠 Создаём LLM провайдеры...');
  const llmProviders = [
    {
      name: 'DeepSeek Chat',
      baseUrl: 'https://api.deepseek.com/v1',
      model: 'deepseek-chat',
      isActive: true,
      temperature: 0.7,
      maxTokens: 500,
      notes: 'Основной провайдер. Совместим с OpenAI SDK. Дешевле GPT-4o в ~18 раз.',
    },
    {
      name: 'DeepSeek Reasoner',
      baseUrl: 'https://api.deepseek.com/v1',
      model: 'deepseek-reasoner',
      isActive: false,
      temperature: 0.1,
      maxTokens: 2000,
      notes: 'Для сложного анализа (CoT). Дороже, но точнее для аналитических задач.',
    },
    {
      name: 'OpenAI GPT-4o',
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-4o',
      isActive: false,
      temperature: 0.7,
      maxTokens: 500,
      notes: 'Резервный провайдер. Требует отдельного API ключа.',
    },
  ];

  for (const llm of llmProviders) {
    const existing = await prisma.llmProvider.findFirst({ where: { name: llm.name } });
    if (!existing) {
      await prisma.llmProvider.create({ data: llm });
    }
  }
  console.log('  ✅ LLM провайдеры созданы');

  // ── 7. Добавляем промпт-шаблоны ──────────────────────────────────────────────
  console.log('\n🤖 Создаём промпт-шаблоны...');
  await prisma.promptTemplate.upsert({
    where: { name: 'chat-assistant-v1' },
    update: {},
    create: {
      name: 'chat-assistant-v1',
      category: 'chat',
      personaBlock: 'Ты — MemoMed AI, заботливый медицинский ассистент для пожилых людей.',
      contextBlock:
        'Пациент принимает несколько лекарств ежедневно и может задавать вопросы о них.',
      taskBlock:
        'Отвечай кратко (2-3 предложения). Простым языком. Не ставь диагнозы. Рекомендуй врача при серьёзных жалобах.',
      status: 'active',
      version: 1,
    },
  });

  await prisma.promptTemplate.upsert({
    where: { name: 'parse-instruction-v1' },
    update: {},
    create: {
      name: 'parse-instruction-v1',
      category: 'parse',
      personaBlock: 'Ты — медицинский парсер инструкций к лекарствам.',
      contextBlock: 'Тебе передаётся текст инструкции к лекарству.',
      taskBlock: 'Извлеки: название, дозировку, время приёма, противопоказания. Верни JSON.',
      status: 'active',
      version: 1,
    },
  });

  await prisma.promptTemplate.upsert({
    where: { name: 'analyze-symptoms-v1' },
    update: {},
    create: {
      name: 'analyze-symptoms-v1',
      category: 'analyze',
      personaBlock: 'Ты — аналитик медицинских данных.',
      contextBlock: 'Тебе переданы данные о симптомах, лекарствах и погоде за период.',
      taskBlock:
        'Найди корреляции и паттерны. Укажи возможные взаимосвязи. Используй осторожные формулировки.',
      status: 'draft',
      version: 1,
    },
  });
  console.log('  ✅ Промпт-шаблоны созданы');

  // ── Итог ──────────────────────────────────────────────────────────────────────
  const [userCount, medCount, logCount, journalCount, connCount] = await Promise.all([
    prisma.user.count(),
    prisma.medication.count(),
    prisma.medicationLog.count(),
    prisma.healthJournal.count(),
    prisma.connection.count({ where: { status: 'active' } }),
  ]);

  console.log('\n🎉 Готово!\n');
  console.log('📊 Итоговая статистика:');
  console.log(`   Пользователей:      ${userCount}`);
  console.log(`   Активных связей:    ${connCount}`);
  console.log(`   Лекарств:           ${medCount}`);
  console.log(`   Логов приёмов:      ${logCount}`);
  console.log(`   Записей дневника:   ${journalCount}`);
  console.log('\n🔑 Все пароли: Test1234!\n');
  console.log('📋 Тестовые аккаунты:');
  console.log('   admin@memomed.dev   → /admin');
  console.log('   doctor1@memomed.dev → /doctor/dashboard');
  console.log('   relative1@memomed.dev → /feed');
  console.log('   patient1@memomed.dev → /dashboard');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка сидирования:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
