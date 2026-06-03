# Деплой mona-admin

Mona-admin крутится **рядом со старым Django admin на том же домене**, под суб-путём `/new/`:

| URL                                            | Что                                              |
| ---------------------------------------------- | ------------------------------------------------ |
| `https://aksiya.monoelectric.uz/`              | Старый Django admin (Jazzmin)                    |
| `https://aksiya.monoelectric.uz/api/admin/`    | REST API (используется обеими админками)         |
| `https://aksiya.monoelectric.uz/new/`          | Новый Next.js admin                              |

## Артефакты

| Файл                                       | Назначение                                                                          |
| ------------------------------------------ | ----------------------------------------------------------------------------------- |
| `Dockerfile`                               | Multi-stage build (deps → builder → runner), Next.js standalone                     |
| `.dockerignore`                            | Исключения для контекста сборки                                                     |
| `next.config.ts`                           | `output: 'standalone'`, `basePath` из `NEXT_PUBLIC_BASE_PATH`                       |
| `.env.production`                          | Дефолт `NEXT_PUBLIC_API_BASE_URL`                                                   |
| `docker-compose.snippet.yml`               | Сервис для подключения в `mona/docker-compose.prod.yml`                             |
| `deploy/nginx-location-new.conf`           | Snippet с `location /new/` для существующего server-блока nginx                     |
| `src/lib/base-path.ts`                     | Helper'ы для basePath-aware редиректов (использовано в client.ts и auth-guard.tsx) |

## Алгоритм

### 1. Локально проверить

```bash
cd mona-admin
pnpm install
NEXT_PUBLIC_BASE_PATH=/new pnpm build         # под прод-конфиг
```

### 2. Запушить на GitHub

```bash
git add .
git commit -m "deploy: docker artifacts + basePath /new"
git push origin main
```

### 3. На сервере — клонировать (репо публичный)

```bash
ssh root@68.183.75.160
cd /opt
git clone https://github.com/STQT/mono-admin.git mona-admin
cd mona-admin
```

(Уже клонирован — `git pull`.)

### 4. Собрать и запустить контейнер

**Вариант A — отдельный контейнер**:

```bash
docker build \
    --build-arg NEXT_PUBLIC_API_BASE_URL=https://aksiya.monoelectric.uz \
    --build-arg NEXT_PUBLIC_BASE_PATH=/new \
    -t mona-admin:latest .

docker run -d --restart unless-stopped \
    --name mona-admin \
    -p 5990:3000 \
    mona-admin:latest
```

**Вариант B — в `mona/docker-compose.prod.yml`**: скопировать `docker-compose.snippet.yml` в раздел `services:`, поправить `build.context` относительно compose-файла, затем:

```bash
cd /opt/mona
docker compose -f docker-compose.prod.yml up -d --build mona-admin
```

### 5. Настроить nginx

Найти SSL server-блок `aksiya.monoelectric.uz` (либо `/etc/nginx/sites-available/...` для хостового nginx, либо `mona/nginx/nginx.conf` для контейнерного). Вставить **внутри** этого блока содержимое `deploy/nginx-location-new.conf`. Корневой `location /` для Django оставить как был.

```bash
sudo nginx -t && sudo systemctl reload nginx
# либо для docker-nginx:
docker compose exec nginx nginx -t && docker compose exec nginx nginx -s reload
```

### 6. Smoke-test

```bash
curl -sI http://localhost:5990/new/login            # контейнер напрямую
curl -sI https://aksiya.monoelectric.uz/new/login   # через nginx
```

Открыть в браузере `https://aksiya.monoelectric.uz/new/` → редирект на `/new/login` → залогиниться.

## Обновление

```bash
cd /opt/mona-admin
git pull
git log --oneline -1   # убедиться, что pull дотянул новый коммит
docker build \
    --build-arg NEXT_PUBLIC_API_BASE_URL=https://aksiya.monoelectric.uz \
    --build-arg NEXT_PUBLIC_BASE_PATH=/new \
    -t mona-admin:latest .
# ВАЖНО: пересоздать контейнер, а НЕ `docker restart` —
# restart перезапускает старый контейнер на СТАРОМ образе и новый билд не применяется.
docker stop mona-admin && docker rm mona-admin
docker run -d --restart unless-stopped \
    --name mona-admin \
    -p 5990:3000 \
    mona-admin:latest
```

Если используется compose (Вариант B):

```bash
cd /opt/mona
docker compose -f docker-compose.prod.yml up -d --build --force-recreate mona-admin
```

`--build` обязателен — `NEXT_PUBLIC_*` инлайнятся при сборке. `docker restart`
НЕ применяет новый образ — нужен `stop && rm && run` (или `up --force-recreate`).

## Точки внимания

- **basePath требует пересборки** при изменении. Значение в JS-бандле.
- **Все клиентские редиректы знают про basePath**: Next router — автоматически, `window.location.assign(...)` — через helper `withBasePath()` из `src/lib/base-path.ts`.
- **CORS не нужен**: frontend и backend на одном домене.
- **Корневой location /** в nginx остаётся за Django.
- **Media с бэкенда**: гифты/баннеры лежат на `https://aksiya.monoelectric.uz/media/...`, allowlist для `next/image` уже прописан в `next.config.ts`.

## Чек после первого деплоя

- [ ] `https://aksiya.monoelectric.uz/` — открывается старый Django admin (не сломали)
- [ ] `https://aksiya.monoelectric.uz/new/login` — 200, форма логина
- [ ] Логин под staff-юзером → `/new/dashboard` с цифрами
- [ ] Sidebar по permissions (callcenter видит меньше пунктов)
- [ ] Скачивание ZIP/Excel в `/new/qrcode-generations/`
- [ ] Media гифтов в `/new/gifts/` грузится
- [ ] Toggle темы Light/Dark/System
