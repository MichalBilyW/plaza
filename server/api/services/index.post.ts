/**
 * POST /api/services
 * Vytvoření nové služby
 */

import { connectToDatabase } from '@/server/utils/db'
import { Service } from '@/server/models'
import { serviceCreateSchema } from '@/shared/schemas'
import { requireEditor } from '@/server/utils/auth'
import { defineApiHandler } from '@/server/utils/errors'

export default defineEventHandler(
	defineApiHandler(async (event) => {
		requireEditor(event)

		await connectToDatabase()

		const body = await readBody(event)
		const data = serviceCreateSchema.parse(body)

		// Auto-assign sortOrder as max + 1
		const maxSortOrder = await Service.findOne().sort({ sortOrder: -1 }).select('sortOrder')
		const nextSortOrder = (maxSortOrder?.sortOrder ?? -1) + 1

		// Vytvoření služby
		const serviceDoc = await Service.create({
			...data,
			sortOrder: nextSortOrder,
		})

		return serviceDoc.toJSON()
	}),
)
