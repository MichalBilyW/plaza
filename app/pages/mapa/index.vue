<template>
	<div class="min-h-screen bg-gray-50">
		<!-- Header -->
		<div class="bg-gradient-to-b from-[#131313] to-[#1A1A1A] pt-20 pb-12">
			<h1
				class="text-center text-white font-heading font-black text-3xl md:text-4xl uppercase"
			>
				{{ t('mapPage.title') }}
			</h1>
		</div>

		<!-- Mapa -->
		<div class="container mx-auto px-4 py-8">
			<!-- Loading state -->
			<div v-if="pending" class="flex items-center justify-center h-96">
				<div
					class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"
				></div>
			</div>

			<!-- Error state -->
			<div v-else-if="error" class="text-center py-12">
				<p class="text-red-500 mb-4">{{ t('common.error') }}</p>
				<button
					type="button"
					class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
					@click="refresh"
				>
					{{ t('common.retry') }}
				</button>
			</div>

			<template v-else>
				<ClientOnly>
					<!-- Přepínač pater -->
					<div v-if="floors.length > 1" class="flex justify-center gap-2 mb-6">
						<button
							v-for="floor in floors"
							:key="floor.floorId"
							type="button"
							:class="[
								'px-6 py-3 rounded-lg font-medium transition-colors',
								state.currentFloorId === floor.floorId
									? 'bg-primary-600 text-white shadow-lg'
									: 'bg-white text-gray-700 hover:bg-gray-100 shadow',
							]"
							@click="selectFloor(floor.floorId)"
						>
							{{ floor.floorName }}
						</button>
					</div>

					<!-- Ovládání zoomu -->
					<div class="flex justify-center gap-2 mb-4">
						<button
							v-for="level in zoomLevels"
							:key="level.value"
							type="button"
							:class="[
								'px-4 py-2 rounded-lg font-medium transition-colors text-sm',
								zoomLevel === level.value
									? 'bg-gray-800 text-white shadow-lg'
									: 'bg-white text-gray-700 hover:bg-gray-100 shadow',
							]"
							@click="setZoom(level.value)"
						>
							{{ level.label }}
						</button>
					</div>

					<!-- Interaktivní mapa - vrstvy nad sebou -->
					<div ref="mapContainerRef" class="bg-white rounded-xl shadow-lg p-4 md:p-8 overflow-hidden max-h-[80vh]" :class="isZoomed && !isTouch ? 'cursor-grab active:cursor-grabbing' : ''">
						<div ref="mapContentRef" class="relative map-layers">
							<!-- Spodní vrstva: SVG okolí (static_around) -->
							<div class="absolute inset-0 z-0">
								<MapStaticAround
									v-if="staticAroundMap"
									:svg-path="staticAroundMap"
									class="w-full h-full"
									@animation-complete="handleAnimationComplete"
								/>
							</div>

							<!-- Horní vrstva: SVG patra (MapFloor) - definuje velikost kontejneru -->
							<MapFloor
								v-if="currentFloor?.svgMap"
								:svg-path="currentFloor.svgMap"
								:units="currentFloor.units"
								:selected-unit="state.selectedUnit"
								class="relative z-10 transition-opacity duration-700 ease-out"
								:class="floorVisible ? 'opacity-100' : 'opacity-0'"
								@unit-hover="handleUnitHover"
								@unit-click="handleUnitClick"
							/>

							<!-- Fallback pokud není SVG patra -->
							<div
								v-else-if="staticAroundMap"
								class="relative z-10"
							>
								<MapStaticAround
									:svg-path="staticAroundMap"
									class="w-full opacity-0"
								/>
							</div>

							<!-- Chybí obě SVG -->
							<div
								v-if="!staticAroundMap && !currentFloor?.svgMap"
								class="text-center py-12 text-gray-500"
							>
								{{ t('mapPage.noMapForFloor') }}
							</div>
						</div>
					</div>

					<!-- Legenda -->
					<div class="mt-6 flex justify-center gap-6 text-sm text-gray-600">
						<div class="flex items-center gap-2">
							<div class="w-4 h-4 rounded bg-primary-500"></div>
							<span>{{ t('mapPage.occupiedUnit') }}</span>
						</div>
						<div class="flex items-center gap-2">
							<div class="w-4 h-4 rounded bg-gray-300 opacity-40"></div>
							<span>{{ t('mapPage.emptyUnit') }}</span>
						</div>
					</div>

					<!-- Popup s detailem obchodu -->
					<MapUnitPopup
						:unit="state.selectedUnit"
						:position="state.popupPosition"
						@close="closePopup"
					/>

					<template #fallback>
						<div class="flex items-center justify-center h-96">
							<div
								class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"
							></div>
						</div>
					</template>
				</ClientOnly>
			</template>
		</div>
	</div>
</template>

<script setup lang="ts">
const { t } = useI18n()

usePlazaSeo({
	title: t('seo.map.title'),
	description: t('seo.map.description'),
})

const {
	floors,
	currentFloor,
	staticAroundMap,
	state,
	pending,
	error,
	selectFloor,
	handleUnitHover,
	handleUnitClick,
	closePopup,
	refresh,
	onFloorChange,
} = useInteractiveMap()

// Úvodní animace
const showFloor = ref(false)
const floorVisible = computed(() => !staticAroundMap.value || showFloor.value)

// Zoom
const { zoomLevel, zoomLevels, mapContainerRef, mapContentRef, setZoom, resetAndCenter, isZoomed, isTouch } = useMapZoom()

// Centrovat mapu při změně patra
onFloorChange(() => {
	resetAndCenter()
})

// Handler pro dokončení animace SVG okolí
function handleAnimationComplete() {
	showFloor.value = true
	resetAndCenter()
}
</script>
