<template>
  <div class="p-8">
    <div class="mb-8">
      <NuxtLink
        to="/cms/spravci"
        class="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        {{ $t('common.back') }}
      </NuxtLink>
      <h1 class="text-2xl font-bold text-gray-900">{{ $t('cms.users.newUser') }}</h1>
    </div>

    <div class="bg-white rounded-xl shadow-sm p-6 max-w-2xl">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Jméno -->
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
            {{ $t('cms.users.name') }} *
          </label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-plaza-500 focus:border-transparent"
            :placeholder="$t('cms.users.namePlaceholder')"
          />
          <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
        </div>

        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
            {{ $t('cms.users.email') }} *
          </label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-plaza-500 focus:border-transparent"
            :placeholder="$t('cms.users.emailPlaceholder')"
          />
          <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
        </div>

        <!-- Heslo -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
            {{ $t('cms.users.password') }} *
          </label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            minlength="8"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-plaza-500 focus:border-transparent"
            :placeholder="$t('cms.users.passwordPlaceholder')"
          />
          <p class="mt-1 text-sm text-gray-500">{{ $t('cms.users.passwordHint') }}</p>
          <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
        </div>

        <!-- Role -->
        <div>
          <label for="role" class="block text-sm font-medium text-gray-700 mb-1">
            {{ $t('cms.users.role') }} *
          </label>
          <select
            id="role"
            v-model="form.role"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-plaza-500 focus:border-transparent"
          >
            <option value="editor">{{ $t('cms.roles.editor') }}</option>
            <option value="admin">{{ $t('cms.roles.admin') }}</option>
          </select>
          <p class="mt-1 text-sm text-gray-500">{{ $t('cms.users.roleHint') }}</p>
        </div>

        <!-- Aktivní -->
        <div class="flex items-center gap-3">
          <input
            id="isActive"
            v-model="form.isActive"
            type="checkbox"
            class="w-4 h-4 text-plaza-600 rounded focus:ring-plaza-500"
          />
          <label for="isActive" class="text-sm font-medium text-gray-700">
            {{ $t('cms.users.isActive') }}
          </label>
        </div>

        <!-- Error message -->
        <div v-if="submitError" class="p-4 bg-red-50 text-red-600 rounded-lg">
          {{ submitError }}
        </div>

        <!-- Buttons -->
        <div class="flex justify-end gap-3 pt-4">
          <NuxtLink
            to="/cms/spravci"
            class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            {{ $t('common.cancel') }}
          </NuxtLink>
          <button
            type="submit"
            :disabled="submitting"
            class="px-6 py-2 bg-plaza-600 text-white rounded-lg hover:bg-plaza-700 transition-colors disabled:opacity-50"
          >
            {{ submitting ? $t('common.loading') : $t('common.create') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'cms',
  middleware: 'cms'
})

const { t } = useI18n()
const { secureFetch } = useCmsAuth()

usePlazaSeo({
  title: t('cms.users.newUser'),
  noIndex: true
})

const form = reactive({
  name: '',
  email: '',
  password: '',
  role: 'editor' as 'admin' | 'editor',
  isActive: true
})

const errors = reactive<Record<string, string>>({})
const submitError = ref('')
const submitting = ref(false)
const flash = useFlashMessages()

const handleSubmit = async () => {
  // Reset errors
  Object.keys(errors).forEach(key => delete errors[key])
  submitError.value = ''
  submitting.value = true

  try {
    await secureFetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    flash.success(t('cms.flash.userCreated'))
    await navigateTo('/cms/spravci')
  } catch (err: unknown) {
    const error = err as { data?: { details?: Record<string, string>; message?: string } }
    if (error.data?.details) {
      Object.assign(errors, error.data.details)
    }
    const errorMessage = error.data?.message || t('cms.flash.userSaveError')
    submitError.value = errorMessage
    flash.error(errorMessage)
    // Scroll na chybu
    nextTick(() => {
      const errorEl = document.querySelector('.text-red-600, .border-red-500') as HTMLElement
      errorEl?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  } finally {
    submitting.value = false
  }
}
</script>
