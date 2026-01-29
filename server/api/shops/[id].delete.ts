/**
 * DELETE /api/shops/:id
 * Smazání obchodu
 */

import { connectToDatabase } from '@/server/utils/db'
import { Shop } from '@/server/models'
import { requireAdmin } from '@/server/utils/auth'
import { defineApiHandler, createNotFoundError } from '@/server/utils/errors'

export default defineEventHandler(
  defineApiHandler(async (event) => {
    // Mazání pouze pro adminy
    requireAdmin(event)

    await connectToDatabase()

    const id = getRouterParam(event, 'id')

    const shop = await Shop.findById(id)
    if (!shop) {
      throw createNotFoundError('Obchod')
    }

    await shop.deleteOne()

    return { success: true, message: 'Obchod byl smazán' }
  })
)
