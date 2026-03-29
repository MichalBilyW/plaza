/**
 * GET /api/floors
 * Seznam pater s filtrováním a stránkováním
 */

import { connectToDatabase } from '@/server/utils/db'
import { Floor, Shop } from '@/server/models'
import { paginationQuerySchema } from '@/shared/schemas'
import { defineApiHandler } from '@/server/utils/errors'
import type { FilterQuery } from 'mongoose'
import type { IFloorDocument } from '@/server/models/Floor'
import { z } from 'zod'

const floorFilterQuerySchema = paginationQuerySchema.extend({
	isActive: z.preprocess((val) => {
		if (val === '' || val === undefined || val === null) return undefined
		if (val === 'true' || val === true) return true
		if (val === 'false' || val === false) return false
		return undefined
	}, z.boolean().optional()),
})

export default defineEventHandler(
	defineApiHandler(async (event) => {
		await connectToDatabase()

		// Parse a validace query parametrů
		const query = getQuery(event)
		const validatedQuery = floorFilterQuerySchema.parse(query)

		const { page, limit, sort, order, isActive } = validatedQuery

		// Sestavení filtru
		const filter: FilterQuery<IFloorDocument> = {}

		// Pokud je isActive specifikováno, filtrovat podle něj
		// Pro veřejné API (FE) se bude volat s isActive=true
		// Pro CMS se volá bez parametru - vrátí všechna patra
		if (typeof isActive === 'boolean') {
			filter.isActive = isActive
		}

		// Celkový počet
		const total = await Floor.countDocuments(filter)

		// Sestavení sort objektu
		const sortField = sort || 'level'
		const sortOrder = order === 'desc' ? -1 : 1
		const sortObj: Record<string, 1 | -1> = { [sortField]: sortOrder }

		// Dotaz
		const floors = await Floor.find(filter)
			.sort(sortObj)
			.skip((page - 1) * limit)
			.limit(limit)
			.lean()

		// Získat počet obchodů pro každé patro
		const floorIds = floors.map((f) => f._id)
		const shopCounts = await Shop.aggregate([
			{ $match: { floorId: { $in: floorIds } } },
			{ $group: { _id: '$floorId', count: { $sum: 1 } } },
		])
		const shopCountMap = new Map(shopCounts.map((s) => [s._id.toString(), s.count]))

		// Transformace pro konzistentní response
		const data = floors.map((floor) => ({
			...floor,
			_id: floor._id.toString(),
			shopCount: shopCountMap.get(floor._id.toString()) ?? 0,
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
