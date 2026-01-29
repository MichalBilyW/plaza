/**
 * Rate Limiting Utility
 * In-memory rate limiter pro ochranu proti brute-force útokům
 */

interface RateLimitEntry {
  count: number
  resetAt: number
  blockedUntil?: number
}

interface RateLimitConfig {
  windowMs: number      // Časové okno v ms
  maxAttempts: number   // Max pokusů v okně
  blockDurationMs: number // Délka blokace po překročení
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Čištění starých záznamů každých 5 minut
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now && (!entry.blockedUntil || entry.blockedUntil < now)) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

/**
 * Kontrola rate limitu
 * @returns true pokud je request povolen, false pokud je zablokován
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { allowed: boolean; retryAfter?: number; remaining: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  // Pokud je zablokovaný
  if (entry?.blockedUntil && entry.blockedUntil > now) {
    return {
      allowed: false,
      retryAfter: Math.ceil((entry.blockedUntil - now) / 1000),
      remaining: 0,
    }
  }

  // Pokud není záznam nebo vypršelo okno
  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    })
    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
    }
  }

  // Inkrementace počtu
  entry.count++

  // Překročen limit
  if (entry.count > config.maxAttempts) {
    entry.blockedUntil = now + config.blockDurationMs
    return {
      allowed: false,
      retryAfter: Math.ceil(config.blockDurationMs / 1000),
      remaining: 0,
    }
  }

  return {
    allowed: true,
    remaining: config.maxAttempts - entry.count,
  }
}

/**
 * Reset rate limitu pro klíč (po úspěšném přihlášení)
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key)
}

/**
 * Získání klíče pro rate limit z IP adresy
 */
export function getRateLimitKey(event: H3Event, prefix: string): string {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  return `${prefix}:${ip}`
}

// Predefinované konfigurace
export const RATE_LIMIT_CONFIGS = {
  // Login: 5 pokusů za 15 minut, blokace 30 minut
  login: {
    windowMs: 15 * 60 * 1000,
    maxAttempts: 5,
    blockDurationMs: 30 * 60 * 1000,
  },
  // Password reset: 3 pokusy za hodinu, blokace 1 hodina
  passwordReset: {
    windowMs: 60 * 60 * 1000,
    maxAttempts: 3,
    blockDurationMs: 60 * 60 * 1000,
  },
  // API obecně: 100 requestů za minutu
  api: {
    windowMs: 60 * 1000,
    maxAttempts: 100,
    blockDurationMs: 60 * 1000,
  },
} as const

import { H3Event, getRequestIP } from 'h3'
