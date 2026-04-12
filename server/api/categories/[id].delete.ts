/**
 * DELETE /api/categories/:id
 * Smazání kategorie
 */

import { connectToDatabase } from '@/server/utils/db'
import { Category, Shop } from '@/server/models'
import { requireAdmin } from '@/server/utils/auth'
import { defineApiHandler, createNotFoundError, createValidationError } from '@/server/utils/errors'

export default defineEventHandler(
	defineApiHandler(async (event) => {
		// Mazání pouze pro adminy
		requireAdmin(event)

		await connectToDatabase()

		const id = getRouterParam(event, 'id')

		const category = await Category.findById(id)
		if (!category) {
			throw createNotFoundError('Kategorie')
		}

		// Zkontrolovat, zda kategorie neobsahuje obchody
		const shopsCount = await Shop.countDocuments({ categoryIds: id })
		if (shopsCount > 0) {
			throw createValidationError(
				`Nelze smazat kategorii obsahující ${shopsCount} obchodů. Nejprve odeberte kategorii z obchodů.`,
			)
		}

		await category.deleteOne()

		return { success: true, message: 'Kategorie byla smazána' }
	}),
)
