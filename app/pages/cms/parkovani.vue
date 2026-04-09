<template>
	<div class="p-4 sm:p-6 lg:p-8">
		<div class="mb-8">
			<h1 class="text-xl sm:text-2xl font-bold text-gray-900">
				{{ t('cms.parking.title') }}
			</h1>
			<p class="text-gray-600 mt-1">{{ t('cms.parking.subtitle') }}</p>
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
				<p class="text-plaza-dark">{{ t('common.loading') }}</p>
			</div>
		</div>

		<!-- General error -->
		<div
			v-if="generalError"
			class="max-w-4xl mb-4 p-4 bg-red-50 border border-red-200 rounded-lg"
		>
			<p class="text-sm text-red-600">{{ generalError }}</p>
		</div>

		<form v-if="!pending" class="space-y-8 max-w-4xl" @submit.prevent="handleSubmit">
			<div class="bg-white rounded-xl shadow-sm p-6">
				<h2 class="text-lg font-semibold mb-6 text-gray-700 border-b border-gray-100 pb-2">
					{{ t('cms.parking.contentSection') }}
				</h2>

				<div class="space-y-6">
					<!-- Info o parkovišti (omezený wysiwyg) -->
					<CmsWysiwyg
						v-model="form.parkingContent"
						:limited="true"
						:label="t('cms.generalInfo.parkingContent')"
						:hint="t('cms.generalInfo.parkingContentHint')"
					/>

					<!-- Fotka parkoviště -->
					<CmsImageUpload
						v-model="form.parkingImage"
						:label="t('cms.generalInfo.parkingImage')"
						:hint="t('cms.generalInfo.parkingImageHint')"
						preview-class="w-full h-48 object-cover"
					/>

					<!-- Výchozí fotka - zobrazit pouze když není nahrána vlastní -->
					<div
						v-if="!form.parkingImage"
						class="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200"
					>
						<p class="text-sm text-gray-600 mb-3">
							{{ t('cms.generalInfo.parkingDefaultImageInfo') }}
						</p>
						<div class="relative">
							<img
								src="/images/default-parking.jpg"
								:alt="t('cms.generalInfo.parkingDefaultImage')"
								class="w-full h-auto max-h-48 sm:max-h-64 object-cover rounded-lg opacity-75"
							/>
							<div class="absolute inset-0 flex items-center justify-center">
								<span
									class="bg-gray-900/70 text-white text-xs sm:text-sm px-3 py-1 rounded-full"
								>
									{{ t('cms.generalInfo.parkingDefaultImage') }}
								</span>
							</div>
						</div>
					</div>

					<!-- Ostatní informace (ceník apod.) -->
					<CmsWysiwyg
						v-model="form.parkingOtherInfo"
						:label="t('cms.generalInfo.parkingOtherInfo')"
					/>
				</div>
			</div>

			<!-- Submit button -->
			<div class="flex justify-end">
				<button
					type="submit"
					:disabled="submitting"
					class="px-6 py-2 bg-cms-shops-600 text-white rounded-lg hover:bg-cms-shops-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
				>
					<svg
						v-if="submitting"
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
					{{ submitting ? t('common.saving') : t('common.save') }}
				</button>
			</div>
		</form>
	</div>
</template>

<script setup lang="ts">
import type { GeneralInfo } from '~~/shared/types'

definePageMeta({
	layout: 'cms',
	middleware: 'cms',
})

const { t } = useI18n()
const { secureFetch } = useCmsAuth()
const router = useRouter()

usePlazaSeo({
	title: t('cms.parking.title'),
	noIndex: true,
})

const form = reactive({
	parkingContent: '',
	parkingImage: '',
	parkingOtherInfo: '',
})

const submitting = ref(false)
const flash = useFlashMessages()
const { generalError, clearErrors, handleApiError } = useFormErrors()

const { data, pending } = await useFetch<GeneralInfo>('/api/general-info')

watch(
	data,
	(info) => {
		if (info) {
			form.parkingContent = info.parkingContent || ''
			form.parkingImage = info.parkingImage || ''
			form.parkingOtherInfo = info.parkingOtherInfo || ''
		}
	},
	{ immediate: true },
)

const handleSubmit = async () => {
	clearErrors()
	submitting.value = true

	try {
		await secureFetch('/api/general-info', {
			method: 'PUT',
			body: {
				parkingContent: form.parkingContent?.trim() || '',
				parkingImage: form.parkingImage || '',
				parkingOtherInfo: form.parkingOtherInfo?.trim() || '',
			},
		})

		flash.success(t('cms.flash.parkingSaved'))
		router.push('/cms')
	} catch (e) {
		const errorMessage = handleApiError(e)
		flash.error(errorMessage || t('cms.flash.parkingSaveError'))
	} finally {
		submitting.value = false
	}
}
</script>
