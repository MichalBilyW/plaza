/**
 * Composable pro správu interaktivní SVG mapy obchodního centra
 *
 * Poskytuje:
 * - Načítání dat pater a jednotek z API
 * - Správu aktuálně vybraného patra
 * - Hover popup (desktop) / tap popup (mobile)
 * - Klik na unit = navigace na detail obchodu
 */

import type { FloorUnitsResponse, MapUnit } from '~~/shared/map/units'

export interface MapState {
	/** Aktuálně vybrané patro (floorId) */
	currentFloorId: string | null
	/** Jednotka zobrazená v popup (hover desktop / tap mobile) */
	hoveredUnit: MapUnit | null
	/** Pozice popupu */
	popupPosition: { x: number; y: number } | null
	/** Unitcode pro CSS třídu zvýraznění */
	hoveredUnitCode: string | null
}

export function useInteractiveMap(options?: { initialFloorId?: string }) {
	const { trackMapFloorSelect, trackMapUnitClick } = useDataLayer()

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
		hoveredUnit: null,
		popupPosition: null,
		hoveredUnitCode: null,
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
		const floor = floors.value.find((f) => f.floorId === floorId)
		if (floor) {
			trackMapFloorSelect(floor.floorName, floor.level)
		}
		state.currentFloorId = floorId
		state.hoveredUnit = null
		state.popupPosition = null
		state.hoveredUnitCode = null
		// Zavolat callback pro centrování při změně patra
		nextTick(() => onFloorChangeCallback?.())
	}

	// ─── Hover logika (desktop) ───

	let hoverLeaveTimeout: ReturnType<typeof setTimeout> | null = null

	/**
	 * Zobrazit popup nad unitem (desktop hover / mobile tap)
	 * Pro prázdné jednotky zobrazí malé nevýrazné okénko
	 */
	function showUnitPopup(unitCode: string, position: { x: number; y: number }) {
		// Zrušit případný leave timeout
		if (hoverLeaveTimeout) {
			clearTimeout(hoverLeaveTimeout)
			hoverLeaveTimeout = null
		}

		const unit = unitsMap.value.get(unitCode)
		if (!unit) return

		state.hoveredUnit = unit
		state.hoveredUnitCode = unitCode
		state.popupPosition = position
	}

	/**
	 * Schovat popup s debounce (aby neblikal při přechodu mezi unity)
	 */
	function hideUnitPopup() {
		if (hoverLeaveTimeout) clearTimeout(hoverLeaveTimeout)
		hoverLeaveTimeout = setTimeout(() => {
			state.hoveredUnit = null
			state.popupPosition = null
			state.hoveredUnitCode = null
		}, 60)
	}

	/**
	 * Zrušit debounced hide (uživatel najel myší na popup)
	 */
	function cancelHide() {
		if (hoverLeaveTimeout) {
			clearTimeout(hoverLeaveTimeout)
			hoverLeaveTimeout = null
		}
	}

	/**
	 * Okamžitě schovat popup (pro tap mimo / escape)
	 */
	function closePopup() {
		if (hoverLeaveTimeout) clearTimeout(hoverLeaveTimeout)
		state.hoveredUnit = null
		state.popupPosition = null
		state.hoveredUnitCode = null
	}

	// ─── Click/Tap logika ───

	/** Upcoming shop — publishDate v budoucnosti → neklikatelný */
	function isUpcoming(unit: MapUnit): boolean {
		return !!unit.shop?.publishDate && new Date(unit.shop.publishDate).getTime() > Date.now()
	}

	/**
	 * Desktop klik = navigace na detail obchodu (ne pro upcoming)
	 */
	function handleUnitClick(unitCode: string) {
		const unit = unitsMap.value.get(unitCode)
		if (!unit?.shop) return
		if (isUpcoming(unit)) return

		trackMapUnitClick(unit.shop.name, 'shop', currentFloor.value?.floorName || 'unknown')

		navigateTo(`/obchody/${unit.shop.slug}`)
	}

	/**
	 * Mobile tap na unit:
	 * - Pokud popup není vidět nebo je jiný unit → zobrazit popup
	 * - Pokud tap na stejný unit (popup už viditelný) → navigovat na detail (ne pro upcoming/prázdné)
	 */
	function handleUnitTap(unitCode: string, position: { x: number; y: number }) {
		const unit = unitsMap.value.get(unitCode)
		if (!unit) return

		if (state.hoveredUnit?.unitCode === unitCode) {
			// Druhý tap na stejný unit → navigace (ne pro upcoming/prázdné)
			if (!unit.shop || isUpcoming(unit)) return

			trackMapUnitClick(unit.shop.name, 'shop', currentFloor.value?.floorName || 'unknown')
			navigateTo(`/obchody/${unit.shop.slug}`)
		} else {
			// První tap → zobrazit popup (i pro prázdné jednotky)
			showUnitPopup(unitCode, position)
		}
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

		const classes: string[] = ['map-unit', 'transition-all', 'duration-300']

		if (!unit?.shop) {
			// Neobsazená jednotka - ztmavit, žádná interakce
			classes.push('map-unit--empty', 'opacity-40', 'pointer-events-none')
		} else {
			// Obsazená jednotka - interaktivní
			classes.push('map-unit--occupied', 'cursor-pointer')

			if (isHovered) {
				classes.push('map-unit--selected')
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
		showUnitPopup,
		hideUnitPopup,
		cancelHide,
		handleUnitClick,
		handleUnitTap,
		closePopup,
		refresh,
		onFloorChange,

		// Helpers
		hasShop,
		getUnitClasses,
		getShopData,
	}
}
