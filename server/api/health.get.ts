/**
 * GET /api/health
 * Healthcheck endpoint pro Docker/Kubernetes
 */

import { connectToDatabase } from '@/server/utils/db'

export default defineEventHandler(async () => {
	try {
		// Ověřit připojení k databázi
		await connectToDatabase()

		return {
			status: 'ok',
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
		}
	} catch {
		throw createError({
			statusCode: 503,
			message: 'Service unavailable',
		})
	}
})
