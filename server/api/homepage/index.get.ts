/**
 * GET /api/homepage
 * Získání nastavení hlavní stránky
 */

import { connectToDatabase } from '@/server/utils/db'
import { Homepage } from '@/server/models'
import { defineApiHandler } from '@/server/utils/errors'

export default defineEventHandler(
	defineApiHandler(async () => {
		await connectToDatabase()

		const homepage = await Homepage.getOrCreate()
		return homepage
	}),
)
