# syntax=docker/dockerfile:1
# -----------------------------------------------------------------------------
# Stage 1: Dependencies
# -----------------------------------------------------------------------------
FROM node:20-slim AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# -----------------------------------------------------------------------------
# Stage 2: Build (Prisma generate + Next.js build)
# -----------------------------------------------------------------------------
FROM node:20-slim AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma generate (uses DATABASE_URL at build time for schema validation only)
ENV PRISMA_GENERATE_DATABASE_URL="postgresql://placeholder:placeholder@placeholder:5432/placeholder"
ENV DATABASE_URL="${PRISMA_GENERATE_DATABASE_URL}"

ARG NEXT_PUBLIC_BASE_URL=https://onlinesafetysolutions.co.za
ARG SITE_URL=https://onlinesafetysolutions.co.za
ARG CACHE_BUST=1
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV SITE_URL=$SITE_URL
ENV CACHE_BUST=$CACHE_BUST

RUN echo "Build cache bust: $CACHE_BUST"

RUN npx prisma generate
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 3: Runner (standalone output only)
# -----------------------------------------------------------------------------
FROM node:20-slim AS runner
RUN apt-get update -y && apt-get install -y --no-install-recommends \
  openssl ca-certificates \
  fonts-liberation \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libdrm2 \
  libgbm1 \
  libglib2.0-0 \
  libnspr4 \
  libnss3 \
  libpango-1.0-0 \
  libx11-6 \
  libxcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxkbcommon0 \
  libxrandr2 \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 --gid nodejs nextjs

# Copy standalone build output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Prisma client, CLI, and schema (needed for migrate + runtime)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma/engines ./node_modules/@prisma/engines
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@sparticuz ./node_modules/@sparticuz
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/puppeteer-core ./node_modules/puppeteer-core
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV HOME=/tmp
ENV USE_BUNDLED_CHROMIUM=1

# Run migrations then start (override CMD in compose to skip migrate if DB runs elsewhere)
CMD ["node", "server.js"]
