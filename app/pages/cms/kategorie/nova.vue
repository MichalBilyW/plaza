<template>
	<div class="p-4 sm:p-6 lg:p-8">
		<div class="mb-8">
			<NuxtLink
				to="/cms/kategorie"
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
				{{ t('common.back') }}
			</NuxtLink>
			<h1 class="text-xl sm:text-2xl font-bold text-gray-900">
				{{ t('cms.categories.newCategory') }}
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
					class="text-lg font-semibold mb-6 text-cms-categories-700 border-b border-cms-categories-100 pb-2"
				>
					{{ t('cms.categories.basicInfo') }}
				</h2>

				<div class="space-y-6">
					<!-- Název -->
					<div>
						<label for="name" class="block text-sm font-medium text-gray-700 mb-1">
							{{ t('cms.categories.name') }} *
						</label>
						<input
							id="name"
							v-model="form.name"
							type="text"
							required
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-categories-500 focus:border-transparent"
							:placeholder="t('cms.categories.namePlaceholder')"
						/>
						<p v-if="errors.name" class="mt-1 text-sm text-red-600">
							{{ errors.name }}
						</p>
					</div>

					<!-- Slug -->
					<div>
						<label for="slug" class="block text-sm font-medium text-gray-700 mb-1">
							{{ t('cms.categories.slug') }}
						</label>
						<input
							id="slug"
							v-model="form.slug"
							type="text"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-categories-500 focus:border-transparent"
							:placeholder="t('cms.categories.slugPlaceholder')"
						/>
						<p class="mt-1 text-xs text-gray-500">{{ t('cms.categories.slugHint') }}</p>
					</div>

					<!-- Popis -->
					<div>
						<label
							for="description"
							class="block text-sm font-medium text-gray-700 mb-1"
						>
							{{ t('cms.categories.description') }}
						</label>
						<textarea
							id="description"
							v-model="form.description"
							rows="3"
							maxlength="500"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-categories-500 focus:border-transparent"
							:placeholder="t('cms.categories.descriptionPlaceholder')"
						></textarea>
						<p class="mt-1 text-xs text-gray-500">
							{{ form.description?.length || 0 }}/500
						</p>
					</div>


					<!-- Aktivní -->
					<div>
						<label class="inline-flex items-center gap-3 cursor-pointer">
							<input
								type="checkbox"
								v-model="form.isActive"
								class="w-4 h-4 text-cms-categories-600 rounded focus:ring-cms-categories-500"
							/>
							<span class="text-sm font-medium text-gray-700">{{
								t('cms.categories.isActive')
							}}</span>
						</label>
					</div>
				</div>
			</div>

			<!-- Buttons -->
			<div class="flex justify-end gap-3">
				<NuxtLink
					to="/cms/kategorie"
					class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
				>
					{{ t('common.cancel') }}
				</NuxtLink>
				<button
					type="submit"
					:disabled="submitting"
					class="px-6 py-2 bg-cms-categories-600 text-white rounded-lg hover:bg-cms-categories-700 transition-colors disabled:opacity-50"
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

const { t } = useI18n()
const router = useRouter()
const { secureFetch } = useCmsAuth()
const flash = useFlashMessages()
const { errors, generalError, clearErrors, handleApiError, scrollToFirstError } = useFormErrors()

usePlazaSeo({
	title: t('cms.categories.newCategory'),
	noIndex: true,
})

const form = reactive({
	name: '',
	slug: '',
	description: '',
	isActive: true,
})

const submitting = ref(false)

const handleSubmit = async () => {
	clearErrors()

	if (!form.name.trim()) {
		errors.value.name = t('forms.required')
		scrollToFirstError()
		return
	}

	submitting.value = true

	try {
		const data: Record<string, unknown> = {
			name: form.name.trim(),
			isActive: form.isActive,
		}

		if (form.slug) data.slug = form.slug.trim()
		if (form.description) data.description = form.description.trim()

		await secureFetch('/api/categories', {
			method: 'POST',
			body: data,
		})

		flash.success(t('cms.flash.categoryCreated'))
		router.push('/cms/kategorie')
	} catch (e) {
		const errorMessage = handleApiError(e)
		flash.error(errorMessage || t('cms.flash.categorySaveError'))
		scrollToFirstError()
	} finally {
		submitting.value = false
	}
}
</script>
