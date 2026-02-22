#!/usr/bin/env bash
# ================================================================
# MemoMed AI — Остановка автономного запуска
# ================================================================
# Останавливает контейнеры, запущенные через run-standalone.sh
# ================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR"

COMPOSE_FILE="docker-compose.standalone.yml"

if command -v podman-compose >/dev/null 2>&1; then
  COMPOSE="podman-compose"
elif command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  COMPOSE="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE="docker-compose"
else
  echo "Docker Compose не найден."
  exit 1
fi

$COMPOSE -f "$COMPOSE_FILE" down
echo "Сервисы остановлены."
