<template>
  <div class="p-8">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">{{ $t('cms.dashboard.title') }}</h1>
      <p class="text-gray-500 mt-1">{{ $t('cms.dashboard.subtitle') }}</p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold">{{ stats?.shops || 0 }}</p>
            <p class="text-gray-500 text-sm">{{ $t('cms.dashboard.stats.shops') }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold">{{ stats?.events || 0 }}</p>
            <p class="text-gray-500 text-sm">{{ $t('cms.dashboard.stats.events') }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold">{{ stats?.services || 0 }}</p>
            <p class="text-gray-500 text-sm">{{ $t('cms.dashboard.stats.services') }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick actions -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <h2 class="text-lg font-semibold mb-4">{{ $t('cms.dashboard.quickActions') }}</h2>
        <div class="space-y-2">
          <NuxtLink
            to="/cms/obchody/novy"
            class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>{{ $t('cms.dashboard.addShop') }}</span>
          </NuxtLink>
          <NuxtLink
            to="/cms/akce/nova"
            class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>{{ $t('cms.dashboard.addEvent') }}</span>
          </NuxtLink>
          <NuxtLink
            to="/cms/kategorie/nova"
            class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>{{ $t('cms.dashboard.addCategory') }}</span>
          </NuxtLink>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm">
        <h2 class="text-lg font-semibold mb-4">{{ $t('cms.dashboard.upcomingEvents') }}</h2>
        <div v-if="upcomingEvents?.length === 0" class="text-gray-500 text-center py-8">
          {{ $t('cms.dashboard.noUpcomingEvents') }}
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="event in upcomingEvents"
            :key="event._id"
            class="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div class="text-center">
              <p class="text-2xl font-bold text-plaza-600">
                {{ new Date(event.startDate).getDate() }}
              </p>
              <p class="text-xs text-gray-500 uppercase">
                {{ new Date(event.startDate).toLocaleDateString('cs-CZ', { month: 'short' }) }}
              </p>
            </div>
            <div class="flex-1">
              <p class="font-medium">{{ event.title }}</p>
              <p class="text-sm text-gray-500">
                {{ event.published ? $t('events.published') : $t('events.draft') }}
              </p>
            </div>
            <NuxtLink
              :to="`/cms/akce/${event._id}`"
              class="text-plaza-600 hover:text-plaza-700 text-sm font-medium"
            >
              {{ $t('common.edit') }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Event } from '@/shared/types'

definePageMeta({
  layout: 'cms',
  middleware: 'cms'
})

const { t } = useI18n()

usePlazaSeo({
  title: t('cms.dashboard.title'),
  noIndex: true
})

// Načíst statistiky (TODO: implementovat /api/stats endpoint)
const stats = ref({
  shops: 0,
  events: 0,
  categories: 0,
  services: 0
})

// Načíst statistiky z jednotlivých endpointů
const [shopsData, eventsData, categoriesData] = await Promise.all([
  useFetch<{ meta: { total: number } }>('/api/shops', { query: { limit: 1 } }),
  useFetch<{ meta: { total: number } }>('/api/events', { query: { limit: 1 } }),
  useFetch<Array<unknown>>('/api/categories')
])

stats.value = {
  shops: shopsData.data.value?.meta?.total || 0,
  events: eventsData.data.value?.meta?.total || 0,
  categories: categoriesData.data.value?.length || 0,
  services: 0
}

// Nadcházející události
const { data: upcomingEventsData } = await useFetch<{ data: Event[] }>('/api/events', {
  query: { limit: 5, upcoming: true }
})
const upcomingEvents = computed(() => upcomingEventsData.value?.data || [])
</script>
