/**
 * POST /api/auth/change-password
 * Změna hesla přihlášeného uživatele
 */

import { z } from 'zod'
import { connectToDatabase } from '@/server/utils/db'
import { User } from '@/server/models'
import { requireAuth, verifyPassword, hashPassword } from '@/server/utils/auth'
import { requireCsrf } from '@/server/utils/csrf'
import {
	defineApiHandler,
	createValidationError,
	ApiError,
	ErrorCodes,
} from '@/server/utils/errors'

const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, 'Aktuální heslo je povinné'),
		newPassword: z.string().min(8, 'Nové heslo musí mít alespoň 8 znaků'),
		confirmPassword: z.string(),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: 'Hesla se neshodují',
		path: ['confirmPassword'],
	})

export default defineEventHandler(
	defineApiHandler(async (event) => {
		// CSRF ochrana
		requireCsrf(event)

		const authUser = requireAuth(event)

		await connectToDatabase()

		// Validace vstupu
		const body = await readBody(event)
		const result = changePasswordSchema.safeParse(body)

		if (!result.success) {
			throw createValidationError('Neplatné údaje', {
				currentPassword: result.error.issues.find((i) => i.path[0] === 'currentPassword')
					?.message,
				newPassword: result.error.issues.find((i) => i.path[0] === 'newPassword')?.message,
				confirmPassword: result.error.issues.find((i) => i.path[0] === 'confirmPassword')
					?.message,
			})
		}

		const { currentPassword, newPassword } = result.data

		// Najít uživatele s heslem
		const user = await User.findById(authUser.id).select('+password')

		if (!user) {
			throw new ApiError(ErrorCodes.NOT_FOUND, 'Uživatel nenalezen', 404)
		}

		// Ověřit aktuální heslo
		const isValidPassword = await verifyPassword(currentPassword, user.password)

		if (!isValidPassword) {
			throw new ApiError(ErrorCodes.INVALID_CREDENTIALS, 'Nesprávné aktuální heslo', 401)
		}

		// Hashovat a uložit nové heslo
		user.password = await hashPassword(newPassword)
		await user.save()

		return {
			success: true,
			message: 'Heslo bylo úspěšně změněno',
		}
	}),
)
