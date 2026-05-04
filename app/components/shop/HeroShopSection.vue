<template>
	<div>
		<!-- hero bg -->
		<div
			class="z-0 absolute top-0 left-0 w-full h-[550px] bg-gradient-to-b from-[#131313] to-[#1A1A1A]"
		></div>

		<!-- Hero section -->
		<section class="z-10 relative" aria-label="Hero obchodu">
			<div
				class="flex flex-col md:flex-row items-center justify-center pt-20 md:pt-32 px-3 sm:px-6"
			>
				<!-- Info Card (left on desktop, bottom on mobile) -->
				<div
					class="order-2 md:order-1 w-full max-w-[290px] md:max-w-[380px] max-md:-mt-8 z-20"
				>
					<div class="bg-white rounded-[5px_20px_5px_5px] shadow-lg p-6 lg:p-8">
						<!-- Logo -->
						<div class="flex justify-center mb-4">
							<div class="h-[80px] flex items-center justify-center">
								<img
									v-if="shop.logo"
									:src="shop.logo"
									:alt="shop.name"
									class="max-h-full max-w-[150px] object-contain"
								/>
								<span
									v-else
									class="text-4xl font-bold text-plaza-dark font-heading"
								>
									{{ shop.name }}
								</span>
							</div>
						</div>

						<!-- Open status with special hours tooltip -->
						<div class="flex items-center justify-center gap-1.5 mb-6">
							<span
								:class="isOpen ? 'text-plaza-success' : 'text-plaza'"
								class="text-[16px]"
								aria-hidden="true"
								>●</span
							>
							<span>
								{{ isOpen ? t('common.openStatus') : t('common.closedStatus') }}
							</span>
							<!-- Special hours tooltip -->
							<span v-if="specialNote" class="relative group">
								<span
									class="inline-flex items-center justify-center cursor-help"
									:aria-label="t('common.specialHoursInfo')"
								>
									<svg
										class="w-4 h-4 text-plaza-gray"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										aria-hidden="true"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
								</span>
								<div
									role="tooltip"
									class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-plaza-dark text-white text-sm rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50"
								>
									{{ specialNote }}
									<div
										class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-plaza-dark"
									></div>
								</div>
							</span>
						</div>

						<!-- Special opening hours today (when active) -->
						<div v-if="todaySpecialHours" class="mb-2 text-center">
							<div class="text-sm text-plaza-gray mb-1">
								{{ t('common.specialOpeningHoursToday') }}
							</div>
							<!-- Only show time if not closed (closed status is already shown above) -->
							<div
								v-if="!todaySpecialHours.closed"
								class="font-black text-plaza-dark"
							>
								{{ formatTime(todaySpecialHours.open || '09:00') }} -
								{{ formatTime(todaySpecialHours.close || '21:00') }}
							</div>
							<button
								type="button"
								class="mt-2 text-sm text-plaza-gray underline hover:text-plaza-dark transition-colors cursor-pointer"
								@click="openOpeningHoursModal"
							>
								{{ t('shopDetail.showRegularOpeningHours') }}
							</button>
						</div>

						<!-- Opening hours table (only when no special hours today) -->
						<div v-else-if="shop.openingHours?.length" class="mb-2">
							<div
								v-for="(entry, index) in shop.openingHours"
								:key="entry.day"
								class="flex justify-between p-1 border-b border-gray-100 last:border-0"
								:class="{
									'font-black': isToday(entry.day),
									'opacity-70 text-sm': !isToday(entry.day),
									'bg-plaza-light/20 rounded-xl': index % 2 !== 0,
								}"
							>
								<span class="text-plaza-dark">{{ getDayName(entry.day) }}</span>
								<span class="text-plaza-dark">
									<template v-if="entry.closed">
										{{ t('common.closed') }}
									</template>
									<template v-else>
										{{ formatTime(entry.open) }} - {{ formatTime(entry.close) }}
									</template>
								</span>
							</div>
						</div>

						<!-- Separator -->
						<div
							v-if="
								todaySpecialHours ||
								shop.openingHours?.length ||
								shop.website ||
								shop.email ||
								shop.phone
							"
							class="border-t border-gray-200 my-3 max-w-[290px] mx-auto"
						></div>

						<!-- Contact info -->
						<div class="px-1 space-y-1 text-sm">
							<div v-if="shop.website" class="flex justify-between">
								<span class="text-plaza-gray">web</span>
								<a
									:href="normalizeUrl(shop.website)"
									target="_blank"
									rel="noopener noreferrer"
									class="text-plaza hover:underline"
									@click="trackContactClick('website', shop.name)"
								>
									{{ stripProtocol(shop.website) }}
								</a>
							</div>
							<div v-if="shop.email" class="flex justify-between">
								<span class="text-plaza-gray">email</span>
								<a
									:href="`mailto:${shop.email}`"
									class="text-plaza hover:underline"
									@click="trackContactClick('email', shop.name)"
								>
									{{ shop.email }}
								</a>
							</div>
							<div v-if="shop.phone" class="flex justify-between">
								<span class="text-plaza-gray">telefon</span>
								<a
									:href="`tel:${shop.phone.replace(/\\s/g, '')}`"
									class="text-plaza hover:underline"
									@click="trackContactClick('phone', shop.name)"
								>
									{{ shop.phone }}
								</a>
							</div>
						</div>

						<!-- Separator -->
						<div
							v-if="shop.socialLinks?.facebook || shop.socialLinks?.instagram"
							class="border-t border-gray-200 my-3 max-w-[290px] mx-auto"
						></div>

						<!-- Sociální sítě -->
						<div
							v-if="shop.socialLinks?.facebook || shop.socialLinks?.instagram"
							class="flex justify-center gap-3 px-1"
						>
							<a
								v-if="shop.socialLinks?.facebook"
								:href="shop.socialLinks.facebook"
								target="_blank"
								rel="noopener noreferrer"
								class="w-8 h-8 bg-plaza-dark rounded-full flex items-center justify-center hover:bg-plaza transition-colors"
								aria-label="Facebook"
							>
								<svg
									class="w-4 h-4 text-white"
									fill="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
									/>
								</svg>
							</a>
							<a
								v-if="shop.socialLinks?.instagram"
								:href="shop.socialLinks.instagram"
								target="_blank"
								rel="noopener noreferrer"
								class="w-8 h-8 bg-plaza-dark rounded-full flex items-center justify-center hover:bg-plaza transition-colors"
								aria-label="Instagram"
							>
								<svg
									class="w-4 h-4 text-white"
									fill="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
									/>
								</svg>
							</a>
						</div>
					</div>
				</div>

				<!-- Gallery (right on desktop, top on mobile) -->
				<div
					class="w-full max-md:max-h-[350px] md:w-[500px] lg:w-[650px] aspect-[29/24] md:aspect-auto md:h-[400px] lg:h-[600px] order-1 md:order-2 shadow-lg md:-ml-10"
				>
					<div class="relative h-full rounded-[5px_20px_5px_5px] overflow-hidden">
						<!-- Border overlay -->
						<div
							class="absolute top-0 left-0 w-[calc(100%-16px)] h-[calc(100%-16px)] md:w-[calc(100%-32px)] md:h-[calc(100%-32px)] bg-transparent m-2 md:m-4 border md:border-2 border-white/70 rounded-[5px_20px_5px_5px] z-10 pointer-events-none"
							aria-hidden="true"
						></div>

						<!-- Single image or gallery skeleton -->
						<div v-if="pending" class="w-full h-full skeleton-shimmer"></div>

						<!-- Gallery Swiper -->
						<div
							v-else-if="galleryImages.length > 1"
							class="relative h-full shop-gallery-slider"
						>
							<Swiper
								:modules="[Autoplay]"
								:slides-per-view="1"
								:space-between="0"
								:loop="true"
								:grab-cursor="true"
								:autoplay="{ delay: 3000, disableOnInteraction: false }"
								class="w-full h-full"
								@swiper="onSwiperInit"
							>
								<SwiperSlide v-for="(image, index) in galleryImages" :key="index">
									<img
										:src="image"
										:alt="`${shop.name} - obrázek ${index + 1}`"
									loading="eager"
										:fetchpriority="index === 0 ? 'high' : 'auto'"
										class="w-full h-full object-cover"
									/>
								</SwiperSlide>
							</Swiper>

							<!-- Navigation arrow -->
							<button
								type="button"
								class="absolute right-4 md:right-6 bottom-10 md:bottom-6 z-20 w-10 h-10 rounded-full bg-plaza-dark/50 backdrop-blur-xs flex items-center justify-center hover:bg-white/20 transition-colors"
								:aria-label="t('shopDetail.nextImage')"
								@click="slideNext"
							>
								<svg
									class="w-4 h-4 text-white"
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

						<!-- Single image -->
						<img
							v-else-if="galleryImages.length === 1"
							:src="galleryImages[0]"
							:alt="shop.name"
							loading="eager"
							fetchpriority="high"
							class="w-full h-full object-cover"
						/>

						<!-- Placeholder -->
						<div
							v-else
							class="w-full h-full bg-plaza-light flex items-center justify-center"
						>
							<svg
								class="w-16 h-16 text-plaza-gray"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
								/>
							</svg>
						</div>
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import type { Shop, DayOfWeek } from '@/shared/types'
import 'swiper/css'

const { t } = useI18n()
const { openModal: openOpeningHoursModal } = useOpeningHoursModal()

const props = defineProps<{
	shop: Shop
	pending?: boolean
}>()

// === Gallery ===
const galleryImages = computed(() => {
	const images: string[] = []
	if (props.shop.gallery?.length) {
		images.push(...props.shop.gallery)
	}
	return images
})

// === Swiper ===
const swiperInstance = ref<SwiperType | null>(null)

const onSwiperInit = (swiper: SwiperType) => {
	swiperInstance.value = swiper
}

const slideNext = () => {
	if (swiperInstance.value) {
		swiperInstance.value.slideNext()
		trackGalleryInteraction('slide_next', 'shop_detail', swiperInstance.value.realIndex)
	}
}

// === Opening hours logic ===
const dayNames: Record<DayOfWeek, string> = {
	monday: 'Pondělí',
	tuesday: 'Úterý',
	wednesday: 'Středa',
	thursday: 'Čtvrtek',
	friday: 'Pátek',
	saturday: 'Sobota',
	sunday: 'Neděle',
}

const getDayName = (day: DayOfWeek): string => dayNames[day]

const { todaySpecialHours, isOpen, specialNote, isToday } = useOpeningHoursStatus(
	() => props.shop.openingHours,
	() => props.shop.specialOpeningHours,
)

const formatTime = (time: string): string => {
	// Converts "09:00" to "9.00"
	const parts = time.split(':')
	const hours = parts[0] || '0'
	const minutes = parts[1] || '00'
	return `${parseInt(hours, 10)}.${minutes}`
}

// === URL helpers ===
const normalizeUrl = (url: string): string => {
	if (!url) return ''
	if (url.startsWith('http://') || url.startsWith('https://')) return url
	return `https://${url}`
}

const stripProtocol = (url: string): string => {
	return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

// DataLayer tracking
const { trackContactClick, trackGalleryInteraction } = useDataLayer()
</script>
