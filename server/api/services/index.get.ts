/**
 * GET /api/services
 * Seznam služeb s filtrováním a stránkováním
 */

import { connectToDatabase } from '@/server/utils/db'
import { Service } from '@/server/models'
import { serviceFilterQuerySchema } from '@/shared/schemas'
import { defineApiHandler } from '@/server/utils/errors'
import type { FilterQuery } from 'mongoose'
import type { IService } from '@/server/models/Service'

export default defineEventHandler(
	defineApiHandler(async (event) => {
		await connectToDatabase()

		const query = getQuery(event)
		const filters = serviceFilterQuerySchema.parse(query)

		// Sestavení filtru
		const filter: FilterQuery<IService> = {}

		if (filters.isActive !== undefined) {
			filter.isActive = filters.isActive
		}

		if (filters.search) {
			filter.shortDescription = { $regex: filters.search, $options: 'i' }
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
		const [services, total] = await Promise.all([
			Service.find(filter).sort(sort).skip(skip).limit(limit).lean(),
			Service.countDocuments(filter),
		])

		// Transformace
		const transformedServices = services.map((s) => ({
			...s,
			_id: s._id.toString(),
		}))

		return {
			data: transformedServices,
			meta: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			},
		}
	}),
)
