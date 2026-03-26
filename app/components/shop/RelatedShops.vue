<template>
	<section class="py-20 bg-white" :aria-label="t('shopDetail.relatedShops')">
		<div class="max-w-7xl sm:px-8 md:mx-auto">
			<!-- Heading + View Toggle -->
			<div class="flex items-center justify-between gap-4 mb-8 sm:mb-12 px-4 md:px-0">
				<div class="flex-1"></div>
				<div class="text-center">
					<h2 class="font-heading text-2xl md:text-3xl font-bold text-plaza-dark uppercase">
						{{ t('shopDetail.relatedShopsTitle') }}
					</h2>
					<p class="font-heading text-xl md:text-2xl font-semibold uppercase mt-1">
						{{ t('shopDetail.inCategory') }}
						<span class="relative inline-flex items-center">
							<!-- Hidden text to measure width -->
							<span class="invisible whitespace-nowrap font-heading text-xl md:text-2xl font-semibold uppercase" aria-hidden="true">
								{{ selectedCategoryName }}
							</span>
							<select
								v-model="selectedCategoryId"
								class="category-select absolute inset-0 w-full appearance-none bg-transparent text-plaza font-heading !translate-x-0 text-xl md:text-2xl font-semibold uppercase cursor-pointer border-none outline-none pr-5 pl-0 focus:ring-0 focus:outline-none focus-visible:outline-none"
								@change="onCategoryChange"
							>
								<option
									v-for="cat in categories"
									:key="cat._id"
									:value="cat._id"
								>
									{{ cat.name }}
								</option>
							</select>
							<svg
								class="pointer-events-none ml-1 w-4 h-4 text-plaza shrink-0"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
							</svg>
						</span>
					</p>
				</div>
				<div class="flex-1 flex justify-end">
					<button
						type="button"
						class="flex items-center gap-1.5 text-sm text-plaza-gray hover:text-plaza transition-colors"
						:aria-label="viewMode === 'slider' ? t('home.shops.showGrid') : t('home.shops.showSlider')"
						@click="toggleViewMode"
					>
						<!-- Grid icon -->
						<svg v-if="viewMode === 'slider'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
						</svg>
						<!-- Slider icon -->
						<svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
						</svg>
						<span class="hidden sm:inline">{{ viewMode === 'slider' ? t('home.shops.showGrid') : t('home.shops.showSlider') }}</span>
					</button>
				</div>
			</div>

			<!-- Shops skeleton -->
			<div v-if="pending" class="flex gap-5 overflow-hidden justify-center">
				<div
					v-for="i in 6"
					:key="i"
					class="shrink-0 w-[173px] md:w-[200px] bg-white border border-gray-200 rounded-xl p-6"
				>
					<div class="h-[100px] skeleton-shimmer rounded-lg mb-4"></div>
					<div class="flex justify-center gap-3">
						<div class="h-4 skeleton-shimmer rounded w-16"></div>
						<div class="h-4 skeleton-shimmer rounded w-12"></div>
					</div>
				</div>
			</div>

			<!-- Swiper slider / Grid -->
			<Transition v-else name="view-fade" mode="out-in">
				<!-- Slider view -->
				<div v-if="viewMode === 'slider'" key="slider" class="relative max-w-[calc(100%-50px)] mx-auto related-shops-slider">
					<!-- Navigation arrows -->
					<button
						v-show="!isLocked"
						type="button"
						class="related-shops-btn-prev z-30 absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:pointer-events-none"
						:aria-label="t('shopDetail.prevShop')"
						:disabled="!canSlidePrev"
						@click="slidePrev"
					>
						<svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
						</svg>
					</button>
					<button
						v-show="!isLocked"
						type="button"
						class="related-shops-btn-next z-30 absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:pointer-events-none"
						:aria-label="t('shopDetail.nextShop')"
						:disabled="!canSlideNext"
						@click="slideNext"
					>
						<svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
						</svg>
					</button>

					<Swiper
						:slides-per-view="'auto'"
						:space-between="20"
						:grab-cursor="true"
						class="!overflow-hidden"
						:class="{ 'swiper-centered': isLocked }"
						@swiper="onSwiperInit"
						@slide-change="onSlideChange"
						@resize="onSwiperResize"
					>
						<SwiperSlide v-for="shop in shops" :key="shop._id" class="!w-[173px]">
							<ShopCardCompact :shop="shop" />
						</SwiperSlide>
					</Swiper>
				</div>

				<!-- Grid view -->
				<div
					v-else-if="viewMode === 'grid'"
					key="grid"
					class="flex items-center gap-3 flex-wrap justify-center md:grid md:grid-cols-2 lg:grid-cols-3 px-4 md:px-0"
				>
					<ShopCard v-for="shop in visibleShops" :key="shop._id" :shop="shop" />
				</div>
			</Transition>

			<!-- Buttons -->
			<div class="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
				<!-- Load more (grid only, when more items) -->
				<button
					v-if="viewMode === 'grid' && hasMore"
					type="button"
					class="inline-flex items-center justify-center px-6 py-2 text-center rounded-[5px_20px_5px_5px] border-2 border-plaza-dark text-plaza-dark font-sans font-semibold text-base tracking-[0.05em] transition-colors hover:bg-plaza hover:text-white hover:border-transparent"
					@click="loadMore"
				>
					{{ t('shops.loadMore') }}
				</button>

				<!-- CTA button -->
				<NuxtLink
					to="/obchody"
					class="inline-flex items-center justify-center px-6 py-2 bg-plaza text-white font-sans font-semibold text-base tracking-[0.05em] rounded-[5px_20px_5px_5px] shadow-md hover:shadow-[0_6px_20px_rgba(226,11,27,0.4)] hover:brightness-110 transition-all duration-200"
				>
					{{ viewMode === 'grid' ? t('home.shops.filterShops') : t('home.sections.shopsList') }}
				</NuxtLink>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import type { Swiper as SwiperType } from 'swiper'
import type { Shop, Category } from '@/shared/types'
import 'swiper/css'

const { t } = useI18n()

const ITEMS_PER_PAGE = 9

const props = defineProps<{
	shops: Shop[]
	categories: Category[]
	categoryId: string
	pending: boolean
}>()

const emit = defineEmits<{
	(e: 'category-change', categoryId: string): void
}>()

// === Category selection ===
const selectedCategoryId = ref(props.categoryId)

const selectedCategoryName = computed(() => {
	const cat = props.categories.find(c => c._id === selectedCategoryId.value)
	return cat?.name ?? ''
})

watch(() => props.categoryId, (newId) => {
	selectedCategoryId.value = newId
})

const onCategoryChange = () => {
	emit('category-change', selectedCategoryId.value)
}

// === View mode toggle ===
const viewMode = ref<'slider' | 'grid'>('slider')
const toggleViewMode = () => {
	viewMode.value = viewMode.value === 'slider' ? 'grid' : 'slider'
	visibleCount.value = ITEMS_PER_PAGE // reset při přepnutí
}

// === Grid pagination ===
const visibleCount = ref(ITEMS_PER_PAGE)
const visibleShops = computed(() => props.shops.slice(0, visibleCount.value))
const hasMore = computed(() => visibleCount.value < props.shops.length)
const loadMore = () => {
	visibleCount.value += ITEMS_PER_PAGE
}

// === Swiper navigation ===
const swiperInstance = ref<SwiperType | null>(null)
const isLocked = ref(false)

const onSwiperInit = (swiper: SwiperType) => {
	swiperInstance.value = swiper
	isLocked.value = swiper.isLocked
}

const onSlideChange = (swiper: SwiperType) => {
	isLocked.value = swiper.isLocked
}

const onSwiperResize = (swiper: SwiperType) => {
	isLocked.value = swiper.isLocked
}

const slidePrev = () => {
	swiperInstance.value?.slidePrev()
}

const slideNext = () => {
	swiperInstance.value?.slideNext()
}

const canSlidePrev = computed(() => {
	if (!swiperInstance.value) return false
	return !swiperInstance.value.isBeginning
})

const canSlideNext = computed(() => {
	if (!swiperInstance.value) return false
	return !swiperInstance.value.isEnd
})
</script>

<style scoped>
/* View mode transition */
.view-fade-enter-active,
.view-fade-leave-active {
	transition: opacity 0.2s ease, transform 0.2s ease;
}

.view-fade-enter-from {
	opacity: 0;
	transform: translateY(8px);
}

.view-fade-leave-to {
	opacity: 0;
	transform: translateY(-8px);
}

/* Center slides when all are visible */
.swiper-centered :deep(.swiper-wrapper) {
	justify-content: center !important;
}

/* Category select styling */
.category-select {
	width: auto;
	min-width: 0;
	text-align: center;
	text-align-last: center;
	padding-left: 0 !important;
	margin-left: 0;
}

.category-select:hover {
	opacity: 0.8;
}

.category-select option {
	font-family: system-ui, -apple-system, sans-serif;
	font-size: 16px !important;
	font-weight: 400 !important;
	text-transform: none !important;
	color: #333;
	background: white;
	padding: 12px 16px;
}

.category-select option:checked {
	background: #E20B1B;
	color: white;
	color: white;
}

.category-select option:hover {
	background: #f5f5f5;
}
</style>
