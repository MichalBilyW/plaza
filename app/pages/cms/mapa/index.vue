<template>
	<div class="p-4 sm:p-6 lg:p-8">
		<div class="mb-6 sm:mb-8">
			<h1 class="text-xl sm:text-2xl font-bold text-gray-900">{{ t('cms.map.title') }}</h1>
			<p class="text-plaza-dark mt-1 text-sm sm:text-base">{{ t('cms.map.subtitle') }}</p>
		</div>

		<!-- Statistiky -->
		<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
			<div class="bg-white rounded-xl shadow-sm p-4">
				<div class="text-2xl font-bold text-indigo-600">{{ stats.totalUnits }}</div>
				<div class="text-sm text-plaza-dark">{{ t('cms.map.totalUnits') }}</div>
			</div>
			<div class="bg-white rounded-xl shadow-sm p-4">
				<div class="text-2xl font-bold text-green-600">{{ stats.occupiedUnits }}</div>
				<div class="text-sm text-plaza-dark">{{ t('cms.map.occupiedUnits') }}</div>
			</div>
			<div class="bg-white rounded-xl shadow-sm p-4">
				<div class="text-2xl font-bold text-orange-600">{{ stats.emptyUnits }}</div>
				<div class="text-sm text-plaza-dark">{{ t('cms.map.emptyUnits') }}</div>
			</div>
			<div class="bg-white rounded-xl shadow-sm p-4">
				<div class="text-2xl font-bold text-gray-600">{{ stats.occupancyRate }}%</div>
				<div class="text-sm text-plaza-dark">{{ t('cms.map.occupancyRate') }}</div>
			</div>
		</div>

		<!-- Výběr patra -->
		<div class="bg-white rounded-xl shadow-sm p-4 mb-6">
			<div class="flex flex-wrap gap-2">
				<button
					v-for="floor in floors"
					:key="floor.floorId"
					@click="selectedFloorId = floor.floorId"
					:class="[
						'px-4 py-2 rounded-lg font-medium transition-colors',
						selectedFloorId === floor.floorId
							? 'bg-indigo-600 text-white'
							: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
					]"
				>
					{{ floor.floorName }}
				</button>
			</div>
		</div>

		<!-- Info o SVG mapě -->
		<div
			v-if="currentFloor && !currentFloor.svgMap"
			class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6"
		>
			<div class="flex items-start gap-3">
				<svg
					class="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
					/>
				</svg>
				<div>
					<p class="text-sm text-amber-800 font-medium">{{ t('cms.map.noSvgMap') }}</p>
					<p class="text-sm text-amber-700 mt-1">
						{{ t('cms.map.noSvgMapHint') }}
					</p>
					<NuxtLink
						v-if="currentFloor"
						:to="`/cms/patra/${currentFloor.floorId}`"
						class="inline-flex items-center gap-1 mt-2 text-sm text-amber-800 hover:text-amber-900 font-medium"
					>
						{{ t('cms.map.editFloor') }}
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
			</div>
		</div>

		<!-- Interaktivní SVG mapa -->
		<ClientOnly>
			<div v-if="currentFloor?.svgMap" class="bg-white rounded-xl shadow-sm p-4 mb-6">
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-lg font-semibold text-gray-900">
						{{ t('cms.map.interactiveMap') }}
					</h2>
					<div class="flex items-center gap-4 text-sm">
						<span class="flex items-center gap-2">
							<span class="w-4 h-4 rounded bg-indigo-500"></span>
							{{ t('cms.map.occupied') }}
						</span>
						<span class="flex items-center gap-2">
							<span class="w-4 h-4 rounded bg-gray-300"></span>
							{{ t('cms.map.emptyUnit') }}
						</span>
					</div>
				</div>
				<div
					ref="svgContainerRef"
					class="svg-container relative w-full border rounded-lg overflow-hidden bg-gray-50"
					@mouseleave="hoveredUnitCode = null"
				>
					<div
						v-if="svgContent"
						ref="svgWrapperRef"
						class="svg-wrapper w-full"
						v-html="processedSvg"
					></div>
					<div v-else-if="svgPending" class="flex items-center justify-center h-64">
						<div
							class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"
						></div>
					</div>
					<div
						v-else-if="svgError"
						class="flex items-center justify-center h-64 text-red-500"
					>
						{{ t('cms.map.svgLoadError') }}
					</div>

					<!-- Hover tooltip -->
					<Transition name="fade">
						<div
							v-if="hoveredUnit && tooltipPosition"
							class="absolute z-10 pointer-events-none bg-white rounded-lg shadow-lg p-2 text-sm"
							:style="{
								left: `${tooltipPosition.x}px`,
								top: `${tooltipPosition.y}px`,
								transform: 'translate(-50%, -100%) translateY(-8px)',
							}"
						>
							<div v-if="hoveredUnit.shop" class="text-center">
								<img
									v-if="hoveredUnit.shop.logo"
									:src="hoveredUnit.shop.logo"
									:alt="hoveredUnit.shop.name"
									class="w-12 h-12 object-contain mx-auto mb-1"
								/>
								<p class="font-medium">{{ hoveredUnit.shop.name }}</p>
							</div>
							<div v-else class="text-gray-500">
								<span class="font-mono">{{ hoveredUnit.unitCode }}</span>
								<span class="ml-1">({{ t('cms.map.emptyUnit') }})</span>
							</div>
						</div>
					</Transition>
				</div>
				<p class="text-sm text-plaza-dark mt-2">{{ t('cms.map.clickToEdit') }}</p>
			</div>
		</ClientOnly>

		<!-- Tabulka jednotek -->
		<div class="bg-white rounded-xl shadow-sm overflow-hidden">
			<div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
				<h2 class="text-lg font-semibold text-gray-900">
					{{ t('cms.map.unitsTable') }}
				</h2>
				<span class="text-sm text-plaza-dark">
					{{ currentFloorUnits.length }} {{ t('cms.map.units') }}
				</span>
			</div>

			<!-- Loading -->
			<div v-if="pending" class="flex justify-center py-12">
				<span class="text-plaza-dark">{{ t('common.loading') }}</span>
			</div>

			<!-- Error -->
			<div v-else-if="error" class="text-center py-12 text-red-500">
				{{ t('common.error') }}: {{ error.message }}
			</div>

			<!-- Žádné jednotky -->
			<div v-else-if="currentFloorUnits.length === 0" class="text-center py-12">
				<p class="text-plaza-dark">{{ t('cms.map.noUnits') }}</p>
				<p class="text-sm text-gray-400 mt-2">{{ t('cms.map.noUnitsHint') }}</p>
			</div>

			<!-- Tabulka -->
			<div v-else class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-gray-50">
						<tr>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								{{ t('cms.map.unitCode') }}
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								{{ t('cms.map.shop') }}
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								{{ t('cms.map.status') }}
							</th>
							<th
								class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								{{ t('common.actions') }}
							</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200">
						<tr
							v-for="unit in currentFloorUnits"
							:key="unit.unitCode"
							:class="[
								'hover:bg-gray-50 transition-colors cursor-pointer',
								unit.shop ? '' : 'bg-gray-50/50',
							]"
							@click="selectUnit(unit)"
						>
							<td class="px-6 py-4 whitespace-nowrap">
								<span class="font-mono text-sm font-medium text-gray-900">
									{{ unit.unitCode }}
								</span>
							</td>
							<td class="px-6 py-4">
								<div v-if="unit.shop" class="flex items-center gap-3">
									<div
										v-if="unit.shop.logo"
										class="w-8 h-8 rounded bg-white border flex-shrink-0 overflow-hidden"
									>
										<img
											:src="unit.shop.logo"
											:alt="unit.shop.name"
											class="w-full h-full object-contain"
										/>
									</div>
									<div
										v-else
										class="w-8 h-8 rounded bg-gray-200 flex-shrink-0 flex items-center justify-center"
									>
										<span class="text-xs font-bold text-gray-500">
											{{ unit.shop.name.charAt(0) }}
										</span>
									</div>
									<span class="text-sm text-gray-900">{{ unit.shop.name }}</span>
								</div>
								<span v-else class="text-sm text-gray-400 italic">
									{{ t('cms.map.empty') }}
								</span>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<span
									v-if="unit.shop"
									:class="[
										'inline-flex px-2 py-1 text-xs font-medium rounded-full',
										unit.shop.isActive
											? 'bg-green-100 text-green-800'
											: 'bg-orange-100 text-orange-800',
									]"
								>
									{{
										unit.shop.isActive
											? t('cms.shops.active')
											: t('cms.shops.inactive')
									}}
								</span>
								<span
									v-else
									class="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600"
								>
									{{ t('cms.map.emptyUnit') }}
								</span>
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-right">
								<span v-if="unit.shop" class="text-sm text-indigo-600">
									{{ t('common.edit') }}
								</span>
								<span v-else class="text-sm text-indigo-600">
									{{ t('cms.map.assign') }}
								</span>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>

		<!-- Modal pro přiřazení/odebrání obchodu -->
		<ClientOnly>
			<Teleport to="body">
				<div
					v-if="selectedUnit"
					class="fixed inset-0 z-50 flex items-center justify-center p-4"
					@click.self="selectedUnit = null"
				>
					<div class="fixed inset-0 bg-black/50" @click="selectedUnit = null"></div>
					<div class="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6 z-10">
						<button
							@click="selectedUnit = null"
							class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
						>
							<svg
								class="w-6 h-6"
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

						<h3 class="text-lg font-semibold mb-4">
							{{ t('cms.map.unitDetail') }}:
							<span class="font-mono">{{ selectedUnit.unitCode }}</span>
						</h3>

						<div class="space-y-4">
							<!-- Aktuální obchod -->
							<div v-if="selectedUnit.shop">
								<label class="block text-sm font-medium text-gray-700 mb-1">
									{{ t('cms.map.currentShop') }}
								</label>
								<div class="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
									<div
										v-if="selectedUnit.shop.logo"
										class="w-10 h-10 rounded-lg bg-white flex items-center justify-center overflow-hidden"
									>
										<img
											:src="selectedUnit.shop.logo"
											:alt="selectedUnit.shop.name"
											class="w-full h-full object-contain"
										/>
									</div>
									<div
										v-else
										class="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center"
									>
										<span class="text-plaza-dark text-lg font-bold">
											{{ selectedUnit.shop.name.charAt(0) }}
										</span>
									</div>
									<div>
										<p class="font-medium text-gray-900">
											{{ selectedUnit.shop.name }}
										</p>
										<span
											:class="
												selectedUnit.shop.isActive
													? 'text-green-600'
													: 'text-orange-600'
											"
											class="text-xs"
										>
											{{
												selectedUnit.shop.isActive
													? t('cms.shops.active')
													: t('cms.shops.inactive')
											}}
										</span>
									</div>
								</div>
								<NuxtLink
									:to="`/cms/obchody/${selectedUnit.shop._id}`"
									class="inline-flex items-center gap-1 mt-2 text-sm text-indigo-600 hover:text-indigo-700"
								>
									{{ t('common.edit') }}
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

							<!-- Přiřazení obchodu -->
							<div v-else>
								<label class="block text-sm font-medium text-gray-700 mb-1">
									{{ t('cms.map.assignShop') }}
								</label>

								<div
									v-if="availableShops.length === 0"
									class="p-4 bg-gray-50 rounded-lg text-center"
								>
									<p class="text-plaza-dark text-sm">
										{{ t('cms.map.noShopsToAssign') }}
									</p>
									<NuxtLink
										to="/cms/obchody/novy"
										class="inline-flex items-center gap-1 mt-2 text-sm text-indigo-600 hover:text-indigo-700"
									>
										{{ t('cms.shops.addShop') }}
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

								<template v-else>
									<select
										v-model="shopToAssign"
										class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
									>
										<option value="">{{ t('cms.map.selectShop') }}</option>
										<option
											v-for="shop in availableShops"
											:key="shop._id"
											:value="shop._id"
										>
											{{ shop.name }}
										</option>
									</select>

									<button
										@click="assignShop"
										:disabled="!shopToAssign || assigning"
										class="mt-3 w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
									>
										{{ assigning ? t('common.loading') : t('cms.map.assign') }}
									</button>
								</template>
							</div>

							<!-- Odebrat obchod -->
							<div v-if="selectedUnit.shop" class="pt-4 border-t">
								<button
									@click="removeShop"
									:disabled="removing"
									class="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
								>
									{{ removing ? t('common.loading') : t('cms.map.removeShop') }}
								</button>
							</div>
						</div>
					</div>
				</div>
			</Teleport>
		</ClientOnly>
	</div>
</template>

<script setup lang="ts">
import type { FloorUnitsResponse, MapUnit } from '~~/shared/map/units'
import { createUnitElementId } from '~~/shared/map/units'
import type { Shop } from '~~/shared/types'

interface MapUnitsResponse {
	floors: FloorUnitsResponse[]
	totalUnits: number
	occupiedUnits: number
}

interface ShopsListResponse {
	data: Shop[]
	pagination?: {
		page: number
		limit: number
		total: number
		totalPages: number
	}
}

definePageMeta({
	layout: 'cms',
	middleware: 'cms',
})

const { t } = useI18n()
const { secureFetch } = useCmsAuth()
const flash = useFlashMessages()

usePlazaSeo({
	title: t('cms.map.title'),
	noIndex: true,
})

// State
const selectedFloorId = ref<string | null>(null)
const selectedUnit = ref<MapUnit | null>(null)
const shopToAssign = ref('')
const assigning = ref(false)
const removing = ref(false)

// SVG state
const svgContainerRef = ref<HTMLElement | null>(null)
const svgWrapperRef = ref<HTMLElement | null>(null)
const svgContent = ref<string | null>(null)
const svgPending = ref(false)
const svgError = ref<Error | null>(null)
const hoveredUnitCode = ref<string | null>(null)
const tooltipPosition = ref<{ x: number; y: number } | null>(null)

// Fetch map units
const {
	data: mapData,
	pending,
	error,
	refresh,
} = await useFetch<MapUnitsResponse>('/api/map/units')

// Shops for assignment - load on client
const allShops = ref<Shop[]>([])
const shopsLoading = ref(false)

async function loadShops() {
	shopsLoading.value = true
	try {
		const response = await $fetch<ShopsListResponse>('/api/shops', {
			query: { limit: 100, page: 1 },
		})
		let shops = response.data ?? []
		// Pokud je více stránek, načíst všechny
		const totalPages = response.pagination?.totalPages ?? 1
		for (let page = 2; page <= totalPages; page++) {
			const next = await $fetch<ShopsListResponse>('/api/shops', {
				query: { limit: 100, page },
			})
			shops = shops.concat(next.data ?? [])
		}
		allShops.value = shops
	} catch (err) {
		console.error('[CMS Map] Failed to load shops:', err)
	} finally {
		shopsLoading.value = false
	}
}

// Load shops on client
if (import.meta.client) {
	loadShops()
}

const floors = computed(() => mapData.value?.floors ?? [])

// Automaticky vybrat první patro
watch(
	floors,
	(newFloors) => {
		if (newFloors.length > 0 && !selectedFloorId.value) {
			const firstFloor = newFloors[0]
			if (firstFloor) {
				selectedFloorId.value = firstFloor.floorId
			}
		}
	},
	{ immediate: true },
)

const currentFloor = computed(() => {
	if (!selectedFloorId.value) return null
	return floors.value.find((f) => f.floorId === selectedFloorId.value) ?? null
})

const currentFloorUnits = computed<MapUnit[]>(() => {
	return currentFloor.value?.units ?? []
})

const stats = computed(() => {
	const total = mapData.value?.totalUnits ?? 0
	const occupied = mapData.value?.occupiedUnits ?? 0
	const empty = total - occupied
	const rate = total > 0 ? Math.round((occupied / total) * 100) : 0

	return {
		totalUnits: total,
		occupiedUnits: occupied,
		emptyUnits: empty,
		occupancyRate: rate,
	}
})

// Obchody bez přiřazené jednotky nebo s jednotkou na jiném patře
const availableShops = computed(() => {
	if (allShops.value.length === 0) {
		return []
	}

	// ID obchodů které už jsou přiřazené k nějaké jednotce
	const assignedShopIds = new Set<string>()
	for (const floor of floors.value) {
		for (const unit of floor.units) {
			if (unit.shop) {
				assignedShopIds.add(unit.shop._id)
			}
		}
	}

	// Vrátíme obchody, které nemají přiřazenou jednotku
	return allShops.value.filter((shop) => !assignedShopIds.has(shop._id as string))
})

// Mapa jednotek pro rychlý přístup
const unitsMap = computed(() => {
	const map = new Map<string, MapUnit>()
	for (const unit of currentFloorUnits.value) {
		map.set(unit.unitCode, unit)
	}
	return map
})

// Hovered unit
const hoveredUnit = computed(() => {
	if (!hoveredUnitCode.value) return null
	return unitsMap.value.get(hoveredUnitCode.value) ?? null
})

// Zpracované SVG s přidanými třídami - v CMS jsou VŠECHNY jednotky klikací
const processedSvg = computed(() => {
	if (!svgContent.value) return ''

	let svg = svgContent.value

	// Odstranit bílé pozadí
	svg = svg.replace(/<rect[^>]*fill=["'](#fff|#ffffff|white|#FFFFFF|#FFF)["'][^>]*\/>/gi, '')
	svg = svg.replace(
		/<rect[^>]*style=["'][^"']*fill:\s*(#fff|#ffffff|white)[^"']*["'][^>]*\/>/gi,
		'',
	)

	// Pro každou jednotku přidat data atributy
	for (const unit of currentFloorUnits.value) {
		const elementId = createUnitElementId(unit.unitCode)
		const hasShop = !!unit.shop
		const isSelected = selectedUnit.value?.unitCode === unit.unitCode

		const regex = new RegExp(`id=["']${elementId}["']`, 'g')

		// V CMS jsou všechny jednotky klikací
		const classes = [
			'cms-unit',
			hasShop ? 'cms-unit--occupied' : 'cms-unit--empty',
			'cursor-pointer',
			'transition-all',
			'duration-300',
			isSelected ? 'cms-unit--selected' : '',
		]
			.filter(Boolean)
			.join(' ')

		svg = svg.replace(
			regex,
			`id="${elementId}" class="${classes}" data-unit="${unit.unitCode}" data-has-shop="${hasShop}"`,
		)
	}

	return svg
})

// Načtení SVG
async function loadSvg() {
	const svgPath = currentFloor.value?.svgMap
	if (!svgPath) {
		svgContent.value = null
		return
	}

	try {
		svgPending.value = true
		svgError.value = null
		const response = await fetch(svgPath)
		if (!response.ok) {
			throw new Error(`Failed to load SVG: ${response.status}`)
		}
		svgContent.value = await response.text()
	} catch (e) {
		svgError.value = e instanceof Error ? e : new Error('Unknown error')
		console.error('Failed to load SVG:', e)
	} finally {
		svgPending.value = false
	}
}

// Nastavení event listenerů po renderování SVG
function setupEventListeners() {
	const wrapper = svgWrapperRef.value
	if (!wrapper) return

	const svg = wrapper.querySelector('svg')
	if (!svg) return

	// Najít všechny jednotky
	const unitElements = svg.querySelectorAll('[data-unit]')

	unitElements.forEach((element) => {
		const unitCode = element.getAttribute('data-unit')
		if (!unitCode) return

		// Hover events
		element.addEventListener('mouseenter', (e) => handleUnitHover(unitCode, e as MouseEvent))
		element.addEventListener('mouseleave', () => handleUnitLeave())

		// Click event - v CMS můžeme kliknout na všechny jednotky
		element.addEventListener('click', () => handleUnitClick(unitCode))
	})
}

function handleUnitHover(unitCode: string, event: MouseEvent) {
	hoveredUnitCode.value = unitCode

	// Vypočítat pozici tooltipu
	const target = event.currentTarget as SVGElement
	const rect = target.getBoundingClientRect()
	const containerRect = svgContainerRef.value?.getBoundingClientRect()

	if (containerRect) {
		tooltipPosition.value = {
			x: rect.left + rect.width / 2 - containerRect.left,
			y: rect.top - containerRect.top,
		}
	}
}

function handleUnitLeave() {
	hoveredUnitCode.value = null
	tooltipPosition.value = null
}

function handleUnitClick(unitCode: string) {
	const unit = unitsMap.value.get(unitCode)
	if (unit) {
		selectUnit(unit)
	}
}

// Při změně patra načíst nové SVG (pouze na klientu)
onMounted(() => {
	loadSvg()
})

watch(
	() => currentFloor.value?.svgMap,
	() => {
		loadSvg()
	},
)

// Při změně SVG obsahu nastavit listenery
watch(svgWrapperRef, (wrapper) => {
	if (wrapper) {
		nextTick(() => {
			setupEventListeners()
		})
	}
})

watch(processedSvg, () => {
	nextTick(() => {
		setupEventListeners()
	})
})

// Methods
function selectUnit(unit: MapUnit) {
	selectedUnit.value = unit
	shopToAssign.value = ''
}

async function assignShop() {
	if (!selectedUnit.value || !shopToAssign.value) return

	assigning.value = true
	try {
		await secureFetch(`/api/shops/${shopToAssign.value}`, {
			method: 'PUT',
			body: {
				unitCode: selectedUnit.value.unitCode,
				floorId: selectedUnit.value.floorId,
			},
		})
		flash.success(t('cms.flash.mapShopAssigned'))
		await Promise.all([refresh(), loadShops()])
		// Znovu načíst SVG aby se aktualizovaly barvy
		await loadSvg()
		selectedUnit.value = null
	} catch (err) {
		flash.error(t('cms.flash.mapAssignError'))
		console.error('Failed to assign shop:', err)
	} finally {
		assigning.value = false
	}
}

async function removeShop() {
	if (!selectedUnit.value?.shop) return

	removing.value = true
	try {
		await secureFetch(`/api/shops/${selectedUnit.value.shop._id}`, {
			method: 'PUT',
			body: { unitCode: '' },
		})
		flash.success(t('cms.flash.mapShopRemoved'))
		await Promise.all([refresh(), loadShops()])
		// Znovu načíst SVG aby se aktualizovaly barvy
		await loadSvg()
		selectedUnit.value = null
	} catch (err) {
		flash.error(t('cms.flash.mapRemoveError'))
		console.error('Failed to remove shop:', err)
	} finally {
		removing.value = false
	}
}
</script>

<style scoped>
/* CMS jednotky - všechny interaktivní */
:deep(.cms-unit) {
	cursor: pointer;
}

:deep(.cms-unit--occupied) {
	fill: rgb(99 102 241) !important; /* indigo-500 */
}

:deep(.cms-unit--occupied:hover) {
	fill: rgb(79 70 229) !important; /* indigo-600 */
}

:deep(.cms-unit--empty) {
	fill: rgb(209 213 219) !important; /* gray-300 */
}

:deep(.cms-unit--empty:hover) {
	fill: rgb(156 163 175) !important; /* gray-400 */
}

:deep(.cms-unit--selected) {
	fill: rgb(251 146 60) !important; /* orange-400 */
	stroke: rgb(234 88 12) !important; /* orange-600 */
	stroke-width: 2px !important;
}

/* Fade animation pro tooltip */
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
</style>
