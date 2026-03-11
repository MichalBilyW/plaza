/**
 * GET /api/categories/:id
 * Detail kategorie
 */

import { connectToDatabase } from '@/server/utils/db'
import { Category, Shop } from '@/server/models'
import { defineApiHandler, createNotFoundError } from '@/server/utils/errors'

export default defineEventHandler(
	defineApiHandler(async (event) => {
		await connectToDatabase()

		const id = getRouterParam(event, 'id')

		const category = await Category.findById(id).lean()

		if (!category) {
			throw createNotFoundError('Kategorie')
		}

		// Získat počet obchodů v kategorii
		const shopCount = await Shop.countDocuments({ categoryId: id, isActive: true })

		return {
			...category,
			_id: category._id.toString(),
			shopCount,
		}
	}),
)
