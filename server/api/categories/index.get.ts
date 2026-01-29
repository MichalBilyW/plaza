/**
 * GET /api/categories
 * Seznam kategorií
 */

import { connectToDatabase } from '@/server/utils/db'
import { Category, Shop } from '@/server/models'
import { defineApiHandler } from '@/server/utils/errors'

export default defineEventHandler(
  defineApiHandler(async () => {
    await connectToDatabase()

    // Načíst kategorie s počtem obchodů
    const categories = await Category.find()
      .sort({ order: 1, name: 1 })
      .lean()

    // Získat počty obchodů pro každou kategorii
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const shopCount = await Shop.countDocuments({
          categoryId: cat._id,
          active: true
        })
        return {
          ...cat,
          shopCount
        }
      })
    )

    return categoriesWithCount
  })
)
