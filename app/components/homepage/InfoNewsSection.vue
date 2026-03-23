<template>
	<section ref="sectionRef" class="relative py-12 lg:py-16 -mt-[110px]">
		<div class="absolute inset-0"></div>

		<div class="relative z-10 w-full max-w-[840px] mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex max-md:flex-col-reverse items-center justify-center md:flex-row mx-auto max-w-[679px] lg:w-auto">
				<!-- Left side - Info cards -->
				<div class="z-20 relative md:-mr-2 mt-8 md:-mt-12 flex md:flex-col md:text-right max-md:items-stretch max-md:justify-center md:items-end gap-y-3 gap-x-1.5 md:gap-1.5 max-md:flex-wrap md:shrink-0">
					<!-- Počet obchodů -->
					<NuxtLink to="/" class="relative group max-md:flex max-md:flex-col max-md:text-center max-md:justify-center bg-white rounded-lg shadow-lg px-6 md:px-10 py-2 md:py-3.5 text-right h-auto max-w-[200px] xs:max-w-full w-full xs:w-[250px] md:w-[295px]">
						<span class="text-plaza text-2xl lg:text-2xl font-bold">{{
							animatedShopsCount
						}}</span>
						<span class="text-plaza-dark text-lg lg:text-xl ml-1">{{
							t('home.infoSection.shops')
						}}</span>
						<svg class="opacity-30 absolute right-3 md:top-6 max-md:top-1/2 max-md:transform max-md:-translate-y-1/2 inline-block ml-1 w-5 h-5 opacity-100 md:opacity-0 md:group-hover:opacity-30 transition-opacity ease-in-out" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							<path d="M11 15L14 12L11 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</NuxtLink>

					<!-- Restaurace a kavárny -->
					<NuxtLink class="relative group max-md:flex max-md:flex-col max-md:text-center max-md:justify-center bg-white rounded-lg shadow-lg px-6 md:px-10 py-2 md:py-3.5 text-right h-auto max-w-[200px] xs:max-w-full w-full xs:w-[250px] md:w-[295px]">
						<span class="text-plaza text-2xl lg:text-2xl font-bold">{{
							animatedRestaurantsCount
						}}</span>
						<span class="text-plaza-dark text-lg lg:text-xl ml-1">{{
							t('home.infoSection.restaurants')
						}}</span>
						<svg class="opacity-30 absolute right-3 md:top-6 max-md:top-1/2 max-md:transform max-md:-translate-y-1/2 inline-block ml-1 w-5 h-5 opacity-100 md:opacity-0 md:group-hover:opacity-30 transition-opacity ease-in-out" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							<path d="M11 15L14 12L11 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</NuxtLink>

					<!-- Parkovací místa -->
					<NuxtLink class="relative group max-md:flex max-md:flex-col max-md:text-center max-md:justify-center bg-white rounded-lg shadow-lg px-6 md:px-10 py-2 md:py-3.5 text-right h-auto max-w-[200px] xs:max-w-full w-full xs:w-[250px] md:w-[295px]">
						<span class="text-plaza text-2xl lg:text-2xl font-bold">{{
							animatedParkingCount
						}}</span>
						<span class="text-plaza-dark text-lg lg:text-xl ml-1">{{
							t('home.infoSection.parkingSpots')
						}}</span>
						<svg class="opacity-30 absolute right-3 md:top-6 max-md:top-1/2 max-md:transform max-md:-translate-y-1/2 inline-block ml-1 w-5 h-5 opacity-100 md:opacity-0 md:group-hover:opacity-30 transition-opacity ease-in-out" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							<path d="M11 15L14 12L11 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</NuxtLink>

					<!-- Otevírací doba -->
					<NuxtLink
						to="/o-nas#oteviraci-doba"
						class="relative group max-md:flex max-md:flex-col max-md:text-center max-md:justify-center bg-white rounded-lg shadow-lg px-6 md:px-10 py-2 md:py-3.5 text-right h-auto max-w-[200px] xs:max-w-full w-full xs:w-[250px] md:w-[295px] text-plaza-dark text-lg lg:text-xl hover:bg-gray-50 transition-colors"
					>
						{{ t('home.infoSection.openingHours') }}
						<svg class="opacity-30 absolute right-3 md:top-5 max-md:top-1/2 max-md:transform max-md:-translate-y-1/2 inline-block ml-1 w-5 h-5 opacity-100 md:opacity-0 md:group-hover:opacity-30 transition-opacity ease-in-out" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							<path d="M11 15L14 12L11 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</NuxtLink>

					<!-- Mapa centra button -->
					<NuxtLink
						to="/mapa"
						class="relative group max-md:flex max-md:flex-col max-md:text-center max-md:justify-center bg-plaza hover:bg-plaza/90 text-white rounded-lg shadow-lg px-6 md:px-10 py-2 md:py-3.5 text-right h-auto max-md:mt-4 w-full max-w-[330px] xs:max-w-[410px] md:w-[295px] text-lg lg:text-xl font-semibold transition-colors"
					>
						{{ t('home.infoSection.mapCenter') }}
						<svg class="opacity-30 absolute right-3 md:top-5 max-md:top-1/2 max-md:transform max-md:-translate-y-1/2 inline-block ml-1 w-5 h-5 opacity-100 md:opacity-0 md:group-hover:opacity-30 transition-opacity ease-in-out" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							<path d="M11 15L14 12L11 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</NuxtLink>
				</div>

				<!-- Right side - News slider -->
				<div class="z-10 relative flex-1 md:-ml-2 flex flex-col w-[290px] xs:w-[400px] lg:w-[500px]">
					<div
						class="group relative w-[290px] xs:w-[400px] h-[290px] xs:h-[400px] lg:w-[500px] lg:h-[500px] rounded-[5px_20px_5px_5px] overflow-hidden shadow-lg touch-pan-y"
						:class="{ 'cursor-pointer': currentNews?.content }"
						@click="handleSliderClick"
						@touchstart="handleTouchStart"
						@touchmove="handleTouchMove"
						@touchend="handleTouchEnd"
					>
						<!-- Skeleton loader -->
						<div v-if="newsPending" class="absolute inset-0 skeleton-shimmer"></div>

						<!-- News images with crossfade -->
						<img
							v-for="(item, index) in news"
							:key="item._id"
							:src="item.image"
							:alt="t('home.infoSection.newsAlt')"
							loading="lazy"
							class="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out"
							:class="index === currentNewsIndex ? 'opacity-100' : 'opacity-0'"
						/>

						<!-- Fallback when no news -->
						<img
							v-if="!newsPending && news.length === 0"
							src="/images/homepage/default-hero.jpg"
							:alt="t('home.infoSection.newsAlt')"
							class="w-full h-full object-cover"
						/>

						<!-- Hover badge -->
						<div
							v-if="currentNews?.content"
							class="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
						>
							<span class="bg-white text-plaza-dark px-4 py-2 rounded-lg font-semibold shadow-lg">
								Zobrazit více
							</span>
						</div>
					</div>

					<!-- Navigation arrows -->
					<div v-if="news.length > 1" class="flex justify-end transparent gap-2 mt-2 w-[290px] xs:w-[400px] lg:w-[500px]">
						<button
							class="w-10 h-10 rounded-full border-2 flex items-center justify-center hover:bg-gray-100 transition-colors"
							:aria-label="t('home.infoSection.prevNews')"
							@click="prevNews"
						>
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
									d="M15 19l-7-7 7-7"
								/>
							</svg>
						</button>
						<button
							class="w-10 h-10 rounded-full border-2 flex items-center justify-center hover:bg-gray-100 transition-colors"
							:aria-label="t('home.infoSection.nextNews')"
							@click="nextNews"
						>
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
					class="w-full h-auto object-contain rounded-[5px_20px_5px_5px] mb-6 px-4 sm:px-6 lg:px-8"
				/> -->

				<!-- Content -->
				<div class="px-6 py-10 md:py-16">
					<div
						class="prose prose-sm max-w-none text-plaza-dark text-sm leading-relaxed"
						v-html="selectedNews.content"
					></div>
				</div>
			</div>
		</UiModal>
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
const PARKING_SPOTS = 500
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
			currentNewsIndex.value = (currentNewsIndex.value + 1) % props.news.length
		}
	}, AUTOPLAY_INTERVAL)
}

const nextNews = () => {
	if (props.news.length === 0) return
	currentNewsIndex.value = (currentNewsIndex.value + 1) % props.news.length
	resetAutoplay()
}

const prevNews = () => {
	if (props.news.length === 0) return
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

	// IntersectionObserver pro animaci čísel
	const observer = new IntersectionObserver(
		(entries) => {
			const entry = entries[0]
			if (entry && entry.isIntersecting) {
				startCountAnimation()
				observer.disconnect()
			}
		},
		{ threshold: 0.3 },
	)
	observer.observe(sectionRef.value)
	onUnmounted(() => observer.disconnect())
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
