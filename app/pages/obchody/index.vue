<template>
	<div class="min-h-screen">
		<!-- Dark header -->
		<div class="bg-plaza-dark pt-28 pb-20">
			<h1
				class="text-center text-white font-heading font-semibold text-3xl md:text-4xl uppercase"
			>
				{{ t('shops.title') }}
			</h1>
		</div>

		<!-- Filter bar -->
		<div
			class="relative z-10 mx-auto -mt-9 max-w-5xl px-4"
		>
			<div
				class="flex flex-col gap-3 rounded-[5px_20px_5px_5px] bg-white px-5 py-4 drop-shadow-md md:flex-row md:justify-between"
			>
				<div class="flex flex-col md:flex-row gap-3 w-full md:w-3/4">
					<!-- Category select -->
					<div class="relative w-full md:w-1/2 flex-shrink-0">
						<select
							v-model="selectedCategory"
							class="h-[41px] w-full appearance-none rounded-[5px_20px_5px_5px] border-2 border-white bg-plaza-dark pr-8 pl-3 font-sans text-sm text-white focus:border-plaza focus:outline-none"
						>
							<option value="">{{ t('shops.allCategories') }}</option>
							<option
								v-for="category in categories"
								:key="category._id"
								:value="category._id"
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
						<svg
							class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-white"
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<circle cx="11" cy="11" r="8" />
							<path d="M21 21l-4.35-4.35" stroke-linecap="round" />
						</svg>
						<input
							v-model="search"
							type="text"
							:placeholder="t('shops.shopName')"
							class="h-[41px] w-full rounded-[5px_20px_5px_5px] border-2 border-white bg-plaza-dark pl-10 pr-3 font-sans text-sm text-white placeholder:text-white/70 focus:border-plaza focus:outline-none"
						/>
					</div>
				</div>

				<!-- Map button -->
				<NuxtLink
					to="/mapa"
					class="max-md:hidden flex h-[41px] flex-shrink-0 items-center justify-center rounded-[5px_20px_5px_5px] bg-plaza px-6 font-heading font-semibold text-[16px] text-white transition-colors hover:brightness-110"
				>
					{{ t('shops.showMap') }}
				</NuxtLink>
			</div>
		</div>

		<!-- Content area -->
		<div class="mx-auto max-w-5xl px-4 py-8">
			<!-- Loading skeleton (initial load only) -->
			<div
				v-if="initialLoading"
				class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
			>
				<div v-for="i in 9" :key="i" class="animate-pulse overflow-hidden rounded-[5px_20px_5px_5px]">
					<div class="h-[200px] bg-plaza-light"></div>
					<div class="flex flex-col items-center py-4">
						<div class="-mt-[42px] mb-3 h-[85px] w-[120px] rounded-sm bg-white shadow-[0px_4px_4px_rgba(0,0,0,0.25)]"></div>
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
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
					/>
				</svg>
				<h3 class="mb-1 text-lg font-medium text-black">
					{{ t('shops.noShops') }}
				</h3>
				<p class="text-plaza-gray">{{ t('shops.noShopsHint') }}</p>
			</div>

			<!-- Shops grid -->
			<div
				v-else
				class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
			>
				<component
					:is="isUpcoming(shop) ? 'div' : 'NuxtLink'"
					v-for="shop in allShops"
					:key="shop._id"
					v-bind="isUpcoming(shop) ? {} : { to: `/obchody/${shop.slug}` }"
					class="group overflow-hidden rounded-[5px_20px_5px_5px] bg-white transition-shadow"
					:class="{ 'hover:shadow-lg cursor-pointer': !isUpcoming(shop) }"
				>
					<!-- Gallery photo -->
					<div class="relative h-[200px] w-full overflow-hidden bg-plaza-dark/90">
						<img
							v-if="shop.gallery?.[0]"
							:src="shop.gallery[0]"
							:alt="shop.name"
							class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
						/>
						<span
							v-else
							class="flex h-full w-full text-center p-4 items-center justify-center text-4xl font-bold text-white/90"
						>
							{{ shop.name.charAt(0) }}
						</span>
						<!-- Opening date badge -->
						<span
							v-if="shop.publishDate && new Date(shop.publishDate) > new Date()"
							class="absolute top-3 left-3 z-10 rounded-[5px_10px_5px_5px] bg-plaza px-3 py-1 text-xs font-semibold text-white shadow"
						>
							Otevíráme: {{ new Date(shop.publishDate).toLocaleDateString('cs-CZ') }}
						</span>
					</div>

					<!-- Logo overlay + text -->
					<div class="flex flex-col items-center px-4 pb-5">
						<!-- Logo box -->
						<div
							class="-mt-[42px] relative z-10 flex h-[85px] w-[120px] items-center justify-center rounded-sm bg-white shadow-[0px_4px_4px_rgba(0,0,0,0.25)]"
						>
							<img
								v-if="shop.logo"
								:src="shop.logo"
								:alt="shop.name"
								class="max-h-[60px] max-w-[70px] object-contain"
							/>
							<span
								v-else
								class="text-2xl font-bold text-plaza-gray"
							>
								{{ shop.name.charAt(0) }}
							</span>
						</div>

						<!-- Name -->
						<h3
							class="mt-3 text-center font-heading text-[22px] font-semibold leading-tight text-plaza-gray md:text-[26px]"
						>
							{{ shop.name }}
						</h3>

						<!-- Category & Floor -->
						<p
							v-if="shop.category || shop.floor"
							class="mt-1 text-center font-sans text-[15px] text-plaza-gray"
						>
							<span v-if="shop.category" class="text-plaza">{{ shop.category.name }}</span>
							<span v-if="shop.category && shop.floor"> · </span>
							<span v-if="shop.floor">{{ shop.floor.name }}</span>
						</p>
					</div>
				</component>
			</div>

			<!-- Load more button -->
			<div v-if="!initialLoading && allShops.length > 0 && !allLoaded" class="mt-8 flex justify-center">
				<button
					:disabled="loadingMore"
					class="inline-flex items-center gap-2 rounded-[5px_20px_5px_5px] bg-plaza px-8 py-3 font-heading text-lg font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
					@click="loadMore"
				>
					<svg
						v-if="loadingMore"
						class="h-5 w-5 animate-spin"
						viewBox="0 0 24 24"
						fill="none"
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

const isUpcoming = (shop: Shop) =>
	!!shop.publishDate && new Date(shop.publishDate) > new Date()

usePlazaSeo({
	title: t('seo.shops.title'),
	description: t('seo.shops.description'),
})

const ITEMS_PER_PAGE = 9

// State
const search = ref('')
const selectedCategory = ref('')
const currentPage = ref(1)
const allShops = ref<Shop[]>([])
const totalShops = ref(0)
const loadingMore = ref(false)
const initialLoading = ref(true)

const allLoaded = computed(() => allShops.value.length >= totalShops.value)

// Debounced search
const debouncedSearch = ref('')
let debounceTimeout: ReturnType<typeof setTimeout> | null = null
watch(search, (newValue) => {
	if (debounceTimeout) clearTimeout(debounceTimeout)
	debounceTimeout = setTimeout(() => {
		debouncedSearch.value = newValue
	}, 300)
})

// Load categories (only with at least 1 shop)
const { data: categoriesData } = await useFetch<{ data: Category[] }>('/api/categories', {
	query: { limit: 100, withShopsOnly: 'true', isActive: 'true' },
})
const categories = computed(() => categoriesData.value?.data || [])

// Build query for current filters
const buildQuery = (page: number) => ({
	page,
	limit: ITEMS_PER_PAGE,
	isActive: true,
	search: debouncedSearch.value || undefined,
	categoryId: selectedCategory.value || undefined,
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
		allShops.value = [...allShops.value, ...(result.data || [])]
		totalShops.value = result.pagination?.total || totalShops.value
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
</script>
