/**
 * DELETE /api/auth/sessions/[id]
 * Zrušení konkrétní session (odhlášení zařízení)
 */

import { connectToDatabase } from '@/server/utils/db'
import { Session } from '@/server/models'
import { requireAuth, clearAuthCookies } from '@/server/utils/auth'
import { defineApiHandler, ApiError, ErrorCodes } from '@/server/utils/errors'

export default defineEventHandler(
  defineApiHandler(async (event) => {
    const user = requireAuth(event)
    const sessionId = getRouterParam(event, 'id')

    if (!sessionId) {
      throw new ApiError(ErrorCodes.VALIDATION_ERROR, 'Session ID je povinné', 400)
    }

    await connectToDatabase()

    // Najít session
    const session = await Session.findOne({
      _id: sessionId,
      userId: user.id,
      isValid: true,
    })

    if (!session) {
      throw new ApiError(ErrorCodes.NOT_FOUND, 'Session nenalezena', 404)
    }

    // Invalidovat session
    session.isValid = false
    await session.save()

    // Pokud rušíme aktuální session, smazat cookies
    if (sessionId === user.sessionId) {
      clearAuthCookies(event)
    }

    return { success: true }
  })
)
