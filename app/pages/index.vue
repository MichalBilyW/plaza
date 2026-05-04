<template>
	<div class="min-h-screen">
		<h1 class="absolute -top-[9999px] -left-[9999px] opacity-0 visibility-hidden">
			{{ t('home.hero.title') }}
		</h1>
		<!-- Hero section -->
		<HomepageHeroSection :homepage="homepage" :pending="homepagePending" />

		<!-- Info + News Section -->
		<HomepageInfoNewsSection
			:shops-count="shopsCount"
			:restaurants-count="restaurantsCount"
			:news="news"
			:news-pending="newsPending"
		/>

		<!-- Upcoming events -->
		<HomepageUpcomingEvents :events="events" :pending="eventsPending" />

		<!-- Featured shops -->
		<LazyHomepageFeaturedShops :shops="shops" :pending="shopsPending" />

		<!-- Map section -->
		<LazyMapSection />
	</div>
</template>

<script setup lang="ts">
import type { Shop, Event, News, Category, Homepage } from '@/shared/types'

const { t } = useI18n()

usePlazaSeo({
	title: t('seo.home.title'),
	description: t('seo.home.description'),
})

// JSON-LD: ShoppingCenter (homepage je hlavní entita)
const runtimeConfig = useRuntimeConfig()
const baseUrl = runtimeConfig.public.siteUrl || 'https://ocplazaliberec.cz'
useJsonLd({
	'@context': 'https://schema.org',
	'@type': 'ShoppingCenter',
	name: 'OC Plaza Liberec',
	alternateName: 'Obchodní centrum Plaza Liberec',
	url: baseUrl,
	logo: `${baseUrl}/svgs/logo.svg`,
	image: `${baseUrl}/images/og.jpg`,
	description: t('seo.home.description'),
	address: {
		'@type': 'PostalAddress',
		streetAddress: 'Palachova 1404/2',
		addressLocality: 'Liberec',
		postalCode: '460 01',
		addressCountry: 'CZ',
	},
	geo: {
		'@type': 'GeoCoordinates',
		latitude: 50.7659,
		longitude: 15.0596,
	},
	sameAs: [
		'https://www.facebook.com/PlazaLiberec',
		'https://www.instagram.com/ocplazaliberec/',
	],
})

// === Data fetching - vše paralelně ===
// Viditelné homepage sekce čekáme při SSR, aby se první render nepropadl do skeletonů.
// Mapu neblokujeme: /api/map/units načítá a parsuje SVG mapy, což zbytečně zpomaluje první HTML.
const [
	{ data: homepage, pending: homepagePending },
	{ data: shopsData, pending: shopsPending },
	{ data: categoriesData },
	{ data: newsData, pending: newsPending },
	{ data: eventsData, pending: eventsPending },
] = await Promise.all([
	useFetch<Homepage>('/api/homepage', { key: 'homepage' }),
	useFetch<{
		data: Shop[]
		pagination: { total: number }
	}>('/api/shops', {
		key: 'homepage-shops',
		query: { limit: 100, isActive: true },
	}),
	useFetch<{ data: Category[] }>('/api/categories', {
		key: 'homepage-categories',
		query: { withShopsOnly: true },
	}),
	useFetch<{ data: News[] }>('/api/news', {
		key: 'homepage-news',
		query: { isActive: true, notExpired: true, limit: 10 },
	}),
	useFetch<{ data: Event[] }>('/api/events', {
		key: 'homepage-events',
		query: { limit: 100, isActive: true, notExpired: true },
	}),
])

const shops = computed(() => shopsData.value?.data || [])
const shopsCount = computed(() => shopsData.value?.pagination?.total || 0)

const restaurantsCount = computed(() => {
	const foodCategory = categoriesData.value?.data?.find(
		(cat) => cat.name === 'Restaurace & kavárny',
	)
	return foodCategory?.shopCount || 0
})

const news = computed(() => newsData.value?.data || [])
const events = computed(() => eventsData.value?.data || [])

const criticalImagePreloads = computed(() => {
	const urls = [
		news.value[0]?.image,
		...events.value.slice(0, 3).map((event) => event.image),
		...events.value.slice(0, 3).map((event) => event.shop?.logo),
	].filter((url): url is string => Boolean(url))

	const seen = new Set<string>()
	return urls
		.filter((url) => {
			if (seen.has(url)) return false
			seen.add(url)
			return true
		})
		.map((href, index) => ({
			rel: 'preload' as const,
			as: 'image' as const,
			href,
			fetchpriority: index === 0 ? 'high' : 'auto',
		}))
})

useHead(
	computed(() => ({
		link: criticalImagePreloads.value,
	})),
)
</script>
