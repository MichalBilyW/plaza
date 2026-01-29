/**
 * GET /api/auth/me
 * Získání profilu přihlášeného uživatele
 */

import { connectToDatabase } from '@/server/utils/db'
import { User } from '@/server/models'
import { requireAuth } from '@/server/utils/auth'
import { defineApiHandler, createNotFoundError } from '@/server/utils/errors'

export default defineEventHandler(
  defineApiHandler(async (event) => {
    const authUser = requireAuth(event)

    await connectToDatabase()

    const user = await User.findById(authUser.id)

    if (!user || !user.isActive) {
      throw createNotFoundError('Uživatel')
    }

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    }
  })
)
