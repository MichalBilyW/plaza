<template>
	<ClientOnly>
		<Teleport to="body">
			<!--
				Popup bez overlay — nesmí blokovat interakci s mapou.
				Fade-in/scale při prvním zobrazení, plynulý CSS přesun mezi unity,
				fade-out jen při opuštění všech unitů.
			-->
			<Transition name="popup">
				<div
					v-if="unit && position"
					ref="popupRef"
					class="popup-card fixed z-50 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden w-52 md:w-64 pointer-events-auto"
					:style="popupStyle"
					@mouseenter="emit('cancel-hide')"
					@mouseleave="emit('close')"
				>
					<div class="p-3 md:p-5 text-center">
						<!-- Logo nebo název obchodu -->
						<img
							v-if="unit.shop?.logo && !logoFailed"
							:src="unit.shop.logo"
							:alt="unit.shop.name"
							class="mx-auto mb-2 object-contain max-h-12 md:max-h-[80px]"
							style="max-width: 140px"
							@error="logoFailed = true"
						/>
						<h3 v-else class="text-base md:text-xl font-bold text-gray-900 mb-2">
							{{ unit.shop?.name }}
						</h3>

						<!-- Otevírací hodiny (ne pro upcoming) -->
						<p v-if="!isUpcoming" class="text-sm text-gray-900 mb-4">
							<span
								:class="
									unit.shop?.todayHours.isOpen
										? 'text-plaza-success'
										: 'text-plaza'
								"
								aria-hidden="true"
								>●</span
							>
							{{ unit.shop?.todayHours.formatted }}
						</p>

						<!-- Upcoming badge -->
						<p v-if="isUpcoming" class="text-sm font-semibold text-plaza mb-4">
							{{ upcomingLabel }}
						</p>

						<!-- Tlačítko více (ne pro upcoming) -->
						<NuxtLink
							v-if="unit.shop?.slug && !isUpcoming"
							:to="`/obchody/${unit.shop.slug}`"
							class="mt-1 inline-flex items-center justify-center px-6 py-2 bg-plaza text-white font-sans font-semibold text-base tracking-[0.05em] rounded-[5px_20px_5px_5px] hover:brightness-110 transition-all duration-300"
						>
							{{ t('common.more') }}
						</NuxtLink>
					</div>
				</div>
			</Transition>
		</Teleport>
	</ClientOnly>
</template>

<script setup lang="ts">
import type { MapUnit } from '~~/shared/map/units'
const { t } = useI18n()

interface Props {
	/** Vybraná jednotka */
	unit: MapUnit | null
	/** Pozice kde se má popup zobrazit (střed horní hrany unitu ve viewport souřadnicích) */
	position: { x: number; y: number } | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
	close: []
	'cancel-hide': []
}>()

const popupRef = ref<HTMLElement | null>(null)
const logoFailed = ref(false)

// Upcoming shop — publishDate v budoucnosti
const isUpcoming = computed(
	() =>
		!!props.unit?.shop?.publishDate &&
		new Date(props.unit.shop.publishDate).getTime() > Date.now(),
)

const upcomingLabel = computed(() => {
	if (!props.unit?.shop?.publishDate) return ''
	const d = new Date(props.unit.shop.publishDate)
	return `Otevíráme: ${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`
})

// Reset logoFailed při změně unitu
watch(
	() => props.unit?.unitCode,
	() => {
		logoFailed.value = false
	},
)

/**
 * Pozice popupu: vycentrovaný horizontálně na pozici kurzoru,
 * nad nebo pod podle toho kde je víc místa.
 * CSS transition pro plynulý přesun mezi unity.
 */
const popupStyle = computed(() => {
	if (!props.position) return {}

	const { x, y } = props.position
	const isMobile = window.innerWidth < 768
	const popupWidth = isMobile ? 208 : 256 // w-52 / w-64
	const popupHeight = isMobile ? 150 : 180 // přibližná výška
	const gap = isMobile ? 12 : 16 // mezera od kurzoru
	const margin = 8

	// Vycentrovat horizontálně na pozici kurzoru
	let left = x - popupWidth / 2

	// Kontrola pravého okraje
	if (left + popupWidth > window.innerWidth - margin) {
		left = window.innerWidth - popupWidth - margin
	}

	// Kontrola levého okraje
	if (left < margin) {
		left = margin
	}

	// Nad nebo pod kurzorem — kde je víc místa
	const spaceAbove = y
	const spaceBelow = window.innerHeight - y
	let top: number

	if (spaceAbove >= popupHeight + gap || spaceAbove >= spaceBelow) {
		// Zobrazit nad kurzorem
		top = y - popupHeight - gap
	} else {
		// Zobrazit pod kurzorem
		top = y + gap
	}

	// Finální clamp do viewportu
	if (top < margin) top = margin
	if (top + popupHeight > window.innerHeight - margin) {
		top = window.innerHeight - popupHeight - margin
	}

	return {
		left: `${left}px`,
		top: `${top}px`,
		transition:
			'left 0.25s cubic-bezier(0.16, 1, 0.3, 1), top 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
	}
})

// Zavřít na Escape a při scrollu
onMounted(() => {
	const handleEscape = (e: KeyboardEvent) => {
		if (e.key === 'Escape' && props.unit) {
			emit('close')
		}
	}
	const handleScroll = () => {
		if (props.unit) {
			emit('close')
		}
	}
	window.addEventListener('keydown', handleEscape)
	window.addEventListener('scroll', handleScroll, { passive: true })
	onUnmounted(() => {
		window.removeEventListener('keydown', handleEscape)
		window.removeEventListener('scroll', handleScroll)
	})
})
</script>

<style scoped>
/* Popup fade-in/scale při prvním zobrazení */
.popup-enter-active {
	transition:
		opacity 0.2s ease,
		transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.popup-leave-active {
	transition:
		opacity 0.15s ease,
		transform 0.15s ease;
}

.popup-enter-from,
.popup-leave-to {
	opacity: 0;
	transform: scale(0.92) translateY(6px);
}
</style>
