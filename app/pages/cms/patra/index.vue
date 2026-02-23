<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <div class="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900">{{ t('cms.floors.title') }}</h1>
        <p class="text-gray-500 mt-1 text-sm sm:text-base">{{ t('cms.floors.subtitle') }}</p>
      </div>
      <NuxtLink
        to="/cms/patra/novy"
        class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        {{ t('cms.floors.addFloor') }}
      </NuxtLink>
    </div>

    <!-- Loading state -->
    <div v-if="pending" class="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
      {{ t('common.loading') }}
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="bg-white rounded-xl shadow-sm p-8 text-center text-red-500">
      {{ t('common.error') }}: {{ error.message }}
    </div>

    <!-- Empty state -->
    <div v-else-if="!floors.length" class="bg-white rounded-xl shadow-sm p-8 text-center">
      <svg class="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
      <p class="text-gray-500">{{ t('cms.floors.noFloors') }}</p>
    </div>

    <!-- Desktop: Table -->
    <div v-else class="hidden lg:block bg-white rounded-xl shadow-sm overflow-x-auto">
      <table class="w-full min-w-[600px]">
        <thead class="bg-gray-50 border-b">
          <tr>
            <CmsSortableHeader field="level" :sort-icon="getSortIcon('level')" class="w-20" @sort="toggleSort">{{ t('cms.floors.level') }}</CmsSortableHeader>
            <CmsSortableHeader field="name" :sort-icon="getSortIcon('name')" @sort="toggleSort">{{ t('cms.floors.name') }}</CmsSortableHeader>
            <CmsSortableHeader field="slug" :sort-icon="getSortIcon('slug')" @sort="toggleSort">{{ t('cms.floors.slug') }}</CmsSortableHeader>
            <CmsSortableHeader field="isActive" :sort-icon="getSortIcon('isActive')" class="w-24" @sort="toggleSort">{{ t('cms.floors.status') }}</CmsSortableHeader>
            <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">{{ t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="floor in sortedFloors" :key="floor._id" class="hover:bg-gray-50">
            <td class="px-4 py-3">
              <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 font-medium">
                {{ floor.level }}
              </span>
            </td>
            <td class="px-4 py-3">
              <NuxtLink :to="`/cms/patra/${floor._id}`" class="text-gray-900 hover:text-indigo-600 font-medium">
                {{ floor.name }}
              </NuxtLink>
            </td>
            <td class="px-4 py-3 text-sm text-gray-500">
              {{ floor.slug }}
            </td>
            <td class="px-4 py-3">
              <span
                :class="floor.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                class="inline-flex px-2 py-0.5 text-xs font-medium rounded-full"
              >
                {{ floor.isActive ? t('cms.floors.active') : t('cms.floors.inactive') }}
              </span>
            </td>
            <td class="px-4 py-3 text-right">
              <div class="flex items-center justify-end gap-1">
                <NuxtLink
                  :to="`/cms/patra/${floor._id}`"
                  class="text-indigo-600 hover:text-indigo-700 p-1"
                  :title="t('common.edit')"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </NuxtLink>
                <button
                  @click="confirmDelete(floor)"
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
    <div v-if="floors.length" class="lg:hidden space-y-3">
      <NuxtLink
        v-for="floor in sortedFloors"
        :key="floor._id"
        :to="`/cms/patra/${floor._id}`"
        class="block bg-white rounded-xl shadow-sm p-3 active:bg-gray-50 transition-colors"
      >
        <div class="flex items-center gap-3">
          <span class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-800 font-medium flex-shrink-0">
            {{ floor.level }}
          </span>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2">
              <h3 class="font-medium text-gray-900 truncate">{{ floor.name }}</h3>
              <span
                :class="floor.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                class="inline-flex px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0"
              >
                {{ floor.isActive ? t('cms.floors.active') : t('cms.floors.inactive') }}
              </span>
            </div>
            <p class="text-sm text-gray-500 truncate mt-0.5">{{ floor.slug }}</p>
          </div>
          <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </NuxtLink>
    </div>

    <!-- Delete confirmation modal -->
    <div v-if="deleteModal.show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ t('cms.floors.deleteConfirmTitle') }}</h3>
        <p class="text-gray-500 mb-6">{{ t('cms.floors.deleteConfirmMessage', { name: deleteModal.floor?.name }) }}</p>
        <div class="flex gap-3 justify-end">
          <button
            @click="deleteModal.show = false"
            class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            @click="deleteFloor"
            :disabled="deleteModal.loading"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {{ deleteModal.loading ? t('common.loading') : t('common.delete') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Floor, PaginatedResponse } from '@/shared/types'

definePageMeta({
  layout: 'cms',
  middleware: 'cms'
})

const { t } = useI18n()
const { secureFetch } = useCmsAuth()
const flash = useFlashMessages()

usePlazaSeo({
  title: t('cms.floors.title'),
  noIndex: true
})

// Load floors
const { data: floorsData, pending, error, refresh } = await useFetch<PaginatedResponse<Floor>>('/api/floors', {
  query: { limit: 100 }
})
const floors = computed(() => floorsData.value?.data || [])

// Sorting
const { toggleSort, getSortIcon, sortedItems } = useTableSort(floors)
const sortedFloors = sortedItems

// Delete modal
const deleteModal = reactive({
  show: false,
  floor: null as Floor | null,
  loading: false
})

const confirmDelete = (floor: Floor) => {
  deleteModal.floor = floor
  deleteModal.show = true
}

const deleteFloor = async () => {
  if (!deleteModal.floor) return

  deleteModal.loading = true
  try {
    await secureFetch(`/api/floors/${deleteModal.floor._id}`, { method: 'DELETE' })
    flash.success(t('cms.flash.floorDeleted'))
    deleteModal.show = false
    deleteModal.floor = null
    refresh()
  } catch (e) {
    flash.error(t('cms.flash.floorDeleteError'))
    console.error('Failed to delete floor:', e)
  } finally {
    deleteModal.loading = false
  }
}
</script>
