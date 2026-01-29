/**
 * POST /api/categories
 * Vytvoření nové kategorie
 */

import { connectToDatabase } from '@/server/utils/db'
import { Category } from '@/server/models'
import { categoryCreateSchema } from '@/shared/schemas'
import { requireAdmin } from '@/server/utils/auth'
import { generateUniqueSlug } from '@/server/utils/slug'
import { defineApiHandler } from '@/server/utils/errors'

export default defineEventHandler(
  defineApiHandler(async (event) => {
    requireAdmin(event)

    await connectToDatabase()

    const body = await readBody(event)
    const data = categoryCreateSchema.parse(body)

    // Generování unikátního slugu
    const slug = await generateUniqueSlug(data.name, async (s) => {
      const existing = await Category.findOne({ slug: s })
      return !!existing
    })

    // Najít nejvyšší order
    const lastCategory = await Category.findOne().sort({ order: -1 })
    const order = (lastCategory?.order ?? 0) + 1

    const category = await Category.create({
      ...data,
      slug,
      order
    })

    return category.toJSON()
  })
)
