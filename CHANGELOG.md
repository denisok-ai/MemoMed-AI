# Changelog

Все значимые изменения проекта MemoMed AI фиксируются в этом файле.

Формат: [Keep a Changelog](https://keepachangelog.com/ru/1.0.0/).  
Версионирование: [Semantic Versioning](https://semver.org/lang/ru/) (MAJOR.MINOR.PATCH).

---

## [Unreleased]

### Добавлено

- PDF-отчёты для админа: блок на /admin/reports, колонка PDF в /admin/users для пациентов
- Кнопка «Скачать PDF-отчёт» в шапке страницы /stats (пациент)
- Блок PDF-отчётов во вкладке «Обзор» карточки пациента у врача (/doctor/patients/[id])
- Пагинация «Показать ещё» в ленте событий (/feed) — курсорная загрузка старых событий
- Вариант `compact` для кнопки DownloadReportButton

### Изменено

- Унификация цветов: gray → slate (slate-500, slate-400, #64748b) во всех компонентах
- PDF-отчёты: цветовая схема приведена к slate (#0D1B2A, #475569, #94a3b8)
- Admin: API /api/reports/:patientId разрешает доступ для роли admin

### Исправлено

- JSX: обёртка в div для пагинации на странице /medications (исправление ошибки парсинга)

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

[Unreleased]: https://github.com/denisok-ai/MemoMed-AI/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/denisok-ai/MemoMed-AI/releases/tag/v0.1.0
