/**
 * Composable pro zoom/pan interaktivní mapy pomocí @panzoom/panzoom
 *
 * Funkce:
 * - Plynulý zoom přes +/− tlačítka (krok 0.5×)
 * - Double click/tap zoom
 * - Pan pouze při přiblížení
 * - Touch: 1 prst = scroll stránky, 2 prsty = pinch zoom + pan mapy
 * - Desktop: Ctrl/Cmd + wheel zoom, drag při přiblížení
 */

import Panzoom from '@panzoom/panzoom'
type PanzoomObject = ReturnType<typeof Panzoom>

const MAX_ZOOM = 5
const ZOOM_STEP = 0.5
const MOBILE_BREAKPOINT = 768 // md breakpoint

export function useMapZoom() {
	const mapContainerRef = ref<HTMLElement | null>(null)
	const mapContentRef = ref<HTMLElement | null>(null)
	const isTouch = ref(false)
	const isMobile = ref(false)
	const currentScale = ref(1)

	let panzoomInstance: PanzoomObject | null = null

	// Detekce touch zařízení
	function checkTouch() {
		isTouch.value = 'ontouchstart' in window || navigator.maxTouchPoints > 0
	}

	// Detekce mobile (< md breakpoint)
	function checkMobile() {
		isMobile.value = window.innerWidth < MOBILE_BREAKPOINT
	}

	// Je přiblíženo? (pro cursor logic)
	const isZoomed = computed(() => currentScale.value > 1.1)

	// Může zoom in/out?
	const canZoomIn = computed(() => currentScale.value < MAX_ZOOM - 0.01)
	const canZoomOut = computed(() => currentScale.value > 1.01)

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

		// Na mobile (< md) výchozí zoom 2×
		checkMobile()
		const initialScale = isMobile.value ? 2 : 1

		panzoomInstance = Panzoom(content, {
			maxScale: MAX_ZOOM,
			minScale: 1,
			startScale: initialScale,
			startX: 0,
			startY: 0,
			cursor: 'default',
			panOnlyWhenZoomed: true,
			animate: true,
			duration: 300,
			easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
			// Citlivost pinch zoomu na touch zařízeních (default 0.3)
			step: isTouch.value ? 1.2 : 0.3,
			// Touch: pan-y = 1 prst scrolluje stránku, 2 prsty = pinch zoom + pan mapy
			touchAction: 'pan-y',
		})

		// Nastavit aktuální scale
		currentScale.value = initialScale

		// Double click/tap zoom
		container.addEventListener('dblclick', handleDoubleClick)

		// Wheel zoom jen s Ctrl/Cmd (jinak scroll stránky)
		container.addEventListener('wheel', handleWheel, { passive: false })

		// Zabránit browser zoomu nad mapou (macOS trackpad pinch + Safari gesture)
		container.addEventListener('gesturestart', preventGesture)
		container.addEventListener('gesturechange', preventGesture)
		container.addEventListener('gestureend', preventGesture)

		// Aktualizovat currentScale při změně
		content.addEventListener('panzoomchange', (e: Event) => {
			const detail = (e as CustomEvent).detail
			currentScale.value = detail.scale
		})
	}

	// Wheel zoom: jen s Ctrl/Cmd klávesou, jemný krok
	const WHEEL_ZOOM_STEP = 0.08

	function handleWheel(e: WheelEvent) {
		if (!panzoomInstance) return

		if (e.ctrlKey || e.metaKey) {
			e.preventDefault()
			const direction = e.deltaY < 0 ? 1 : -1
			const current = panzoomInstance.getScale()
			const newScale = Math.min(
				MAX_ZOOM,
				Math.max(1, current + direction * WHEEL_ZOOM_STEP * current),
			)
			panzoomInstance.zoomToPoint(newScale, e, { animate: false })
			if (newScale <= 1) {
				panzoomInstance.reset({ animate: false })
			}
		}
		// Bez modifikátoru - nechat prohlížeč scrollovat stránku
	}

	// Blokovat Safari gesture events (pinch-to-zoom na trackpadu)
	function preventGesture(e: Event) {
		e.preventDefault()
	}

	// Double click/tap zoom
	function handleDoubleClick(e: MouseEvent) {
		if (!panzoomInstance) return

		const current = panzoomInstance.getScale()
		// Plynulý skok o 1× při double-click, reset na 1× pokud jsme na max
		const newScale = current >= MAX_ZOOM - 0.5 ? 1 : Math.min(current + 1, MAX_ZOOM)

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

	// Zoom in o ZOOM_STEP
	function zoomIn() {
		if (!panzoomInstance) return
		const newScale = Math.min(currentScale.value + ZOOM_STEP, MAX_ZOOM)
		panzoomInstance.zoom(newScale, { animate: true })
	}

	// Zoom out o ZOOM_STEP
	function zoomOut() {
		if (!panzoomInstance) return
		const newScale = Math.max(currentScale.value - ZOOM_STEP, 1)
		panzoomInstance.zoom(newScale, { animate: true })
		if (newScale <= 1) {
			panzoomInstance.reset({ animate: true })
		}
	}

	// Reset a vystředit mapu (při změně patra)
	function resetAndCenter() {
		if (!panzoomInstance) return

		// Na mobile (< md) výchozí zoom je 2×
		checkMobile()
		if (isMobile.value) {
			panzoomInstance.zoom(2, { animate: false })
			currentScale.value = 2
		} else {
			panzoomInstance.reset({ animate: false })
			currentScale.value = 1
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
		checkMobile()
		window.addEventListener('resize', handleWindowResize)
	})

	onUnmounted(() => {
		window.removeEventListener('resize', handleWindowResize)

		const container = mapContainerRef.value
		if (container) {
			container.removeEventListener('dblclick', handleDoubleClick)
			container.removeEventListener('wheel', handleWheel)
			container.removeEventListener('gesturestart', preventGesture)
			container.removeEventListener('gesturechange', preventGesture)
			container.removeEventListener('gestureend', preventGesture)
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
		checkMobile()

		if (resizeTimeout) clearTimeout(resizeTimeout)
		resizeTimeout = setTimeout(() => {
			// Na mobile nikdy neresetovat zoom při resize
			if (!isMobile.value) {
				resetAndCenter()
			}
		}, 150)
	}

	return {
		// Refs pro template
		mapContainerRef,
		mapContentRef,
		// Stav
		currentScale,
		canZoomIn,
		canZoomOut,
		isZoomed,
		isTouch,
		// Akce
		zoomIn,
		zoomOut,
		resetAndCenter,
	}
}
