<template>
	<section class="py-20 bg-white">
		<div class="max-w-7xl mx-2 md:mx-auto">
			<!-- Heading -->
			<h2 class="font-heading text-3xl md:text-4xl font-bold text-center mb-10">
				{{ t('home.sections.shops') }}
			</h2>

			<!-- Shops skeleton -->
			<div v-if="pending" class="flex gap-5 overflow-hidden">
				<div
					v-for="i in 6"
					:key="i"
					class="shrink-0 w-[180px] md:w-[200px] bg-white border border-gray-200 rounded-xl p-6"
				>
					<div class="h-[100px] skeleton-shimmer rounded-lg mb-4"></div>
					<div class="flex justify-center gap-3">
						<div class="h-4 skeleton-shimmer rounded w-16"></div>
						<div class="h-4 skeleton-shimmer rounded w-12"></div>
					</div>
				</div>
			</div>

			<!-- Swiper slider -->
			<div v-else class="relative max-w-[calc(100%-50px)] mx-auto featured-shops-slider">
				<!-- Navigation arrows -->
				<button
					ref="prevBtnRef"
					class="featured-shops-btn-prev z-30 absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
					:aria-label="t('home.infoSection.prevNews')"
				>
					<svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
					</svg>
				</button>
				<button
					ref="nextBtnRef"
					class="featured-shops-btn-next z-30 absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
					:aria-label="t('home.infoSection.nextNews')"
				>
					<svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
					<SwiperSlide v-for="shop in shops" :key="shop._id" class="!w-[180px]">
						<component
							:is="isUpcoming(shop) ? 'div' : 'NuxtLink'"
							v-bind="isUpcoming(shop) ? {} : { to: `/obchody/${shop.slug}` }"
							class="relative flex flex-col justify-center items-center bg-white border border-gray-200 w-[180px] h-[180px] rounded-[5px_20px_5px_5px] p-5 transition-shadow"
							:class="{ 'hover:shadow-lg cursor-pointer': !isUpcoming(shop) }"
						>
							<!-- Opening date badge -->
							<span
								v-if="shop.publishDate && new Date(shop.publishDate) > new Date()"
								class="absolute top-2 left-2 z-10 rounded-[5px_10px_5px_5px] bg-plaza px-2 py-0.5 text-[10px] font-semibold text-white shadow"
							>
								Otevíráme: {{ new Date(shop.publishDate).toLocaleDateString('cs-CZ') }}
							</span>
							<!-- Logo -->
							<div class="flex items-center justify-center text-center h-full w-[70px] mb-4">
								<img
									v-if="shop.logo"
									:src="shop.logo"
									:alt="shop.name"
									loading="lazy"
									class="max-w-full max-h-full object-contain"
								/>
								<span v-else class="text-3xl font-bold text-plaza-gray">
									{{ shop.name.charAt(0) }}
								</span>
							</div>

							<div class="w-full max-w-[100px] h-0.5 bg-plaza-light mb-4 mt-2"></div>

							<!-- Category + Floor -->
							<div class="flex items-center justify-between w-full gap-3 text-sm text-plaza-gray">
								<span class="text-xs text-plaza/90" v-if="shop.category?.name">{{ shop.category.name.length > 12 ? shop.category.name.slice(0, 12) + '...' : shop.category.name }}</span>
								<span class="text-xs opacity-90" v-if="shop.floor?.name">{{ shop.floor.name }}</span>
							</div>
						</component>
					</SwiperSlide>
				</Swiper>
			</div>

			<!-- CTA button -->
			<div class="flex justify-center mt-10">
				<NuxtLink
					to="/obchody"
					class="inline-flex items-center justify-center px-6 py-2 bg-plaza text-white font-heading font-semibold text-base tracking-[0.05em] rounded-[5px_20px_5px_5px] shadow-md hover:shadow-[0_6px_20px_rgba(226,11,27,0.4)] hover:brightness-110 transition-all duration-200"
				>
					{{ t('home.sections.shopsList') }}
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

const isUpcoming = (shop: Shop) =>
	!!shop.publishDate && new Date(shop.publishDate) > new Date()

defineProps<{
	shops: Shop[]
	pending: boolean
}>()

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
