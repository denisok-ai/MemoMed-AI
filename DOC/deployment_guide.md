# 🚀 План развертывания Smart Med Assistant
## Сервер: AlmaLinux 8 (2 ядра, 2GB RAM, 40GB диск)

---

## ЭТАП 1: Подготовка сервера (5-10 мин)

### Шаг 1.1: Обновление системы
```bash
sudo dnf update -y
sudo dnf install -y git curl wget vim
```

### Шаг 1.2: Установка PostgreSQL 14
```bash
# Добавляем репозиторий PostgreSQL
sudo dnf install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-8-x86_64/pgdg-redhat-repo-latest.noarch.rpm

# Отключаем встроенный модуль PostgreSQL
sudo dnf -qy module disable postgresql

# Устанавливаем PostgreSQL 14
sudo dnf install -y postgresql14-server postgresql14

# Инициализация базы данных
sudo /usr/pgsql-14/bin/postgresql-14-setup initdb

# Запуск и автостарт
sudo systemctl enable postgresql-14
sudo systemctl start postgresql-14
```

### Шаг 1.3: Установка Node.js 18 (для Backend API)
```bash
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install -y nodejs
node --version  # Проверка
```

---

## ЭТАП 2: Настройка базы данных (10 мин)

### Шаг 2.1: Создание БД и пользователя
```bash
# Переключаемся на пользователя postgres
sudo -u postgres psql

# В консоли PostgreSQL выполняем:
CREATE DATABASE smart_med_assistant;
CREATE USER med_admin WITH ENCRYPTED PASSWORD 'ВАШ_СИЛЬНЫЙ_ПАРОЛЬ';
GRANT ALL PRIVILEGES ON DATABASE smart_med_assistant TO med_admin;
\q
```

### Шаг 2.2: Настройка доступа
```bash
# Редактируем pg_hba.conf
sudo vim /var/lib/pgsql/14/data/pg_hba.conf

# Добавляем строку (замени 127.0.0.1 на IP сервера если нужен удаленный доступ):
# host    smart_med_assistant    med_admin    127.0.0.1/32    md5

# Перезапускаем PostgreSQL
sudo systemctl restart postgresql-14
```

### Шаг 2.3: Импорт SQL-схемы
```bash
# Создаем файл schema.sql (скопируй содержимое из артефакта "PostgreSQL Schema")
vim ~/schema.sql

# Импортируем схему
psql -U med_admin -d smart_med_assistant -f ~/schema.sql
# Введи пароль, который создал выше
```

---

## ЭТАП 3: Установка Backend API (15 мин)

### Шаг 3.1: Создание проекта Node.js
```bash
mkdir -p ~/smart-med-backend
cd ~/smart-med-backend
npm init -y
```

### Шаг 3.2: Установка зависимостей
```bash
npm install express pg dotenv cors jsonwebtoken bcrypt
npm install --save-dev nodemon
```

### Шаг 3.3: Создание .env файла
```bash
cat > .env << 'EOF'
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smart_med_assistant
DB_USER=med_admin
DB_PASSWORD=ВАШ_СИЛЬНЫЙ_ПАРОЛЬ
JWT_SECRET=СГЕНЕРИРУЙ_СЛУЧАЙНУЮ_СТРОКУ_64_СИМВОЛА
EOF
```

---

## ЭТАП 4: Настройка Flutter (на твоем локальном компьютере)

### Шаг 4.1: Установка Flutter
**Для Windows:**
```powershell
# Скачай Flutter SDK с https://flutter.dev/docs/get-started/install/windows
# Распакуй в C:\flutter
# Добавь C:\flutter\bin в PATH
```

**Для Mac/Linux:**
```bash
cd ~
git clone https://github.com/flutter/flutter.git -b stable
export PATH="$PATH:`pwd`/flutter/bin"
flutter doctor
```

### Шаг 4.2: Создание проекта
```bash
flutter create smart_med_assistant
cd smart_med_assistant

# Замени pubspec.yaml на тот, что в артефакте
# Установи зависимости
flutter pub get
```

---

## ЭТАП 5: Запуск и тестирование

### На сервере (Backend):
```bash
cd ~/smart-med-backend
npm run dev  # Запуск в режиме разработки
```

### На локальном компьютере (Flutter):
```bash
flutter run  # Выбери эмулятор или подключи телефон
```

---

## 📋 ЧЕКЛИСТ перед началом

- [ ] Есть доступ к серверу по SSH
- [ ] Знаешь IP-адрес сервера
- [ ] Готов сгенерировать сильный пароль для БД
- [ ] На локальном компьютере можешь устанавливать софт
- [ ] Есть Android-телефон или эмулятор для тестов

---

## 🤖 ПРОМПТЫ ДЛЯ GEMINI CLI

Можешь использовать Gemini для генерации кода:

**Пример 1: Создание Backend API**
```
Создай Express.js сервер для медицинского приложения со следующими endpoint'ами:
- POST /api/auth/login (JWT аутентификация)
- GET /api/medications/:patientId (получение списка лекарств)
- POST /api/logs/sync (синхронизация offline данных)

Используй PostgreSQL через pg библиотеку. База данных уже создана по схеме из файла schema.sql
```

**Пример 2: Создание Flutter экрана**
```
Создай Flutter виджет для главного экрана пациента:
- Адаптивные часы (размер 15% от ширины экрана)
- Динамический фон (белый или желтый)
- Большая круглая зеленая кнопка внизу
- Используй Provider для state management
```

---

## ❓ ЧТО ДАЛЬШЕ?

**Скажи, на каком этапе ты сейчас:**
1. Есть SSH доступ к серверу - начинаем с ЭТАП 1?
2. Нужна помощь с подключением к серверу?
3. Хочешь сначала полный Backend код, чтобы сразу залить на сервер?
