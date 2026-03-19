<template>
	<div class="p-4 sm:p-6 lg:p-8">
		<div class="mb-8">
			<NuxtLink
				to="/cms/patra"
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
						<p v-else class="mt-1 text-xs text-gray-500">
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
						<p v-else class="mt-1 text-xs text-gray-500">
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

					<!-- Obrázek mapy -->
					<CmsImageUpload
						v-model="form.mapImage"
						:label="t('cms.floors.mapImage')"
						:hint="t('cms.floors.mapImageHint')"
						preview-class="w-full h-48"
					/>

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
const { secureFetch } = useCmsAuth()

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
	mapImage: '',
	isActive: true,
})

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
</script>
