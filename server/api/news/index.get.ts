/**
 * GET /api/news
 * Seznam novinek s filtrováním a stránkováním
 */

import { connectToDatabase } from '@/server/utils/db'
import { News } from '@/server/models'
import { newsFilterQuerySchema } from '@/shared/schemas'
import { defineApiHandler } from '@/server/utils/errors'
import type { FilterQuery } from 'mongoose'
import type { INews } from '@/server/models/News'

export default defineEventHandler(
	defineApiHandler(async (event) => {
		await connectToDatabase()

		const query = getQuery(event)
		const filters = newsFilterQuerySchema.parse(query)

		// Sestavení filtru
		const filter: FilterQuery<INews> = {}

		if (filters.isActive !== undefined) {
			filter.isActive = filters.isActive
		}

		if (filters.search) {
			filter.name = { $regex: filters.search, $options: 'i' }
		}

		// Stránkování
		const page = filters.page || 1
		const limit = filters.limit || 20
		const skip = (page - 1) * limit

		// Řazení
		const sortField = filters.sort || 'sortOrder'
		const sortOrder = filters.order === 'desc' ? -1 : 1
		const sort: Record<string, 1 | -1> = { [sortField]: sortOrder }

		// Získání dat
		const [news, total] = await Promise.all([
			News.find(filter).sort(sort).skip(skip).limit(limit).lean(),
			News.countDocuments(filter),
		])

		// Transformace
		const transformedNews = news.map((n) => ({
			...n,
			_id: n._id.toString(),
		}))

		return {
			data: transformedNews,
			meta: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			},
		}
	}),
)
