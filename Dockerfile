# Dockerfile — многоэтапная сборка Next.js приложения
# Этап 1: база (Alpine для минимального размера)
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# Этап 2: только production-зависимости
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Этап 3: все зависимости для сборки
FROM base AS build-deps
COPY package*.json ./
RUN npm ci && npm cache clean --force

# Этап 4: компиляция TypeScript и сборка Next.js
FROM build-deps AS builder
COPY . .
COPY --from=build-deps /app/node_modules ./node_modules
# Генерируем Prisma Client перед сборкой
RUN npx prisma generate --config prisma.config.ts || npx prisma generate
RUN npm run build

# Этап 5: production-образ (минимальный)
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Создаём непривилегированного пользователя
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Копируем только необходимые файлы из builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
