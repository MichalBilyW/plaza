/**
 * DELETE /api/users/:id
 * Smazání správce (pouze pro adminy)
 * Nelze smazat sám sebe
 */

import { connectToDatabase } from '@/server/utils/db'
import { User, Session } from '@/server/models'
import { requireAdmin } from '@/server/utils/auth'
import { requireCsrf } from '@/server/utils/csrf'
import { objectIdSchema } from '@/shared/schemas'
import {
	defineApiHandler,
	createNotFoundError,
	createValidationError,
	ApiError,
	ErrorCodes,
} from '@/server/utils/errors'

export default defineEventHandler(
	defineApiHandler(async (event) => {
		// CSRF ochrana
		requireCsrf(event)

		// Pouze admin může mazat správce
		const currentUser = requireAdmin(event)

		await connectToDatabase()

		// Validace ID
		const id = getRouterParam(event, 'id')
		const idResult = objectIdSchema.safeParse(id)

		if (!idResult.success) {
			throw createValidationError('Neplatné ID')
		}

		// Nelze smazat sám sebe
		if (id === currentUser.id) {
			throw new ApiError(ErrorCodes.VALIDATION_ERROR, 'Nelze smazat vlastní účet', 400)
		}

		// Najít uživatele
		const user = await User.findById(id)

		if (!user) {
			throw createNotFoundError('Správce')
		}

		// Zneplatnit všechny sessions uživatele
		await Session.updateMany({ userId: user._id }, { isValid: false })

		// Smazat uživatele
		await user.deleteOne()

		return {
			success: true,
			message: 'Správce byl smazán',
		}
	}),
)
