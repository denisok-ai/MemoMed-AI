# Установка MemoMed AI на чистый сервер

Скрипт **scripts/setup-server.sh** ставит всё необходимое на сервер с чистой Ubuntu/Debian и запускает приложение в автономном режиме (без необходимости держать SSH-сессию).

## Требования

- Ubuntu 22.04/24.04 или Debian 11/12
- Доступ по SSH с правами root или sudo
- Открытый порт 3000 (или настройте фаервол)

## Быстрый запуск

На сервере выполните (подставьте свой репозиторий при необходимости):

```bash
sudo bash -c "$(curl -sSL https://raw.githubusercontent.com/denisok-ai/MemoMed-AI/main/scripts/setup-server.sh)"
```

Или вручную:

```bash
sudo apt-get update && sudo apt-get install -y git
sudo git clone https://github.com/denisok-ai/MemoMed-AI.git /opt/memomed
cd /opt/memomed
sudo bash scripts/setup-server.sh
```

## Что делает скрипт

1. **Проверяет root/sudo** — скрипт должен запускаться от root.
2. **Устанавливает Docker** — если Docker и Docker Compose ещё не установлены (Ubuntu/Debian).
3. **Клонирует репозиторий** — в `/opt/memomed` (или в каталог из переменной `INSTALL_DIR`).
4. **Создаёт .env** — из `.env.example`, генерирует `NEXTAUTH_SECRET` и пароль PostgreSQL.
5. **Запускает приложение** — через `scripts/run-standalone.sh` (Docker Compose в фоне).

После выполнения приложение доступно по адресу **http://&lt;IP-сервера&gt;:3000**. Можно отключиться от SSH — сервисы продолжат работать.

## Переменные окружения для скрипта

| Переменная    | По умолчанию                                   | Описание               |
| ------------- | ---------------------------------------------- | ---------------------- |
| `INSTALL_DIR` | `/opt/memomed`                                 | Каталог установки      |
| `REPO_URL`    | `https://github.com/denisok-ai/MemoMed-AI.git` | URL репозитория        |
| `BRANCH`      | `main`                                         | Ветка для клонирования |

Пример установки в другой каталог:

```bash
sudo INSTALL_DIR=/home/deploy/memomed bash scripts/setup-server.sh
```

## После установки

- **Остановка:** `cd /opt/memomed && sudo ./scripts/stop-standalone.sh`
- **Логи:** `cd /opt/memomed && sudo docker compose -f docker-compose.standalone.yml logs -f`
- **Редактирование .env:** `sudo nano /opt/memomed/.env` (затем перезапуск: `sudo ./scripts/run-standalone.sh`)

Рекомендуется задать в `.env` свой домен и SSL (например, через обратный прокси nginx + Let's Encrypt) и обновить `NEXTAUTH_URL`.

## См. также

- [Деплой (production с nginx)](deployment.md)
- [Автономный запуск](../README.md#автономный-запуск-без-ssh)
