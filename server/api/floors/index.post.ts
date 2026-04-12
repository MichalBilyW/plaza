/**
 * POST /api/floors
 * Vytvoření nového patra
 */

import { connectToDatabase } from '@/server/utils/db'
import { Floor } from '@/server/models'
import { floorCreateSchema } from '@/shared/schemas'
import { requireEditor, requireSuperAdmin } from '@/server/utils/auth'
import { defineApiHandler } from '@/server/utils/errors'

export default defineEventHandler(
	defineApiHandler(async (event) => {
		const body = await readBody(event)

		if (Object.prototype.hasOwnProperty.call(body ?? {}, 'svgMap')) {
			requireSuperAdmin(event)
		} else {
			requireEditor(event)
		}

		await connectToDatabase()

		// Validace vstupu
		const data = floorCreateSchema.parse(body)

		// Auto-assign sortOrder as max + 1
		const maxSortOrder = await Floor.findOne().sort({ sortOrder: -1 }).select('sortOrder')
		const nextSortOrder = (maxSortOrder?.sortOrder ?? -1) + 1

		// Vytvořit patro
		const floor = await Floor.create({
			...data,
			sortOrder: nextSortOrder,
		})

		return floor.toJSON()
	}),
)
