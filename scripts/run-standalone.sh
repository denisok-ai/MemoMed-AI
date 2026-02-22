#!/usr/bin/env bash
# ================================================================
# MemoMed AI — Автономный запуск без SSH
# ================================================================
# Поднимает приложение в Docker в фоне. После запуска можно отключиться
# от SSH — сервисы продолжают работать (restart: unless-stopped).
# Приложение: http://<хост>:3000
#
# Использование:
#   chmod +x scripts/run-standalone.sh
#   ./scripts/run-standalone.sh
# ================================================================

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
info() { echo -e "${BLUE}[i]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR"

COMPOSE_FILE="docker-compose.standalone.yml"

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

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   MemoMed AI — Автономный запуск (без SSH)      ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════╝${NC}"
echo ""

[ -f .env ] || {
  info "Файл .env не найден. Запускаю первоначальную настройку..."
  bash "$SCRIPT_DIR/setup.sh"
  echo ""
}

# Загружаем .env и экспортируем для docker-compose (подстановка ${VAR} в yml)
set -a
source .env 2>/dev/null || true
set +a

[ -n "${NEXTAUTH_SECRET:-}" ] || err "В .env задайте NEXTAUTH_SECRET (например: openssl rand -base64 32)"

detect_compose || err "Нужен Docker Compose или Podman Compose. Установите Docker."

# Для автономного режима NEXTAUTH_URL по умолчанию — localhost:3000
if [ -z "${NEXTAUTH_URL:-}" ] || [ "$NEXTAUTH_URL" = "http://localhost" ]; then
  export NEXTAUTH_URL="http://localhost:3000"
  warn "NEXTAUTH_URL установлен в http://localhost:3000 (для доступа с этого сервера)"
fi

info "Собираю образы..."
COMMIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
$COMPOSE -f "$COMPOSE_FILE" build --build-arg COMMIT_SHA="$COMMIT_SHA"
log "Образы собраны"

info "Запускаю сервисы в фоне..."
$COMPOSE -f "$COMPOSE_FILE" up -d
log "Сервисы запущены (миграции применяются при старте app)"

info "Жду готовности приложения (до 90 секунд)..."
for i in $(seq 1 90); do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health 2>/dev/null || echo "000")
  if [ "$HTTP_CODE" = "200" ]; then
    log "Приложение готово."
    echo ""
    echo -e "  ${GREEN}Приложение:${NC}  http://localhost:3000"
    echo -e "  ${GREEN}Health:${NC}       http://localhost:3000/api/health"
    echo ""
    echo -e "  ${GREEN}Работает автономно. Можно отключиться от SSH — сервисы продолжат работу.${NC}"
    echo ""
    echo -e "  Управление:"
    echo -e "    Логи:    $COMPOSE -f $COMPOSE_FILE logs -f"
    echo -e "    Статус:  $COMPOSE -f $COMPOSE_FILE ps"
    echo -e "    Остановка: ./scripts/stop-standalone.sh"
    echo ""
    exit 0
  fi
  [ "$i" -eq 90 ] && {
    warn "Приложение не ответило за 90 секунд. Проверьте логи: $COMPOSE -f $COMPOSE_FILE logs -f app"
    $COMPOSE -f "$COMPOSE_FILE" ps
    exit 1
  }
  sleep 1
done
