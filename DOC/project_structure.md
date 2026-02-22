# Структура проекта Smart Med Assistant

```
lib/
├── main.dart                          # Точка входа
├── app.dart                           # Корневой виджет приложения
│
├── core/                              # Ядро приложения
│   ├── constants/
│   │   ├── colors.dart                # Палитра "воздушного" дизайна
│   │   ├── text_styles.dart           # Стили текста (адаптивные размеры)
│   │   └── dimensions.dart            # Размеры элементов
│   ├── utils/
│   │   ├── time_helper.dart           # UTC ↔ Local конвертация
│   │   ├── vibration_helper.dart      # Двойная мягкая вибрация
│   │   └── network_helper.dart        # Проверка интернета
│   └── config/
│       └── api_config.dart            # URL endpoints
│
├── data/                              # Слой данных
│   ├── models/
│   │   ├── user.dart
│   │   ├── medication.dart
│   │   ├── medication_log.dart
│   │   └── health_entry.dart
│   ├── local/
│   │   ├── database_helper.dart       # SQLite setup
│   │   ├── dao/
│   │   │   ├── medication_dao.dart
│   │   │   └── log_dao.dart
│   │   └── secure_storage.dart        # JWT хранилище
│   ├── remote/
│   │   ├── api_client.dart            # HTTP клиент с токеном
│   │   └── endpoints/
│   │       ├── auth_api.dart
│   │       ├── medication_api.dart
│   │       └── sync_api.dart
│   └── repositories/
│       ├── medication_repository.dart  # Объединяет local + remote
│       └── auth_repository.dart
│
├── domain/                             # Бизнес-логика
│   ├── services/
│   │   ├── sync_service.dart           # Offline-first синхронизация
│   │   ├── reminder_service.dart       # Настойчивые напоминания
│   │   └── notification_service.dart   # Push уведомления
│   └── usecases/
│       ├── take_medication.dart
│       └── get_daily_schedule.dart
│
├── presentation/                       # UI слой
│   ├── providers/                      # State management
│   │   ├── auth_provider.dart
│   │   ├── medication_provider.dart
│   │   └── theme_provider.dart
│   ├── screens/
│   │   ├── patient/                    # Модуль пациента
│   │   │   ├── home_screen.dart        # Главный экран (желтый фон)
│   │   │   ├── medication_list.dart
│   │   │   └── add_medication.dart
│   │   ├── relative/                   # Модуль родственника
│   │   │   ├── live_feed.dart          # Живая лента
│   │   │   └── calendar_view.dart      # Календарь дисциплины
│   │   └── auth/
│   │       ├── login_screen.dart
│   │       └── register_screen.dart
│   └── widgets/
│       ├── big_green_button.dart       # Кнопка с галочкой + анимация
│       ├── clock_widget.dart           # Адаптивные часы (15% ширины)
│       ├── medication_card.dart
│       └── calendar_cell.dart          # Ячейка календаря (цветная)
│
└── background/                         # Фоновые задачи
    ├── workmanager_setup.dart          # Синхронизация в фоне
    └── local_notification_handler.dart # Локальные напоминания

---

## Дополнительные файлы

android/
└── app/
    └── src/main/AndroidManifest.xml    # Разрешения (интернет, вибрация)

ios/
└── Runner/
    └── Info.plist                       # iOS разрешения

assets/
├── fonts/
│   ├── Montserrat-Medium.ttf
│   └── Montserrat-Regular.ttf
└── images/
    └── pill_placeholder.png             # Заглушка для фото таблеток

---

## Ключевые паттерны

1. **Repository Pattern**: Единая точка доступа к данным (local/remote)
2. **Provider Pattern**: Управление состоянием без сложности
3. **Clean Architecture**: Разделение на data/domain/presentation
4. **Offline-first**: Все операции сначала локально, потом синхронизация
