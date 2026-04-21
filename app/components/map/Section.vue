<template>
	<section class="relative container py-8">
		<!-- Gradient overlay (skrytý když je zamčené patro) -->
		<div
			v-if="!props.lockedFloorId"
			class="z-10 absolute left-0 top-[60px] md:top-[80px] w-full h-[80px] md:h-[240px] bg-gradient-to-b from-white to-transparent"
		></div>

		<!-- Map Tools (skryté když je zamčené patro) -->
		<div
			v-if="!props.lockedFloorId"
			class="z-20 relative absolute left-0 top-0 md:top-32 lg:top-20 container flex flex-col md:flex-row gap-4 md:gap-6 justify-start items-start md:justify-between p-4"
		>
			<!-- Search input -->
			<div class="relative w-full max-w-[400px]">
				<label for="shop-search" class="sr-only">{{ t('common.searchShop') }}</label>
				<svg
					class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 z-10"
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="#131313"
					stroke-width="2"
					aria-hidden="true"
				>
					<circle cx="11" cy="11" r="8" />
					<path d="M21 21l-4.35-4.35" stroke-linecap="round" />
				</svg>
				<input
					id="shop-search"
					ref="searchInputRef"
					v-model="search"
					type="search"
					autocomplete="off"
					:placeholder="t('shops.shopName')"
					class="h-[41px] w-full rounded-[5px_20px_5px_5px] bg-white border border-plaza-dark/10 pl-10 pr-3 font-heading placeholder:text-plaza-dark/70"
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
								@pointerdown.prevent="selectSuggestion(floorGroup.floorId, shop.name)"
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

		<div class="map-section-frame relative w-full mb-8 md:mb-16">
			<h2 class="absolute -left-[9990px] -top-[9990px] opacity-0 visibility-hidden">
				{{ t('mapPage.title') }}
			</h2>

			<ClientOnly>
				<!-- Error state -->
				<div v-if="error && !pending" class="text-center py-8">
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
					<!-- Loading overlay — nad mapou, mizí po načtení -->
					<Transition
						leave-active-class="transition-opacity duration-500 ease-out"
						leave-to-class="opacity-0"
					>
						<div
							v-if="pending || isLoading"
							class="map-loading-overlay absolute inset-0 z-40 flex items-center justify-center bg-white"
						>
							<div class="flex flex-col items-center gap-4">
								<div class="map-spinner"></div>
								<p class="text-gray-500 text-sm">{{ t('common.loading') }}</p>
							</div>
						</div>
					</Transition>

					<!-- Interaktivní mapa — renderuje se vždy (i pod spinnerem) -->
					<div
						ref="mapContainerRef"
						class="map-container relative overflow-hidden max-w-full"
						:class="isZoomed && !isTouch ? 'cursor-grab active:cursor-grabbing' : ''"
					>
						<!-- Zoom ovládání -->
						<div
							class="z-30 absolute bottom-8 md:bottom-16 lg:bottom-32 left-6 z-30 flex flex-col gap-1"
						>
							<button
								type="button"
								:disabled="!canZoomIn"
								:class="[
									'w-9 h-9 flex items-center justify-center rounded-[5px_10px_5px_5px] transition-colors text-lg font-bold',
									canZoomIn
										? 'bg-white text-gray-700 hover:bg-gray-100 shadow'
										: 'bg-gray-100 text-gray-300 shadow cursor-not-allowed',
								]"
								@click="zoomIn()"
							>
								+
							</button>
							<button
								type="button"
								:disabled="!canZoomOut"
								:class="[
									'w-9 h-9 flex items-center justify-center rounded-[5px_10px_5px_5px] transition-colors text-lg font-bold',
									canZoomOut
										? 'bg-white text-gray-700 hover:bg-gray-100 shadow'
										: 'bg-gray-100 text-gray-300 shadow cursor-not-allowed',
								]"
								@click="zoomOut()"
							>
								−
							</button>
						</div>

						<div
							ref="mapContentRef"
							class="relative map-layers"
							:class="{
								'map-layers--android-chrome': isAndroidChrome,
								'map-layers--lite': isAndroidChrome && isMapInteracting,
							}"
						>
							<!-- Spodní vrstva: SVG okolí -->
							<div class="map-static-layer absolute inset-0 z-0">
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
									:hovered-unit-code="state.hoveredUnitCode"
									:search-query="debouncedSearch"
									class="relative z-10"
									@unit-click="handleUnitClick"
									@unit-hover="handleUnitHover"
									@unit-hover-leave="handleUnitHoverLeave"
									@unit-tap="handleUnitTap"
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
					<!-- <div
						class="mt-4 flex flex-wrap justify-center gap-4 md:gap-6 text-sm text-gray-600"
					>
						<div class="flex items-center gap-2">
							<div
								class="w-5 h-5 rounded bg-[#f4f4f4] border border-gray-300 flex items-center justify-center"
							>
								<div
									class="w-3 h-3 rounded-sm bg-gray-400 flex items-center justify-center text-[6px] font-bold text-white"
								>
									L
								</div>
							</div>
							<span>{{ t('mapPage.unitWithLogo') }}</span>
						</div>
						<div class="flex items-center gap-2">
							<div
								class="w-5 h-5 rounded bg-[#f4f4f4] border border-gray-300 flex items-center justify-center"
							>
								<div class="w-2 h-2 rounded-full bg-primary-600"></div>
							</div>
							<span>{{ t('mapPage.unitWithDot') }}</span>
						</div>
						<div class="flex items-center gap-2">
							<div
								class="w-5 h-5 rounded bg-[#fafafa] border border-gray-200"
							></div>
							<span>{{ t('mapPage.emptyUnit') }}</span>
						</div>
						<div class="flex items-center gap-2">
							<div
								class="w-5 h-5 rounded bg-[#f4f4f4] border-2 border-plaza"
							></div>
							<span>{{ t('mapPage.highlightedUnit') }}</span>
						</div>
					</div> -->

					<!-- Popup s detailem obchodu -->
					<MapUnitPopup
						:unit="state.hoveredUnit"
						:position="state.popupPosition"
						@close="hideUnitPopup"
						@cancel-hide="cancelPopupHide"
					/>
				</template>

				<template #fallback>
					<div class="map-fallback flex items-center justify-center">
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
const { trackMapSearch } = useDataLayer()

const {
	floors,
	currentFloor,
	staticAroundMap,
	staticAroundMapContent,
	state,
	pending,
	error,
	selectFloor,
	showUnitPopup,
	hideUnitPopup,
	cancelHide,
	handleUnitClick,
	handleUnitTap,
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
const searchInputRef = ref<HTMLInputElement | null>(null)

// Debounced search pro MapFloor — nespouští SVG class update na každý keystroke
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null
const debouncedSearch = ref(search.value)
watch(search, (val) => {
	if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
	searchDebounceTimer = setTimeout(() => {
		debouncedSearch.value = val
	}, 200)
	// Automaticky zobrazit našeptávač při psaní
	if (val.trim()) {
		showSuggestions.value = true
	}
})

// Vyhledávání ve všech patrech - seskupené podle patra (kromě aktuálního)
interface FloorSearchGroup {
	floorId: string
	floorName: string
	shops: Array<{ unitCode: string; name: string; logo?: string }>
}

const otherFloorsResults = computed<FloorSearchGroup[]>(() => {
	const query = search.value.trim().toLowerCase()
	// Explicitně přistupovat k currentFloorId pro reaktivitu
	const currentFloorId = state.currentFloorId
	const allFloors = floors.value

	if (!query) return []

	// Escape regex speciálních znaků (stejně jako na /obchody)
	const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
	const regex = new RegExp(escaped, 'i')

	const results: FloorSearchGroup[] = []

	for (const floor of allFloors) {
		// Přeskočit aktuální patro (to se zvýrazňuje přímo v mapě)
		if (floor.floorId === currentFloorId) continue

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

function blurSearchInput() {
	if (!import.meta.client) return
	searchInputRef.value?.blur()
	const activeElement = document.activeElement
	if (activeElement instanceof HTMLElement) {
		activeElement.blur()
	}
}

function runOnNextFrame(callback: () => void) {
	if (!import.meta.client || typeof window.requestAnimationFrame !== 'function') return
	window.requestAnimationFrame(callback)
}

// Vybrat položku z našeptávače - přepnout patro, zachovat search
function selectSuggestion(floorId: string, shopName?: string) {
	showSuggestions.value = false
	blurSearchInput()
	selectFloor(floorId)
	// Track map search with selected unit
	trackMapSearch(search.value, shopName)
	// search zůstává - obchod se zvýrazní v novém patře
	runOnNextFrame(blurSearchInput)
}

// Zoom
const {
	currentScale,
	panInteractionKey,
	isAndroidChrome,
	isMapInteracting,
	canZoomIn,
	canZoomOut,
	mapContainerRef,
	mapContentRef,
	zoomIn,
	zoomOut,
	resetAndCenter,
	isZoomed,
	isTouch,
} = useMapZoom()

// Resetovat stav při mount (důležité pro navigaci)
onMounted(() => {
	isLoading.value = true
	mapReady.value = false

	// Touch: zavřít popup při dotyku mimo unit nebo při panování
	const container = mapContainerRef.value
	if (container) {
		container.addEventListener('touchstart', handleTouchStart, { passive: true })
		container.addEventListener('touchmove', handleTouchMove, { passive: false })
	}
})

// Touch: tap mimo unit → zavřít popup
function handleTouchStart(e: TouchEvent) {
	const target = e.target as Element
	// Pokud tap je na unit elementu (nebo jeho potomku), nezavírat
	if (target.closest?.('[data-unit][data-has-shop="true"]')) return
	// Pokud tap je na popup nebo jeho potomku, nezavírat
	if (target.closest?.('.popup-card')) return
	closePopup()
}

// Touch: jakýkoli pan/scroll → zavřít popup; nad mapou nesmí prohlížeč scrollovat/zoomovat stránku
function handleTouchMove(e: TouchEvent) {
	e.preventDefault()
	if (state.hoveredUnit) closePopup()
}

// Zoom změna → zavřít popup (pinch zoom, tlačítka, wheel)
watch(currentScale, () => {
	if (state.hoveredUnit) closePopup()
})

// Pan změna → zavřít popup při přesunu zazoomované mapy
watch(panInteractionKey, () => {
	if (state.hoveredUnit) closePopup()
})

// Timeout jako fallback - pokud se mapa nenačte do 3 sekund, zobrazit ji
let loadingTimeout: ReturnType<typeof setTimeout> | null = null

watch(
	isLoading,
	(loading) => {
		if (loading) {
			// Nastavit timeout fallback
			loadingTimeout = setTimeout(() => {
				if (isLoading.value) {
					isLoading.value = false
					mapReady.value = true
				}
			}, 3000)
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
	const container = mapContainerRef.value
	if (container) {
		container.removeEventListener('touchstart', handleTouchStart)
		container.removeEventListener('touchmove', handleTouchMove)
	}
})

function centerMapSoon() {
	if (!import.meta.client) return
	nextTick(() => {
		runOnNextFrame(() => {
			resetAndCenter()
		})
	})
}

// Centrovat mapu při změně patra
onFloorChange(() => {
	centerMapSoon()
})

// Handler pro změnu patra s plynulou animací
function handleFloorChange(floorId: string) {
	if (state.currentFloorId === floorId) return
	selectFloor(floorId)
}

// Hover handlers pro Section → composable bridge
function handleUnitHover(unitCode: string, position: { x: number; y: number }) {
	showUnitPopup(unitCode, position)
}

function handleUnitHoverLeave() {
	hideUnitPopup()
}

function cancelPopupHide() {
	cancelHide()
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
	centerMapSoon()
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
		centerMapSoon()
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

.map-section-frame,
.map-container,
.map-loading-overlay,
.map-fallback {
	min-height: 600px;
}

/* Mobilní mapa má vlastní viewport, aby pevný min-height nevyráběl prázdné místo. */
@media (max-width: 767px) {
	.map-section-frame,
	.map-container,
	.map-loading-overlay,
	.map-fallback {
		height: min(72svh, 720px);
		min-height: 420px;
	}
}

.map-container,
.map-layers {
	-webkit-touch-callout: none;
	-webkit-user-select: none;
	user-select: none;
}

/* Skrytí scrollbaru v přepínači pater */
.scrollbar-none {
	-ms-overflow-style: none;
	scrollbar-width: none;
}
.scrollbar-none::-webkit-scrollbar {
	display: none;
}

.map-layers {
	touch-action: none;
}

.map-layers--android-chrome {
	contain: paint;
}

.map-layers--android-chrome.map-layers--lite {
	will-change: transform;
}

/* Android Chrome: prvky které se skrývají při interakci dostávají plynulý přechod (fade-in po gestu) */
.map-layers--android-chrome .map-static-layer,
.map-layers--android-chrome :deep(svg text),
.map-layers--android-chrome :deep(svg image),
.map-layers--android-chrome :deep(.map-unit--empty),
.map-layers--android-chrome :deep(#parking),
.map-layers--android-chrome :deep(#security),
.map-layers--android-chrome :deep(#security-2),
.map-layers--android-chrome :deep(#wc) {
	transition: opacity 0.3s ease-in;
}

/* Při aktivním pan/zoom gestu: rychlé skrytí (loga + SVG pozadí zůstávají viditelná) */
.map-layers--android-chrome.map-layers--lite :deep(svg text),
.map-layers--android-chrome.map-layers--lite :deep(svg image),
.map-layers--android-chrome.map-layers--lite :deep(.map-unit--empty),
.map-layers--android-chrome.map-layers--lite :deep(#parking),
.map-layers--android-chrome.map-layers--lite :deep(#security),
.map-layers--android-chrome.map-layers--lite :deep(#security-2),
.map-layers--android-chrome.map-layers--lite :deep(#wc) {
	opacity: 0 !important;
	transition: opacity 0.12s ease-out !important;
	pointer-events: none;
}
</style>
