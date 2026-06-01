# syntax=docker/dockerfile:1.7
# Multi-stage build для Next.js 16 (standalone output, pnpm).
# Финальный image — node:20-alpine с .next/standalone + .next/static + public.

# ──────────────────────────────────────────────────────────────────────────
# 1) deps — ставим зависимости (лежит отдельно для лучшего кеширования)
# ──────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# pnpm через corepack (включён в node:20 alpine)
RUN corepack enable && corepack prepare pnpm@10.13.1 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ──────────────────────────────────────────────────────────────────────────
# 2) builder — собираем продакшн-бандл
# ──────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.13.1 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* инлайнятся на этапе билда. Передаём через build-arg, чтобы
# одним image можно было обслужить разные окружения через docker-compose.
ARG NEXT_PUBLIC_API_BASE_URL=https://aksiya.monoelectric.uz
ARG NEXT_PUBLIC_BASE_PATH=/new
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_BASE_PATH=${NEXT_PUBLIC_BASE_PATH}
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm build

# ──────────────────────────────────────────────────────────────────────────
# 3) runner — минимальный runtime image
# ──────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Непривилегированный пользователь
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Standalone сервер + статика + public/
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
