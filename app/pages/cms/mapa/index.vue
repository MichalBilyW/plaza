<template>
	<div class="p-4 sm:p-6 lg:p-8">
		<div class="mb-6 sm:mb-8">
			<h1 class="text-xl sm:text-2xl font-bold text-gray-900">{{ t('cms.map.title') }}</h1>
			<p class="text-gray-500 mt-1 text-sm sm:text-base">{{ t('cms.map.subtitle') }}</p>
		</div>

		<!-- Statistiky -->
		<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
			<div class="bg-white rounded-xl shadow-sm p-4">
				<div class="text-2xl font-bold text-indigo-600">{{ stats.totalUnits }}</div>
				<div class="text-sm text-gray-500">{{ t('cms.map.totalUnits') }}</div>
			</div>
			<div class="bg-white rounded-xl shadow-sm p-4">
				<div class="text-2xl font-bold text-green-600">{{ stats.occupiedUnits }}</div>
				<div class="text-sm text-gray-500">{{ t('cms.map.occupiedUnits') }}</div>
			</div>
			<div class="bg-white rounded-xl shadow-sm p-4">
				<div class="text-2xl font-bold text-orange-600">{{ stats.emptyUnits }}</div>
				<div class="text-sm text-gray-500">{{ t('cms.map.emptyUnits') }}</div>
			</div>
			<div class="bg-white rounded-xl shadow-sm p-4">
				<div class="text-2xl font-bold text-gray-600">{{ stats.occupancyRate }}%</div>
				<div class="text-sm text-gray-500">{{ t('cms.map.occupancyRate') }}</div>
			</div>
		</div>

		<!-- Výběr patra -->
		<div class="bg-white rounded-xl shadow-sm p-4 mb-6">
			<div class="flex flex-wrap gap-2">
				<button
					v-for="floor in floors"
					:key="floor.level"
					@click="selectedFloorLevel = floor.level"
					:class="[
						'px-4 py-2 rounded-lg font-medium transition-colors',
						selectedFloorLevel === floor.level
							? 'bg-indigo-600 text-white'
							: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
					]"
				>
					{{ getFloorName(floor.level) }}
				</button>
			</div>
		</div>

		<!-- Mapa -->
		<div class="bg-white rounded-xl shadow-sm p-6">
			<h2 class="text-lg font-semibold mb-4 text-gray-900">
				{{ getFloorName(selectedFloorLevel) }}
			</h2>

			<!-- Legenda -->
			<div class="flex flex-wrap gap-4 mb-6 text-sm">
				<div class="flex items-center gap-2">
					<div class="w-4 h-4 bg-green-500 rounded"></div>
					<span>{{ t('cms.map.occupied') }}</span>
				</div>
				<div class="flex items-center gap-2">
					<div class="w-4 h-4 bg-gray-300 rounded"></div>
					<span>{{ t('cms.map.empty') }}</span>
				</div>
				<div class="flex items-center gap-2">
					<div class="w-4 h-4 bg-orange-500 rounded"></div>
					<span>{{ t('cms.map.inactive') }}</span>
				</div>
			</div>

			<!-- Loading -->
			<div v-if="pending" class="flex justify-center py-12">
				<span class="text-gray-500">{{ t('common.loading') }}</span>
			</div>

			<!-- Error -->
			<div v-else-if="error" class="text-center py-12 text-red-500">
				{{ t('common.error') }}: {{ error.message }}
			</div>

			<!-- SVG Mapa -->
			<div v-else class="overflow-x-auto">
				<svg
					viewBox="0 0 420 200"
					class="w-full max-w-2xl mx-auto"
					style="min-width: 400px"
				>
					<!-- Pozadí mapy -->
					<rect x="0" y="0" width="420" height="200" fill="#f3f4f6" rx="8" />

					<!-- Popis patra -->
					<text x="210" y="25" text-anchor="middle" class="fill-gray-500 text-xs">
						{{ getFloorName(selectedFloorLevel) }}
					</text>

					<!-- Jednotky -->
					<g
						v-for="unit in currentFloorUnits"
						:key="unit.id"
						@click="selectUnit(unit)"
						class="cursor-pointer"
					>
						<rect
							:x="unit.position.x"
							:y="unit.position.y"
							:width="unit.position.width"
							:height="unit.position.height"
							:fill="getUnitColor(unit)"
							stroke="#fff"
							stroke-width="2"
							rx="4"
							class="transition-all hover:opacity-80"
						/>
						<!-- ID jednotky -->
						<text
							:x="unit.position.x + unit.position.width / 2"
							:y="unit.position.y + 20"
							text-anchor="middle"
							class="fill-white text-xs font-bold pointer-events-none"
						>
							{{ unit.id }}
						</text>
						<!-- Název obchodu -->
						<text
							v-if="unit.shop"
							:x="unit.position.x + unit.position.width / 2"
							:y="unit.position.y + unit.position.height / 2 + 5"
							text-anchor="middle"
							class="fill-white text-xs pointer-events-none"
						>
							{{ truncateShopName(unit.shop.name) }}
						</text>
						<!-- Prázdná jednotka -->
						<text
							v-else
							:x="unit.position.x + unit.position.width / 2"
							:y="unit.position.y + unit.position.height / 2 + 5"
							text-anchor="middle"
							class="fill-gray-600 text-xs pointer-events-none"
						>
							{{ t('cms.map.emptyUnit') }}
						</text>
					</g>

					<!-- Okolní prvky (dekorativní) -->
					<rect x="5" y="170" width="60" height="25" fill="#e5e7eb" rx="3" />
					<text x="35" y="186" text-anchor="middle" class="fill-gray-500 text-xs">
						Vchod
					</text>

					<rect x="355" y="170" width="60" height="25" fill="#e5e7eb" rx="3" />
					<text x="385" y="186" text-anchor="middle" class="fill-gray-500 text-xs">
						Výtah
					</text>
				</svg>
			</div>
		</div>

		<!-- Modal pro detail jednotky -->
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
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>

					<h3 class="text-lg font-semibold mb-4">
						{{ t('cms.map.unitDetail') }}: {{ selectedUnit.id }}
					</h3>

					<div class="space-y-4">
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1">
								{{ t('cms.map.position') }}
							</label>
							<p class="text-gray-600">{{ selectedUnit.label }}</p>
						</div>

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
									<span class="text-gray-500 text-lg font-bold">{{
										selectedUnit.shop.name.charAt(0)
									}}</span>
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

							<!-- Žádné dostupné obchody -->
							<div
								v-if="availableShops.length === 0"
								class="p-4 bg-gray-50 rounded-lg text-center"
							>
								<p class="text-gray-500 text-sm">
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

							<!-- Dropdown s obchody -->
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
									class="mt-3 w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
	</div>
</template>

<script setup lang="ts">
import type { UnitWithShop } from '~~/shared/map/units'
import type { Shop } from '~~/shared/types'

// Types for API responses
interface MapFloor {
	level: number
	units: UnitWithShop[]
}

interface MapUnitsResponse {
	floors: MapFloor[]
	totalUnits: number
	occupiedUnits: number
}

interface ShopsListResponse {
	data: Shop[]
}

definePageMeta({
	layout: 'cms',
})

const { t } = useI18n()
const { secureFetch } = useCmsAuth()
const flash = useFlashMessages()

// State
const selectedFloorLevel = ref(0)
const selectedUnit = ref<UnitWithShop | null>(null)
const shopToAssign = ref('')
const assigning = ref(false)
const removing = ref(false)

// Fetch map units
const {
	data: mapData,
	pending,
	error,
	refresh,
} = await useFetch<MapUnitsResponse>('/api/map/units')

// Fetch all shops for assignment
const { data: shopsData } = await useFetch<ShopsListResponse>('/api/shops', {
	query: { limit: 100, isActive: true },
})

// Computed
const floors = computed(() => {
	if (!mapData.value?.floors) return []
	return mapData.value.floors.map((f: { level: number }) => ({
		level: f.level,
	}))
})

const currentFloorUnits = computed<UnitWithShop[]>(() => {
	if (!mapData.value?.floors) return []
	const floor = mapData.value.floors.find(
		(f: { level: number }) => f.level === selectedFloorLevel.value,
	)
	return floor?.units ?? []
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

// Obchody bez přiřazené jednotky
const availableShops = computed(() => {
	if (!shopsData.value?.data) return []

	// ID jednotek, které už mají obchod
	const occupiedUnitIds = new Set<string>()
	if (mapData.value?.floors) {
		for (const floor of mapData.value.floors) {
			for (const unit of floor.units) {
				if (unit.shop) {
					occupiedUnitIds.add(unit.id)
				}
			}
		}
	}

	// Vrátíme obchody, které nemají přiřazenou jednotku nebo mají jinou jednotku
	return (shopsData.value.data as Shop[]).filter((shop) => {
		if (!shop.unitCode) return true
		return !occupiedUnitIds.has(shop.unitCode)
	})
})

// Methods
function getFloorName(level: number): string {
	if (level === 0) return t('cms.map.groundFloor')
	if (level < 0) return t('cms.map.basement', { level: Math.abs(level) })
	return t('cms.map.floor', { level })
}

function getUnitColor(unit: UnitWithShop): string {
	if (!unit.shop) return '#d1d5db' // gray-300
	if (!unit.shop.isActive) return '#f97316' // orange-500
	return '#22c55e' // green-500
}

function truncateShopName(name: string): string {
	if (name.length <= 10) return name
	return name.substring(0, 8) + '...'
}

function selectUnit(unit: UnitWithShop) {
	selectedUnit.value = unit
	shopToAssign.value = ''
}

async function assignShop() {
	if (!selectedUnit.value || !shopToAssign.value) return

	assigning.value = true
	try {
		await secureFetch(`/api/shops/${shopToAssign.value}`, {
			method: 'PUT',
			body: { unitCode: selectedUnit.value.id },
		})
		flash.success(t('cms.flash.mapShopAssigned'))
		await refresh()
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
		await refresh()
		selectedUnit.value = null
	} catch (err) {
		flash.error(t('cms.flash.mapRemoveError'))
		console.error('Failed to remove shop:', err)
	} finally {
		removing.value = false
	}
}
</script>
