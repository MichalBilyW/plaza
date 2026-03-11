/**
 * POST /api/auth/refresh
 * Obnovení access tokenu pomocí refresh tokenu
 *
 * Implementuje token rotation - při každém refreshi se generuje nový refresh token
 */

import { connectToDatabase } from '@/server/utils/db'
import { User, Session } from '@/server/models'
import {
	generateAccessToken,
	generateRefreshToken,
	getRefreshTokenExpiry,
	setAuthCookies,
	getRefreshTokenFromCookie,
	clearAuthCookies,
	getSessionInfo,
} from '@/server/utils/auth'
import { setCsrfCookie } from '@/server/utils/csrf'
import { defineApiHandler, ApiError, ErrorCodes } from '@/server/utils/errors'

export default defineEventHandler(
	defineApiHandler(async (event) => {
		const refreshToken = getRefreshTokenFromCookie(event)

		if (!refreshToken) {
			throw new ApiError(ErrorCodes.UNAUTHORIZED, 'Refresh token chybí', 401)
		}

		await connectToDatabase()

		// Najít session
		const session = await Session.findOne({
			refreshToken,
			isValid: true,
			expiresAt: { $gt: new Date() },
		})

		if (!session) {
			// Potenciální token theft - invalidovat všechny sessions uživatele
			const compromisedSession = await Session.findOne({ refreshToken })
			if (compromisedSession) {
				await Session.updateMany({ userId: compromisedSession.userId }, { isValid: false })
			}

			clearAuthCookies(event)
			throw new ApiError(
				ErrorCodes.UNAUTHORIZED,
				'Neplatný nebo expirovaný refresh token',
				401,
			)
		}

		// Najít uživatele
		const user = await User.findOne({ _id: session.userId, isActive: true })

		if (!user) {
			session.isValid = false
			await session.save()
			clearAuthCookies(event)
			throw new ApiError(
				ErrorCodes.UNAUTHORIZED,
				'Uživatel neexistuje nebo je deaktivován',
				401,
			)
		}

		// Token rotation - vygenerovat nový refresh token
		const newRefreshToken = generateRefreshToken()
		const sessionInfo = getSessionInfo(event)

		// Aktualizovat session
		session.refreshToken = newRefreshToken
		session.expiresAt = getRefreshTokenExpiry()
		session.lastActivityAt = new Date()
		session.userAgent = sessionInfo.userAgent || session.userAgent
		session.ipAddress = sessionInfo.ipAddress || session.ipAddress
		await session.save()

		// Vygenerovat nový access token
		const authUser = {
			id: user._id.toString(),
			email: user.email,
			name: user.name,
			role: user.role,
		}

		const accessToken = generateAccessToken(authUser, session._id.toString())

		// Nastavit nové cookies
		setAuthCookies(event, accessToken, newRefreshToken)

		// Obnovit CSRF cookie
		const csrfToken = setCsrfCookie(event)

		return {
			user: {
				_id: user._id.toString(),
				email: user.email,
				name: user.name,
				role: user.role,
				isActive: user.isActive,
			},
			csrfToken,
		}
	}),
)
