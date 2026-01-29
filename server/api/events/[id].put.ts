/**
 * PUT /api/events/:id
 * Úprava události
 */

import { connectToDatabase } from '@/server/utils/db'
import { Event } from '@/server/models'
import { eventUpdateSchema } from '@/shared/schemas'
import { requireEditor } from '@/server/utils/auth'
import { generateUniqueSlug } from '@/server/utils/slug'
import { defineApiHandler, createNotFoundError, createValidationError } from '@/server/utils/errors'

export default defineEventHandler(
  defineApiHandler(async (e) => {
    requireEditor(e)

    await connectToDatabase()

    const id = getRouterParam(e, 'id')

    const eventDoc = await Event.findById(id)
    if (!eventDoc) {
      throw createNotFoundError('Událost')
    }

    const body = await readBody(e)
    const data = eventUpdateSchema.parse(body)

    // Validace dat - pokud se mění
    if (data.startDate || data.endDate) {
      const startDate = data.startDate ? new Date(data.startDate) : eventDoc.startDate
      const endDate = data.endDate ? new Date(data.endDate) : eventDoc.endDate

      if (endDate < startDate) {
        throw createValidationError('Datum konce musí být po datu začátku')
      }

      if (data.startDate) data.startDate = startDate as unknown as string
      if (data.endDate) data.endDate = endDate as unknown as string
    }

    // Pokud se mění název a není explicitně zadán slug, vygenerovat nový
    if (data.title && data.title !== eventDoc.title && !data.slug) {
      data.slug = await generateUniqueSlug(data.title, async (s) => {
        const existing = await Event.findOne({ slug: s, _id: { $ne: id } })
        return !!existing
      })
    }

    // Pokud je explicitně zadán slug, zkontrolovat unikátnost
    if (data.slug && data.slug !== eventDoc.slug) {
      const existing = await Event.findOne({ slug: data.slug, _id: { $ne: id } })
      if (existing) {
        throw createValidationError('Slug již existuje')
      }
    }

    Object.assign(eventDoc, data)
    await eventDoc.save()

    return eventDoc.toJSON()
  })
)
