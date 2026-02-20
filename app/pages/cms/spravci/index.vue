<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <div class="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900">{{ $t('cms.users.title') }}</h1>
        <p class="text-gray-500 mt-1 text-sm sm:text-base">{{ $t('cms.users.subtitle') }}</p>
      </div>
      <NuxtLink
        to="/cms/spravci/novy"
        class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-plaza-600 text-white rounded-lg hover:bg-plaza-700 transition-colors text-sm sm:text-base"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        {{ $t('cms.users.addUser') }}
      </NuxtLink>
    </div>

    <!-- Loading/Error states -->
    <div v-if="pending" class="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
      {{ $t('common.loading') }}
    </div>

    <div v-else-if="error" class="bg-white rounded-xl shadow-sm p-8 text-center text-red-500">
      {{ $t('common.error') }}: {{ error.message }}
    </div>

    <div v-else-if="!users?.length" class="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
      {{ $t('cms.users.noUsers') }}
    </div>

    <!-- Desktop: Table -->
    <div v-else class="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ $t('cms.users.name') }}
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ $t('cms.users.email') }}
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ $t('cms.users.role') }}
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ $t('cms.users.status') }}
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ $t('cms.users.lastLogin') }}
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ $t('cms.users.actions') }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="user in users" :key="user._id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-plaza-600 flex items-center justify-center text-white text-sm font-medium">
                  {{ user.name?.charAt(0)?.toUpperCase() || '?' }}
                </div>
                <span class="font-medium text-gray-900">{{ user.name }}</span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-gray-500">
              {{ user.email }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                ]"
              >
                {{ user.role === 'admin' ? $t('cms.roles.admin') : $t('cms.roles.editor') }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                ]"
              >
                {{ user.isActive ? $t('cms.users.active') : $t('cms.users.inactive') }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">
              {{ user.lastLoginAt ? formatDate(user.lastLoginAt) : '–' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right">
              <div class="flex items-center justify-end gap-2">
                <NuxtLink
                  :to="`/cms/spravci/${user._id}`"
                  class="text-plaza-600 hover:text-plaza-700 p-1"
                  :title="$t('common.edit')"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </NuxtLink>
                <button
                  v-if="user._id !== currentUserId"
                  @click="confirmDelete(user)"
                  class="text-red-600 hover:text-red-700 p-1"
                  :title="$t('common.delete')"
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
    <div v-if="users?.length" class="lg:hidden space-y-4">
      <div
        v-for="user in users"
        :key="user._id"
        class="bg-white rounded-xl shadow-sm p-4"
      >
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-full bg-plaza-600 flex items-center justify-center text-white font-medium flex-shrink-0">
            {{ user.name?.charAt(0)?.toUpperCase() || '?' }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <h3 class="font-medium text-gray-900 truncate">{{ user.name }}</h3>
                <p class="text-sm text-gray-500 truncate">{{ user.email }}</p>
              </div>
              <div class="flex items-center gap-1 flex-shrink-0">
                <NuxtLink
                  :to="`/cms/spravci/${user._id}`"
                  class="text-plaza-600 hover:text-plaza-700 p-2"
                  :title="$t('common.edit')"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </NuxtLink>
                <button
                  v-if="user._id !== currentUserId"
                  @click="confirmDelete(user)"
                  class="text-red-600 hover:text-red-700 p-2"
                  :title="$t('common.delete')"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-2 mt-3">
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                ]"
              >
                {{ user.role === 'admin' ? $t('cms.roles.admin') : $t('cms.roles.editor') }}
              </span>
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                ]"
              >
                {{ user.isActive ? $t('cms.users.active') : $t('cms.users.inactive') }}
              </span>
            </div>
            <p v-if="user.lastLoginAt" class="text-xs text-gray-400 mt-2">
              {{ $t('cms.users.lastLogin') }}: {{ formatDate(user.lastLoginAt) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete confirmation modal -->
    <Teleport to="body">
      <div
        v-if="userToDelete"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        @click.self="userToDelete = null"
      >
        <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
          <h3 class="text-lg font-semibold mb-2">{{ $t('cms.users.deleteConfirmTitle') }}</h3>
          <p class="text-gray-600 mb-6">
            {{ $t('cms.users.deleteConfirmMessage', { name: userToDelete.name }) }}
          </p>
          <div class="flex justify-end gap-3">
            <button
              @click="userToDelete = null"
              class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              {{ $t('common.cancel') }}
            </button>
            <button
              @click="deleteUser"
              :disabled="deleting"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {{ deleting ? $t('common.loading') : $t('common.delete') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { User } from '@/shared/types'

definePageMeta({
  layout: 'cms',
  middleware: 'cms'
})

const { t } = useI18n()
const { user: currentUser, secureFetch } = useCmsAuth()

usePlazaSeo({
  title: t('cms.users.title'),
  noIndex: true
})

const currentUserId = computed(() => currentUser.value?._id)

// Načíst seznam správců
const { data, pending, error, refresh } = await useFetch<{ data: User[]; pagination: { total: number } }>('/api/users', {
  credentials: 'include'
})

const users = computed(() => data.value?.data || [])

// Delete
const userToDelete = ref<User | null>(null)
const deleting = ref(false)

const confirmDelete = (user: User) => {
  userToDelete.value = user
}

const deleteUser = async () => {
  if (!userToDelete.value) return

  deleting.value = true
  try {
    await secureFetch(`/api/users/${userToDelete.value._id}`, {
      method: 'DELETE'
    })
    userToDelete.value = null
    await refresh()
  } catch (err) {
    console.error('Error deleting user:', err)
  } finally {
    deleting.value = false
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
