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
				{{ t('cms.categories.editCategory') }}
			</h1>
		</div>

		<!-- Loading state -->
		<div v-if="pending" class="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
			{{ t('common.loading') }}
		</div>

		<!-- Error state -->
		<div
			v-else-if="fetchError"
			class="bg-white rounded-xl shadow-sm p-8 text-center text-red-500"
		>
			{{ t('common.error') }}: {{ fetchError.message }}
		</div>

		<!-- General error -->
		<div
			v-if="generalError && !fetchError"
			class="max-w-2xl mb-4 p-4 bg-red-50 border border-red-200 rounded-lg"
		>
			<p class="text-sm text-red-600">{{ generalError }}</p>
		</div>

		<form
			v-if="category && !fetchError"
			@submit.prevent="handleSubmit"
			class="max-w-4xl space-y-6"
		>
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

			<!-- Info o počtu obchodů -->
			<div v-if="category.shopCount" class="bg-blue-50 rounded-xl p-4">
				<p class="text-sm text-blue-800">
					<svg
						class="w-4 h-4 inline mr-1"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					{{ t('cms.categories.shopCountInfo', { count: category.shopCount }) }}
				</p>
			</div>

			<!-- Buttons -->
			<div class="flex justify-between gap-3">
				<button
					v-if="category.shopCount === 0"
					type="button"
					@click="showDeleteModal = true"
					class="px-4 py-2 text-red-600 hover:text-red-800 transition-colors"
				>
					{{ t('common.delete') }}
				</button>
				<div class="flex-1"></div>
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
					{{ submitting ? t('common.loading') : t('common.save') }}
				</button>
			</div>
		</form>

		<!-- Delete modal -->
		<Teleport to="body">
			<div
				v-if="showDeleteModal"
				class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
			>
				<div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
					<h3 class="text-lg font-semibold mb-2">
						{{ t('cms.categories.deleteConfirmTitle') }}
					</h3>
					<p class="text-gray-600 mb-6">
						{{ t('cms.categories.deleteConfirmMessage', { name: category?.name }) }}
					</p>
					<div class="flex justify-end gap-3">
						<button
							@click="showDeleteModal = false"
							class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
						>
							{{ t('common.cancel') }}
						</button>
						<button
							@click="deleteCategory"
							:disabled="deleting"
							class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
						>
							{{ deleting ? t('common.loading') : t('common.delete') }}
						</button>
					</div>
				</div>
			</div>
		</Teleport>
	</div>
</template>

<script setup lang="ts">
import type { Category } from '~~/shared/types'

definePageMeta({
	layout: 'cms',
	middleware: 'cms',
})

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { secureFetch } = useCmsAuth()
const flash = useFlashMessages()
const { errors, generalError, clearErrors, handleApiError, scrollToFirstError } = useFormErrors()

const categoryId = route.params.id as string

// Fetch category data
const {
	data: category,
	pending,
	error: fetchError,
} = await useFetch<Category>(`/api/categories/${categoryId}`)

// Dynamic SEO title
const seoTitle = computed(() =>
	category.value?.name
		? `${t('cms.categories.editCategory')}: ${category.value.name}`
		: t('cms.categories.editCategory'),
)
watchEffect(() => {
	usePlazaSeo({
		title: seoTitle.value,
		noIndex: true,
	})
})

// Form state
const form = reactive({
	name: '',
	slug: '',
	description: '',
	isActive: true,
})

// Initialize form when data is loaded
watch(
	category,
	(newCategory) => {
		if (newCategory) {
			form.name = newCategory.name || ''
			form.slug = newCategory.slug || ''
			form.description = newCategory.description || ''
			form.isActive = newCategory.isActive ?? true
		}
	},
	{ immediate: true },
)

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
			slug: form.slug.trim() || undefined,
			description: form.description.trim() || undefined,
			isActive: form.isActive,
		}

		await secureFetch(`/api/categories/${categoryId}`, {
			method: 'PUT',
			body: data,
		})

		flash.success(t('cms.flash.categoryUpdated'))
		router.push('/cms/kategorie')
	} catch (e) {
		const errorMessage = handleApiError(e)
		flash.error(errorMessage || t('cms.flash.categorySaveError'))
		scrollToFirstError()
	} finally {
		submitting.value = false
	}
}

// Delete
const showDeleteModal = ref(false)
const deleting = ref(false)

const deleteCategory = async () => {
	deleting.value = true
	try {
		await secureFetch(`/api/categories/${categoryId}`, {
			method: 'DELETE',
		})
		flash.success(t('cms.flash.categoryDeleted'))
		router.push('/cms/kategorie')
	} catch (e) {
		flash.error(t('cms.flash.categoryDeleteError'))
		console.error('Failed to delete category:', e)
	} finally {
		deleting.value = false
	}
}
</script>
