/**
 * POST /api/categories
 * Vytvoření nové kategorie
 */

import { connectToDatabase } from '@/server/utils/db'
import { Category } from '@/server/models'
import { categoryCreateSchema } from '@/shared/schemas'
import { requireEditor } from '@/server/utils/auth'
import { generateUniqueSlug } from '@/server/utils/slug'
import { defineApiHandler } from '@/server/utils/errors'

export default defineEventHandler(
  defineApiHandler(async (event) => {
    // Vyžadovat editor nebo admin roli
    requireEditor(event)

    await connectToDatabase()

    // Validace vstupu
    const body = await readBody(event)
    const data = categoryCreateSchema.parse(body)

    // Generovat slug pokud není zadán
    const slug =
      data.slug ||
      (await generateUniqueSlug(data.name, async (s) => {
        const existing = await Category.findOne({ slug: s })
        return !!existing
      }))

    // Vytvořit kategorii
    const category = await Category.create({
      ...data,
      slug,
    })

    return category.toJSON()
  })
)
