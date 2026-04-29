<template>
	<div class="min-h-screen">
		<h1 class="absolute -top-[9999px] -left-[9999px] opacity-0 visibility-hidden">
			{{ t('home.hero.title') }}
		</h1>
		<!-- Hero section -->
		<HomepageHeroSection :homepage="homepage" :pending="homepagePending" />

		<!-- Info + News Section -->
		<LazyHomepageInfoNewsSection
			:shops-count="shopsCount"
			:restaurants-count="restaurantsCount"
			:news="news"
			:news-pending="newsPending"
		/>

		<!-- Upcoming events -->
		<LazyHomepageUpcomingEvents :events="events" :pending="eventsPending" />

		<!-- Featured shops -->
		<LazyHomepageFeaturedShops :shops="shops" :pending="shopsPending" />

		<!-- Map section -->
		<MapSection />
	</div>
</template>

<script setup lang="ts">
import type { Shop, Event, News, Category, Homepage } from '@/shared/types'

// Prefetch map dat na serveru — data přijdou v SSR payload, MapSection je ihned zobrazí
await useFetch('/api/map/units', { key: 'map-units' })

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
const { data: homepage, pending: homepagePending } = useFetch<Homepage>('/api/homepage', {
	key: 'homepage',
})

const { data: shopsData, pending: shopsPending } = useFetch<{
	data: Shop[]
	pagination: { total: number }
}>('/api/shops', {
	key: 'homepage-shops',
	query: { limit: 100, isActive: true },
})
const shops = computed(() => shopsData.value?.data || [])
const shopsCount = computed(() => shopsData.value?.pagination?.total || 0)

const { data: categoriesData } = useFetch<{ data: Category[] }>('/api/categories', {
	key: 'homepage-categories',
	query: { withShopsOnly: true },
})
const restaurantsCount = computed(() => {
	const foodCategory = categoriesData.value?.data?.find(
		(cat) => cat.name === 'Restaurace & kavárny',
	)
	return foodCategory?.shopCount || 0
})

const { data: newsData, pending: newsPending } = useFetch<{ data: News[] }>('/api/news', {
	key: 'homepage-news',
	query: { isActive: true, notExpired: true, limit: 10 },
})
const news = computed(() => newsData.value?.data || [])

const { data: eventsData, pending: eventsPending } = useFetch<{ data: Event[] }>('/api/events', {
	key: 'homepage-events',
	query: { limit: 100, isActive: true, notExpired: true },
})
const events = computed(() => eventsData.value?.data || [])
</script>
