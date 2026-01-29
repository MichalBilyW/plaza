/**
 * DELETE /api/auth/sessions
 * Zrušení všech sessions kromě aktuální (odhlášení všech zařízení)
 */

import { connectToDatabase } from '@/server/utils/db'
import { Session } from '@/server/models'
import { requireAuth } from '@/server/utils/auth'
import { defineApiHandler } from '@/server/utils/errors'

export default defineEventHandler(
  defineApiHandler(async (event) => {
    const user = requireAuth(event)

    await connectToDatabase()

    // Invalidovat všechny sessions kromě aktuální
    const result = await Session.updateMany(
      {
        userId: user.id,
        isValid: true,
        _id: { $ne: user.sessionId },
      },
      { isValid: false }
    )

    return {
      success: true,
      revokedCount: result.modifiedCount,
    }
  })
)
