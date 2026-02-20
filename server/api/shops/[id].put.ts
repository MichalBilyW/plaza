/**
 * PUT /api/shops/:id
 * Úprava obchodu
 */

import { connectToDatabase } from '@/server/utils/db'
import { Shop } from '@/server/models'
import { shopUpdateSchema } from '@/shared/schemas'
import { requireEditor } from '@/server/utils/auth'
import { generateUniqueSlug } from '@/server/utils/slug'
import { defineApiHandler, createNotFoundError } from '@/server/utils/errors'

export default defineEventHandler(
  defineApiHandler(async (event) => {
    requireEditor(event)

    await connectToDatabase()

    const id = getRouterParam(event, 'id')

    // Najít obchod
    const shop = await Shop.findById(id)
    if (!shop) {
      throw createNotFoundError('Obchod')
    }

    // Validace vstupu
    const body = await readBody(event)
    const data = shopUpdateSchema.parse(body)

    // Pokud se mění název a není explicitně zadán slug, vygenerovat nový
    if (data.name && data.name !== shop.name && !data.slug) {
      data.slug = await generateUniqueSlug(data.name, async (s) => {
        const existing = await Shop.findOne({ slug: s, _id: { $ne: id } })
        return !!existing
      })
    }

    // Pokud je explicitně zadán slug, zkontrolovat unikátnost
    if (data.slug && data.slug !== shop.slug) {
      const existing = await Shop.findOne({ slug: data.slug, _id: { $ne: id } })
      if (existing) {
        throw createNotFoundError('Slug již existuje')
      }
    }

    // Aktualizovat
    Object.assign(shop, data)
    await shop.save()

    // Vrátit s populací
    const populated = await Shop.findById(id)
      .populate('floorId', 'name level')
      .lean()

    return populated
  })
)
