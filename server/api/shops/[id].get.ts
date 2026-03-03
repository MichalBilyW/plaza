/**
 * GET /api/shops/:id
 * Detail obchodu
 */

import { connectToDatabase } from '@/server/utils/db'
import { Shop } from '@/server/models'
import { defineApiHandler, createNotFoundError } from '@/server/utils/errors'

export default defineEventHandler(
  defineApiHandler(async (event) => {
    await connectToDatabase()

    const id = getRouterParam(event, 'id')

    const shop = await Shop.findById(id)
      .populate('floorId', 'name level')
      .populate('categoryId', 'name slug icon color')
      .lean()

    if (!shop) {
      throw createNotFoundError('Obchod')
    }

    // Transformace
    return {
      ...shop,
      _id: shop._id.toString(),
      floor: shop.floorId,
      category: shop.categoryId,
    }
  })
)
