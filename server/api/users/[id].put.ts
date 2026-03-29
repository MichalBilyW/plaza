/**
 * PUT /api/users/:id
 * Úprava správce (pouze pro adminy)
 */

import { connectToDatabase } from '@/server/utils/db'
import { User } from '@/server/models'
import { userUpdateSchema, objectIdSchema } from '@/shared/schemas'
import { requireAdmin, hashPassword } from '@/server/utils/auth'
import { requireCsrf } from '@/server/utils/csrf'
import {
	defineApiHandler,
	createForbiddenError,
	createNotFoundError,
	createValidationError,
	ApiError,
	ErrorCodes,
} from '@/server/utils/errors'

export default defineEventHandler(
	defineApiHandler(async (event) => {
		// CSRF ochrana
		requireCsrf(event)

		// Pouze admin může upravovat správce
		const currentUser = requireAdmin(event)

		await connectToDatabase()

		// Validace ID
		const id = getRouterParam(event, 'id')
		const idResult = objectIdSchema.safeParse(id)

		if (!idResult.success) {
			throw createValidationError('Neplatné ID')
		}

		// Validace vstupu
		const body = await readBody(event)
		const result = userUpdateSchema.safeParse(body)

		if (!result.success) {
			throw createValidationError('Neplatné údaje', {
				email: result.error.issues.find((i) => i.path[0] === 'email')?.message || '',
				name: result.error.issues.find((i) => i.path[0] === 'name')?.message || '',
				password: result.error.issues.find((i) => i.path[0] === 'password')?.message || '',
				role: result.error.issues.find((i) => i.path[0] === 'role')?.message || '',
			})
		}

		const updateData = result.data

		// Najít uživatele
		const user = await User.findById(id)

		if (!user) {
			throw createNotFoundError('Správce')
		}

		if (user.role === 'superadmin' && currentUser.role !== 'superadmin') {
			throw createForbiddenError('Pouze SuperAdmin může upravovat SuperAdmin účet')
		}

		if (updateData.role === 'superadmin' && currentUser.role !== 'superadmin') {
			throw createForbiddenError('Pouze SuperAdmin může přiřadit roli SuperAdmin')
		}

		// Kontrola zda email již neexistuje u jiného uživatele
		if (updateData.email && updateData.email !== user.email) {
			const existingUser = await User.findOne({ email: updateData.email })
			if (existingUser) {
				throw new ApiError(
					ErrorCodes.VALIDATION_ERROR,
					'Uživatel s tímto emailem již existuje',
					400,
				)
			}
		}

		// Aktualizovat pole
		if (updateData.email) user.email = updateData.email
		if (updateData.name) user.name = updateData.name
		if (updateData.role) user.role = updateData.role
		if (typeof updateData.isActive === 'boolean') user.isActive = updateData.isActive

		// Pokud bylo zadáno nové heslo, zahashovat
		if (updateData.password) {
			user.password = await hashPassword(updateData.password)
		}

		await user.save()

		return {
			_id: user._id.toString(),
			email: user.email,
			name: user.name,
			role: user.role,
			isActive: user.isActive,
			lastLoginAt: user.lastLoginAt?.toISOString(),
			createdAt: user.createdAt.toISOString(),
			updatedAt: user.updatedAt.toISOString(),
		}
	}),
)
