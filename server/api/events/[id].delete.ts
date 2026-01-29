/**
 * DELETE /api/events/:id
 * Smazání události
 */

import { connectToDatabase } from '@/server/utils/db'
import { Event } from '@/server/models'
import { requireAdmin } from '@/server/utils/auth'
import { defineApiHandler, createNotFoundError } from '@/server/utils/errors'

export default defineEventHandler(
  defineApiHandler(async (e) => {
    requireAdmin(e)

    await connectToDatabase()

    const id = getRouterParam(e, 'id')

    const eventDoc = await Event.findById(id)
    if (!eventDoc) {
      throw createNotFoundError('Událost')
    }

    await eventDoc.deleteOne()

    return { success: true, message: 'Událost byla smazána' }
  })
)
