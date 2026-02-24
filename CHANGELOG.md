# Changelog

Все значимые изменения проекта MemoMed AI фиксируются в этом файле.

Формат: [Keep a Changelog](https://keepachangelog.com/ru/1.0.0/).  
Версионирование: [Semantic Versioning](https://semver.org/lang/ru/) (MAJOR.MINOR.PATCH).

---

## [Unreleased]

### Добавлено

- (пусто)

### Изменено

- (пусто)

### Исправлено

- (пусто)

---

## [0.3.0] — 2026-02-24

### Добавлено

- **Персонализация напоминаний (LLM)**: AI генерирует дружелюбный текст push-уведомлений (DeepSeek, temp 0.5, max 80 токенов, кэш Redis 7 дней)
- Unit-тесты (268): utils, report.prompt, reminder.prompt, env, cache.service, medications.queries, log-actions, connections.actions, onboarding.actions, medications.actions, reminders.queue, admin.prompt.actions, auth.actions, push.send, admin.llm.actions, auth.config, dev-actions

### Изменено

- buildMedicationReminderPayload: опциональный параметр bodyOverride для персонализированного текста
- reminder.job: вызов getPersonalizedReminderText перед отправкой push пациенту
- vitest thresholds: 5% → 80% (lines, functions, statements), 60% (branches)
- Coverage: исключены components, hooks, middleware, i18n

### Исправлено

- auth.test.ts: timeout 10s для bcrypt.compare (неправильный пароль)
- llm.actions: apiKey/notes formData.get() → ?? undefined (Zod optional не принимает null)

---

## [0.2.0] — 2026-02-24

### Добавлено

- E2E-тесты: relative-flow.spec.ts (родственник: лента → connect → профиль пациента), journal-flow.spec.ts (пациент: дневник → форма записи)
- Unit-тесты: token-budget (checkTokenBudget, getUsedTokens, consumeTokens), sync.service (syncPendingLogs успех, ошибка 500)
- Компонент Logo (MemoMedAI) с градиентным выделением AI в стиле MedTech (teal→cyan)
- Integration-тесты API: /api/health, /api/medications, /api/logs, /api/logs/sync, /api/feed/events (с моками auth, prisma, redis)
- Документация REST API: docs/api.md (эндпоинты, роли, примеры запросов/ответов)
- Unit-тесты: utils, rate-limit
- PDF-отчёты для админа: блок на /admin/reports, колонка PDF в /admin/users
- Пагинация «Показать ещё» в ленте событий (/feed)
- Вариант `compact` для кнопки DownloadReportButton

### Изменено

- Логотип MemoMedAI: единый компонент Logo на всех страницах, AI выделен градиентом
- Унификация цветов: gray → slate
- PDF-отчёты: цветовая схема slate
- Admin: API /api/reports/:patientId разрешает доступ для роли admin

### Исправлено

- push.service.test.ts, schedule-utils, api-health.test.ts, api-logs (UUID v4), vitest thresholds

---

## [0.1.0] — 2026-02-22

### Добавлено

- Полный MVP: аутентификация, CRUD лекарств, главный экран пациента, offline-first (PWA), синхронизация логов
- Связь пациент–родственник (инвайт-код), живая лента (SSE)
- AI-чат (DeepSeek), Web Push напоминания (эскалация T+0…T+30)
- Дневник самочувствия, AI-анализ корреляций, экспорт PDF для врача
- Роли: пациент, родственник, врач, администратор
- Capacitor для Android, локализация (ru/en), админ-панель
- Единый скрипт запуска для тестирования: `npm run run:dev`
- Аудит кода и дизайна (docs/audit-2026-02-22.md), доработки доступности (text-sm, min-h 48px, логи в catch)

### Изменено

- Редизайн ключевых страниц (MedTech-стиль), UX-доработки (пагинация, навигация)
- Цвета ползунков в дневнике переведены на CSS-переменные (design system)

---

[Unreleased]: https://github.com/denisok-ai/MemoMed-AI/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/denisok-ai/MemoMed-AI/releases/tag/v0.3.0
[0.2.0]: https://github.com/denisok-ai/MemoMed-AI/releases/tag/v0.2.0
[0.1.0]: https://github.com/denisok-ai/MemoMed-AI/releases/tag/v0.1.0
