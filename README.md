# mona-admin

Next.js админка для проекта **mona** (Mono Electric). Постепенная замена Django Jazzmin admin: см. `MEMORY.md` родительского репозитория и [`project-admin-migration`](../mona/) в основном бэкенде.

## Stack

- Next.js 16 (App Router) + React 19
- TypeScript, Tailwind v4, shadcn/ui
- TanStack Query, react-hook-form + zod
- axios JWT client с автоматическим refresh-rotation
- OpenAPI → TS типы через `openapi-typescript`

## Backend

Бэкенд живёт в соседнем репо `../mona`. Эндпоинты под Next.js admin собраны в `core/admin_api/` и доступны под префиксом `/api/admin/`:

| Endpoint                                  | Описание                       |
| ----------------------------------------- | ------------------------------ |
| `POST /api/admin/auth/token/`             | Получить access + refresh JWT  |
| `POST /api/admin/auth/token/refresh/`     | Обновить access (с ротацией)   |
| `GET  /api/admin/auth/me/`                | Профиль текущего staff-юзера   |
| `GET  /api/admin/schema/`                 | OpenAPI schema (для `gen:types`) |
| `GET  /api/admin/docs/`                   | Swagger UI                     |
| `GET/POST/PUT/PATCH/DELETE /contact-settings/` | CRUD пилотной модели       |

## Запуск

1. Скопировать env и проверить URL backend:

   ```bash
   cp .env.example .env.local
   # NEXT_PUBLIC_API_BASE_URL=http://localhost:8010
   ```

2. Установить и запустить:

   ```bash
   pnpm install
   pnpm dev
   ```

3. Открыть http://localhost:3000 — редирект на `/login`. Логин/пароль — любой staff-пользователь Django (`./manage.py createsuperuser` в `../mona`).

## Генерация TS-типов из OpenAPI

Когда backend поднят, выполнить:

```bash
pnpm gen:types
```

Создаст `src/lib/api/schema.d.ts` со всеми моделями и операциями `/api/admin/*`. Сейчас не подключено в авто-сериализаторы (пилот использует ручные типы в `src/lib/api/`), будет использовано как источник правды для следующих моделей.

## Структура

```
src/
├── app/
│   ├── (admin)/                  # protected route group
│   │   ├── layout.tsx            # AuthGuard + Sidebar + UserMenu
│   │   └── contact-settings/page.tsx
│   ├── login/page.tsx
│   ├── layout.tsx                # QueryProvider, ThemeProvider, Toaster
│   └── page.tsx                  # redirect → /contact-settings
├── components/
│   ├── auth/login-form.tsx
│   ├── contact-settings/         # таблица + форма пилота
│   ├── layout/                   # sidebar, user menu, auth guard
│   ├── providers/                # query + theme
│   └── ui/                       # shadcn
└── lib/
    ├── api/                      # axios client, tokens, эндпоинты
    └── hooks/                    # TanStack Query обёртки
```

## Auth flow

- Токены лежат в `localStorage` (`mona-admin.access`, `mona-admin.refresh`).
- Все запросы идут через `src/lib/api/client.ts` — axios с двумя interceptors:
  - request: подставляет `Authorization: Bearer …`
  - response: при 401 один раз пытается обновить токен через `/auth/token/refresh/`, ставит новый access + refresh (`ROTATE_REFRESH_TOKENS=True` в Django), повторяет исходный запрос. Если refresh тоже 401 — чистит localStorage и редиректит на `/login`.
- Concurrent refresh защищён `refreshInFlight` Promise — параллельные 401 ждут одного запроса refresh.
- `(admin)/layout.tsx` оборачивается в `AuthGuard`, который проверяет наличие токенов на клиенте и грузит `/auth/me/`.

**Trade-off:** middleware-guard (через cookies) не используется — Next.js middleware читает только cookies, а токены сидят в localStorage. Для пилота client-side guard достаточно; перейти на cookies можно при необходимости SSR-страниц.

## Деплой

`app.monoelectric.uz` — отдельный домен от Django backend. CORS уже разрешён в `mona/settings/base.py`. Деплой через standalone Next.js build + nginx / Vercel — выбор позже.
