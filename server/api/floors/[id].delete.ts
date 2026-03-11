/**
 * DELETE /api/floors/:id
 * Smazání patra
 */

import { connectToDatabase } from '@/server/utils/db'
import { Floor, Shop } from '@/server/models'
import { requireAdmin } from '@/server/utils/auth'
import { defineApiHandler, createNotFoundError, createValidationError } from '@/server/utils/errors'

export default defineEventHandler(
	defineApiHandler(async (event) => {
		// Mazání pouze pro adminy
		requireAdmin(event)

		await connectToDatabase()

		const id = getRouterParam(event, 'id')

		const floor = await Floor.findById(id)
		if (!floor) {
			throw createNotFoundError('Patro')
		}

		// Zkontrolovat, zda patro neobsahuje obchody
		const shopsCount = await Shop.countDocuments({ floorId: id })
		if (shopsCount > 0) {
			throw createValidationError(
				`Nelze smazat patro obsahující ${shopsCount} obchodů. Nejprve přesuňte nebo smažte obchody.`,
			)
		}

		await floor.deleteOne()

		return { success: true, message: 'Patro bylo smazáno' }
	}),
)
