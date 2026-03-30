/**
 * Composable pro zoom/pan interaktivní mapy pomocí @panzoom/panzoom
 *
 * Funkce:
 * - Double click/tap zoom
 * - Tlačítka pro diskrétní zoom úrovně
 * - Pan pouze při přiblížení
 * - Touch: 1 prst = scroll stránky, 2 prsty = pinch zoom + pan mapy
 * - Desktop: wheel zoom, drag při přiblížení
 */

import Panzoom from '@panzoom/panzoom'
type PanzoomObject = ReturnType<typeof Panzoom>

interface ZoomLevel {
	value: number
	label: string
}

const ZOOM_LEVELS: ZoomLevel[] = [
	{ value: 1, label: '1×' },
	{ value: 2, label: '2×' },
	{ value: 3, label: '3×' },
]

const MAX_ZOOM = 3

export function useMapZoom() {
	const mapContainerRef = ref<HTMLElement | null>(null)
	const mapContentRef = ref<HTMLElement | null>(null)
	const isTouch = ref(false)
	const currentScale = ref(1)

	let panzoomInstance: PanzoomObject | null = null

	// Detekce touch zařízení
	function checkTouch() {
		isTouch.value = 'ontouchstart' in window || navigator.maxTouchPoints > 0
	}

	// Zoom úrovně: vždy 1–3× na všech zařízeních
	const zoomLevels = computed(() => ZOOM_LEVELS)

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
			maxScale: MAX_ZOOM,
			minScale: 1,
			startScale: 1,
			startX: 0,
			startY: 0,
			cursor: 'default',
			panOnlyWhenZoomed: true,
			animate: true,
			duration: 300,
			easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
			// Touch: pan-y = 1 prst scrolluje stránku, 2 prsty = pinch zoom + pan mapy
			touchAction: 'pan-y',
		})

		// Double click/tap zoom
		container.addEventListener('dblclick', handleDoubleClick)

		// Wheel zoom jen s Ctrl/Cmd (jinak scroll stránky)
		container.addEventListener('wheel', handleWheel, { passive: false })

		// Aktualizovat currentScale při změně
		content.addEventListener('panzoomchange', (e: Event) => {
			const detail = (e as CustomEvent).detail
			currentScale.value = detail.scale
		})
	}

	// Wheel zoom: jen s Ctrl/Cmd klávesou, jinak scroll stránky
	function handleWheel(e: WheelEvent) {
		if (!panzoomInstance) return

		if (e.ctrlKey || e.metaKey) {
			e.preventDefault()
			panzoomInstance.zoomWithWheel(e)
		}
		// Bez modifikátoru - nechat prohlížeč scrollovat stránku
	}

	// Double click/tap zoom
	function handleDoubleClick(e: MouseEvent) {
		if (!panzoomInstance) return

		const current = panzoomInstance.getScale()
		const newScale = current >= MAX_ZOOM ? 1 : Math.min(current + 1, MAX_ZOOM)

		// Na touch zařízeních zoomovat do středu, ne k pozici kliknutí
		if (isTouch.value) {
			panzoomInstance.zoom(newScale, { animate: true })
		} else {
			panzoomInstance.zoomToPoint(newScale, e, { animate: true })
		}

		// Pokud se vrací na 1×, resetovat pozici
		if (newScale === 1) {
			panzoomInstance.reset({ animate: true })
		}
	}

	// Nastavit zoom na diskrétní úroveň
	function setZoom(level: number) {
		if (!panzoomInstance) return

		const newLevel = Math.max(1, Math.min(level, MAX_ZOOM))
		panzoomInstance.zoom(newLevel, { animate: true })

		// Pokud se vrací na 1×, resetovat pozici
		if (newLevel === 1) {
			panzoomInstance.reset({ animate: true })
		}
	}

	// Reset a vystředit mapu (při změně patra)
	function resetAndCenter() {
		if (panzoomInstance) {
			panzoomInstance.reset({ animate: false })
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

	// Lifecycle
	onMounted(() => {
		checkTouch()
		window.addEventListener('resize', handleWindowResize)
	})

	onUnmounted(() => {
		window.removeEventListener('resize', handleWindowResize)

		const container = mapContainerRef.value
		if (container) {
			container.removeEventListener('dblclick', handleDoubleClick)
			container.removeEventListener('wheel', handleWheel)
		}

		if (panzoomInstance) {
			panzoomInstance.destroy()
			panzoomInstance = null
		}
	})

	// Window resize handler
	let resizeTimeout: ReturnType<typeof setTimeout> | null = null
	function handleWindowResize() {
		checkTouch()

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
		resetAndCenter,
	}
}
