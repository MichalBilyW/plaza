/**
 * GET /api/shops/:id
 * Detail obchodu (podporuje ID i slug)
 */

import { connectToDatabase } from '@/server/utils/db'
import { Shop } from '@/server/models'
import { defineApiHandler, createNotFoundError } from '@/server/utils/errors'

export default defineEventHandler(
	defineApiHandler(async (event) => {
		await connectToDatabase()

		const idOrSlug = getRouterParam(event, 'id')

		let shop

		// Pokud je to MongoDB ObjectId, hledáme podle _id
		if (idOrSlug?.match(/^[0-9a-fA-F]{24}$/)) {
			shop = await Shop.findById(idOrSlug)
				.populate('floorId', 'name level')
				.populate('categoryId', 'name slug icon color')
				.lean()
		}

		// Pokud nenalezeno podle ID nebo není ObjectId, zkusíme slug
		if (!shop) {
			shop = await Shop.findOne({ slug: idOrSlug, isActive: true })
				.populate('floorId', 'name level')
				.populate('categoryId', 'name slug icon color')
				.lean()
		}

		if (!shop) {
			throw createNotFoundError('Obchod')
		}

		// Transformace
		return {
			...shop,
			_id: shop._id.toString(),
			floor: shop.floorId,
			floorId: shop.floorId
				? typeof shop.floorId === 'object'
					? (shop.floorId as { _id: unknown })._id?.toString()
					: shop.floorId?.toString()
				: undefined,
			category: shop.categoryId,
			categoryId: shop.categoryId
				? typeof shop.categoryId === 'object'
					? (shop.categoryId as { _id: unknown })._id?.toString()
					: shop.categoryId?.toString()
				: undefined,
		}
	}),
)
