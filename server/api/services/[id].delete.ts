/**
 * DELETE /api/services/:id
 * Smazání služby
 */

import { connectToDatabase } from '@/server/utils/db'
import { Service } from '@/server/models'
import { requireAdmin } from '@/server/utils/auth'
import { defineApiHandler, createNotFoundError } from '@/server/utils/errors'

export default defineEventHandler(
	defineApiHandler(async (e) => {
		requireAdmin(e)

		await connectToDatabase()

		const id = getRouterParam(e, 'id')

		const serviceDoc = await Service.findById(id)
		if (!serviceDoc) {
			throw createNotFoundError('Služba')
		}

		await serviceDoc.deleteOne()

		return { success: true, message: 'Služba byla smazána' }
	}),
)
