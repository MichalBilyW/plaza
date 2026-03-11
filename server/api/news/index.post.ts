/**
 * POST /api/news
 * Vytvoření nové novinky
 */

import { connectToDatabase } from '@/server/utils/db'
import { News } from '@/server/models'
import { newsCreateSchema } from '@/shared/schemas'
import { requireEditor } from '@/server/utils/auth'
import { defineApiHandler } from '@/server/utils/errors'

export default defineEventHandler(
	defineApiHandler(async (event) => {
		requireEditor(event)

		await connectToDatabase()

		const body = await readBody(event)
		const data = newsCreateSchema.parse(body)

		// Vytvoření novinky
		const newsDoc = await News.create(data)

		return newsDoc.toJSON()
	}),
)
