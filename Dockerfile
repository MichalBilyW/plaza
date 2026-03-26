# =============================================================================
# OC Plaza Liberec - Production Dockerfile
# Multi-stage build optimized for Nuxt 4 + Node.js
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Dependencies
# -----------------------------------------------------------------------------
FROM node:22-alpine AS deps

WORKDIR /app

# Install dependencies needed for native modules (bcrypt)
RUN apk add --no-cache python3 make g++

# Copy package files first (better layer caching)
COPY package.json package-lock.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci --include=dev

# -----------------------------------------------------------------------------
# Stage 2: Builder
# -----------------------------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for public runtime config (baked into client bundle)
ARG NUXT_PUBLIC_SITE_URL
ARG NUXT_PUBLIC_DEFAULT_LOCALE=cs

ENV NUXT_PUBLIC_SITE_URL=${NUXT_PUBLIC_SITE_URL}
ENV NUXT_PUBLIC_DEFAULT_LOCALE=${NUXT_PUBLIC_DEFAULT_LOCALE}
ENV NODE_ENV=production

# Build Nuxt application
RUN npm run build

# Prune dev dependencies after build
RUN npm prune --production

# -----------------------------------------------------------------------------
# Stage 3: Production Runner
# -----------------------------------------------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

# Security: Run as non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nuxtjs

# Install only runtime dependencies
RUN apk add --no-cache dumb-init

# Production environment
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Copy built application from builder
COPY --from=builder --chown=nuxtjs:nodejs /app/.output ./.output
COPY --from=builder --chown=nuxtjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nuxtjs:nodejs /app/package.json ./package.json

# Create uploads directory with correct permissions (Nitro serves from .output/public)
RUN mkdir -p /app/.output/public/uploads && chown -R nuxtjs:nodejs /app/.output/public/uploads

# Switch to non-root user
USER nuxtjs

# Expose port
EXPOSE 3000

# Health check (use 127.0.0.1 instead of localhost to force IPv4)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1

# Use dumb-init for proper signal handling (graceful shutdown)
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", ".output/server/index.mjs"]
