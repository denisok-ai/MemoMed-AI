#!/bin/sh
# При старте контейнера применяем миграции БД, затем запускаем приложение.
# DATABASE_URL передаётся из docker-compose; в контейнере нет TS, используем только env.
set -e
cd /app
if command -v npx >/dev/null 2>&1 && [ -d prisma/migrations ]; then
  npx prisma migrate deploy 2>/dev/null || true
fi
exec node server.js
