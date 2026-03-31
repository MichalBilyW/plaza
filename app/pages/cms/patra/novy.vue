<template>
	<div class="p-4 sm:p-6 lg:p-8">
		<CmsBreadcrumbs />
		<div class="mb-8">
			<h1 class="text-xl sm:text-2xl font-bold text-gray-900">
				{{ t('cms.floors.newFloor') }}
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
					class="text-lg font-semibold mb-6 text-indigo-700 border-b border-indigo-100 pb-2"
				>
					{{ t('cms.floors.basicInfo') }}
				</h2>

				<div class="space-y-4">
					<!-- Název -->
					<div>
						<label for="name" class="block text-sm font-medium text-gray-700 mb-1">
							{{ t('cms.floors.name') }} *
						</label>
						<input
							id="name"
							v-model="form.name"
							type="text"
							required
							:class="[
								'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
								hasError('name') ? 'border-red-500 bg-red-50' : 'border-gray-300',
							]"
							:placeholder="t('cms.floors.namePlaceholder')"
							@input="errors.name = undefined"
						/>
						<p v-if="hasError('name')" class="mt-1 text-sm text-red-600">
							{{ getError('name') }}
						</p>
					</div>

					<!-- Slug -->
					<div>
						<label for="slug" class="block text-sm font-medium text-gray-700 mb-1">
							{{ t('cms.floors.slug') }}
						</label>
						<input
							id="slug"
							v-model="form.slug"
							type="text"
							:class="[
								'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
								hasError('slug') ? 'border-red-500 bg-red-50' : 'border-gray-300',
							]"
							:placeholder="t('cms.floors.slugPlaceholder')"
							@input="errors.slug = undefined"
						/>
						<p v-if="hasError('slug')" class="mt-1 text-sm text-red-600">
							{{ getError('slug') }}
						</p>
						<p v-else class="mt-1 text-xs text-plaza-dark">
							{{ t('cms.floors.slugHint') }}
						</p>
					</div>

					<!-- Level -->
					<div>
						<label for="level" class="block text-sm font-medium text-gray-700 mb-1">
							{{ t('cms.floors.level') }} *
						</label>
						<input
							id="level"
							v-model.number="form.level"
							type="number"
							required
							:class="[
								'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
								hasError('level') ? 'border-red-500 bg-red-50' : 'border-gray-300',
							]"
							:placeholder="t('cms.floors.levelPlaceholder')"
							@input="errors.level = undefined"
						/>
						<p v-if="hasError('level')" class="mt-1 text-sm text-red-600">
							{{ getError('level') }}
						</p>
						<p v-else class="mt-1 text-xs text-plaza-dark">
							{{ t('cms.floors.levelHint') }}
						</p>
					</div>

					<!-- Popis -->
					<div>
						<label
							for="description"
							class="block text-sm font-medium text-gray-700 mb-1"
						>
							{{ t('cms.floors.description') }}
						</label>
						<textarea
							id="description"
							v-model="form.description"
							rows="3"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
							:placeholder="t('cms.floors.descriptionPlaceholder')"
						></textarea>
					</div>

					<!-- SVG mapa patra -->
					<div class="border border-gray-200 rounded-lg p-4">
						<div class="flex items-center justify-between mb-3">
							<div>
								<h3 class="text-sm font-medium text-gray-900">
									{{ t('cms.floors.svgMap') }}
								</h3>
								<p class="text-xs text-plaza-dark mt-0.5">
									{{ t('cms.floors.svgMapHint') }}
								</p>
							</div>
							<div class="flex items-center gap-2">
								<span
									v-if="currentSvgMap"
									class="text-green-600 flex items-center gap-1 text-sm"
								>
									<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
										<path
											fill-rule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
											clip-rule="evenodd"
										/>
									</svg>
									{{ t('cms.floors.hasSvgMap') }}
								</span>
								<span v-else class="text-gray-400 flex items-center gap-1 text-sm">
									<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
										<path
											fill-rule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
											clip-rule="evenodd"
										/>
									</svg>
									{{ t('cms.floors.noSvgMap') }}
								</span>
							</div>
						</div>

						<div class="flex items-center gap-2">
							<p v-if="!isSuperAdmin" class="text-xs text-amber-700">
								{{ t('cms.floors.superAdminOnlySvg') }}
							</p>
							<label
								v-if="isSuperAdmin"
								for="svg-upload"
								class="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
							>
								<svg
									class="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
									/>
								</svg>
								{{
									currentSvgMap
										? t('cms.floors.changeSvgMap')
										: t('cms.floors.uploadSvgMap')
								}}
							</label>
							<input
								v-if="isSuperAdmin"
								id="svg-upload"
								type="file"
								accept=".svg,image/svg+xml"
								class="hidden"
								@change="handleSvgUpload"
							/>
							<button
								v-if="currentSvgMap && isSuperAdmin"
								type="button"
								@click="removeSvgMap"
								class="inline-flex items-center gap-1 px-3 py-1.5 text-red-600 text-sm hover:bg-red-50 rounded-lg transition-colors"
							>
								<svg
									class="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
									/>
								</svg>
								{{ t('cms.floors.removeSvgMap') }}
							</button>
						</div>

						<div v-if="currentSvgMap" class="mt-3 p-2 bg-gray-50 rounded-lg">
							<img
								:src="currentSvgMap"
								alt="SVG mapa patra"
								class="max-w-full h-auto max-h-32 mx-auto block"
							/>
						</div>
					</div>

					<!-- Aktivní -->
					<div class="flex items-center gap-3">
						<input
							id="isActive"
							v-model="form.isActive"
							type="checkbox"
							class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
						/>
						<label for="isActive" class="text-sm font-medium text-gray-700">
							{{ t('cms.floors.isActive') }}
						</label>
					</div>
				</div>
			</div>

			<!-- Submit buttons -->
			<div class="flex gap-4">
				<button
					type="submit"
					:disabled="saving"
					class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
				>
					{{ saving ? t('common.loading') : t('common.save') }}
				</button>
				<NuxtLink
					to="/cms/patra"
					class="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
				>
					{{ t('common.cancel') }}
				</NuxtLink>
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
const { secureFetch, isSuperAdmin, fetchUser } = useCmsAuth()

if (import.meta.client) {
	await fetchUser()
}

usePlazaSeo({
	title: t('cms.floors.newFloor'),
	noIndex: true,
})

const saving = ref(false)
const flash = useFlashMessages()
const {
	errors,
	generalError,
	clearErrors,
	handleApiError,
	hasError,
	getError,
	scrollToFirstError,
} = useFormErrors()

const form = reactive({
	name: '',
	slug: '',
	level: 0,
	description: '',
	svgMap: '',
	isActive: true,
})

const currentSvgMap = computed(() => form.svgMap || null)

const handleSubmit = async () => {
	clearErrors()
	saving.value = true
	try {
		await secureFetch('/api/floors', {
			method: 'POST',
			body: form,
		})
		flash.success(t('cms.flash.floorCreated'))
		router.push('/cms/patra')
	} catch (e) {
		const errorMessage = handleApiError(e)
		flash.error(errorMessage || t('cms.flash.floorSaveError'))
		scrollToFirstError()
	} finally {
		saving.value = false
	}
}

const handleSvgUpload = async (event: Event) => {
	if (!isSuperAdmin.value) {
		flash.error(t('cms.floors.superAdminOnlySvg'))
		return
	}

	const input = event.target as HTMLInputElement
	const file = input.files?.[0]
	if (!file) return

	if (!file.type.includes('svg') && !file.name.endsWith('.svg')) {
		flash.error(t('cms.floors.svgInvalidFormat'))
		input.value = ''
		return
	}

	try {
		const formData = new FormData()
		formData.append('file', file)

		const uploadResponse = await secureFetch<{ url: string }>('/api/upload', {
			method: 'POST',
			body: formData,
		})

		form.svgMap = uploadResponse.url
		flash.success(t('cms.floors.svgUploaded'))
	} catch (e) {
		flash.error(t('cms.floors.svgUploadError'))
		console.error('Failed to upload SVG:', e)
	} finally {
		input.value = ''
	}
}

const removeSvgMap = () => {
	if (!isSuperAdmin.value) {
		flash.error(t('cms.floors.superAdminOnlySvg'))
		return
	}

	form.svgMap = ''
	flash.success(t('cms.floors.svgRemoved'))
}
</script>
