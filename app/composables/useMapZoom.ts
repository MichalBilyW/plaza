/**
 * Composable pro zoom interaktivní mapy
 *
 * - Tlačítka pro diskrétní zoom úrovně
 * - Pinch-to-zoom (touchpad) a kolečko myši
 * - Responsive: md+ jen 1× a 2×, pod md 1× 2× 3×
 * - Plynulá CSS animace při zoomu
 * - Centrování mapy po každém zoomu
 */

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
	const zoomLevel = ref(1)
	const mapScrollRef = ref<HTMLElement | null>(null)
	const mapLayersRef = ref<HTMLElement | null>(null)
	const isMobile = ref(false)
	let centerRafId: number | null = null

	// Detekce breakpointu
	function checkBreakpoint() {
		isMobile.value = window.innerWidth < MD_BREAKPOINT
	}

	// Zoom úrovně podle breakpointu
	const zoomLevels = computed(() => {
		if (isMobile.value) return ALL_ZOOM_LEVELS
		return ALL_ZOOM_LEVELS.filter((l) => l.value <= 2)
	})

	const maxZoom = computed(() => (isMobile.value ? 3 : 2))

	// Vystředit mapu na střed obsahu
	function centerMap() {
		const scrollEl = mapScrollRef.value
		if (!scrollEl) return

		const targetX = (scrollEl.scrollWidth - scrollEl.clientWidth) / 2
		const targetY = (scrollEl.scrollHeight - scrollEl.clientHeight) / 2

		scrollEl.scrollTo({
			left: Math.max(0, targetX),
			top: Math.max(0, targetY),
			behavior: 'smooth',
		})
	}

	// Nastavit zoom na diskrétní úroveň - plynulé centrování současně se zoomem
	function setZoom(level: number) {
		const oldLevel = zoomLevel.value
		const newLevel = Math.max(1, Math.min(level, maxZoom.value))

		if (oldLevel === newLevel) return

		const scrollEl = mapScrollRef.value
		if (!scrollEl) {
			zoomLevel.value = newLevel
			return
		}

		// Změnit zoom
		zoomLevel.value = newLevel

		// Zrušit předchozí centrování, pokud běží
		if (centerRafId !== null) {
			cancelAnimationFrame(centerRafId)
			centerRafId = null
		}

		// Držet X i Y přesně uprostřed po celou dobu zoom animace
		const startTime = performance.now()
		const duration = 550 // CSS width transition (500ms) + malá rezerva

		const tick = (now: number) => {
			const elapsed = now - startTime

			scrollEl.scrollLeft = Math.max(0, (scrollEl.scrollWidth - scrollEl.clientWidth) / 2)
			scrollEl.scrollTop = Math.max(0, (scrollEl.scrollHeight - scrollEl.clientHeight) / 2)

			if (elapsed < duration) {
				centerRafId = requestAnimationFrame(tick)
				return
			}

			centerRafId = null
		}

		nextTick(() => {
			centerRafId = requestAnimationFrame(tick)
		})
	}

	// Najít nejbližší diskrétní úroveň
	function snapToLevel(raw: number): number {
		const levels = zoomLevels.value.map((l) => l.value)
		let closest = levels[0]!
		let minDist = Math.abs(raw - closest)
		for (const lv of levels) {
			const dist = Math.abs(raw - lv)
			if (dist < minDist) {
				minDist = dist
				closest = lv
			}
		}
		return closest
	}

	// Wheel handler - pouze trackpad pinch (ctrlKey), běžné kolečko scrolluje stránku
	function handleWheel(e: WheelEvent) {
		// Pouze pinch gesture na trackpadu (ctrlKey)
		// Běžné kolečko myši nechá scrollovat stránku
		if (!e.ctrlKey) return

		e.preventDefault()

		// Trackpad pinch
		const delta = -e.deltaY
		const step = 0.3
		const raw = zoomLevel.value + (delta > 0 ? step : -step)
		const clamped = Math.max(1, Math.min(raw, maxZoom.value))
		const snapped = snapToLevel(clamped)

		if (snapped !== zoomLevel.value) {
			setZoom(snapped)
		}
	}

	// Touch pinch handler
	let lastPinchDist = 0
	let initialZoom = 1

	function getTouchDistance(touches: TouchList): number {
		if (touches.length < 2) return 0
		const dx = touches[1]!.clientX - touches[0]!.clientX
		const dy = touches[1]!.clientY - touches[0]!.clientY
		return Math.sqrt(dx * dx + dy * dy)
	}

	function handleTouchStart(e: TouchEvent) {
		if (e.touches.length === 2) {
			lastPinchDist = getTouchDistance(e.touches)
			initialZoom = zoomLevel.value
		}
	}

	function handleTouchMove(e: TouchEvent) {
		if (e.touches.length !== 2) return

		e.preventDefault()

		const dist = getTouchDistance(e.touches)
		if (lastPinchDist === 0) return

		const scale = dist / lastPinchDist
		const raw = initialZoom * scale
		const clamped = Math.max(1, Math.min(raw, maxZoom.value))
		const snapped = snapToLevel(clamped)

		if (snapped !== zoomLevel.value) {
			zoomLevel.value = snapped
			centerMap()
		}
	}

	function handleTouchEnd(e: TouchEvent) {
		if (e.touches.length < 2) {
			lastPinchDist = 0
		}
	}

	// Lifecycle - watch pro připojení listenerů až je ref dostupný
	let cleanupListeners: (() => void) | null = null

	watch(
		mapScrollRef,
		(el, _oldEl, onCleanup) => {
			if (!el) return

			el.addEventListener('wheel', handleWheel, { passive: false })
			el.addEventListener('touchstart', handleTouchStart, { passive: true })
			el.addEventListener('touchmove', handleTouchMove, { passive: false })
			el.addEventListener('touchend', handleTouchEnd, { passive: true })

			const cleanup = () => {
				el.removeEventListener('wheel', handleWheel)
				el.removeEventListener('touchstart', handleTouchStart)
				el.removeEventListener('touchmove', handleTouchMove)
				el.removeEventListener('touchend', handleTouchEnd)
			}

			cleanupListeners = cleanup
			onCleanup(cleanup)
		},
		{ immediate: true },
	)

	onMounted(() => {
		checkBreakpoint()
		window.addEventListener('resize', checkBreakpoint)
	})

	onUnmounted(() => {
		window.removeEventListener('resize', checkBreakpoint)
		if (centerRafId !== null) {
			cancelAnimationFrame(centerRafId)
			centerRafId = null
		}
		cleanupListeners?.()
	})

	// Opravit zoom pokud se změní breakpoint a aktuální zoom je mimo rozsah
	watch(maxZoom, (newMax) => {
		if (zoomLevel.value > newMax) {
			setZoom(newMax)
		}
	})

	return {
		zoomLevel,
		zoomLevels,
		mapScrollRef,
		mapLayersRef,
		setZoom,
		centerMap,
	}
}
