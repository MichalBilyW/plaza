/**
 * PUT /api/floors/:id
 * Úprava patra
 */

import { connectToDatabase } from '@/server/utils/db'
import { Floor } from '@/server/models'
import { floorUpdateSchema } from '@/shared/schemas'
import { requireEditor, requireSuperAdmin } from '@/server/utils/auth'
import { defineApiHandler, createNotFoundError } from '@/server/utils/errors'

export default defineEventHandler(
	defineApiHandler(async (event) => {
		const body = await readBody(event)

		if (Object.prototype.hasOwnProperty.call(body ?? {}, 'svgMap')) {
			requireSuperAdmin(event)
		} else {
			requireEditor(event)
		}

		await connectToDatabase()

		const id = getRouterParam(event, 'id')

		// Najít patro
		const floor = await Floor.findById(id)
		if (!floor) {
			throw createNotFoundError('Patro')
		}

		// Validace vstupu
		const data = floorUpdateSchema.parse(body)

		// Aktualizovat jen pole, která byla v requestu (ne Zod defaults)
		for (const key of Object.keys(data)) {
			if (key in body) {
				floor.set(key, data[key as keyof typeof data])
			}
		}
		await floor.save()

		return floor.toJSON()
	}),
)
