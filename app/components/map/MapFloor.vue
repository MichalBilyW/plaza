<template>
	<div
		ref="containerRef"
		class="map-floor relative w-full"
		:class="{ 'map-floor--android-chrome': isAndroidChrome }"
	>
		<!-- SVG obsah -->
		<div
			v-if="svgContent"
			ref="svgWrapperRef"
			class="svg-wrapper w-full relative transition-opacity duration-300"
			:class="isReady ? 'opacity-100' : 'opacity-0'"
			v-html="processedSvg"
		></div>

		<!-- Loga / iniciály obsazených jednotek -->
		<div
			v-for="overlay in logoOverlays"
			:key="overlay.unitCode"
			class="logo-overlay absolute z-[5] pointer-events-none flex items-center justify-center transition-opacity duration-300"
			:class="isReady ? 'opacity-100' : 'opacity-0'"
			:style="{
				left: `${overlay.centerXPct}%`,
				top: `${overlay.centerYPct}%`,
				width: `${overlay.sizePct}%`,
				height: `${overlay.sizePct}%`,
				transform: 'translate(-50%, -50%)',
			}"
		>
			<!-- Upcoming badge -->
			<span
				v-if="overlay.upcomingLabel"
				class="upcoming-badge absolute -top-1 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap rounded-[3px_8px_3px_3px] bg-plaza px-1.5 py-0.5 text-[0.45vw] font-semibold text-white shadow leading-none"
			>
				{{ overlay.upcomingLabel }}
			</span>
			<!-- Iniciály pro malé unity nebo unity bez loga -->
			<span
				v-if="overlay.isInitials"
				class="font-bold text-gray-500/70 uppercase leading-none select-none whitespace-nowrap"
				:style="{ fontSize: `${overlay.fontSizePct}vw` }"
			>
				{{ overlay.initials }}
			</span>
			<!-- Logo obrázek -->
			<img
				v-else
				:src="overlay.logo"
				:alt="overlay.shopName"
				class="object-contain w-full h-full"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { MapUnit } from '~~/shared/map/units'
import { createUnitElementId } from '~~/shared/map/units'

interface Props {
	/** Cesta k SVG souboru patra */
	svgPath: string
	/** Inline obsah SVG (pokud je předán, přeskočí se fetch) */
	svgContent?: string | null
	/** Jednotky patra s daty obchodů */
	units: MapUnit[]
	/** Aktuálně zvýrazněný unitCode (hover) */
	hoveredUnitCode?: string | null
	/** Vyhledávací dotaz pro zvýraznění jednotek */
	searchQuery?: string
}

const props = defineProps<Props>()

// Jednotky které odpovídají vyhledávání (case-insensitive, částečná shoda)
const matchedUnitCodes = computed(() => {
	const query = props.searchQuery?.trim().toLowerCase()
	if (!query) return new Set<string>()

	// Escape regex speciálních znaků (stejně jako na /obchody)
	const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
	const regex = new RegExp(escaped, 'i')

	const matched = new Set<string>()
	for (const unit of props.units) {
		if (unit.shop?.name && regex.test(unit.shop.name)) {
			matched.add(unit.unitCode)
		}
	}
	return matched
})

const emit = defineEmits<{
	/** Desktop: klik = navigace; Mobile: tap = popup / navigace */
	'unit-click': [unitCode: string]
	/** Desktop hover enter — zobrazit popup */
	'unit-hover': [unitCode: string, position: { x: number; y: number }]
	/** Desktop hover leave — schovat popup (s debounce) */
	'unit-hover-leave': []
	/** Mobile tap — zobrazit popup / navigace */
	'unit-tap': [unitCode: string, position: { x: number; y: number }]
}>()

// Načtení SVG obsahu - použít inline obsah pokud je k dispozici, jinak fetch
const svgContent = ref<string | null>(props.svgContent ?? null)
const pending = ref(!props.svgContent)
const error = ref<Error | null>(null)
const isReady = ref(false)
const isAndroidChrome = ref(false)

// Načíst SVG přes fetch (fallback)
const loadSvg = async () => {
	try {
		pending.value = true
		error.value = null
		isReady.value = false
		const response = await fetch(props.svgPath)
		if (!response.ok) {
			throw new Error(`Failed to load SVG: ${response.status}`)
		}
		svgContent.value = await response.text()
		// Malá prodleva pro plynulý přechod
		await nextTick()
		setTimeout(() => {
			isReady.value = true
		}, 50)
	} catch (e) {
		error.value = e instanceof Error ? e : new Error('Unknown error')
		console.error('Failed to load SVG:', e)
	} finally {
		pending.value = false
	}
}

onMounted(() => {
	isAndroidChrome.value = /Android/i.test(navigator.userAgent) && /Chrome/i.test(navigator.userAgent)

	if (props.svgContent) {
		// Obsah je předán inline — rovnou zobrazit bez fetch
		pending.value = false
		nextTick(() =>
			setTimeout(() => {
				isReady.value = true
			}, 50),
		)
	} else {
		loadSvg()
	}
})

// Při změně cesty znovu načíst (jen pokud není inline obsah)
watch(
	() => props.svgPath,
	() => {
		if (!props.svgContent) {
			loadSvg()
		}
	},
)

// Při změně inline obsahu aktualizovat
watch(
	() => props.svgContent,
	(newContent) => {
		if (newContent) {
			svgContent.value = newContent
			pending.value = false
			geometryCache.clear()
			nextTick(() =>
				setTimeout(() => {
					isReady.value = true
				}, 50),
			)
		}
	},
)

// Refs
const containerRef = ref<HTMLElement | null>(null)
const svgWrapperRef = ref<HTMLElement | null>(null)

interface LogoOverlay {
	unitCode: string
	shopName: string
	logo: string
	/** Vizuální střed v procentech SVG viewBoxu */
	centerXPct: number
	centerYPct: number
	/** Rozměr čtvercového kontejneru v procentech viewBox šířky */
	sizePct: number
	/** True = zobrazit iniciály místo loga */
	isInitials: boolean
	/** Iniciály pro malé unity */
	initials: string
	/** Velikost fontu iniciál ve vw */
	fontSizePct: number
	/** Upcoming badge text (např. "Otevíráme: 20.12.2026"), null pokud není upcoming */
	upcomingLabel: string | null
}

const logoOverlays = ref<LogoOverlay[]>([])

// ─── Geometry cache: pole-of-inaccessibility je drahý → cachujeme per unitCode ───
const geometryCache = new Map<string, { cx: number; cy: number; r: number }>()

// ─── Geometry helpers: Pole of Inaccessibility ───

type Point = [number, number]

/**
 * Získat polygon fill oblasti SVG unit elementu.
 * Podporuje jak <path data-name="fill">, tak <rect data-name="fill"> (i s transform).
 * Outline path (donut shape) jsou bezpečně ignorovány.
 */
function samplePolygonFromFill(element: Element): Point[] | null {
	// 1. Hledat <path> s fill id/data-name
	const paths = element.querySelectorAll('path')
	for (const p of paths) {
		const id = p.getAttribute('id') ?? ''
		const dataName = p.getAttribute('data-name') ?? ''
		if (id === 'fill' || dataName === 'fill' || id.startsWith('fill')) {
			return samplePathPoints(p)
		}
	}

	// 2. Hledat <rect> s fill id/data-name (běžné pro jednoduché obdélníkové unity)
	const rects = element.querySelectorAll('rect')
	for (const r of rects) {
		const id = r.getAttribute('id') ?? ''
		const dataName = r.getAttribute('data-name') ?? ''
		if (id === 'fill' || dataName === 'fill' || id.startsWith('fill')) {
			return rectToPolygon(r)
		}
	}

	// 3. Žádný fill element — NEPOUŽÍVAT outline path (je to donut shape)
	return null
}

/** Vzorkovat body po obvodu SVG path */
function samplePathPoints(path: SVGPathElement): Point[] | null {
	if (!path.getTotalLength) return null
	const totalLength = path.getTotalLength()
	if (totalLength <= 0) return null

	const numPoints = 64
	const points: Point[] = []
	for (let i = 0; i < numPoints; i++) {
		const pt = path.getPointAtLength((i / numPoints) * totalLength)
		points.push([pt.x, pt.y])
	}
	return points
}

/** Převést <rect> na polygon (4 rohy), s transformem pokud existuje */
function rectToPolygon(rect: SVGRectElement): Point[] | null {
	const x = rect.x.baseVal.value
	const y = rect.y.baseVal.value
	const w = rect.width.baseVal.value
	const h = rect.height.baseVal.value
	if (w <= 0 || h <= 0) return null

	const corners: Point[] = [
		[x, y],
		[x + w, y],
		[x + w, y + h],
		[x, y + h],
	]

	// Pokud rect má transform (rotate, translate), převést rohy do parent coordinate space
	const rectCTM = rect.getCTM()
	const parentCTM = (rect.parentElement as SVGGraphicsElement)?.getCTM?.()
	if (rectCTM && parentCTM) {
		try {
			const toParent = parentCTM.inverse().multiply(rectCTM)
			return corners.map(
				([cx, cy]) =>
					[
						toParent.a * cx + toParent.c * cy + toParent.e,
						toParent.b * cx + toParent.d * cy + toParent.f,
					] as Point,
			)
		} catch {
			// inverse() může selhat pro singulární matici
		}
	}

	return corners
}

/** Ray-casting point-in-polygon test */
function pointInPolygon(x: number, y: number, polygon: Point[]): boolean {
	let inside = false
	for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
		const xi = polygon[i][0],
			yi = polygon[i][1]
		const xj = polygon[j][0],
			yj = polygon[j][1]

		if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
			inside = !inside
		}
	}
	return inside
}

/** Squared distance from point to line segment */
function distToSegmentSq(
	px: number,
	py: number,
	ax: number,
	ay: number,
	bx: number,
	by: number,
): number {
	let dx = bx - ax
	let dy = by - ay
	if (dx !== 0 || dy !== 0) {
		const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
		ax += t * dx
		ay += t * dy
	}
	dx = px - ax
	dy = py - ay
	return dx * dx + dy * dy
}

/** Min distance from point to polygon edge */
function distToPolygonEdge(x: number, y: number, polygon: Point[]): number {
	let minDistSq = Infinity
	for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
		const d = distToSegmentSq(x, y, polygon[j][0], polygon[j][1], polygon[i][0], polygon[i][1])
		if (d < minDistSq) minDistSq = d
	}
	return Math.sqrt(minDistSq)
}

/**
 * Pole of Inaccessibility — najde bod uvnitř polygonu nejdále od hrany.
 * Iterativní grid-search s progresivním zjemňováním.
 * Vrací { x, y, r } kde r = poloměr vepsané kružnice v daném bodě.
 */
function poleOfInaccessibility(
	polygon: Point[],
	precision: number = 1,
): { x: number; y: number; r: number } {
	// Bounding box polygonu
	let minX = Infinity,
		minY = Infinity,
		maxX = -Infinity,
		maxY = -Infinity
	for (const [px, py] of polygon) {
		if (px < minX) minX = px
		if (py < minY) minY = py
		if (px > maxX) maxX = px
		if (py > maxY) maxY = py
	}

	const width = maxX - minX
	const height = maxY - minY
	let cellSize = Math.max(width, height)
	if (cellSize === 0) return { x: minX, y: minY, r: 0 }

	// Hrubý grid přes celý bbox
	let bestX = minX + width / 2
	let bestY = minY + height / 2
	let bestDist = pointInPolygon(bestX, bestY, polygon)
		? distToPolygonEdge(bestX, bestY, polygon)
		: 0

	// Centroid jako kandidát
	let cx = 0,
		cy = 0,
		area = 0
	for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
		const [ax, ay] = polygon[j]
		const [bx, by] = polygon[i]
		const cross = ax * by - bx * ay
		cx += (ax + bx) * cross
		cy += (ay + by) * cross
		area += cross
	}
	if (area !== 0) {
		area /= 2
		cx /= 6 * area
		cy /= 6 * area
		if (pointInPolygon(cx, cy, polygon)) {
			const centroidDist = distToPolygonEdge(cx, cy, polygon)
			if (centroidDist > bestDist) {
				bestX = cx
				bestY = cy
				bestDist = centroidDist
			}
		}
	}

	// Iterativní zjemňování
	cellSize = Math.max(width, height) / 4
	while (cellSize > precision) {
		for (let x = minX; x <= maxX; x += cellSize) {
			for (let y = minY; y <= maxY; y += cellSize) {
				if (!pointInPolygon(x, y, polygon)) continue
				const d = distToPolygonEdge(x, y, polygon)
				if (d > bestDist) {
					bestX = x
					bestY = y
					bestDist = d
				}
			}
		}
		// Zjemnit okolo nejlepšího bodu
		minX = bestX - cellSize
		minY = bestY - cellSize
		maxX = bestX + cellSize
		maxY = bestY + cellSize
		cellSize /= 2
	}

	return { x: bestX, y: bestY, r: bestDist }
}

/** Vrátit iniciály z názvu obchodu (max 2 znaky) */
function getInitials(name: string): string {
	const trimmed = name.trim()
	if (!trimmed) return '?'

	// Pro krátké názvy (3 a méně znaků) vrátit celý název: "H&M", "CCC", "dm"
	if (trimmed.length <= 3) return trimmed.toUpperCase()

	// Rozdělit na slova a vzít první písmeno prvních dvou slov
	const words = trimmed.split(/[\s\-_/]+/).filter(Boolean)
	if (words.length >= 2) {
		return (words[0][0] + words[1][0]).toUpperCase()
	}

	// Jedno slovo — první dvě písmena
	return trimmed.slice(0, 2).toUpperCase()
}

/** Vrátit upcoming label pokud je publishDate v budoucnosti */
function getUpcomingLabel(publishDate?: string): string | null {
	if (!publishDate) return null
	const date = new Date(publishDate)
	if (date.getTime() <= Date.now()) return null
	return `Otevíráme: ${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`
}

// Mapa jednotek pro rychlý přístup
const unitsMap = computed(() => {
	const map = new Map<string, MapUnit>()
	for (const unit of props.units) {
		map.set(unit.unitCode, unit)
	}
	return map
})

// ─── Optimalizace: SVG zpracování oddělené od hover/search ───

/**
 * Základní SVG: jen statické třídy (occupied/empty) a data atributy.
 * NEZÁVISÍ na hoveredUnitCode ani searchQuery → nepřepočítává se při hoveru/hledání.
 */
const baseSvg = computed(() => {
	if (!svgContent.value) return ''

	let svg = svgContent.value

	// Odstranit bílé pozadí z SVG
	svg = svg.replace(/<rect[^>]*fill=["'](#fff|#ffffff|white|#FFFFFF|#FFF)["'][^>]*\/>/gi, '')
	svg = svg.replace(
		/<rect[^>]*style=["'][^"']*fill:\s*(#fff|#ffffff|white)[^"']*["'][^>]*\/>/gi,
		'',
	)

	// Pro každou jednotku přidat statické data atributy
	for (const unit of props.units) {
		const elementId = createUnitElementId(unit.unitCode)
		const hasShop = unit.occupancyType === 'shop'
		const regex = new RegExp(`id=["']${elementId}["']`, 'g')
		const unitClass =
			unit.occupancyType === 'shop'
				? 'map-unit map-unit--occupied cursor-pointer'
				: unit.occupancyType === 'private'
					? 'map-unit map-unit--private'
					: 'map-unit map-unit--empty opacity-20'

		svg = svg.replace(
			regex,
			`id="${elementId}" class="${unitClass}" data-unit="${unit.unitCode}" data-has-shop="${hasShop}" data-occupancy="${unit.occupancyType}"`,
		)
	}

	return svg
})

// Alias pro šablonu
const processedSvg = baseSvg

/**
 * Dynamické třídy (hover, search) aplikovány přímo na DOM — žádný re-render SVG.
 */
function updateDynamicClasses() {
	const wrapper = svgWrapperRef.value
	if (!wrapper) return

	const unitElements = wrapper.querySelectorAll<SVGGElement>('[data-unit]')
	const hovered = props.hoveredUnitCode
	const matched = matchedUnitCodes.value
	const hasSearch = matched.size > 0

	for (const el of unitElements) {
		const unitCode = el.getAttribute('data-unit')!
		const hasShop = el.getAttribute('data-has-shop') === 'true'
		const occupancy = el.getAttribute('data-occupancy')
		const isSelected = unitCode === hovered
		const isHighlighted = hasSearch && matched.has(unitCode)
		const isDimmed = hasSearch && !isHighlighted

		el.classList.toggle('map-unit--selected', occupancy !== 'empty' && isSelected)
		el.classList.toggle('map-unit--highlighted', hasShop && isHighlighted)
		el.classList.toggle('map-unit--dimmed', hasShop && isDimmed)
	}
}

function scheduleDynamicClassUpdate() {
	nextTick(updateDynamicClasses)
}

// Reagovat na hover/search změny přes DOM manipulaci (ne SVG re-render)
watch(() => props.hoveredUnitCode, scheduleDynamicClassUpdate)
watch(matchedUnitCodes, scheduleDynamicClassUpdate)

// Nastavení event listenerů po renderování SVG
watch(svgWrapperRef, (wrapper) => {
	if (wrapper) {
		nextTick(() => {
			setupEventListeners()
			setupResizeObserver()
			updateDynamicClasses()
		})
	}
})

// Při změně SVG znovu nastavit listenery
watch(processedSvg, () => {
	nextTick(() => {
		setupEventListeners()
		updateDynamicClasses()
	})
})

function setupEventListeners() {
	const wrapper = svgWrapperRef.value
	if (!wrapper) return

	const svg = wrapper.querySelector('svg') as SVGSVGElement | null
	if (!svg) return

	const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

	// Najít všechny jednotky
	const unitElements = svg.querySelectorAll('[data-unit]')

	unitElements.forEach((element) => {
		const unitCode = element.getAttribute('data-unit')

		if (!unitCode) return

		if (isTouchDevice) {
			// Mobile: tap emituje 'unit-tap', composable rozhodne popup/navigate
			element.addEventListener('click', (e) => {
				e.preventDefault()
				const me = e as MouseEvent
				emit('unit-tap', unitCode, { x: me.clientX, y: me.clientY })
			})
		} else {
			// Desktop: hover = popup (pozice kurzoru), click = navigace
			element.addEventListener('mouseenter', (e) => {
				const me = e as MouseEvent
				emit('unit-hover', unitCode, { x: me.clientX, y: me.clientY })
			})
			element.addEventListener('mouseleave', () => {
				emit('unit-hover-leave')
			})
			element.addEventListener('click', () => {
				emit('unit-click', unitCode)
			})
		}
	})

	updateLogoOverlays()
}

function setupResizeObserver() {
	// Nepotřebujeme - procenta se škálují automaticky
}

function updateLogoOverlays() {
	const wrapper = svgWrapperRef.value
	if (!wrapper) {
		logoOverlays.value = []
		return
	}

	const svg = wrapper.querySelector('svg') as SVGSVGElement | null
	if (!svg) {
		logoOverlays.value = []
		return
	}

	// Získat viewBox SVG pro převod souřadnic na procenta
	const viewBox = svg.viewBox.baseVal
	const vbWidth = viewBox.width || svg.getBBox().width
	const vbHeight = viewBox.height || svg.getBBox().height
	if (vbWidth <= 0 || vbHeight <= 0) return

	const unitElements = wrapper.querySelectorAll('[data-unit][data-has-shop="true"]')

	// Fáze 1: Spočítat vizuální střed a poloměr pro každý unit
	interface UnitGeometry {
		unitCode: string
		unit: MapUnit
		cx: number
		cy: number
		r: number
		hasLogo: boolean
	}

	const geometries: UnitGeometry[] = []

	unitElements.forEach((element) => {
		const unitCode = element.getAttribute('data-unit')
		if (!unitCode) return

		const unit = unitsMap.value.get(unitCode)
		if (!unit?.shop) return

		// Použít cache pokud existuje
		const cached = geometryCache.get(unitCode)
		if (cached) {
			geometries.push({
				unitCode,
				unit,
				cx: cached.cx,
				cy: cached.cy,
				r: cached.r,
				hasLogo: !!unit.shop.logo,
			})
			return
		}

		const polygon = samplePolygonFromFill(element)
		if (!polygon || polygon.length < 3) {
			// Fallback na getBBox střed
			const bbox = (element as SVGGraphicsElement).getBBox()
			if (bbox.width > 0 && bbox.height > 0) {
				const geo = {
					cx: bbox.x + bbox.width / 2,
					cy: bbox.y + bbox.height / 2,
					r: Math.min(bbox.width, bbox.height) / 2,
				}
				geometryCache.set(unitCode, geo)
				geometries.push({
					unitCode,
					unit,
					...geo,
					hasLogo: !!unit.shop.logo,
				})
			}
			return
		}

		const poi = poleOfInaccessibility(polygon, 2)
		const geo = { cx: poi.x, cy: poi.y, r: poi.r }
		geometryCache.set(unitCode, geo)
		geometries.push({
			unitCode,
			unit,
			...geo,
			hasLogo: !!unit.shop.logo,
		})
	})

	// Fáze 2: Rozdělit na logo vs iniciály skupinu
	// Zvýšený threshold: logo se zobrazí jen ve větších unitech → budou výrazně větší
	const LOGO_THRESHOLD = vbWidth * 0.025
	const logoGeometries = geometries.filter((g) => g.hasLogo && g.r >= LOGO_THRESHOLD)
	const initialsGeometries = geometries.filter((g) => !g.hasLogo || g.r < LOGO_THRESHOLD)

	// Každé logo vyplní svoji vepsanou kružnici (ne uniformní velikost)
	const LOGO_SCALE = 1.8

	// Fáze 3: Sestavit overlays
	const overlays: LogoOverlay[] = []

	for (const g of logoGeometries) {
		const side = g.r * LOGO_SCALE
		const sizePct = (side / vbWidth) * 100
		overlays.push({
			unitCode: g.unitCode,
			shopName: g.unit.shop!.name,
			logo: g.unit.shop!.logo!,
			centerXPct: ((g.cx - viewBox.x) / vbWidth) * 100,
			centerYPct: ((g.cy - viewBox.y) / vbHeight) * 100,
			sizePct,
			isInitials: false,
			initials: '',
			fontSizePct: 0,
			upcomingLabel: getUpcomingLabel(g.unit.shop!.publishDate),
		})
	}

	for (const g of initialsGeometries) {
		const side = g.r * LOGO_SCALE
		const sizePct = (side / vbWidth) * 100
		// Font size: poměrný k velikosti kontejneru, v vw pro škálování se zoomem
		// Min 0.55vw, max 2vw aby nepřetékaly na velkých rozlišeních
		const fontSizeVw = Math.min(2, Math.max(0.55, (side / vbWidth) * 55))
		overlays.push({
			unitCode: g.unitCode,
			shopName: g.unit.shop!.name,
			logo: g.unit.shop!.logo ?? '',
			centerXPct: ((g.cx - viewBox.x) / vbWidth) * 100,
			centerYPct: ((g.cy - viewBox.y) / vbHeight) * 100,
			sizePct,
			isInitials: true,
			initials: getInitials(g.unit.shop!.name),
			fontSizePct: fontSizeVw,
			upcomingLabel: getUpcomingLabel(g.unit.shop!.publishDate),
		})
	}

	logoOverlays.value = overlays
}

onBeforeUnmount(() => {
	// Cleanup - nic extra nepotřebujeme, procenta se škálují automaticky
})
</script>

<style scoped>
.map-floor {
	-webkit-tap-highlight-color: transparent;
}

.logo-overlay img {
	image-rendering: auto;
}

.upcoming-badge {
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-rendering: optimizeLegibility;
}

.map-floor :deep(svg) {
	width: 100%;
	height: auto;
	display: block;
	/* Průhledné pozadí pro vrstvení nad MapStaticAround */
	background: transparent;
	shape-rendering: geometricPrecision;
	text-rendering: geometricPrecision;
	-webkit-tap-highlight-color: transparent;
}

.map-floor :deep(text) {
	text-rendering: geometricPrecision;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}

/* Skrýt bílé pozadí v SVG */
.map-floor :deep(svg > rect:first-child) {
	fill: transparent !important;
}

.svg-wrapper {
	line-height: 0;
}

/* Styly pro jednotky v SVG */
.map-floor :deep(.map-unit--occupied) {
	cursor: pointer;
	overflow: hidden;
	transition: filter 0.2s ease-out;
}

.map-floor :deep(.map-unit--occupied path[data-name='outline']) {
	fill-opacity: 0.12;
}

.map-floor :deep(.map-unit--selected) {
	filter: brightness(1.1);
}

.map-floor :deep(.map-unit--selected path[data-name='outline']) {
	fill: theme('colors.plaza.DEFAULT');
	fill-opacity: 0.45;
	stroke: theme('colors.plaza.DEFAULT');
	stroke-opacity: 0.5;
	stroke-width: 1;
}

.map-floor :deep(.map-unit--empty) {
	opacity: 0.08;
	filter: grayscale(1) brightness(0.8);
	cursor: pointer;
}

.map-floor :deep(.map-unit--empty path) {
	stroke-opacity: 0.33;
}

.map-floor :deep(.map-unit--private) {
	opacity: 0.22;
	filter: grayscale(0.75) brightness(0.86);
	cursor: default;
	transition: filter 0.2s ease-out, opacity 0.2s ease-out;
}

.map-floor :deep(.map-unit--private path[data-name='outline']) {
	fill-opacity: 0.18;
	stroke-opacity: 0.2;
}

/* Hover pouze pro přesná hover zařízení. iOS/Android jinak drží sticky :hover outline. */
@media (hover: hover) and (pointer: fine) {
	.map-floor :deep(.map-unit--occupied:hover) {
		filter: brightness(1.1);
	}

	.map-floor :deep(.map-unit--occupied:hover path[data-name='outline']) {
		fill: theme('colors.plaza.DEFAULT');
		fill-opacity: 0.6;
	}

	.map-floor :deep(.map-unit--empty:hover) {
		opacity: 0.25;
	}

	.map-floor :deep(.map-unit--private:hover) {
		opacity: 0.3;
	}
}

/* Zvýrazněná jednotka (odpovídá vyhledávání) */
.map-floor :deep(.map-unit--highlighted) {
	filter: brightness(1.15) saturate(1.3);
}

.map-floor :deep(.map-unit--highlighted path[data-name='outline']) {
	fill: theme('colors.plaza.DEFAULT');
	fill-opacity: 0.5;
	stroke: theme('colors.plaza.DEFAULT');
	stroke-opacity: 0.65;
	stroke-width: 1;
}

/* Ztmavená jednotka (neodpovídá vyhledávání) */
.map-floor :deep(.map-unit--dimmed) {
	opacity: 0.35;
	filter: grayscale(0.6) brightness(0.8);
}

/* Parking oblast — ztlumit aby nerušila mapu */
.map-floor :deep(#parking),
.map-floor :deep(#security),
.map-floor :deep(#security-2),
.map-floor :deep(#wc) {
	opacity: 0.15;
	filter: grayscale(0.8) brightness(0.9);
	pointer-events: none;
}

/* Android Chrome má na velkém inline SVG slabý výkon s filtry a geometricPrecision při transform panu. */
.map-floor--android-chrome :deep(svg) {
	shape-rendering: auto;
	text-rendering: optimizeSpeed;
}

.map-floor--android-chrome :deep(text) {
	text-rendering: optimizeSpeed;
}

.map-floor--android-chrome :deep(.map-unit) {
	transition: none !important;
}

.map-floor--android-chrome :deep(.map-unit--occupied),
.map-floor--android-chrome :deep(.map-unit--private),
.map-floor--android-chrome :deep(.map-unit--selected),
.map-floor--android-chrome :deep(.map-unit--highlighted),
.map-floor--android-chrome :deep(.map-unit--dimmed),
.map-floor--android-chrome :deep(.map-unit--empty),
.map-floor--android-chrome :deep(#parking),
.map-floor--android-chrome :deep(#security),
.map-floor--android-chrome :deep(#security-2),
.map-floor--android-chrome :deep(#wc) {
	filter: none !important;
}
</style>
