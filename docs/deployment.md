<!--
  @file: deployment.md
  @description: Инструкция по деплою MemoMed AI на VPS
  @created: 2026-02-22
-->

# Деплой MemoMed AI

## Требования к серверу

- Ubuntu 22.04 / Debian 12
- Docker Engine 24+
- Docker Compose v2
- 2 GB RAM минимум (4 GB рекомендуется)
- 20 GB диска

## Первый запуск

### 1. Клонируем репозиторий

```bash
git clone https://github.com/your-user/memomed-ai.git /opt/memomed
cd /opt/memomed
```

### 2. Настраиваем окружение

```bash
cp .env.example .env
nano .env  # заполняем все переменные
```

**Обязательные переменные:**
- `NEXTAUTH_SECRET` — случайная строка 32+ символа: `openssl rand -base64 32`
- `POSTGRES_PASSWORD` — пароль для PostgreSQL
- `NEXTAUTH_URL` — публичный URL сайта (`https://your-domain.com`)
- `DEEPSEEK_API_KEY` — ключ API DeepSeek

### 3. Настраиваем SSL

```bash
# Самоподписанный сертификат для тестов
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem \
  -subj "/CN=your-domain.com"

# Или через Let's Encrypt (требует настройки DNS)
# Установите certbot отдельно, затем скопируйте сертификаты
```

### 4. Генерируем VAPID-ключи для Web Push

```bash
npx web-push generate-vapid-keys
# Скопируйте результат в .env (VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
```

### 5. Запускаем

```bash
bash scripts/deploy.sh --skip-backup
```

## Обновление

```bash
cd /opt/memomed
bash scripts/deploy.sh
```

Скрипт автоматически:
1. Делает бэкап БД
2. Пулит новый код
3. Пересобирает образы
4. Применяет миграции
5. Перезапускает сервисы

## Мониторинг

```bash
# Логи всех сервисов
docker compose logs -f

# Только приложение
docker compose logs -f app

# Статус
docker compose ps
```

## Резервное копирование

Бэкапы создаются автоматически при каждом деплое в `/var/backups/memomed/`.

Ручное создание бэкапа:
```bash
docker compose exec postgres pg_dump -U memomed memomed_db | \
  gzip > backup_$(date +%Y%m%d).sql.gz
```

Восстановление:
```bash
gunzip -c backup_YYYYMMDD.sql.gz | \
  docker compose exec -T postgres psql -U memomed memomed_db
```

## Структура сервисов

| Сервис | Порт | Описание |
|--------|------|----------|
| nginx | 80, 443 | Reverse proxy, SSL |
| app | 3000 (внутренний) | Next.js приложение |
| worker | — | BullMQ воркер |
| postgres | 5432 (внутренний) | БД |
| redis | 6379 (внутренний) | Кэш, очереди |
