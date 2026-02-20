<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-900 p-4">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-xl shadow-2xl p-8">
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-gray-900">{{ t('cms.title') }}</h1>
          <p class="text-gray-500 mt-1">{{ t('cms.login.subtitle') }}</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-sm text-red-600">{{ error }}</p>
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
              {{ t('cms.login.email') }}
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              autocomplete="email"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-plaza-500 focus:border-plaza-500"
              :placeholder="t('cms.login.emailPlaceholder')"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
              {{ t('cms.login.password') }}
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              autocomplete="current-password"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-plaza-500 focus:border-plaza-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full px-4 py-2 bg-plaza-600 text-white font-semibold rounded-lg hover:bg-plaza-700 focus:ring-2 focus:ring-plaza-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="isLoading" class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ t('cms.login.submitting') }}
            </span>
            <span v-else>{{ t('cms.login.submit') }}</span>
          </button>
        </form>

        <div class="mt-6 text-center">
          <NuxtLink to="/" class="text-sm text-gray-500 hover:text-gray-700">
            {{ t('common.backToSite') }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const { t } = useI18n()

usePlazaSeo({
  title: t('cms.login.title'),
  noIndex: true
})

const { login } = useCmsAuth()

const email = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  error.value = ''
  isLoading.value = true

  try {
    await login(email.value, password.value)
    await navigateTo('/cms')
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    error.value = err.data?.message || t('cms.login.error')
  } finally {
    isLoading.value = false
  }
}
</script>
