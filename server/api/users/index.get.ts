/**
 * GET /api/users
 * Seznam správců (pouze pro adminy)
 */

import { connectToDatabase } from '@/server/utils/db'
import { User } from '@/server/models'
import { requireAdmin } from '@/server/utils/auth'
import { paginationQuerySchema } from '@/shared/schemas'
import { defineApiHandler } from '@/server/utils/errors'
import { toISOString } from '@/server/utils/format'

export default defineEventHandler(
	defineApiHandler(async (event) => {
		// Pouze admin může vidět seznam správců
		requireAdmin(event)

		await connectToDatabase()

		// Parse query parametrů
		const query = getQuery(event)
		const validatedQuery = paginationQuerySchema.parse(query)

		const { page, limit, sort, order } = validatedQuery

		// Celkový počet
		const total = await User.countDocuments()

		// Sestavení sort objektu
		const sortField = sort || 'createdAt'
		const sortOrder = order === 'desc' ? -1 : 1
		const sortObj: Record<string, 1 | -1> = { [sortField]: sortOrder }

		// Dotaz
		const users = await User.find()
			.sort(sortObj)
			.skip((page - 1) * limit)
			.limit(limit)
			.lean()

		// Transformace pro konzistentní response
		const data = users.map((user) => ({
			_id: user._id.toString(),
			email: user.email,
			name: user.name,
			role: user.role,
			isActive: user.isActive,
			lastLoginAt: toISOString(user.lastLoginAt),
			createdAt: toISOString(user.createdAt),
			updatedAt: toISOString(user.updatedAt),
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
