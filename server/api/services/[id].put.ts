/**
 * PUT /api/services/:id
 * Úprava služby
 */

import { connectToDatabase } from '@/server/utils/db'
import { Service } from '@/server/models'
import { serviceUpdateSchema } from '@/shared/schemas'
import { requireEditor } from '@/server/utils/auth'
import { defineApiHandler, createNotFoundError } from '@/server/utils/errors'

export default defineEventHandler(
	defineApiHandler(async (e) => {
		requireEditor(e)

		await connectToDatabase()

		const id = getRouterParam(e, 'id')

		const serviceDoc = await Service.findById(id)
		if (!serviceDoc) {
			throw createNotFoundError('Služba')
		}

		const body = await readBody(e)
		const data = serviceUpdateSchema.parse(body)

		Object.assign(serviceDoc, data)
		await serviceDoc.save()

		return serviceDoc.toJSON()
	}),
)
