/**
 * GET /api/events/:id
 * Detail události
 */

import { connectToDatabase } from '@/server/utils/db'
import { Event } from '@/server/models'
import { defineApiHandler, createNotFoundError } from '@/server/utils/errors'

export default defineEventHandler(
  defineApiHandler(async (event) => {
    await connectToDatabase()

    const id = getRouterParam(event, 'id')

    const eventDoc = await Event.findById(id).lean()

    if (!eventDoc) {
      throw createNotFoundError('Událost')
    }

    return eventDoc
  })
)
