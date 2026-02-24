<!--
  @file: plan-redesign-admin-style-2026-02-22.md
  @description: План переделки всех страниц в стиле /admin (MedTech)
  @created: 2026-02-22
-->

# План переделки страниц — стиль /admin

> Дата: 2026-02-22  
> **Эталон**: `/admin` — смелый MedTech, технологичные иконки, цветовые плашки  
> Цель: унифицировать все страницы под стиль админ-панели

---

## Эталонный стиль /admin

### Ключевые элементы

- **Карточки метрик**: `med-stat`, градиентные иконки (from-blue-500 to-blue-600 и т.д.), одинаковые размеры
- **Быстрые ссылки**: цветовые плашки (bg-blue-50, bg-emerald-50), градиентные иконки в квадратах
- **Иконки**: SVG outline-стиль из `admin-icons.tsx` / `nav-icons.tsx`, не эмодзи
- **Цвета**: slate вместо gray, #1565C0 primary, #0D1B2A текст
- **Отступы**: gap-4 lg:gap-5, p-5 sm:p-6, min-h для touch targets
- **Сайдбар**: компактный, иконки в квадратах, активный — градиент

### Компоненты

| Компонент                                                 | Описание                                |
| --------------------------------------------------------- | --------------------------------------- |
| `AdminPillIcon`, `AdminLinkIcon`, `AdminShieldIcon` и др. | Технологичные SVG-иконки                |
| `med-stat`, `med-stat-admin`                              | Карточки метрик с градиентными иконками |
| `med-card`                                                | Glassmorphism-карточки                  |
| `med-btn-primary`, `med-btn-secondary`                    | Кнопки                                  |

---

## Инвентаризация страниц для переделки

### Админ (admin) — эталон ✅

| Страница     | Путь                 | Статус    |
| ------------ | -------------------- | --------- |
| Обзор        | `/admin`             | ✅ Эталон |
| Пользователи | `/admin/users`       | ✅        |
| Лекарства    | `/admin/medications` | ✅ Иконки |
| Связи        | `/admin/connections` | ✅ Иконки |
| Аудит        | `/admin/audit`       | ✅ Иконки |
| Промпты      | `/admin/prompts`     | ✅ Иконки |
| LLM          | `/admin/llm`         | ✅ Иконки |
| Статистика   | `/admin/stats`       | ✅ Иконки |
| Отчёты       | `/admin/reports`     | ✅ Иконки |

### Пациент (patient)

| Страница   | Путь           | Статус                                |
| ---------- | -------------- | ------------------------------------- |
| Dashboard  | `/dashboard`   | ✅ Иконки (nav-icons)                 |
| Лекарства  | `/medications` | ✅ Пагинация, med-card                |
| Статистика | `/stats`       | ✅ ClipboardIcon                      |
| История    | `/history`     | ✅ Фильтры без эмодзи                 |
| Мой код    | `/invite`      | ✅ LockIcon, HeartPulseIcon, UserIcon |
| Чат        | `/chat`        | ✅ BotIcon                            |

### Родственник (relative)

| Страница     | Путь             | Статус                                              |
| ------------ | ---------------- | --------------------------------------------------- |
| Подключиться | `/connect`       | ✅ CheckIcon (connect-form)                         |
| Пациент      | `/patients/[id]` | ✅ AdminPillIcon, AdminCheckIcon, AlertTriangleIcon |
| Аккаунт      | `/account`       | ✅ Без эмодзи                                       |

### Врач (doctor)

| Страница          | Путь                    | Статус                   |
| ----------------- | ----------------------- | ------------------------ |
| Подключить        | `/doctor/connect`       | ✅ Без эмодзи            |
| Карточка пациента | `/doctor/patients/[id]` | ✅ Иконки, ClipboardIcon |
| Настройки         | `/doctor/settings`      | ✅ Без эмодзи            |

### Auth и общие

| Страница    | Путь          | Статус                                                                 |
| ----------- | ------------- | ---------------------------------------------------------------------- |
| Лендинг     | `/`           | ✅ SVG-иконки                                                          |
| Вход        | `/login`      | ✅ bg #F0F4F8, med-card, SVG (PillIcon, HeartPulseIcon, ClipboardIcon) |
| Регистрация | `/register`   | ✅ bg #F0F4F8, med-card, LockIcon                                      |
| Онбординг   | `/onboarding` | ✅ SVG (HeartPulseIcon, PillIcon, CheckIcon, UsersIcon), градиенты     |
| Privacy     | `/privacy`    | ✅ LockIcon, med-card, slate                                           |

---

## План работ по фазам

### Фаза 1: Иконки (высокий приоритет)

1. **Заменить эмодзи на SVG-иконки** на всех страницах:
   - Dashboard: PillIcon, ClipboardIcon, BotIcon и т.д. (уже есть в nav-icons)
   - Feed, Connect, Medications — проверить использование
   - Admin подстраницы — проверить таблицы, фильтры
   - BottomNav, Header — проверить

2. **Унифицировать стиль иконок**:
   - Активные: градиентный фон (bg-gradient-to-br from-X to-Y)
   - Неактивные: outline, text-slate-500

### Фаза 2: Карточки и метрики (средний приоритет) ✅

3. **Patient: medications, stats, history** — ✅ stats: gray→slate, StatsCards/StatsDashboard
4. **Relative: feed, connect** — ✅ med-card, градиентные иконки; account: gray→slate
5. **Doctor: dashboard, patients** — ✅ settings: med-card, slate, med-page

### Фаза 3: Детали (низкий приоритет)

6. **Пагинация** — ✅ добавлена (admin/prompts, llm; patient/medications, feedback; relative/connect; feed «Показать ещё»)
7. **Admin подстраницы** — ✅ gray→slate (llm, prompts, stats, reports, prompt-editor)
8. **Auth** — ✅ bg #F0F4F8, med-card (login, register)
9. **Settings, Account** — ✅ секции в med-card
10. **Onboarding, Chat** — ✅ проверено (Chat: gray→slate в suggestions/input)

---

## Чеклист для каждой страницы

- [x] Эмодзи заменены на SVG-иконки (admin-icons или nav-icons)
- [x] Карточки: med-card или med-stat
- [x] Цвета: slate, #1565C0, #0D1B2A (не gray)
- [x] Отступы: gap-4 lg:gap-5, p-5 sm:p-6
- [x] Touch targets: min-h-[48px]
- [x] Градиентные иконки для активных/акцентных элементов
- [x] Одинаковые размеры карточек в grid (min-h)

---

## Ссылки

- [admin/page.tsx](<../src/app/(admin)/admin/page.tsx>) — эталон
- [admin-icons.tsx](../src/components/admin/admin-icons.tsx) — иконки админа
- [nav-icons.tsx](../src/components/shared/nav-icons.tsx) — общие иконки
- [globals.css](../src/app/globals.css) — med-\* классы
- [design-audit-medtech-2026-02-22.md](design-audit-medtech-2026-02-22.md) — предыдущий аудит
