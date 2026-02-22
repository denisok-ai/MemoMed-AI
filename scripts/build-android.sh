#!/usr/bin/env bash
# @file build-android.sh
# @description Сборка Android APK/AAB для MemoMed AI через Capacitor.
# Требует: Node.js, JDK 17+, Android SDK (ANDROID_HOME), Capacitor CLI.
# Использование:
#   ./scripts/build-android.sh           — debug APK
#   ./scripts/build-android.sh --release — release AAB (нужен keystore)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_DIR"

# --- Проверка зависимостей ----
command -v node >/dev/null 2>&1  || { echo "❌ Node.js не найден"; exit 1; }
command -v npx  >/dev/null 2>&1  || { echo "❌ npx не найден"; exit 1; }
[ -n "${ANDROID_HOME:-}" ]       || { echo "❌ ANDROID_HOME не задан. Установите Android SDK."; exit 1; }
command -v java >/dev/null 2>&1  || { echo "❌ Java не найдена. Установите JDK 17+."; exit 1; }

RELEASE_MODE=false
if [[ "${1:-}" == "--release" ]]; then
  RELEASE_MODE=true
  echo "🚀 Сборка release AAB"
else
  echo "🔧 Сборка debug APK"
fi

# --- 1. Статический экспорт Next.js --
echo "📦 Сборка Next.js (static export для Capacitor)..."
BUILD_TARGET=capacitor npx next build

# --- 2. Синхронизация с Android-проектом ---
echo "🔄 Синхронизация с Android-проектом..."
npx cap sync android

# --- 3. Сборка APK/AAB ----
if [ "$RELEASE_MODE" = true ]; then
  echo "🏗️  Сборка release AAB..."
  cd android
  ./gradlew bundleRelease
  echo "✅ AAB: android/app/build/outputs/bundle/release/app-release.aab"
else
  echo "🏗️  Сборка debug APK..."
  cd android
  ./gradlew assembleDebug
  echo "✅ APK: android/app/build/outputs/apk/debug/app-debug.apk"
fi

echo ""
echo "🎉 Сборка завершена!"
