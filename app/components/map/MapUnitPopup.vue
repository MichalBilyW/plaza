<template>
	<ClientOnly>
		<Teleport to="body">
			<Transition name="popup">
				<div v-if="unit && position" class="fixed inset-0 z-50" @click.self="emit('close')">
					<!-- Overlay -->
					<div class="absolute inset-0 bg-black/20" @click="emit('close')"></div>

				<!-- Popup -->
				<div
					ref="popupRef"
					class="absolute bg-white rounded-xl shadow-xl overflow-hidden max-w-xs w-full"
					:style="popupStyle"
				>
					<!-- Header s logem -->
					<div
						class="relative h-24 bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center"
					>
						<img
							v-if="unit.shop?.logo"
							:src="unit.shop.logo"
							:alt="unit.shop.name"
							class="max-h-16 max-w-[80%] object-contain"
						/>
						<div v-else class="text-lg font-semibold text-primary-700 text-center px-4">
							{{ unit.shop?.name }}
						</div>

						<!-- Zavřít -->
						<button
							type="button"
							class="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-600 hover:text-gray-900 transition-colors"
							@click="emit('close')"
						>
							<svg
								class="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>

					<!-- Obsah -->
					<div class="p-4">
						<!-- Název obchodu -->
						<h3 class="text-lg font-semibold text-gray-900 mb-3">
							{{ unit.shop?.name }}
						</h3>

						<!-- Otevírací hodiny -->
						<div class="flex items-center gap-2 mb-4">
							<svg
								class="w-5 h-5 text-gray-400 flex-shrink-0"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<div>
								<span class="text-sm text-gray-500">Dnes:</span>
								<span
									:class="[
										'ml-1 text-sm font-medium',
										unit.shop?.todayHours.isOpen
											? 'text-green-600'
											: 'text-red-600',
									]"
								>
									{{ unit.shop?.todayHours.formatted }}
								</span>
							</div>
						</div>

						<!-- Tlačítko na detail -->
						<NuxtLink
							v-if="unit.shop?.slug"
							:to="`/obchody/${unit.shop.slug}`"
							class="block w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white text-center rounded-lg font-medium transition-colors"
						>
							Zobrazit detail
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
	const popupWidth = 320 // max-w-xs
	const popupHeight = 250 // přibližná výška
	const margin = 16

	let left = x
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

// Zavřít na Escape
onMounted(() => {
	const handleEscape = (e: KeyboardEvent) => {
		if (e.key === 'Escape' && props.unit) {
			emit('close')
		}
	}
	window.addEventListener('keydown', handleEscape)
	onUnmounted(() => {
		window.removeEventListener('keydown', handleEscape)
	})
})
</script>

<style scoped>
/* Popup animace */
.popup-enter-active,
.popup-leave-active {
	transition: all 0.2s ease;
}

.popup-enter-from,
.popup-leave-to {
	opacity: 0;
}

.popup-enter-from .bg-white,
.popup-leave-to .bg-white {
	transform: scale(0.95);
}
</style>
