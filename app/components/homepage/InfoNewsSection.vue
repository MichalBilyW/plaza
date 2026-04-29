<template>
	<section
		ref="sectionRef"
		class="relative pb-16 lg:-mt-[50px]"
		:class="
			!newsPending && news.length === 0 ? 'max-md:mt-3' : 'max-md:-mt-[35px]'
		"
	>
		<div class="absolute inset-0"></div>

		<div class="relative z-10 w-full max-w-[840px] mx-auto px-4 sm:px-8 lg:px-12">
			<div
				class="flex max-md:flex-col-reverse items-center justify-center mx-auto max-w-[679px] lg:w-auto"
			>
				<!-- Left side - Info cards -->
				<div
					class="z-20 relative flex flex-col md:text-right md:items-center gap-1.5 md:-mr-2 mt-8 md:mt-0 max-md:mb-4 shrink-0"
				>
					<!-- Počet obchodů -->
					<NuxtLink
						to="/obchody"
						class="max-md:hidden relative group max-md:justify-center font-heading bg-white rounded-lg shadow-lg px-4 md:pl-4 md:pr-12 py-2 md:py-3.5 text-right h-auto w-[250px] md:w-[320px]"
					>
						<span class="font-bold text-plaza text-xl md:text-2xl lg:text-3xl">{{
							animatedShopsCount
						}}</span>
						<span class="text-plaza-dark md:text-xl lg:text-2xl ml-1 lg:ml-1.5">{{
							t('home.infoSection.shops')
						}}</span>
						<svg
							class="w-4 h-4 absolute right-3 top-3.5 md:top-[25px] inline-block -mt-0.5 ml-1 w-5 h-5 opacity-0 md:group-hover:opacity-30 touch:!opacity-30 transition-opacity ease-in-out"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</NuxtLink>

					<!-- Restaurace a kavárny -->
					<NuxtLink
						to="/obchody?kategorie=restaurace-a-kavarny"
						class="max-md:hidden relative group max-md:justify-center font-heading bg-white rounded-lg shadow-lg px-4 md:pl-4 md:pr-12 py-2 md:py-3.5 text-right h-auto w-[250px] md:w-[320px]"
					>
						<span class="font-bold text-plaza text-xl md:text-2xl lg:text-3xl">{{
							animatedRestaurantsCount
						}}</span>
						<span class="text-plaza-dark md:text-xl lg:text-2xl ml-1 lg:ml-1.5">{{
							t('home.infoSection.restaurants')
						}}</span>
						<svg
							class="w-4 h-4 absolute right-3 top-3.5 md:top-[25px] inline-block -mt-0.5 ml-1 w-5 h-5 opacity-0 md:group-hover:opacity-30 touch:!opacity-30 transition-opacity ease-in-out"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</NuxtLink>

					<!-- Parkovací místa -->
					<button
						type="button"
						class="max-md:hidden relative group max-md:justify-center font-heading bg-white rounded-lg shadow-lg px-4 md:pl-4 md:pr-12 py-2 md:py-3.5 text-right h-auto w-[250px] md:w-[320px]"
						@click="openParkingModal"
					>
						<span class="font-bold text-plaza text-xl md:text-2xl lg:text-3xl">{{
							animatedParkingCount
						}}</span>
						<span class="text-plaza-dark md:text-xl lg:text-2xl ml-1 lg:ml-1.5">{{
							t('home.infoSection.parkingSpots')
						}}</span>
						<svg
							class="w-4 h-4 absolute right-3 top-3.5 md:top-[25px] inline-block -mt-0.5 ml-1 w-5 h-5 opacity-0 md:group-hover:opacity-30 touch:!opacity-30 transition-opacity ease-in-out"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</button>

					<div class="flex justify-end w-full text-right">
						<div class="flex flex-col gap-3 md:gap-1.5">
							<!-- Otevírací doba -->
							<button
								type="button"
								class="relative group max-md:justify-center font-heading bg-white max-md:rounded-[5px_20px_5px_5px] md:rounded-xl shadow-lg px-4 md:pl-4 md:pr-12 py-2 md:py-3.5 max-md:text-center md:text-right h-auto w-[290px] md:w-[320px] text-plaza-dark md:text-xl lg:text-2xl hover:bg-gray-50 transition-colors"
								@click="openOpeningHoursModal"
							>
								{{ t('home.infoSection.openingHours') }}
								<svg
									class="w-4 h-4 absolute right-3 top-3.5 md:top-6 inline-block -mt-0.5 ml-1 w-5 h-5 opacity-0 md:group-hover:opacity-30 touch:!opacity-30 transition-opacity ease-in-out"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 5l7 7-7 7"
									/>
								</svg>
							</button>

							<!-- Parkování -->
							<button
								type="button"
								class="md:hidden relative group max-md:justify-center font-heading bg-white max-md:rounded-[5px_20px_5px_5px] md:rounded-xl shadow-lg px-4 md:pl-4 md:pr-12 py-2 md:py-3.5 max-md:text-center md:text-right h-auto w-[290px] md:w-[320px] text-plaza-dark md:text-xl lg:text-2xl hover:bg-gray-50 transition-colors"
								@click="openParkingModal"
							>
								{{ t('home.infoSection.parking') }}
								<svg
									class="w-4 h-4 absolute right-3 top-3.5 md:top-6 inline-block -mt-0.5 ml-1 w-5 h-5 opacity-0 md:group-hover:opacity-30 touch:!opacity-30 transition-opacity ease-in-out"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 5l7 7-7 7"
									/>
								</svg>
							</button>

							<!-- Mapa centra button -->
							<NuxtLink
								to="/mapa"
								class="relative group max-md:justify-center font-heading bg-plaza max-md:rounded-[5px_20px_5px_5px] md:rounded-xl shadow-lg px-4 md:pl-4 md:pr-12 py-2 md:py-3.5 max-md:text-center md:text-right h-auto w-[290px] md:w-[320px] text-white md:text-xl lg:text-2xl transition-all hover:brightness-110"
							>
								{{ t('home.infoSection.mapCenter') }}
								<svg
									class="w-4 h-4 absolute right-3 top-3.5 md:top-6 inline-block -mt-0.5 ml-1 w-5 h-5 opacity-0 md:group-hover:opacity-30 touch:!opacity-30 transition-opacity ease-in-out"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
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
					</div>
				</div>

				<!-- Right side - News slider -->
				<div
					class="z-10 relative flex-1 md:-ml-2 flex flex-col w-[290px] xs:w-[400px] lg:w-[500px]"
					:class="{ 'max-md:hidden': !newsPending && news.length === 0 }"
				>
					<div
						class="group relative w-[290px] xs:w-[400px] h-[290px] xs:h-[400px] lg:w-[500px] lg:h-[500px] rounded-[5px_20px_5px_5px] overflow-hidden shadow-lg touch-pan-y"
						:class="{ 'cursor-pointer': currentNews?.content }"
						role="region"
						:aria-label="t('home.infoSection.newsAlt')"
						aria-roledescription="carousel"
						@click="handleSliderClick"
						@keydown.enter="handleSliderClick"
						@mouseenter="pauseAutoplay"
						@mouseleave="resumeAutoplay"
						@focusin="pauseAutoplay"
						@focusout="resumeAutoplay"
						@touchstart="handleTouchStart"
						@touchmove="handleTouchMove"
						@touchend="handleTouchEnd"
					>
						<!-- Skeleton loader -->
						<div v-if="newsPending" class="absolute inset-0 skeleton-shimmer"></div>

						<!-- News images with crossfade + slide -->
						<Transition :name="slideDirection">
							<img
								v-if="currentNews"
								:key="currentNews._id"
								:src="currentNews.image"
								:alt="currentNews.name || t('home.infoSection.newsAlt')"
								loading="lazy"
								class="news-slide absolute inset-0 w-full h-full object-contain"
								:class="
									currentNews.content
										? 'group-hover:scale-105 transition-transform ease-in-out'
										: ''
								"
							/>
						</Transition>

						<!-- Fallback when no news -->
						<img
							v-if="!newsPending && news.length === 0"
							src="/images/homepage/default-info.jpg"
							:alt="t('home.infoSection.newsAlt')"
							class="w-full h-full object-contain"
						/>

						<!-- Hover badge -->
						<div
							v-if="currentNews?.content"
							class="absolute bottom-6 right-6 md:opacity-90 touch:!opacity-100 group-hover:opacity-100 transition-opacity duration-300 ease-in-out"
						>
							<span
								class="bg-plaza text-white px-4 py-2 rounded-[5px_20px_5px_5px] w-full shadow-lg"
								v-html="t('home.infoSection.showMore')"
							>
							</span>
						</div>
					</div>

					<!-- Navigation arrows -->
					<div
						v-if="news.length > 1"
						class="flex justify-end transparent gap-2 mt-2 w-[290px] xs:w-[400px] lg:w-[500px]"
					>
						<span class="sr-only" aria-live="polite">{{
							t('common.newSlide', {
								current: currentNewsIndex + 1,
								total: news.length,
							})
						}}</span>
						<button
							class="w-10 h-10 rounded-full flex items-center justify-center rounded-full backdrop-blur-xs flex items-center justify-center hover:border transition-all"
							:aria-label="t('home.infoSection.prevNews')"
							@click="prevNews"
						>
							<svg
								class="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M15 19l-7-7 7-7"
								/>
							</svg>
						</button>
						<button
							class="w-10 h-10 rounded-full flex items-center justify-center rounded-full backdrop-blur-xs flex items-center justify-center hover:border transition-all"
							:aria-label="t('home.infoSection.nextNews')"
							@click="nextNews"
						>
							<svg
								class="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 5l7 7-7 7"
								/>
							</svg>
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- News Modal -->
		<UiModal v-model="showNewsModal">
			<div v-if="selectedNews" class="flex flex-col">
				<!-- Image -->
				<!-- <img
					:src="selectedNews.image"
					:alt="selectedNews.name"
					class="w-full h-auto object-contain rounded-[5px_20px_5px_5px] mb-6 px-4 sm:px-8 lg:px28"
				/> -->

				<!-- Content -->
				<div class="px-8 py-10 m2:py-16">
					<div
						class="prose prose-sm max-w-none text-plaza-dark text-sm leading-relaxed overflow-x-auto"
						v-html="sanitize(selectedNews.content)"
					></div>
				</div>
			</div>
		</UiModal>

		<!-- Parking Modal -->
		<ParkingModal />
	</section>
</template>

<script setup lang="ts">
import type { News } from '@/shared/types'

const props = defineProps<{
	shopsCount: number
	restaurantsCount: number
	news: News[]
	newsPending: boolean
}>()

const { t } = useI18n()
const { openModal: openOpeningHoursModal } = useOpeningHoursModal()
const { openModal: openParkingModal } = useParkingModal()
const { sanitize } = useSanitizeHtml()

const PARKING_SPOTS = 490
const AUTOPLAY_INTERVAL = 4000

// === Refs ===
const sectionRef = ref<HTMLElement | null>(null)
const hasAnimated = ref(false)

// === Animated counters ===
const animatedShopsCount = ref(0)
const animatedRestaurantsCount = ref(0)
const animatedParkingCount = ref(0)

// === News slider ===
const currentNewsIndex = ref(0)
const slideDirection = ref<'slide-next' | 'slide-prev'>('slide-next')
let autoplayInterval: ReturnType<typeof setInterval> | null = null

// === News modal ===
const showNewsModal = ref(false)
const selectedNews = ref<News | null>(null)

const currentNews = computed(() => props.news[currentNewsIndex.value] || null)

// === Touch/Swipe handling ===
const SWIPE_THRESHOLD = 50
let touchStartX = 0
let touchStartY = 0
let isSwiping = false

const handleTouchStart = (e: TouchEvent) => {
	const touch = e.touches[0]
	if (!touch) return
	touchStartX = touch.clientX
	touchStartY = touch.clientY
	isSwiping = false
}

const handleTouchMove = (e: TouchEvent) => {
	const touch = e.touches[0]
	if (!touch) return
	const deltaX = Math.abs(touch.clientX - touchStartX)
	const deltaY = Math.abs(touch.clientY - touchStartY)
	// Pokud je horizontální pohyb větší než vertikální, jde o swipe
	if (deltaX > deltaY && deltaX > 10) {
		isSwiping = true
	}
}

const handleTouchEnd = (e: TouchEvent) => {
	const touch = e.changedTouches[0]
	if (!touch) return
	const deltaX = touch.clientX - touchStartX
	if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
		isSwiping = true
		if (deltaX > 0) {
			prevNews()
		} else {
			nextNews()
		}
	}
}

const handleSliderClick = () => {
	// Otevřít modal pouze pokud nešlo o swipe
	if (!isSwiping) {
		openNewsModal()
	}
}

const openNewsModal = () => {
	const news = currentNews.value
	if (news?.content) {
		selectedNews.value = news
		showNewsModal.value = true
	}
}

const resetAutoplay = () => {
	if (autoplayInterval) clearInterval(autoplayInterval)
	autoplayInterval = setInterval(() => {
		if (props.news.length > 1) {
			slideDirection.value = 'slide-next'
			currentNewsIndex.value = (currentNewsIndex.value + 1) % props.news.length
		}
	}, AUTOPLAY_INTERVAL)
}

const pauseAutoplay = () => {
	if (autoplayInterval) {
		clearInterval(autoplayInterval)
		autoplayInterval = null
	}
}

const resumeAutoplay = () => {
	resetAutoplay()
}

const nextNews = () => {
	if (props.news.length === 0) return
	slideDirection.value = 'slide-next'
	currentNewsIndex.value = (currentNewsIndex.value + 1) % props.news.length
	resetAutoplay()
}

const prevNews = () => {
	if (props.news.length === 0) return
	slideDirection.value = 'slide-prev'
	currentNewsIndex.value =
		currentNewsIndex.value === 0 ? props.news.length - 1 : currentNewsIndex.value - 1
	resetAutoplay()
}

// === Count-up animation ===
const animateCount = (target: number, setter: (val: number) => void, duration = 3000) => {
	const startTime = performance.now()
	const animate = (currentTime: number) => {
		const elapsed = currentTime - startTime
		const progress = Math.min(elapsed / duration, 1)
		const eased = 1 - Math.pow(1 - progress, 4) // easeOutQuart
		setter(Math.round(target * eased))
		if (progress < 1) requestAnimationFrame(animate)
	}
	requestAnimationFrame(animate)
}

const startCountAnimation = () => {
	if (hasAnimated.value) return
	hasAnimated.value = true
	animateCount(props.shopsCount, (v) => (animatedShopsCount.value = v))
	animateCount(props.restaurantsCount, (v) => (animatedRestaurantsCount.value = v))
	animateCount(PARKING_SPOTS, (v) => (animatedParkingCount.value = v))
}

// === Lifecycle ===
onMounted(() => {
	if (!sectionRef.value) return

	// Start autoplay
	resetAutoplay()

	// Spustit animaci čísel ihned po načtení
	startCountAnimation()
})

onUnmounted(() => {
	if (autoplayInterval) clearInterval(autoplayInterval)
})

// Re-animate when props change
watch(
	() => [props.shopsCount, props.restaurantsCount],
	() => {
		if (hasAnimated.value) {
			animateCount(props.shopsCount, (v) => (animatedShopsCount.value = v))
			animateCount(props.restaurantsCount, (v) => (animatedRestaurantsCount.value = v))
		}
	},
)
</script>

<style scoped>
.news-slide {
	will-change: transform, opacity;
}

/* Slide vpřed (next / autoplay) */
.slide-next-enter-active,
.slide-next-leave-active,
.slide-prev-enter-active,
.slide-prev-leave-active {
	transition:
		opacity 500ms ease,
		transform 500ms cubic-bezier(0.22, 1, 0.36, 1);
}

.slide-next-enter-from {
	opacity: 0;
	transform: translateX(8%);
}
.slide-next-leave-to {
	opacity: 0;
	transform: translateX(-8%);
}

/* Slide vzad (prev) */
.slide-prev-enter-from {
	opacity: 0;
	transform: translateX(-8%);
}
.slide-prev-leave-to {
	opacity: 0;
	transform: translateX(8%);
}
</style>
