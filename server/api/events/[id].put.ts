/**
 * PUT /api/events/:id
 * Úprava akce
 */

import { connectToDatabase } from '@/server/utils/db'
import { Event, Shop } from '@/server/models'
import { eventUpdateSchema } from '@/shared/schemas'
import { requireEditor } from '@/server/utils/auth'
import { defineApiHandler, createNotFoundError, createValidationError } from '@/server/utils/errors'

export default defineEventHandler(
	defineApiHandler(async (e) => {
		requireEditor(e)

		await connectToDatabase()

		const id = getRouterParam(e, 'id')

		const eventDoc = await Event.findById(id)
		if (!eventDoc) {
			throw createNotFoundError('Akce')
		}

		const body = await readBody(e)
		const data = eventUpdateSchema.parse(body)

		// Pokud se mění obchod, ověřit existenci
		if (data.shopId && data.shopId !== eventDoc.shopId?.toString()) {
			const shop = await Shop.findById(data.shopId)
			if (!shop) {
				throw createValidationError('Obchod neexistuje')
			}
		}

		// Aktualizovat jen pole, která byla v requestu (ne Zod defaults)
		for (const key of Object.keys(data)) {
			if (key in body) {
				;(eventDoc as Record<string, unknown>)[key] = data[key as keyof typeof data]
			}
		}
		await eventDoc.save()

		return eventDoc.toJSON()
	}),
)
