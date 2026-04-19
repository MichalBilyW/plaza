/**
 * GET /api/shops
 * Seznam obchodů s filtrováním a stránkováním
 */

import { connectToDatabase } from '@/server/utils/db'
import { Shop } from '@/server/models'
import { shopFilterQuerySchema } from '@/shared/schemas'
import { defineApiHandler } from '@/server/utils/errors'
import type { FilterQuery } from 'mongoose'
import type { IShopDocument } from '@/server/models/Shop'

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
			// Filtrovat obchody, které mají tuto kategorii v poli categoryIds
			filter.categoryIds = categoryId
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
			.populate('floorIds', 'name level')
			.populate('categoryIds', 'name slug icon color')
			.sort(sortObj)
			.skip((page - 1) * limit)
			.limit(limit)
			.lean()

		// Transformace pro konzistentní response
		const data = shops.map((shop) => ({
			...shop,
			_id: shop._id.toString(),
			// Legacy single floor support
			floor: shop.floorId,
			floorId: shop.floorId
				? typeof shop.floorId === 'object'
					? (shop.floorId as { _id: unknown })._id?.toString()
					: shop.floorId?.toString()
				: undefined,
			// Multi-floor support
			floors: shop.floorIds,
			floorIds: shop.floorIds
				? (shop.floorIds as Array<{ _id: unknown } | unknown>).map((f) =>
						typeof f === 'object' && f !== null
							? (f as { _id: unknown })._id?.toString()
							: f?.toString(),
					)
				: [],
			categories: shop.categoryIds,
			categoryIds: shop.categoryIds
				? (shop.categoryIds as Array<{ _id: unknown } | unknown>).map((cat) =>
						typeof cat === 'object' && cat !== null
							? (cat as { _id: unknown })._id?.toString()
							: cat?.toString(),
					)
				: [],
			// Multi-unit support - unitCodes pole
			unitCodes: shop.unitCodes || (shop.unitCode ? [shop.unitCode] : []),
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
