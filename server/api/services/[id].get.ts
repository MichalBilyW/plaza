/**
 * GET /api/services/:id
 * Detail služby
 */

import { connectToDatabase } from '@/server/utils/db'
import { Service } from '@/server/models'
import { defineApiHandler, createNotFoundError } from '@/server/utils/errors'

export default defineEventHandler(
	defineApiHandler(async (event) => {
		await connectToDatabase()

		const id = getRouterParam(event, 'id')

		const serviceDoc = await Service.findById(id).lean()

		if (!serviceDoc) {
			throw createNotFoundError('Služba')
		}

		return {
			data: {
				...serviceDoc,
				_id: serviceDoc._id.toString(),
			},
		}
	}),
)
