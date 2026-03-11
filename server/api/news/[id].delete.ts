/**
 * DELETE /api/news/:id
 * Smazání novinky
 */

import { connectToDatabase } from '@/server/utils/db'
import { News } from '@/server/models'
import { requireAdmin } from '@/server/utils/auth'
import { defineApiHandler, createNotFoundError } from '@/server/utils/errors'

export default defineEventHandler(
	defineApiHandler(async (e) => {
		requireAdmin(e)

		await connectToDatabase()

		const id = getRouterParam(e, 'id')

		const newsDoc = await News.findById(id)
		if (!newsDoc) {
			throw createNotFoundError('Novinka')
		}

		await newsDoc.deleteOne()

		return { success: true, message: 'Novinka byla smazána' }
	}),
)
