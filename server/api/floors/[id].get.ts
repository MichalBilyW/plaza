/**
 * GET /api/floors/:id
 * Detail patra
 */

import { connectToDatabase } from '@/server/utils/db'
import { Floor } from '@/server/models'
import { defineApiHandler, createNotFoundError } from '@/server/utils/errors'

export default defineEventHandler(
	defineApiHandler(async (event) => {
		await connectToDatabase()

		const id = getRouterParam(event, 'id')

		const floor = await Floor.findById(id).lean()

		if (!floor) {
			throw createNotFoundError('Patro')
		}

		return {
			...floor,
			_id: floor._id.toString(),
		}
	}),
)
