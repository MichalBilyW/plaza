<template>
	<section class="py-20 bg-plaza-dark">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<!-- Desktop: side-by-side layout / Mobile: stacked -->
			<div class="flex flex-col lg:flex-row lg:items-start lg:gap-10">
				<!-- Left side: heading + perex + arrows -->
				<div class="lg:w-[220px] shrink-0 mb-8 lg:mb-0 lg:pt-4">
					<h2 class="font-heading tracking-wide text-3xl lg:text-4xl font-bold text-white">
						{{ t('home.sections.events') }}
					</h2>
					<p class="text-plaza-gray mt-3 text-sm leading-relaxed">
						{{ t('home.sections.eventsPerex') }}
					</p>

					<!-- Navigation arrows -->
					<div v-show="!isLocked" class="flex gap-2 mt-6">
						<button
							ref="prevBtnRef"
							class="events-btn-prev w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center hover:border-white/60 transition-colors"
						>
							<svg class="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
							</svg>
						</button>
						<button
							ref="nextBtnRef"
							class="events-btn-next w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center hover:border-white/60 transition-colors"
						>
							<svg class="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
							</svg>
						</button>
					</div>
				</div>

				<!-- Right side: slider -->
				<div class="flex-1 min-w-0">
					<!-- Events skeleton -->
					<div v-if="pending" class="flex gap-5 overflow-hidden">
						<div
							v-for="i in 3"
							:key="i"
							class="shrink-0 w-[290px] bg-white/5 rounded-2xl overflow-hidden"
						>
							<div class="h-[290px] skeleton-shimmer"></div>
							<div class="h-[50px] skeleton-shimmer mt-1"></div>
						</div>
					</div>

					<!-- Empty state -->
					<div v-else-if="events.length === 0" class="text-center py-12 text-plaza-gray">
						{{ t('events.noEvents') }}
					</div>

					<!-- Swiper slider -->
					<div v-else class="relative events-slider">
						<Swiper
							:modules="[SwiperNavigation]"
							:slides-per-view="'auto'"
							:space-between="20"
							:grab-cursor="true"
							class="!overflow-hidden"
							@swiper="onSwiperInit"
							@slide-change="onSlideChange"
							@resize="onSwiperResize"
						>
							<SwiperSlide v-for="event in events" :key="event._id" class="!w-[290px]">
								<NuxtLink
									:to="event.shop?.slug ? `/obchody/${event.shop.slug}` : '#'"
									class="group block w-[290px] rounded-[5px_20px_5px_5px] overflow-hidden"
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
								</NuxtLink>
							</SwiperSlide>
						</Swiper>
					</div>
				</div>
			</div>

			<!-- CTA button -->
			<div class="flex justify-center mt-10">
				<NuxtLink
					to="/akce"
					class="inline-flex items-center justify-center px-6 py-2 bg-plaza text-white font-heading font-semibold text-base tracking-[0.05em] rounded-[5px_20px_5px_5px] shadow-md hover:shadow-[0_6px_20px_rgba(226,11,27,0.4)] hover:brightness-110 transition-all duration-200"
				>
					{{ t('home.sections.eventsList') }}
				</NuxtLink>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation as SwiperNavigation } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import type { Event } from '@/shared/types'
import 'swiper/css'
import 'swiper/css/navigation'

const { t } = useI18n()

defineProps<{
	events: Event[]
	pending: boolean
}>()

// === Swiper navigation ===
const prevBtnRef = ref<HTMLElement | null>(null)
const nextBtnRef = ref<HTMLElement | null>(null)
const swiperInstance = ref<SwiperType | null>(null)
const isLocked = ref(false)

const updateNavState = (swiper: SwiperType) => {
	isLocked.value = swiper.isLocked
}

const onSwiperInit = (swiper: SwiperType) => {
	swiperInstance.value = swiper
	// Attach navigation buttons manually after mount (refs are available)
	nextTick(() => {
		if (prevBtnRef.value && nextBtnRef.value) {
			swiper.params.navigation = {
				...swiper.params.navigation,
				prevEl: prevBtnRef.value,
				nextEl: nextBtnRef.value,
			}
			swiper.navigation.init()
			swiper.navigation.update()
		}
		updateNavState(swiper)
	})
}

const onSlideChange = (swiper: SwiperType) => {
	updateNavState(swiper)
}

const onSwiperResize = (swiper: SwiperType) => {
	updateNavState(swiper)
}
</script>

<style scoped>
.events-btn-prev.swiper-button-disabled,
.events-btn-next.swiper-button-disabled {
	opacity: 0.2;
	pointer-events: none;
}

/* Center slides when all are visible */
.events-slider :deep(.swiper-locked .swiper-wrapper) {
	justify-content: center;
}
</style>
