<!--
  @file: api.md
  @description: Документация REST API MemoMed AI
  @created: 2026-02-24
-->

# MemoMed AI — REST API

> Базовый URL: `/api`  
> Аутентификация: NextAuth.js (JWT в httpOnly cookie)  
> Content-Type: `application/json`

---

## 1. Публичные эндпоинты

### POST /api/auth/register

Регистрация нового пользователя.

**Тело запроса:**

```json
{
  "email": "user@example.com",
  "password": "min8chars",
  "fullName": "Иван Иванов",
  "role": "patient",
  "consentGiven": true,
  "feedbackConsent": false
}
```

**Ответ 201:**

```json
{
  "data": { "id": "uuid" },
  "message": "Аккаунт создан"
}
```

**Ошибки:** 400 (валидация), 409 (email уже существует)

---

### POST /api/locale

Установка языка интерфейса (ru/en).

**Тело запроса:**

```json
{
  "locale": "ru"
}
```

**Ответ 200:** `{ "success": true, "locale": "ru" }` + cookie `NEXT_LOCALE`

**Ошибки:** 400 (невалидная локаль: de, fr и т.д.)

---

### GET /api/health

Проверка состояния сервиса (health check для Docker/monitoring).

**Ответ 200:**

```json
{
  "status": "ok",
  "version": "0.1.0",
  "buildDate": "",
  "timestamp": "2026-02-24T12:00:00.000Z",
  "services": {
    "database": "ok",
    "redis": "ok"
  }
}
```

**Ответ 503:** `status: "degraded"` или `"error"` при недоступности БД/Redis

---

## 2. Аутентификация

Все эндпоинты ниже требуют авторизации (JWT).

- **401** — отсутствует или невалидная сессия
- **403** — недостаточно прав (роль)

---

## 3. Лекарства (patient)

### GET /api/medications

Список активных лекарств пациента.

**Роль:** patient

**Ответ 200:**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Аспирин",
      "dosage": "100мг",
      "instruction": "1 таблетка утром",
      "photoUrl": null,
      "scheduledTime": "08:00",
      "isActive": true,
      "createdAt": "2026-02-24T12:00:00.000Z"
    }
  ]
}
```

---

### POST /api/medications

Создание лекарства.

**Роль:** patient

**Тело запроса:**

```json
{
  "name": "Аспирин",
  "dosage": "100мг",
  "instruction": "1 таблетка утром",
  "scheduledTime": "08:00"
}
```

**Ответ 201:** `{ "data": { "id": "uuid" }, "message": "Лекарство добавлено" }`

**Ошибки:** 400 (валидация: name 2–100 символов, время HH:MM)

---

### PATCH /api/medications/:id

Редактирование лекарства.

**Роль:** patient

**Тело запроса:** частичное обновление (name, dosage, instruction, scheduledTime)

---

### DELETE /api/medications/:id

Архивирование (soft delete) лекарства.

**Роль:** patient

---

### POST /api/medications/:id/photo

Загрузка фото упаковки.

**Роль:** patient

**Content-Type:** multipart/form-data

---

### DELETE /api/medications/:id/photo

Удаление фото.

**Роль:** patient

---

## 4. Логи приёмов (patient)

### POST /api/logs

Запись факта приёма лекарства.

**Роль:** patient

**Тело запроса:**

```json
{
  "medicationId": "uuid",
  "scheduledAt": "2026-02-24T08:00:00.000Z",
  "actualAt": "2026-02-24T08:05:00.000Z",
  "status": "taken"
}
```

**status:** `taken` | `missed` | `pending`

**Ответ 201:** `{ "data": { "id": "uuid" }, "message": "Приём записан" }`

**Ошибки:** 400 (валидация), 404 (лекарство не найдено или не принадлежит пациенту)

---

### POST /api/logs/sync

Пакетная синхронизация офлайн-логов. Max 100 записей за запрос.

**Роль:** patient

**Тело запроса:**

```json
{
  "logs": [
    {
      "localId": "local-1",
      "medicationId": "uuid",
      "scheduledAt": "2026-02-24T08:00:00.000Z",
      "actualAt": "2026-02-24T08:05:00.000Z",
      "status": "taken",
      "createdAt": "2026-02-24T08:05:00.000Z"
    }
  ]
}
```

**Ответ 200:**

```json
{
  "data": {
    "synced": ["local-1"],
    "failed": []
  },
  "message": "Синхронизировано 1 записей"
}
```

---

## 5. Лента событий (relative)

### GET /api/feed

Server-Sent Events — живая лента приёмов подключённых пациентов.

**Роль:** relative

**События:** `connected`, `medication_log`, `ping`, `reconnect`, `error`

**TTL соединения:** 5 минут

---

### GET /api/feed/events

REST fallback для ленты (polling).

**Роль:** relative

**Query:** `?before=timestamp` — курсорная пагинация

**Ответ 200:**

```json
{
  "data": [
    {
      "logId": "uuid",
      "status": "taken",
      "medicationName": "Аспирин",
      "dosage": "100мг",
      "scheduledTime": "08:00",
      "actualAt": "2026-02-24T08:05:00.000Z",
      "patientName": "Иван Иванов",
      "patientId": "uuid",
      "delayMinutes": 5,
      "color": "yellow",
      "timestamp": 1708764300000
    }
  ],
  "hasMore": false
}
```

**color:** `green` (вовремя), `yellow` (до 30 мин), `red` (пропуск или >30 мин)

---

## 6. Связи пациент–родственник

### POST /api/connections/link

Привязка родственника к пациенту по инвайт-коду.

**Роль:** relative

**Rate limit:** 5 попыток в час

**Тело запроса:**

```json
{
  "inviteCode": "INVITE123456"
}
```

**Ответ 200:** `{ "message": "Подключено" }`

**Ошибки:** 400 (невалидный код), 404 (пациент не найден), 429 (rate limit)

---

### DELETE /api/connections/:id

Отключение связи (status=inactive).

**Роль:** relative

---

## 7. Статистика и дашборд

### GET /api/stats/:patientId

Агрегированная статистика дисциплины.

**Роль:** patient (свой id), relative (подключённый), doctor (подключённый), admin

**Query:** `?period=7d` | `14d` | `30d` | `90d`

**Ответ 200:**

```json
{
  "data": {
    "disciplinePercent": 85,
    "avgDelayMinutes": 5,
    "currentStreak": 7,
    "recordStreak": 14,
    "dailyTrend": []
  }
}
```

---

### GET /api/calendar/:patientId

Календарь дисциплины по дням.

**Query:** `?month=2026-02`

**Роль:** patient, relative, doctor, admin (с доступом к пациенту)

---

## 8. Дневник самочувствия

### GET /api/journal

Список записей дневника.

**Роль:** patient

**Query:** `?page=1&limit=30`

---

### POST /api/journal

Создание/обновление записи за день.

**Роль:** patient

**Тело запроса:**

```json
{
  "date": "2026-02-24",
  "mood": 4,
  "pain": 2,
  "sleep": 3,
  "energy": 4,
  "notes": "Текст"
}
```

---

### POST /api/journal/sync

Пакетная синхронизация офлайн-записей дневника.

**Роль:** patient

---

## 9. AI и аналитика

### POST /api/ai/chat

Стриминг-чат с AI-помощником (DeepSeek).

**Роль:** patient, relative

**Rate limit:** 20 запросов / 15 минут

**Тело запроса:**

```json
{
  "message": "Как принимать аспирин?"
}
```

**Ответ:** ReadableStream (SSE), события: `chunk`, `done`

---

### GET /api/analysis/:patientId

AI-анализ корреляций (приём лекарств ↔ самочувствие).

**Роль:** patient, relative, doctor, admin (с доступом)

**Rate limit:** 3 запроса / час

**Кэш:** Redis 24 часа

---

### GET /api/reports/:patientId

Генерация PDF-отчёта для врача.

**Роль:** patient, relative, doctor, admin (с доступом)

**Query:** `?period=30d`

**Rate limit:** 5 запросов / час

**Ответ:** `application/pdf` (blob)

---

## 10. Обратная связь

### POST /api/feedback

Отзыв о лекарстве (эффективность, побочки).

**Роль:** patient

**Rate limit:** 10 запросов / час

**Тело запроса:**

```json
{
  "medicationId": "uuid",
  "effectivenessScore": 4,
  "sideEffects": ["тошнота"],
  "freeText": "Текст"
}
```

---

### GET /api/feedback/aggregate

Агрегированная аналитика по препаратам (для админа/фарма).

**Роль:** admin

---

## 11. Прочее

### GET /api/doctor/patients

Список пациентов врача с дисциплиной.

**Роль:** doctor

---

### POST /api/profile/onboarding

Отметка прохождения онбординга.

**Роль:** patient

**Тело запроса:** `{ "done": true }`

---

### POST /api/push/subscribe

Подписка на Web Push уведомления.

**Роль:** patient, relative

**Тело запроса:** VAPID subscription object

---

### GET /api/admin/patients/search

Поиск пациентов по имени (админ).

**Роль:** admin

**Query:** `?q=Иван`

---

## Коды ответов

| Код | Описание                |
| --- | ----------------------- |
| 200 | OK                      |
| 201 | Created                 |
| 400 | Bad Request (валидация) |
| 401 | Unauthorized            |
| 403 | Forbidden               |
| 404 | Not Found               |
| 409 | Conflict (дубликат)     |
| 429 | Too Many Requests       |
| 503 | Service Unavailable     |

---

## Ссылки

- [project.md](project.md) — архитектура и стек
- [deployment.md](deployment.md) — деплой и переменные окружения
