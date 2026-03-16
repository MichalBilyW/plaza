<template>
	<div class="p-8">
		<div class="mb-8">
			<h1 class="text-2xl font-bold text-gray-900">{{ $t('cms.dashboard.title') }}</h1>
			<p class="text-gray-500 mt-1">{{ $t('cms.dashboard.subtitle') }}</p>
		</div>

		<!-- Stats -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
			<div class="bg-white rounded-xl p-6 shadow-sm border-l-4 border-cms-shops-500">
				<div class="flex items-center gap-4">
					<div
						class="w-12 h-12 bg-cms-shops-100 rounded-lg flex items-center justify-center"
					>
						<svg
							class="w-6 h-6 text-cms-shops-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
							/>
						</svg>
					</div>
					<div>
						<p class="text-2xl font-bold text-cms-shops-700">{{ stats?.shops || 0 }}</p>
						<p class="text-gray-500 text-sm">{{ $t('cms.dashboard.stats.shops') }}</p>
					</div>
				</div>
			</div>

			<div class="bg-white rounded-xl p-6 shadow-sm border-l-4 border-cms-events-500">
				<div class="flex items-center gap-4">
					<div
						class="w-12 h-12 bg-cms-events-100 rounded-lg flex items-center justify-center"
					>
						<svg
							class="w-6 h-6 text-cms-events-600"
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
					<div>
						<p class="text-2xl font-bold text-cms-events-700">
							{{ stats?.events || 0 }}
						</p>
						<p class="text-gray-500 text-sm">{{ $t('cms.dashboard.stats.events') }}</p>
					</div>
				</div>
			</div>

			<div class="bg-white rounded-xl p-6 shadow-sm border-l-4 border-cms-services-500">
				<div class="flex items-center gap-4">
					<div
						class="w-12 h-12 bg-cms-services-100 rounded-lg flex items-center justify-center"
					>
						<svg
							class="w-6 h-6 text-cms-services-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
							/>
						</svg>
					</div>
					<div>
						<p class="text-2xl font-bold text-cms-services-700">
							{{ stats?.services || 0 }}
						</p>
						<p class="text-gray-500 text-sm">
							{{ $t('cms.dashboard.stats.services') }}
						</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Quick actions -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<div class="bg-white rounded-xl p-6 shadow-sm">
				<h2 class="text-cms-news-500 text-lg font-semibold mb-4">
					{{ $t('cms.dashboard.latestNews', { count: latestNews.length }) }}
				</h2>
				<div v-if="latestNews?.length === 0" class="text-gray-500 text-center py-8">
					{{ $t('cms.dashboard.noNews') }}
				</div>
				<div v-else class="space-y-3">
					<div
						v-for="newsItem in latestNews"
						:key="newsItem._id"
						class="flex items-center gap-y-1 gap-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
					>
						<div
							class="w-12 h-12 rounded-lg bg-cms-news-100 flex items-center justify-center flex-shrink-0"
						>
							<svg
								class="w-6 h-6 text-cms-news-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
								/>
							</svg>
						</div>
						<div class="flex-1 min-w-0">
							<p class="font-medium truncate">{{ newsItem.name }}</p>
						</div>
						<span
							:class="[
								'px-2 py-1 text-xs rounded-full',
								newsItem.isActive
									? 'bg-green-100 text-green-700'
									: 'bg-gray-100 text-gray-500',
							]"
						>
							{{
								newsItem.isActive ? $t('cms.events.active') : $t('cms.events.inactive')
							}}
						</span>
						<NuxtLink
							:to="`/cms/novinky/${newsItem._id}`"
							class="text-plaza-600 hover:text-plaza-700 text-sm font-medium"
						>
							{{ $t('common.edit') }}
						</NuxtLink>
					</div>
				</div>
			</div>

			<div class="bg-white rounded-xl p-6 shadow-sm">
				<h2 class="text-cms-events-500 text-lg font-semibold mb-4">
					{{ $t('cms.dashboard.latestEvents', { count: latestEvents.length }) }}
				</h2>
				<div v-if="latestEvents?.length === 0" class="text-gray-500 text-center py-8">
					{{ $t('cms.dashboard.noEvents') }}
				</div>
				<div v-else class="space-y-3">
					<div
						v-for="event in latestEvents"
						:key="event._id"
						class="flex items-center gap-y-1 gap-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
					>
						<div
							class="w-12 h-12 rounded-lg bg-cms-events-100 flex items-center justify-center flex-shrink-0"
						>
							<svg
								class="w-6 h-6 text-cms-events-600"
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
						<div class="flex-1 min-w-0">
							<p class="font-medium truncate">{{ event.name }}</p>
							<p class="text-sm text-gray-500 truncate">
								{{ event.shop?.name || $t('events.noShop') }}
							</p>
						</div>
						<span
							:class="[
								'px-2 py-1 text-xs rounded-full',
								event.isActive
									? 'bg-green-100 text-green-700'
									: 'bg-gray-100 text-gray-500',
							]"
						>
							{{
								event.isActive ? $t('cms.events.active') : $t('cms.events.inactive')
							}}
						</span>
						<NuxtLink
							:to="`/cms/akce/${event._id}`"
							class="text-plaza-600 hover:text-plaza-700 text-sm font-medium"
						>
							{{ $t('common.edit') }}
						</NuxtLink>
					</div>
				</div>
			</div>

			<div class="bg-white rounded-xl p-6 shadow-sm">
				<h2 class="text-lg font-semibold mb-4">{{ $t('cms.dashboard.quickActions') }}</h2>
				<div class="space-y-2">
					<NuxtLink
						to="/cms/obchody/novy"
						class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-cms-shops-50 transition-colors group border-l-4 border-cms-shops-500"
					>
						<svg
							class="w-5 h-5 text-cms-shops-500"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 4v16m8-8H4"
							/>
						</svg>
						<span class="group-hover:text-cms-shops-700">{{
							$t('cms.dashboard.addShop')
						}}</span>
					</NuxtLink>
					<NuxtLink
						to="/cms/akce/nova"
						class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-cms-events-50 transition-colors group border-l-4 border-cms-events-500"
					>
						<svg
							class="w-5 h-5 text-cms-events-500"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 4v16m8-8H4"
							/>
						</svg>
						<span class="group-hover:text-cms-events-700">{{
							$t('cms.dashboard.addEvent')
						}}</span>
					</NuxtLink>
					<NuxtLink
						to="/cms/sluzby/nova"
						class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-cms-services-50 transition-colors group border-l-4 border-cms-services-500"
					>
						<svg
							class="w-5 h-5 text-cms-services-500"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 4v16m8-8H4"
							/>
						</svg>
						<span class="group-hover:text-cms-services-700">{{
							$t('cms.dashboard.addService')
						}}</span>
					</NuxtLink>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { Event, News } from '@/shared/types'

definePageMeta({
	layout: 'cms',
	middleware: 'cms',
})

const { t } = useI18n()

usePlazaSeo({
	title: t('cms.dashboard.title'),
	noIndex: true,
})

// Načíst statistiky (TODO: implementovat /api/stats endpoint)
const stats = ref({
	shops: 0,
	events: 0,
	services: 0,
})

// Načíst statistiky z jednotlivých endpointů
const [shopsData, eventsData, servicesData] = await Promise.all([
	useFetch<{ pagination: { total: number } }>('/api/shops', { query: { limit: 1 } }),
	useFetch<{ meta: { total: number } }>('/api/events', { query: { limit: 1 } }),
	useFetch<{ data: unknown[]; meta?: { total: number } }>('/api/services', { query: { limit: 1 } }),
])

stats.value = {
	shops: shopsData.data.value?.pagination?.total || 0,
	events: eventsData.data.value?.meta?.total || 0,
	services: servicesData.data.value?.meta?.total || servicesData.data.value?.data?.length || 0,
}

// Nejnovější akce (řazeno dle createdAt)
const { data: latestEventsData } = await useFetch<{ data: Event[] }>('/api/events', {
	query: { limit: 5, sort: 'createdAt', order: 'desc' },
})
const latestEvents = computed(() => latestEventsData.value?.data || [])

// Nejnovější akce centra (řazeno dle createdAt)
const { data: latestNewsData } = await useFetch<{ data: News[] }>('/api/news', {
	query: { limit: 5, sort: 'createdAt', order: 'desc' },
})
const latestNews = computed(() => latestNewsData.value?.data || [])
</script>
