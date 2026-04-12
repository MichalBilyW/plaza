<template>
	<div class="min-h-screen">
		<!-- Dark header -->
		<div class="bg-gradient-to-b from-[#131313] to-[#1A1A1A] pt-[130px] lg:pt-[160px] pb-20">
			<h1
				class="text-center text-white font-heading font-black text-3xl md:text-4xl uppercase"
			>
				{{ t('eventsPage.title') }}
			</h1>
		</div>

		<!-- Filter bar -->
		<div class="relative z-10 container-small transform -translate-y-9 px-4">
			<div
				class="flex flex-col gap-3 rounded-[5px_20px_5px_5px] bg-white px-5 py-4 drop-shadow-md md:flex-row md:justify-between"
				role="search"
				:aria-label="t('common.search')"
			>
				<!-- Search input -->
				<div class="relative flex-1 w-full max-w-md">
					<label for="event-search" class="sr-only">{{
						t('eventsPage.searchEvent')
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
						id="event-search"
						v-model="search"
						type="search"
						autocomplete="off"
						:placeholder="t('eventsPage.searchPlaceholder')"
						class="h-[41px] w-full rounded-[5px_20px_5px_5px] border border-plaza-dark/10 bg-transparent pl-10 pr-3 font-heading placeholder:text-plaza-dark/70"
					/>
				</div>
			</div>
		</div>

		<!-- Content area -->
		<div class="min-h-screen pb-12">
			<div class="container-small px-4">
				<!-- Loading skeleton (initial load only) -->
				<div v-if="initialLoading" class="flex flex-wrap justify-center gap-5">
					<div
						v-for="i in 6"
						:key="i"
						class="w-[290px] bg-white/5 rounded-[5px_20px_5px_5px] overflow-hidden"
					>
						<div class="h-[290px] skeleton-shimmer"></div>
						<div class="h-[50px] skeleton-shimmer mt-1"></div>
					</div>
				</div>

				<!-- Empty state -->
				<div v-else-if="allEvents.length === 0 && !loadingMore" class="py-16 text-center">
					<svg
						class="mx-auto mb-4 h-16 w-16 text-plaza-gray"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
						/>
					</svg>
					<h3 class="mb-1 text-lg font-medium text-white" role="status">
						{{ t('eventsPage.noEvents') }}
					</h3>
					<p class="text-plaza-gray">{{ t('eventsPage.noEventsHint') }}</p>
				</div>

				<!-- Events grid -->
				<div v-else class="flex flex-wrap justify-center gap-5">
					<component
						v-for="event in allEvents"
						:key="event._id"
						:is="event.content ? 'button' : 'div'"
						:type="event.content ? 'button' : undefined"
						class="group block w-[290px] rounded-[5px_20px_5px_5px] overflow-hidden text-left"
						:class="{ 'cursor-pointer': event.content }"
						@click="event.content ? openEventModal(event) : undefined"
					>
						<!-- Event image -->
						<div class="h-[290px] bg-plaza-light flex items-center justify-center">
							<img
								v-if="event.image"
								:src="event.image"
								:alt="event.name"
								loading="lazy"
								class="w-full h-full object-cover md:group-hover:brightness-95 transition duration-300"
							/>
							<svg
								v-else
								class="w-12 h-12 text-plaza-gray"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
								/>
							</svg>
						</div>

						<!-- Shop logo bar -->
						<div
							v-if="event.shop?.logo"
							class="h-[50px] bg-white flex items-center justify-center px-4"
						>
							<img
								:src="event.shop.logo"
								:alt="event.shop.name"
								loading="lazy"
								class="max-h-[30px] max-w-[120px] object-contain"
							/>
						</div>
						<div
							v-else-if="event.shop?.name"
							class="h-[50px] bg-white flex items-center justify-center px-4"
						>
							<span class="text-sm font-semibold text-plaza-dark truncate">
								{{ event.shop.name }}
							</span>
						</div>
					</component>
				</div>

				<!-- Load more button -->
				<div
					v-if="!initialLoading && allEvents.length > 0 && !allLoaded"
					class="mt-8 flex justify-center"
				>
					<button
						:disabled="loadingMore"
						class="inline-flex items-center justify-center px-6 py-2 rounded-[5px_20px_5px_5px] border-2 border-white text-white font-sans font-semibold text-base tracking-[0.05em] transition-colors hover:bg-plaza hover:border-transparent"
						@click="loadMore"
					>
						<svg
							v-if="loadingMore"
							class="h-5 w-5 animate-spin mr-2"
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
						{{ t('eventsPage.loadMore') }}
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { Event } from '@/shared/types'

interface EventsResponse {
	data: Event[]
	meta: {
		page: number
		limit: number
		total: number
		totalPages: number
	}
}

const { t } = useI18n()
const { openModal: openEventModal } = useEventModal()
const { trackSearch, trackLoadMore } = useDataLayer()
const { loadFilters, syncFilters } = useFilterPersistence('events')

usePlazaSeo({
	title: t('seo.events.title'),
	description: t('seo.events.description'),
})

const ITEMS_PER_PAGE = 12

// State — inicializace z URL/sessionStorage
const initialFilters = loadFilters({ search: '' })
const search = ref(initialFilters.search)
const currentPage = ref(1)
const allEvents = ref<Event[]>([])
const totalEvents = ref(0)
const loadingMore = ref(false)
const initialLoading = ref(true)

const allLoaded = computed(() => allEvents.value.length >= totalEvents.value)

// Synchronizace filtrů do URL a sessionStorage
const syncToUrl = () => {
	syncFilters({
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

// Build query for current filters
const buildQuery = (page: number) => ({
	page,
	limit: ITEMS_PER_PAGE,
	isActive: true,
	search: debouncedSearch.value || undefined,
})

// Initial fetch
const { data: eventsData, refresh } = await useFetch<EventsResponse>('/api/events', {
	query: computed(() => buildQuery(1)),
	watch: false,
})

// Populate initial data
if (eventsData.value) {
	allEvents.value = eventsData.value.data || []
	totalEvents.value = eventsData.value.meta?.total || 0
}
initialLoading.value = false

// Load more events
const loadMore = async () => {
	if (loadingMore.value || allLoaded.value) return
	loadingMore.value = true
	try {
		currentPage.value++
		const result = await $fetch<EventsResponse>('/api/events', {
			query: buildQuery(currentPage.value),
		})
		const newItems = result.data || []
		allEvents.value = [...allEvents.value, ...newItems]
		totalEvents.value = result.meta?.total || totalEvents.value
		trackLoadMore('events', currentPage.value, newItems.length)
	} finally {
		loadingMore.value = false
	}
}

// Reset when filters change
watch([debouncedSearch], async () => {
	currentPage.value = 1
	initialLoading.value = true
	await refresh()
	allEvents.value = eventsData.value?.data || []
	totalEvents.value = eventsData.value?.meta?.total || 0
	initialLoading.value = false
})

// Track search after debounce settles
watch(debouncedSearch, (query) => {
	if (query) {
		trackSearch(query, 'events', totalEvents.value)
	}
})
</script>

<style scoped>
.skeleton-shimmer {
	background: linear-gradient(
		90deg,
		rgba(255, 255, 255, 0.05) 25%,
		rgba(255, 255, 255, 0.1) 50%,
		rgba(255, 255, 255, 0.05) 75%
	);
	background-size: 200% 100%;
	animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
	0% {
		background-position: 200% 0;
	}
	100% {
		background-position: -200% 0;
	}
}
</style>
