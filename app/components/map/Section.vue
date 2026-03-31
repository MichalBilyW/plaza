<template>
	<section class="relative container py-8">
		<!-- Gradient overlay (skrytý když je zamčené patro) -->
		<div
			v-if="!props.lockedFloorId"
			class="z-10 absolute left-0 top-[80px] w-full h-[240px] bg-gradient-to-b from-white to-transparent"
		></div>

		<!-- Map Tools (skryté když je zamčené patro) -->
		<div
			v-if="!props.lockedFloorId"
			class="z-20 relative absolute left-0 top-0 md:top-32 lg:top-20 container flex flex-col md:flex-row gap-4 md:gap-6 justify-start items-start md:justify-between px-4"
		>
			<!-- Search input -->
			<div class="relative w-full max-w-[400px]">
				<label for="shop-search" class="sr-only">{{ t('common.searchShop') }}</label>
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
					class="h-[41px] w-full rounded-[5px_20px_5px_5px] bg-white border border-plaza-dark/10 bg-transparent pl-10 pr-3 font-heading placeholder:text-plaza-dark/70"
					@focus="showSuggestions = true"
					@blur="hideSuggestionsDelayed"
				/>

				<!-- Našeptávač - výsledky z ostatních pater -->
				<Transition
					enter-active-class="transition-all duration-300 ease-out"
					enter-from-class="opacity-0 -translate-y-2"
					enter-to-class="opacity-100 translate-y-0"
					leave-active-class="transition-all duration-150 ease-in"
					leave-from-class="opacity-100 translate-y-0"
					leave-to-class="opacity-0 -translate-y-2"
				>
					<div
						v-if="showSuggestions && search.trim() && otherFloorsResults.length > 0"
						class="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[300px] overflow-y-auto z-50"
					>
						<div
							v-for="floorGroup in otherFloorsResults"
							:key="floorGroup.floorId"
							class="border-b border-gray-100 last:border-b-0"
						>
							<!-- Název patra -->
							<div class="px-3 py-2 bg-gray-50 text-xs text-gray-500 tracking-wide">
								{{ t('mapPage.findInFloor') }}
								<span class="font-bold text-plaza uppercase">{{
									floorGroup.floorName
								}}</span>
							</div>
							<!-- Obchody v patře -->
							<button
								v-for="shop in floorGroup.shops"
								:key="shop.unitCode"
								type="button"
								class="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-plaza-light/30 transition-colors text-left"
								@mousedown.prevent="selectSuggestion(floorGroup.floorId)"
							>
								<img
									v-if="shop.logo"
									:src="shop.logo"
									:alt="shop.name"
									class="w-8 h-8 object-contain rounded"
								/>
								<div
									v-else
									class="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-xs font-bold text-gray-500"
								>
									{{ shop.name.charAt(0) }}
								</div>
								<span class="text-sm text-gray-800">{{ shop.name }}</span>
							</button>
						</div>
					</div>
				</Transition>
			</div>

			<!-- Přepínač pater -->
			<ClientOnly>
				<div
					v-if="floors.length > 1"
					class="w-full overflow-x-auto md:overflow-visible scrollbar-none"
				>
					<div
						class="flex justify-start md:justify-end items-center flex-wrap gap-2 md:gap-3"
					>
						<button
							v-for="floor in floors"
							:key="floor.floorId"
							type="button"
							:class="[
								'px-4 md:px-5 py-2 md:py-2.5 rounded-[5px_20px_5px_5px] text-sm whitespace-nowrap transition-all duration-300 ease-out',
								state.currentFloorId === floor.floorId
									? 'bg-primary-600 bg-plaza !text-white md:scale-105 shadow-lg'
									: 'bg-white text-red hover:bg-gray-100 shadow hover:scale-102',
							]"
							@click="handleFloorChange(floor.floorId)"
						>
							{{ floor.floorName }}
						</button>
					</div>
				</div>
			</ClientOnly>
		</div>

		<div class="relative w-full min-h-[500px]">
			<h2 class="absolute -left-[9990px] -top-[9990px] opacity-0 visibility-hidden">
				{{ t('mapPage.title') }}
			</h2>

			<ClientOnly>
				<!-- Loading state - zobrazit dokud se načítají data nebo SVG -->
				<div
					v-if="pending || isLoading"
					class="flex items-center justify-center min-h-[500px]"
				>
					<div class="flex flex-col items-center gap-4">
						<div class="map-spinner"></div>
						<p class="text-gray-500 text-sm">{{ t('common.loading') }}</p>
					</div>
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
					<!-- Interaktivní mapa -->
					<div
						ref="mapContainerRef"
						class="map-container relative overflow-hidden max-w-full min-h-[500px]"
						:class="isZoomed && !isTouch ? 'cursor-grab active:cursor-grabbing' : ''"
					>
						<!-- Zoom ovládání - top-right -->
						<div
							class="z-30 absolute bottom-8 md:bottom-16 lg:bottom-32 left-6 z-30 flex gap-1"
						>
							<button
								v-for="level in zoomLevels"
								:key="level.value"
								type="button"
								:class="[
									'w-9 h-9 flex items-center justify-center rounded-[5px_10px_5px_5px] transition-colors text-xs font-medium',
									zoomLevel === level.value
										? 'bg-gray-800 text-white shadow-lg'
										: 'bg-white text-gray-700 hover:bg-gray-100 shadow',
								]"
								@click="setZoom(level.value)"
							>
								{{ level.label }}
							</button>
						</div>

						<div ref="mapContentRef" class="relative map-layers">
							<!-- Spodní vrstva: SVG okolí -->
							<div class="absolute inset-0 z-0">
								<MapStaticAround
									v-if="staticAroundMap"
									ref="staticAroundRef"
									:svg-path="staticAroundMap"
									:svg-content="staticAroundMapContent"
									class="w-full h-full"
									@loaded="handleStaticAroundLoaded"
									@animation-complete="handleAnimationComplete"
								/>
							</div>

							<!-- Horní vrstva: SVG patra -->
							<Transition
								enter-active-class="transition-opacity duration-500 ease-out"
								enter-from-class="opacity-0"
								enter-to-class="opacity-100"
								leave-active-class="transition-opacity duration-300 ease-in"
								leave-from-class="opacity-100"
								leave-to-class="opacity-0"
								mode="out-in"
							>
								<MapFloor
									v-if="currentFloor?.svgMap && mapReady"
									:key="currentFloor.floorId"
									:svg-path="currentFloor.svgMap"
									:svg-content="currentFloor.svgContent"
									:units="currentFloor.units"
									:selected-unit="state.selectedUnit"
									:search-query="search"
									class="relative z-10"
									@unit-click="handleUnitClick"
								/>
							</Transition>

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

					<!-- Odkaz na celou mapu (skrytý na stránce /mapa) -->
					<div v-if="!hideFullMapLink" class="mt-6 text-center">
						<NuxtLink
							to="/mapa"
							class="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
						>
							{{ t('mapPage.viewFullMap') }}
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
				</template>

				<template #fallback>
					<div class="flex items-center justify-center min-h-[600px]">
						<div class="flex flex-col items-center gap-4">
							<div class="map-spinner"></div>
							<p class="text-gray-500 text-sm">{{ t('common.loading') }}</p>
						</div>
					</div>
				</template>
			</ClientOnly>
		</div>
	</section>
</template>

<script setup lang="ts">
import type MapStaticAround from './MapStaticAround.vue'

interface Props {
	/** Skrýt odkaz na celou mapu (pro použití na stránce /mapa) */
	hideFullMapLink?: boolean
	/** Zamknout na konkrétní patro (skryje přepínač pater a vyhledávání) */
	lockedFloorId?: string
	/** Zvýraznit obchod podle názvu (jako při vyhledávání) */
	highlightShopName?: string
}

const props = withDefaults(defineProps<Props>(), {
	hideFullMapLink: false,
})

const { t } = useI18n()

const {
	floors,
	currentFloor,
	staticAroundMap,
	staticAroundMapContent,
	state,
	pending,
	error,
	selectFloor,
	handleUnitClick,
	closePopup,
	refresh,
	onFloorChange,
} = useInteractiveMap({ initialFloorId: props.lockedFloorId })

// Reference na MapStaticAround pro volání animace
const staticAroundRef = ref<InstanceType<typeof MapStaticAround> | null>(null)

// Stav načítání
const isLoading = ref(true)
const mapReady = ref(false)
const search = ref(props.highlightShopName ?? '')
const showSuggestions = ref(false)

// Vyhledávání ve všech patrech - seskupené podle patra (kromě aktuálního)
interface FloorSearchGroup {
	floorId: string
	floorName: string
	shops: Array<{ unitCode: string; name: string; logo?: string }>
}

const otherFloorsResults = computed<FloorSearchGroup[]>(() => {
	const query = search.value.trim().toLowerCase()
	if (!query) return []

	// Escape regex speciálních znaků (stejně jako na /obchody)
	const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
	const regex = new RegExp(escaped, 'i')

	const results: FloorSearchGroup[] = []

	for (const floor of floors.value) {
		// Přeskočit aktuální patro (to se zvýrazňuje přímo v mapě)
		if (floor.floorId === state.currentFloorId) continue

		const matchedShops: FloorSearchGroup['shops'] = []

		for (const unit of floor.units) {
			if (unit.shop?.name && regex.test(unit.shop.name)) {
				matchedShops.push({
					unitCode: unit.unitCode,
					name: unit.shop.name,
					logo: unit.shop.logo,
				})
			}
		}

		if (matchedShops.length > 0) {
			results.push({
				floorId: floor.floorId,
				floorName: floor.floorName,
				shops: matchedShops,
			})
		}
	}

	return results
})

// Skrýt našeptávač s malým zpožděním (aby stihl proběhnout click)
function hideSuggestionsDelayed() {
	setTimeout(() => {
		showSuggestions.value = false
	}, 150)
}

// Vybrat položku z našeptávače - přepnout patro, zachovat search
function selectSuggestion(floorId: string) {
	showSuggestions.value = false
	selectFloor(floorId)
	// search zůstává - obchod se zvýrazní v novém patře
}

// Zoom
const {
	zoomLevel,
	zoomLevels,
	mapContainerRef,
	mapContentRef,
	setZoom,
	resetAndCenter,
	isZoomed,
	isTouch,
} = useMapZoom()

// Resetovat stav při mount (důležité pro navigaci)
onMounted(() => {
	isLoading.value = true
	mapReady.value = false
})

// Timeout jako fallback - pokud se mapa nenačte do 5 sekund, zobrazit ji
let loadingTimeout: ReturnType<typeof setTimeout> | null = null

watch(
	isLoading,
	(loading) => {
		if (loading) {
			// Nastavit timeout fallback
			loadingTimeout = setTimeout(() => {
				if (isLoading.value) {
					console.warn('Map loading timeout - forcing display')
					isLoading.value = false
					mapReady.value = true
				}
			}, 5000)
		} else {
			// Zrušit timeout když se načte
			if (loadingTimeout) {
				clearTimeout(loadingTimeout)
				loadingTimeout = null
			}
		}
	},
	{ immediate: true },
)

onUnmounted(() => {
	if (loadingTimeout) {
		clearTimeout(loadingTimeout)
	}
})

// Centrovat mapu při změně patra
onFloorChange(() => {
	resetAndCenter()
})

// Handler pro změnu patra s plynulou animací
function handleFloorChange(floorId: string) {
	if (state.currentFloorId === floorId) return
	selectFloor(floorId)
}

// Handler pro načtení SVG okolí
function handleStaticAroundLoaded() {
	isLoading.value = false
	// Spustit animaci okamžitě
	nextTick(() => {
		staticAroundRef.value?.startAnimation()
	})
}

// Handler pro dokončení animace SVG okolí
function handleAnimationComplete() {
	mapReady.value = true
	resetAndCenter()
}

// Sledovat stav načítání - pokud není staticAroundMap nebo data jsou načtená bez SVG
watch(
	[staticAroundMap, pending],
	([svgMap, isPending]) => {
		// Pokud není SVG okolí a data jsou načtená, zobrazit mapu rovnou
		if (svgMap === null && !isPending) {
			isLoading.value = false
			mapReady.value = true
		}
	},
	{ immediate: true },
)

// Sledovat currentFloor - když je patro načtené, zajistit že mapa je připravená
watch(currentFloor, (floor) => {
	if (floor?.svgMap && !staticAroundMap.value) {
		// Mapa patra je načtená a není SVG okolí - zobrazit
		isLoading.value = false
		mapReady.value = true
	}
})
</script>

<style scoped>
/* Loading spinner */
.map-spinner {
	width: 48px;
	height: 48px;
	border: 4px solid #e5e7eb;
	border-top-color: #e20b1b;
	border-radius: 50%;
	animation: spin 1s linear infinite;
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

/* Cursor pointer na desktopu (hover-enabled zařízení) */
@media (hover: hover) {
	.map-container {
		cursor: pointer;
	}
}

/* Skrytí scrollbaru v přepínači pater */
.scrollbar-none {
	-ms-overflow-style: none;
	scrollbar-width: none;
}
.scrollbar-none::-webkit-scrollbar {
	display: none;
}

/* GPU akcelerace pro plynulé animace */
.map-layers {
	will-change: transform;
	transform: translateZ(0);
}
</style>
