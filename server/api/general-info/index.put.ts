/**
 * PUT /api/general-info
 * Aktualizace obecných informací o centru
 */

import { connectToDatabase } from '@/server/utils/db'
import { GeneralInfo } from '@/server/models'
import { generalInfoUpdateSchema } from '@/shared/schemas'
import { requireEditor, requireSuperAdmin } from '@/server/utils/auth'
import { defineApiHandler } from '@/server/utils/errors'

export default defineEventHandler(
	defineApiHandler(async (event) => {
		const body = await readBody(event)

		if (Object.prototype.hasOwnProperty.call(body ?? {}, 'staticAroundMap')) {
			requireSuperAdmin(event)
		} else {
			requireEditor(event)
		}

		await connectToDatabase()

		// Validace vstupu
		const data = generalInfoUpdateSchema.parse(body)

		// Získat nebo vytvořit záznam
		const info = await GeneralInfo.getOrCreate()

		// Aktualizovat
		Object.assign(info, data)
		await info.save()

		return info
	}),
)
