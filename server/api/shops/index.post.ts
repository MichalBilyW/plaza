/**
 * POST /api/shops
 * Vytvoření nového obchodu
 */

import { connectToDatabase } from '@/server/utils/db'
import { Shop, Category } from '@/server/models'
import { shopCreateSchema } from '@/shared/schemas'
import { requireEditor } from '@/server/utils/auth'
import { generateSlug, generateUniqueSlug } from '@/server/utils/slug'
import { defineApiHandler, createNotFoundError } from '@/server/utils/errors'

export default defineEventHandler(
  defineApiHandler(async (event) => {
    // Vyžadovat editor nebo admin roli
    requireEditor(event)

    await connectToDatabase()

    // Validace vstupu
    const body = await readBody(event)
    const data = shopCreateSchema.parse(body)

    // Ověřit, že kategorie existuje
    const category = await Category.findById(data.categoryId)
    if (!category) {
      throw createNotFoundError('Kategorie')
    }

    // Generovat slug pokud není zadán
    const slug =
      data.slug ||
      (await generateUniqueSlug(data.name, async (s) => {
        const existing = await Shop.findOne({ slug: s })
        return !!existing
      }))

    // Vytvořit obchod
    const shop = await Shop.create({
      ...data,
      slug,
    })

    // Vrátit s populací
    const populated = await Shop.findById(shop._id)
      .populate('categoryId', 'name slug icon color')
      .populate('floorId', 'name level')
      .lean()

    return populated
  })
)
