<template>
	<div>
		<!-- hero bg -->
		<div
			class="z-0 absolute top-0 left-0 w-full h-[550px] bg-gradient-to-b from-[#131313] to-[#1A1A1A]"
		></div>

		<!-- Hero section -->
		<section class="z-10 relative" aria-label="Hero obchodu">
			<div class="flex flex-col md:flex-row items-center justify-center pt-20 md:pt-32 px-6">
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
							<div v-if="!todaySpecialHours.closed" class="font-black text-plaza-dark">
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
						<div class="border-t border-gray-200 my-3 max-w-[290px] mx-auto"></div>

						<!-- Contact info -->
						<div class="space-y-1 text-sm">
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
import type { Shop, DayOfWeek, SpecialOpeningHours } from '@/shared/types'
import 'swiper/css'

const { t } = useI18n()
const { openModal: openOpeningHoursModal } = useOpeningHoursModal()

// SSR-safe timestamp for hydration
const serverTimestamp = useState<number>('serverTimestamp', () => Date.now())

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
const dayMapping: DayOfWeek[] = [
	'sunday',
	'monday',
	'tuesday',
	'wednesday',
	'thursday',
	'friday',
	'saturday',
]

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

const isToday = (day: DayOfWeek): boolean => {
	const todayIndex = new Date(serverTimestamp.value).getDay()
	return dayMapping[todayIndex] === day
}

const formatTime = (time: string): string => {
	// Converts "09:00" to "9.00"
	const parts = time.split(':')
	const hours = parts[0] || '0'
	const minutes = parts[1] || '00'
	return `${parseInt(hours, 10)}.${minutes}`
}

// === Special opening hours ===
const todaySpecialHours = computed<SpecialOpeningHours | null>(() => {
	if (!props.shop.specialOpeningHours?.length) return null

	const today = new Date(serverTimestamp.value)
	today.setHours(0, 0, 0, 0)
	const todayTime = today.getTime()

	for (const special of props.shop.specialOpeningHours) {
		if (special.date) {
			const specialDate = new Date(special.date)
			specialDate.setHours(0, 0, 0, 0)
			if (specialDate.getTime() === todayTime) {
				return special
			}
		} else if (special.dateFrom && special.dateTo) {
			const from = new Date(special.dateFrom)
			from.setHours(0, 0, 0, 0)
			const to = new Date(special.dateTo)
			to.setHours(23, 59, 59, 999)
			if (todayTime >= from.getTime() && todayTime <= to.getTime()) {
				return special
			}
		}
	}

	return null
})

const specialNote = computed(() => {
	return todaySpecialHours.value?.note || null
})

// === Open status ===
const todayOpeningHours = computed(() => {
	const todayIndex = new Date(serverTimestamp.value).getDay()
	const today = dayMapping[todayIndex] as DayOfWeek

	// If there's a special opening hours for today, use it
	if (todaySpecialHours.value) {
		return {
			open: todaySpecialHours.value.open ?? '09:00',
			close: todaySpecialHours.value.close ?? '21:00',
			closed: todaySpecialHours.value.closed ?? false,
		}
	}

	const hours = props.shop.openingHours?.find((h) => h.day === today)
	if (!hours) return null

	return {
		open: hours.open,
		close: hours.close,
		closed: hours.closed ?? false,
	}
})

const isOpen = computed(() => {
	if (!todayOpeningHours.value || todayOpeningHours.value.closed) return false

	const now = new Date(serverTimestamp.value)
	const currentMinutes = now.getHours() * 60 + now.getMinutes()

	const openParts = todayOpeningHours.value.open.split(':').map(Number)
	const closeParts = todayOpeningHours.value.close.split(':').map(Number)

	const openH = openParts[0] ?? 0
	const openM = openParts[1] ?? 0
	const closeH = closeParts[0] ?? 0
	const closeM = closeParts[1] ?? 0

	const openMinutes = openH * 60 + openM
	const closeMinutes = closeH * 60 + closeM

	return currentMinutes >= openMinutes && currentMinutes < closeMinutes
})

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
