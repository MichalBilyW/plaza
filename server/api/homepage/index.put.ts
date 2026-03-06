/**
 * PUT /api/homepage
 * Aktualizace nastavení hlavní stránky
 */

import { connectToDatabase } from '@/server/utils/db'
import { Homepage } from '@/server/models'
import { homepageUpdateSchema } from '@/shared/schemas'
import { requireEditor } from '@/server/utils/auth'
import { defineApiHandler } from '@/server/utils/errors'

export default defineEventHandler(
  defineApiHandler(async (event) => {
    requireEditor(event)

    await connectToDatabase()

    // Validace vstupu
    const body = await readBody(event)
    const data = homepageUpdateSchema.parse(body)

    // Získat nebo vytvořit záznam
    const homepage = await Homepage.getOrCreate()

    // Aktualizovat
    Object.assign(homepage, data)
    await homepage.save()

    return homepage
  })
)
