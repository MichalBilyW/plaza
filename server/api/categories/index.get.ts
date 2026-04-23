/**
 * GET /api/categories
 * Seznam kategorií s filtrováním a stránkováním
 * Vrací pouze kategorie s alespoň 1 aktivním obchodem (pro frontend)
 */

import { connectToDatabase } from '@/server/utils/db'
import { Category, Shop } from '@/server/models'
import { categoryFilterQuerySchema } from '@/shared/schemas'
import { defineApiHandler } from '@/server/utils/errors'
import type { FilterQuery } from 'mongoose'
import type { ICategoryDocument } from '@/server/models/Category'

const normalizedCategoryIdsExpr = {
	$map: {
		input: { $ifNull: ['$categoryIds', []] },
		as: 'item',
		in: { $toString: '$$item' },
	},
}

export default defineEventHandler(
	defineApiHandler(async (event) => {
		await connectToDatabase()

		// Parse a validace query parametrů
		const query = getQuery(event)
		const validatedQuery = categoryFilterQuerySchema.parse(query)

		const { page, limit, sort, order, isActive, search } = validatedQuery

		// Parametr pro zobrazení pouze kategorií s obchody (pro frontend)
		const withShopsOnly = query.withShopsOnly === 'true'

		// Sestavení filtru
		const filter: FilterQuery<ICategoryDocument> = {}

		if (typeof isActive === 'boolean') {
			filter.isActive = isActive
		}

		if (search) {
			filter.$or = [
				{ name: { $regex: search, $options: 'i' } },
				{ description: { $regex: search, $options: 'i' } },
			]
		}

		// Pokud chceme pouze kategorie s obchody, získáme nejprve ID kategorií s aktivními obchody
		if (withShopsOnly) {
			// Najdi všechny unikátní kategorie z pole categoryIds aktivních obchodů
			const categoryIdsWithShops = await Shop.aggregate([
				{ $match: { isActive: true, categoryIds: { $exists: true, $ne: [] } } },
				{ $unwind: '$categoryIds' },
				{ $group: { _id: { $toString: '$categoryIds' } } },
			])
			filter._id = { $in: categoryIdsWithShops.map((c) => c._id) }
		}

		// Celkový počet
		const total = await Category.countDocuments(filter)

		// Sestavení sort objektu
		const sortField = sort || 'sortOrder'
		const sortDirection = order === 'desc' ? -1 : 1
		const sortObj: Record<string, 1 | -1> = { [sortField]: sortDirection }

		// Dotaz
		const categories = await Category.find(filter)
			.sort(sortObj)
			.skip((page - 1) * limit)
			.limit(limit)
			.lean()

		// Získat počet obchodů pro každou kategorii
		const categoryIds = categories.map((c) => c._id.toString())
		const shopCounts = await Shop.aggregate([
			{ $match: { isActive: true, categoryIds: { $exists: true, $ne: [] } } },
			{
				$project: {
					normalizedCategoryIds: normalizedCategoryIdsExpr,
				},
			},
			{ $unwind: '$normalizedCategoryIds' },
			{ $match: { normalizedCategoryIds: { $in: categoryIds } } },
			{ $group: { _id: '$normalizedCategoryIds', count: { $sum: 1 } } },
		])
		const shopCountMap = new Map(shopCounts.map((s) => [s._id.toString(), s.count]))

		// Transformace pro konzistentní response
		const data = categories.map((category) => ({
			...category,
			_id: category._id.toString(),
			shopCount: shopCountMap.get(category._id.toString()) || 0,
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
