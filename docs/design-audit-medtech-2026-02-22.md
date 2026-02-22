<!--
  @file: design-audit-medtech-2026-02-22.md
  @description: Аудит дизайна всех страниц MemoMed AI под стиль MedTech
  @created: 2026-02-22
-->

# Аудит дизайна MemoMed AI — MedTech стиль

> Дата: 2026-02-22  
> Эталон: страница `/admin` (смелый MedTech, технологичные иконки, цветовые плашки)  
> Цель: унифицировать все страницы под MedTech, адаптивность mobile + desktop  
> **План переделки**: [plan-redesign-admin-style-2026-02-22.md](plan-redesign-admin-style-2026-02-22.md)

---

## 1. Эталонный шаблон: Dashboard

### Структура dashboard (образец)

```
┌─────────────────────────────────────────┐
│ Hero: градиент + часы + NextMedicationCard │
│ (DynamicBackground, LiveClock)          │
├─────────────────────────────────────────┤
│ Панель: rounded-t-[2rem], shadow        │
│ - TakeMedicationButton / success-card   │
│ - Быстрые ссылки (grid 3 cols)          │
│ - CTA "Добавить лекарство"              │
└─────────────────────────────────────────┘
```

### Ключевые паттерны

- `min-h-[calc(100vh-4rem)]` — высота без header
- `max-w-lg mx-auto` — центрирование контента
- `med-animate` + `animationDelay` — поочерёдное появление
- `med-card`, `med-btn-primary` — единые компоненты

---

## 2. Инвентаризация страниц

### 2.1 Пациент (patient)

| Страница           | Путь                     | Текущее состояние  | Проблемы                                 | Приоритет |
| ------------------ | ------------------------ | ------------------ | ---------------------------------------- | --------- |
| Dashboard          | `/dashboard`             | ✅ Эталон          | —                                        | —         |
| Лекарства          | `/medications`           | med-page, med-card | Пустое состояние без hero, кнопки inline | Средний   |
| Добавить лекарство | `/medications/add`       | —                  | Проверить форму                          | Низкий    |
| Редактировать      | `/medications/[id]/edit` | —                  | Как add                                  | Низкий    |
| Дневник            | `/journal`               | med-page, med-card | Пагинация без med-btn, text-sm в шкалах  | Средний   |
| Запись дня         | `/journal/[date]`        | —                  | Форма journal-form                       | Низкий    |
| Статистика         | `/stats`                 | med-page           | Карточки PDF без градиентов, grid 1/3    | Средний   |
| История            | `/history`               | —                  | Пагинация, фильтры                       | Средний   |
| Отзывы             | `/feedback`              | —                  | FeedbackForm                             | Низкий    |
| Настройки          | `/settings`              | med-page, med-card | Секции без hero-структуры                | Низкий    |
| Мой код            | `/invite`                | —                  | CopyInviteCode                           | Низкий    |

### 2.2 Родственник (relative)

| Страница     | Путь             | Текущее состояние  | Проблемы                                           | Приоритет |
| ------------ | ---------------- | ------------------ | -------------------------------------------------- | --------- |
| Лента        | `/feed`          | med-page           | Пустое состояние без med-card glass, кнопки inline | Высокий   |
| Подключиться | `/connect`       | med-page, med-card | Список пациентов — обычные border, не med-card     | Средний   |
| Пациент      | `/patients/[id]` | —                  | Вкладки, календарь                                 | Средний   |
| Аккаунт      | `/account`       | —                  | Как settings                                       | Низкий    |

### 2.3 Врач (doctor)

| Страница          | Путь                    | Текущее состояние | Проблемы                             | Приоритет |
| ----------------- | ----------------------- | ----------------- | ------------------------------------ | --------- |
| Пациенты          | `/doctor/dashboard`     | med-page          | Поиск, фильтры — обычные input/links | Средний   |
| Подключить        | `/doctor/connect`       | —                 | Форма инвайт-кода                    | Низкий    |
| Карточка пациента | `/doctor/patients/[id]` | —                 | Вкладки, hero                        | Средний   |
| Настройки         | `/doctor/settings`      | —                 | Как patient settings                 | Низкий    |

### 2.4 Админ (admin)

| Страница     | Путь                 | Текущее состояние           | Проблемы                                    | Приоритет |
| ------------ | -------------------- | --------------------------- | ------------------------------------------- | --------- |
| Обзор        | `/admin`             | bg-gray-50, border-gray-100 | Не MedTech: gray вместо slate, нет med-card | Высокий   |
| Пользователи | `/admin/users`       | —                           | Таблицы, пагинация                          | Средний   |
| Лекарства    | `/admin/medications` | —                           | —                                           | Средний   |
| Связи        | `/admin/connections` | —                           | —                                           | Средний   |
| Аудит        | `/admin/audit`       | —                           | —                                           | Средний   |
| Промпты      | `/admin/prompts`     | —                           | PromptEditor                                | Низкий    |
| LLM          | `/admin/llm`         | —                           | —                                           | Низкий    |
| Статистика   | `/admin/stats`       | —                           | —                                           | Средний   |
| Отчёты       | `/admin/reports`     | —                           | —                                           | Средний   |

### 2.5 Auth и общие

| Страница    | Путь          | Текущее состояние       | Проблемы                | Приоритет |
| ----------- | ------------- | ----------------------- | ----------------------- | --------- |
| Лендинг     | `/`           | landing-gradient, bento | ✅ Соответствует        | —         |
| Вход        | `/login`      | Двухколоночный lg       | bg-[#F0F5FA] vs F0F4F8  | Низкий    |
| Регистрация | `/register`   | Одноколоночный          | bg-[#F0F5FA]            | Низкий    |
| Dev-login   | `/dev-login`  | —                       | Только dev              | —         |
| Чат         | `/chat`       | h-[calc(...)]           | Минималистичная обёртка | Низкий    |
| Онбординг   | `/onboarding` | —                       | OnboardingWizard        | Низкий    |
| Privacy     | `/privacy`    | —                       | Текстовая страница      | Низкий    |
| 404         | `not-found`   | —                       | —                       | Низкий    |

---

## 3. Layout-проблемы

| Layout   | Файл                    | Проблема                                   | Рекомендация                                          |
| -------- | ----------------------- | ------------------------------------------ | ----------------------------------------------------- |
| Patient  | `(patient)/layout.tsx`  | `bg-white` — не совпадает с dashboard hero | Оставить: main контент на белом, hero — свой градиент |
| Relative | `(relative)/layout.tsx` | `bg-white`                                 | Аналогично                                            |
| Doctor   | `(doctor)/layout.tsx`   | `bg-white`                                 | Аналогично                                            |
| Admin    | `(admin)/layout.tsx`    | `bg-gray-50`, sidebar `border-gray-100`    | Заменить на `bg-[#F0F4F8]`, `border-slate-200`        |

---

## 4. Компоненты — проверка MedTech

| Компонент                   | Проблемы                     | Действие                  |
| --------------------------- | ---------------------------- | ------------------------- |
| Header                      | ✅                           | —                         |
| BottomNav                   | ✅                           | —                         |
| LoginForm, RegisterForm     | Проверить med-input, med-btn | Убедиться в использовании |
| MedicationCard              | ✅ med-card-accent           | —                         |
| NextMedicationCard          | ✅                           | —                         |
| LiveFeed, FeedItem          | text-sm, min-h               | Увеличить touch targets   |
| StatsCards, DisciplineChart | —                            | Проверить цвета из vars   |
| CalendarView                | —                            | —                         |
| AiChat, MessageBubble       | —                            | —                         |
| OnboardingWizard            | —                            | —                         |

---

## 5. План доработок (по приоритету)

> **Статус**: Все фазы выполнены 2026-02-22

### Фаза 1: Критичные (Feed, Admin) ✅

1. **Feed (`/feed`)**
   - Пустое состояние: med-card, градиентная иконка, med-btn-primary
   - Блок «Обновляется в реальном времени»: med-badge-info
   - Адаптив: grid для будущих виджетов

2. **Admin layout и главная**
   - `bg-gray-50` → `bg-[#F0F4F8]`
   - `border-gray-100` → `border-slate-200`
   - Карточки метрик: med-card или med-stat
   - Быстрые ссылки: как QUICK_LINKS на dashboard (grid, градиентные иконки)

### Фаза 2: Средний приоритет ✅

3. **Medications** — hero-подобный заголовок, empty state как dashboard
4. **Connect (relative)** — med-card для списка пациентов, единые кнопки
5. **Journal** — med-btn для пагинации, консистентные карточки
6. **Stats** — карточки PDF в стиле quick-links (градиент, hover)
7. **Doctor dashboard** — med-card для карточек пациентов, фильтры как pills
8. **Doctor patients/[id]** — hero-карточка, вкладки в med-card

### Фаза 3: Низкий приоритет ✅

9. **Auth** — bg `#F0F4F8` вместо `#F0F5FA`
10. **Settings, Account** — визуально уже ок, мелкие правки
11. **History, Feedback, Invite** — проверить med-\* классы
12. **Admin подстраницы** — таблицы, пагинация в med-стиле

---

## 6. Чеклист адаптивности (каждая страница)

- [ ] Mobile: `px-4` или `px-6`, `pb-20` если BottomNav
- [ ] Desktop: `md:pb-0`, `max-w-lg` или `max-w-2xl` по контексту
- [ ] Grid: `grid-cols-2` или `grid-cols-3` на mobile, `md:grid-cols-3` или `md:grid-cols-4` на desktop
- [ ] Touch targets: кнопки и ссылки min 48×48px
- [ ] Текст: заголовки 24px+, основной 18px, вторичный не менее 14px

---

## 7. Ссылки

- [globals.css](../src/app/globals.css) — токены и утилиты
- [Dashboard](<../src/app/(patient)/dashboard/page.tsx>) — эталон
- [project.md](project.md) § 9 — дизайн-система
- [audit-2026-02-22.md](audit-2026-02-22.md) — предыдущий аудит
