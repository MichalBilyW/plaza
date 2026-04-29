<template>
	<div class="p-4 sm:p-6 lg:p-8">
		<CmsBreadcrumbs />
		<div class="mb-8">
			<h1 class="text-xl sm:text-2xl font-bold text-gray-900">
				{{ t('cms.events.editEvent') }}
			</h1>
		</div>

		<!-- Loading -->
		<div v-if="pending" class="flex justify-center py-12">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-cms-events-600"></div>
		</div>

		<!-- Not found -->
		<div v-else-if="!event" class="text-center py-12">
			<p class="text-plaza-dark">{{ t('cms.events.notFound') }}</p>
			<NuxtLink to="/cms/akce" class="text-cms-events-600 hover:underline mt-2 inline-block">
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
						class="text-lg font-semibold mb-6 text-cms-events-700 border-b border-cms-events-100 pb-2"
					>
						{{ t('cms.events.basicInfo') }}
					</h2>

					<div class="space-y-6">
						<!-- Název -->
						<div>
							<label for="name" class="block text-sm font-medium text-gray-700 mb-1">
								{{ t('cms.events.name') }} *
							</label>
							<input
								id="name"
								v-model="form.name"
								type="text"
								required
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-events-500 focus:border-transparent"
								:placeholder="t('cms.events.namePlaceholder')"
							/>
							<p class="mt-1 text-xs text-plaza-dark">
								{{ t('cms.events.nameHint') }}
							</p>
							<p v-if="errors.name" class="mt-1 text-sm text-red-600">
								{{ errors.name }}
							</p>
						</div>

						<!-- Obchod -->
						<div>
							<label
								for="shopId"
								class="block text-sm font-medium text-gray-700 mb-1"
							>
								{{ t('cms.events.shop') }} *
							</label>
							<select
								id="shopId"
								v-model="form.shopId"
								required
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-events-500 focus:border-transparent"
							>
								<option value="">{{ t('cms.events.selectShop') }}</option>
								<option v-for="shop in shops" :key="shop._id" :value="shop._id">
									{{ shop.name }}
								</option>
							</select>
							<p v-if="errors.shopId" class="mt-1 text-sm text-red-600">
								{{ errors.shopId }}
							</p>
						</div>

						<!-- Obrázek -->
						<div>
							<CmsImageUpload
								v-model="form.image"
								:label="t('cms.events.image')"
								:hint="t('cms.events.imageHint')"
								preview-class="w-48 h-48 object-cover"
								required
							/>
							<p v-if="errors.image" class="mt-1 text-sm text-red-600">
								{{ errors.image }}
							</p>
						</div>

						<!-- Obsah (WYSIWYG) -->
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1">
								{{ t('cms.events.content') }}
							</label>
							<CmsWysiwyg v-model="form.content" />
							<p class="mt-1 text-xs text-plaza-dark">
								{{ t('cms.events.contentHint') }}
							</p>
						</div>
					</div>
				</div>

				<!-- Nastavení -->
				<div class="bg-white rounded-xl shadow-sm p-6">
					<h2
						class="text-lg font-semibold mb-6 text-cms-events-700 border-b border-cms-events-100 pb-2"
					>
						{{ t('cms.events.settings') }}
					</h2>

					<div class="flex flex-wrap items-start justify-between gap-6">
						<!-- Aktivní -->
						<div class="flex items-end pb-1">
							<label class="inline-flex items-center gap-3 cursor-pointer">
								<input
									type="checkbox"
									v-model="form.isActive"
									class="w-5 h-5 text-cms-events-600 rounded focus:ring-cms-events-500"
								/>
								<span class="text-sm font-medium text-gray-700">{{
									t('cms.events.isActive')
								}}</span>
							</label>
						</div>

						<!-- Zobrazovat do -->
						<div class="flex-1 min-w-[260px]">
							<label
								for="displayUntil"
								class="block text-sm font-medium text-gray-700 mb-1"
							>
								{{ t('cms.events.displayUntil') }}
							</label>
							<div class="relative">
								<input
									id="displayUntil"
									v-model="form.displayUntil"
									type="date"
									class="peer w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-events-500 focus:border-transparent focus:text-gray-900"
									:class="{ 'text-transparent': !form.displayUntil }"
								/>
								<span
									v-if="!form.displayUntil"
									class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none peer-focus:hidden"
								>
									{{ t('cms.events.displayUntilEmpty') }}
								</span>
							</div>
							<p class="mt-1 text-xs text-plaza-dark">
								{{ t('cms.events.displayUntilHint') }}
							</p>
							<button
								v-if="form.displayUntil"
								type="button"
								@click="form.displayUntil = ''"
								class="mt-2 inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-800 transition-colors"
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
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
								{{ t('cms.events.clearDisplayUntil') }}
							</button>
						</div>
					</div>
				</div>

				<!-- Buttons -->
				<div class="flex justify-end gap-3 pt-4">
					<NuxtLink
						to="/cms/akce"
						class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
					>
						{{ t('common.cancel') }}
					</NuxtLink>
					<button
						type="submit"
						:disabled="submitting"
						class="px-6 py-2 bg-cms-events-600 text-white rounded-lg hover:bg-cms-events-700 transition-colors disabled:opacity-50"
					>
						{{ submitting ? t('common.loading') : t('common.save') }}
					</button>
				</div>
			</form>
		</template>
	</div>
</template>

<script setup lang="ts">
import type { Event, Shop } from '~~/shared/types'

definePageMeta({
	layout: 'cms',
	middleware: 'cms',
})

usePlazaSeo({
	title: 'Upravit akci',
	noIndex: true,
})

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { secureFetch } = useCmsAuth()
const flash = useFlashMessages()
const { errors, generalError, clearErrors, handleApiError, scrollToFirstError } = useFormErrors()

const eventId = route.params.id as string

// Form state
const form = reactive({
	name: '',
	image: '',
	content: '',
	shopId: '',
	isActive: true,
	displayUntil: '',
})

// Fetch event
const { data: eventData, pending } = await useFetch<{ data: Event }>(`/api/events/${eventId}`)
const event = computed(() => eventData.value?.data)

// Fetch shops
const { data: shopsData } = await useFetch<{ data: Shop[] }>('/api/shops', {
	query: { limit: 100 },
	server: false,
})
const shops = computed(() => shopsData.value?.data || [])

// Initialize form with event data
watch(
	event,
	(e) => {
		if (e) {
			form.name = e.name || ''
			form.image = e.image || ''
			form.content = e.content || ''
			form.shopId = e.shopId || ''
			form.isActive = e.isActive ?? true
			form.displayUntil = e.displayUntil
				? (new Date(e.displayUntil).toISOString().split('T')[0] ?? '')
				: ''
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
	if (!form.shopId) {
		errors.value.shopId = t('forms.required')
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
		await secureFetch(`/api/events/${eventId}`, {
			method: 'PUT',
			body: {
				name: form.name.trim(),
				image: form.image,
			content: form.content || '',
				shopId: form.shopId,
				isActive: form.isActive,
				displayUntil: form.displayUntil
					? new Date(form.displayUntil).toISOString()
					: null,
			},
		})

		flash.success(t('cms.events.updateSuccess'))
		router.push('/cms/akce')
	} catch (err) {
		handleApiError(err)
		scrollToFirstError()
	} finally {
		submitting.value = false
	}
}
</script>
