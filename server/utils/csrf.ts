/**
 * CSRF Protection Utility
 * Double Submit Cookie pattern
 */

import type { H3Event } from 'h3'
import { getCookie, setCookie, getHeader } from 'h3'
import crypto from 'crypto'

const CSRF_COOKIE_NAME = 'csrf_token'
const CSRF_HEADER_NAME = 'x-csrf-token'

/**
 * Generování CSRF tokenu
 */
export function generateCsrfToken(): string {
	return crypto.randomBytes(32).toString('hex')
}

/**
 * Nastavení CSRF cookie
 */
export function setCsrfCookie(event: H3Event): string {
	const token = generateCsrfToken()

	setCookie(event, CSRF_COOKIE_NAME, token, {
		httpOnly: false, // Musí být čitelný z JS pro header
		secure: process.env.NUXT_COOKIE_SECURE === 'false' ? false : process.env.NODE_ENV === 'production',
		sameSite: 'lax', // lax pro lepší kompatibilitu
		maxAge: 60 * 60 * 24, // 24 hodin
		path: '/',
	})

	return token
}

/**
 * Získání CSRF tokenu z cookie
 */
export function getCsrfFromCookie(event: H3Event): string | null {
	return getCookie(event, CSRF_COOKIE_NAME) || null
}

/**
 * Získání CSRF tokenu z headeru
 */
export function getCsrfFromHeader(event: H3Event): string | null {
	return getHeader(event, CSRF_HEADER_NAME) || null
}

/**
 * Validace CSRF tokenu
 * Porovnává token z cookie s tokenem z headeru
 */
export function validateCsrfToken(event: H3Event): boolean {
	const cookieToken = getCsrfFromCookie(event)
	const headerToken = getCsrfFromHeader(event)

	if (!cookieToken || !headerToken) {
		return false
	}

	// Constant-time comparison pro ochranu proti timing attacks
	try {
		return crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken))
	} catch {
		return false
	}
}

/**
 * Middleware pro CSRF ochranu
 * Používat pro POST/PUT/PATCH/DELETE requesty
 */
export function requireCsrf(event: H3Event): void {
	const method = event.method?.toUpperCase()

	// CSRF není potřeba pro safe methods
	if (['GET', 'HEAD', 'OPTIONS'].includes(method || '')) {
		return
	}

	if (!validateCsrfToken(event)) {
		throw createError({
			statusCode: 403,
			statusMessage: 'Neplatný CSRF token',
			message: 'CSRF validation failed',
		})
	}
}
