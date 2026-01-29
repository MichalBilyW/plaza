/**
 * POST /api/events
 * Vytvoření nové události
 */

import { connectToDatabase } from '@/server/utils/db'
import { Event } from '@/server/models'
import { eventCreateSchema } from '@/shared/schemas'
import { requireEditor } from '@/server/utils/auth'
import { generateUniqueSlug } from '@/server/utils/slug'
import { defineApiHandler, createValidationError } from '@/server/utils/errors'

export default defineEventHandler(
  defineApiHandler(async (event) => {
    requireEditor(event)

    await connectToDatabase()

    const body = await readBody(event)
    const data = eventCreateSchema.parse(body)

    // Validace dat
    const startDate = new Date(data.startDate)
    const endDate = new Date(data.endDate)

    if (endDate < startDate) {
      throw createValidationError('Datum konce musí být po datu začátku')
    }

    // Generování unikátního slugu
    const slug = await generateUniqueSlug(data.title, async (s) => {
      const existing = await Event.findOne({ slug: s })
      return !!existing
    })

    // Vytvoření události
    const eventDoc = await Event.create({
      ...data,
      slug,
      startDate,
      endDate,
      published: false // Nová událost je draft
    })

    return eventDoc.toJSON()
  })
)
