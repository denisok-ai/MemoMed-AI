# MemoMed AI

AI-ассистент для контроля приёма лекарств. Помогает пожилым пациентам не пропускать приём и позволяет родственникам следить за дисциплиной в реальном времени.

## Возможности

- **Напоминания** — система эскалации (T+0, T+10, T+20, T+30) через Web Push
- **Живая лента** — родственники видят приёмы в реальном времени (SSE)
- **AI-помощник** — DeepSeek отвечает на вопросы о лекарствах
- **Offline-first** — PWA с IndexedDB, работает без интернета
- **Роли** — пациент, родственник, врач, администратор

## Требования

- Node.js 20+ (см. `.nvmrc` — `nvm use` или `fnm use`)
- Docker / Podman (PostgreSQL, Redis)
- DEEPSEEK_API_KEY (опционально для AI-чата)

## Быстрый старт

### Один раз: настройка и запуск

```bash
cd memomed-ai
chmod +x scripts/*.sh
npm run run:dev
```

Скрипт сам при первом запуске создаст `.env`, установит зависимости, поднимет PostgreSQL и Redis (Docker/Podman), применит миграции. Затем запустится dev-сервер на [http://localhost:3000](http://localhost:3000).

### Если уже настраивали проект

```bash
npm run run:dev
# или
./scripts/start.sh
```

### Полное тестирование (включая напоминания)

В **первом терминале** — приложение:

```bash
npm run run:dev
```

Во **втором терминале** — воркер напоминаний и фоновые задачи:

```bash
npm run worker:dev
```

### Тестовые данные (опционально)

После первого запуска можно заполнить БД тестовыми пользователями и лекарствами:

```bash
npm run db:seed
```

Логин/пароль см. в таблице ниже. Быстрый вход без пароля: [/dev-login](http://localhost:3000/dev-login) (только в development).

### Автономный запуск (без SSH)

Запуск в Docker в фоне: после старта можно отключиться от SSH — приложение продолжит работать.

```bash
chmod +x scripts/*.sh
npm run run:standalone
```

Приложение будет доступно на **http://localhost:3000** (или http://&lt;IP-сервера&gt;:3000). Остановка: `npm run stop:standalone` или `./scripts/stop-standalone.sh`.

Требуется только Docker (или Podman) и файл `.env` (при первом запуске создаётся из `.env.example` через `./scripts/setup.sh`).

**Установка на чистый сервер (Ubuntu/Debian)** — один скрипт ставит Docker, клонирует репозиторий и запускает приложение: [docs/server-setup.md](docs/server-setup.md).  
**Перенос сборки с локального компьютера на внешний сервер:** [docs/deploy-to-server.md](docs/deploy-to-server.md).

## Команды

| Команда                     | Описание                                              |
| --------------------------- | ----------------------------------------------------- |
| `npm run run:standalone`    | Автономный запуск в Docker (работает без SSH)         |
| `npm run stop:standalone`   | Остановить автономные контейнеры                      |
| `npm run run:dev`           | Всё в одном: проверка .env → поднятие БД → dev-сервер |
| `npm run dev`               | Только dev-сервер (БД должна быть уже запущена)       |
| `npm run worker:dev`        | Воркер напоминаний (запускать во 2-м терминале)       |
| `npm run build`             | Production-сборка                                     |
| `npm run test`              | Unit-тесты (Vitest)                                   |
| `npm run test:e2e`          | E2E-тесты (Playwright)                                |
| `npm run db:migrate`        | Миграции Prisma                                       |
| `npm run db:seed`           | Тестовые данные (пациенты, врачи, лекарства)          |
| `npm run db:studio`         | Prisma Studio (просмотр БД)                           |
| `./scripts/start.sh --stop` | Остановить контейнеры PostgreSQL и Redis (dev)        |
| `npm run build:android`     | Сборка Android (Capacitor)                            |

## Тестовые аккаунты (после seed)

| Роль        | Email                 | Пароль    |
| ----------- | --------------------- | --------- |
| Пациент     | patient1@memomed.dev  | Test1234! |
| Родственник | relative1@memomed.dev | Test1234! |
| Врач        | doctor1@memomed.dev   | Test1234! |
| Админ       | admin@memomed.dev     | Test1234! |

## Версия

Версия приложения задаётся в `package.json` (`version`) и в [CHANGELOG.md](CHANGELOG.md). Правила версионирования: [docs/versioning.md](docs/versioning.md).

## Документация

- [Журнал изменений (CHANGELOG)](CHANGELOG.md)
- [Версионирование](docs/versioning.md)
- [Руководство по участию](CONTRIBUTING.md)
- [Описание проекта](docs/project.md)
- [Трекер задач](docs/tasktracker.md)
- [Установка на чистый сервер](docs/server-setup.md)
- [Перенос сборки на внешний сервер](docs/deploy-to-server.md)
- [Деплой](docs/deployment.md)
- [Мобильные приложения](docs/mobile.md)
- [E2E тесты](docs/e2e.md)

## Лицензия

Private
