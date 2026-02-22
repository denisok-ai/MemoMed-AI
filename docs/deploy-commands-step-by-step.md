# Подробные команды по шагам: перенос на сервер и запуск

Выполняйте команды по порядку. **Шаги 1–3** — на своей машине (локально), **шаги 4–6** — на сервере по SSH.

---

## На своей машине (WSL / Ubuntu)

### Шаг 1. Открыть терминал и перейти в каталог проекта

```bash
cd /home/denisok/projects/MemoMed-AI
```

### Шаг 2. Закоммитить изменения и отправить на GitHub

```bash
# Посмотреть, какие файлы изменены
git status

# Добавить все изменённые файлы
git add .

# Создать коммит (одна строка)
git commit -m "fix: Prisma 7 config for Docker, add prisma.config.cjs"

# Отправить на GitHub (ветка main)
git push origin main
```

Если попросит логин/пароль — используйте [Personal Access Token](https://github.com/settings/tokens) с правом `repo`, не пароль от аккаунта.

### Шаг 3. Подключиться к серверу по SSH

Подставьте **своего пользователя** и **IP или домен сервера** (например `root@91.201.41.28`):

```bash
ssh root@91.201.41.28
```

Введите пароль от сервера (или используйте ключ). После входа вы окажетесь в консоли сервера (`root@p664198:~#`).

---

## На сервере (после входа по SSH)

### Шаг 4. Перейти в каталог приложения

```bash
cd /opt/memomed
```

### Шаг 5. Скачать последние изменения с GitHub

```bash
sudo git pull origin main
```

Должно появиться сообщение вроде `Updating ... Fast-forward` и список обновлённых файлов.

**Если появилось «Your local changes would be overwritten by merge»** — на сервере есть локальные правки, их нужно отменить и снова подтянуть код:

```bash
# Отменить локальные изменения в файлах (оставить только код с GitHub)
sudo git checkout -- .

# Снова подтянуть последний код
sudo git pull origin main
```

### Шаг 6. Пересобрать образы и запустить приложение

**Вариант А — через общий скрипт (рекомендуется):**

```bash
sudo bash scripts/run-standalone.sh
```

Скрипт сам соберёт образы и поднимет контейнеры. Дождитесь сообщения «Приложение готово».

**Вариант Б — вручную (если нужно пересобрать без кэша):**

```bash
# Остановить старые контейнеры
sudo docker compose -f docker-compose.standalone.yml down

# Собрать образы заново (без кэша)
sudo docker compose -f docker-compose.standalone.yml build --no-cache

# Запустить контейнеры
sudo docker compose -f docker-compose.standalone.yml up -d
```

Через 1–2 минуты проверьте в браузере: **http://91.201.41.28:3000** (подставьте свой IP, если другой).

---

## Если что-то пошло не так

**Посмотреть логи приложения:**

```bash
cd /opt/memomed
sudo docker compose -f docker-compose.standalone.yml logs -f app
```

Выход: `Ctrl+C`.

**Посмотреть статус контейнеров:**

```bash
cd /opt/memomed
sudo docker compose -f docker-compose.standalone.yml ps
```

**Полностью остановить приложение:**

```bash
cd /opt/memomed
sudo ./scripts/stop-standalone.sh
```

**Запустить снова:**

```bash
cd /opt/memomed
sudo bash scripts/run-standalone.sh
```

---

## Режим отладки и тестовые данные

### Включить dev-login на сервере

Страница `/dev-login` позволяет войти тестовыми аккаунтами без пароля. По умолчанию доступна только при `NODE_ENV=development`. На сервере включите её через переменную окружения:

```bash
cd /opt/memomed
sudo nano .env
```

Добавьте или измените строку:

```
ENABLE_DEV_LOGIN=true
```

Перезапустите приложение:

```bash
sudo docker compose -f docker-compose.standalone.yml up -d
```

После этого откройте **http://IP-сервера:3000/dev-login** — появятся карточки для входа (admin, врач, родственник, пациент).

### Добавить тестовые данные (seed)

Скрипт создаёт 50 пациентов, 5 врачей, 5 родственников, 1 администратора, лекарства, логи приёмов и записи дневника. **Пароль всех аккаунтов: `Test1234!`**

**На сервере (Docker):**

```bash
cd /opt/memomed
sudo docker compose -f docker-compose.standalone.yml exec worker npx tsx prisma/seed.ts
```

**Локально (разработка):**

```bash
cd /home/denisok/projects/MemoMed-AI
npm run db:seed
```

После выполнения seed доступны аккаунты:

- `admin@memomed.dev` → админ-панель
- `doctor1@memomed.dev` … `doctor5@memomed.dev` → врачи
- `relative1@memomed.dev` … `relative5@memomed.dev` → родственники
- `patient1@memomed.dev` … `patient50@memomed.dev` → пациенты

---

## Краткая шпаргалка (копировать по блокам)

**Локально:**

```bash
cd /home/denisok/projects/MemoMed-AI
git add .
git commit -m "fix: Prisma 7 config for Docker"
git push origin main
ssh root@91.201.41.28
```

**На сервере (если pull раньше ругался на локальные изменения — сначала сбросить их):**

```bash
cd /opt/memomed
sudo git checkout -- .
sudo git pull origin main
sudo bash scripts/run-standalone.sh
```

Готово. Приложение будет доступно по адресу **http://IP*ВАШЕГО*СЕРВЕРА:3000**.
