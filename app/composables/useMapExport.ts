/**
 * Composable pro export interaktivní mapy patra do SVG / PDF.
 *
 * Strategie:
 *   - Generuje **standalone SVG** s vrstvou okolí (`staticAroundMap`) + vrstvou patra
 *     + logy obchodů jako `<image>` + dekoracemi (hlavička, seznam obchodů,
 *     Plaza logo). Inline `<style>` blok aplikuje stejné mapové styly jako web.
 *   - PDF se vyrobí **rasterizací SVG do canvasu** (vysoké DPI) a vložením PNG do
 *     jsPDF. Tím je vyřešena diakritika (jsPDF default Helvetica nemá UTF-8) a
 *     vizuální shoda s webem je zaručena.
 *
 * V exportu se VŽDY zobrazí logo, pokud obchod logo má (žádný `LOGO_THRESHOLD`).
 * Pro obchody bez nahraného loga se vykreslí iniciály.
 */

import jsPDF from 'jspdf'
import {
	computeLogoOverlays,
	getInitials,
	getSvgViewBox,
	type LogoOverlay,
} from './useMapLogoGeometry'
import {
	createUnitElementId,
	type FloorUnitsResponse,
	type MapUnit,
} from '~~/shared/map/units'
import { normalizeMapUnitsSvg } from '~~/shared/map/normalizeSvg'

// ────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────

export interface MapExportOptions {
	showPlazaLogo: boolean
	showHeader: boolean
	showShopList: boolean
	mapOnly: boolean
}

export type ExportFormat = 'svg' | 'pdf'
export type PdfPaperFormat = 'a4' | 'a3'

export interface ExportRequest {
	floor: FloorUnitsResponse
	staticAroundMapContent: string | null
	options: MapExportOptions
	format: ExportFormat
	paperFormat?: PdfPaperFormat
}

export const DEFAULT_EXPORT_OPTIONS: MapExportOptions = {
	showPlazaLogo: true,
	showHeader: true,
	showShopList: true,
	mapOnly: false,
}

// ────────────────────────────────────────────────────────────────────
// Konstanty pro layout exportu (souřadnice ve vnějším viewBoxu)
// ────────────────────────────────────────────────────────────────────

const SVG_NS = 'http://www.w3.org/2000/svg'
const XLINK_NS = 'http://www.w3.org/1999/xlink'

const PAGE_PADDING = 40
const HEADER_HEIGHT = 70
const PLAZA_LOGO_HEIGHT = 50
const SHOP_LIST_COLUMN_WIDTH = 240
const SHOP_LIST_ROW_HEIGHT = 18
const SHOP_LIST_PADDING_TOP = 30

const COLORS = {
	text: '#111827',
	textMuted: '#6b7280',
	border: '#e5e7eb',
	occupied: '#6366f1',
	private: '#9ca3af',
	empty: '#fb923c',
	upcoming: '#15803d', /* green-700 */
	plazaPrimary: '#1f2937',
}

/**
 * CSS styly aplikované přímo do SVG. Odpovídají webu (`MapFloor.vue`),
 * jen bez interaktivních stavů (hover/selected/highlighted).
 */
const EXPORT_MAP_STYLES = `
.map-unit { transition: none !important; }
.map-unit--occupied path[data-name='outline'] { fill-opacity: 0.12; }
.map-unit--empty { opacity: 0.08; }
.map-unit--empty path { stroke-opacity: 0.33; }
.map-unit--private { opacity: 0.4; }
.map-unit--private path[data-name='outline'] { fill-opacity: 0.18; stroke-opacity: 0.2; }
#parking, #security, #security-2, #wc { opacity: 0.15; }
`.trim()

// ────────────────────────────────────────────────────────────────────
// Hlavní API
// ────────────────────────────────────────────────────────────────────

export function useMapExport() {
	async function buildExportSvg(req: ExportRequest): Promise<string> {
		const { floor, staticAroundMapContent, options } = req
		if (!floor.svgContent) {
			throw new Error('Patro nemá SVG mapu — export není možný.')
		}

		// 1) Připravit zdrojové SVG patra (přidat data-* atributy a třídy jako web)
		const processedFloorSvg = processFloorSvgForExport(floor.svgContent, floor.units)

		// 2) Vykreslit SVG patra do offscreen kontejneru pro výpočet geometrie log
		const offscreen = mountOffscreen(processedFloorSvg)
		try {
			const overlays = computeLogoOverlays({
				svgWrapper: offscreen,
				units: floor.units,
				mode: 'export',
			})
			const floorViewBox = getSvgViewBox(offscreen)
			if (!floorViewBox) {
				throw new Error('SVG patra nemá platný viewBox.')
			}

			// Normalizace v `mountOffscreen` doplnila chybějící `data-name` v DOMu.
			// Pro finální export potřebujeme tento už normalizovaný markup.
			const normalizedFloorSvg =
				offscreen.querySelector('svg')?.outerHTML ?? processedFloorSvg

			// 3) Inline všechna loga jako data URI (paralelně)
			const logoOverlays = overlays.filter((o) => !o.isInitials && o.logo)
			const dataUris = await Promise.all(
				logoOverlays.map((o) => fetchAsDataUri(o.logo).catch(() => null)),
			)
			const logoDataMap = new Map<string, string>()
			logoOverlays.forEach((o, i) => {
				const uri = dataUris[i]
				if (uri) logoDataMap.set(o.unitCode, uri)
			})

			// 4) Plaza logo
			const plazaLogoUri = options.showPlazaLogo
				? await fetchAsDataUri('/svgs/logo.svg').catch(() => null)
				: null

			// 5) Sestavit finální SVG
			return buildFinalSvg({
				processedFloorSvg: normalizedFloorSvg,
				floorViewBox,
				staticAroundSvg: staticAroundMapContent ?? null,
				overlays,
				logoDataMap,
				plazaLogoUri,
				floor,
				options,
			})
		} finally {
			offscreen.remove()
		}
	}

	function downloadSvg(svgString: string, filename: string): void {
		const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
		triggerDownload(blob, filename)
	}

	/**
	 * Rasterizuje SVG na canvas a vloží do PDF jako PNG.
	 * Tím se vyhneme problémům s diakritikou v jsPDF (default Helvetica je WinAnsi).
	 */
	async function downloadPdf(
		svgString: string,
		filename: string,
		paperFormat: PdfPaperFormat = 'a3',
	): Promise<void> {
		const paperSizeMm: Record<PdfPaperFormat, [number, number]> = {
			a4: [297, 210],
			a3: [420, 297],
		}
		const [pwMm, phMm] = paperSizeMm[paperFormat]

		// Cílové DPI pro tisk (200 DPI = solidní kvalita, rozumná velikost souboru)
		const TARGET_DPI = 200
		const MM_PER_INCH = 25.4
		const pxPerMm = TARGET_DPI / MM_PER_INCH
		const targetW = Math.round(pwMm * pxPerMm)
		const targetH = Math.round(phMm * pxPerMm)

		const png = await rasterizeSvgToPng(svgString, targetW, targetH)

		const pdf = new jsPDF({
			orientation: 'landscape',
			unit: 'mm',
			format: paperFormat,
			compress: true,
		})
		pdf.addImage(png, 'PNG', 0, 0, pwMm, phMm, undefined, 'FAST')
		pdf.save(filename)
	}

	async function exportFloor(req: ExportRequest): Promise<void> {
		const svgString = await buildExportSvg(req)
		const baseName = sanitizeFilename(req.floor.floorName) || 'patro'
		const datePart = formatDateForFilename(new Date())
		const filename = `mapa-${baseName}-${datePart}`

		if (req.format === 'svg') {
			downloadSvg(svgString, `${filename}.svg`)
		} else {
			await downloadPdf(svgString, `${filename}.pdf`, req.paperFormat ?? 'a3')
		}
	}

	return {
		buildExportSvg,
		downloadSvg,
		downloadPdf,
		exportFloor,
	}
}

// ────────────────────────────────────────────────────────────────────
// Build final SVG
// ────────────────────────────────────────────────────────────────────

interface BuildFinalSvgArgs {
	processedFloorSvg: string
	floorViewBox: { x: number; y: number; width: number; height: number }
	staticAroundSvg: string | null
	overlays: LogoOverlay[]
	logoDataMap: Map<string, string>
	plazaLogoUri: string | null
	floor: FloorUnitsResponse
	options: MapExportOptions
}

function buildFinalSvg(args: BuildFinalSvgArgs): string {
	const {
		processedFloorSvg,
		floorViewBox,
		staticAroundSvg,
		overlays,
		logoDataMap,
		plazaLogoUri,
		floor,
		options,
	} = args

	const headerH = !options.mapOnly && options.showHeader ? HEADER_HEIGHT : 0

	const shops = floor.units
		.filter((u) => u.occupancyType === 'shop' && u.shop)
		.sort((a, b) => (a.shop!.name || '').localeCompare(b.shop!.name || '', 'cs'))
	const showList = !options.mapOnly && options.showShopList && shops.length > 0
	const shopListWidth = showList ? SHOP_LIST_COLUMN_WIDTH : 0

	const mapAreaW = 1600
	const mapAreaH = (mapAreaW * floorViewBox.height) / floorViewBox.width

	const totalW = mapAreaW + shopListWidth + PAGE_PADDING * 2
	const totalH = mapAreaH + headerH + PAGE_PADDING * 2

	const floorInner = extractSvgInner(processedFloorSvg)
	const staticInner = staticAroundSvg ? extractSvgInnerWithViewBox(staticAroundSvg) : null

	const styleBlock = `<style><![CDATA[\n${EXPORT_MAP_STYLES}\n]]></style>`

	const parts: string[] = []
	parts.push(
		`<svg xmlns="${SVG_NS}" xmlns:xlink="${XLINK_NS}" viewBox="0 0 ${totalW} ${totalH}" width="${totalW}" height="${totalH}">`,
	)
	parts.push(styleBlock)
	parts.push(`<rect x="0" y="0" width="${totalW}" height="${totalH}" fill="#ffffff"/>`)

	let cursorY = PAGE_PADDING

	// Header
	if (!options.mapOnly && (options.showHeader || options.showPlazaLogo)) {
		const headerY = cursorY

		if (options.showPlazaLogo && plazaLogoUri) {
			const logoH = PLAZA_LOGO_HEIGHT
			const logoW = logoH * 2.5
			parts.push(
				`<image x="${PAGE_PADDING}" y="${headerY}" width="${logoW}" height="${logoH}" preserveAspectRatio="xMidYMid meet" href="${escapeAttr(plazaLogoUri)}" xlink:href="${escapeAttr(plazaLogoUri)}"/>`,
			)
		}

		if (options.showHeader) {
			parts.push(
				`<text x="${totalW - PAGE_PADDING}" y="${headerY + 30}" text-anchor="end" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="28" fill="${COLORS.text}">${escapeXml(floor.floorName)}</text>`,
			)
			parts.push(
				`<text x="${totalW - PAGE_PADDING}" y="${headerY + 55}" text-anchor="end" font-family="Helvetica, Arial, sans-serif" font-size="14" fill="${COLORS.textMuted}">${escapeXml(formatCzechDate(new Date()))}</text>`,
			)
		}

		cursorY = headerY + HEADER_HEIGHT + 10
	}

	// Mapová oblast — vrstva okolí + vrstva patra (sdílejí stejné x/y/w/h)
	const mapX = PAGE_PADDING
	const mapY = cursorY

	if (staticInner) {
		parts.push(
			`<svg x="${mapX}" y="${mapY}" width="${mapAreaW}" height="${mapAreaH}" viewBox="${staticInner.viewBox}" preserveAspectRatio="xMidYMid meet">`,
		)
		parts.push(staticInner.inner)
		parts.push('</svg>')
	}

	parts.push(
		`<svg x="${mapX}" y="${mapY}" width="${mapAreaW}" height="${mapAreaH}" viewBox="${floorViewBox.x} ${floorViewBox.y} ${floorViewBox.width} ${floorViewBox.height}" preserveAspectRatio="xMidYMid meet">`,
	)
	parts.push(floorInner)
	parts.push(buildOverlayMarkup(overlays, logoDataMap, floorViewBox))
	parts.push('</svg>')

	cursorY = mapY + mapAreaH + 10

	// Seznam obchodů (pravý sloupec)
	if (showList) {
		const listX = PAGE_PADDING + mapAreaW + 20
		let listY = mapY + SHOP_LIST_PADDING_TOP
		parts.push(
			`<text x="${listX}" y="${listY}" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="14" fill="${COLORS.text}">Seznam obchodů</text>`,
		)
		listY += 22

		const maxRows = Math.floor((mapAreaH - SHOP_LIST_PADDING_TOP - 30) / SHOP_LIST_ROW_HEIGHT)
		const visible = shops.slice(0, maxRows)
		for (const u of visible) {
			parts.push(
				`<text x="${listX}" y="${listY}" font-family="Helvetica, Arial, sans-serif" font-weight="600" font-size="11" fill="${COLORS.textMuted}">${escapeXml(u.unitCode)}</text>`,
			)
			parts.push(
				`<text x="${listX + 48}" y="${listY}" font-family="Helvetica, Arial, sans-serif" font-size="11" fill="${COLORS.text}">${escapeXml(truncate(u.shop!.name, 28))}</text>`,
			)
			listY += SHOP_LIST_ROW_HEIGHT
		}

		if (shops.length > visible.length) {
			parts.push(
				`<text x="${listX}" y="${listY + 5}" font-family="Helvetica, Arial, sans-serif" font-style="italic" font-size="10" fill="${COLORS.textMuted}">… +${shops.length - visible.length} dalších</text>`,
			)
		}
	}

	parts.push('</svg>')
	return parts.join('\n')
}

function buildOverlayMarkup(
	overlays: LogoOverlay[],
	logoDataMap: Map<string, string>,
	viewBox: { x: number; y: number; width: number; height: number },
): string {
	const out: string[] = []
	out.push(`<g id="plaza-export-overlays">`)
	for (const overlay of overlays) {
		const cx = viewBox.x + (overlay.centerXPct / 100) * viewBox.width
		const cy = viewBox.y + (overlay.centerYPct / 100) * viewBox.height
		const size = (overlay.sizePct / 100) * viewBox.width
		const x = cx - size / 2
		const y = cy - size / 2

		if (!overlay.isInitials && logoDataMap.has(overlay.unitCode)) {
			const uri = logoDataMap.get(overlay.unitCode)!
			out.push(
				`<image x="${x}" y="${y}" width="${size}" height="${size}" preserveAspectRatio="xMidYMid meet" href="${escapeAttr(uri)}" xlink:href="${escapeAttr(uri)}"/>`,
			)
		} else {
			const initials = overlay.initials || getInitials(overlay.shopName)
			out.push(
				`<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${size * 0.1}" fill="#ffffff" stroke="${COLORS.border}" stroke-width="${size * 0.02}"/>`,
			)
			out.push(
				`<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="${size * 0.4}" fill="${COLORS.plazaPrimary}">${escapeXml(initials)}</text>`,
			)
		}
	}
	out.push('</g>')
	return out.join('\n')
}

// ────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────

/**
 * Přidá `data-*` atributy a `class` jednotkám — stejná logika jako `MapFloor.vue`,
 * jen bez `cursor-pointer` (export není interaktivní).
 */
function processFloorSvgForExport(svgContent: string, units: MapUnit[]): string {
	let svg = svgContent

	svg = svg.replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '')
	svg = svg.replace(/<rect[^>]*fill=["'](#fff|#ffffff|white|#FFFFFF|#FFF)["'][^>]*\/>/gi, '')
	svg = svg.replace(
		/<rect[^>]*style=["'][^"']*fill:\s*(#fff|#ffffff|white)[^"']*["'][^>]*\/>/gi,
		'',
	)

	for (const unit of units) {
		const elementId = createUnitElementId(unit.unitCode)
		const regex = new RegExp(`id=["']${elementId}["']`, 'g')
		const cls =
			unit.occupancyType === 'shop'
				? 'map-unit map-unit--occupied'
				: unit.occupancyType === 'private'
					? 'map-unit map-unit--private'
					: 'map-unit map-unit--empty'

		svg = svg.replace(
			regex,
			`id="${elementId}" class="${cls}" data-unit="${unit.unitCode}" data-has-shop="${unit.occupancyType === 'shop'}" data-occupancy="${unit.occupancyType}"`,
		)
	}

	return svg
}

function mountOffscreen(svgString: string): HTMLDivElement {
	const div = document.createElement('div')
	div.style.position = 'fixed'
	div.style.left = '-99999px'
	div.style.top = '0'
	div.style.width = '2000px'
	div.style.height = '2000px'
	div.style.opacity = '0'
	div.style.pointerEvents = 'none'
	div.innerHTML = svgString
	document.body.appendChild(div)
	// Normalizace map-units (doplnění data-name pro SVG bez pojmenovaných vrstev z Illustratoru)
	normalizeMapUnitsSvg(div)
	return div
}

async function fetchAsDataUri(url: string): Promise<string> {
	const res = await fetch(url)
	if (!res.ok) throw new Error(`Nelze stáhnout: ${url}`)
	const blob = await res.blob()
	return await blobToDataUri(blob)
}

function blobToDataUri(blob: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => resolve(reader.result as string)
		reader.onerror = () => reject(reader.error)
		reader.readAsDataURL(blob)
	})
}

/** Extrahuje vnitřek `<svg>...</svg>` (bez root tagu). */
function extractSvgInner(svgString: string): string {
	const match = svgString.match(/<svg[^>]*>([\s\S]*)<\/svg>/i)
	return match?.[1] ?? svgString
}

/** Extrahuje vnitřek + viewBox root SVG. */
function extractSvgInnerWithViewBox(
	svgString: string,
): { inner: string; viewBox: string } | null {
	const openMatch = svgString.match(/<svg([^>]*)>/i)
	if (!openMatch) return null
	const attrs = openMatch[1] ?? ''
	const vbMatch = attrs.match(/viewBox=["']([^"']+)["']/i)
	let viewBox = vbMatch?.[1]
	if (!viewBox) {
		const w = attrs.match(/\bwidth=["']([\d.]+)/i)?.[1]
		const h = attrs.match(/\bheight=["']([\d.]+)/i)?.[1]
		if (!w || !h) return null
		viewBox = `0 0 ${w} ${h}`
	}
	const inner = extractSvgInner(svgString)
	return { inner, viewBox }
}

function escapeXml(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;')
}

function escapeAttr(s: string): string {
	return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

function formatCzechDate(d: Date): string {
	const months = [
		'ledna',
		'února',
		'března',
		'dubna',
		'května',
		'června',
		'července',
		'srpna',
		'září',
		'října',
		'listopadu',
		'prosince',
	]
	return `${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()}`
}

/**
 * Rasterizuje SVG string na PNG data URI.
 */
async function rasterizeSvgToPng(
	svgString: string,
	targetW: number,
	targetH: number,
): Promise<string> {
	let svg = svgString
	if (!/xmlns=["']http:\/\/www\.w3\.org\/2000\/svg["']/.test(svg)) {
		svg = svg.replace('<svg', `<svg xmlns="${SVG_NS}"`)
	}

	const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
	const url = URL.createObjectURL(blob)
	try {
		const img = await loadImage(url)

		const svgViewBox = parseSvgRootViewBox(svg)
		const svgRatio = svgViewBox
			? svgViewBox.width / svgViewBox.height
			: img.width / img.height
		const targetRatio = targetW / targetH

		let drawW: number
		let drawH: number
		let offsetX = 0
		let offsetY = 0
		if (svgRatio > targetRatio) {
			drawW = targetW
			drawH = targetW / svgRatio
			offsetY = (targetH - drawH) / 2
		} else {
			drawH = targetH
			drawW = targetH * svgRatio
			offsetX = (targetW - drawW) / 2
		}

		const canvas = document.createElement('canvas')
		canvas.width = targetW
		canvas.height = targetH
		const ctx = canvas.getContext('2d')
		if (!ctx) throw new Error('Canvas 2D context není dostupný.')
		ctx.fillStyle = '#ffffff'
		ctx.fillRect(0, 0, targetW, targetH)
		ctx.drawImage(img, offsetX, offsetY, drawW, drawH)

		return canvas.toDataURL('image/png')
	} finally {
		URL.revokeObjectURL(url)
	}
}

function loadImage(url: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image()
		img.crossOrigin = 'anonymous'
		img.onload = () => resolve(img)
		img.onerror = () => reject(new Error('Nepodařilo se vykreslit SVG do obrázku.'))
		img.src = url
	})
}

function parseSvgRootViewBox(svgString: string): { width: number; height: number } | null {
	const m = svgString.match(/<svg[^>]*viewBox=["']([^"']+)["']/i)
	if (!m || !m[1]) return null
	const parts = m[1].trim().split(/\s+/).map(Number)
	if (parts.length !== 4 || parts.some(isNaN)) return null
	return { width: parts[2]!, height: parts[3]! }
}

function triggerDownload(blob: Blob, filename: string): void {
	const url = URL.createObjectURL(blob)
	const a = document.createElement('a')
	a.href = url
	a.download = filename
	document.body.appendChild(a)
	a.click()
	a.remove()
	setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function sanitizeFilename(s: string): string {
	return s
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
}

function formatDateForFilename(d: Date): string {
	const pad = (n: number) => String(n).padStart(2, '0')
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function truncate(s: string, max: number): string {
	if (s.length <= max) return s
	return s.slice(0, max - 1) + '…'
}
