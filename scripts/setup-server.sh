#!/usr/bin/env bash
# ================================================================
# MemoMed AI — Установка на чистый сервер (Ubuntu/Debian)
# ================================================================
# Устанавливает Docker (если нет), клонирует репозиторий, создаёт .env,
# запускает приложение в автономном режиме. После выполнения можно
# отключиться от SSH — сервис продолжит работать.
#
# Запуск (от root или через sudo):
#   curl -sSL https://raw.githubusercontent.com/denisok-ai/MemoMed-AI/main/scripts/setup-server.sh | sudo bash
# или:
#   sudo bash scripts/setup-server.sh
#
# Переменные (опционально):
#   INSTALL_DIR=/opt/memomed   — куда клонировать (по умолчанию /opt/memomed)
#   REPO_URL=...               — URL репозитория (по умолчанию denisok-ai/MemoMed-AI)
#   BRANCH=main                — ветка
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

# Проверка root/sudo
if [ "$(id -u)" -ne 0 ]; then
  err "Запустите скрипт от root или через sudo: sudo bash $0"
fi

INSTALL_DIR="${INSTALL_DIR:-/opt/memomed}"
REPO_URL="${REPO_URL:-https://github.com/denisok-ai/MemoMed-AI.git}"
BRANCH="${BRANCH:-main}"

# Если скрипт запущен из каталога репозитория — работаем в нём
if [ -f "$(dirname "$0")/run-standalone.sh" ] && [ -f "$(dirname "$0")/../package.json" ]; then
  APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
else
  APP_DIR="$INSTALL_DIR"
fi

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   MemoMed AI — Установка на чистый сервер                ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# ─── 1. Определяем ОС ───
if [ -f /etc/os-release ]; then
  . /etc/os-release
  OS_ID="${ID:-unknown}"
  OS_VERSION_ID="${VERSION_ID:-}"
else
  OS_ID="unknown"
fi

info "ОС: $OS_ID $OS_VERSION_ID"

# ─── 2. Установка Docker (если нет) ───
install_docker() {
  if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    log "Docker и Docker Compose уже установлены"
    return 0
  fi

  info "Устанавливаю Docker..."
  if [ "$OS_ID" = "ubuntu" ] || [ "$OS_ID" = "debian" ]; then
    apt-get update -qq
    apt-get install -y -qq ca-certificates curl
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/${OS_ID}/gpg -o /etc/apt/keyrings/docker.asc
    chmod a+r /etc/apt/keyrings/docker.asc
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/${OS_ID} $(. /etc/os-release && echo "${VERSION_CODENAME:-$VERSION_ID}") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update -qq
    apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    log "Docker установлен"
  else
    err "Поддерживаются только Ubuntu и Debian. Установите Docker вручную: https://docs.docker.com/engine/install/"
  fi
}

install_docker

# ─── 3. Запуск Docker при загрузке ───
if command -v systemctl >/dev/null 2>&1; then
  systemctl enable --now docker 2>/dev/null || true
fi

# ─── 4. Каталог приложения ───
mkdir -p "$APP_DIR"
cd "$APP_DIR"

# ─── 5. Клонирование или обновление репозитория ───
if [ -d .git ]; then
  info "Репозиторий уже есть в $APP_DIR, обновляю..."
  git fetch origin 2>/dev/null || true
  git checkout -q "$BRANCH" 2>/dev/null || true
  git pull -q origin "$BRANCH" 2>/dev/null || true
  log "Обновлено"
else
  info "Клонирую $REPO_URL в $APP_DIR..."
  if ! command -v git >/dev/null 2>&1; then
    apt-get update -qq && apt-get install -y -qq git
  fi
  git clone -q --depth 1 -b "$BRANCH" "$REPO_URL" .
  log "Репозиторий склонирован"
fi

# ─── 6. Файл .env ───
if [ ! -f .env ]; then
  info "Создаю .env из .env.example..."
  cp .env.example .env

  NEXTAUTH_SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)
  MEMOMED_PG_PASSWORD=$(openssl rand -base64 16 2>/dev/null | tr -d '+/=' | head -c 20)

  sed -i "s|your_nextauth_secret_min_32_chars|${NEXTAUTH_SECRET}|" .env
  sed -i "s|memomed_dev|${MEMOMED_PG_PASSWORD}|g" .env
  sed -i "s|changeme|${MEMOMED_PG_PASSWORD}|g" .env

  # Для доступа по IP сервера
  SERVER_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")
  if [ -n "$SERVER_IP" ] && [ "$SERVER_IP" != "localhost" ]; then
    sed -i "s|http://localhost:3000|http://${SERVER_IP}:3000|" .env
    warn "NEXTAUTH_URL установлен в http://${SERVER_IP}:3000 (замените на свой домен при необходимости)"
  fi

  log ".env создан (NEXTAUTH_SECRET и пароль БД сгенерированы)"
else
  log ".env уже существует"
fi

# ─── 7. Права на скрипты ───
chmod +x scripts/*.sh 2>/dev/null || true

# ─── 8. Запуск автономного режима ───
info "Запускаю приложение в автономном режиме..."
bash scripts/run-standalone.sh

echo ""
log "Установка завершена. Приложение доступно на http://$(hostname -I 2>/dev/null | awk '{print $1}' || echo localhost):3000"
echo ""
