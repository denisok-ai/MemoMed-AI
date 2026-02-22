#!/usr/bin/env bash
# ================================================================
# MemoMed AI — Скрипт первоначальной настройки (First-time Setup)
# ================================================================
# Использование:
#   chmod +x scripts/setup.sh
#   ./scripts/setup.sh              # Настройка для разработки (рекомендуется)
#   ./scripts/setup.sh --docker     # Настройка для Docker-продакшн (все сервисы в контейнерах)
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

echo ""
echo -e "${BLUE}╔══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   MemoMed AI — Первоначальная        ║${NC}"
echo -e "${BLUE}║       настройка проекта               ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════╝${NC}"
echo ""

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

# ─── Шаг 1: Проверка зависимостей ───
info "Проверяю системные зависимости..."

command -v node >/dev/null 2>&1 || err "Node.js не установлен. Установите: https://nodejs.org (v20+)"
command -v npm  >/dev/null 2>&1 || err "npm не найден"

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  err "Требуется Node.js >= 20. Текущая: $(node -v)"
fi
log "Node.js $(node -v), npm $(npm -v)"

if ! detect_compose; then
  err "Не найден podman-compose / docker compose. Установите один из них."
fi
log "Compose: $COMPOSE"

# ─── Шаг 2: Файл .env ───
info "Настраиваю переменные окружения..."

if [ ! -f .env ]; then
  cp .env.example .env
  log "Создан .env из .env.example"

  # Генерируем NEXTAUTH_SECRET
  SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)
  sed -i "s|your_nextauth_secret_min_32_chars|${SECRET}|" .env
  log "NEXTAUTH_SECRET сгенерирован"

  # Генерируем безопасный пароль PostgreSQL
  PG_PASS=$(openssl rand -base64 16 2>/dev/null | tr -d '+/=' | head -c 20)
  sed -i "s|memomed_dev|${PG_PASS}|g" .env
  log "Пароль PostgreSQL сгенерирован"

  warn "Откройте .env и заполните:"
  warn "  - DEEPSEEK_API_KEY (получить на https://platform.deepseek.com)"
  echo ""
else
  log ".env уже существует"
fi

# ─── Шаг 3: Установка зависимостей ───
info "Устанавливаю npm-зависимости..."
npm install
log "Зависимости установлены"

# ─── Шаг 4: Prisma Client ───
info "Генерирую Prisma Client..."
npx prisma generate --config prisma.config.ts
log "Prisma Client сгенерирован"

# ─── Шаг 5: Запуск контейнеров БД ───
if [ "$MODE" = "--docker" ]; then
  # Продакшн: запуск всех сервисов
  info "Запускаю все сервисы через Docker Compose..."
  $COMPOSE -f docker-compose.yml up -d
  log "Все сервисы запущены"

  info "Жду готовности PostgreSQL (до 30 секунд)..."
  for i in $(seq 1 30); do
    if $COMPOSE -f docker-compose.yml exec -T postgres pg_isready -U memomed -d memomed_db >/dev/null 2>&1; then
      log "PostgreSQL готов"
      break
    fi
    [ "$i" -eq 30 ] && err "PostgreSQL не запустился за 30 секунд"
    sleep 1
  done

  info "Применяю миграции..."
  npx prisma migrate deploy --config prisma.config.ts
  log "Миграции применены"
else
  # Разработка: запускаем только PostgreSQL + Redis из docker-compose.dev.yml
  info "Запускаю PostgreSQL и Redis для разработки..."
  $COMPOSE -f docker-compose.dev.yml up -d
  log "Контейнеры memomed_postgres и memomed_redis запущены"

  info "Жду готовности PostgreSQL (до 30 секунд)..."
  for i in $(seq 1 30); do
    if $COMPOSE -f docker-compose.dev.yml exec -T postgres pg_isready -U memomed -d memomed_db >/dev/null 2>&1; then
      log "PostgreSQL готов"
      break
    fi
    [ "$i" -eq 30 ] && err "PostgreSQL не запустился за 30 секунд"
    sleep 1
  done

  info "Применяю миграции..."
  npx prisma migrate dev --config prisma.config.ts --name init 2>/dev/null || \
    npx prisma migrate deploy --config prisma.config.ts
  log "Миграции применены"
fi

# ─── Шаг 6: VAPID-ключи (если не заданы) ───
VAPID_KEY=$(grep '^VAPID_PUBLIC_KEY=' .env | cut -d= -f2-)
if [ -z "$VAPID_KEY" ] || [ "$VAPID_KEY" = "your_vapid_public_key" ]; then
  if command -v npx >/dev/null 2>&1; then
    info "Генерирую VAPID-ключи для Web Push..."
    VAPID_OUTPUT=$(npx web-push generate-vapid-keys 2>/dev/null || echo "")
    if [ -n "$VAPID_OUTPUT" ]; then
      VPUB=$(echo "$VAPID_OUTPUT" | grep 'Public Key' | awk '{print $NF}')
      VPRIV=$(echo "$VAPID_OUTPUT" | grep 'Private Key' | awk '{print $NF}')
      if [ -n "$VPUB" ] && [ -n "$VPRIV" ]; then
        sed -i "s|^VAPID_PUBLIC_KEY=.*|VAPID_PUBLIC_KEY=${VPUB}|" .env
        sed -i "s|^VAPID_PRIVATE_KEY=.*|VAPID_PRIVATE_KEY=${VPRIV}|" .env
        sed -i "s|^NEXT_PUBLIC_VAPID_PUBLIC_KEY=.*|NEXT_PUBLIC_VAPID_PUBLIC_KEY=${VPUB}|" .env
        log "VAPID-ключи сгенерированы"
      fi
    else
      warn "Не удалось сгенерировать VAPID-ключи"
    fi
  fi
fi

# ─── Шаг 7: Git hooks ───
if [ -d .git ]; then
  info "Настраиваю Git hooks (Husky)..."
  npx husky 2>/dev/null || true
  log "Husky настроен"
else
  info "Инициализирую Git-репозиторий..."
  git init -b main
  git add -A
  npx husky 2>/dev/null || true
  log "Git инициализирован"
fi

# ─── Шаг 8: Создание папки uploads ───
mkdir -p public/uploads
log "Папка public/uploads создана"

# ─── Готово ───
echo ""
echo -e "${GREEN}╔══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║    Настройка завершена!               ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
echo ""

if [ "$MODE" = "--docker" ]; then
  echo "Следующие шаги:"
  echo "  1. Проверьте .env (особенно DEEPSEEK_API_KEY)"
  echo "  2. Запустите: ./scripts/start.sh --docker"
else
  echo "Что сделано:"
  echo "  ✓ Контейнеры memomed_postgres (порт ${MEMOMED_PG_PORT:-5433}) и memomed_redis (порт ${MEMOMED_REDIS_PORT:-6380}) запущены"
  echo "  ✓ Миграции БД применены"
  echo "  ✓ Prisma Client сгенерирован"
  echo ""
  echo "Следующие шаги:"
  echo "  1. Проверьте .env (особенно DEEPSEEK_API_KEY)"
  echo "  2. Запустите: ./scripts/start.sh"
  echo ""
  echo "Управление контейнерами:"
  echo "  $COMPOSE -f docker-compose.dev.yml ps      — статус"
  echo "  $COMPOSE -f docker-compose.dev.yml down     — остановить"
  echo "  $COMPOSE -f docker-compose.dev.yml logs -f  — логи"
fi
echo ""
