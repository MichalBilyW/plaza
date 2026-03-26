<template>
	<div class="p-4 sm:p-6 lg:p-8">
		<div class="mb-8">
			<NuxtLink
				to="/cms/sluzby"
				class="inline-flex items-center gap-1 text-plaza-dark hover:text-gray-700 mb-4"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 19l-7-7 7-7"
					/>
				</svg>
				{{ t('common.back') }}
			</NuxtLink>
			<h1 class="text-xl sm:text-2xl font-bold text-gray-900">
				{{ t('cms.services.newService') }}
			</h1>
		</div>

		<!-- General error -->
		<div
			v-if="generalError"
			class="max-w-2xl mb-4 p-4 bg-red-50 border border-red-200 rounded-lg"
		>
			<p class="text-sm text-red-600">{{ generalError }}</p>
		</div>

		<form @submit.prevent="handleSubmit" class="max-w-4xl space-y-6">
			<div class="bg-white rounded-xl shadow-sm p-6">
				<h2
					class="text-lg font-semibold mb-6 text-cms-services-700 border-b border-cms-services-100 pb-2"
				>
					{{ t('cms.services.basicInfo') }}
				</h2>

				<div class="space-y-6">
					<!-- Ikona -->
					<div>
						<CmsIconUpload
							v-model="form.icon"
							:label="t('cms.services.icon')"
							:hint="t('cms.services.iconHint')"
							required
						/>
						<p v-if="errors.icon" class="mt-1 text-sm text-red-600">
							{{ errors.icon }}
						</p>
					</div>

					<!-- Popisek -->
					<div>
						<label
							for="shortDescription"
							class="block text-sm font-medium text-gray-700 mb-1"
						>
							{{ t('cms.services.shortDescription') }} *
						</label>
						<input
							id="shortDescription"
							v-model="form.shortDescription"
							type="text"
							required
							maxlength="120"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-services-500 focus:border-transparent"
							:placeholder="t('cms.services.shortDescriptionPlaceholder')"
						/>
						<p class="mt-1 text-xs text-plaza-dark">
							{{ form.shortDescription.length }}/120
							{{ t('cms.services.characters') }}
						</p>
						<p v-if="errors.shortDescription" class="mt-1 text-sm text-red-600">
							{{ errors.shortDescription }}
						</p>
					</div>

					<!-- Popis -->
					<div>
						<CmsWysiwyg
							v-model="form.description"
							:label="t('cms.services.description')"
						/>
					</div>
				</div>
			</div>

			<!-- Nastavení -->
			<div class="bg-white rounded-xl shadow-sm p-6">
				<h2
					class="text-lg font-semibold mb-6 text-cms-services-700 border-b border-cms-services-100 pb-2"
				>
					{{ t('cms.services.settings') }}
				</h2>

				<!-- Aktivní -->
				<div class="flex items-end mt-6 pb-1">
					<label class="inline-flex items-center gap-3 cursor-pointer">
						<input
							type="checkbox"
							v-model="form.isActive"
							class="w-5 h-5 text-cms-services-600 rounded focus:ring-cms-services-500"
						/>
						<span class="text-sm font-medium text-gray-700">{{
							t('cms.services.isActive')
						}}</span>
					</label>
				</div>
			</div>

			<!-- Buttons -->
			<div class="flex justify-end gap-3 pt-4">
				<NuxtLink
					to="/cms/sluzby"
					class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
				>
					{{ t('common.cancel') }}
				</NuxtLink>
				<button
					type="submit"
					:disabled="submitting"
					class="px-6 py-2 bg-cms-services-600 text-white rounded-lg hover:bg-cms-services-700 transition-colors disabled:opacity-50"
				>
					{{ submitting ? t('common.loading') : t('common.create') }}
				</button>
			</div>
		</form>
	</div>
</template>

<script setup lang="ts">
definePageMeta({
	layout: 'cms',
	middleware: 'cms',
})

usePlazaSeo({
	title: 'Nová služba',
	noIndex: true,
})

const { t } = useI18n()
const router = useRouter()
const { secureFetch } = useCmsAuth()
const flash = useFlashMessages()
const { errors, generalError, clearErrors, handleApiError, scrollToFirstError } = useFormErrors()

// Form state
const form = reactive({
	icon: '',
	shortDescription: '',
	description: '',
	isActive: true,
})

const submitting = ref(false)

const handleSubmit = async () => {
	clearErrors()

	// Validate
	if (!form.icon) {
		errors.value.icon = t('forms.required')
	}
	if (!form.shortDescription.trim()) {
		errors.value.shortDescription = t('forms.required')
	}

	if (Object.keys(errors.value).length > 0) {
		scrollToFirstError()
		return
	}

	submitting.value = true

	try {
		await secureFetch('/api/services', {
			method: 'POST',
			body: {
				icon: form.icon,
				shortDescription: form.shortDescription.trim(),
				description: form.description.trim() || undefined,
				isActive: form.isActive,
			},
		})

		flash.success(t('cms.services.createSuccess'))
		router.push('/cms/sluzby')
	} catch (err) {
		handleApiError(err)
		scrollToFirstError()
	} finally {
		submitting.value = false
	}
}
</script>
