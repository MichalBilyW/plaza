/**
 * POST /api/users
 * Vytvoření nového správce (pouze pro adminy)
 */

import { connectToDatabase } from '@/server/utils/db'
import { User } from '@/server/models'
import { userCreateSchema } from '@/shared/schemas'
import { requireAdmin, hashPassword } from '@/server/utils/auth'
import { requireCsrf } from '@/server/utils/csrf'
import {
	defineApiHandler,
	createForbiddenError,
	createValidationError,
	ApiError,
	ErrorCodes,
} from '@/server/utils/errors'

export default defineEventHandler(
	defineApiHandler(async (event) => {
		// CSRF ochrana
		requireCsrf(event)

		// Pouze admin může vytvářet správce
		const currentUser = requireAdmin(event)

		await connectToDatabase()

		// Validace vstupu
		const body = await readBody(event)
		const result = userCreateSchema.safeParse(body)

		if (!result.success) {
			throw createValidationError('Neplatné údaje', {
				email: result.error.issues.find((i) => i.path[0] === 'email')?.message || '',
				name: result.error.issues.find((i) => i.path[0] === 'name')?.message || '',
				password: result.error.issues.find((i) => i.path[0] === 'password')?.message || '',
				role: result.error.issues.find((i) => i.path[0] === 'role')?.message || '',
			})
		}

		const { email, name, password, role, isActive } = result.data

		if (role === 'superadmin' && currentUser.role !== 'superadmin') {
			throw createForbiddenError('Pouze SuperAdmin může vytvářet uživatele s rolí SuperAdmin')
		}

		// Kontrola zda email již neexistuje
		const existingUser = await User.findOne({ email })
		if (existingUser) {
			throw new ApiError(
				ErrorCodes.VALIDATION_ERROR,
				'Uživatel s tímto emailem již existuje',
				400,
			)
		}

		// Hashovat heslo
		const hashedPassword = await hashPassword(password)

		// Vytvořit uživatele
		const user = await User.create({
			email,
			name,
			password: hashedPassword,
			role,
			isActive,
		})

		return {
			_id: user._id.toString(),
			email: user.email,
			name: user.name,
			role: user.role,
			isActive: user.isActive,
			createdAt: user.createdAt.toISOString(),
			updatedAt: user.updatedAt.toISOString(),
		}
	}),
)
