/**
 * POST /api/shops
 * Vytvoření nového obchodu
 */

import { connectToDatabase } from '@/server/utils/db'
// Import all models needed for populate to ensure they're registered
import { Shop, Floor } from '@/server/models'
import { shopCreateSchema } from '@/shared/schemas'
import { requireEditor } from '@/server/utils/auth'
import { generateUniqueSlug } from '@/server/utils/slug'
import { defineApiHandler } from '@/server/utils/errors'

// Ensure models are registered
void Floor

export default defineEventHandler(
	defineApiHandler(async (event) => {
		// Vyžadovat editor nebo admin roli
		requireEditor(event)

		await connectToDatabase()

		// Validace vstupu
		const body = await readBody(event)
		const data = shopCreateSchema.parse(body)

		// Generovat slug pokud není zadán
		const slug =
			data.slug ||
			(await generateUniqueSlug(data.name, async (s) => {
				const existing = await Shop.findOne({ slug: s })
				return !!existing
			}))

		// Vytvořit obchod
		const shop = await Shop.create({
			...data,
			slug,
		})

		// Vrátit s populací
		const populated = await Shop.findById(shop._id).populate('floorId', 'name level').lean()

		return populated
	}),
)
