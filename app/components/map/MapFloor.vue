<template>
	<div ref="containerRef" class="map-floor relative w-full" @mouseleave="handleMouseLeave">
		<!-- SVG obsah -->
		<div
			v-if="svgContent"
			ref="svgWrapperRef"
			class="svg-wrapper w-full relative"
			v-html="processedSvg"
		></div>
		<div v-else-if="pending" class="flex items-center justify-center h-64">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
		</div>
		<div v-else-if="error" class="flex items-center justify-center h-64 text-red-500">
			Nepodařilo se načíst SVG mapy
		</div>

		<!-- Loga obsazených jednotek -->
		<div
			v-for="overlay in logoOverlays"
			:key="overlay.unitCode"
			class="absolute z-[5] pointer-events-none overflow-hidden flex items-center justify-center"
			:style="{
				left: `${overlay.left}px`,
				top: `${overlay.top}px`,
				width: `${overlay.unitWidth}px`,
				height: `${overlay.unitHeight}px`,
			}"
		>
			<div
				v-if="overlay.isDot"
				class="rounded-full bg-primary-600 shrink-0"
				:style="{
					width: `${overlay.logoSize}px`,
					height: `${overlay.logoSize}px`,
				}"
			></div>
			<img
				v-else
				:src="overlay.logo"
				:alt="overlay.shopName"
				class="object-contain shrink-0"
				:style="{
					maxWidth: `${overlay.logoSize}px`,
					maxHeight: `${overlay.logoSize}px`,
				}"
			/>
		</div>

		<!-- Hover tooltip s logem -->
		<div
			v-if="hoveredShop && tooltipPosition"
			class="absolute z-10 pointer-events-none"
			:style="{
				left: `${tooltipPosition.x}px`,
				top: `${tooltipPosition.y}px`,
				transform: 'translate(-50%, -50%)',
			}"
		>
			<div
				class="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-2 py-2 text-center"
				:style="{
					maxWidth: `${tooltipMaxWidth}px`,
				}"
			>
				<img
					v-if="hoveredShop.logo"
					:src="hoveredShop.logo"
					:alt="hoveredShop.name"
					class="w-10 h-10 object-contain mx-auto mb-1"
				/>
				<div v-else class="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-[10px] text-gray-500 text-center px-1 mx-auto mb-1">
					{{ hoveredShop.name }}
				</div>
				<p class="text-[11px] font-semibold text-gray-900 leading-tight break-words">
					{{ hoveredShop.name }}
				</p>
				<p class="text-[10px] text-gray-600 leading-tight mt-0.5 break-words">
					{{ hoveredShop.todayHours.formatted }}
				</p>
			</div>
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
}

const props = defineProps<Props>()

const emit = defineEmits<{
	'unit-hover': [unitCode: string | null]
	'unit-click': [unitCode: string, event: MouseEvent]
}>()

// Načtení SVG obsahu - použít fetch místo useFetch pro statické soubory
const svgContent = ref<string | null>(null)
const pending = ref(true)
const error = ref<Error | null>(null)

// Načíst SVG
const loadSvg = async () => {
	try {
		pending.value = true
		error.value = null
		const response = await fetch(props.svgPath)
		if (!response.ok) {
			throw new Error(`Failed to load SVG: ${response.status}`)
		}
		svgContent.value = await response.text()
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
watch(() => props.svgPath, () => {
	loadSvg()
})

// Refs
const containerRef = ref<HTMLElement | null>(null)
const svgWrapperRef = ref<HTMLElement | null>(null)

// Stav
const hoveredUnitCode = ref<string | null>(null)
const tooltipPosition = ref<{ x: number; y: number } | null>(null)
const tooltipMaxWidth = ref(80)

interface LogoOverlay {
	unitCode: string
	shopName: string
	logo: string
	left: number
	top: number
	unitWidth: number
	unitHeight: number
	logoSize: number
	isDot: boolean
}

const logoOverlays = ref<LogoOverlay[]>([])
let resizeObserver: ResizeObserver | null = null

// Mapa jednotek pro rychlý přístup
const unitsMap = computed(() => {
	const map = new Map<string, MapUnit>()
	for (const unit of props.units) {
		map.set(unit.unitCode, unit)
	}
	return map
})

// Data hoveru obchodu
const hoveredShop = computed(() => {
	if (!hoveredUnitCode.value) return null
	const unit = unitsMap.value.get(hoveredUnitCode.value)
	return unit?.shop ?? null
})

// Zpracované SVG s přidanými třídami a event handlery
const processedSvg = computed(() => {
	if (!svgContent.value) return ''

	let svg = svgContent.value

	// Odstranit bílé pozadí z SVG (rect na začátku s bílou výplní)
	// Toto umožní vidět vrstvu pod tímto SVG
	svg = svg.replace(
		/<rect[^>]*fill=["'](#fff|#ffffff|white|#FFFFFF|#FFF)["'][^>]*\/>/gi,
		'',
	)
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
			const classes = [
				'map-unit',
				'map-unit--occupied',
				'cursor-pointer',
				'transition-all',
				'duration-200',
				isSelected ? 'map-unit--selected' : '',
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

		// Hover events
		element.addEventListener('mouseenter', (e) => handleUnitHover(unitCode, e as MouseEvent))
		element.addEventListener('mouseleave', () => handleUnitLeave())

		// Click event
		element.addEventListener('click', (e) => handleUnitClick(unitCode, e as MouseEvent))
	})

	updateLogoOverlays()
}

function setupResizeObserver() {
	if (resizeObserver) {
		resizeObserver.disconnect()
	}

	const wrapper = svgWrapperRef.value
	if (!wrapper) return

	resizeObserver = new ResizeObserver(() => {
		updateLogoOverlays()
	})

	resizeObserver.observe(wrapper)
}

function updateLogoOverlays() {
	const wrapper = svgWrapperRef.value
	const containerRect = containerRef.value?.getBoundingClientRect()
	if (!wrapper || !containerRect) {
		logoOverlays.value = []
		return
	}

	const unitElements = wrapper.querySelectorAll('[data-unit][data-has-shop="true"]')
	const overlays: LogoOverlay[] = []

	unitElements.forEach((element) => {
		const unitCode = element.getAttribute('data-unit')
		if (!unitCode) return

		const unit = unitsMap.value.get(unitCode)
		const logo = unit?.shop?.logo
		if (!logo) return

		const rect = (element as SVGGraphicsElement).getBoundingClientRect()
		if (rect.width <= 0 || rect.height <= 0) return

		const unitWidth = rect.width
		const unitHeight = rect.height
		const logoSize = Math.min(80, unitWidth * 0.72, unitHeight * 0.72)
		const isDot = logoSize < 14

		overlays.push({
			unitCode,
			shopName: unit?.shop?.name ?? unitCode,
			logo,
			left: rect.left - containerRect.left,
			top: rect.top - containerRect.top,
			unitWidth,
			unitHeight,
			logoSize: isDot ? Math.min(unitWidth, unitHeight) * 0.5 : logoSize,
			isDot,
		})
	})

	logoOverlays.value = overlays
}

function handleUnitHover(unitCode: string, event: MouseEvent) {
	hoveredUnitCode.value = unitCode
	emit('unit-hover', unitCode)

	// Vypočítat pozici tooltipu
	const target = event.currentTarget as SVGElement
	const rect = target.getBoundingClientRect()
	const containerRect = containerRef.value?.getBoundingClientRect()

	if (containerRect) {
		const boundedWidth = Math.min(rect.width, 80)
		tooltipMaxWidth.value = boundedWidth

		tooltipPosition.value = {
			x: rect.left + rect.width / 2 - containerRect.left,
			y: rect.top + rect.height / 2 - containerRect.top,
		}
	}
}

function handleUnitLeave() {
	hoveredUnitCode.value = null
	tooltipPosition.value = null
	emit('unit-hover', null)
}

function handleMouseLeave() {
	hoveredUnitCode.value = null
	tooltipPosition.value = null
	emit('unit-hover', null)
}

function handleUnitClick(unitCode: string, event: MouseEvent) {
	emit('unit-click', unitCode, event)
}

onBeforeUnmount(() => {
	if (resizeObserver) {
		resizeObserver.disconnect()
	}
})
</script>

<style scoped>
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
</style>
