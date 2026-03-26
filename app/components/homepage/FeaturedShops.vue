<template>
	<section class="py-20 bg-white" :aria-label="t('home.sections.shops')">
		<div class="max-w-7xl sm:px-8 md:mx-auto">
			<!-- Heading + View Toggle -->
			<div class="flex items-center justify-between gap-4 mb-8 sm:mb-16 lg:mb-20 px-4 md:px-0">
				<div class="flex-1"></div>
				<h2 class="font-heading text-3xl md:text-4xl font-bold text-center">
					{{ t('home.sections.shops') }}
				</h2>
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
			<div v-if="pending" class="flex gap-5 overflow-hidden">
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

			<!-- Swiper slider / Grid (always visible, even with few items) -->
			<Transition v-else name="view-fade" mode="out-in">
				<div v-if="viewMode === 'slider'" key="slider" class="relative max-w-[calc(100%-50px)] mx-auto featured-shops-slider">
				<!-- Navigation arrows -->
				<button
					ref="prevBtnRef"
					class="featured-shops-btn-prev z-30 absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
					:aria-label="t('home.infoSection.prevNews')"
				>
					<svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
					</svg>
				</button>
				<button
					ref="nextBtnRef"
					class="featured-shops-btn-next z-30 absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
					:aria-label="t('home.infoSection.nextNews')"
				>
					<svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
					</svg>
				</button>

				<Swiper
					:modules="[SwiperNavigation]"
					:slides-per-view="'auto'"
					:space-between="20"
					:grab-cursor="true"
					:navigation="{
						prevEl: prevBtnRef,
						nextEl: nextBtnRef,
					}"
					class="!overflow-hidden"
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
					class="inline-flex items-center justify-center px-6 py-2 text-center bg-plaza text-white font-sans font-semibold text-base tracking-[0.05em] rounded-[5px_20px_5px_5px] shadow-md hover:shadow-[0_6px_20px_rgba(226,11,27,0.4)] hover:brightness-110 transition-all duration-200"
				>
					{{ viewMode === 'grid' ? t('home.shops.filterShops') : t('home.sections.shopsList') }}
				</NuxtLink>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation as SwiperNavigation } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import type { Shop } from '@/shared/types'
import 'swiper/css'
import 'swiper/css/navigation'

const { t } = useI18n()

const ITEMS_PER_PAGE = 9

const props = defineProps<{
	shops: Shop[]
	pending: boolean
}>()

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
const prevBtnRef = ref<HTMLElement | null>(null)
const nextBtnRef = ref<HTMLElement | null>(null)
const swiperInstance = ref<SwiperType | null>(null)
const isBeginning = ref(true)
const isEnd = ref(false)
const isLocked = ref(false)

const updateNavState = (swiper: SwiperType) => {
	isBeginning.value = swiper.isBeginning
	isEnd.value = swiper.isEnd
	isLocked.value = swiper.isLocked
}

const onSwiperInit = (swiper: SwiperType) => {
	swiperInstance.value = swiper
	updateNavState(swiper)
}

const onSlideChange = (swiper: SwiperType) => {
	updateNavState(swiper)
}

const onSwiperResize = (swiper: SwiperType) => {
	updateNavState(swiper)
}
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

/* Hide arrows when slider is locked (all slides visible) */
.featured-shops-slider:has(.swiper-locked) .featured-shops-btn-prev,
.featured-shops-slider:has(.swiper-locked) .featured-shops-btn-next {
	display: none;
}

/* Center slides when all are visible (no scrolling needed) */
.featured-shops-slider :deep(.swiper-locked .swiper-wrapper) {
	justify-content: center;
}

/* Disable state for arrows */
.featured-shops-btn-prev.swiper-button-disabled,
.featured-shops-btn-next.swiper-button-disabled {
	opacity: 0.35;
	pointer-events: none;
}
</style>
