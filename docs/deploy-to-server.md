# Перенос сборки с локальной машины на внешний сервер

Пошаговые команды: сначала выкладываете код на GitHub с локального компьютера, затем на новом сервере поднимаете приложение из репозитория.

---

## Шаг 1. Локально: отправить код на GitHub

На своей машине (WSL/Ubuntu) в каталоге проекта:

```bash
cd /home/denisok/projects/MemoMed-AI

# Если ещё не привязали репозиторий
git remote add origin https://github.com/denisok-ai/MemoMed-AI.git

# Убедиться, что ветка main
git branch -M main

# Закоммитить все изменения (если есть незакоммиченные)
git add .
git status
git commit -m "chore: deploy"   # только если есть что коммитить

# Отправить на GitHub
git push -u origin main
```

Пароль при `git push`: используйте [Personal Access Token](https://github.com/settings/tokens) (права `repo`), не пароль от аккаунта.

---

## Шаг 2. Подключиться к новому серверу по SSH

Подставьте свой логин и адрес сервера:

```bash
ssh user@IP_СЕРВЕРА
# или по ключу:
ssh -i ~/.ssh/your_key user@IP_СЕРВЕРА
```

Пример: `ssh root@192.168.1.100` или `ssh ubuntu@my-server.example.com`.

---

## Шаг 3. На сервере: установить и запустить приложение

Один из двух способов.

### Вариант A: одной командой (рекомендуется)

Скрипт сам установит Docker (если нужно), склонирует репозиторий, создаст `.env` и запустит приложение:

```bash
sudo bash -c "$(curl -sSL https://raw.githubusercontent.com/denisok-ai/MemoMed-AI/main/scripts/setup-server.sh)"
```

После выполнения приложение будет доступно по адресу **http://IP_СЕРВЕРА:3000**.

### Вариант B: вручную (клонирование и запуск)

```bash
# Установить git (если ещё нет)
sudo apt-get update && sudo apt-get install -y git

# Клонировать репозиторий
sudo git clone https://github.com/denisok-ai/MemoMed-AI.git /opt/memomed
cd /opt/memomed

# Запустить скрипт установки (Docker + .env + запуск)
sudo bash scripts/setup-server.sh
```

---

## Шаг 4. (По желанию) Перенести свой .env с локальной машины

Если хотите использовать на сервере те же секреты и настройки, что и локально:

**На локальной машине** — скопировать `.env` на сервер (подставьте user и IP):

```bash
cd /home/denisok/projects/MemoMed-AI
scp .env user@IP_СЕРВЕРА:/tmp/memomed.env
```

**На сервере** — положить файл в каталог приложения и перезапустить:

```bash
sudo mv /tmp/memomed.env /opt/memomed/.env
cd /opt/memomed
sudo ./scripts/stop-standalone.sh
sudo ./scripts/run-standalone.sh
```

Важно: в `.env` на сервере должен быть правильный **NEXTAUTH_URL**, например `http://IP_СЕРВЕРА:3000` или `https://ваш-домен.ru`.

---

## Краткая шпаргалка

| Действие              | Где        | Команда                                                                                                            |
| --------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------ |
| Пуш кода              | Локально   | `cd /home/denisok/projects/MemoMed-AI && git push origin main`                                                     |
| Подключение к серверу | Локально   | `ssh user@IP_СЕРВЕРА`                                                                                              |
| Установка на сервер   | На сервере | `sudo bash -c "$(curl -sSL https://raw.githubusercontent.com/denisok-ai/MemoMed-AI/main/scripts/setup-server.sh)"` |
| Остановка приложения  | На сервере | `cd /opt/memomed && sudo ./scripts/stop-standalone.sh`                                                             |
| Запуск приложения     | На сервере | `cd /opt/memomed && sudo ./scripts/run-standalone.sh`                                                              |
| Логи                  | На сервере | `cd /opt/memomed && sudo docker compose -f docker-compose.standalone.yml logs -f`                                  |

---

## Обновление приложения на сервере (после новых коммитов)

На локальной машине:

```bash
cd /home/denisok/projects/MemoMed-AI
git add .
git commit -m "описание изменений"
git push origin main
```

На сервере:

```bash
cd /opt/memomed
sudo git pull origin main
sudo ./scripts/stop-standalone.sh
sudo ./scripts/run-standalone.sh
```

См. также: [Установка на чистый сервер](server-setup.md), [Деплой (production)](deployment.md).
