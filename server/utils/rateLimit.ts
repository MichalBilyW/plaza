/**
 * Rate Limiting Utility
 * MongoDB-based rate limiter pro ochranu proti brute-force útokům.
 * Persists přes restarty aplikace, funguje při více instancích.
 */

import type { H3Event } from 'h3'
import { getRequestIP } from 'h3'
import { connectToDatabase } from '@/server/utils/db'
import { RateLimit } from '@/server/models'

interface RateLimitConfig {
	windowMs: number // Časové okno v ms
	maxAttempts: number // Max pokusů v okně
	blockDurationMs: number // Délka blokace po překročení
}

/**
 * Kontrola rate limitu
 */
export async function checkRateLimit(
	key: string,
	config: RateLimitConfig,
): Promise<{ allowed: boolean; retryAfter?: number; remaining: number }> {
	await connectToDatabase()

	const now = new Date()
	const entry = await RateLimit.findOne({ key })

	// Pokud je zablokovaný
	if (entry?.blockedUntil && entry.blockedUntil > now) {
		return {
			allowed: false,
			retryAfter: Math.ceil((entry.blockedUntil.getTime() - now.getTime()) / 1000),
			remaining: 0,
		}
	}

	// Pokud není záznam nebo vypršelo okno
	if (!entry || entry.resetAt < now) {
		const resetAt = new Date(now.getTime() + config.windowMs)
		await RateLimit.findOneAndUpdate(
			{ key },
			{ count: 1, resetAt, blockedUntil: null, expiresAt: resetAt },
			{ upsert: true },
		)
		return {
			allowed: true,
			remaining: config.maxAttempts - 1,
		}
	}

	// Inkrementace počtu
	const newCount = entry.count + 1

	// Překročen limit
	if (newCount > config.maxAttempts) {
		const blockedUntil = new Date(now.getTime() + config.blockDurationMs)
		await RateLimit.updateOne({ key }, { count: newCount, blockedUntil, expiresAt: blockedUntil })
		return {
			allowed: false,
			retryAfter: Math.ceil(config.blockDurationMs / 1000),
			remaining: 0,
		}
	}

	await RateLimit.updateOne({ key }, { count: newCount })
	return {
		allowed: true,
		remaining: config.maxAttempts - newCount,
	}
}

/**
 * Reset rate limitu pro klíč (po úspěšném přihlášení)
 */
export async function resetRateLimit(key: string): Promise<void> {
	await connectToDatabase()
	await RateLimit.deleteOne({ key })
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
