/**
 * GET /api/map/units
 *
 * Vrací seznam všech jednotek mapy s informací o obsazenosti.
 * Může být filtrováno podle patra (level query param).
 */

import { Shop } from '@/server/models'
import {
	ALL_FLOOR_UNITS,
	getUnitsForFloor,
	type MapUnit,
	type UnitWithShop,
} from '@/shared/map/units'

interface ShopForUnit {
	_id: string
	name: string
	slug: string
	logo?: string
	isActive: boolean
}

export default defineEventHandler(async (event) => {
	const query = getQuery(event)
	const level = query.level !== undefined ? Number(query.level) : undefined

	// Získáme všechny obchody s přiřazenou jednotkou
	const shops = await Shop.find(
		{ unitCode: { $exists: true, $ne: '' } },
		{ _id: 1, name: 1, slug: 1, logo: 1, isActive: 1, unitCode: 1, floorId: 1 },
	).lean()

	// Vytvoříme mapu unitCode -> shop
	const shopsByUnitCode = new Map<string, ShopForUnit>()
	for (const shop of shops) {
		if (shop.unitCode) {
			shopsByUnitCode.set(shop.unitCode, {
				_id: shop._id.toString(),
				name: shop.name,
				slug: shop.slug,
				logo: shop.logo,
				isActive: shop.isActive,
			})
		}
	}

	// Získáme jednotky (všechny nebo pro konkrétní patro)
	let units: MapUnit[]
	if (level !== undefined && !isNaN(level)) {
		units = getUnitsForFloor(level)
	} else {
		units = ALL_FLOOR_UNITS.flatMap((f) => f.units)
	}

	// Přidáme informace o obchodech
	const unitsWithShops: UnitWithShop[] = units.map((unit) => ({
		...unit,
		shop: shopsByUnitCode.get(unit.id) ?? null,
	}))

	// Seskupíme podle patra pokud není filtrováno
	if (level !== undefined && !isNaN(level)) {
		return {
			level,
			units: unitsWithShops,
		}
	}

	// Vrátíme seskupené podle pater
	const floors = ALL_FLOOR_UNITS.map((floor) => ({
		level: floor.level,
		units: unitsWithShops.filter((u) => u.floorLevel === floor.level),
	}))

	return {
		floors,
		totalUnits: units.length,
		occupiedUnits: unitsWithShops.filter((u) => u.shop !== null).length,
	}
})
