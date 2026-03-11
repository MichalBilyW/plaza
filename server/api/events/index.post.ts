/**
 * POST /api/events
 * Vytvoření nové akce
 */

import { connectToDatabase } from '@/server/utils/db'
import { Event, Shop } from '@/server/models'
import { eventCreateSchema } from '@/shared/schemas'
import { requireEditor } from '@/server/utils/auth'
import { defineApiHandler, createValidationError } from '@/server/utils/errors'

export default defineEventHandler(
	defineApiHandler(async (event) => {
		requireEditor(event)

		await connectToDatabase()

		const body = await readBody(event)
		const data = eventCreateSchema.parse(body)

		// Ověření existence obchodu
		const shop = await Shop.findById(data.shopId)
		if (!shop) {
			throw createValidationError('Obchod neexistuje')
		}

		// Vytvoření akce
		const eventDoc = await Event.create(data)

		return eventDoc.toJSON()
	}),
)
