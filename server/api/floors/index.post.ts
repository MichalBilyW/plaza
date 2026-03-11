/**
 * POST /api/floors
 * Vytvoření nového patra
 */

import { connectToDatabase } from '@/server/utils/db'
import { Floor } from '@/server/models'
import { floorCreateSchema } from '@/shared/schemas'
import { requireEditor } from '@/server/utils/auth'
import { generateUniqueSlug } from '@/server/utils/slug'
import { defineApiHandler } from '@/server/utils/errors'

export default defineEventHandler(
	defineApiHandler(async (event) => {
		// Vyžadovat editor nebo admin roli
		requireEditor(event)

		await connectToDatabase()

		// Validace vstupu
		const body = await readBody(event)
		const data = floorCreateSchema.parse(body)

		// Generovat slug pokud není zadán
		const slug =
			data.slug ||
			(await generateUniqueSlug(data.name, async (s) => {
				const existing = await Floor.findOne({ slug: s })
				return !!existing
			}))

		// Vytvořit patro
		const floor = await Floor.create({
			...data,
			slug,
		})

		return floor.toJSON()
	}),
)
