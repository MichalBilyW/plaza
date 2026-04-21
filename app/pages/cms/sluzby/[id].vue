<template>
	<div class="p-4 sm:p-6 lg:p-8">
		<CmsBreadcrumbs />
		<div class="mb-8">
			<h1 class="text-xl sm:text-2xl font-bold text-gray-900">
				{{ t('cms.services.editService') }}
			</h1>
		</div>

		<!-- Loading -->
		<div v-if="pending" class="flex justify-center py-12">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-cms-services-600"></div>
		</div>

		<!-- Not found -->
		<div v-else-if="!serviceItem" class="text-center py-12">
			<p class="text-plaza-dark">{{ t('cms.services.notFound') }}</p>
			<NuxtLink
				to="/cms/sluzby"
				class="text-cms-services-600 hover:underline mt-2 inline-block"
			>
				{{ t('common.back') }}
			</NuxtLink>
		</div>

		<template v-else>
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

					<div class="flex flex-wrap items-center justify-between gap-6">
						<!-- Pořadí -->
						<!-- Aktivní -->
						<div class="flex items-end pb-1">
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
						{{ submitting ? t('common.loading') : t('common.save') }}
					</button>
				</div>
			</form>
		</template>
	</div>
</template>

<script setup lang="ts">
import type { Service } from '~~/shared/types'

definePageMeta({
	layout: 'cms',
	middleware: 'cms',
})

usePlazaSeo({
	title: 'Upravit službu',
	noIndex: true,
})

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { secureFetch } = useCmsAuth()
const flash = useFlashMessages()
const { errors, generalError, clearErrors, handleApiError, scrollToFirstError } = useFormErrors()

const serviceId = route.params.id as string

// Form state
const form = reactive({
	icon: '',
	shortDescription: '',
	description: '',
	isActive: true,
})

// Fetch service item
const { data: serviceData, pending } = await useFetch<{ data: Service }>(
	`/api/services/${serviceId}`,
)
const serviceItem = computed(() => serviceData.value?.data)

// Initialize form with service data
watch(
	serviceItem,
	(s) => {
		if (s) {
			form.icon = s.icon || ''
			form.shortDescription = s.shortDescription || ''
			form.description = s.description || ''
			form.isActive = s.isActive ?? true
		}
	},
	{ immediate: true },
)

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
		await secureFetch(`/api/services/${serviceId}`, {
			method: 'PUT',
			body: {
				icon: form.icon,
				shortDescription: form.shortDescription.trim(),
			description: form.description.trim() || '',
				isActive: form.isActive,
			},
		})

		flash.success(t('cms.services.updateSuccess'))
		router.push('/cms/sluzby')
	} catch (err) {
		handleApiError(err)
		scrollToFirstError()
	} finally {
		submitting.value = false
	}
}
</script>
