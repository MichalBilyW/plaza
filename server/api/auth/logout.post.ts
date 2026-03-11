/**
 * POST /api/auth/logout
 * Odhlášení uživatele - invaliduje session v DB
 */

import { connectToDatabase } from '@/server/utils/db'
import { Session } from '@/server/models'
import { clearAuthCookies, getCurrentUser, getRefreshTokenFromCookie } from '@/server/utils/auth'
import { defineApiHandler } from '@/server/utils/errors'

export default defineEventHandler(
	defineApiHandler(async (event) => {
		await connectToDatabase()

		// Získat refresh token
		const refreshToken = getRefreshTokenFromCookie(event)

		// Invalidovat session v DB pokud existuje
		if (refreshToken) {
			await Session.findOneAndUpdate({ refreshToken }, { isValid: false })
		}

		// Alternativně invalidovat pomocí sessionId z access tokenu
		const user = getCurrentUser(event)
		if (user?.sessionId && user.sessionId !== 'legacy') {
			await Session.findByIdAndUpdate(user.sessionId, { isValid: false })
		}

		// Smazat auth cookies
		clearAuthCookies(event)

		return { success: true }
	}),
)
