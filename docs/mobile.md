<!--
  @file: mobile.md
  @description: Инструкция по сборке Android приложения через Capacitor
  @created: 2026-02-22
-->

# MemoMed AI — Мобильные приложения (Capacitor)

## Обзор

MemoMed AI упаковывается в нативное Android приложение через **Capacitor**. Это позволяет:

- Использовать **нативные push-уведомления** (Firebase Cloud Messaging)
- Открывать **нативную камеру** для фото лекарств
- Работать **без браузера** (fullscreen PWA-like experience)
- Публиковать в **Google Play**

---

## Требования для сборки Android

| Компонент      | Версия                     |
| -------------- | -------------------------- |
| Node.js        | 20+                        |
| JDK            | 17+                        |
| Android Studio | Hedgehog+                  |
| Android SDK    | API 24+ (compileSdk 35)    |
| Gradle         | 8.0+                       |
| `ANDROID_HOME` | `/home/<user>/Android/Sdk` |

---

## Установка Android Studio (Ubuntu/WSL)

```bash
# Установите Android Studio вручную:
# https://developer.android.com/studio

# После установки добавьте в ~/.bashrc или ~/.zshrc:
export ANDROID_HOME="$HOME/Android/Sdk"
export PATH="$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools"
```

---

## Первоначальная настройка Capacitor

```bash
# 1. Инициализируем Capacitor (уже выполнено)
npx cap init "MemoMed AI" ai.memomed.app

# 2. Создаём Android проект
npx cap add android

# 3. Синхронизируем после первой сборки
BUILD_TARGET=capacitor npx next build
npx cap sync android
```

---

## Ежедневная сборка (debug APK)

```bash
# Автоматически через скрипт:
./scripts/build-android.sh

# Или вручную:
BUILD_TARGET=capacitor npx next build
npx cap sync android
cd android && ./gradlew assembleDebug

# APK будет: android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Release сборка (для Google Play)

```bash
# 1. Создайте keystore (один раз):
keytool -genkey -v -keystore memomed-release.jks \
  -alias memomed -keyalg RSA -keysize 2048 -validity 10000

# 2. Добавьте в android/app/build.gradle:
android {
  signingConfigs {
    release {
      storeFile file("path/to/memomed-release.jks")
      storePassword "YOUR_STORE_PASSWORD"
      keyAlias "memomed"
      keyPassword "YOUR_KEY_PASSWORD"
    }
  }
}

# 3. Соберите AAB:
./scripts/build-android.sh --release

# AAB: android/app/build/outputs/bundle/release/app-release.aab
```

---

## Публикация в Google Play

> **Требования**: Google Play Developer Account ($25 единоразово), физическое устройство для тестирования.

### Предварительные шаги

| Шаг | Описание                                                                    |
| --- | --------------------------------------------------------------------------- |
| 1   | Зарегистрируйтесь в [Google Play Console](https://play.google.com/console/) |
| 2   | Оплатите регистрационный взнос $25                                          |
| 3   | Создайте приложение (название: MemoMed AI, package: ai.memomed.app)         |
| 4   | Соберите release AAB (см. раздел Release сборка выше)                       |

### Чеклист Store Listing

**Основная информация:**

- [ ] Краткое описание (до 80 символов): «Напоминания о лекарствах и контроль приёма для пожилых»
- [ ] Полное описание (до 4000 символов): функции, целевая аудитория, преимущества
- [ ] Иконка приложения: 512×512 px PNG (без прозрачности)
- [ ] Feature graphic: 1024×500 px (баннер для страницы в сторе)
- [ ] Скриншоты: минимум 2, рекомендуется 4–8 (телефон 16:9 или 9:16, планшет опционально)

**Контент и соответствие:**

- [ ] Политика конфиденциальности — URL публичной страницы (обязательно для приложений с персональными данными)
- [ ] Анкета по контенту приложения (возрастной рейтинг)
- [ ] Форма Data safety: указать сбор данных (email, лекарства, логи приёмов), цели использования, шифрование

**Технические:**

- [ ] Загрузить AAB в раздел Production / Internal testing
- [ ] Указать минимальную версию Android (API 24+)
- [ ] Включить подпись Google Play App Signing (рекомендуется)

### Рекомендуемые скриншоты

Сделайте скриншоты на реальном устройстве или эмуляторе:

1. Главный экран (часы + кнопка приёма)
2. Список лекарств
3. Живая лента (для родственника)
4. AI-чат
5. Статистика / календарь дисциплины

### Политика конфиденциальности

Google Play требует публичную политику конфиденциальности. В приложении есть страница `/privacy` с базовым текстом. Для публикации укажите полный URL, например: `https://ваш-домен.com/privacy`.

Страница содержит описание:

- Какие данные собираются (email, лекарства, логи приёмов, дневник самочувствия)
- Цели обработки
- Хранение и шифрование
- Права пользователя (доступ, удаление, экспорт)
- Контакты для вопросов

---

## Настройка Firebase (push-уведомления)

1. Создайте проект в [Firebase Console](https://console.firebase.google.com/)
2. Добавьте Android приложение с package name `ai.memomed.app`
3. Скачайте `google-services.json` → поместите в `android/app/`
4. В `.env` добавьте:
   ```
   FIREBASE_SERVER_KEY=your_server_key
   ```

---

## Отладка на устройстве

```bash
# Откройте Android Studio с проектом:
npx cap open android

# Или используйте live reload:
# 1. Узнайте IP вашей машины: ip addr
# 2. Раскомментируйте в capacitor.config.ts:
#    server: { url: 'http://192.168.1.100:3000', cleartext: true }
# 3. Запустите dev-сервер: npm run dev
# 4. В Android Studio: Run → Run 'app'
```

---

## iOS (требует macOS + Xcode)

```bash
# Добавление iOS платформы (только на macOS):
npx cap add ios
BUILD_TARGET=capacitor npx next build
npx cap sync ios
npx cap open ios  # открывает Xcode
```

---

## Нативные возможности в коде

```typescript
import { useCapacitorEnv, capturePhotoNative, registerNativePush } from '@/hooks/use-capacitor';

function MyComponent() {
  const { isNative, isAndroid } = useCapacitorEnv();

  // Нативная камера (Capacitor) или input[type=file] (браузер)
  const photo = await capturePhotoNative();

  // Firebase push-токен
  const fcmToken = await registerNativePush();
}
```
