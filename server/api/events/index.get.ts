/**
 * GET /api/events
 * Seznam akcí a novinek s filtrováním a stránkováním
 */

import { connectToDatabase } from '@/server/utils/db'
import { Event } from '@/server/models'
import { eventsQuerySchema } from '@/shared/schemas'
import { defineApiHandler } from '@/server/utils/errors'
import type { FilterQuery } from 'mongoose'
import type { IEvent } from '@/server/models'

export default defineEventHandler(
  defineApiHandler(async (event) => {
    await connectToDatabase()

    const query = getQuery(event)
    const filters = eventsQuerySchema.parse(query)

    // Sestavení filtru
    const filter: FilterQuery<IEvent> = {}

    if (filters.published !== undefined) {
      filter.published = filters.published
    }

    // Defaultně zobrazit jen nadcházející nebo probíhající události
    if (filters.upcoming) {
      filter.endDate = { $gte: new Date() }
    }

    if (filters.search) {
      filter.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } }
      ]
    }

    // Stránkování
    const page = filters.page || 1
    const limit = filters.limit || 20
    const skip = (page - 1) * limit

    // Získání dat
    const [events, total] = await Promise.all([
      Event.find(filter)
        .sort({ startDate: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Event.countDocuments(filter)
    ])

    return {
      data: events,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  })
)
