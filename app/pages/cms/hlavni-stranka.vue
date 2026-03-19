<template>
	<div class="p-4 sm:p-6 lg:p-8">
		<div class="mb-8">
			<h1 class="text-xl sm:text-2xl font-bold text-gray-900">
				{{ t('cms.homepage.title') }}
			</h1>
			<p class="text-gray-600 mt-1">{{ t('cms.homepage.subtitle') }}</p>
		</div>

		<!-- Loading state -->
		<div v-if="pending" class="flex items-center justify-center py-12">
			<div class="text-center">
				<svg
					class="animate-spin h-8 w-8 text-gray-400 mx-auto mb-4"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
				>
					<circle
						class="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						stroke-width="4"
					/>
					<path
						class="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					/>
				</svg>
				<p class="text-gray-500">{{ t('common.loading') }}</p>
			</div>
		</div>

		<!-- General error -->
		<div
			v-if="generalError"
			class="max-w-4xl mb-4 p-4 bg-red-50 border border-red-200 rounded-lg"
		>
			<p class="text-sm text-red-600">{{ generalError }}</p>
		</div>

		<form v-if="!pending" @submit.prevent="handleSubmit" class="space-y-8 max-w-4xl">
			<!-- Hero sekce -->
			<div class="bg-white rounded-xl shadow-sm p-6">
				<h2 class="text-lg font-semibold mb-6 text-gray-700 border-b border-gray-100 pb-2">
					{{ t('cms.homepage.heroSection') }}
				</h2>

				<div class="space-y-6">
					<!-- Hero fotka -->
					<CmsImageUpload
						v-model="form.heroImage"
						:label="t('cms.homepage.heroImage')"
						:hint="t('cms.homepage.heroImageHint')"
						preview-class="w-full h-64"
					/>

					<!-- Výchozí fotka - zobrazit pouze když není nahrána vlastní -->
					<div
						v-if="!form.heroImage"
						class="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200"
					>
						<p class="text-sm text-gray-600 mb-3">
							{{ t('cms.homepage.defaultImageInfo') }}
						</p>
						<div class="relative">
							<img
								src="/images/homepage/default-hero.jpg"
								:alt="t('cms.homepage.defaultImage')"
								class="w-full h-auto max-h-48 sm:max-h-64 object-cover rounded-lg opacity-75"
							/>
							<div class="absolute inset-0 flex items-center justify-center">
								<span
									class="bg-gray-900/70 text-white text-xs sm:text-sm px-3 py-1 rounded-full"
								>
									{{ t('cms.homepage.defaultImage') }}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Submit button -->
			<div class="flex justify-end">
				<button
					type="submit"
					:disabled="saving"
					class="px-6 py-2 bg-cms-shops-600 text-white rounded-lg hover:bg-cms-shops-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
				>
					<svg
						v-if="saving"
						class="animate-spin h-4 w-4"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle
							class="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							stroke-width="4"
						/>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						/>
					</svg>
					{{ saving ? t('common.saving') : t('common.save') }}
				</button>
			</div>
		</form>
	</div>
</template>

<script setup lang="ts">
import type { Homepage } from '@/shared/types'

definePageMeta({
	layout: 'cms',
	middleware: 'cms',
})

const { t } = useI18n()
const flash = useFlashMessages()

// Form state
const form = reactive({
	heroImage: '' as string | undefined,
})

const saving = ref(false)
const generalError = ref<string | null>(null)

// Fetch data
const { data, pending, error } = await useFetch<Homepage>('/api/homepage')

// Initialize form when data loads
watch(
	data,
	(newData) => {
		if (newData) {
			form.heroImage = newData.heroImage || ''
		}
	},
	{ immediate: true },
)

// Handle error
watch(
	error,
	(newError) => {
		if (newError) {
			generalError.value = t('common.errorLoading')
		}
	},
	{ immediate: true },
)

// Submit handler
async function handleSubmit() {
	saving.value = true
	generalError.value = null

	try {
		await $fetch('/api/homepage', {
			method: 'PUT',
			body: {
				heroImage: form.heroImage?.trim() || '',
			},
		})

		flash.success(t('cms.flash.homepageSaved'))
	} catch (err: unknown) {
		console.error('Save error:', err)
		flash.error(t('cms.flash.homepageSaveError'))
	} finally {
		saving.value = false
	}
}
</script>
