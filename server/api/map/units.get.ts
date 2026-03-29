/**
 * GET /api/map/units
 *
 * Vrací seznam jednotek mapy s informací o obsazenosti a dnešních otevíracích hodinách.
 * Jednotky jsou dynamicky extrahovány ze SVG souborů uložených u pater.
 *
 * Query params:
 * - floorId: Filtrovat podle ID patra
 */

import { Floor, Shop, GeneralInfo } from '@/server/models'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { connectToDatabase } from '@/server/utils/db'
import {
	extractUnitCodesFromSvg,
	type FloorUnitsResponse,
	type MapShopData,
	type MapUnit,
	type TodayOpeningHours,
} from '@/shared/map/units'
import type { DayOfWeek } from '@/shared/types'

const DAYS_MAP: DayOfWeek[] = [
	'sunday',
	'monday',
	'tuesday',
	'wednesday',
	'thursday',
	'friday',
	'saturday',
]

/**
 * Vypočítá dnešní otevírací hodiny pro obchod
 */
function getTodayOpeningHours(
	openingHours?: Array<{ day: DayOfWeek; open: string; close: string; closed?: boolean }>,
	specialOpeningHours?: Array<{
		date?: Date
		dateFrom?: Date
		dateTo?: Date
		open?: string
		close?: string
		closed?: boolean
	}>,
): TodayOpeningHours {
	const today = new Date()
	const todayDayOfWeek = DAYS_MAP[today.getDay()]
	const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())

	// Kontrola speciálních otevíracích hodin
	if (specialOpeningHours) {
		for (const special of specialOpeningHours) {
			// Jednotlivý den
			if (special.date) {
				const specialDate = new Date(special.date)
				const specialDateOnly = new Date(
					specialDate.getFullYear(),
					specialDate.getMonth(),
					specialDate.getDate(),
				)
				if (specialDateOnly.getTime() === todayDateOnly.getTime()) {
					if (special.closed) {
						return { isOpen: false, formatted: 'Zavřeno' }
					}
					if (special.open && special.close) {
						return {
							isOpen: true,
							openTime: special.open,
							closeTime: special.close,
							formatted: `${special.open} - ${special.close}`,
						}
					}
				}
			}
			// Období od-do
			if (special.dateFrom && special.dateTo) {
				const fromDate = new Date(special.dateFrom)
				const toDate = new Date(special.dateTo)
				if (todayDateOnly >= fromDate && todayDateOnly <= toDate) {
					if (special.closed) {
						return { isOpen: false, formatted: 'Zavřeno' }
					}
					if (special.open && special.close) {
						return {
							isOpen: true,
							openTime: special.open,
							closeTime: special.close,
							formatted: `${special.open} - ${special.close}`,
						}
					}
				}
			}
		}
	}

	// Běžné otevírací hodiny
	if (openingHours) {
		const todayHours = openingHours.find((h) => h.day === todayDayOfWeek)
		if (todayHours) {
			if (todayHours.closed) {
				return { isOpen: false, formatted: 'Zavřeno' }
			}
			return {
				isOpen: true,
				openTime: todayHours.open,
				closeTime: todayHours.close,
				formatted: `${todayHours.open} - ${todayHours.close}`,
			}
		}
	}

	return { isOpen: false, formatted: 'Neuvedeno' }
}

/**
 * Načte SVG soubor a extrahuje unit kódy
 */
async function getUnitCodesFromSvgFile(svgPath: string): Promise<string[]> {
	if (!svgPath) return []

	try {
		// SVG soubory nahrané přes /api/upload jsou uloženy v public/uploads/
		// ale servírované přes /api/uploads/filename
		// Musíme převést /api/uploads/filename.svg -> public/uploads/filename.svg
		let relativePath = svgPath.startsWith('/') ? svgPath.slice(1) : svgPath
		if (relativePath.startsWith('api/uploads/')) {
			relativePath = relativePath.replace('api/uploads/', 'uploads/')
		}

		const publicDir = join(process.cwd(), 'public')
		const fullPath = join(publicDir, relativePath)

		const svgContent = await readFile(fullPath, 'utf-8')
		return extractUnitCodesFromSvg(svgContent)
	} catch (error) {
		console.warn(`Could not read SVG file ${svgPath}:`, error)
		return []
	}
}

export default defineEventHandler(async (event) => {
	const query = getQuery(event)
	const filterFloorId = query.floorId as string | undefined

	await connectToDatabase()

	// Získáme GeneralInfo pro staticAroundMap
	const generalInfo = await GeneralInfo.findOne().lean()
	const staticAroundMap = generalInfo?.staticAroundMap || null

	// Získáme patra z databáze - seřazeno podle sortOrder
	const floorsQuery = filterFloorId ? { _id: filterFloorId, isActive: true } : { isActive: true }

	const floors = await Floor.find(floorsQuery).sort({ sortOrder: 1, level: 1 }).lean()

	// Získáme všechny obchody s přiřazenou jednotkou
	const shops = await Shop.find(
		{ unitCode: { $exists: true, $ne: '' }, isActive: true },
		{
			_id: 1,
			name: 1,
			slug: 1,
			logo: 1,
			isActive: 1,
			unitCode: 1,
			floorId: 1,
			openingHours: 1,
			specialOpeningHours: 1,
		},
	).lean()

	// Vytvoříme mapu unitCode -> shop data s dnešními hodinami
	const shopsByUnitCode = new Map<string, MapShopData>()
	for (const shop of shops) {
		if (shop.unitCode) {
			shopsByUnitCode.set(shop.unitCode, {
				_id: shop._id.toString(),
				name: shop.name,
				slug: shop.slug,
				logo: shop.logo,
				isActive: shop.isActive,
				todayHours: getTodayOpeningHours(shop.openingHours, shop.specialOpeningHours),
			})
		}
	}

	// Pro každé patro získáme jednotky ze SVG
	const floorsResponse: FloorUnitsResponse[] = await Promise.all(
		floors.map(async (floor) => {
			const floorId = floor._id.toString()
			const unitCodes = floor.svgMap ? await getUnitCodesFromSvgFile(floor.svgMap) : []

			const units: MapUnit[] = unitCodes.map((unitCode) => ({
				unitCode,
				floorId,
				shop: shopsByUnitCode.get(unitCode) ?? null,
			}))

			return {
				floorId,
				floorName: floor.name,
				level: floor.level,
				svgMap: floor.svgMap,
				units,
			}
		}),
	)

	// Pokud filtrujeme podle patra, vrátíme jen to jedno
	if (filterFloorId && floorsResponse.length === 1) {
		return floorsResponse[0]
	}

	// Statistiky
	const totalUnits = floorsResponse.reduce((sum, f) => sum + f.units.length, 0)
	const occupiedUnits = floorsResponse.reduce(
		(sum, f) => sum + f.units.filter((u) => u.shop !== null).length,
		0,
	)

	return {
		floors: floorsResponse,
		totalUnits,
		occupiedUnits,
		staticAroundMap,
	}
})
