/**
 * PUT /api/categories/reorder
 * Změna pořadí kategorií pomocí drag & drop
 */

import { z } from 'zod'
import { connectToDatabase } from '@/server/utils/db'
import { Category } from '@/server/models'
import { requireEditor } from '@/server/utils/auth'
import { defineApiHandler } from '@/server/utils/errors'

const reorderSchema = z.object({
	ids: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)),
})

export default defineEventHandler(
	defineApiHandler(async (event) => {
		requireEditor(event)

		await connectToDatabase()

		const body = await readBody(event)
		const { ids } = reorderSchema.parse(body)

		// Update sortOrder for each category based on array position
		const bulkOps = ids.map((id, index) => ({
			updateOne: {
				filter: { _id: id },
				update: { $set: { sortOrder: index } },
			},
		}))

		await Category.bulkWrite(bulkOps)

		return { success: true }
	}),
)
