/**
 * POST /api/events/:id/unpublish
 * Odpublikování události
 */

import { connectToDatabase } from '@/server/utils/db'
import { Event } from '@/server/models'
import { requireEditor } from '@/server/utils/auth'
import { defineApiHandler, createNotFoundError } from '@/server/utils/errors'

export default defineEventHandler(
  defineApiHandler(async (e) => {
    requireEditor(e)

    await connectToDatabase()

    const id = getRouterParam(e, 'id')

    const eventDoc = await Event.findById(id)
    if (!eventDoc) {
      throw createNotFoundError('Událost')
    }

    eventDoc.published = false
    await eventDoc.save()

    return eventDoc.toJSON()
  })
)
