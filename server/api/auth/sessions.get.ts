/**
 * GET /api/auth/sessions
 * Seznam aktivních sessions uživatele
 */

import { connectToDatabase } from '@/server/utils/db'
import { Session } from '@/server/models'
import { requireAuth } from '@/server/utils/auth'
import { defineApiHandler } from '@/server/utils/errors'

export default defineEventHandler(
	defineApiHandler(async (event) => {
		const user = requireAuth(event)

		await connectToDatabase()

		const sessions = await Session.find({
			userId: user.id,
			isValid: true,
			expiresAt: { $gt: new Date() },
		})
			.select('userAgent ipAddress lastActivityAt createdAt')
			.sort({ lastActivityAt: -1 })

		return {
			sessions: sessions.map((s) => ({
				id: s._id.toString(),
				userAgent: s.userAgent,
				ipAddress: s.ipAddress,
				lastActivityAt: s.lastActivityAt?.toISOString(),
				createdAt: s.createdAt.toISOString(),
				isCurrent: s._id.toString() === user.sessionId,
			})),
			currentSessionId: user.sessionId,
		}
	}),
)
