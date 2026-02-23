/**
 * GET /api/floors
 * Seznam pater s filtrováním a stránkováním
 */

import { connectToDatabase } from '@/server/utils/db'
import { Floor } from '@/server/models'
import { paginationQuerySchema } from '@/shared/schemas'
import { defineApiHandler } from '@/server/utils/errors'
import type { FilterQuery } from 'mongoose'
import type { IFloorDocument } from '@/server/models/Floor'

export default defineEventHandler(
  defineApiHandler(async (event) => {
    await connectToDatabase()

    // Parse a validace query parametrů
    const query = getQuery(event)
    const validatedQuery = paginationQuerySchema.parse(query)

    const { page, limit, sort, order } = validatedQuery

    // Pro veřejné API defaultně jen aktivní
    const filter: FilterQuery<IFloorDocument> = { isActive: true }

    // Celkový počet
    const total = await Floor.countDocuments(filter)

    // Sestavení sort objektu
    const sortField = sort || 'level'
    const sortOrder = order === 'desc' ? -1 : 1
    const sortObj: Record<string, 1 | -1> = { [sortField]: sortOrder }

    // Dotaz
    const floors = await Floor.find(filter)
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    // Transformace pro konzistentní response
    const data = floors.map((floor) => ({
      ...floor,
      _id: floor._id.toString(),
    }))

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  })
)
