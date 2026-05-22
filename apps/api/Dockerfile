FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json

RUN npm install --workspace api

COPY apps/api ./apps/api

# Prisma Client must be generated before TypeScript compile (Render/Docker build).
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/stock_watch"
RUN npm run prisma:generate --workspace api
RUN npm run build --workspace api

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json

RUN npm install --workspace api --omit=dev

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/prisma.config.ts ./apps/api/prisma.config.ts
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 4000

CMD ["sh", "-c", "cd /app/apps/api && npx prisma migrate deploy && node dist/src/server.js"]
