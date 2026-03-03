/**
 * PUT /api/categories/:id
 * Úprava kategorie
 */

import { connectToDatabase } from '@/server/utils/db'
import { Category } from '@/server/models'
import { categoryUpdateSchema } from '@/shared/schemas'
import { requireEditor } from '@/server/utils/auth'
import { generateUniqueSlug } from '@/server/utils/slug'
import { defineApiHandler, createNotFoundError, createValidationError } from '@/server/utils/errors'

export default defineEventHandler(
  defineApiHandler(async (event) => {
    requireEditor(event)

    await connectToDatabase()

    const id = getRouterParam(event, 'id')

    // Najít kategorii
    const category = await Category.findById(id)
    if (!category) {
      throw createNotFoundError('Kategorie')
    }

    // Validace vstupu
    const body = await readBody(event)
    const data = categoryUpdateSchema.parse(body)

    // Pokud se mění název a není explicitně zadán slug, vygenerovat nový
    if (data.name && data.name !== category.name && !data.slug) {
      data.slug = await generateUniqueSlug(data.name, async (s) => {
        const existing = await Category.findOne({ slug: s, _id: { $ne: id } })
        return !!existing
      })
    }

    // Pokud je explicitně zadán slug, zkontrolovat unikátnost
    if (data.slug && data.slug !== category.slug) {
      const existing = await Category.findOne({ slug: data.slug, _id: { $ne: id } })
      if (existing) {
        throw createValidationError('Slug již existuje')
      }
    }

    // Aktualizovat
    Object.assign(category, data)
    await category.save()

    return category.toJSON()
  })
)
