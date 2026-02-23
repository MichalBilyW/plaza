/**
 * GET /api/general-info
 * Získání obecných informací o centru
 */

import { connectToDatabase } from '@/server/utils/db'
import { GeneralInfo } from '@/server/models'
import { defineApiHandler } from '@/server/utils/errors'

export default defineEventHandler(
  defineApiHandler(async () => {
    await connectToDatabase()

    const info = await GeneralInfo.getOrCreate()
    return info
  })
)
