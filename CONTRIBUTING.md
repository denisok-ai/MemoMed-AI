# Руководство по участию в разработке MemoMed AI

## Перед началом

1. Прочитайте [docs/project.md](docs/project.md) — архитектура и стандарты
2. Проверьте [docs/tasktracker.md](docs/tasktracker.md) — актуальные задачи
3. Ознакомьтесь с [docs/diary.md](docs/diary.md) — контекст решений

## Настройка окружения

```bash
nvm use   # или fnm use — Node 20 из .nvmrc
./scripts/setup.sh
npm run dev
```

Подробнее: [README.md](README.md)

## Git-процесс

- **Ветки**: `main` (production) → `develop` (staging) → `feature/*`, `fix/*`
- **Коммиты**: [Conventional Commits](https://www.conventionalcommits.org/) — `feat:`, `fix:`, `refactor:`, `docs:`, `test:`
- **PR**: обязателен code review, все проверки CI должны пройти
- **Pre-commit**: Husky запускает lint, format, type-check

## Перед коммитом

```bash
npm run lint
npm run type-check
npm run test
```

## E2E-тесты (локально)

```bash
docker compose -f docker-compose.dev.yml up -d
npm run db:migrate && npm run db:seed
npm run test:e2e
```

## Стандарты кода

- TypeScript strict mode, без `any`
- Файлы: kebab-case, компоненты: PascalCase
- Валидация: Zod на входе API и форм
- Один компонент — один файл
- Заголовки файлов: `@file`, `@description`, `@created`

## После значимых изменений

Обновите документацию:

- [docs/diary.md](docs/diary.md) — опишите решение или проблему
- [docs/tasktracker.md](docs/tasktracker.md) — отметьте статус задачи
- [docs/project.md](docs/project.md) — при изменении архитектуры
