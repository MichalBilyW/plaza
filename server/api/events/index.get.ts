/**
 * GET /api/events
 * Seznam akcí s filtrováním a stránkováním
 */

import { connectToDatabase } from '@/server/utils/db'
import { Event } from '@/server/models'
import { eventFilterQuerySchema } from '@/shared/schemas'
import { defineApiHandler } from '@/server/utils/errors'
import type { FilterQuery } from 'mongoose'
import type { IEvent } from '@/server/models/Event'

export default defineEventHandler(
	defineApiHandler(async (event) => {
		await connectToDatabase()

		const query = getQuery(event)
		const filters = eventFilterQuerySchema.parse(query)

		// Sestavení filtru
		const filter: FilterQuery<IEvent> = {}

		if (filters.isActive !== undefined) {
			filter.isActive = filters.isActive
		}

		if (filters.shopId) {
			filter.shopId = filters.shopId
		}

		if (filters.search) {
			filter.name = { $regex: filters.search, $options: 'i' }
		}

		// Filtrovat položky, kterým ještě nevypršel `displayUntil`
		if (filters.notExpired) {
			filter.$or = [{ displayUntil: null }, { displayUntil: { $gte: new Date() } }]
		}

		// Stránkování
		const page = filters.page || 1
		const limit = filters.limit || 20
		const skip = (page - 1) * limit

		// Řazení
		const sortField = filters.sort || 'sortOrder'
		const sortOrder = filters.order === 'desc' ? -1 : 1
		const sort: Record<string, 1 | -1> = { [sortField]: sortOrder }

		// Získání dat s populací obchodu
		const [events, total] = await Promise.all([
			Event.find(filter)
				.populate('shopId', 'name logo slug')
				.sort(sort)
				.skip(skip)
				.limit(limit)
				.lean(),
			Event.countDocuments(filter),
		])

		// Transformace - přejmenovat shopId na shop pro konzistenci
		const transformedEvents = events.map((e) => ({
			...e,
			_id: e._id.toString(),
			shop: e.shopId,
			shopId:
				typeof e.shopId === 'object' && e.shopId?._id ? e.shopId._id.toString() : e.shopId,
		}))

		return {
			data: transformedEvents,
			meta: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			},
		}
	}),
)
