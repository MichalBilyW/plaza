/**
 * Composable pro zoom/pan interaktivní mapy pomocí @panzoom/panzoom
 *
 * Funkce:
 * - Plynulý zoom přes +/− tlačítka (krok 0.5×)
 * - Double click/tap zoom
 * - Pan pouze při přiblížení
 * - Touch nad mapou ovládá mapu, ne scroll/zoom stránky
 * - Desktop: Ctrl/Cmd + wheel zoom, drag při přiblížení
 */

import Panzoom from '@panzoom/panzoom'
type PanzoomObject = ReturnType<typeof Panzoom>

const MAX_ZOOM = 5
const ZOOM_STEP = 0.5
const MOBILE_BREAKPOINT = 768 // md breakpoint
const MIN_ZOOM = 1

export function useMapZoom() {
	const mapContainerRef = ref<HTMLElement | null>(null)
	const mapContentRef = ref<HTMLElement | null>(null)
	const isTouch = ref(false)
	const isMobile = ref(false)
	const currentScale = ref(1)
	const currentPanX = ref(0)
	const currentPanY = ref(0)
	const minScale = ref(MIN_ZOOM)

	let panzoomInstance: PanzoomObject | null = null
	let activeContainer: HTMLElement | null = null
	let activeContent: HTMLElement | null = null
	let lastViewportWidth = 0

	// Detekce touch zařízení
	function checkTouch() {
		isTouch.value = 'ontouchstart' in window || navigator.maxTouchPoints > 0
	}

	// Detekce mobile (< md breakpoint)
	function checkMobile() {
		isMobile.value = window.innerWidth < MOBILE_BREAKPOINT
	}

	// Je přiblíženo? (pro cursor logic)
	const isZoomed = computed(() => currentScale.value > minScale.value + 0.1)

	// Může zoom in/out?
	const canZoomIn = computed(() => currentScale.value < MAX_ZOOM - 0.01)
	const canZoomOut = computed(() => currentScale.value > minScale.value + 0.01)

	function getBaseContentSize() {
		const content = mapContentRef.value
		if (!content) return null

		const scale = panzoomInstance?.getScale() || currentScale.value || 1
		const rect = content.getBoundingClientRect()
		let width = rect.width / scale
		let height = rect.height / scale

		if (width > 1 && height > 1) return { width, height }

		const svg = content.querySelector('svg') as SVGSVGElement | null
		const viewBox = svg?.viewBox.baseVal
		if (svg && viewBox && viewBox.width > 0 && viewBox.height > 0) {
			width = content.clientWidth || mapContainerRef.value?.clientWidth || viewBox.width
			height = width * (viewBox.height / viewBox.width)
			return { width, height }
		}

		if (content.offsetWidth > 1 && content.offsetHeight > 1) {
			return { width: content.offsetWidth, height: content.offsetHeight }
		}

		return null
	}

	function getMobileDefaultTransform() {
		const container = mapContainerRef.value
		const size = getBaseContentSize()
		if (!container || !size) return { scale: MIN_ZOOM, x: 0, y: 0 }

		const containerWidth = container.clientWidth
		const containerHeight = container.clientHeight
		if (containerWidth <= 0 || containerHeight <= 0) return { scale: MIN_ZOOM, x: 0, y: 0 }

		const scale = Math.min(
			MAX_ZOOM,
			Math.max(
				MIN_ZOOM,
				containerWidth / size.width,
				containerHeight / size.height,
			),
		)

		return {
			scale,
			x: (containerWidth - size.width) / (2 * scale),
			y: (containerHeight - size.height) / (2 * scale),
		}
	}

	function runOnNextFrame(callback: () => void) {
		if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
			window.requestAnimationFrame(callback)
		} else {
			callback()
		}
	}

	function applyMobileDefault(animate = false) {
		if (!panzoomInstance) return

		const transform = getMobileDefaultTransform()
		minScale.value = transform.scale
		panzoomInstance.setOptions({
			contain: 'outside',
			minScale: transform.scale,
			startScale: MIN_ZOOM,
		})
		panzoomInstance.zoom(transform.scale, { animate, force: true })
		runOnNextFrame(() => {
			panzoomInstance?.pan(transform.x, transform.y, { animate, force: true })
			currentScale.value = transform.scale
		})
	}

	function applyDesktopDefault() {
		if (!panzoomInstance) return
		minScale.value = MIN_ZOOM
		panzoomInstance.setOptions({
			contain: undefined,
			minScale: MIN_ZOOM,
			startScale: MIN_ZOOM,
		})
		panzoomInstance.reset({ animate: false })
		currentScale.value = MIN_ZOOM
		currentPanX.value = 0
		currentPanY.value = 0
	}

	function removeDomListeners() {
		if (activeContainer) {
			activeContainer.removeEventListener('dblclick', handleDoubleClick)
			activeContainer.removeEventListener('wheel', handleWheel)
			activeContainer.removeEventListener('gesturestart', preventGesture)
			activeContainer.removeEventListener('gesturechange', preventGesture)
			activeContainer.removeEventListener('gestureend', preventGesture)
		}
		if (activeContent) {
			activeContent.removeEventListener('panzoomchange', handlePanzoomChange)
		}
		activeContainer = null
		activeContent = null
	}

	// Inicializace panzoom
	function initPanzoom() {
		const content = mapContentRef.value
		const container = mapContainerRef.value
		if (!content || !container) return
		checkTouch()
		checkMobile()

		// Zrušit předchozí instanci
		removeDomListeners()
		if (panzoomInstance) {
			panzoomInstance.destroy()
			panzoomInstance = null
		}

		panzoomInstance = Panzoom(content, {
			maxScale: MAX_ZOOM,
			minScale: MIN_ZOOM,
			startScale: MIN_ZOOM,
			startX: 0,
			startY: 0,
			cursor: 'default',
			panOnlyWhenZoomed: true,
			animate: true,
			duration: 300,
			easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
			// Citlivost pinch zoomu na touch zařízeních (default 0.3)
			step: isTouch.value ? 1.2 : 0.3,
			// Nad mapou musí mít prioritu panzoom; jinak mobil při pohybu scrolluje stránku.
			touchAction: 'none',
		})

		currentScale.value = MIN_ZOOM

		// Double click/tap zoom
		container.addEventListener('dblclick', handleDoubleClick)

		// Wheel zoom jen s Ctrl/Cmd (jinak scroll stránky)
		container.addEventListener('wheel', handleWheel, { passive: false })

		// Zabránit browser zoomu nad mapou (macOS trackpad pinch + Safari gesture)
		container.addEventListener('gesturestart', preventGesture)
		container.addEventListener('gesturechange', preventGesture)
		container.addEventListener('gestureend', preventGesture)

		// Aktualizovat currentScale při změně
		content.addEventListener('panzoomchange', handlePanzoomChange)
		activeContainer = container
		activeContent = content

		nextTick(() => {
			if (isMobile.value) {
				applyMobileDefault(false)
			} else {
				applyDesktopDefault()
			}
		})
	}

	function handlePanzoomChange(e: Event) {
		const detail = (e as CustomEvent).detail
		currentScale.value = detail.scale
		currentPanX.value = detail.x
		currentPanY.value = detail.y
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
				Math.max(minScale.value, current + direction * WHEEL_ZOOM_STEP * current),
			)
			panzoomInstance.zoomToPoint(newScale, e, { animate: false })
			if (newScale <= minScale.value + 0.01) {
				resetAndCenter()
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
		e.preventDefault()

		const current = panzoomInstance.getScale()
		// Plynulý skok o 1× při double-click, reset na 1× pokud jsme na max
		const newScale =
			current >= MAX_ZOOM - 0.5 ? minScale.value : Math.min(current + 1, MAX_ZOOM)

		// Na touch zařízeních zoomovat do středu, ne k pozici kliknutí
		if (isTouch.value) {
			panzoomInstance.zoom(newScale, { animate: true })
		} else {
			panzoomInstance.zoomToPoint(newScale, e, { animate: true })
		}

		// Pokud se vrací na 1×, resetovat pozici
		if (newScale <= minScale.value + 0.01) {
			resetAndCenter(true)
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
		const newScale = Math.max(currentScale.value - ZOOM_STEP, minScale.value)
		panzoomInstance.zoom(newScale, { animate: true })
		if (newScale <= minScale.value + 0.01) {
			resetAndCenter(true)
		}
	}

	// Reset a vystředit mapu (při změně patra)
	function resetAndCenter(animate = false) {
		if (!panzoomInstance) return

		checkMobile()
		if (isMobile.value) {
			applyMobileDefault(animate)
		} else {
			applyDesktopDefault()
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
		lastViewportWidth = window.innerWidth
		window.addEventListener('resize', handleWindowResize)
	})

	onUnmounted(() => {
		window.removeEventListener('resize', handleWindowResize)
		removeDomListeners()

		if (panzoomInstance) {
			panzoomInstance.destroy()
			panzoomInstance = null
		}
	})

	// Window resize handler
	let resizeTimeout: ReturnType<typeof setTimeout> | null = null
	function handleWindowResize() {
		const previousWidth = lastViewportWidth
		checkTouch()
		checkMobile()
		lastViewportWidth = window.innerWidth

		if (resizeTimeout) clearTimeout(resizeTimeout)
		resizeTimeout = setTimeout(() => {
			if (isMobile.value) {
				const activeElement = document.activeElement
				const isEditingText =
					activeElement instanceof HTMLInputElement ||
					activeElement instanceof HTMLTextAreaElement

				if (!isEditingText && Math.abs(window.innerWidth - previousWidth) > 40) {
					resetAndCenter()
				}
			} else {
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
			currentPanX,
			currentPanY,
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
