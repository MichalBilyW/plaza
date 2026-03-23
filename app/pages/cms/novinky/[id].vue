<template>
	<div class="p-4 sm:p-6 lg:p-8">
		<div class="mb-8">
			<NuxtLink
				to="/cms/novinky"
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
				{{ t('cms.news.editNews') }}
			</h1>
		</div>

		<!-- Loading -->
		<div v-if="pending" class="flex justify-center py-12">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-cms-news-600"></div>
		</div>

		<!-- Not found -->
		<div v-else-if="!newsItem" class="text-center py-12">
			<p class="text-plaza-dark">{{ t('cms.news.notFound') }}</p>
			<NuxtLink to="/cms/novinky" class="text-cms-news-600 hover:underline mt-2 inline-block">
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
							<CmsWysiwyg
								v-model="form.content"
								:label="t('cms.news.content')"
							/>
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

					<div class="flex flex-wrap items-center justify-between gap-6">
						<!-- Aktivní -->
						<div class="flex items-end pb-1">
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
						{{ submitting ? t('common.loading') : t('common.save') }}
					</button>
				</div>
			</form>
		</template>
	</div>
</template>

<script setup lang="ts">
import type { News } from '~~/shared/types'

definePageMeta({
	layout: 'cms',
	middleware: 'cms',
})

usePlazaSeo({
	title: 'Upravit novinku',
	noIndex: true,
})

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { secureFetch } = useCmsAuth()
const flash = useFlashMessages()
const { errors, generalError, clearErrors, handleApiError, scrollToFirstError } = useFormErrors()

const newsId = route.params.id as string

// Form state
const form = reactive({
	name: '',
	image: '',
	content: '',
	isActive: true,
})

// Fetch news item
const { data: newsData, pending } = await useFetch<{ data: News }>(`/api/news/${newsId}`)
const newsItem = computed(() => newsData.value?.data)

// Initialize form with news data
watch(
	newsItem,
	(n) => {
		if (n) {
			form.name = n.name || ''
			form.image = n.image || ''
			form.content = n.content || ''
			form.isActive = n.isActive ?? true
		}
	},
	{ immediate: true },
)

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
		await secureFetch(`/api/news/${newsId}`, {
			method: 'PUT',
			body: {
				name: form.name.trim(),
				image: form.image,
				content: form.content,
				isActive: form.isActive,
			},
		})

		flash.success(t('cms.news.updateSuccess'))
		router.push('/cms/novinky')
	} catch (err) {
		handleApiError(err)
		scrollToFirstError()
	} finally {
		submitting.value = false
	}
}
</script>
