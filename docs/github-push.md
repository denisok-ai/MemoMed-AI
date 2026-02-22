<!--
  @file: github-push.md
  @description: Команды для привязки проекта к GitHub и первого пуша
  @created: 2026-02-22
-->

# Перенос сборки на GitHub

Репозиторий: [https://github.com/denisok-ai/MemoMed-AI](https://github.com/denisok-ai/MemoMed-AI)

**Перенос с локальной машины на внешний сервер (код → GitHub → сервер):** см. [deploy-to-server.md](deploy-to-server.md).

## Вариант A: Уже есть локальный Git с коммитами

Если проект уже инициализирован (`git init`) и есть коммиты:

```bash
cd /home/denisok/projects/MemoMed-AI

# Добавить удалённый репозиторий (один раз)
git remote add origin https://github.com/denisok-ai/MemoMed-AI.git

# Узнать текущую ветку (обычно main или master)
git branch

# Первый пуш (подставьте свою ветку, если не main)
git push -u origin main
```

Если ветка называется `master`:

```bash
git push -u origin master
```

Если GitHub при создании репозитория показал команды с `git branch -M main`, можно переименовать ветку и пушить:

```bash
git branch -M main
git push -u origin main
```

---

## Вариант B: Git ещё не инициализирован или нет коммитов

```bash
cd /home/denisok/projects/MemoMed-AI

# Инициализация (если ещё не сделано)
git init

# Переименовать ветку в main (опционально, по умолчанию часто master)
git branch -M main

# Добавить все файлы (исключения — из .gitignore: .env, node_modules и т.д.)
git add .

# Первый коммит
git commit -m "chore: initial commit — MemoMed AI MVP v0.1.0"

# Привязать удалённый репозиторий
git remote add origin https://github.com/denisok-ai/MemoMed-AI.git

# Отправить на GitHub
git push -u origin main
```

---

## Вариант C: Уже есть другой remote (например old-origin)

```bash
# Посмотреть текущие remote
git remote -v

# Удалить старый (если нужно)
git remote remove origin

# Добавить новый
git remote add origin https://github.com/denisok-ai/MemoMed-AI.git

git push -u origin main
```

---

## Аутентификация

- **HTTPS**: при `git push` запросит логин и пароль. Для GitHub вместо пароля используйте [Personal Access Token (PAT)](https://github.com/settings/tokens) с правом `repo`.
- **SSH** (удобно после настройки):
  ```bash
  git remote set-url origin git@github.com:denisok-ai/MemoMed-AI.git
  git push -u origin main
  ```

---

## Проверка после пуша

- Откройте https://github.com/denisok-ai/MemoMed-AI — в репозитории должны появиться файлы.
- Дальнейшие изменения:
  ```bash
  git add .
  git commit -m "описание изменений"
  git push
  ```
