<!--
  @file: e2e.md
  @description: Инструкция по запуску E2E тестов Playwright
  @created: 2026-02-22
-->

# E2E тесты (Playwright)

## Требования

- PostgreSQL и Redis (через `docker-compose.dev.yml` или локально)
- Выполнены миграции и seed: `npm run db:migrate` и `npm run db:seed`

## Запуск

```bash
# Запустить Postgres и Redis (если ещё не запущены)
docker compose -f docker-compose.dev.yml up -d

# Запустить E2E тесты (Playwright сам поднимет dev-сервер)
npm run test:e2e

# Интерактивный режим с UI
npm run test:e2e:ui
```

## Что тестируется

- **guest.spec.ts**: главная (/), /login, /register, /privacy
- **patient-flow.spec.ts**: dev-login → дашборд → лекарства → добавление лекарства → подтверждение приёма (требует NODE_ENV=development)

## CI

E2E запускаются в GitHub Actions при push/PR в main или develop. Job `e2e` поднимает postgres и redis, выполняет migrate и seed, затем запускает Playwright.
