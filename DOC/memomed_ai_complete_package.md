# 🚀 MEMOMED AI - ПОЛНЫЙ ПАКЕТ ПРОЕКТА

## 📦 СПИСОК ВСЕХ ФАЙЛОВ

```
memomed-ai/
├── README.md                          ← Главный файл проекта
├── docs/
│   ├── TZ.md                          ← Техническое задание
│   ├── BRANDING.md                    ← Брендбук и визуальная идентичность
│   ├── LLM_INTEGRATION.md             ← План интеграции AI
│   ├── API.md                         ← API документация
│   ├── DEPLOYMENT.md                  ← Инструкция по деплою
│   └── USER_STORIES.md                ← Пользовательские сценарии
├── backend/
│   ├── package.json                   ← Node.js зависимости
│   ├── server.js                      ← Express сервер
│   ├── .env.example                   ← Пример конфигурации
│   ├── routes/
│   │   ├── auth.js                    ← Аутентификация
│   │   ├── medications.js             ← CRUD лекарств
│   │   ├── logs.js                    ← Синхронизация логов
│   │   ├── ai.js                      ← AI-чат endpoint
│   │   └── relatives.js               ← Живая лента
│   ├── services/
│   │   ├── openai.service.js          ← OpenAI интеграция
│   │   ├── weather.service.js         ← Метеоданные API
│   │   └── analytics.service.js       ← Анализ корреляций
│   └── middleware/
│       ├── auth.middleware.js         ← JWT проверка
│       └── rateLimit.middleware.js    ← Rate limiting
├── database/
│   ├── schema.sql                     ← PostgreSQL схема
│   ├── seeds/                         ← Тестовые данные
│   │   ├── users.sql
│   │   ├── medications.sql
│   │   └── diagnoses.sql
│   └── migrations/                    ← Миграции БД
│       └── 001_initial_schema.sql
├── frontend/
│   ├── pubspec.yaml                   ← Flutter зависимости
│   ├── android/                       ← Android конфигурация
│   ├── ios/                           ← iOS конфигурация
│   └── lib/
│       ├── main.dart                  ← Точка входа
│       ├── core/
│       │   ├── constants/
│       │   │   ├── colors.dart        ← Цвета MemoMed AI
│       │   │   ├── text_styles.dart   ← Типографика
│       │   │   └── app_config.dart    ← Конфигурация
│       │   └── utils/
│       │       ├── time_helper.dart
│       │       └── vibration_helper.dart
│       ├── data/
│       │   ├── models/
│       │   │   ├── user.dart
│       │   │   ├── medication.dart
│       │   │   ├── medication_log.dart
│       │   │   └── ai_message.dart    ← Модель для AI-чата
│       │   ├── local/
│       │   │   ├── database_helper.dart
│       │   │   └── secure_storage.dart
│       │   ├── remote/
│       │   │   ├── api_client.dart
│       │   │   └── ai_api_client.dart ← AI-чат клиент
│       │   └── repositories/
│       │       ├── medication_repository.dart
│       │       └── ai_repository.dart
│       ├── domain/
│       │   └── services/
│       │       ├── sync_service.dart
│       │       ├── notification_service.dart
│       │       └── ai_chat_service.dart
│       └── presentation/
│           ├── providers/
│           │   ├── auth_provider.dart
│           │   ├── medication_provider.dart
│           │   └── ai_chat_provider.dart
│           ├── screens/
│           │   ├── splash_screen.dart
│           │   ├── onboarding_screen.dart
│           │   ├── auth/
│           │   │   ├── login_screen.dart
│           │   │   └── register_screen.dart
│           │   ├── patient/
│           │   │   ├── home_screen.dart
│           │   │   ├── medication_list.dart
│           │   │   ├── add_medication.dart
│           │   │   └── ai_chat_screen.dart ← AI-помощник
│           │   └── relative/
│           │       ├── live_feed.dart
│           │       └── calendar_view.dart
│           └── widgets/
│               ├── big_green_button.dart
│               ├── clock_widget.dart
│               ├── medication_card.dart
│               ├── ai_message_bubble.dart  ← Пузырь чата
│               └── loading_indicator.dart
├── assets/
│   ├── images/
│   │   ├── logo.png                   ← Логотип MemoMed AI
│   │   ├── onboarding/                ← Онбординг картинки
│   │   └── pill_placeholder.png
│   ├── fonts/
│   │   ├── Montserrat-Regular.ttf
│   │   └── Montserrat-SemiBold.ttf
│   └── icons/                         ← Иконки приложения
│       ├── app_icon_android.png
│       └── app_icon_ios.png
├── scripts/
│   ├── setup_db.sh                    ← Автоматическая настройка БД
│   ├── deploy_backend.sh              ← Деплой на сервер
│   └── build_release.sh               ← Сборка APK/IPA
└── tests/
    ├── backend/
    │   ├── auth.test.js
    │   └── ai.test.js
    └── frontend/
        ├── widget_test.dart
        └── integration_test/
            └── app_test.dart
```

---

## 1️⃣ README.md

```markdown
# 🧠 MemoMed AI

> Первый AI-ассистент для контроля приема лекарств с заботой о пациентах с когнитивными особенностями

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Flutter](https://img.shields.io/badge/Flutter-3.16+-blue.svg)](https://flutter.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

## 🎯 О проекте

**MemoMed AI** - мобильное приложение, которое помогает пациентам не забывать о приеме лекарств, а родственникам - быть спокойными за здоровье близких.

### Ключевые особенности:

- 🤖 **AI-помощник** - отвечает на вопросы о лекарствах простым языком
- 🔔 **Настойчивые напоминания** - система эскалации (T+0, T+10, T+20, T+30)
- 👨‍👩‍👦 **Живая лента** - родственники видят приемы в реальном времени
- 📱 **Offline-first** - работает без интернета
- 📊 **Умная аналитика** - AI находит связи между симптомами и погодой
- 🎨 **Воздушный дизайн** - минимализм для пожилых людей

## 🚀 Быстрый старт

### Требования:
- Node.js 18+
- PostgreSQL 14+
- Flutter 3.16+
- Android Studio / Xcode

### Установка Backend:

```bash
# Клонировать репозиторий
git clone https://github.com/yourusername/memomed-ai.git
cd memomed-ai/backend

# Установить зависимости
npm install

# Настроить .env
cp .env.example .env
# Отредактировать .env (добавить DB пароли, OpenAI API ключ)

# Создать базу данных
psql -U postgres -f ../database/schema.sql

# Запустить сервер
npm start
```

### Установка Frontend:

```bash
cd ../frontend

# Установить зависимости
flutter pub get

# Запустить на эмуляторе/устройстве
flutter run
```

## 📖 Документация

- [Техническое задание](docs/TZ.md)
- [API документация](docs/API.md)
- [Брендбук](docs/BRANDING.md)
- [LLM интеграция](docs/LLM_INTEGRATION.md)
- [Инструкция по деплою](docs/DEPLOYMENT.md)

## 🛠 Технологический стек

### Frontend:
- **Flutter** 3.16+ (Dart 3.2+)
- Provider (state management)
- SQLite (offline storage)
- http / dio (API клиент)

### Backend:
- **Node.js** 18+ / Express.js
- PostgreSQL 14
- JWT (аутентификация)
- OpenAI API (AI-чат)

### Инфраструктура:
- VPS/Cloud (AlmaLinux 8 / Ubuntu 22.04)
- Firebase Cloud Messaging (push-уведомления)
- OpenWeather API (метеоданные)

## 🎨 Дизайн

**Цветовая палитра:**
- Primary: #7E57C2 (Purple - память, интеллект)
- Success: #4CAF50 (Green - здоровье)
- Warning: #FFF9E6 (Light Yellow - напоминание)

**Шрифты:**
- Montserrat (логотип, заголовки)
- Inter / Roboto (основной текст)

## 📱 Скриншоты

[Добавить скриншоты после разработки UI]

## 🗺 Roadmap

### v1.0 (MVP) - Март 2026
- ✅ Базовая регистрация и аутентификация
- ✅ Добавление лекарств
- ✅ Настойчивые напоминания
- ✅ Offline-first с синхронизацией
- ✅ Живая лента для родственников
- ✅ AI-чат помощник

### v1.1 - Апрель 2026
- 📅 Календарь дисциплины
- 📸 Загрузка фото упаковок
- 🔥 Firebase Push notifications
- 📊 Расширенная аналитика

### v1.2 - Май 2026
- 📝 Дневник самочувствия с AI-анализом
- 🌤 Корреляция симптомов с погодой
- 📄 Экспорт отчетов для врача (PDF/Excel)

### v2.0 - Июнь 2026
- 🍎 iOS версия
- 🌍 Локализация (английский язык)
- 💎 Premium подписка

## 👥 Команда

- Product Owner: [Имя]
- Backend Developer: [Имя]
- Flutter Developer: [Имя]
- UI/UX Designer: [Имя]

## 📄 Лицензия

MIT License - см. [LICENSE](LICENSE)

## 🤝 Контакты

- Website: https://memomed.ai
- Email: hello@memomed.ai
- Telegram: @memomed_support

---

**MemoMed AI** - Искусственный интеллект заботится о вашем здоровье 💚
```

---

## 2️⃣ backend/package.json

```json
{
  "name": "memomed-ai-backend",
  "version": "1.0.0",
  "description": "Backend API for MemoMed AI - AI-powered medication reminder app",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest --coverage",
    "lint": "eslint ."
  },
  "keywords": [
    "medication",
    "reminder",
    "AI",
    "healthcare",
    "elderly"
  ],
  "author": "MemoMed AI Team",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1",
    "node-cron": "^3.0.3",
    "openai": "^4.20.1",
    "axios": "^1.6.2",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.7.0",
    "eslint": "^8.55.0",
    "supertest": "^6.3.3"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

## 3️⃣ backend/.env.example

```env
# Server Configuration
NODE_ENV=development
PORT=3000
SERVER_IP=localhost

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=memomed_ai
DB_USER=memomed_admin
DB_PASSWORD=your_secure_password_here

# Security
JWT_SECRET=your_jwt_secret_minimum_64_characters_random_string
JWT_EXPIRES_IN=7d

# OpenAI API (для AI-чата)
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=500

# OpenWeather API (для метеоданных)
OPENWEATHER_API_KEY=your-openweather-api-key
OPENWEATHER_UNITS=metric

# Firebase Admin SDK (для push-уведомлений)
FIREBASE_PROJECT_ID=memomed-ai
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@memomed-ai.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# CORS (разрешенные источники)
ALLOWED_ORIGINS=http://localhost:3000,https://memomed.ai

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=logs/memomed-ai.log
```

---

## 4️⃣ backend/routes/ai.js

```javascript
// AI Chat Endpoint для MemoMed AI
const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const authenticateToken = require('../middleware/auth.middleware');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Системный промпт для MemoMed AI
const SYSTEM_PROMPT = `Ты - MemoMed AI, заботливый медицинский ассистент для пожилых людей.

ТВОЯ РОЛЬ:
- Помогать пациентам понимать инструкции к лекарствам
- Отвечать на вопросы простым, понятным языком
- Быть мягким и поддерживающим, не пугать

ПРАВИЛА:
1. Отвечай КРАТКО (2-3 предложения максимум)
2. Используй простые слова без медицинских терминов
3. НЕ ставь диагнозы и НЕ заменяй врача
4. Если вопрос серьезный - рекомендуй обратиться к врачу
5. Будь добрым и терпеливым
6. Обращайся на "Вы" с уважением

ПРИМЕРЫ ОТВЕТОВ:
Вопрос: "Что значит 'принимать натощак'?"
Ответ: "Это значит за 30 минут ДО еды или через 2 часа ПОСЛЕ еды. Лучше всего утром, запив стаканом воды."

Вопрос: "У меня кружится голова после таблетки"
Ответ: "Это может быть побочный эффект. Обязательно позвоните своему врачу и расскажите об этом. А пока посидите или полежите."`;

// POST /api/ai/chat - отправить сообщение AI
router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    const userId = req.user.userId;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Сообщение не может быть пустым' });
    }

    // Ограничение длины сообщения
    if (message.length > 500) {
      return res.status(400).json({ 
        error: 'Сообщение слишком длинное (макс. 500 символов)' 
      });
    }

    // Формируем историю диалога для контекста
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.slice(-6), // Последние 3 пары сообщений
      { role: 'user', content: message }
    ];

    // Вызов OpenAI API
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages: messages,
      max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 500,
      temperature: 0.7,
      user: userId // Для отслеживания abuse
    });

    const aiResponse = completion.choices[0].message.content;

    // Логируем для аналитики (без персональных данных)
    console.log(`[AI Chat] User: ${userId}, Tokens: ${completion.usage.total_tokens}`);

    res.json({
      response: aiResponse,
      tokensUsed: completion.usage.total_tokens
    });

  } catch (error) {
    console.error('AI Chat error:', error);

    // Обработка специфичных ошибок OpenAI
    if (error.code === 'insufficient_quota') {
      return res.status(503).json({ 
        error: 'AI-ассистент временно недоступен. Попробуйте позже.' 
      });
    }

    res.status(500).json({ 
      error: 'Ошибка при обработке запроса к AI' 
    });
  }
});

// GET /api/ai/suggestions - получить готовые вопросы
router.get('/suggestions', authenticateToken, (req, res) => {
  const suggestions = [
    "Как правильно принимать таблетки?",
    "Что делать, если забыл выпить лекарство?",
    "Можно ли пить это лекарство с едой?",
    "Какие побочные эффекты могут быть?",
    "Когда лучше принимать - утром или вечером?"
  ];

  res.json({ suggestions });
});

module.exports = router;
```

---

## 5️⃣ frontend/lib/presentation/screens/patient/ai_chat_screen.dart

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/colors.dart';
import '../../../core/constants/text_styles.dart';
import '../../providers/ai_chat_provider.dart';
import '../../widgets/ai_message_bubble.dart';

class AIChatScreen extends StatefulWidget {
  const AIChatScreen({Key? key}) : super(key: key);

  @override
  State<AIChatScreen> createState() => _AIChatScreenState();
}

class _AIChatScreenState extends State<AIChatScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _sendMessage() {
    final message = _messageController.text.trim();
    if (message.isEmpty) return;

    final chatProvider = context.read<AIChatProvider>();
    chatProvider.sendMessage(message);
    _messageController.clear();

    // Скролл вниз после отправки
    Future.delayed(Duration(milliseconds: 300), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(
                Icons.psychology,
                color: AppColors.primary,
                size: 24,
              ),
            ),
            SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'MemoMed AI',
                  style: AppTextStyles.medicationName.copyWith(
                    fontSize: 18,
                  ),
                ),
                Text(
                  'Ваш умный помощник',
                  style: AppTextStyles.body.copyWith(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ],
        ),
        backgroundColor: Colors.white,
        elevation: 1,
      ),
      body: Column(
        children: [
          // Быстрые вопросы (suggestions)
          _buildSuggestions(),

          // Список сообщений
          Expanded(
            child: Consumer<AIChatProvider>(
              builder: (context, chatProvider, child) {
                if (chatProvider.messages.isEmpty) {
                  return _buildEmptyState();
                }

                return ListView.builder(
                  controller: _scrollController,
                  padding: EdgeInsets.all(16),
                  itemCount: chatProvider.messages.length,
                  itemBuilder: (context, index) {
                    final message = chatProvider.messages[index];
                    return AIMessageBubble(message: message);
                  },
                );
              },
            ),
          ),

          // Индикатор печатания
          Consumer<AIChatProvider>(
            builder: (context, chatProvider, child) {
              if (!chatProvider.isTyping) return SizedBox.shrink();

              return Container(
                padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Row(
                  children: [
                    SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(
                          AppColors.primary,
                        ),
                      ),
                    ),
                    SizedBox(width: 12),
                    Text(
                      'MemoMed AI печатает...',
                      style: AppTextStyles.body.copyWith(
                        color: AppColors.textSecondary,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              );
            },
          ),

          // Поле ввода
          _buildInputField(),
        ],
      ),
    );
  }

  Widget _buildSuggestions() {
    return Consumer<AIChatProvider>(
      builder: (context, chatProvider, child) {
        if (chatProvider.messages.isNotEmpty) {
          return SizedBox.shrink();
        }

        final suggestions = [
          "Как принимать таблетки?",
          "Забыл выпить лекарство",
          "Побочные эффекты",
        ];

        return Container(
          height: 60,
          padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: suggestions.length,
            itemBuilder: (context, index) {
              return Padding(
                padding: EdgeInsets.only(right: 8),
                child: ActionChip(
                  label: Text(suggestions[index]),
                  onPressed: () {
                    _messageController.text = suggestions[index];
                    _sendMessage();
                  },
                  backgroundColor: AppColors.primary.withOpacity(0.1),
                  labelStyle: TextStyle(
                    color: AppColors.primary,
                    fontSize: 14,
                  ),
                ),
              );
            },
          ),
        );
      },
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.psychology_outlined,
              size: 80,
              color: AppColors.primary.withOpacity(0.3),
            ),
            SizedBox(height: 24),
            Text(
              'Здравствуйте!',
              style: AppTextStyles.medicationName,
            ),
            SizedBox(height: 12),
            Text(
              'Я - MemoMed AI, ваш умный помощник.\nЗадайте мне вопрос о лекарствах.',
              textAlign: TextAlign.center,
              style: AppTextStyles.body.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInputField() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: Offset(0, -2),
          ),
        ],
      ),
      padding: EdgeInsets.all(16),
      child: SafeArea(
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: _messageController,
                decoration: InputDecoration(
                  hintText: 'Задайте вопрос...',
                  hintStyle: TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 16,
                  ),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(24),
                    borderSide: BorderSide(
                      color: AppColors.textSecondary.withOpacity(0.3),
                    ),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(24),
                    borderSide: BorderSide(
                      color: AppColors.primary,
                      width: 2,
                    ),
                  ),
                  contentPadding: EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 12,
                  ),
                ),
                style: AppTextStyles.body,
                maxLength: 500,
                maxLines: null,
                textCapitalization: TextCapitalization.sentences,
                onSubmitted: (_) => _sendMessage(),
              ),
            ),
            SizedBox(width: 12),
            FloatingActionButton(
              onPressed: _sendMessage,
              backgroundColor: AppColors.primary,
              child: Icon(Icons.send, color: Colors.white),
              mini: true,
            ),
          ],
        ),
      ),
    );
  }
}
```

---

**ИТОГО: Создано 5 ключевых файлов!**

---

## ❓ ЧТО ДАЛЬШЕ?

Теперь у тебя есть:
1. ✅ README с описанием проекта
2. ✅ package.json с зависимостями (включая OpenAI)
3. ✅ AI Chat endpoint (backend)
4. ✅ AI Chat Screen (Flutter UI)
5. ✅ .env.example с настройками

**Хочешь, чтобы я создал:**

A) Остальные файлы из списка (всего 50+ файлов)?
B) Детальный план LLM-интеграции (стратегия, промпты, аналитика)?
C) Инструкцию по запуску AI-чата локально для тестов?
D) Всё сразу одним архивом?

**Напиши букву (A/B/C/D)!** 🚀
