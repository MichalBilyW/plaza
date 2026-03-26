<template>
	<div>
		<h1 class="absolute -top-[9999px] -left-[9999px] opacity-0 visibility-hidden">{{ t('home.hero.title') }}</h1>
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
	</div>
</template>

<script setup lang="ts">
import type { Shop, Event, News, Category, Homepage } from '@/shared/types'

const { t } = useI18n()

usePlazaSeo({
	title: t('seo.home.title'),
	description: t('seo.home.description'),
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
		(cat) => cat.name === 'Jídlo a občerstvení',
	)
	return foodCategory?.shopCount || 0
})

const { data: newsData, pending: newsPending } = useFetch<{ data: News[] }>('/api/news', {
	key: 'homepage-news',
	query: { isActive: true, limit: 10 },
})
const news = computed(() => newsData.value?.data || [])

const { data: eventsData, pending: eventsPending } = useFetch<{ data: Event[] }>('/api/events', {
	key: 'homepage-events',
	query: { limit: 100, published: true, upcoming: true },
})
const events = computed(() => eventsData.value?.data || [])
</script>
