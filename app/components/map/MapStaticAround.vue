<template>
	<div ref="containerRef" class="map-static-around relative w-full">
		<!-- SVG obsah bude vložen pomocí v-html -->
		<div
			v-if="svgContent"
			ref="svgWrapperRef"
			class="svg-wrapper w-full"
			v-html="svgContent"
		></div>
		<div v-else-if="pending" class="flex items-center justify-center h-64">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
		</div>
		<div v-else-if="error" class="flex items-center justify-center h-64 text-red-500">
			Nepodařilo se načíst SVG
		</div>
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
	'animation-complete': []
}>()

// Načtení SVG obsahu - použít useAsyncData místo useFetch pro statické soubory
const svgContent = ref<string | null>(null)
const pending = ref(true)
const error = ref<Error | null>(null)

// Načíst SVG pouze na klientu (statické soubory v public/ nejsou API endpointy)
onMounted(async () => {
	try {
		pending.value = true
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
})

// Refs
const containerRef = ref<HTMLElement | null>(null)
const svgWrapperRef = ref<HTMLElement | null>(null)

// Stav animace - které skupiny jsou viditelné
const visibleGroups = reactive<Set<string>>(new Set())
const hasAnimated = ref(false)
const isInView = ref(false)

/**
 * Intersection Observer pro detekci viditelnosti
 */
let observer: IntersectionObserver | null = null

onMounted(() => {
	observer = new IntersectionObserver(
		(entries) => {
			if (entries[0]?.isIntersecting) {
				isInView.value = true
				observer?.disconnect()
			}
		},
		{ threshold: 0.3 },
	)

	if (containerRef.value) {
		observer.observe(containerRef.value)
	}
})

onUnmounted(() => {
	observer?.disconnect()
})

/**
 * Spustí animaci po doscrollování (pokud je SVG už načtené)
 */
watch(isInView, (inView) => {
	if (inView && svgContent.value && !hasAnimated.value) {
		hasAnimated.value = true
		nextTick(() => startAnimation())
	}
})

/**
 * Postupně animuje skupiny v SVG (Cesty → Budovy → Pudorys)
 */
async function startAnimation() {
	const svg = svgWrapperRef.value?.querySelector('svg')
	if (!svg) return

	// Přidat CSS přechody
	for (const groupName of STATIC_AROUND_GROUPS) {
		const group = svg.querySelector(`#${groupName}`) as SVGElement | null
		if (group) {
			group.style.transition = 'opacity 0.8s ease-out'
		}
	}

	// Malá prodleva pro registraci přechodů
	await new Promise((resolve) => setTimeout(resolve, 50))

	// Animovat skupiny postupně
	for (let i = 0; i < STATIC_AROUND_GROUPS.length; i++) {
		if (i > 0) {
			await new Promise((resolve) => setTimeout(resolve, 400))
		}

		const groupName = STATIC_AROUND_GROUPS[i]
		if (!groupName) continue

		const group = svg.querySelector(`#${groupName}`) as SVGElement | null
		if (group) {
			group.style.opacity = '1'
			visibleGroups.add(groupName)
		}
	}

	// Počkat na dokončení posledního CSS přechodu
	await new Promise((resolve) => setTimeout(resolve, 800))
	emit('animation-complete')
}

// Při změně SVG obsahu: skrýt skupiny + případně znovu animovat
watch(svgContent, (newContent) => {
	visibleGroups.clear()
	hasAnimated.value = false

	if (newContent) {
		nextTick(() => {
			const svg = svgWrapperRef.value?.querySelector('svg')
			if (!svg) return

			// Okamžitě skrýt skupiny
			for (const groupName of STATIC_AROUND_GROUPS) {
				const group = svg.querySelector(`#${groupName}`) as SVGElement | null
				if (group) {
					group.style.opacity = '0'
				}
			}

			// Pokud je sekce již viditelná, spustit animaci
			if (isInView.value) {
				hasAnimated.value = true
				startAnimation()
			}
		})
	}
})
</script>

<style scoped>
.map-static-around :deep(svg) {
	width: 100%;
	height: auto;
	display: block;
}

.svg-wrapper {
	line-height: 0;
}
</style>
