<template>
	<div class="p-8">
		<div class="mb-8">
			<NuxtLink
				to="/cms"
				class="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 19l-7-7 7-7"
					/>
				</svg>
				{{ $t('common.back') }}
			</NuxtLink>
			<h1 class="text-2xl font-bold text-gray-900">{{ $t('cms.account.title') }}</h1>
			<p class="text-gray-500 mt-1">{{ $t('cms.account.subtitle') }}</p>
		</div>

		<div class="grid gap-6 max-w-2xl">
			<!-- Informace o účtu -->
			<div class="bg-white rounded-xl shadow-sm p-6">
				<h2 class="text-lg font-semibold mb-4">{{ $t('cms.account.info') }}</h2>
				<div class="space-y-3">
					<div class="flex justify-between py-2 border-b">
						<span class="text-gray-500">{{ $t('cms.users.name') }}</span>
						<span class="font-medium">{{ user?.name }}</span>
					</div>
					<div class="flex justify-between py-2 border-b">
						<span class="text-gray-500">{{ $t('cms.users.email') }}</span>
						<span class="font-medium">{{ user?.email }}</span>
					</div>
					<div class="flex justify-between py-2">
						<span class="text-gray-500">{{ $t('cms.users.role') }}</span>
						<span
							:class="[
								'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
								user?.role === 'admin'
									? 'bg-purple-100 text-purple-800'
									: 'bg-blue-100 text-blue-800',
							]"
						>
							{{
								user?.role === 'admin'
									? $t('cms.roles.admin')
									: $t('cms.roles.editor')
							}}
						</span>
					</div>
				</div>
			</div>

			<!-- Změna hesla -->
			<div class="bg-white rounded-xl shadow-sm p-6">
				<h2 class="text-lg font-semibold mb-4">{{ $t('cms.account.changePassword') }}</h2>

				<form @submit.prevent="handleChangePassword" class="space-y-4">
					<!-- Aktuální heslo -->
					<div>
						<label
							for="currentPassword"
							class="block text-sm font-medium text-gray-700 mb-1"
						>
							{{ $t('cms.account.currentPassword') }} *
						</label>
						<input
							id="currentPassword"
							v-model="passwordForm.currentPassword"
							type="password"
							required
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-plaza-500 focus:border-transparent"
						/>
						<p v-if="errors.currentPassword" class="mt-1 text-sm text-red-600">
							{{ errors.currentPassword }}
						</p>
					</div>

					<!-- Nové heslo -->
					<div>
						<label
							for="newPassword"
							class="block text-sm font-medium text-gray-700 mb-1"
						>
							{{ $t('cms.account.newPassword') }} *
						</label>
						<input
							id="newPassword"
							v-model="passwordForm.newPassword"
							type="password"
							required
							minlength="8"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-plaza-500 focus:border-transparent"
						/>
						<p class="mt-1 text-sm text-gray-500">{{ $t('cms.users.passwordHint') }}</p>
						<p v-if="errors.newPassword" class="mt-1 text-sm text-red-600">
							{{ errors.newPassword }}
						</p>
					</div>

					<!-- Potvrzení hesla -->
					<div>
						<label
							for="confirmPassword"
							class="block text-sm font-medium text-gray-700 mb-1"
						>
							{{ $t('cms.account.confirmPassword') }} *
						</label>
						<input
							id="confirmPassword"
							v-model="passwordForm.confirmPassword"
							type="password"
							required
							minlength="8"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-plaza-500 focus:border-transparent"
						/>
						<p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">
							{{ errors.confirmPassword }}
						</p>
					</div>

					<!-- Error message -->
					<div v-if="submitError" class="p-4 bg-red-50 text-red-600 rounded-lg">
						{{ submitError }}
					</div>

					<!-- Submit -->
					<div class="flex justify-end pt-2">
						<button
							type="submit"
							:disabled="submitting"
							class="px-6 py-2 bg-plaza-600 text-white rounded-lg hover:bg-plaza-700 transition-colors disabled:opacity-50"
						>
							{{
								submitting
									? $t('common.loading')
									: $t('cms.account.changePasswordBtn')
							}}
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
definePageMeta({
	layout: 'cms',
	middleware: 'cms',
})

const { t } = useI18n()
const { user, secureFetch } = useCmsAuth()

usePlazaSeo({
	title: t('cms.account.title'),
	noIndex: true,
})

const passwordForm = reactive({
	currentPassword: '',
	newPassword: '',
	confirmPassword: '',
})

const errors = reactive<Record<string, string>>({})
const submitError = ref('')
const submitting = ref(false)
const flash = useFlashMessages()

const handleChangePassword = async () => {
	// Reset messages
	Object.keys(errors).forEach((key) => delete errors[key])
	submitError.value = ''

	// Client-side validation
	if (passwordForm.newPassword !== passwordForm.confirmPassword) {
		errors.confirmPassword = t('cms.account.passwordMismatch')
		nextTick(() => {
			const errorEl = document.querySelector('.text-red-600, .border-red-500') as HTMLElement
			errorEl?.scrollIntoView({ behavior: 'smooth', block: 'center' })
		})
		return
	}

	if (passwordForm.newPassword.length < 8) {
		errors.newPassword = t('cms.account.passwordTooShort')
		nextTick(() => {
			const errorEl = document.querySelector('.text-red-600, .border-red-500') as HTMLElement
			errorEl?.scrollIntoView({ behavior: 'smooth', block: 'center' })
		})
		return
	}

	submitting.value = true

	try {
		await secureFetch('/api/auth/change-password', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(passwordForm),
		})

		// Reset form
		passwordForm.currentPassword = ''
		passwordForm.newPassword = ''
		passwordForm.confirmPassword = ''

		flash.success(t('cms.flash.passwordChanged'))
	} catch (err: unknown) {
		const error = err as { data?: { details?: Record<string, string>; message?: string } }
		if (error.data?.details) {
			Object.assign(errors, error.data.details)
		}
		const errorMessage = error.data?.message || t('cms.flash.passwordChangeError')
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
