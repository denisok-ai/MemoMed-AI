#!/bin/bash
# deploy.sh — скрипт автоматического деплоя MemoMed AI на VPS
# Использование: bash scripts/deploy.sh [--skip-backup]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
SKIP_BACKUP="${1:-}"
BACKUP_DIR="/var/backups/memomed"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "========================================"
echo "  MemoMed AI — Деплой $TIMESTAMP"
echo "========================================"

# Проверяем наличие .env файла
if [ ! -f "$PROJECT_DIR/.env" ]; then
  echo "ОШИБКА: Файл .env не найден. Скопируйте .env.example и заполните переменные."
  exit 1
fi

# Проверяем обязательные переменные окружения
source "$PROJECT_DIR/.env"
REQUIRED_VARS=("NEXTAUTH_SECRET" "MEMOMED_PG_PASSWORD" "NEXTAUTH_URL")
for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var:-}" ]; then
    echo "ОШИБКА: Переменная $var не задана в .env"
    exit 1
  fi
done

cd "$PROJECT_DIR"

echo ""
echo "1. Обновляем код из репозитория..."
git pull origin main

echo ""
echo "2. Создаём резервную копию БД..."
if [ "$SKIP_BACKUP" != "--skip-backup" ]; then
  mkdir -p "$BACKUP_DIR"
  docker compose exec -T postgres pg_dump \
    -U memomed memomed_db | gzip > "$BACKUP_DIR/backup_$TIMESTAMP.sql.gz" 2>/dev/null || \
    echo "  ПРЕДУПРЕЖДЕНИЕ: Не удалось создать бэкап (БД возможно не запущена)"
  # Удаляем бэкапы старше 7 дней
  find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +7 -delete 2>/dev/null || true
  echo "  Бэкап: $BACKUP_DIR/backup_$TIMESTAMP.sql.gz"
else
  echo "  Пропускаем бэкап (--skip-backup)"
fi

echo ""
echo "3. Собираем Docker-образы..."
docker compose build --no-cache

echo ""
echo "4. Применяем миграции БД..."
docker compose run --rm app sh -c "npx prisma migrate deploy" || \
  echo "  ПРЕДУПРЕЖДЕНИЕ: Миграция не выполнена (проверьте вручную)"

echo ""
echo "5. Перезапускаем сервисы..."
docker compose up -d --remove-orphans

echo ""
echo "6. Ожидаем готовности приложения..."
MAX_WAIT=60
WAITED=0
until docker compose exec app wget -qO- http://localhost:3000/api/health >/dev/null 2>&1; do
  if [ $WAITED -ge $MAX_WAIT ]; then
    echo "  ОШИБКА: Приложение не запустилось за ${MAX_WAIT}с"
    docker compose logs app --tail=50
    exit 1
  fi
  echo "  Ожидание... (${WAITED}s)"
  sleep 5
  WAITED=$((WAITED + 5))
done

echo ""
echo "7. Удаляем старые Docker-образы..."
docker image prune -f

echo ""
echo "========================================"
echo "  Деплой завершён успешно! ✅"
echo "  URL: ${NEXTAUTH_URL}"
echo "========================================"
