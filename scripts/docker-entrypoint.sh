#!/bin/sh
# При старте контейнера применяем миграции БД, затем запускаем приложение.
# DATABASE_URL передаётся из docker-compose; в контейнере нет TS, используем только env.
set -e
cd /app
if command -v npx >/dev/null 2>&1 && [ -d prisma/migrations ]; then
  echo "[entrypoint] Applying database migrations..."
  npx prisma migrate deploy --config prisma.config.cjs || { echo "[entrypoint] Migration failed"; exit 1; }
  echo "[entrypoint] Migrations applied"
fi
exec node server.js
