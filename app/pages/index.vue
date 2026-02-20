<template>
  <div>
    <!-- Hero section -->
    <section class="relative bg-plaza-600 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div class="max-w-2xl">
          <h1 class="text-4xl md:text-5xl font-bold mb-6">
            {{ $t('home.hero.title') }}
          </h1>
          <p class="text-xl text-plaza-100 mb-8">
            {{ $t('home.hero.subtitle') }}
          </p>
          <div class="flex flex-wrap gap-4">
            <NuxtLink
              to="/obchody"
              class="px-6 py-3 bg-white text-plaza-600 font-semibold rounded-lg hover:bg-plaza-50 transition-colors"
            >
              {{ $t('home.hero.cta.shops') }}
            </NuxtLink>
            <NuxtLink
              to="/akce"
              class="px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              {{ $t('home.hero.cta.events') }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Quick info -->
    <section class="bg-white py-12 border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-plaza-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-plaza-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold">{{ $t('home.quickInfo.openingHours') }}</h3>
              <p class="text-gray-600">{{ $t('home.quickInfo.openingHoursValue') }}</p>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-plaza-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-plaza-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold">{{ $t('home.quickInfo.address') }}</h3>
              <p class="text-gray-600">{{ $t('home.quickInfo.addressValue') }}</p>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-plaza-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-plaza-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold">{{ $t('home.quickInfo.parking') }}</h3>
              <p class="text-gray-600">{{ $t('home.quickInfo.parkingValue') }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured shops -->
    <section class="py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center mb-8">
          <h2 class="text-2xl font-bold">{{ $t('home.sections.shops') }}</h2>
          <NuxtLink to="/obchody" class="text-plaza-600 hover:text-plaza-700 font-medium">
            {{ $t('common.showAllArrow') }}
          </NuxtLink>
        </div>

        <div v-if="pending" class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div v-for="i in 4" :key="i" class="bg-white rounded-xl p-6 animate-pulse">
            <div class="w-16 h-16 bg-gray-200 rounded-lg mb-4"></div>
            <div class="h-5 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <NuxtLink
            v-for="shop in shops"
            :key="shop._id"
            :to="`/obchody/${shop.slug}`"
            class="bg-white rounded-xl p-6 hover:shadow-lg transition-shadow group"
          >
            <div class="w-16 h-16 bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
              <img
                v-if="shop.logo"
                :src="shop.logo"
                :alt="shop.name"
                class="w-full h-full object-contain"
              />
              <span v-else class="text-2xl font-bold text-gray-400">
                {{ shop.name.charAt(0) }}
              </span>
            </div>
            <h3 class="font-semibold group-hover:text-plaza-600 transition-colors">
              {{ shop.name }}
            </h3>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Upcoming events -->
    <section class="py-16 bg-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center mb-8">
          <h2 class="text-2xl font-bold">{{ $t('home.sections.events') }}</h2>
          <NuxtLink to="/akce" class="text-plaza-600 hover:text-plaza-700 font-medium">
            {{ $t('common.showAllArrow') }}
          </NuxtLink>
        </div>

        <div v-if="eventsPending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 3" :key="i" class="bg-white rounded-xl overflow-hidden animate-pulse">
            <div class="h-48 bg-gray-200"></div>
            <div class="p-6">
              <div class="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div class="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>

        <div v-else-if="events?.length === 0" class="text-center py-12 text-gray-500">
          {{ $t('events.noEvents') }}
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <NuxtLink
            v-for="event in events"
            :key="event._id"
            :to="`/akce/${event.slug}`"
            class="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow group"
          >
            <div class="h-48 bg-plaza-100 flex items-center justify-center">
              <img
                v-if="event.image"
                :src="event.image"
                :alt="event.title"
                class="w-full h-full object-cover"
              />
              <svg v-else class="w-16 h-16 text-plaza-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="p-6">
              <div class="text-sm text-plaza-600 font-medium mb-2">
                {{ formatEventDate(event.startDate, event.endDate) }}
              </div>
              <h3 class="font-semibold group-hover:text-plaza-600 transition-colors">
                {{ event.title }}
              </h3>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Shop, Event } from '@/shared/types'

const { t } = useI18n()

usePlazaSeo({
  title: t('seo.home.title'),
  description: t('seo.home.description')
})

// Načíst obchody
const { data: shopsData, pending } = await useFetch<{ data: Shop[] }>('/api/shops', {
  query: { limit: 8, active: true }
})
const shops = computed(() => shopsData.value?.data || [])

// Načíst události
const { data: eventsData, pending: eventsPending } = await useFetch<{ data: Event[] }>('/api/events', {
  query: { limit: 3, published: true, upcoming: true }
})
const events = computed(() => eventsData.value?.data || [])

// Formátování data události
const formatEventDate = (start: string | Date, end: string | Date) => {
  const startDate = new Date(start)
  const endDate = new Date(end)

  const formatDate = (d: Date) => {
    return d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long' })
  }

  if (startDate.toDateString() === endDate.toDateString()) {
    return formatDate(startDate)
  }

  return `${formatDate(startDate)} – ${formatDate(endDate)}`
}
</script>
