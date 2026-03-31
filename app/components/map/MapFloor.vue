<template>
	<div ref="containerRef" class="map-floor relative w-full">
		<!-- SVG obsah -->
		<div
			v-if="svgContent"
			ref="svgWrapperRef"
			class="svg-wrapper w-full relative transition-opacity duration-300"
			:class="isReady ? 'opacity-100' : 'opacity-0'"
			v-html="processedSvg"
		></div>

		<!-- Loga obsazených jednotek -->
		<div
			v-for="overlay in logoOverlays"
			:key="overlay.unitCode"
			class="absolute z-[5] pointer-events-none overflow-hidden flex items-center justify-center transition-opacity duration-300"
			:class="isReady ? 'opacity-100' : 'opacity-0'"
			:style="{
				left: `${overlay.leftPct}%`,
				top: `${overlay.topPct}%`,
				width: `${overlay.widthPct}%`,
				height: `${overlay.heightPct}%`,
				clipPath: overlay.clipPath ?? undefined,
			}"
		>
			<div
				v-if="overlay.isDot"
				class="rounded-full bg-primary-600 w-1/2 h-1/2 max-w-[8px] max-h-[8px]"
			></div>
			<img
				v-else
				:src="overlay.logo"
				:alt="overlay.shopName"
				class="object-contain max-w-[85%] max-h-[85%]"
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
	/** Jednotky patra s daty obchodů */
	units: MapUnit[]
	/** Aktuálně vybraná jednotka */
	selectedUnit?: MapUnit | null
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
	'unit-click': [unitCode: string, event: MouseEvent]
}>()

// Načtení SVG obsahu - použít fetch místo useFetch pro statické soubory
const svgContent = ref<string | null>(null)
const pending = ref(true)
const error = ref<Error | null>(null)
const isReady = ref(false)

// Načíst SVG
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
	loadSvg()
})

// Při změně cesty znovu načíst
watch(
	() => props.svgPath,
	() => {
		loadSvg()
	},
)

// Refs
const containerRef = ref<HTMLElement | null>(null)
const svgWrapperRef = ref<HTMLElement | null>(null)

interface LogoOverlay {
	unitCode: string
	shopName: string
	logo: string
	/** Pozice a rozměry v procentech SVG viewBoxu */
	leftPct: number
	topPct: number
	widthPct: number
	heightPct: number
	isDot: boolean
	clipPath: string | null
}

const logoOverlays = ref<LogoOverlay[]>([])

// Mapa jednotek pro rychlý přístup
const unitsMap = computed(() => {
	const map = new Map<string, MapUnit>()
	for (const unit of props.units) {
		map.set(unit.unitCode, unit)
	}
	return map
})

// Zpracované SVG s přidanými třídami a event handlery
const processedSvg = computed(() => {
	if (!svgContent.value) return ''

	let svg = svgContent.value

	// Odstranit bílé pozadí z SVG (rect na začátku s bílou výplní)
	// Toto umožní vidět vrstvu pod tímto SVG
	svg = svg.replace(/<rect[^>]*fill=["'](#fff|#ffffff|white|#FFFFFF|#FFF)["'][^>]*\/>/gi, '')
	svg = svg.replace(
		/<rect[^>]*style=["'][^"']*fill:\s*(#fff|#ffffff|white)[^"']*["'][^>]*\/>/gi,
		'',
	)

	// Pro každou jednotku přidat data atributy
	for (const unit of props.units) {
		const elementId = createUnitElementId(unit.unitCode)
		const hasShop = !!unit.shop
		const isSelected = props.selectedUnit?.unitCode === unit.unitCode

		// Najít element v SVG a přidat třídy
		const regex = new RegExp(`id=["']${elementId}["']`, 'g')

		if (hasShop) {
			// Obsazená jednotka - interaktivní
			const isHighlighted = matchedUnitCodes.value.has(unit.unitCode)
			const isDimmed = matchedUnitCodes.value.size > 0 && !isHighlighted
			const classes = [
				'map-unit',
				'map-unit--occupied',
				'cursor-pointer',
				'transition-all',
				'duration-300',
				isSelected ? 'map-unit--selected' : '',
				isHighlighted ? 'map-unit--highlighted' : '',
				isDimmed ? 'map-unit--dimmed' : '',
			]
				.filter(Boolean)
				.join(' ')

			svg = svg.replace(
				regex,
				`id="${elementId}" class="${classes}" data-unit="${unit.unitCode}" data-has-shop="true"`,
			)
		} else {
			// Prázdná jednotka - ztmavená
			svg = svg.replace(
				regex,
				`id="${elementId}" class="map-unit map-unit--empty opacity-40" data-unit="${unit.unitCode}" data-has-shop="false"`,
			)
		}
	}

	return svg
})

// Nastavení event listenerů po renderování SVG
watch(svgWrapperRef, (wrapper) => {
	if (wrapper) {
		nextTick(() => {
			setupEventListeners()
			setupResizeObserver()
		})
	}
})

// Při změně SVG znovu nastavit listenery
watch(processedSvg, () => {
	nextTick(() => {
		setupEventListeners()
	})
})

function setupEventListeners() {
	const wrapper = svgWrapperRef.value
	if (!wrapper) return

	const svg = wrapper.querySelector('svg')
	if (!svg) return

	// Najít všechny jednotky
	const unitElements = svg.querySelectorAll('[data-unit]')

	unitElements.forEach((element) => {
		const unitCode = element.getAttribute('data-unit')
		const hasShop = element.getAttribute('data-has-shop') === 'true'

		if (!unitCode || !hasShop) return

		// Click event
		element.addEventListener('click', (e) => handleUnitClick(unitCode, e as MouseEvent))
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
	const overlays: LogoOverlay[] = []

	unitElements.forEach((element) => {
		const unitCode = element.getAttribute('data-unit')
		if (!unitCode) return

		const unit = unitsMap.value.get(unitCode)
		const logo = unit?.shop?.logo
		if (!logo) return

		// getBBox() vrací SVG coordinate space - nezávisí na CSS transformech
		const bbox = (element as SVGGraphicsElement).getBBox()
		if (bbox.width <= 0 || bbox.height <= 0) return

		const minDim = Math.min(bbox.width, bbox.height)
		const isDot = minDim < 10

		// Pozice v procentech viewBoxu
		const leftPct = ((bbox.x - viewBox.x) / vbWidth) * 100
		const topPct = ((bbox.y - viewBox.y) / vbHeight) * 100
		const widthPct = (bbox.width / vbWidth) * 100
		const heightPct = (bbox.height / vbHeight) * 100

		// Clip-path podle skutečného tvaru SVG polygonu
		const clipPath = computeClipPath(element)

		overlays.push({
			unitCode,
			shopName: unit?.shop?.name ?? unitCode,
			logo,
			leftPct,
			topPct,
			widthPct,
			heightPct,
			isDot,
			clipPath,
		})
	})

	logoOverlays.value = overlays
}

/**
 * Vzorek bodů z SVG path a převod na CSS clip-path: polygon()
 * Používá getBBox() — imunní vůči CSS transformům (panzoom, viewport)
 */
function computeClipPath(element: Element): string | null {
	const path = element.querySelector('path') as SVGPathElement | null
	if (!path?.getTotalLength) return null

	const totalLength = path.getTotalLength()
	if (totalLength <= 0) return null

	// getBBox vrací souřadnice v SVG coordinate space — nezávisí na CSS transformech
	const bbox = (element as SVGGraphicsElement).getBBox()
	if (bbox.width <= 0 || bbox.height <= 0) return null

	const numPoints = 32
	const points: string[] = []

	for (let i = 0; i < numPoints; i++) {
		const pt = path.getPointAtLength((i / numPoints) * totalLength)
		const pctX = ((pt.x - bbox.x) / bbox.width) * 100
		const pctY = ((pt.y - bbox.y) / bbox.height) * 100
		points.push(`${pctX.toFixed(1)}% ${pctY.toFixed(1)}%`)
	}

	return `polygon(${points.join(', ')})`
}

function handleUnitClick(unitCode: string, event: MouseEvent) {
	emit('unit-click', unitCode, event)
}

onBeforeUnmount(() => {
	// Cleanup - nic extra nepotřebujeme, procenta se škálují automaticky
})
</script>

<style scoped>
.map-floor {
	will-change: opacity;
	transform: translateZ(0);
}

.map-floor :deep(svg) {
	width: 100%;
	height: auto;
	display: block;
	/* Průhledné pozadí pro vrstvení nad MapStaticAround */
	background: transparent;
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

.map-floor :deep(.map-unit--occupied:hover) {
	filter: brightness(1.1);
}

.map-floor :deep(.map-unit--selected) {
	filter: brightness(1.2);
	stroke: theme('colors.indigo.600');
	stroke-width: 2;
}

.map-floor :deep(.map-unit--empty) {
	opacity: 0.4;
	filter: grayscale(0.5);
}

/* Zvýrazněná jednotka (odpovídá vyhledávání) */
.map-floor :deep(.map-unit--highlighted) {
	filter: brightness(1.15) saturate(1.3);
	stroke: theme('colors.plaza.DEFAULT');
	stroke-width: 1;
}

/* Ztmavená jednotka (neodpovídá vyhledávání) */
.map-floor :deep(.map-unit--dimmed) {
	opacity: 0.35;
	filter: grayscale(0.6) brightness(0.8);
}
</style>
