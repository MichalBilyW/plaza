/**
 * GET /api/categories/:id
 * Detail kategorie
 */

import { connectToDatabase } from '@/server/utils/db'
import { Category, Shop } from '@/server/models'
import { defineApiHandler, createNotFoundError } from '@/server/utils/errors'

const categoryIdsContainsExpr = (categoryId: string) => ({
	$in: [
		categoryId,
		{
			$map: {
				input: { $ifNull: ['$categoryIds', []] },
				as: 'item',
				in: { $toString: '$$item' },
			},
		},
	],
})

export default defineEventHandler(
	defineApiHandler(async (event) => {
		await connectToDatabase()

		const id = getRouterParam(event, 'id')

		const category = await Category.findById(id).lean()

		if (!category) {
			throw createNotFoundError('Kategorie')
		}

		// Získat počet obchodů v kategorii (obchody, které mají tuto kategorii v categoryIds)
		const shopCount = await Shop.countDocuments({
			isActive: true,
			$expr: categoryIdsContainsExpr(id || ''),
		})

		return {
			...category,
			_id: category._id.toString(),
			shopCount,
		}
	}),
)
