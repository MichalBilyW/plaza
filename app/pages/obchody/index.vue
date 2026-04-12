<template>
	<div class="min-h-screen">
		<!-- Dark header -->
		<div class="bg-gradient-to-b from-[#131313] to-[#1A1A1A] pt-[130px] lg:pt-[160px] pb-20">
			<h1
				class="text-center text-white font-heading font-black text-3xl md:text-4xl uppercase"
			>
				{{ t('shops.title') }}
			</h1>
		</div>

		<!-- Filter bar -->
		<div class="relative z-10 container-small -mt-9 px-4">
			<div
				class="flex flex-col gap-3 rounded-[5px_20px_5px_5px] bg-white px-5 py-4 drop-shadow-md md:flex-row md:justify-between"
				role="search"
				:aria-label="t('common.search')"
			>
				<div class="flex flex-col md:flex-row gap-3 w-full md:w-3/4">
					<!-- Category select -->
					<div class="relative w-full md:w-1/2 flex-shrink-0">
						<label for="category-filter" class="sr-only">{{
							t('common.filterCategory')
						}}</label>
						<select
							id="category-filter"
							v-model="selectedCategory"
							class="h-[41px] w-full appearance-none rounded-[5px_20px_5px_5px] border border-plaza-dark/10 bg-transparent pr-8 pl-3 font-heading"
						>
							<option value="">{{ t('shops.allCategories') }}</option>
							<option
								v-for="category in categories"
								:key="category._id"
								:value="category.slug"
							>
								{{ category.name }}
							</option>
						</select>
						<!-- Chevron icon -->
						<svg
							class="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-white"
							width="12"
							height="8"
							viewBox="0 0 12 8"
							fill="none"
							aria-hidden="true"
						>
							<path
								d="M1 1.5L6 6.5L11 1.5"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					</div>

					<!-- Search input -->
					<div class="relative flex-1 w-full md:w-1/2">
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
				</div>

				<!-- Map button -->
				<NuxtLink
					to="/mapa"
					class="max-md:hidden flex h-[41px] flex-shrink-0 items-center justify-center rounded-[5px_20px_5px_5px] bg-plaza px-6 font-sans font-semibold text-[16px] text-white transition-colors hover:brightness-110"
				>
					{{ t('shops.showMap') }}
				</NuxtLink>
			</div>
		</div>

		<!-- Content area -->
		<div class="container-small px-4 py-8">
			<!-- Loading skeleton (initial load only) -->
			<div v-if="initialLoading" class="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
				<div
					v-for="i in 9"
					:key="i"
					class="animate-pulse overflow-hidden rounded-[5px_20px_5px_5px] bg-white w-full"
				>
					<div class="h-[200px] bg-plaza-light"></div>
					<div class="flex flex-col items-center py-4">
						<div
							class="-mt-[42px] mb-3 h-[85px] w-[120px] rounded-sm bg-white shadow-[0px_4px_4px_rgba(0,0,0,0.25)]"
						></div>
						<div class="mb-2 h-6 w-32 rounded bg-plaza-light"></div>
						<div class="h-4 w-24 rounded bg-plaza-light"></div>
					</div>
				</div>
			</div>

			<!-- Empty state -->
			<div v-else-if="allShops.length === 0 && !loadingMore" class="py-16 text-center">
				<svg
					class="mx-auto mb-4 h-16 w-16 text-plaza-light"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
					/>
				</svg>
				<h3 class="mb-1 text-lg font-medium text-black" role="status">
					{{ t('shops.noShops') }}
				</h3>
				<p class="text-plaza-gray">{{ t('shops.noShopsHint') }}</p>
			</div>

			<!-- Shops grid -->
			<div v-else class="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
				<ShopCard v-for="shop in allShops" :key="shop._id" :shop="shop" />
			</div>

			<!-- Load more button -->
			<div
				v-if="!initialLoading && allShops.length > 0 && !allLoaded"
				class="mt-8 flex justify-center items-center"
			>
				<button
					:disabled="loadingMore"
					class="inline-flex items-center justify-center px-6 py-2 rounded-[5px_20px_5px_5px] border-2 border-plaza-dark text-plaza-dark font-sans font-semibold text-base tracking-[0.05em] transition-colors hover:bg-plaza hover:text-white hover:border-transparent"
					@click="loadMore"
				>
					<svg
						v-if="loadingMore"
						class="h-5 w-5 animate-spin"
						viewBox="0 0 24 24"
						fill="none"
						aria-hidden="true"
					>
						<circle
							class="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							stroke-width="4"
						/>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
						/>
					</svg>
					{{ t('shops.loadMore') }}
				</button>
			</div>
		</div>

		<!-- Map section -->
		<MapSection />
	</div>
</template>

<script setup lang="ts">
import type { Shop, Category } from '@/shared/types'

interface ShopsResponse {
	data: Shop[]
	pagination: {
		page: number
		limit: number
		total: number
		totalPages: number
	}
}

const { t } = useI18n()
const { trackSearch, trackFilterApply, trackLoadMore } = useDataLayer()
const { loadFilters, syncFilters } = useFilterPersistence('shops')

usePlazaSeo({
	title: t('seo.shops.title'),
	description: t('seo.shops.description'),
})

const ITEMS_PER_PAGE = 9

// State — inicializace z URL/sessionStorage
const initialFilters = loadFilters({ search: '', kategorie: '' })
const search = ref(initialFilters.search)
const selectedCategory = ref(initialFilters.kategorie) // uchovává slug kategorie
const currentPage = ref(1)
const allShops = ref<Shop[]>([])
const totalShops = ref(0)
const loadingMore = ref(false)
const initialLoading = ref(true)

const allLoaded = computed(() => allShops.value.length >= totalShops.value)

// Synchronizace filtrů do URL a sessionStorage
const syncToUrl = () => {
	syncFilters({
		kategorie: selectedCategory.value,
		search: search.value,
	})
}

// Debounced search
const debouncedSearch = ref(search.value)
let debounceTimeout: ReturnType<typeof setTimeout> | null = null
watch(search, (newValue) => {
	if (debounceTimeout) clearTimeout(debounceTimeout)
	debounceTimeout = setTimeout(() => {
		debouncedSearch.value = newValue
		syncToUrl()
	}, 300)
})

// Sync kategorie okamžitě do URL
watch(selectedCategory, () => {
	syncToUrl()
})

// Load categories (only with at least 1 shop)
const { data: categoriesData } = await useFetch<{ data: Category[] }>('/api/categories', {
	query: { limit: 100, withShopsOnly: 'true', isActive: 'true' },
})
const categories = computed(() => categoriesData.value?.data || [])

// Překlad slug → _id pro API
const selectedCategoryId = computed(() => {
	if (!selectedCategory.value) return undefined
	return categories.value.find((c) => c.slug === selectedCategory.value)?._id || undefined
})

// Build query for current filters
const buildQuery = (page: number) => ({
	page,
	limit: ITEMS_PER_PAGE,
	isActive: true,
	search: debouncedSearch.value || undefined,
	categoryId: selectedCategoryId.value || undefined,
})

// Initial fetch
const { data: shopsData, refresh } = await useFetch<ShopsResponse>('/api/shops', {
	query: computed(() => buildQuery(1)),
	watch: false,
})

// Populate initial data
if (shopsData.value) {
	allShops.value = shopsData.value.data || []
	totalShops.value = shopsData.value.pagination?.total || 0
}
initialLoading.value = false

// Load more shops
const loadMore = async () => {
	if (loadingMore.value || allLoaded.value) return
	loadingMore.value = true
	try {
		currentPage.value++
		const result = await $fetch<ShopsResponse>('/api/shops', {
			query: buildQuery(currentPage.value),
		})
		const newItems = result.data || []
		allShops.value = [...allShops.value, ...newItems]
		totalShops.value = result.pagination?.total || totalShops.value
		trackLoadMore('shops', currentPage.value, newItems.length)
	} finally {
		loadingMore.value = false
	}
}

// Reset when filters change
watch([debouncedSearch, selectedCategory], async () => {
	currentPage.value = 1
	initialLoading.value = true
	await refresh()
	allShops.value = shopsData.value?.data || []
	totalShops.value = shopsData.value?.pagination?.total || 0
	initialLoading.value = false
})

// Track search after debounce settles
watch(debouncedSearch, (query) => {
	if (query) {
		trackSearch(query, 'shops', totalShops.value)
	}
})

// Track category filter changes
watch(selectedCategory, (slug) => {
	if (slug) {
		const categoryName = categories.value.find((c) => c.slug === slug)?.name || slug
		trackFilterApply('category', categoryName, 'shops')
	}
})
</script>
