/**
 * GET /api/events/:id
 * Detail akce
 */

import { connectToDatabase } from '@/server/utils/db'
import { Event } from '@/server/models'
import { defineApiHandler, createNotFoundError } from '@/server/utils/errors'

export default defineEventHandler(
	defineApiHandler(async (event) => {
		await connectToDatabase()

		const id = getRouterParam(event, 'id')

		const eventDoc = await Event.findById(id).populate('shopId', 'name logo slug').lean()

		if (!eventDoc) {
			throw createNotFoundError('Akce')
		}

		return {
			data: {
				...eventDoc,
				_id: eventDoc._id.toString(),
				shop: eventDoc.shopId,
				shopId:
					typeof eventDoc.shopId === 'object' && eventDoc.shopId?._id
						? eventDoc.shopId._id.toString()
						: eventDoc.shopId,
			},
		}
	}),
)
