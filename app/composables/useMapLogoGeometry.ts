/**
 * Composable pro výpočet umístění log obchodů na SVG mapě.
 *
 * Sdíleno mezi:
 *  - `MapFloor.vue` (mode: 'web') — zachovává původní chování s `LOGO_THRESHOLD`,
 *    kdy se u malých jednotek místo loga zobrazí iniciály.
 *  - `useMapExport` (mode: 'export') — pro export do SVG/PDF VŽDY zobrazí logo,
 *    pokud ho obchod má. Iniciály se použijí jen jako fallback pro obchody bez loga.
 *
 * Výpočet vyžaduje ŽIVÝ SVG element v DOM (potřebuje `getTotalLength()`, `baseVal`,
 * `getCTM()` apod.). V exportu proto vkládáme zdrojový SVG do offscreen kontejneru.
 */

import type { MapUnit } from '~~/shared/map/units'

// ────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────

export type LogoGeometryMode = 'web' | 'export'

export interface LogoOverlay {
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
	/** Iniciály (fallback) */
	initials: string
	/** Velikost fontu iniciál ve vw (pro web mode) */
	fontSizePct: number
	/** Upcoming badge text, null pokud není upcoming */
	upcomingLabel: string | null
}

export interface UnitGeometryCacheEntry {
	cx: number
	cy: number
	r: number
	side: number
}

export type UnitGeometryCache = Map<string, UnitGeometryCacheEntry>

// ────────────────────────────────────────────────────────────────────
// Geometry helpers
// ────────────────────────────────────────────────────────────────────

type Point = [number, number]

function isExplicitFillElement(element: Element): boolean {
	const id = element.getAttribute('id') ?? ''
	const dataName = element.getAttribute('data-name') ?? ''
	return id === 'fill' || dataName === 'fill' || id.startsWith('fill')
}

function isExplicitOutlineElement(element: Element): boolean {
	const id = element.getAttribute('id') ?? ''
	const dataName = element.getAttribute('data-name') ?? ''
	return id === 'outline' || dataName === 'outline' || id.startsWith('outline')
}

function sampleShapeElement(element: Element): Point[] | null {
	if (element instanceof SVGPathElement) {
		return samplePathPoints(element)
	}
	if (element instanceof SVGRectElement) {
		return rectToPolygon(element)
	}
	return null
}

function samplePolygonFromFill(element: Element): Point[] | null {
	const directShapes = Array.from(element.children).filter((child) => {
		return child instanceof SVGPathElement || child instanceof SVGRectElement
	})

	for (const shape of directShapes) {
		if (isExplicitFillElement(shape)) {
			return sampleShapeElement(shape)
		}
	}

	for (const shape of directShapes) {
		if (!isExplicitOutlineElement(shape)) {
			return sampleShapeElement(shape)
		}
	}

	const nestedShapes = element.querySelectorAll('path, rect')
	for (const shape of nestedShapes) {
		if (isExplicitFillElement(shape)) {
			return sampleShapeElement(shape)
		}
	}

	return null
}

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

function getPolygonBounds(polygon: Point[]) {
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

	return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY }
}

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

	const rectCTM = rect.getCTM()
	const parentCTM = (rect.parentElement as unknown as SVGGraphicsElement | null)?.getCTM?.()
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

function pointInPolygon(x: number, y: number, polygon: Point[]): boolean {
	let inside = false
	for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
		const pi = polygon[i]!
		const pj = polygon[j]!
		const xi = pi[0],
			yi = pi[1]
		const xj = pj[0],
			yj = pj[1]

		if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
			inside = !inside
		}
	}
	return inside
}

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

function distToPolygonEdge(x: number, y: number, polygon: Point[]): number {
	let minDistSq = Infinity
	for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
		const pi = polygon[i]!
		const pj = polygon[j]!
		const d = distToSegmentSq(x, y, pj[0], pj[1], pi[0], pi[1])
		if (d < minDistSq) minDistSq = d
	}
	return Math.sqrt(minDistSq)
}

function pointInPolygonOrNearEdge(
	x: number,
	y: number,
	polygon: Point[],
	edgeTolerance: number = 1.5,
): boolean {
	return pointInPolygon(x, y, polygon) || distToPolygonEdge(x, y, polygon) <= edgeTolerance
}

function poleOfInaccessibility(
	polygon: Point[],
	precision: number = 1,
): { x: number; y: number; r: number } {
	const bounds = getPolygonBounds(polygon)
	let { minX, minY, maxX, maxY } = bounds
	const { width, height } = bounds
	let cellSize = Math.max(width, height)
	if (cellSize === 0) return { x: minX, y: minY, r: 0 }

	let bestX = minX + width / 2
	let bestY = minY + height / 2
	let bestDist = pointInPolygon(bestX, bestY, polygon)
		? distToPolygonEdge(bestX, bestY, polygon)
		: 0

	let cx = 0,
		cy = 0,
		area = 0
	for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
		const [ax, ay] = polygon[j]!
		const [bx, by] = polygon[i]!
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
		minX = bestX - cellSize
		minY = bestY - cellSize
		maxX = bestX + cellSize
		maxY = bestY + cellSize
		cellSize /= 2
	}

	return { x: bestX, y: bestY, r: bestDist }
}

function squareFitsInPolygon(cx: number, cy: number, halfSide: number, polygon: Point[]): boolean {
	if (halfSide <= 0) return pointInPolygonOrNearEdge(cx, cy, polygon)

	const samplesPerEdge = Math.max(4, Math.ceil((halfSide * 2) / 8))
	for (let i = 0; i <= samplesPerEdge; i++) {
		const t = i / samplesPerEdge
		const offset = -halfSide + t * halfSide * 2

		if (!pointInPolygonOrNearEdge(cx + offset, cy - halfSide, polygon)) return false
		if (!pointInPolygonOrNearEdge(cx + offset, cy + halfSide, polygon)) return false
		if (!pointInPolygonOrNearEdge(cx - halfSide, cy + offset, polygon)) return false
		if (!pointInPolygonOrNearEdge(cx + halfSide, cy + offset, polygon)) return false
	}

	return true
}

function maxSquareHalfSideAtPoint(cx: number, cy: number, polygon: Point[]): number {
	if (!pointInPolygonOrNearEdge(cx, cy, polygon)) return 0

	const bounds = getPolygonBounds(polygon)
	let low = 0
	let high = Math.min(cx - bounds.minX, bounds.maxX - cx, cy - bounds.minY, bounds.maxY - cy)

	if (high <= 0) return 0

	for (let i = 0; i < 12; i++) {
		const mid = (low + high) / 2
		if (squareFitsInPolygon(cx, cy, mid, polygon)) {
			low = mid
		} else {
			high = mid
		}
	}

	return low
}

// ────────────────────────────────────────────────────────────────────
// Public helpers
// ────────────────────────────────────────────────────────────────────

/** Vrátit iniciály z názvu obchodu (max 2 znaky) */
export function getInitials(name: string): string {
	const trimmed = name.trim()
	if (!trimmed) return '?'

	if (trimmed.length <= 3) return trimmed.toUpperCase()

	const words = trimmed.split(/[\s\-_/]+/).filter(Boolean)
	if (words.length >= 2 && words[0] && words[1]) {
		return (words[0][0]! + words[1][0]!).toUpperCase()
	}

	return trimmed.slice(0, 2).toUpperCase()
}

/** Vrátit upcoming label pokud je publishDate v budoucnosti */
export function getUpcomingLabel(publishDate?: string): string | null {
	if (!publishDate) return null
	const date = new Date(publishDate)
	if (date.getTime() <= Date.now()) return null
	return `Otevíráme: ${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`
}

// ────────────────────────────────────────────────────────────────────
// Hlavní funkce: výpočet overlayů
// ────────────────────────────────────────────────────────────────────

interface ComputeLogoOverlaysOptions {
	/** SVG kontejner, který obsahuje vykreslené `<svg>` patro a `[data-unit]` elementy. */
	svgWrapper: HTMLElement | SVGSVGElement
	/** Jednotky patra. */
	units: MapUnit[]
	/**
	 * 'web'    — historické chování: malé jednotky → iniciály (LOGO_THRESHOLD).
	 * 'export' — VŽDY logo, pokud obchod logo má. Iniciály jen jako fallback.
	 */
	mode: LogoGeometryMode
	/** Volitelná cache geometrie (sdílená napříč vykresleními pro výkon). */
	cache?: UnitGeometryCache
}

const LOGO_SCALE = 1.8

export function computeLogoOverlays(opts: ComputeLogoOverlaysOptions): LogoOverlay[] {
	const { svgWrapper, units, mode } = opts
	const cache = opts.cache ?? new Map<string, UnitGeometryCacheEntry>()

	const svg = (
		svgWrapper instanceof SVGSVGElement ? svgWrapper : svgWrapper.querySelector('svg')
	) as SVGSVGElement | null
	if (!svg) return []

	const viewBox = svg.viewBox.baseVal
	const vbWidth = viewBox.width || svg.getBBox().width
	const vbHeight = viewBox.height || svg.getBBox().height
	if (vbWidth <= 0 || vbHeight <= 0) return []

	const unitsMap = new Map<string, MapUnit>()
	for (const unit of units) {
		unitsMap.set(unit.unitCode, unit)
	}

	const unitElements = svgWrapper.querySelectorAll('[data-unit][data-has-shop="true"]')

	interface UnitGeometry {
		unitCode: string
		unit: MapUnit
		cx: number
		cy: number
		r: number
		side: number
		hasLogo: boolean
	}

	const geometries: UnitGeometry[] = []

	unitElements.forEach((element) => {
		const unitCode = element.getAttribute('data-unit')
		if (!unitCode) return

		const unit = unitsMap.get(unitCode)
		if (!unit?.shop) return

		const cached = cache.get(unitCode)
		if (cached) {
			geometries.push({
				unitCode,
				unit,
				cx: cached.cx,
				cy: cached.cy,
				r: cached.r,
				side: cached.side,
				hasLogo: !!unit.shop.logo,
			})
			return
		}

		const polygon = samplePolygonFromFill(element)
		if (!polygon || polygon.length < 3) {
			const bbox = (element as SVGGraphicsElement).getBBox()
			if (bbox.width > 0 && bbox.height > 0) {
				const r = Math.min(bbox.width, bbox.height) / 2
				const geo = {
					cx: bbox.x + bbox.width / 2,
					cy: bbox.y + bbox.height / 2,
					r,
					side: r * LOGO_SCALE,
				}
				cache.set(unitCode, geo)
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
		const originalSide = poi.r * LOGO_SCALE
		let side = originalSide

		const maxHalfSide = maxSquareHalfSideAtPoint(poi.x, poi.y, polygon)
		if (maxHalfSide > 0) {
			const safeSide = maxHalfSide * 2 * 0.92
			if (unitCode === '111' || originalSide > safeSide * 1.35) {
				side = safeSide
			}
		}

		const geo = { cx: poi.x, cy: poi.y, r: poi.r, side }
		cache.set(unitCode, geo)
		geometries.push({
			unitCode,
			unit,
			...geo,
			hasLogo: !!unit.shop.logo,
		})
	})

	// Rozdělení logo vs iniciály — záleží na mode
	let logoGeometries: UnitGeometry[]
	let initialsGeometries: UnitGeometry[]

	if (mode === 'export') {
		// Pro export VŽDY logo, pokud existuje. Iniciály jen jako fallback.
		logoGeometries = geometries.filter((g) => g.hasLogo)
		initialsGeometries = geometries.filter((g) => !g.hasLogo)
	} else {
		// Web mode: zachovat původní chování s LOGO_THRESHOLD.
		const LOGO_THRESHOLD = vbWidth * 0.02
		logoGeometries = geometries.filter((g) => g.hasLogo && g.r >= LOGO_THRESHOLD)
		initialsGeometries = geometries.filter((g) => !g.hasLogo || g.r < LOGO_THRESHOLD)
	}

	const overlays: LogoOverlay[] = []

	for (const g of logoGeometries) {
		const sizePct = (g.side / vbWidth) * 100
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
		const sizePct = (g.side / vbWidth) * 100
		const fontSizeVw = Math.min(2, Math.max(0.55, (g.side / vbWidth) * 55))
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

	return overlays
}

/**
 * Vrátí výchozí viewBox SVG patra (potřeba pro export — převod % zpět na souřadnice).
 */
export function getSvgViewBox(svgWrapper: HTMLElement | SVGSVGElement): {
	x: number
	y: number
	width: number
	height: number
} | null {
	const svg = (
		svgWrapper instanceof SVGSVGElement ? svgWrapper : svgWrapper.querySelector('svg')
	) as SVGSVGElement | null
	if (!svg) return null
	const vb = svg.viewBox.baseVal
	const width = vb.width || svg.getBBox().width
	const height = vb.height || svg.getBBox().height
	if (width <= 0 || height <= 0) return null
	return { x: vb.x, y: vb.y, width, height }
}
