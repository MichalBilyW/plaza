<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <div class="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900">{{ t('cms.shops.title') }}</h1>
        <p class="text-gray-500 mt-1 text-sm sm:text-base">{{ t('cms.shops.subtitle') }}</p>
      </div>
      <NuxtLink
        to="/cms/obchody/novy"
        class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-cms-shops-600 text-white rounded-lg hover:bg-cms-shops-700 transition-colors text-sm sm:text-base"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        {{ t('cms.shops.addShop') }}
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl shadow-sm p-4 mb-6">
      <div class="flex flex-col md:flex-row gap-4">
        <!-- Search -->
        <div class="flex-1">
          <input
            v-model="search"
            type="text"
            :placeholder="t('cms.shops.searchPlaceholder')"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-shops-500 focus:border-cms-shops-500"
          />
        </div>
        <!-- Floor filter -->
        <div class="w-full md:w-48">
          <select
            v-model="selectedFloor"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-shops-500 focus:border-cms-shops-500"
          >
            <option value="">{{ t('cms.shops.allFloors') }}</option>
            <option v-for="floor in floors" :key="floor._id" :value="floor._id">
              {{ floor.name }}
            </option>
          </select>
        </div>
        <!-- Status filter -->
        <div class="w-full md:w-48">
          <select
            v-model="selectedStatus"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-shops-500 focus:border-cms-shops-500"
          >
            <option value="">{{ t('cms.shops.allStatuses') }}</option>
            <option value="true">{{ t('cms.shops.active') }}</option>
            <option value="false">{{ t('cms.shops.inactive') }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading/Error states -->
    <div v-if="pending" class="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
      {{ t('common.loading') }}
    </div>

    <div v-else-if="error" class="bg-white rounded-xl shadow-sm p-8 text-center text-red-500">
      {{ t('common.error') }}: {{ error.message }}
    </div>

    <div v-else-if="!shops?.length" class="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
      {{ t('cms.shops.noShops') }}
    </div>

    <!-- Desktop: Table -->
    <div v-else class="hidden lg:block bg-white rounded-xl shadow-sm overflow-x-auto">
      <table class="w-full min-w-[800px]">
        <thead class="bg-gray-50 border-b">
          <tr>
            <CmsSortableHeader field="name" :sort-icon="getSortIcon('name')" @sort="toggleSort">
              {{ t('cms.shops.name') }}
            </CmsSortableHeader>
            <CmsSortableHeader field="floor" :sort-icon="getSortIcon('floor')" class="w-24" @sort="toggleSort">
              {{ t('cms.shops.floor') }}
            </CmsSortableHeader>
            <CmsSortableHeader field="unitCode" :sort-icon="getSortIcon('unitCode')" class="w-20" @sort="toggleSort">
              {{ t('cms.shops.units') }}
            </CmsSortableHeader>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ t('cms.shops.contact') }}
            </th>
            <CmsSortableHeader field="isActive" :sort-icon="getSortIcon('isActive')" class="w-20" @sort="toggleSort">
              {{ t('cms.shops.status') }}
            </CmsSortableHeader>
            <CmsSortableHeader field="updatedAt" :sort-icon="getSortIcon('updatedAt')" class="w-28" @sort="toggleSort">
              {{ t('cms.shops.updatedAt') }}
            </CmsSortableHeader>
            <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
              {{ t('common.actions') }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="shop in sortedShops" :key="shop._id" class="hover:bg-gray-50">
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img
                    v-if="shop.logo"
                    :src="shop.logo"
                    :alt="shop.name"
                    class="w-full h-full object-contain"
                  />
                  <span v-else class="text-base font-bold text-gray-400">
                    {{ shop.name.charAt(0) }}
                  </span>
                </div>
                <div class="min-w-0">
                  <span class="font-medium text-gray-900 block truncate max-w-[200px]">{{ shop.name }}</span>
                  <p class="text-xs text-gray-400 truncate max-w-[200px]">/obchody/{{ shop.slug }}</p>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-sm">
              {{ shop.floor?.name || '–' }}
            </td>
            <td class="px-4 py-3 text-sm">
              <span v-if="shop.unitCode" class="text-gray-500">{{ shop.unitCode }}</span>
              <span v-else class="inline-flex items-center gap-1 text-red-500" :title="t('cms.shops.noUnit')">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </span>
            </td>
            <td class="px-4 py-3 text-gray-500 text-sm">
              <div v-if="shop.phone || shop.email" class="min-w-0">
                <p v-if="shop.phone" class="truncate">{{ shop.phone }}</p>
                <p v-if="shop.email" class="text-xs truncate">{{ shop.email }}</p>
              </div>
              <span v-else>–</span>
            </td>
            <td class="px-4 py-3">
              <span
                :class="[
                  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                  shop.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                ]"
              >
                {{ shop.isActive ? t('cms.shops.active') : t('cms.shops.inactive') }}
              </span>
            </td>
            <td class="px-4 py-3 text-gray-500 text-sm">
              {{ formatDate(shop.updatedAt) }}
            </td>
            <td class="px-4 py-3 text-right">
              <div class="flex items-center justify-end gap-1">
                <NuxtLink
                  :to="`/obchody/${shop.slug}`"
                  target="_blank"
                  class="text-gray-400 hover:text-gray-600 p-1"
                  :title="t('cms.shops.viewOnSite')"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </NuxtLink>
                <NuxtLink
                  :to="`/cms/obchody/${shop._id}`"
                  class="text-cms-shops-600 hover:text-cms-shops-700 p-1"
                  :title="t('common.edit')"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </NuxtLink>
                <button
                  @click="confirmDelete(shop)"
                  class="text-red-600 hover:text-red-700 p-1"
                  :title="t('common.delete')"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile/Tablet: Cards -->
    <div v-if="shops?.length" class="lg:hidden space-y-3">
      <NuxtLink
        v-for="shop in sortedShops"
        :key="shop._id"
        :to="`/cms/obchody/${shop._id}`"
        class="block bg-white rounded-xl shadow-sm p-3 active:bg-gray-50 transition-colors"
      >
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
            <img
              v-if="shop.logo"
              :src="shop.logo"
              :alt="shop.name"
              class="w-full h-full object-contain"
            />
            <span v-else class="text-lg font-bold text-gray-400">
              {{ shop.name.charAt(0) }}
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2">
              <h3 class="font-medium text-gray-900 truncate">{{ shop.name }}</h3>
              <span
                :class="[
                  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0',
                  shop.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                ]"
              >
                {{ shop.isActive ? t('cms.shops.active') : t('cms.shops.inactive') }}
              </span>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
              <span v-if="shop.floor?.name">{{ shop.floor.name }}</span>
              <span v-if="shop.floor?.name && shop.unitCode" class="text-gray-300">·</span>
              <span v-if="shop.unitCode">{{ shop.unitCode }}</span>
              <svg v-else class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" :title="t('cms.shops.noUnit')">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </NuxtLink>
    </div>

    <!-- Pagination -->
    <div v-if="pagination && pagination.totalPages > 1" class="mt-6 flex justify-center gap-2">
      <button
        v-for="p in pagination.totalPages"
        :key="p"
        @click="page = p"
        class="w-10 h-10 rounded-lg font-medium transition-colors"
        :class="page === p
          ? 'bg-cms-shops-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
      >
        {{ p }}
      </button>
    </div>

    <!-- Delete confirmation modal -->
    <Teleport to="body">
      <div
        v-if="shopToDelete"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        @click.self="shopToDelete = null"
      >
        <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
          <h3 class="text-lg font-semibold mb-2">{{ t('cms.shops.deleteConfirmTitle') }}</h3>
          <p class="text-gray-600 mb-6">
            {{ t('cms.shops.deleteConfirmMessage', { name: shopToDelete.name }) }}
          </p>
          <div class="flex justify-end gap-3">
            <button
              @click="shopToDelete = null"
              class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              {{ t('common.cancel') }}
            </button>
            <button
              @click="deleteShop"
              :disabled="deleting"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {{ deleting ? t('common.loading') : t('common.delete') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { Shop, Floor, PaginatedResponse } from '@/shared/types'

definePageMeta({
  layout: 'cms',
  middleware: 'cms'
})

const { t } = useI18n()
const { secureFetch } = useCmsAuth()
const flash = useFlashMessages()

usePlazaSeo({
  title: t('cms.shops.title'),
  noIndex: true
})

// State
const search = ref('')
const selectedFloor = ref('')
const selectedStatus = ref('')
const page = ref(1)

// Debounced search (vlastní implementace bez VueUse)
const debouncedSearch = ref('')
let debounceTimeout: ReturnType<typeof setTimeout> | null = null
watch(search, (newValue) => {
  if (debounceTimeout) clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => {
    debouncedSearch.value = newValue
  }, 300)
})

// Load floors for filter
const { data: floorsData } = await useFetch<{ data: Floor[] }>('/api/floors', {
  query: { limit: 100 }
})
const floors = computed(() => floorsData.value?.data || [])

// Load shops
const { data: shopsData, pending, error, refresh } = await useFetch<PaginatedResponse<Shop>>('/api/shops', {
  query: computed(() => ({
    page: page.value,
    limit: 20,
    search: debouncedSearch.value || undefined,
    floorId: selectedFloor.value || undefined,
    isActive: selectedStatus.value !== '' ? selectedStatus.value === 'true' : undefined,
  })),
  watch: [page, debouncedSearch, selectedFloor, selectedStatus]
})

const shops = computed(() => shopsData.value?.data || [])
const pagination = computed(() => shopsData.value?.pagination)

// Sorting - transform data for sortable fields
interface SortableShop {
  _id: string
  name: string
  slug: string
  floor: { name: string; level: number } | null
  unitCode: string | null
  phone: string | null
  email: string | null
  logo: string | null
  isActive: boolean
  updatedAt: string
}

const sortableShops = computed<SortableShop[]>(() =>
  shops.value.map(shop => ({
    ...shop,
    floor: shop.floor || null,
    unitCode: shop.unitCode || null,
    phone: shop.phone || null,
    email: shop.email || null,
    logo: shop.logo || null
  }))
)

const { toggleSort, getSortIcon, sortedItems } = useTableSort(sortableShops)
const sortedShops = sortedItems

// Reset page when filters change
watch([debouncedSearch, selectedFloor, selectedStatus], () => {
  page.value = 1
})

// Delete shop
const shopToDelete = ref<Shop | null>(null)
const deleting = ref(false)

const confirmDelete = (shop: Shop) => {
  shopToDelete.value = shop
}

const deleteShop = async () => {
  if (!shopToDelete.value) return

  deleting.value = true
  try {
    await secureFetch(`/api/shops/${shopToDelete.value._id}`, {
      method: 'DELETE'
    })
    flash.success(t('cms.flash.shopDeleted'))
    shopToDelete.value = null
    await refresh()
  } catch (e) {
    flash.error(t('cms.flash.shopDeleteError'))
    console.error('Failed to delete shop:', e)
  } finally {
    deleting.value = false
  }
}

// Format date helper
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}
</script>
