<template>
	<div class="min-h-screen">
		<!-- Dark header -->
		<div
			v-if="generalInfo?.title || generalInfo?.shortText"
			class="bg-gradient-to-b from-[#131313] to-[#1A1A1A] pt-[80px] lg:pt-[160px] pb-[320px]"
		>
			<div class="container mx-auto text-center text-white ">
				<h1 v-if="generalInfo?.title" class="font-heading font-bold text-3xl md:text-4xl uppercase">
					{{ generalInfo.title }}
				</h1>
				<h2 v-if="generalInfo?.shortText" class="text-2xl md:text-3xl">
					{{ generalInfo.shortText }}
				</h2>
			</div>
		</div>

		<!-- Galerie -->
		<section
			v-if="!pending && generalInfo?.gallery?.length"
			class="container-small -mt-[280px] px-4 mb-12"
		>
			<div class="relative rounded-[5px_20px_5px_5px] overflow-hidden shadow-lg">
				<!-- Border overlay -->
				<div
					class="absolute top-0 left-0 w-[calc(100%-16px)] h-[calc(100%-16px)] md:w-[calc(100%-32px)] md:h-[calc(100%-32px)] bg-transparent m-2 md:m-4 border md:border-2 border-white/70 rounded-[5px_20px_5px_5px] z-10 pointer-events-none"
					aria-hidden="true"
				></div>

				<!-- Gallery Swiper -->
				<Swiper
					v-if="generalInfo.gallery.length > 1"
					:modules="[SwiperAutoplay]"
					:slides-per-view="1"
					:space-between="0"
					:loop="true"
					:grab-cursor="true"
					:autoplay="{ delay: 3000, disableOnInteraction: false }"
					class="w-full aspect-[16/9]"
					@swiper="onSwiperInit"
				>
					<SwiperSlide v-for="(image, index) in generalInfo.gallery" :key="index">
						<img
							:src="image"
							:alt="`${t('aboutPage.galleryImage')} ${index + 1}`"
							class="w-full h-full object-cover"
						/>
					</SwiperSlide>
				</Swiper>

				<!-- Single image -->
				<img
					v-else
					:src="generalInfo.gallery[0]"
					:alt="`${t('aboutPage.galleryImage')} 1`"
					class="w-full aspect-[16/9] object-cover"
				/>

				<!-- Navigation arrow -->
				<button
					v-if="generalInfo.gallery.length > 1"
					type="button"
					class="absolute right-4 md:right-6 bottom-4 md:bottom-6 z-20 w-10 h-10 rounded-full border-2 border-white/50 bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
					:aria-label="t('aboutPage.nextImage')"
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
		</section>

		<!-- Sekce Parkování -->
		<ONasParkingSection :general-info="generalInfo" :pending="pending" />

		<!-- Sekce Kontakty -->
		<ONasContactsSection :contacts="generalInfo?.contacts" :pending="pending" />

		<!-- Content area -->
		<div class="container-small px-4 py-12">
			<!-- Loading skeleton -->
			<div v-if="pending" class="space-y-8">
				<div class="animate-pulse">
					<div class="h-8 bg-plaza-light rounded w-1/3 mb-4"></div>
					<div class="h-4 bg-plaza-light rounded w-full mb-2"></div>
					<div class="h-4 bg-plaza-light rounded w-2/3"></div>
				</div>
			</div>

			<div v-else class="space-y-12">
				<!-- Text / Ostatní informace -->
				<section v-if="generalInfo?.text" class="prose prose-lg max-w-none">
					<div v-html="sanitize(generalInfo.text)"></div>
				</section>
			</div>
		</div>

		<!-- Content area (pokračování) -->
		<div class="container-small px-4 py-12">
			<div v-if="!pending" class="space-y-12">
				<!-- Otevírací doba -->
				<section id="oteviraci-doba" class="max-w-2xl mx-auto scroll-mt-32">
					<h2
						class="font-heading font-black text-2xl md:text-3xl text-plaza-dark mb-8 text-center"
					>
						{{ t('aboutPage.openingHours') }}
					</h2>

					<!-- Běžná otevírací doba -->
					<div
						v-if="generalInfo?.openingHours?.length"
						class="bg-white rounded-[5px_20px_5px_5px] shadow-lg p-6 mb-6"
					>
						<div class="space-y-3">
							<div
								v-for="entry in generalInfo.openingHours"
								:key="entry.day"
								class="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
							>
								<span class="font-medium text-plaza-dark">
									{{ t(`aboutPage.days.${entry.day}`) }}
								</span>
								<span v-if="entry.closed" class="text-plaza">
									{{ t('aboutPage.closed') }}
								</span>
								<span v-else class="text-plaza-gray">
									{{ entry.open }} – {{ entry.close }}
								</span>
							</div>
						</div>
					</div>

					<!-- Speciální otevírací doba -->
					<div
						v-if="activeSpecialHours.length"
						class="bg-plaza-light/30 rounded-[5px_20px_5px_5px] p-6"
					>
						<h3 class="font-heading font-black text-lg text-plaza-dark mb-4">
							{{ t('aboutPage.specialOpeningHours') }}
						</h3>
						<div class="space-y-3">
							<div
								v-for="(entry, index) in activeSpecialHours"
								:key="index"
								class="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-200 last:border-0"
							>
								<div
									class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3"
								>
									<span class="font-medium text-plaza-dark">
										{{ formatSpecialDate(entry) }}
									</span>
									<span v-if="entry.note" class="text-sm text-plaza-gray">
										({{ entry.note }})
									</span>
								</div>
								<span v-if="entry.closed" class="text-plaza font-medium">
									{{ t('aboutPage.closed') }}
								</span>
								<span v-else class="text-plaza-gray">
									{{ entry.open }} – {{ entry.close }}
								</span>
							</div>
						</div>
					</div>
				</section>

				<!-- Sociální sítě -->
				<section v-if="generalInfo?.facebook || generalInfo?.instagram" class="text-center py-12">
					<h2 class="font-heading font-black text-2xl md:text-3xl text-plaza-dark mb-6">
						{{ t('aboutPage.followUs') }}
					</h2>
					<div class="flex justify-center gap-4">
						<a
							v-if="generalInfo?.facebook"
							:href="generalInfo.facebook"
							target="_blank"
							rel="noopener noreferrer"
							class="w-14 h-14 bg-plaza-dark rounded-full flex items-center justify-center hover:bg-plaza transition-colors"
							aria-label="Facebook"
						>
							<svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
								<path
									d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
								/>
							</svg>
						</a>
						<a
							v-if="generalInfo?.instagram"
							:href="generalInfo.instagram"
							target="_blank"
							rel="noopener noreferrer"
							class="w-14 h-14 bg-plaza-dark rounded-full flex items-center justify-center hover:bg-plaza transition-colors"
							aria-label="Instagram"
						>
							<svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
								<path
									d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
								/>
							</svg>
						</a>
					</div>
				</section>

				<!-- Služby centra -->
				<section
					v-if="services.length"
					class="bg-gradient-to-b from-[#131313] to-[#1A1A1A] rounded-[5px_20px_5px_5px] px-4 py-12 md:px-8 lg:px-16"
				>
					<div class="max-w-5xl mx-auto">
						<h2
							class="font-heading font-black text-white text-2xl md:text-3xl mb-8 text-center uppercase"
						>
							{{ t('aboutPage.services') }}
						</h2>
						<div class="flex flex-wrap justify-center items-center gap-8">
							<div
								v-for="service in services"
								:key="service._id"
								class="flex flex-col items-center justify-between text-center group bg-white rounded-[5px_20px_5px_5px] p-4 w-[200px] h-[160px] hover:bg-white/90 transition-colors"
								:class="{ 'cursor-pointer': service.description }"
								@click="service.description && openServiceModal(service)"
							>
								<div
									class="w-16 h-16 md:w-20 md:h-20 mb-3 flex items-center justify-center"
								>
									<img
										:src="service.icon"
										:alt="service.shortDescription"
										loading="lazy"
										class="max-w-full max-h-full object-contain"
									/>
								</div>
								<p class="text-sm text-plaza-dark text-xl">
									{{ service.shortDescription }}
								</p>
							</div>
						</div>
					</div>
				</section>

				<!-- Kudy k nám -->
				<section class="max-w-5xl mx-auto py-12">
					<h2
						class="font-heading text-2xl md:text-3xl text-plaza-dark mb-8 text-center uppercase"
					>
						<span class="font-black">{{ t('aboutPage.howToFindUsFirst') }}</span>
						{{ t('aboutPage.howToFindUsRest') }}
					</h2>

					<div class="flex flex-col md:flex-row items-center gap-6 md:gap-0">
						<!-- Doprava info -->
						<div
							class="bg-white rounded-[5px_20px_5px_5px] shadow-lg p-6 md:p-8 h-full md:w-[360px] md:z-10 md:-mr-12 flex flex-col justify-center"
						>
							<!-- Autobus -->
							<div class="flex items-start gap-4 mb-6">
								<div
									class="w-12 h-12 flex-shrink-0 flex items-center justify-center"
								>
									<svg
										class="w-10 h-10 text-plaza-dark"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										stroke-width="1.5"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M8 17h.01M16 17h.01M4 6h16M4 6a2 2 0 012-2h12a2 2 0 012 2M4 6v11a2 2 0 002 2h1m10 0h1a2 2 0 002-2V6M7 19v2m10-2v2M8 10h.01M16 10h.01M12 10h.01M8 13h8"
										/>
									</svg>
								</div>
								<div>
									<p class="text-plaza-dark font-medium mb-1">
										{{ t('aboutPage.busStop') }}
									</p>
									<a
										href="https://idos.cz"
										target="_blank"
										rel="noopener noreferrer"
										class="text-plaza hover:underline font-medium"
									>
										{{ t('aboutPage.busSchedule') }}
									</a>
								</div>
							</div>

							<!-- Auto -->
							<div class="flex items-start gap-4">
								<div
									class="w-12 h-12 flex-shrink-0 flex items-center justify-center"
								>
									<svg
										class="w-10 h-10 text-plaza-dark"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										stroke-width="1.5"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
										/>
									</svg>
								</div>
								<div>
									<p class="text-plaza-dark font-medium mb-1">
										{{ t('aboutPage.byCarInfo') }}
									</p>
									<a href="#" class="text-plaza hover:underline font-medium">
										{{ t('aboutPage.parkingPrices') }}
									</a>
								</div>
							</div>
						</div>

						<!-- Mapa -->
						<div
							class="relative w-full md:flex-1 rounded-[5px_20px_5px_5px] overflow-hidden shadow-lg h-[350px] md:h-auto md:min-h-[400px]"
						>
							<iframe
								src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d1261.6715738952503!2d15.0605088!3d50.7692122!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1scs!2scz"
								class="absolute inset-0 w-full h-full border-0"
								allowfullscreen
								loading="lazy"
								referrerpolicy="no-referrer-when-downgrade"
								:title="t('aboutPage.mapTitle')"
							></iframe>

							<!-- Tlačítko otevřít mapu -->
							<a
								href="https://maps.google.com/?q=OC+Plaza+Liberec,+Palachova+1404,+460+01+Liberec"
								target="_blank"
								rel="noopener noreferrer"
								class="absolute bottom-4 right-4 md:bottom-6 md:right-16 inline-flex items-center gap-2 bg-plaza text-white font-heading font-bold px-5 py-3 rounded-[5px_15px_5px_5px] shadow-lg hover:bg-plaza-dark transition-colors"
							>
								{{ t('aboutPage.openInMaps') }}
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
										d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
									/>
								</svg>
							</a>
						</div>
					</div>
				</section>
			</div>
		</div>

		<!-- Service Modal -->
		<ServiceModal />
	</div>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay as SwiperAutoplay } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import type { GeneralInfo, Service, SpecialOpeningHours } from '@/shared/types'
import 'swiper/css'

const { t } = useI18n()
const { sanitize } = useSanitizeHtml()
const { openModal: openServiceModal } = useServiceModal()

// SSR-safe timestamp for hydration
const serverTimestamp = useState<number>('serverTimestamp', () => Date.now())

usePlazaSeo({
	title: t('seo.about.title'),
	description: t('seo.about.description'),
})

// === Gallery Swiper ===
const swiperInstance = ref<SwiperType | null>(null)

const onSwiperInit = (swiper: SwiperType) => {
	swiperInstance.value = swiper
}

const slideNext = () => {
	swiperInstance.value?.slideNext()
}

// Fetch general info
const { data: generalInfo, pending } = useFetch<GeneralInfo>('/api/general-info', {
	key: 'about-general-info',
})

// Fetch services
const { data: servicesData } = useFetch<{ data: Service[] }>('/api/services', {
	key: 'about-services',
	query: { isActive: true, limit: 100 },
})

const services = computed(() => servicesData.value?.data || [])

// Filter active special opening hours (future or current)
const activeSpecialHours = computed(() => {
	if (!generalInfo.value?.specialOpeningHours) return []

	const today = new Date(serverTimestamp.value)
	today.setHours(0, 0, 0, 0)

	return generalInfo.value.specialOpeningHours.filter((entry) => {
		if (entry.date) {
			return new Date(entry.date) >= today
		}
		if (entry.dateTo) {
			return new Date(entry.dateTo) >= today
		}
		if (entry.dateFrom) {
			return new Date(entry.dateFrom) >= today
		}
		return false
	})
})

// Format special date for display
const formatSpecialDate = (entry: SpecialOpeningHours): string => {
	const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' }

	if (entry.date) {
		return new Date(entry.date).toLocaleDateString('cs-CZ', options)
	}

	if (entry.dateFrom && entry.dateTo) {
		const from = new Date(entry.dateFrom).toLocaleDateString('cs-CZ', options)
		const to = new Date(entry.dateTo).toLocaleDateString('cs-CZ', options)
		return `${from} – ${to}`
	}

	return ''
}
</script>

<style scoped>
.prose :deep(h3) {
	@apply font-heading font-black text-lg text-plaza-dark mt-6 mb-3;
}

.prose :deep(p) {
	@apply text-plaza-gray mb-4;
}

.prose :deep(ul),
.prose :deep(ol) {
	@apply text-plaza-gray mb-4 pl-6;
}

.prose :deep(li) {
	@apply mb-2;
}

.prose :deep(a) {
	@apply text-plaza hover:underline;
}

.prose :deep(table) {
	@apply w-full border-collapse rounded-[5px_20px_5px_5px] overflow-hidden shadow-lg my-8;
}

.prose :deep(table) p {
	@apply pb-0 mb-0;
}

.prose :deep(thead) {
	@apply bg-plaza-dark text-white;
}

.prose :deep(th) {
	@apply px-4 py-3 text-left font-heading font-semibold text-sm uppercase tracking-wide;
}

.prose :deep(tbody tr) {
	@apply border-b border-gray-100 last:border-0;
}

.prose :deep(tbody tr:nth-child(even)) {
	@apply bg-gray-50;
}

.prose :deep(td) {
	@apply px-4 py-3 text-plaza-dark;
}

.prose :deep(tbody tr:hover) {
	@apply bg-plaza-light/30;
}
</style>
