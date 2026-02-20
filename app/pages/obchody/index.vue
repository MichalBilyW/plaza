<template>
  <div class="py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold mb-2">{{ $t('shops.title') }}</h1>
        <p class="text-gray-600">
          {{ $t('shops.description') }}
        </p>
      </div>

      <!-- Filters -->
      <div class="flex flex-col md:flex-row gap-4 mb-8">
        <!-- Search -->
        <div class="flex-1">
          <input
            v-model="search"
            type="text"
            :placeholder="$t('shops.search')"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-plaza-500 focus:border-plaza-500"
          />
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="pending" class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div v-for="i in 8" :key="i" class="bg-white rounded-xl p-6 animate-pulse">
          <div class="w-16 h-16 bg-gray-200 rounded-lg mb-4"></div>
          <div class="h-5 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="shops.length === 0" class="text-center py-16">
        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-1">{{ $t('shops.noShops') }}</h3>
        <p class="text-gray-500">{{ $t('shops.noShopsHint') }}</p>
      </div>

      <!-- Shops grid -->
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
          <p v-if="shop.floorId" class="text-xs text-gray-400 mt-1">
            {{ shop.floorId.name }}
          </p>
        </NuxtLink>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-8 flex justify-center gap-2">
        <button
          v-for="p in totalPages"
          :key="p"
          @click="page = p"
          class="w-10 h-10 rounded-lg font-medium transition-colors"
          :class="page === p
            ? 'bg-plaza-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
        >
          {{ p }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Shop } from '@/shared/types'

const { t } = useI18n()

usePlazaSeo({
  title: t('seo.shops.title'),
  description: t('seo.shops.description')
})

// State
const search = ref('')
const page = ref(1)

// Debounced search
const debouncedSearch = refDebounced(search, 300)

// Load shops
const { data: shopsData, pending, refresh } = await useFetch<{ data: Shop[]; meta: { total: number; totalPages: number } }>('/api/shops', {
  query: computed(() => ({
    page: page.value,
    limit: 12,
    active: true,
    search: debouncedSearch.value || undefined
  })),
  watch: [page, debouncedSearch]
})

const shops = computed(() => shopsData.value?.data || [])
const totalPages = computed(() => shopsData.value?.meta.totalPages || 1)

// Reset page when filters change
watch([debouncedSearch], () => {
  page.value = 1
})
</script>
