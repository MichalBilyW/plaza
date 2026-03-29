/**
 * Typy pro interaktivní SVG mapu obchodního centra
 *
 * Jednotky jsou dynamicky extrahovány ze SVG souborů.
 * SVG elementy používají formát: <g id="unit_{unitCode}">
 * Shop.unitCode (např. "S11") odpovídá SVG elementu "unit_S11"
 */

// ==========================================
// TYPES
// ==========================================

/** Otevírací hodiny pro dnešní den */
export interface TodayOpeningHours {
	/** Zda je dnes otevřeno */
	isOpen: boolean
	/** Čas otevření (např. "09:00") */
	openTime?: string
	/** Čas zavření (např. "21:00") */
	closeTime?: string
	/** Formátovaný text (např. "9:00 - 21:00" nebo "Zavřeno") */
	formatted: string
}

/** Data obchodu pro zobrazení v mapě */
export interface MapShopData {
	_id: string
	name: string
	slug: string
	logo?: string
	isActive: boolean
	/** Dnešní otevírací hodiny */
	todayHours: TodayOpeningHours
}

/** Jednotka mapy s přiřazeným obchodem */
export interface MapUnit {
	/** Kód jednotky (např. "S11", "134") - odpovídá SVG id "unit_S11" */
	unitCode: string
	/** ID patra (MongoDB _id) */
	floorId: string
	/** Přiřazený obchod (null pokud jednotka není obsazená) */
	shop: MapShopData | null
}

/** Odpověď API pro jednotky patra */
export interface FloorUnitsResponse {
	/** ID patra */
	floorId: string
	/** Název patra */
	floorName: string
	/** Level patra (0 = přízemí, 1 = 1. patro, atd.) */
	level: number
	/** Cesta k SVG souboru */
	svgMap?: string
	/** Seznam jednotek s přiřazenými obchody */
	units: MapUnit[]
}

// ==========================================
// SVG HELPER FUNKCE
// ==========================================

/** Regex pro extrakci unitCode z SVG element ID */
const UNIT_ID_REGEX = /^unit_(.+)$/

/**
 * Extrahuje unitCode z SVG element ID
 * @example extractUnitCode("unit_S11") => "S11"
 * @example extractUnitCode("unit_134") => "134"
 */
export function extractUnitCode(elementId: string): string | null {
	const match = elementId.match(UNIT_ID_REGEX)
	return match?.[1] ?? null
}

/**
 * Vytvoří SVG element ID z unitCode
 * @example createUnitElementId("S11") => "unit_S11"
 */
export function createUnitElementId(unitCode: string): string {
	return `unit_${unitCode}`
}

/**
 * Extrahuje všechny unitCodes z SVG stringu
 * Hledá elementy s id="unit_*" nebo id='unit_*'
 */
export function extractUnitCodesFromSvg(svgContent: string): string[] {
	const regex = /id=["']unit_([^"']+)["']/g
	const unitCodes: string[] = []
	let match

	while ((match = regex.exec(svgContent)) !== null) {
		if (match[1]) {
			unitCodes.push(match[1])
		}
	}

	return unitCodes
}

// ==========================================
// KONSTANTY PRO SVG ANIMACI
// ==========================================

/**
 * Skupiny ve static_around.svg pro animaci
 * Pořadí definuje sekvenci animace při scrollu
 */
export const STATIC_AROUND_GROUPS = ['Cesty', 'Budovy', 'Pudorys'] as const

export type StaticAroundGroup = (typeof STATIC_AROUND_GROUPS)[number]
