/**
 * GET /api/news/:id
 * Detail novinky
 */

import { connectToDatabase } from '@/server/utils/db'
import { News } from '@/server/models'
import { defineApiHandler, createNotFoundError } from '@/server/utils/errors'

export default defineEventHandler(
	defineApiHandler(async (event) => {
		await connectToDatabase()

		const id = getRouterParam(event, 'id')

		const newsDoc = await News.findById(id).lean()

		if (!newsDoc) {
			throw createNotFoundError('Novinka')
		}

		return {
			data: {
				...newsDoc,
				_id: newsDoc._id.toString(),
			},
		}
	}),
)
