/**
 * GET /api/shops
 * Seznam obchodů s filtrováním a stránkováním
 */

import { connectToDatabase } from '@/server/utils/db'
import { Shop } from '@/server/models'
import { shopFilterQuerySchema } from '@/shared/schemas'
import { defineApiHandler } from '@/server/utils/errors'
import type { FilterQuery } from 'mongoose'
import type { IShopDocument } from '@/server/models/Shop'

export default defineEventHandler(
  defineApiHandler(async (event) => {
    await connectToDatabase()

    // Parse a validace query parametrů
    const query = getQuery(event)
    const validatedQuery = shopFilterQuerySchema.parse(query)

    const { page, limit, sort, order, categoryId, floorId, search, isActive } = validatedQuery

    // Sestavení filtru
    const filter: FilterQuery<IShopDocument> = {}

    if (categoryId) {
      filter.categoryId = categoryId
    }

    if (floorId) {
      filter.floorId = floorId
    }

    if (typeof isActive === 'boolean') {
      filter.isActive = isActive
    } else {
      // Pro veřejné API defaultně jen aktivní
      filter.isActive = true
    }

    if (search) {
      filter.$text = { $search: search }
    }

    // Celkový počet
    const total = await Shop.countDocuments(filter)

    // Sestavení sort objektu
    const sortField = sort || 'sortOrder'
    const sortOrder = order === 'desc' ? -1 : 1
    const sortObj: Record<string, 1 | -1> = { [sortField]: sortOrder }

    // Dotaz s populací kategorie
    const shops = await Shop.find(filter)
      .populate('categoryId', 'name slug icon color')
      .populate('floorId', 'name level')
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    // Transformace pro konzistentní response
    const data = shops.map((shop) => ({
      ...shop,
      _id: shop._id.toString(),
      category: shop.categoryId,
      floor: shop.floorId,
      categoryId: typeof shop.categoryId === 'object' ? (shop.categoryId as { _id: unknown })._id?.toString() : shop.categoryId?.toString(),
      floorId: shop.floorId ? (typeof shop.floorId === 'object' ? (shop.floorId as { _id: unknown })._id?.toString() : shop.floorId?.toString()) : undefined,
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
