/**
 * GET /api/users/:id
 * Detail správce (pouze pro adminy)
 */

import { connectToDatabase } from '@/server/utils/db'
import { User } from '@/server/models'
import { requireAdmin } from '@/server/utils/auth'
import { objectIdSchema } from '@/shared/schemas'
import { defineApiHandler, createNotFoundError, createValidationError } from '@/server/utils/errors'

export default defineEventHandler(
  defineApiHandler(async (event) => {
    // Pouze admin může vidět detail správce
    requireAdmin(event)

    await connectToDatabase()

    // Validace ID
    const id = getRouterParam(event, 'id')
    const idResult = objectIdSchema.safeParse(id)

    if (!idResult.success) {
      throw createValidationError('Neplatné ID')
    }

    // Najít uživatele
    const user = await User.findById(id).lean()

    if (!user) {
      throw createNotFoundError('Správce')
    }

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
  })
)
