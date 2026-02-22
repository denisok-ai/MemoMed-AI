# 📦 Полный комплект файлов проекта Smart Med Assistant

## 🎯 Что у тебя есть из чата

Из нашей переписки ты получил:

### 1. **SQL-схема базы данных** ✅
- Файл: `database/schema.sql`
- Находится в артефакте: "PostgreSQL Schema - Smart Med Assistant"
- Содержит: 10 таблиц (users, profiles, medications, logs, connections и др.)

### 2. **Backend API сервер** ✅
- Файл: `backend/server.js`
- Находится в артефакте: "server.js - Backend API"
- Содержит: Express сервер, JWT аутентификацию, endpoints для medications и logs

### 3. **Flutter зависимости** ✅
- Файл: `frontend/pubspec.yaml`
- Находится в артефакте: "pubspec.yaml - Flutter Dependencies"
- Содержит: все необходимые пакеты (provider, sqflite, http и др.)

### 4. **Структура проекта** ✅
- Файл: документация
- Находится в артефакте: "Структура проекта Flutter"
- Содержит: полное дерево папок и файлов

### 5. **Deployment скрипты** ✅
- Файл: `install.sh` и `setup_db.sh`
- Находятся в артефактах выше
- Содержат: автоматическую установку на Linux сервер

---

## 📋 ПОШАГОВАЯ ИНСТРУКЦИЯ ДЛЯ CURSOR

### ШАГ 1: Подготовка проекта (5 мин)

#### 1.1 Создай папку проекта
```bash
mkdir smart-med-assistant
cd smart-med-assistant
```

#### 1.2 Открой в Cursor
1. Запусти Cursor
2. File → Open Folder
3. Выбери `smart-med-assistant`

#### 1.3 Создай базовую структуру

**Промпт для Cursor AI (Cmd+L / Ctrl+L):**
```
Создай следующую структуру папок:

smart-med-assistant/
├── backend/
├── frontend/
├── database/
└── docs/

В каждой папке создай .gitkeep файл.
```

---

### ШАГ 2: Настройка Backend (10 мин)

#### 2.1 Скопируй файлы из чата

**В Cursor создай файлы:**

1. **backend/package.json**
```json
{
  "name": "smart-med-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1",
    "node-cron": "^3.0.3"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

2. **backend/.env**
```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smart_med_assistant
DB_USER=med_admin
DB_PASSWORD=your_password_here
JWT_SECRET=your_jwt_secret_here_minimum_32_chars
JWT_EXPIRES_IN=7d
ALLOWED_ORIGINS=http://localhost:3000
```

3. **backend/server.js**
- СКОПИРУЙ из артефакта "server.js - Backend API" (выше в чате)

#### 2.2 Установи зависимости
```bash
cd backend
npm install
```

---

### ШАГ 3: Настройка базы данных (15 мин)

#### 3.1 Создай schema.sql

**database/schema.sql** - СКОПИРУЙ из артефакта "PostgreSQL Schema - Smart Med Assistant"

#### 3.2 Настрой PostgreSQL

**Для Windows (PowerShell):**
```powershell
# Установи PostgreSQL если еще нет
winget install PostgreSQL.PostgreSQL

# Запусти службу
net start postgresql-x64-14

# Создай БД
psql -U postgres -c "CREATE DATABASE smart_med_assistant;"
psql -U postgres -c "CREATE USER med_admin WITH PASSWORD 'твой_пароль';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE smart_med_assistant TO med_admin;"

# Импорт схемы
cd database
psql -U med_admin -d smart_med_assistant -f schema.sql
```

**Для Mac:**
```bash
# Установи через Homebrew
brew install postgresql@14
brew services start postgresql@14

# Создай БД
psql postgres -c "CREATE DATABASE smart_med_assistant;"
psql postgres -c "CREATE USER med_admin WITH PASSWORD 'твой_пароль';"
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE smart_med_assistant TO med_admin;"

# Импорт схемы
psql -U med_admin -d smart_med_assistant -f database/schema.sql
```

**Для Linux:**
```bash
sudo apt install postgresql-14 -y
sudo systemctl start postgresql

sudo -u postgres psql << EOF
CREATE DATABASE smart_med_assistant;
CREATE USER med_admin WITH PASSWORD 'твой_пароль';
GRANT ALL PRIVILEGES ON DATABASE smart_med_assistant TO med_admin;
\q
EOF

psql -U med_admin -d smart_med_assistant -f database/schema.sql
```

---

### ШАГ 4: Проверка Backend (5 мин)

#### 4.1 Запусти сервер
```bash
cd backend
npm start
```

#### 4.2 Проверь в браузере
Открой: http://localhost:3000/health

Должен увидеть JSON:
```json
{
  "status": "OK",
  "timestamp": "2026-...",
  "users": 0,
  "server": "localhost",
  "database": "connected"
}
```

---

### ШАГ 5: Настройка Flutter Frontend (20 мин)

#### 5.1 Установи Flutter SDK

**Промпт для Cursor AI:**
```
Напиши команды для установки Flutter SDK на моей ОС [Windows/Mac/Linux].
Включи настройку PATH и проверку через flutter doctor.
```

Или вручную:
- Windows: https://docs.flutter.dev/get-started/install/windows
- Mac: https://docs.flutter.dev/get-started/install/macos
- Linux: https://docs.flutter.dev/get-started/install/linux

#### 5.2 Создай Flutter проект

```bash
cd ..
flutter create frontend
cd frontend
```

#### 5.3 Настрой pubspec.yaml

**Замени содержимое frontend/pubspec.yaml** на содержимое из артефакта "pubspec.yaml - Flutter Dependencies"

#### 5.4 Установи зависимости
```bash
flutter pub get
```

#### 5.5 Проверь установку
```bash
flutter doctor
```

Исправь все ошибки (если есть).

---

### ШАГ 6: Создание UI с помощью Cursor AI (30 мин)

#### 6.1 Создай структуру папок в lib/

**Промпт для Cursor AI:**
```
В папке frontend/lib/ создай структуру:

lib/
├── main.dart
├── core/
│   ├── constants/
│   │   ├── colors.dart
│   │   └── text_styles.dart
│   └── utils/
│       └── time_helper.dart
├── data/
│   ├── models/
│   │   ├── user.dart
│   │   ├── medication.dart
│   │   └── medication_log.dart
│   ├── local/
│   │   └── database_helper.dart
│   └── remote/
│       └── api_client.dart
├── domain/
│   └── services/
│       ├── sync_service.dart
│       └── notification_service.dart
└── presentation/
    ├── providers/
    │   └── medication_provider.dart
    ├── screens/
    │   └── patient/
    │       └── home_screen.dart
    └── widgets/
        ├── big_green_button.dart
        └── clock_widget.dart

Создай пустые файлы с базовым комментарием.
```

#### 6.2 Создай константы цветов

**Промпт для Cursor AI:**
```
Создай lib/core/constants/colors.dart с палитрой для "воздушного" дизайна:

- Белый фон (по умолчанию)
- Желтый фон (при напоминании) #FFF9E6
- Зеленый для кнопок #4CAF50
- Серый для текста #757575
- Красный для критических уведомлений #F44336

Экспортируй как AppColors class.
```

#### 6.3 Создай главный экран пациента

**Промпт для Cursor AI:**
```
Создай lib/presentation/screens/patient/home_screen.dart:

Требования:
1. StatefulWidget с динамическим фоном (белый/желтый)
2. Адаптивные цифровые часы в центре (15% ширины экрана)
3. Большая круглая зеленая кнопка внизу с иконкой галочки
4. Минималистичный дизайн без лишних элементов
5. Используй AppColors из constants

При нажатии кнопки:
- Анимация scale
- Вибрация (если доступна)
- Изменение статуса на "taken"

Используй Provider для state management.
```

#### 6.4 Создай модели данных

**Промпт для Cursor AI:**
```
Создай data models в lib/data/models/:

1. user.dart:
   - User class с полями: id (UUID), email, role, fullName
   - Methods: toJson(), fromJson(), toMap(), fromMap()

2. medication.dart:
   - Medication class: id, patientId, name, dosage, scheduledTime, instruction
   - Methods для сериализации

3. medication_log.dart:
   - MedicationLog class: id, medId, scheduledAt, actualAt, status
   - Enum для status: taken, missed, pending

Используй equatable для сравнения.
```

---

### ШАГ 7: Локальная база данных SQLite (20 мин)

**Промпт для Cursor AI:**
```
Создай lib/data/local/database_helper.dart:

Требования:
1. Singleton pattern для DatabaseHelper
2. Создание SQLite БД с таблицами:
   - medications_local
   - logs_local (offline буфер)
3. Методы:
   - insertMedication(Medication)
   - getMedications()
   - insertLog(MedicationLog)
   - getUnsyncedLogs() → List<MedicationLog>
   - markAsSynced(logId)
4. Версионирование базы (v1)

Используй sqflite package.
```

---

### ШАГ 8: API клиент (15 мин)

**Промпт для Cursor AI:**
```
Создай lib/data/remote/api_client.dart:

Требования:
1. Singleton ApiClient class
2. Base URL: http://localhost:3000
3. Methods:
   - login(email, password) → JWT token
   - getMedications(patientId) → List<Medication>
   - syncLogs(logs) → bool
   - getRelativeFeed(relativeId) → List<Event>
4. Автоматическое добавление JWT токена в headers
5. Обработка ошибок (try-catch)
6. Timeout 30 секунд

Используй http package и flutter_secure_storage для токена.
```

---

### ШАГ 9: Система уведомлений (25 мин)

**Промпт для Cursor AI:**
```
Создай lib/domain/services/notification_service.dart:

Настойчивая система напоминаний:
1. T+0: уведомление + легкий звук
2. T+10 мин: повтор + вибрация
3. T+20 мин: громкий звук + пульсация
4. T+30 мин: экстренное уведомление (если не принято)

Methods:
- scheduleReminder(Medication medication)
- cancelReminder(int id)
- handleReminderResponse(bool taken)

Используй:
- flutter_local_notifications
- timezone для планирования
- vibration для тактильного отклика

Настрой для Android и iOS.
```

---

### ШАГ 10: Запуск и тестирование (15 мин)

#### 10.1 Обнови main.dart

**Промпт для Cursor AI:**
```
Обнови lib/main.dart:

1. Инициализация:
   - DatabaseHelper
   - NotificationService
   - Timezone
2. MultiProvider setup с MedicationProvider
3. MaterialApp с:
   - Home: HomeScreen
   - Theme: минималистичный светлый
   - debugShowCheckedModeBanner: false

Добавь обработку первого запуска.
```

#### 10.2 Запусти Backend и Flutter

**Терминал 1 (Backend):**
```bash
cd backend
npm start
```

**Терминал 2 (Flutter):**
```bash
cd frontend
flutter run
```

Выбери устройство (эмулятор или физический телефон).

#### 10.3 Тестирование

**Проверь:**
1. ✅ Главный экран загружается
2. ✅ Часы показывают правильное время
3. ✅ Кнопка нажимается и анимируется
4. ✅ Backend отвечает на API запросы
5. ✅ SQLite БД создается

---

## 🐛 РЕШЕНИЕ ПРОБЛЕМ

### Проблема 1: PostgreSQL не подключается

**Промпт для Cursor AI:**
```
У меня ошибка подключения к PostgreSQL:
[вставь текст ошибки]

Мой .env файл:
[вставь содержимое .env]

Помоги исправить настройки подключения.
```

### Проблема 2: Flutter зависимости не устанавливаются

**Промпт для Cursor AI:**
```
flutter pub get выдает ошибку:
[вставь текст ошибки]

Мой pubspec.yaml:
[вставь содержимое]

Исправь конфликты версий.
```

### Проблема 3: Backend выдает 500 ошибку

**Промпт для Cursor AI:**
```
@file:server.js 

API endpoint /health возвращает ошибку:
[вставь текст ошибки]

Помоги отладить запрос к базе данных.
```

---

## 📚 ДОКУМЕНТАЦИЯ

### Создай README.md

**Промпт для Cursor AI:**
```
Создай README.md в корне проекта с разделами:

1. Описание проекта Smart Med Assistant
2. Технологический стек
3. Требования для установки
4. Инструкция по запуску Backend
5. Инструкция по запуску Frontend
6. API endpoints документация
7. Скриншоты (placeholder)
8. Лицензия MIT

Используй красивое форматирование с эмодзи.
```

---

## ⚡ БЫСТРЫЕ КОМАНДЫ CURSOR

| Команда | Описание |
|---------|----------|
| `Cmd/Ctrl + K` | Редактировать выделенный код с AI |
| `Cmd/Ctrl + L` | Открыть AI чат |
| `@codebase` | Спросить про весь проект |
| `@file:name.dart` | Спросить про конкретный файл |
| `@docs` | Поиск в документации |
| `Cmd/Ctrl + .` | Показать быстрые исправления |

---

## ✅ ФИНАЛЬНЫЙ ЧЕКЛИСТ

Перед завершением проверь:

### Backend:
- [ ] PostgreSQL запущен и база создана
- [ ] npm install выполнен без ошибок
- [ ] server.js запускается
- [ ] /health endpoint возвращает статус OK
- [ ] .env настроен с правильными паролями

### Frontend:
- [ ] Flutter SDK установлен (flutter doctor OK)
- [ ] pubspec.yaml dependencies установлены
- [ ] SQLite работает (проверь DatabaseHelper)
- [ ] API клиент подключается к Backend
- [ ] Главный экран отображается корректно

### Функциональность:
- [ ] Можно зарегистрировать пользователя
- [ ] Можно добавить лекарство
- [ ] Кнопка подтверждения работает
- [ ] Данные сохраняются в SQLite
- [ ] Синхронизация с Backend работает

---

## 🚀 ЧТО ДАЛЬШЕ?

После успешного запуска MVP:

1. **Добавь больше экранов** - список лекарств, календарь, настройки
2. **Настрой Firebase** - для push-уведомлений родственникам
3. **Добавь тесты** - unit tests, integration tests
4. **Оптимизируй UI** - анимации, темная тема
5. **Деплой Backend** - на Heroku или Railway
6. **Публикация** - Google Play / App Store

---

**Время на полную настройку: 2-3 часа**
**MVP готов к тестированию: через 1 неделю активной разработки**

Удачи! 🎉
