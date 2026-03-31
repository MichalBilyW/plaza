/**
 * Composable pro správu interaktivní SVG mapy obchodního centra
 *
 * Poskytuje:
 * - Načítání dat pater a jednotek z API
 * - Správu aktuálně vybraného patra
 * - Hover/click stav jednotek
 * - Helper pro stylování SVG elementů
 */

import type { FloorUnitsResponse, MapUnit } from '~~/shared/map/units'

export interface MapState {
	/** Aktuálně vybrané patro (floorId) */
	currentFloorId: string | null
	/** Jednotka nad kterou je kurzor */
	hoveredUnitCode: string | null
	/** Jednotka, která je vybraná (pro popup) */
	selectedUnit: MapUnit | null
	/** Pozice popupu */
	popupPosition: { x: number; y: number } | null
}

export function useInteractiveMap(options?: { initialFloorId?: string }) {
	// Data z API - server: false odstraněno, data jsou v SSR payload = okamžitě dostupná
	const {
		data: mapData,
		pending,
		error,
		refresh,
	} = useFetch<{
		floors: FloorUnitsResponse[]
		totalUnits: number
		occupiedUnits: number
		staticAroundMap: string | null
		staticAroundMapContent: string | null
	}>('/api/map/units', { key: 'map-units' })

	// Computed: seznam pater
	const floors = computed(() => mapData.value?.floors ?? [])

	// Computed: cesta k SVG okolí
	const staticAroundMap = computed(() => mapData.value?.staticAroundMap ?? null)

	// Computed: inline obsah SVG okolí
	const staticAroundMapContent = computed(() => mapData.value?.staticAroundMapContent ?? null)

	// Reactive state
	const state = reactive<MapState>({
		currentFloorId: null,
		hoveredUnitCode: null,
		selectedUnit: null,
		popupPosition: null,
	})

	// Computed: aktuální patro
	const currentFloor = computed(() => {
		if (!state.currentFloorId) return null
		return floors.value.find((f) => f.floorId === state.currentFloorId) ?? null
	})

	// Computed: jednotky aktuálního patra
	const currentUnits = computed(() => currentFloor.value?.units ?? [])

	// Computed: mapa unitCode -> jednotka pro rychlý přístup
	const unitsMap = computed(() => {
		const map = new Map<string, MapUnit>()
		for (const unit of currentUnits.value) {
			map.set(unit.unitCode, unit)
		}
		return map
	})

	// Callback pro centrování mapy (nastaví se z komponenty)
	let onFloorChangeCallback: (() => void) | null = null

	function onFloorChange(callback: () => void) {
		onFloorChangeCallback = callback
	}

	// Při načtení dat automaticky vybrat patro
	watch(
		floors,
		(newFloors) => {
			if (newFloors.length === 0) return

			// Zkontrolovat jestli aktuální patro existuje v datech
			const currentExists = newFloors.some((f) => f.floorId === state.currentFloorId)

			// Pokud není vybrané patro nebo neexistuje, vybrat defaultní
			if (!state.currentFloorId || !currentExists) {
				// Pokud je zadané initialFloorId, použít ho
				if (options?.initialFloorId) {
					const initialFloor = newFloors.find((f) => f.floorId === options.initialFloorId)
					if (initialFloor) {
						state.currentFloorId = initialFloor.floorId
						nextTick(() => onFloorChangeCallback?.())
						return
					}
				}
				// Jinak preferovat 1. patro (level: 1)
				const defaultFloor = newFloors.find((f) => f.level === 1) ?? newFloors[0]
				if (defaultFloor) {
					state.currentFloorId = defaultFloor.floorId
					// Zavolat callback pro centrování po prvním načtení
					nextTick(() => onFloorChangeCallback?.())
				}
			}
		},
		{ immediate: true },
	)

	/**
	 * Přepne na jiné patro
	 */
	function selectFloor(floorId: string) {
		state.currentFloorId = floorId
		state.selectedUnit = null
		state.popupPosition = null
		// Zavolat callback pro centrování při změně patra
		nextTick(() => onFloorChangeCallback?.())
	}

	/**
	 * Handler pro hover nad jednotkou
	 */
	function handleUnitHover(unitCode: string | null) {
		state.hoveredUnitCode = unitCode
	}

	/**
	 * Handler pro kliknutí na jednotku
	 */
	function handleUnitClick(unitCode: string, event: MouseEvent) {
		const unit = unitsMap.value.get(unitCode)
		if (!unit) return

		// Pokud jednotka nemá přiřazený obchod, ignorovat kliknutí
		if (!unit.shop) return

		// Nastavit vybranou jednotku a pozici popupu
		state.selectedUnit = unit
		state.popupPosition = {
			x: event.clientX,
			y: event.clientY,
		}
	}

	/**
	 * Zavře popup
	 */
	function closePopup() {
		state.selectedUnit = null
		state.popupPosition = null
	}

	/**
	 * Kontroluje, zda má jednotka přiřazený aktivní obchod
	 */
	function hasShop(unitCode: string): boolean {
		const unit = unitsMap.value.get(unitCode)
		return !!unit?.shop
	}

	/**
	 * Vrátí CSS třídy pro jednotku v SVG
	 */
	function getUnitClasses(unitCode: string): string {
		const unit = unitsMap.value.get(unitCode)
		const isHovered = state.hoveredUnitCode === unitCode
		const isSelected = state.selectedUnit?.unitCode === unitCode

		const classes: string[] = ['map-unit', 'transition-all', 'duration-300']

		if (!unit?.shop) {
			// Neobsazená jednotka - ztmavit, žádná interakce
			classes.push('map-unit--empty', 'opacity-40', 'pointer-events-none')
		} else {
			// Obsazená jednotka - interaktivní
			classes.push('map-unit--occupied', 'cursor-pointer')

			if (isSelected) {
				classes.push('map-unit--selected')
			} else if (isHovered) {
				classes.push('map-unit--hovered')
			}
		}

		return classes.join(' ')
	}

	/**
	 * Vrátí data obchodu pro jednotku (pro tooltip/popup)
	 */
	function getShopData(unitCode: string) {
		const unit = unitsMap.value.get(unitCode)
		return unit?.shop ?? null
	}

	return {
		// Data
		floors,
		currentFloor,
		currentUnits,
		unitsMap,
		staticAroundMap,
		staticAroundMapContent,
		pending,
		error,

		// State
		state,

		// Actions
		selectFloor,
		handleUnitHover,
		handleUnitClick,
		closePopup,
		refresh,
		onFloorChange,

		// Helpers
		hasShop,
		getUnitClasses,
		getShopData,
	}
}
