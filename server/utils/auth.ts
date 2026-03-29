/**
 * JWT Authentication Utilities
 * S podporou refresh tokenů a session tracking
 */

import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import type { H3Event } from 'h3'
import { getCookie, setCookie, deleteCookie, getHeader, getRequestIP } from 'h3'
import type { AuthUser, UserRole } from '@/shared/types'
import { createUnauthorizedError, createForbiddenError } from './errors'

// ==========================================
// TYPES
// ==========================================

interface JwtPayload {
	id: string
	email: string
	name: string
	role: UserRole
	sessionId: string
	iat?: number
	exp?: number
}

interface _TokenPair {
	accessToken: string
	refreshToken: string
}

// ==========================================
// PASSWORD HASHING
// ==========================================

const SALT_ROUNDS = 12

export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	return bcrypt.compare(password, hash)
}

// ==========================================
// TOKEN CONFIG
// ==========================================

function getJwtConfig() {
	const config = useRuntimeConfig()
	return {
		secret: config.jwtSecret,
		accessTokenExpiresIn: '7d', // 7 dní pro access token
		refreshTokenExpiresIn: '7d', // Dlouhá expirace pro refresh token
		refreshTokenExpiresMs: 7 * 24 * 60 * 60 * 1000, // 7 dní v ms
	}
}

// ==========================================
// ACCESS TOKEN
// ==========================================

export function generateAccessToken(user: AuthUser, sessionId: string): string {
	const { secret, accessTokenExpiresIn } = getJwtConfig()

	const payload: JwtPayload = {
		id: user.id,
		email: user.email,
		name: user.name,
		role: user.role,
		sessionId,
	}

	return jwt.sign(payload, secret, { expiresIn: accessTokenExpiresIn })
}

export function verifyAccessToken(token: string): JwtPayload {
	const { secret } = getJwtConfig()
	return jwt.verify(token, secret) as JwtPayload
}

// ==========================================
// REFRESH TOKEN
// ==========================================

export function generateRefreshToken(): string {
	return crypto.randomBytes(64).toString('hex')
}

export function getRefreshTokenExpiry(): Date {
	const { refreshTokenExpiresMs } = getJwtConfig()
	return new Date(Date.now() + refreshTokenExpiresMs)
}

// ==========================================
// COOKIE MANAGEMENT
// ==========================================

const ACCESS_TOKEN_COOKIE = 'access_token'
const REFRESH_TOKEN_COOKIE = 'refresh_token'

const COOKIE_BASE_OPTIONS = {
	httpOnly: true,
	// NUXT_COOKIE_SECURE=false pro HTTP testování, jinak secure v produkci
	secure:
		process.env.NUXT_COOKIE_SECURE === 'false' ? false : process.env.NODE_ENV === 'production',
	sameSite: 'lax' as const, // 'lax' místo 'strict' pro lepší kompatibilitu
	path: '/',
}

export function setAuthCookies(event: H3Event, accessToken: string, refreshToken: string): void {
	// Access token - 7 dní
	setCookie(event, ACCESS_TOKEN_COOKIE, accessToken, {
		...COOKIE_BASE_OPTIONS,
		maxAge: 7 * 24 * 60 * 60, // 7 dní
	})

	// Refresh token - 7 dní
	setCookie(event, REFRESH_TOKEN_COOKIE, refreshToken, {
		...COOKIE_BASE_OPTIONS,
		maxAge: 7 * 24 * 60 * 60, // 7 dní
	})
}

export function clearAuthCookies(event: H3Event): void {
	deleteCookie(event, ACCESS_TOKEN_COOKIE)
	deleteCookie(event, REFRESH_TOKEN_COOKIE)
}

export function getAccessToken(event: H3Event): string | null {
	// Cookie first
	const cookieToken = getCookie(event, ACCESS_TOKEN_COOKIE)
	if (cookieToken) return cookieToken

	// Authorization header fallback
	const authHeader = getHeader(event, 'Authorization')
	if (authHeader?.startsWith('Bearer ')) {
		return authHeader.slice(7)
	}

	return null
}

export function getRefreshTokenFromCookie(event: H3Event): string | null {
	return getCookie(event, REFRESH_TOKEN_COOKIE) || null
}

// ==========================================
// SESSION INFO
// ==========================================

export function getSessionInfo(event: H3Event): { userAgent?: string; ipAddress?: string } {
	return {
		userAgent: getHeader(event, 'User-Agent') || undefined,
		ipAddress: getRequestIP(event, { xForwardedFor: true }) || undefined,
	}
}

// ==========================================
// AUTH HELPERS FOR API ROUTES
// ==========================================

/**
 * Získání aktuálního uživatele z requestu
 * Vrací null pokud není přihlášen (nevyhazuje chybu)
 */
export function getCurrentUser(event: H3Event): (AuthUser & { sessionId: string }) | null {
	const token = getAccessToken(event)
	if (!token) {
		return null
	}

	try {
		const payload = verifyAccessToken(token)
		return {
			id: payload.id,
			email: payload.email,
			name: payload.name,
			role: payload.role,
			sessionId: payload.sessionId,
		}
	} catch {
		return null
	}
}

/**
 * Vyžaduje přihlášeného uživatele
 * Vyhazuje chybu pokud není přihlášen
 */
export function requireAuth(event: H3Event): AuthUser & { sessionId: string } {
	const user = getCurrentUser(event)
	if (!user) {
		throw createUnauthorizedError()
	}
	return user
}

/**
 * Vyžaduje uživatele s konkrétní rolí
 */
export function requireRole(event: H3Event, roles: UserRole[]): AuthUser & { sessionId: string } {
	const user = requireAuth(event)
	if (!roles.includes(user.role)) {
		throw createForbiddenError()
	}
	return user
}

export function requireSuperAdmin(event: H3Event): AuthUser & { sessionId: string } {
	return requireRole(event, ['superadmin'])
}

/**
 * Vyžaduje admin roli
 */
export function requireAdmin(event: H3Event): AuthUser & { sessionId: string } {
	return requireRole(event, ['superadmin', 'admin'])
}

/**
 * Vyžaduje admin nebo editor roli
 */
export function requireEditor(event: H3Event): AuthUser & { sessionId: string } {
	return requireRole(event, ['superadmin', 'admin', 'editor'])
}

// ==========================================
// LEGACY SUPPORT (pro zpětnou kompatibilitu)
// ==========================================

/** @deprecated Use generateAccessToken instead */
export function generateToken(user: AuthUser): string {
	return generateAccessToken(user, 'legacy')
}

/** @deprecated Use verifyAccessToken instead */
export function verifyToken(token: string): JwtPayload {
	return verifyAccessToken(token)
}

/** @deprecated Use setAuthCookies instead */
export function setAuthCookie(event: H3Event, token: string): void {
	setCookie(event, ACCESS_TOKEN_COOKIE, token, {
		...COOKIE_BASE_OPTIONS,
		maxAge: 7 * 24 * 60 * 60,
	})
}

/** @deprecated Use clearAuthCookies instead */
export function clearAuthCookie(event: H3Event): void {
	clearAuthCookies(event)
}

/** @deprecated Use getAccessToken instead */
export function getTokenFromRequest(event: H3Event): string | null {
	return getAccessToken(event)
}
