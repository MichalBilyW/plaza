<template>
	<div class="p-4 sm:p-6 lg:p-8">
		<CmsBreadcrumbs />
		<div class="mb-8">
			<h1 class="text-xl sm:text-2xl font-bold text-gray-900">{{ t('cms.news.newNews') }}</h1>
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
					class="text-lg font-semibold mb-6 text-cms-news-700 border-b border-cms-news-100 pb-2"
				>
					{{ t('cms.news.basicInfo') }}
				</h2>

				<div class="space-y-6">
					<!-- Název -->
					<div>
						<label for="name" class="block text-sm font-medium text-gray-700 mb-1">
							{{ t('cms.news.name') }} *
						</label>
						<input
							id="name"
							v-model="form.name"
							type="text"
							required
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-news-500 focus:border-transparent"
							:placeholder="t('cms.news.namePlaceholder')"
						/>
						<p class="mt-1 text-xs text-plaza-dark">{{ t('cms.news.nameHint') }}</p>
						<p v-if="errors.name" class="mt-1 text-sm text-red-600">
							{{ errors.name }}
						</p>
					</div>

					<!-- Obrázek -->
					<div>
						<CmsImageUpload
							v-model="form.image"
							:label="t('cms.news.image')"
							:hint="t('cms.news.imageHint')"
							preview-class="w-48 h-48 object-cover"
							required
						/>
						<p v-if="errors.image" class="mt-1 text-sm text-red-600">
							{{ errors.image }}
						</p>
					</div>

					<!-- Obsah -->
					<div>
						<CmsWysiwyg v-model="form.content" :label="t('cms.news.content')" />
						<p class="mt-1 text-xs text-plaza-dark">{{ t('cms.news.contentHint') }}</p>
					</div>
				</div>
			</div>

			<!-- Nastavení -->
			<div class="bg-white rounded-xl shadow-sm p-6">
				<h2
					class="text-lg font-semibold mb-6 text-cms-news-700 border-b border-cms-news-100 pb-2"
				>
					{{ t('cms.news.settings') }}
				</h2>

				<!-- Aktivní -->
				<div class="flex items-end mt-6 pb-1">
					<label class="inline-flex items-center gap-3 cursor-pointer">
						<input
							type="checkbox"
							v-model="form.isActive"
							class="w-5 h-5 text-cms-news-600 rounded focus:ring-cms-news-500"
						/>
						<span class="text-sm font-medium text-gray-700">{{
							t('cms.news.isActive')
						}}</span>
					</label>
				</div>
			</div>

			<!-- Buttons -->
			<div class="flex justify-end gap-3 pt-4">
				<NuxtLink
					to="/cms/novinky"
					class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
				>
					{{ t('common.cancel') }}
				</NuxtLink>
				<button
					type="submit"
					:disabled="submitting"
					class="px-6 py-2 bg-cms-news-600 text-white rounded-lg hover:bg-cms-news-700 transition-colors disabled:opacity-50"
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
	title: 'Nová novinka',
	noIndex: true,
})

const { t } = useI18n()
const router = useRouter()
const { secureFetch } = useCmsAuth()
const flash = useFlashMessages()
const { errors, generalError, clearErrors, handleApiError, scrollToFirstError } = useFormErrors()

// Form state
const form = reactive({
	name: '',
	image: '',
	content: '',
	isActive: true,
})

const submitting = ref(false)

const handleSubmit = async () => {
	clearErrors()

	// Validate
	if (!form.name.trim()) {
		errors.value.name = t('forms.required')
	}
	if (!form.image) {
		errors.value.image = t('forms.required')
	}

	if (Object.keys(errors.value).length > 0) {
		scrollToFirstError()
		return
	}

	submitting.value = true

	try {
		await secureFetch('/api/news', {
			method: 'POST',
			body: {
				name: form.name.trim(),
				image: form.image,
				content: form.content,
				isActive: form.isActive,
			},
		})

		flash.success(t('cms.news.createSuccess'))
		router.push('/cms/novinky')
	} catch (err) {
		handleApiError(err)
		scrollToFirstError()
	} finally {
		submitting.value = false
	}
}
</script>
