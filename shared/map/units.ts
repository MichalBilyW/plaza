/**
 * Definice jednotek (units) mapy obchodního centra
 *
 * Každé patro má své jednotky s pevně danými ID.
 * Jednotky jsou definovány jako konstantní pole a používají se:
 * - V SVG mapách jako ID elementů
 * - V CMS pro přiřazení obchodů k pozicím
 * - V API pro vrácení obsazenosti
 */

// ==========================================
// TYPES
// ==========================================

export interface MapUnit {
  /** Unikátní ID jednotky (např. "1-A", "1-B") */
  id: string
  /** Popisný název umístění */
  label: string
  /** ID patra ke kterému jednotka patří */
  floorLevel: number
  /** Souřadnice pro jednoduché SVG (x, y, width, height) */
  position: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface FloorUnits {
  /** Číslo patra (0 = přízemí, 1 = 1. patro, atd.) */
  level: number
  /** Seznam jednotek na patře */
  units: MapUnit[]
}

export interface UnitWithShop extends MapUnit {
  /** Přiřazený obchod (pokud existuje) */
  shop?: {
    _id: string
    name: string
    slug: string
    logo?: string
    isActive: boolean
  } | null
}

// ==========================================
// CONSTANTS - Definice jednotek pro každé patro
// ==========================================

/**
 * Jednotky pro přízemí (level 0)
 * Pro testovací účely: 4 čtverce vedle sebe
 */
export const FLOOR_0_UNITS: MapUnit[] = [
  {
    id: '0-A',
    label: 'Jednotka A',
    floorLevel: 0,
    position: { x: 10, y: 50, width: 80, height: 100 },
  },
  {
    id: '0-B',
    label: 'Jednotka B',
    floorLevel: 0,
    position: { x: 110, y: 50, width: 80, height: 100 },
  },
  {
    id: '0-C',
    label: 'Jednotka C',
    floorLevel: 0,
    position: { x: 210, y: 50, width: 80, height: 100 },
  },
  {
    id: '0-D',
    label: 'Jednotka D',
    floorLevel: 0,
    position: { x: 310, y: 50, width: 80, height: 100 },
  },
]

/**
 * Jednotky pro 1. patro (level 1)
 * Pro testovací účely: 4 čtverce vedle sebe
 */
export const FLOOR_1_UNITS: MapUnit[] = [
  {
    id: '1-A',
    label: 'Jednotka A',
    floorLevel: 1,
    position: { x: 10, y: 50, width: 80, height: 100 },
  },
  {
    id: '1-B',
    label: 'Jednotka B',
    floorLevel: 1,
    position: { x: 110, y: 50, width: 80, height: 100 },
  },
  {
    id: '1-C',
    label: 'Jednotka C',
    floorLevel: 1,
    position: { x: 210, y: 50, width: 80, height: 100 },
  },
  {
    id: '1-D',
    label: 'Jednotka D',
    floorLevel: 1,
    position: { x: 310, y: 50, width: 80, height: 100 },
  },
]

/**
 * Jednotky pro 2. patro (level 2)
 * Pro testovací účely: 4 čtverce vedle sebe
 */
export const FLOOR_2_UNITS: MapUnit[] = [
  {
    id: '2-A',
    label: 'Jednotka A',
    floorLevel: 2,
    position: { x: 10, y: 50, width: 80, height: 100 },
  },
  {
    id: '2-B',
    label: 'Jednotka B',
    floorLevel: 2,
    position: { x: 110, y: 50, width: 80, height: 100 },
  },
  {
    id: '2-C',
    label: 'Jednotka C',
    floorLevel: 2,
    position: { x: 210, y: 50, width: 80, height: 100 },
  },
  {
    id: '2-D',
    label: 'Jednotka D',
    floorLevel: 2,
    position: { x: 310, y: 50, width: 80, height: 100 },
  },
]

// ==========================================
// AGREGOVANÉ KONSTANTY
// ==========================================

/**
 * Všechny jednotky seskupené podle patra
 */
export const ALL_FLOOR_UNITS: FloorUnits[] = [
  { level: 0, units: FLOOR_0_UNITS },
  { level: 1, units: FLOOR_1_UNITS },
  { level: 2, units: FLOOR_2_UNITS },
]

/**
 * Všechny jednotky jako ploché pole
 */
export const ALL_UNITS: MapUnit[] = [
  ...FLOOR_0_UNITS,
  ...FLOOR_1_UNITS,
  ...FLOOR_2_UNITS,
]

/**
 * Mapa jednotek podle ID pro rychlý přístup
 */
export const UNITS_BY_ID: Record<string, MapUnit> = ALL_UNITS.reduce(
  (acc, unit) => {
    acc[unit.id] = unit
    return acc
  },
  {} as Record<string, MapUnit>
)

// ==========================================
// HELPER FUNKCE
// ==========================================

/**
 * Získá jednotky pro dané patro
 */
export function getUnitsForFloor(level: number): MapUnit[] {
  const floor = ALL_FLOOR_UNITS.find((f) => f.level === level)
  return floor?.units ?? []
}

/**
 * Získá jednotku podle ID
 */
export function getUnitById(id: string): MapUnit | undefined {
  return UNITS_BY_ID[id]
}

/**
 * Zkontroluje, zda ID jednotky existuje
 */
export function isValidUnitId(id: string): boolean {
  return id in UNITS_BY_ID
}

/**
 * Získá všechna validní ID jednotek
 */
export function getAllUnitIds(): string[] {
  return ALL_UNITS.map((u) => u.id)
}

/**
 * Získá ID jednotek pro dané patro
 */
export function getUnitIdsForFloor(level: number): string[] {
  return getUnitsForFloor(level).map((u) => u.id)
}
