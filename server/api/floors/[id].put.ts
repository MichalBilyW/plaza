/**
 * PUT /api/floors/:id
 * Úprava patra
 */

import { connectToDatabase } from '@/server/utils/db'
import { Floor } from '@/server/models'
import { floorUpdateSchema } from '@/shared/schemas'
import { requireEditor } from '@/server/utils/auth'
import { generateUniqueSlug } from '@/server/utils/slug'
import { defineApiHandler, createNotFoundError, createValidationError } from '@/server/utils/errors'

export default defineEventHandler(
	defineApiHandler(async (event) => {
		requireEditor(event)

		await connectToDatabase()

		const id = getRouterParam(event, 'id')

		// Najít patro
		const floor = await Floor.findById(id)
		if (!floor) {
			throw createNotFoundError('Patro')
		}

		// Validace vstupu
		const body = await readBody(event)
		const data = floorUpdateSchema.parse(body)

		// Pokud se mění název a není explicitně zadán slug, vygenerovat nový
		if (data.name && data.name !== floor.name && !data.slug) {
			data.slug = await generateUniqueSlug(data.name, async (s) => {
				const existing = await Floor.findOne({ slug: s, _id: { $ne: id } })
				return !!existing
			})
		}

		// Pokud je explicitně zadán slug, zkontrolovat unikátnost
		if (data.slug && data.slug !== floor.slug) {
			const existing = await Floor.findOne({ slug: data.slug, _id: { $ne: id } })
			if (existing) {
				throw createValidationError('Slug již existuje')
			}
		}

		// Aktualizovat
		Object.assign(floor, data)
		await floor.save()

		return floor.toJSON()
	}),
)
