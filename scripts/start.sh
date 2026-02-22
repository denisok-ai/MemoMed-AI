#!/usr/bin/env bash
# ================================================================
# MemoMed AI — Скрипт запуска приложения
# ================================================================
# Использование:
#   ./scripts/start.sh              # Режим разработки (dev)
#   ./scripts/start.sh --prod       # Production-сборка + запуск
#   ./scripts/start.sh --docker     # Полный запуск через Docker Compose (production)
#   ./scripts/start.sh --stop       # Остановить dev-контейнеры
# ================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }
info() { echo -e "${BLUE}[i]${NC} $1"; }

MODE="${1:-dev}"
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

[ -f .env ] || err ".env не найден. Сначала выполните: ./scripts/setup.sh"

# Загружаем переменные из .env (для портов и паролей)
set -a
source .env 2>/dev/null || true
set +a

# ─── Определяем compose-утилиту ───
detect_compose() {
  if command -v podman-compose >/dev/null 2>&1; then
    COMPOSE="podman-compose"
  elif command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    COMPOSE="docker compose"
  elif command -v docker-compose >/dev/null 2>&1; then
    COMPOSE="docker-compose"
  else
    return 1
  fi
  return 0
}

# ─── Запуск dev-контейнеров (PostgreSQL + Redis) ───
ensure_dev_services() {
  detect_compose || err "Не найден podman-compose / docker compose"

  local pg_port="${MEMOMED_PG_PORT:-5433}"
  local redis_port="${MEMOMED_REDIS_PORT:-6380}"

  # Проверяем, запущены ли контейнеры
  local pg_running=false
  local redis_running=false

  if $COMPOSE -f docker-compose.dev.yml ps --format '{{.Names}}' 2>/dev/null | grep -q 'memomed_postgres'; then
    pg_running=true
  elif $COMPOSE -f docker-compose.dev.yml ps 2>/dev/null | grep -q 'memomed_postgres.*Up'; then
    pg_running=true
  fi

  if $COMPOSE -f docker-compose.dev.yml ps --format '{{.Names}}' 2>/dev/null | grep -q 'memomed_redis'; then
    redis_running=true
  elif $COMPOSE -f docker-compose.dev.yml ps 2>/dev/null | grep -q 'memomed_redis.*Up'; then
    redis_running=true
  fi

  if [ "$pg_running" = false ] || [ "$redis_running" = false ]; then
    info "Запускаю контейнеры БД (PostgreSQL:${pg_port}, Redis:${redis_port})..."
    $COMPOSE -f docker-compose.dev.yml up -d
  fi

  # Ждём PostgreSQL
  info "Проверяю готовность PostgreSQL..."
  for i in $(seq 1 20); do
    if $COMPOSE -f docker-compose.dev.yml exec -T postgres pg_isready -U memomed -d memomed_db >/dev/null 2>&1; then
      log "PostgreSQL готов (порт ${pg_port})"
      break
    fi
    [ "$i" -eq 20 ] && err "PostgreSQL не запустился за 20 секунд"
    sleep 1
  done

  # Проверяем Redis
  if $COMPOSE -f docker-compose.dev.yml exec -T redis redis-cli ping >/dev/null 2>&1; then
    log "Redis готов (порт ${redis_port})"
  else
    warn "Redis не ответил — rate limiting не будет работать"
  fi
}

echo ""
echo -e "${BLUE}╔═══════════════════════════════════╗${NC}"
echo -e "${BLUE}║    MemoMed AI — Запуск [${MODE}]${NC}"
echo -e "${BLUE}╚═══════════════════════════════════╝${NC}"
echo ""

# ─── STOP ───
if [ "$MODE" = "--stop" ]; then
  detect_compose || err "Не найден podman-compose / docker compose"
  info "Останавливаю dev-контейнеры..."
  $COMPOSE -f docker-compose.dev.yml down
  log "Контейнеры остановлены"
  exit 0
fi

# ─── DOCKER (production) ───
if [ "$MODE" = "--docker" ]; then
  detect_compose || err "Не найден podman-compose / docker compose"

  [ -n "${NEXTAUTH_SECRET:-}" ] || err "NEXTAUTH_SECRET не задана в .env"

  info "Собираю Docker-образы..."
  COMMIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
  $COMPOSE -f docker-compose.yml build --build-arg COMMIT_SHA="$COMMIT_SHA"
  log "Образы собраны"

  info "Запускаю все сервисы..."
  $COMPOSE -f docker-compose.yml up -d
  log "Сервисы запущены"

  info "Жду готовности приложения (до 60 секунд)..."
  for i in $(seq 1 60); do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
      log "Приложение готово!"
      echo ""
      echo -e "  ${GREEN}Открывайте:${NC} http://localhost"
      echo -e "  ${GREEN}Health:${NC}     http://localhost/api/health"
      echo ""
      echo -e "  Управление: $COMPOSE -f docker-compose.yml logs -f     — логи"
      echo -e "              $COMPOSE -f docker-compose.yml ps           — статус"
      echo -e "              $COMPOSE -f docker-compose.yml down         — остановка"
      echo ""
      exit 0
    fi
    [ "$i" -eq 60 ] && { warn "Приложение не ответило за 60 секунд"; $COMPOSE -f docker-compose.yml logs --tail=20 app; exit 1; }
    sleep 1
  done
  exit 0
fi

# ─── PRODUCTION (без Docker для app) ───
if [ "$MODE" = "--prod" ]; then
  ensure_dev_services

  info "Проверяю зависимости..."
  [ -d node_modules ] || { info "Устанавливаю зависимости..."; npm ci --omit=dev; }

  info "Генерирую Prisma Client..."
  npx prisma generate --config prisma.config.ts

  info "Применяю миграции..."
  npx prisma migrate deploy --config prisma.config.ts
  log "Миграции применены"

  info "Собираю приложение..."
  COMMIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
  COMMIT_SHA=$COMMIT_SHA npm run build
  log "Сборка завершена"

  echo ""
  info "Запускаю в production-режиме..."
  echo -e "  ${GREEN}Порт:${NC} 3000"
  echo ""
  npm run start
  exit 0
fi

# ─── DEV ───
info "Проверяю зависимости..."
[ -d node_modules ] || { info "Устанавливаю зависимости..."; npm install; }

info "Генерирую Prisma Client..."
npx prisma generate --config prisma.config.ts 2>/dev/null || true

# Запускаем/проверяем контейнеры
ensure_dev_services

echo ""
echo -e "${GREEN}Запускаю dev-сервер...${NC}"
echo -e "  ${GREEN}Приложение:${NC}    http://localhost:3000"
echo -e "  ${GREEN}Prisma Studio:${NC} npm run db:studio (в отдельном терминале)"
echo -e "  ${GREEN}Worker:${NC}        npm run worker:dev (в отдельном терминале)"
echo -e "  ${GREEN}Остановка БД:${NC}  ./scripts/start.sh --stop"
echo ""

npm run dev
