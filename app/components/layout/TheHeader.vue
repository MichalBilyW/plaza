<template>
	<!-- Header Desktop -->
	<header
		class="hidden lg:block fixed top-0 pt-5 left-1/2 -translate-x-1/2 z-50 w-full transition-transform duration-300"
		:class="{ '-translate-y-[calc(100%+30px)]': !isHeaderVisible }"
	>
		<nav
			:aria-label="t('nav.home')"
			class="container bg-white shadow-[0px_4px_4px_rgba(0,0,0,0.25)] 2xl:rounded-[5px_20px_0px_0px] h-[71px] flex items-center justify-between px-6"
		>
			<!-- Logo -->
			<a href="/" class="flex-shrink-0" @click.prevent="handleLogoClick">
				<img
					src="/images/logo_plaza_transparent.png"
					:alt="t('common.altLogo')"
					class="h-[42px] w-auto"
				/>
			</a>

			<!-- Navigation links -->
			<div class="flex items-center gap-8">
				<NuxtLink
					to="/"
					class="font-heading font-bold text-[18px] leading-[30px] hover:text-plaza/80 transition-colors"
					:class="{
						'text-plaza': route.path === '/',
						'text-black': route.path !== '/',
					}"
					active-class="text-plaza"
				>
					{{ t('nav.homePage') }}
				</NuxtLink>
				<NuxtLink
					to="/obchody"
					class="font-heading font-bold text-[18px] leading-[30px] hover:text-plaza transition-colors"
					:class="{
						'text-plaza': route.path.startsWith('/obchody'),
						'text-black': !route.path.startsWith('/obchody'),
					}"
					active-class="text-plaza"
				>
					{{ t('nav.shopsAndServices') }}
				</NuxtLink>
				<NuxtLink
					to="/akce"
					class="font-heading font-bold text-[18px] leading-[30px] hover:text-plaza transition-colors"
					:class="{
						'text-plaza': route.path.startsWith('/akce'),
						'text-black': !route.path.startsWith('/akce'),
					}"
					active-class="text-plaza"
				>
					{{ t('nav.eventsAndSales') }}
				</NuxtLink>
				<NuxtLink
					to="/o-nas"
					class="font-heading font-bold text-[18px] leading-[30px] hover:text-plaza transition-colors"
					:class="{
						'text-plaza': route.path === '/o-nas',
						'text-black': route.path !== '/o-nas',
					}"
					active-class="text-plaza"
				>
					{{ t('nav.about') }}
				</NuxtLink>
				<!-- CTA Button -->
				<NuxtLink
					to="/mapa"
					class="inline-flex items-center justify-center px-6 py-2 bg-plaza text-white font-heading font-semibold text-base tracking-[0.05em] rounded-[5px_20px_5px_5px] shadow-md hover:shadow-[0_6px_20px_rgba(226,11,27,0.4)] hover:brightness-110 transition-all duration-200"
				>
					{{ t('nav.mapCenter') }}
				</NuxtLink>
			</div>

			<!-- Opening hours -->
			<button
				type="button"
				class="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
				:aria-label="t('nav.showOpeningHours')"
				@click="openOpeningHoursModal"
			>
				<div class="font-heading text-base text-right text-black">
					<div class="flex items-center justify-center gap-1.5 font-semibold">
						<svg
							class="w-5 h-5 flex-shrink-0 text-black"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<span class="font-black font-heading">{{ t('nav.openingHours') }}</span>
					</div>
					<div class="flex items-center justify-end gap-1">
						<span
							:class="isOpen ? 'text-plaza-success' : 'text-plaza'"
							class="text-[21px]"
							aria-hidden="true"
							>●</span
						>
						<span class="sr-only"
							>{{ isOpen ? t('common.openStatus') : t('common.closedStatus') }}:</span
						>
						<span>{{ openingHoursText }}</span>
						<span v-if="specialNote" class="relative group" @click.stop>
							<span
								class="inline-flex items-center justify-center"
								:aria-label="t('common.specialHoursInfo')"
								aria-describedby="desktop-special-note"
							>
								<svg
									class="w-4 h-4 text-plaza-gray cursor-help"
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
								id="desktop-special-note"
								role="tooltip"
								class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-plaza-dark text-white text-sm rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 z-50"
							>
								{{ specialNote }}
								<div
									class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-plaza-dark"
								></div>
							</div>
						</span>
					</div>
				</div>
			</button>
		</nav>
	</header>

	<!-- Header Mobile -->
	<header
		class="lg:hidden bg-plaza-dark fixed top-0 left-0 right-0 z-50 bg-white h-[60px] flex items-center justify-between pl-4 xs:pl-8 pr-2 xs:pr-6 shadow-[0px_4px_4px_rgba(0,0,0,0.25)] transition-transform duration-300"
		:class="{ '-translate-y-full': !isHeaderVisible && !isMobileMenuOpen }"
		:aria-hidden="!isHeaderVisible && !isMobileMenuOpen"
	>
		<!-- Logo -->
		<a href="/" class="flex-shrink-0" @click.prevent="handleLogoClick">
			<img
				src="/images/logo_plaza_transparent.png"
				:alt="t('common.altLogo')"
				class="h-[40px] w-auto"
			/>
		</a>

		<!-- Hamburger / Close button -->
		<button
			class="p-2 rounded-lg hover:bg-plaza-light transition-colors"
			:aria-label="isMobileMenuOpen ? t('common.close') : t('common.menu')"
			:aria-expanded="isMobileMenuOpen"
			aria-controls="mobile-menu"
			@click="toggleMobileMenu"
		>
			<svg
				v-if="!isMobileMenuOpen"
				class="w-6 h-6"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 6h16M4 12h16M4 18h16"
				/>
			</svg>
			<svg
				v-else
				class="w-6 h-6"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M6 18L18 6M6 6l12 12"
				/>
			</svg>
		</button>
	</header>

	<!-- Mobile Menu Overlay -->
	<Transition name="mobile-menu">
		<div
			v-if="isMobileMenuOpen"
			id="mobile-menu"
			class="lg:hidden fixed inset-0 z-40 bg-white pt-[50px] flex flex-col"
		>
			<!-- Navigation links -->
			<nav
				:aria-label="t('common.menu')"
				class="flex-1 flex flex-col items-center justify-center gap-4"
			>
				<NuxtLink
					to="/"
					class="font-heading font-bold text-[18px] leading-[30px] hover:text-plaza transition-colors"
					:class="{
						'text-plaza': route.path === '/',
						'text-black': route.path !== '/',
					}"
					active-class="text-plaza"
					@click="closeMobileMenu"
				>
					{{ t('nav.homePage') }}
				</NuxtLink>
				<NuxtLink
					to="/obchody"
					class="font-heading font-bold text-[18px] leading-[30px] hover:text-plaza transition-colors"
					:class="{
						'text-plaza': route.path.startsWith('/obchody'),
						'text-black': !route.path.startsWith('/obchody'),
					}"
					active-class="text-plaza"
					@click="closeMobileMenu"
				>
					{{ t('nav.shopsAndServices') }}
				</NuxtLink>
				<NuxtLink
					to="/akce"
					class="font-heading font-bold text-[18px] leading-[30px] hover:text-plaza transition-colors"
					:class="{
						'text-plaza': route.path.startsWith('/akce'),
						'text-black': !route.path.startsWith('/akce'),
					}"
					active-class="text-plaza"
					@click="closeMobileMenu"
				>
					{{ t('nav.eventsAndSales') }}
				</NuxtLink>
				<NuxtLink
					to="/o-nas"
					class="font-heading font-bold text-[18px] leading-[30px] hover:text-plaza transition-colors"
					:class="{
						'text-plaza': route.path === '/o-nas',
						'text-black': route.path !== '/o-nas',
					}"
					active-class="text-plaza"
					@click="closeMobileMenu"
				>
					{{ t('nav.about') }}
				</NuxtLink>

				<!-- CTA Button -->
				<NuxtLink
					to="/mapa"
					class="mt-4 inline-flex items-center justify-center px-6 py-2 bg-plaza text-white font-sans font-semibold text-base tracking-[0.05em] rounded-[5px_20px_5px_5px] shadow-md hover:shadow-[0_6px_20px_rgba(226,11,27,0.4)] hover:brightness-110 transition-all duration-200"
					@click="closeMobileMenu"
				>
					{{ t('nav.mapCenter') }}
				</NuxtLink>
			</nav>

			<!-- Bottom section: Opening hours + Socials -->
			<div class="flex flex-col items-center pb-8 gap-6">
				<!-- Opening hours -->
				<button
					type="button"
					class="font-heading text-base text-right text-black cursor-pointer hover:opacity-80 transition-opacity"
					:aria-label="t('nav.showOpeningHours')"
					@click="openOpeningHoursModal"
				>
					<div class="flex items-center justify-center gap-1.5 font-semibold">
						<svg
							class="w-6 h-6 flex-shrink-0 text-black"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<span class="font-black font-heading">{{ t('nav.openingHours') }}</span>
					</div>
					<div class="flex items-center justify-end gap-1">
						<span
							:class="isOpen ? 'text-plaza-success' : 'text-plaza'"
							class="text-[21px]"
							aria-hidden="true"
							>●</span
						>
						<span class="sr-only"
							>{{ isOpen ? t('common.openStatus') : t('common.closedStatus') }}:</span
						>
						<span>{{ openingHoursText }}</span>
						<span v-if="specialNote" class="relative group" @click.stop>
							<span
								class="inline-flex items-center justify-center"
								:aria-label="t('common.specialHoursInfo')"
								aria-describedby="mobile-special-note"
							>
								<svg
									class="w-4 h-4 text-plaza-gray cursor-help"
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
								id="mobile-special-note"
								role="tooltip"
								class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-plaza-dark text-white text-sm rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 z-50"
							>
								{{ specialNote }}
								<div
									class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-plaza-dark"
								></div>
							</div>
						</span>
					</div>
				</button>

				<!-- Social icons -->
				<div class="flex items-center gap-4">
					<a
						href="#"
						class="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:bg-plaza-dark transition-colors"
						aria-label="Facebook"
					>
						<svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
							<path
								d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
							/>
						</svg>
					</a>
					<a
						href="#"
						class="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:bg-plaza-dark transition-colors"
						aria-label="Instagram"
					>
						<svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
							<path
								d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
							/>
						</svg>
					</a>
				</div>
			</div>
		</div>
	</Transition>
</template>

<script setup lang="ts">
import type { OpeningHoursEntry, SpecialOpeningHours, DayOfWeek } from '@/shared/types'

const props = defineProps<{
	openingHours?: OpeningHoursEntry[]
	specialOpeningHours?: SpecialOpeningHours[]
}>()

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { openModal: openOpeningHoursModal } = useOpeningHoursModal()

// SSR-safe timestamp for hydration
const serverTimestamp = useState<number>('serverTimestamp', () => Date.now())

const isMobileMenuOpen = ref(false)
const isHeaderVisible = ref(true)
const lastScrollY = ref(0)
const scrollThreshold = 5

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

const dayShortNames: Record<DayOfWeek, string> = {
	monday: 'Po',
	tuesday: 'Út',
	wednesday: 'St',
	thursday: 'Čt',
	friday: 'Pá',
	saturday: 'So',
	sunday: 'Ne',
}

const todaySpecialHours = computed(() => {
	if (!props.specialOpeningHours?.length) return null

	const today = new Date(serverTimestamp.value)
	today.setHours(0, 0, 0, 0)
	const todayTime = today.getTime()

	for (const special of props.specialOpeningHours) {
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

const todayOpeningHours = computed(() => {
	const todayIndex = new Date(serverTimestamp.value).getDay()
	const today = dayMapping[todayIndex] as DayOfWeek
	const dayName = dayShortNames[today]

	if (todaySpecialHours.value) {
		return {
			day: dayName,
			open: todaySpecialHours.value.open ?? '09:00',
			close: todaySpecialHours.value.close ?? '21:00',
			closed: todaySpecialHours.value.closed ?? false,
			note: todaySpecialHours.value.note,
			isSpecial: true,
		}
	}

	const hours = props.openingHours?.find((h) => h.day === today)
	if (!hours) return null

	return {
		day: dayName,
		open: hours.open,
		close: hours.close,
		closed: hours.closed,
		isSpecial: false,
	}
})

const openingHoursText = computed(() => {
	if (!todayOpeningHours.value) return t('nav.openingHoursValue')
	if (todayOpeningHours.value.closed) {
		return `${todayOpeningHours.value.day} | ${t('common.closed')}`
	}
	return `${todayOpeningHours.value.day} ${todayOpeningHours.value.open} - ${todayOpeningHours.value.close}`
})

const specialNote = computed(() => {
	if (todayOpeningHours.value?.isSpecial && todayOpeningHours.value?.note) {
		return todayOpeningHours.value.note
	}
	return null
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

// === Menu toggle ===
const toggleMobileMenu = () => {
	isMobileMenuOpen.value = !isMobileMenuOpen.value
	document.body.style.overflow = isMobileMenuOpen.value ? 'hidden' : ''
}

const closeMobileMenu = () => {
	isMobileMenuOpen.value = false
	document.body.style.overflow = ''
}

const handleLogoClick = () => {
	if (route.path === '/') {
		window.scrollTo({ top: 0, behavior: 'smooth' })
		isHeaderVisible.value = true
	} else {
		router.push('/')
	}
	closeMobileMenu()
}

// === Scroll detection ===
const handleScroll = () => {
	const currentScrollY = window.scrollY
	const scrollDiff = currentScrollY - lastScrollY.value

	if (Math.abs(scrollDiff) < scrollThreshold) return

	if (scrollDiff > 0 && currentScrollY > 100) {
		isHeaderVisible.value = false
	} else if (scrollDiff < 0) {
		isHeaderVisible.value = true
	}

	lastScrollY.value = currentScrollY
}

const handleResize = () => {
	if (window.innerWidth >= 1024 && isMobileMenuOpen.value) {
		closeMobileMenu()
	}
}

// Close menu on route change
watch(
	() => route.path,
	() => {
		closeMobileMenu()
	},
)

onMounted(() => {
	window.addEventListener('scroll', handleScroll, { passive: true })
	window.addEventListener('resize', handleResize, { passive: true })
})

onUnmounted(() => {
	document.body.style.overflow = ''
	window.removeEventListener('scroll', handleScroll)
	window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.mobile-menu-enter-active {
	transition:
		opacity 0.2s ease-out,
		transform 0.2s ease-out;
}

.mobile-menu-leave-active {
	transition:
		opacity 0.15s ease-in,
		transform 0.15s ease-in;
}

.mobile-menu-enter-from {
	opacity: 0;
	transform: translateY(-10px);
}

.mobile-menu-leave-to {
	opacity: 0;
	transform: translateY(-10px);
}

.mobile-menu-enter-to,
.mobile-menu-leave-from {
	opacity: 1;
	transform: translateY(0);
}
</style>
