# OC Plaza Liberec - Dockerfile
# Optimalizovaný pro Node.js 22 a Nuxt 3 SSR

# === Build stage ===
FROM node:22-alpine AS builder

WORKDIR /app

# Instalace závislostí pro build
RUN apk add --no-cache python3 make g++

# Kopírování package files
COPY package*.json ./

# Instalace závislostí
RUN npm ci

# Kopírování zdrojových souborů
COPY . .

# Build aplikace
RUN npm run build

# === Production stage ===
FROM node:22-alpine AS runner

WORKDIR /app

# Vytvoření non-root uživatele pro bezpečnost
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nuxtjs

# Kopírování pouze produkčních souborů
COPY --from=builder --chown=nuxtjs:nodejs /app/.output ./.output
COPY --from=builder --chown=nuxtjs:nodejs /app/package.json ./package.json

# Nastavení environment variables
ENV NODE_ENV=production
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

# Přepnutí na non-root uživatele
USER nuxtjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Spuštění aplikace
CMD ["node", ".output/server/index.mjs"]
