<template>
	<ClientOnly>
		<Teleport to="body">
			<Transition name="popup">
				<div v-if="unit && position" class="fixed inset-0 z-50" @click.self="emit('close')">
					<!-- Overlay -->
					<div class="absolute inset-0" @click="emit('close')"></div>

					<!-- Popup -->
					<div
						ref="popupRef"
						class="popup-card absolute bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden w-64"
						:style="popupStyle"
					>
						<div class="p-5 text-center">
							<!-- Název obchodu -->
							<h3 class="text-xl font-bold text-white mb-2">
								{{ unit.shop?.name }}
							</h3>

							<!-- Otevírací hodiny -->
							<p class="text-sm text-gray-300 mb-4">
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

							<!-- Tlačítko více -->
							<NuxtLink
								v-if="unit.shop?.slug"
								:to="`/obchody/${unit.shop.slug}`"
								class="mt-1 inline-flex items-center justify-center px-6 py-2 bg-plaza text-white font-sans font-semibold text-base tracking-[0.05em] rounded-[5px_20px_5px_5px] hover:brightness-110 transition-all duration-300"
							>
								{{ t('common.more') }}
							</NuxtLink>
						</div>
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
	/** Pozice kde se má popup zobrazit */
	position: { x: number; y: number } | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
	close: []
}>()

const popupRef = ref<HTMLElement | null>(null)

// Vypočítat pozici popupu tak, aby nepřetékal z obrazovky
const popupStyle = computed(() => {
	if (!props.position) return {}

	const { x, y } = props.position
	const popupWidth = 256 // w-64
	const popupHeight = 160 // přibližná výška kompaktního popupu
	const margin = 16

	// Vycentrovat horizontálně na pozici kliknutí
	let left = x - popupWidth / 2
	let top = y + 10 // Trochu pod kliknutím

	// Kontrola pravého okraje
	if (left + popupWidth > window.innerWidth - margin) {
		left = window.innerWidth - popupWidth - margin
	}

	// Kontrola levého okraje
	if (left < margin) {
		left = margin
	}

	// Kontrola spodního okraje - pokud by přetékal, zobrazit nad
	if (top + popupHeight > window.innerHeight - margin) {
		top = y - popupHeight - 10
	}

	// Kontrola horního okraje
	if (top < margin) {
		top = margin
	}

	return {
		left: `${left}px`,
		top: `${top}px`,
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
/* Popup animace */
.popup-enter-active {
	transition: opacity 0.25s ease;
}
.popup-leave-active {
	transition: opacity 0.15s ease;
}

.popup-enter-from,
.popup-leave-to {
	opacity: 0;
}

/* Popup card animace */
.popup-enter-active :deep(.popup-card) {
	transition:
		transform 0.25s cubic-bezier(0.16, 1, 0.3, 1),
		opacity 0.25s ease;
}
.popup-leave-active :deep(.popup-card) {
	transition:
		transform 0.15s ease,
		opacity 0.15s ease;
}

.popup-enter-from :deep(.popup-card),
.popup-leave-to :deep(.popup-card) {
	opacity: 0;
	transform: scale(0.9) translateY(8px);
}
</style>
