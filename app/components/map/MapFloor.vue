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
import {
	computeLogoOverlays,
	type LogoOverlay,
	type UnitGeometryCache,
} from '~/composables/useMapLogoGeometry'

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
		geometryCache.clear()
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

const logoOverlays = ref<LogoOverlay[]>([])

// ─── Geometry cache: výpočet umístění overlaye je drahý → cachujeme per unitCode ───
const geometryCache: UnitGeometryCache = new Map()

// ─── Optimalizace: SVG zpracování oddělené od hover/search ───

/**
 * Základní SVG: jen statické třídy (occupied/empty) a data atributy.
 * NEZÁVISÍ na hoveredUnitCode ani searchQuery → nepřepočítává se při hoveru/hledání.
 */
const baseSvg = computed(() => {
	if (!svgContent.value) return ''

	let svg = svgContent.value

	// Odstranit <title> elementy (způsobují browser tooltip s názvem souboru)
	svg = svg.replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '')

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

	logoOverlays.value = computeLogoOverlays({
		svgWrapper: wrapper,
		units: props.units,
		mode: 'web',
		cache: geometryCache,
	})
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
