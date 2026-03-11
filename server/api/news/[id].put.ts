/**
 * PUT /api/news/:id
 * Úprava novinky
 */

import { connectToDatabase } from '@/server/utils/db'
import { News } from '@/server/models'
import { newsUpdateSchema } from '@/shared/schemas'
import { requireEditor } from '@/server/utils/auth'
import { defineApiHandler, createNotFoundError } from '@/server/utils/errors'

export default defineEventHandler(
	defineApiHandler(async (e) => {
		requireEditor(e)

		await connectToDatabase()

		const id = getRouterParam(e, 'id')

		const newsDoc = await News.findById(id)
		if (!newsDoc) {
			throw createNotFoundError('Novinka')
		}

		const body = await readBody(e)
		const data = newsUpdateSchema.parse(body)

		Object.assign(newsDoc, data)
		await newsDoc.save()

		return newsDoc.toJSON()
	}),
)
