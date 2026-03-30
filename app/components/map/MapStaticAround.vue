<template>
	<div ref="containerRef" class="map-static-around relative w-full">
		<!-- SVG obsah bude vložen pomocí v-html -->
		<div
			v-if="svgContent"
			ref="svgWrapperRef"
			class="svg-wrapper w-full"
			:class="isReady ? 'opacity-100' : 'opacity-0'"
			v-html="svgContent"
		></div>
	</div>
</template>

<script setup lang="ts">
import { STATIC_AROUND_GROUPS } from '~~/shared/map/units'

interface Props {
	/** Cesta k SVG souboru */
	svgPath: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
	'loaded': []
	'animation-complete': []
}>()

// Načtení SVG obsahu
const svgContent = ref<string | null>(null)
const isReady = ref(false)

// Refs
const containerRef = ref<HTMLElement | null>(null)
const svgWrapperRef = ref<HTMLElement | null>(null)

// Načíst SVG okamžitě po mount
onMounted(async () => {
	try {
		const response = await fetch(props.svgPath)
		if (!response.ok) {
			throw new Error(`Failed to load SVG: ${response.status}`)
		}
		svgContent.value = await response.text()
	} catch (e) {
		console.error('Failed to load SVG:', e)
	}
})

// Po načtení SVG: připravit animaci a emitovat 'loaded'
watch(svgContent, async (newContent) => {
	if (!newContent) return

	await nextTick()

	const svg = svgWrapperRef.value?.querySelector('svg')
	if (!svg) return

	// Skrýt všechny skupiny pro animaci
	for (const groupName of STATIC_AROUND_GROUPS) {
		const group = svg.querySelector(`#${groupName}`) as SVGElement | null
		if (group) {
			group.style.opacity = '0'
			group.style.transition = 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
		}
	}

	// SVG je načtené, emitovat event
	emit('loaded')
})

/**
 * Spustí animaci zobrazení skupin (voláno z rodiče)
 */
async function startAnimation() {
	const svg = svgWrapperRef.value?.querySelector('svg')
	if (!svg) {
		emit('animation-complete')
		return
	}

	// Zobrazit wrapper
	isReady.value = true

	// Krátká prodleva pro CSS transition
	await new Promise((resolve) => setTimeout(resolve, 50))

	// Animovat skupiny postupně s kratšími intervaly
	for (let i = 0; i < STATIC_AROUND_GROUPS.length; i++) {
		const groupName = STATIC_AROUND_GROUPS[i]
		if (!groupName) continue

		const group = svg.querySelector(`#${groupName}`) as SVGElement | null
		if (group) {
			group.style.opacity = '1'
		}

		// Kratší delay mezi skupinami
		if (i < STATIC_AROUND_GROUPS.length - 1) {
			await new Promise((resolve) => setTimeout(resolve, 200))
		}
	}

	// Počkat na dokončení posledního přechodu
	await new Promise((resolve) => setTimeout(resolve, 600))
	emit('animation-complete')
}

// Expose metody pro rodiče
defineExpose({ startAnimation })
</script>

<style scoped>
.map-static-around :deep(svg) {
	width: 100%;
	height: auto;
	display: block;
}

.svg-wrapper {
	line-height: 0;
	transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
	will-change: opacity;
	transform: translateZ(0);
}

/* Plynulé animace pro SVG skupiny */
.map-static-around :deep(svg g) {
	will-change: opacity;
}
</style>
