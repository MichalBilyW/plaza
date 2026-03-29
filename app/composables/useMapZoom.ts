/**
 * Composable pro zoom/pan interaktivní mapy pomocí @panzoom/panzoom
 *
 * Funkce:
 * - Double click/tap zoom
 * - Tlačítka pro diskrétní zoom úrovně
 * - Pan pouze při přiblížení (myší na desktopu)
 * - Touch gesta zakázané (neblokují scroll stránky)
 */

import Panzoom from '@panzoom/panzoom'
type PanzoomObject = ReturnType<typeof Panzoom>

interface ZoomLevel {
	value: number
	label: string
}

const ALL_ZOOM_LEVELS: ZoomLevel[] = [
	{ value: 1, label: '1×' },
	{ value: 2, label: '2×' },
	{ value: 3, label: '3×' },
]

const MD_BREAKPOINT = 768

export function useMapZoom() {
	const mapContainerRef = ref<HTMLElement | null>(null)
	const mapContentRef = ref<HTMLElement | null>(null)
	const isMobile = ref(false)
	const isTouch = ref(false)
	const currentScale = ref(1)

	let panzoomInstance: PanzoomObject | null = null

	// Detekce breakpointu a touch zařízení
	function checkBreakpoint() {
		isMobile.value = window.innerWidth < MD_BREAKPOINT
		isTouch.value = 'ontouchstart' in window || navigator.maxTouchPoints > 0
	}

	// Zoom úrovně podle breakpointu
	const zoomLevels = computed(() => {
		if (isMobile.value) return ALL_ZOOM_LEVELS
		return ALL_ZOOM_LEVELS.filter((l) => l.value <= 2)
	})

	const maxZoom = computed(() => (isMobile.value ? 3 : 2))

	// Aktivní úroveň zoomu (zaokrouhlená)
	const activeZoomLevel = computed(() => Math.round(currentScale.value))

	// Je přiblíženo? (pro cursor logic)
	const isZoomed = computed(() => currentScale.value > 1.1)

	// Inicializace panzoom
	function initPanzoom() {
		const content = mapContentRef.value
		const container = mapContainerRef.value
		if (!content || !container) return

		// Zrušit předchozí instanci
		if (panzoomInstance) {
			panzoomInstance.destroy()
			panzoomInstance = null
		}

		panzoomInstance = Panzoom(content, {
			maxScale: maxZoom.value,
			minScale: 1,
			contain: 'outside',
			startScale: 1,
			startX: 0,
			startY: 0,
			cursor: 'default',
			panOnlyWhenZoomed: true,
			animate: true,
			duration: 200,
			easing: 'ease-out',
			// KLÍČOVÉ: Zakázat touch gesta - neblokují scroll stránky
			touchAction: 'auto',
			// Na touch zařízeních zakázat pan (koliduje se scrollem)
			disablePan: isTouch.value,
		})

		// Double click/tap zoom
		container.addEventListener('dblclick', handleDoubleClick)

		// Aktualizovat currentScale při změně
		content.addEventListener('panzoomchange', (e: Event) => {
			const detail = (e as CustomEvent).detail
			currentScale.value = detail.scale
		})

		// Posunout mapu dolů - prvních 25% je jen ilustrace
		scrollToContent()
	}

	// Posunout mapu tak, aby byl vidět hlavní obsah (od 30% výšky)
	function scrollToContent(animate = false) {
		if (!panzoomInstance || !mapContentRef.value || !mapContainerRef.value) return

		const contentHeight = mapContentRef.value.offsetHeight
		const containerHeight = mapContainerRef.value.offsetHeight

		// Posunout o 25% výšky obsahu nahoru (záporná hodnota = obsah jde nahoru = vidíme spodní část)
		const offsetY = -(contentHeight * 0.25)

		// Omezit aby se nepřescrollovalo
		const maxOffset = -(contentHeight - containerHeight)
		const clampedOffset = Math.max(offsetY, maxOffset)

		panzoomInstance.pan(0, clampedOffset, { animate })
	}

	// Double click/tap zoom
	function handleDoubleClick(e: MouseEvent) {
		if (!panzoomInstance) return

		const current = panzoomInstance.getScale()
		const newScale = current >= maxZoom.value ? 1 : Math.min(current + 1, maxZoom.value)

		// Na touch zařízeních zoomovat do středu, ne k pozici kliknutí
		if (isTouch.value) {
			panzoomInstance.zoom(newScale, { animate: true })
		} else {
			panzoomInstance.zoomToPoint(newScale, e, { animate: true })
		}

		// Pokud se vrací na 1×, posunout zpět na hlavní obsah
		if (newScale === 1) {
			nextTick(() => {
				scrollToContent(true)
			})
		}
	}

	// Nastavit zoom na diskrétní úroveň
	function setZoom(level: number) {
		if (!panzoomInstance) return

		const newLevel = Math.max(1, Math.min(level, maxZoom.value))
		panzoomInstance.zoom(newLevel, { animate: true })

		// Pokud se vrací na 1×, posunout zpět na hlavní obsah
		if (newLevel === 1) {
			nextTick(() => {
				scrollToContent(true)
			})
		}
	}

	// Vystředit mapu na hlavní obsah
	function centerMap() {
		if (!panzoomInstance) return
		panzoomInstance.reset({ animate: true })
		nextTick(() => {
			scrollToContent(true)
		})
	}

	// Reset a posunout na hlavní obsah (při změně patra)
	function resetAndCenter() {
		if (panzoomInstance) {
			// Reset zoom na 1×
			panzoomInstance.reset({ animate: false })
			// Posunout na hlavní obsah
			nextTick(() => {
				scrollToContent(false)
			})
		}
	}

	// Watch pro inicializaci panzoom
	watch(
		[mapContainerRef, mapContentRef],
		([container, content]) => {
			if (container && content) {
				nextTick(() => {
					initPanzoom()
				})
			}
		},
		{ immediate: true },
	)

	// Reinicializovat při změně maxZoom
	watch(maxZoom, () => {
		if (panzoomInstance && mapContentRef.value && mapContainerRef.value) {
			initPanzoom()
		}
	})

	// Lifecycle
	onMounted(() => {
		checkBreakpoint()
		window.addEventListener('resize', handleWindowResize)
	})

	onUnmounted(() => {
		window.removeEventListener('resize', handleWindowResize)

		const container = mapContainerRef.value
		if (container) {
			container.removeEventListener('dblclick', handleDoubleClick)
		}

		if (panzoomInstance) {
			panzoomInstance.destroy()
			panzoomInstance = null
		}
	})

	// Window resize handler
	let resizeTimeout: ReturnType<typeof setTimeout> | null = null
	function handleWindowResize() {
		checkBreakpoint()

		if (resizeTimeout) clearTimeout(resizeTimeout)
		resizeTimeout = setTimeout(() => {
			resetAndCenter()
		}, 150)
	}

	return {
		// Refs pro template
		mapContainerRef,
		mapContentRef,
		// Stav
		zoomLevel: activeZoomLevel,
		zoomLevels,
		isZoomed,
		isTouch,
		// Akce
		setZoom,
		centerMap,
		resetAndCenter,
	}
}
