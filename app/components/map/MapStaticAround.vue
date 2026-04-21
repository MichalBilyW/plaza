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
	/** Inline obsah SVG (pokud je předán, přeskočí se fetch) */
	svgContent?: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
	loaded: []
	'animation-complete': []
}>()

// Načtení SVG obsahu - použít inline obsah pokud je k dispozici, jinak fetch
const svgContent = ref<string | null>(props.svgContent ?? null)
const isReady = ref(false)

// Refs
const containerRef = ref<HTMLElement | null>(null)
const svgWrapperRef = ref<HTMLElement | null>(null)

onMounted(async () => {
	if (props.svgContent) {
		// Inline obsah je předán — DOM je připraven, spustit init přímo
		await initSvgAnimation()
		return
	}
	try {
		const response = await fetch(props.svgPath)
		if (!response.ok) {
			throw new Error(`Failed to load SVG: ${response.status}`)
		}
		svgContent.value = await response.text()
	} catch (e) {
		console.error('Failed to load SVG:', e)
	}
	// watch(svgContent) se postará o emit('loaded') po fetch
})

// Při změně inline obsahu aktualizovat
watch(
	() => props.svgContent,
	(newContent) => {
		if (newContent) svgContent.value = newContent
	},
)

// Po fetch: připravit animaci a emitovat 'loaded'
watch(svgContent, async (newContent) => {
	if (!newContent) return
	await initSvgAnimation()
})

async function initSvgAnimation() {
	await nextTick()

	const svg = svgWrapperRef.value?.querySelector('svg')
	if (!svg) return

	// Skrýt všechny skupiny pro animaci
	for (const groupName of STATIC_AROUND_GROUPS) {
		const group = svg.querySelector(`#${groupName}`) as SVGElement | null
		if (group) {
			group.style.opacity = '0'
			group.style.transition = 'opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
		}
	}

	// SVG je načtené, emitovat event
	emit('loaded')
}

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

		// Krátký delay mezi skupinami
		if (i < STATIC_AROUND_GROUPS.length - 1) {
			await new Promise((resolve) => setTimeout(resolve, 80))
		}
	}

	// Počkat na dokončení posledního přechodu
	await new Promise((resolve) => setTimeout(resolve, 350))
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
}

</style>
