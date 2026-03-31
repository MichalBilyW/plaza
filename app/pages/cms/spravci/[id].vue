<template>
	<div class="p-8">
		<CmsBreadcrumbs />
		<div class="mb-8">
			<h1 class="text-2xl font-bold text-gray-900">{{ t('cms.users.editUser') }}</h1>
		</div>

		<div v-if="pending" class="bg-white rounded-xl shadow-sm p-6 max-w-2xl">
			<p class="text-plaza-dark">{{ t('common.loading') }}</p>
		</div>

		<div v-else-if="error" class="bg-white rounded-xl shadow-sm p-6 max-w-2xl">
			<p class="text-red-500">{{ t('common.error') }}: {{ error.message }}</p>
		</div>

		<div v-else class="bg-white rounded-xl shadow-sm p-6 max-w-2xl">
			<form @submit.prevent="handleSubmit" class="space-y-6">
				<!-- Jméno -->
				<div>
					<label for="name" class="block text-sm font-medium text-gray-700 mb-1">
						{{ t('cms.users.name') }} *
					</label>
					<input
						id="name"
						v-model="form.name"
						type="text"
						required
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-plaza-500 focus:border-transparent"
						:placeholder="t('cms.users.namePlaceholder')"
					/>
					<p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
				</div>

				<!-- Email -->
				<div>
					<label for="email" class="block text-sm font-medium text-gray-700 mb-1">
						{{ t('cms.users.email') }} *
					</label>
					<input
						id="email"
						v-model="form.email"
						type="email"
						required
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-plaza-500 focus:border-transparent"
						:placeholder="t('cms.users.emailPlaceholder')"
					/>
					<p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
				</div>

				<!-- Nové heslo (volitelné) -->
				<div>
					<label for="password" class="block text-sm font-medium text-gray-700 mb-1">
						{{ t('cms.users.newPassword') }}
					</label>
					<input
						id="password"
						v-model="form.password"
						type="password"
						minlength="8"
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-plaza-500 focus:border-transparent"
						:placeholder="t('cms.users.newPasswordPlaceholder')"
					/>
					<p class="mt-1 text-sm text-plaza-dark">
						{{ t('cms.users.newPasswordHint') }}
					</p>
					<p v-if="errors.password" class="mt-1 text-sm text-red-600">
						{{ errors.password }}
					</p>
				</div>

				<!-- Role -->
				<div>
					<label for="role" class="block text-sm font-medium text-gray-700 mb-1">
						{{ t('cms.users.role') }} *
					</label>
					<select
						id="role"
						v-model="form.role"
						:disabled="form.role === 'superadmin' && !isSuperAdmin"
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-plaza-500 focus:border-transparent"
					>
						<option value="editor">{{ t('cms.roles.editor') }}</option>
						<option value="admin">{{ t('cms.roles.admin') }}</option>
						<option
							v-if="isSuperAdmin || form.role === 'superadmin'"
							value="superadmin"
						>
							{{ t('cms.roles.superadmin') }}
						</option>
					</select>
					<p class="mt-1 text-sm text-plaza-dark">{{ t('cms.users.roleHint') }}</p>
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
						{{ t('cms.users.isActive') }}
					</label>
				</div>

				<!-- Metadata -->
				<div class="pt-4 border-t text-sm text-plaza-dark">
					<p v-if="userData?.createdAt">
						{{ t('cms.users.createdAt') }}: {{ formatDate(userData.createdAt) }}
					</p>
					<p v-if="userData?.lastLoginAt">
						{{ t('cms.users.lastLogin') }}: {{ formatDate(userData.lastLoginAt) }}
					</p>
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
						{{ t('common.cancel') }}
					</NuxtLink>
					<button
						type="submit"
						:disabled="submitting"
						class="px-6 py-2 bg-plaza text-white rounded-lg hover:bg-plaza transition-colors disabled:opacity-50"
					>
						{{ submitting ? t('common.loading') : t('common.save') }}
					</button>
				</div>
			</form>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { User } from '@/shared/types'

definePageMeta({
	layout: 'cms',
	middleware: 'cms',
})

const route = useRoute()
const { t } = useI18n()
const { secureFetch, isSuperAdmin } = useCmsAuth()

usePlazaSeo({
	title: t('cms.users.editUser'),
	noIndex: true,
})

const userId = route.params.id as string

// Načíst uživatele
const {
	data: userData,
	pending,
	error,
} = await useFetch<User>(`/api/users/${userId}`, {
	credentials: 'include',
})

const form = reactive({
	name: userData.value?.name || '',
	email: userData.value?.email || '',
	password: '',
	role: userData.value?.role || ('editor' as 'superadmin' | 'admin' | 'editor'),
	isActive: userData.value?.isActive ?? true,
})

// Update form when data loads
watch(
	userData,
	(newData) => {
		if (newData) {
			form.name = newData.name
			form.email = newData.email
			form.role = newData.role
			form.isActive = newData.isActive
		}
	},
	{ immediate: true },
)

const errors = reactive<Record<string, string>>({})
const submitError = ref('')
const submitting = ref(false)
const flash = useFlashMessages()

const handleSubmit = async () => {
	// Reset errors
	for (const key of Object.keys(errors)) {
		Reflect.deleteProperty(errors, key)
	}
	submitError.value = ''
	submitting.value = true

	try {
		// Připravit data - heslo pouze pokud bylo zadáno
		const updateData: Record<string, unknown> = {
			name: form.name,
			email: form.email,
			role: form.role,
			isActive: form.isActive,
		}

		if (form.password) {
			updateData.password = form.password
		}

		await secureFetch(`/api/users/${userId}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(updateData),
		})
		flash.success(t('cms.flash.userUpdated'))
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

const formatDate = (dateString: string) => {
	return new Date(dateString).toLocaleDateString('cs-CZ', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	})
}
</script>
