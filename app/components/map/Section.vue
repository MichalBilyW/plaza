<template>
	<section class="relative">
		<!-- Gradient overlay -->
		<div class="z-10 absolute left-0 top-[40px] w-full h-[60px] bg-gradient-to-b from-white to-transparent"></div>

		<!-- Map Tools -->
		<div class="z-20 relative container flex flex-col lg:flex-row gap-4 md:gap-6 justify-between items-center px-4">
			<!-- Search input -->
			<div class="relative w-full max-w-[400px]">
				<label for="shop-search" class="sr-only">{{
					t('common.searchShop')
				}}</label>
				<svg
					class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-plaza-dark"
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					aria-hidden="true"
				>
					<circle cx="11" cy="11" r="8" />
					<path d="M21 21l-4.35-4.35" stroke-linecap="round" />
				</svg>
				<input
					id="shop-search"
					v-model="search"
					type="search"
					autocomplete="off"
					:placeholder="t('shops.shopName')"
					class="h-[41px] w-full rounded-[5px_20px_5px_5px] border border-plaza-dark/10 bg-transparent pl-10 pr-3 font-heading placeholder:text-plaza-dark/70"
				/>
			</div>

			<!-- Přepínač pater -->
			<div v-if="floors.length > 1" class="flex justify-center items-between w-full flex-wrap gap-3">
				<button
					v-for="floor in floors"
					:key="floor.floorId"
					type="button"
					:class="[
						'px-5 py-2.5 rounded-[5px_20px_5px_5px] transition-colors text-sm',
						state.currentFloorId === floor.floorId
							? 'bg-primary-600 bg-plaza !text-white'
							: 'bg-white text-red hover:bg-gray-100 shadow',
					]"
					@click="selectFloor(floor.floorId)"
				>
					{{ floor.floorName }}
				</button>
			</div>

			<!-- Ovládání zoomu -->
			<div class="flex justify-center gap-2 mb-4 container px-4 lg:hidden">
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
		</div>

		<div class="z-0 relative w-full">
			<h2
				class="absolute -left-[9990px] -top-[9990px] opacity-0 visibility-hidden"
			>
				{{ t('mapPage.title') }}
			</h2>
			<!-- Loading state -->
			<div v-if="pending" class="flex items-center justify-center h-64">
				<div
					class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"
				></div>
			</div>

			<!-- Error state -->
			<div v-else-if="error" class="text-center py-8">
				<p class="text-red-500 mb-4">{{ t('common.error') }}</p>
				<button
					type="button"
					class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
					@click="refresh()"
				>
					{{ t('common.retry') }}
				</button>
			</div>

			<template v-else>
				<ClientOnly>
					<!-- Interaktivní mapa -->
					<div ref="mapScrollRef" class="overflow-auto h-full min-h-[600px] max-h-[90vh] max-w-full">
						<div ref="mapLayersRef" class="relative map-layers transition-[width] duration-500 ease-out" :style="{ width: `${zoomLevel * 100}%` }">
							<!-- Spodní vrstva: SVG okolí -->
							<div class="absolute inset-0 z-0">
								<MapStaticAround
									v-if="staticAroundMap"
									:svg-path="staticAroundMap"
									class="w-full h-full"
									@animation-complete="showFloor = true"
								/>
							</div>

							<!-- Horní vrstva: SVG patra -->
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
					<div class="mt-4 flex justify-center gap-6 text-sm text-gray-600">
						<div class="flex items-center gap-2">
							<div class="w-4 h-4 rounded bg-primary-500"></div>
							<span>{{ t('mapPage.occupiedUnit') }}</span>
						</div>
						<div class="flex items-center gap-2">
							<div class="w-4 h-4 rounded bg-gray-300 opacity-40"></div>
							<span>{{ t('mapPage.emptyUnit') }}</span>
						</div>
					</div>

					<!-- Odkaz na celou mapu -->
					<div class="mt-6 text-center">
						<NuxtLink
							to="/mapa"
							class="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
						>
							{{ t('mapPage.viewFullMap') }}
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 5l7 7-7 7"
								/>
							</svg>
						</NuxtLink>
					</div>

					<!-- Popup s detailem obchodu -->
					<MapUnitPopup
						:unit="state.selectedUnit"
						:position="state.popupPosition"
						@close="closePopup"
					/>

					<template #fallback>
						<div class="flex items-center justify-center h-64">
							<div
								class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"
							></div>
						</div>
					</template>
				</ClientOnly>
			</template>
		</div>

	</section>
</template>

<script setup lang="ts">
const { t } = useI18n()

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
} = useInteractiveMap()

// Úvodní animace
const showFloor = ref(false)
const floorVisible = computed(() => !staticAroundMap.value || showFloor.value)
const search = ref('')

// Zoom
const { zoomLevel, zoomLevels, mapScrollRef, mapLayersRef, setZoom } = useMapZoom()
</script>
