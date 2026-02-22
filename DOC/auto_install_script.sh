#!/bin/bash
# Автоматическая установка Smart Med Assistant Backend
# Сервер: 194.87.0.45 (AlmaLinux 8)
# Использование: bash install.sh

set -e  # Остановка при ошибке

echo "🚀 Начинаем установку Smart Med Assistant..."
echo "================================================"

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Генерация случайных паролей
DB_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)

echo -e "${YELLOW}📝 Сгенерированы безопасные пароли${NC}"
echo "DB_PASSWORD: $DB_PASSWORD"
echo "JWT_SECRET: $JWT_SECRET"
echo ""
echo -e "${RED}⚠️  СОХРАНИ ЭТИ ДАННЫЕ В НАДЕЖНОМ МЕСТЕ!${NC}"
echo ""
read -p "Нажми Enter для продолжения..."

# ============================================
# ЭТАП 1: Обновление системы
# ============================================
echo -e "${GREEN}[1/7] Обновление системы...${NC}"
sudo dnf update -y
sudo dnf install -y git curl wget vim epel-release

# ============================================
# ЭТАП 2: Установка PostgreSQL 14
# ============================================
echo -e "${GREEN}[2/7] Установка PostgreSQL 14...${NC}"
sudo dnf install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-8-x86_64/pgdg-redhat-repo-latest.noarch.rpm
sudo dnf -qy module disable postgresql
sudo dnf install -y postgresql14-server postgresql14

# Инициализация базы данных
if [ ! -d "/var/lib/pgsql/14/data/base" ]; then
    sudo /usr/pgsql-14/bin/postgresql-14-setup initdb
fi

# Запуск и автостарт
sudo systemctl enable postgresql-14
sudo systemctl start postgresql-14

# ============================================
# ЭТАП 3: Настройка PostgreSQL
# ============================================
echo -e "${GREEN}[3/7] Настройка PostgreSQL...${NC}"

# Создание пользователя и базы данных
sudo -u postgres psql << EOF
CREATE DATABASE smart_med_assistant;
CREATE USER med_admin WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE smart_med_assistant TO med_admin;
ALTER DATABASE smart_med_assistant OWNER TO med_admin;
\q
EOF

# Настройка доступа (разрешаем localhost)
sudo bash -c "cat >> /var/lib/pgsql/14/data/pg_hba.conf << 'EOL'
# Smart Med Assistant
host    smart_med_assistant    med_admin    127.0.0.1/32    md5
host    smart_med_assistant    med_admin    ::1/128         md5
EOL"

# Разрешаем внешние подключения (опционально)
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /var/lib/pgsql/14/data/postgresql.conf

sudo systemctl restart postgresql-14

# ============================================
# ЭТАП 4: Установка Node.js 18
# ============================================
echo -e "${GREEN}[4/7] Установка Node.js 18...${NC}"
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install -y nodejs gcc-c++ make

# Проверка установки
node --version
npm --version

# ============================================
# ЭТАП 5: Создание директории проекта
# ============================================
echo -e "${GREEN}[5/7] Создание проекта Backend...${NC}"
mkdir -p ~/smart-med-backend
cd ~/smart-med-backend

# Инициализация npm проекта
cat > package.json << 'EOL'
{
  "name": "smart-med-backend",
  "version": "1.0.0",
  "description": "Backend API for Smart Med Assistant",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "keywords": ["medical", "medications", "reminder"],
  "author": "",
  "license": "MIT",
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
EOL

# Установка зависимостей
npm install

# ============================================
# ЭТАП 6: Создание конфигурации
# ============================================
echo -e "${GREEN}[6/7] Создание конфигурации...${NC}"

# .env файл
cat > .env << EOL
# Server Configuration
NODE_ENV=production
PORT=3000
SERVER_IP=194.87.0.45

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smart_med_assistant
DB_USER=med_admin
DB_PASSWORD=$DB_PASSWORD

# Security
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d

# CORS (разрешенные источники)
ALLOWED_ORIGINS=http://localhost:3000,http://194.87.0.45:3000
EOL

# Сохранение учетных данных в отдельный файл
cat > ~/CREDENTIALS.txt << EOL
==============================================
SMART MED ASSISTANT - УЧЕТНЫЕ ДАННЫЕ
==============================================
Сервер: 194.87.0.45
Дата установки: $(date)

PostgreSQL:
-----------
Хост: localhost
Порт: 5432
База данных: smart_med_assistant
Пользователь: med_admin
Пароль: $DB_PASSWORD

Backend API:
------------
URL: http://194.87.0.45:3000
JWT Secret: $JWT_SECRET

⚠️  ХРАНИ ЭТОТ ФАЙЛ В БЕЗОПАСНОМ МЕСТЕ!
==============================================
EOL

chmod 600 ~/CREDENTIALS.txt

# ============================================
# ЭТАП 7: Импорт SQL-схемы
# ============================================
echo -e "${GREEN}[7/7] Создание таблиц в базе данных...${NC}"
echo "Для импорта схемы выполни вручную:"
echo "psql -U med_admin -d smart_med_assistant -f schema.sql"
echo "(Файл schema.sql нужно скопировать из артефакта)"

# ============================================
# Настройка firewall
# ============================================
echo -e "${GREEN}Настройка firewall...${NC}"
if command -v firewall-cmd &> /dev/null; then
    sudo firewall-cmd --permanent --add-port=3000/tcp
    sudo firewall-cmd --permanent --add-port=5432/tcp
    sudo firewall-cmd --reload
fi

# ============================================
# ЗАВЕРШЕНИЕ
# ============================================
echo ""
echo -e "${GREEN}✅ Установка завершена!${NC}"
echo "================================================"
echo ""
echo "📋 Следующие шаги:"
echo ""
echo "1. Скопируй SQL-схему на сервер:"
echo "   scp schema.sql root@194.87.0.45:~/smart-med-backend/"
echo ""
echo "2. Импортируй схему:"
echo "   cd ~/smart-med-backend"
echo "   PGPASSWORD='$DB_PASSWORD' psql -U med_admin -d smart_med_assistant -f schema.sql"
echo ""
echo "3. Запусти Backend сервер:"
echo "   cd ~/smart-med-backend"
echo "   npm start"
echo ""
echo "4. Проверь работу:"
echo "   curl http://194.87.0.45:3000/health"
echo ""
echo "📄 Учетные данные сохранены в: ~/CREDENTIALS.txt"
echo ""