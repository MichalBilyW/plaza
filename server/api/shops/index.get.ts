/**
 * GET /api/shops
 * Seznam obchodů s filtrováním a stránkováním
 */

import { connectToDatabase } from '@/server/utils/db'
// Import all models needed for populate to ensure they're registered
import { Shop, Floor, Category } from '@/server/models'
import { shopFilterQuerySchema } from '@/shared/schemas'
import { defineApiHandler } from '@/server/utils/errors'
import type { FilterQuery } from 'mongoose'
import type { IShopDocument } from '@/server/models/Shop'

// Ensure models are registered (fixes production build tree-shaking issue)
void Floor
void Category

export default defineEventHandler(
	defineApiHandler(async (event) => {
		await connectToDatabase()

		// Parse a validace query parametrů
		const query = getQuery(event)
		const validatedQuery = shopFilterQuerySchema.parse(query)

		const { page, limit, sort, order, floorId, categoryId, search, isActive } = validatedQuery

		// Sestavení filtru
		const filter: FilterQuery<IShopDocument> = {}

		if (floorId) {
			filter.floorId = floorId
		}

		if (categoryId) {
			filter.categoryId = categoryId
		}

		if (typeof isActive === 'boolean') {
			filter.isActive = isActive
		}
		// Pokud isActive není specifikováno, vracíme všechny obchody

		if (search) {
			const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
			filter.name = { $regex: escaped, $options: 'i' }
		}

		// Celkový počet
		const total = await Shop.countDocuments(filter)

		// Sestavení sort objektu
		const sortField = sort || 'name'
		const sortDirection = order === 'desc' ? -1 : 1
		const sortObj: Record<string, 1 | -1> = { [sortField]: sortDirection }

		// Dotaz s populací
		const shops = await Shop.find(filter)
			.populate('floorId', 'name level')
			.populate('categoryId', 'name slug icon color')
			.sort(sortObj)
			.skip((page - 1) * limit)
			.limit(limit)
			.lean()

		// Transformace pro konzistentní response
		const data = shops.map((shop) => ({
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
		}))

		return {
			data,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		}
	}),
)
