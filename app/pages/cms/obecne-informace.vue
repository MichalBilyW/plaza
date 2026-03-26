<template>
	<div class="p-4 sm:p-6 lg:p-8">
		<div class="mb-8">
			<h1 class="text-xl sm:text-2xl font-bold text-gray-900">
				{{ t('cms.generalInfo.title') }}
			</h1>
			<p class="text-gray-600 mt-1">{{ t('cms.generalInfo.subtitle') }}</p>
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

		<form v-if="!pending" @submit.prevent="handleSubmit" class="space-y-8 max-w-4xl">
			<!-- Základní informace -->
			<div class="bg-white rounded-xl shadow-sm p-6">
				<h2 class="text-lg font-semibold mb-6 text-gray-700 border-b border-gray-100 pb-2">
					{{ t('cms.generalInfo.basicInfo') }}
				</h2>

				<div class="space-y-6">
					<!-- Nadpis -->
					<div>
						<label for="title" class="block text-sm font-medium text-gray-700 mb-1">
							{{ t('cms.generalInfo.titleLabel') }}
						</label>
						<input
							id="title"
							v-model="form.title"
							type="text"
							maxlength="200"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-plaza-500 focus:border-transparent"
							:placeholder="t('cms.generalInfo.titlePlaceholder')"
						/>
						<p class="mt-1 text-xs text-plaza-dark">
							{{ form.title?.length || 0 }}/200
						</p>
					</div>

					<!-- Krátký text -->
					<div>
						<label for="shortText" class="block text-sm font-medium text-gray-700 mb-1">
							{{ t('cms.generalInfo.shortText') }}
						</label>
						<textarea
							id="shortText"
							v-model="form.shortText"
							rows="2"
							maxlength="500"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-plaza-500 focus:border-transparent"
							:placeholder="t('cms.generalInfo.shortTextPlaceholder')"
						></textarea>
						<p class="mt-1 text-xs text-plaza-dark">
							{{ form.shortText?.length || 0 }}/500
						</p>
					</div>

					<!-- Média -->
					<div>
						<div class="space-y-6">
							<!-- Galerie -->
							<CmsGalleryUpload
								v-model="form.gallery"
								:label="t('cms.generalInfo.gallery')"
								:hint="t('cms.generalInfo.galleryHint')"
								:max="10"
							/>
						</div>
					</div>

					<!-- Text -->
					<CmsWysiwyg
						v-model="form.text"
						:label="t('cms.generalInfo.text')"
						:hint="t('cms.generalInfo.hint')"
					/>
				</div>
			</div>

			<!-- Sociální sítě -->
			<div class="bg-white rounded-xl shadow-sm p-6">
				<h2 class="text-lg font-semibold mb-6 text-gray-700 border-b border-gray-100 pb-2">
					{{ t('cms.generalInfo.socialLinks') }}
				</h2>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<!-- Facebook -->
					<div>
						<label for="facebook" class="block text-sm font-medium text-gray-700 mb-1">
							Facebook
						</label>
						<input
							id="facebook"
							v-model="form.facebook"
							type="url"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-plaza-500 focus:border-transparent"
							placeholder="https://facebook.com/..."
						/>
					</div>

					<!-- Instagram -->
					<div>
						<label for="instagram" class="block text-sm font-medium text-gray-700 mb-1">
							Instagram
						</label>
						<input
							id="instagram"
							v-model="form.instagram"
							type="url"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-plaza-500 focus:border-transparent"
							placeholder="https://instagram.com/..."
						/>
					</div>
				</div>
			</div>

			<!-- Otevírací doba -->
			<div class="bg-white rounded-xl shadow-sm p-6">
				<h2 class="text-lg font-semibold mb-6 text-gray-700 border-b border-gray-100 pb-2">
					{{ t('cms.generalInfo.openingHours') }}
				</h2>

				<div class="space-y-3">
					<div
						v-for="(entry, index) in form.openingHours"
						:key="entry.day"
						class="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-lg"
					>
						<span class="w-24 text-sm font-medium text-gray-700">
							{{ t(`cms.shops.days.${entry.day}`) }}
						</span>

						<label class="inline-flex items-center gap-2">
							<input
								type="checkbox"
								v-model="entry.closed"
								class="w-4 h-4 text-plaza-600 rounded focus:ring-plaza-500"
							/>
							<span class="text-sm text-gray-600">{{ t('cms.shops.closed') }}</span>
						</label>

						<div v-if="!entry.closed" class="flex items-center gap-2 shrink-0">
							<input
								v-model="entry.open"
								type="time"
								class="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-plaza-500 focus:border-transparent text-sm"
							/>
							<span class="text-gray-400">–</span>
							<input
								v-model="entry.close"
								type="time"
								class="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-plaza-500 focus:border-transparent text-sm"
							/>
						</div>
					</div>
				</div>
			</div>

			<!-- Speciální otevírací doba -->
			<div class="bg-white rounded-xl shadow-sm p-6">
				<div class="flex items-center justify-between mb-6">
					<h2
						class="text-lg font-semibold text-gray-700 border-b border-gray-100 pb-2 flex-1"
					>
						{{ t('cms.generalInfo.specialOpeningHours') }}
					</h2>
					<button
						type="button"
						@click="addSpecialOpeningHours"
						class="ml-4 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
					>
						+ {{ t('cms.shops.addSpecialHours') }}
					</button>
				</div>

				<div
					v-if="form.specialOpeningHours.length === 0"
					class="text-center py-6 text-plaza-dark"
				>
					{{ t('cms.shops.noSpecialHours') }}
				</div>

				<div v-else class="space-y-4">
					<div
						v-for="(entry, index) in form.specialOpeningHours"
						:key="index"
						class="p-4 bg-gray-50 rounded-lg border border-gray-200"
					>
						<div class="flex items-start justify-between mb-3">
							<div class="flex items-center gap-4">
								<select
									v-model="entry.type"
									class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-plaza-500"
								>
									<option value="single">{{ t('cms.shops.singleDay') }}</option>
									<option value="range">{{ t('cms.shops.dateRange') }}</option>
								</select>
							</div>
							<button
								type="button"
								@click="removeSpecialOpeningHours(index)"
								class="text-red-500 hover:text-red-700 p-1"
							>
								<svg
									class="w-5 h-5"
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
							</button>
						</div>

						<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
							<!-- Jednotlivý den -->
							<div v-if="entry.type === 'single'">
								<label class="block text-xs text-plaza-dark mb-1">{{
									t('cms.shops.date')
								}}</label>
								<input
									v-model="entry.date"
									type="date"
									class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-plaza-500"
								/>
							</div>

							<!-- Období od-do -->
							<template v-else>
								<div>
									<label class="block text-xs text-plaza-dark mb-1">{{
										t('cms.shops.dateFrom')
									}}</label>
									<input
										v-model="entry.dateFrom"
										type="date"
										class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-plaza-500"
									/>
								</div>
								<div>
									<label class="block text-xs text-plaza-dark mb-1">{{
										t('cms.shops.dateTo')
									}}</label>
									<input
										v-model="entry.dateTo"
										type="date"
										class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-plaza-500"
									/>
								</div>
							</template>

							<!-- Zavřeno checkbox -->
							<div class="flex items-end pb-1">
								<label class="inline-flex items-center gap-2">
									<input
										type="checkbox"
										v-model="entry.closed"
										class="w-4 h-4 text-plaza-600 rounded focus:ring-plaza-500"
									/>
									<span class="text-sm text-gray-600">{{
										t('cms.shops.closed')
									}}</span>
								</label>
							</div>

							<!-- Otevírací hodiny (pokud není zavřeno) -->
							<template v-if="!entry.closed">
								<div class="flex items-end gap-2">
									<div>
										<label class="block text-xs text-plaza-dark mb-1">{{
											t('cms.shops.openTime')
										}}</label>
										<input
											v-model="entry.open"
											type="time"
											class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-plaza-500"
										/>
									</div>
									<span class="pb-1.5 text-gray-400">–</span>
									<div>
										<label class="block text-xs text-plaza-dark mb-1">{{
											t('cms.shops.closeTime')
										}}</label>
										<input
											v-model="entry.close"
											type="time"
											class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-plaza-500"
										/>
									</div>
								</div>
							</template>
						</div>

						<!-- Poznámka -->
						<div class="mt-3">
							<label class="block text-xs text-plaza-dark mb-1">{{
								t('cms.shops.specialNote')
							}}</label>
							<input
								v-model="entry.note"
								type="text"
								maxlength="200"
								class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-plaza-500"
								:placeholder="t('cms.shops.specialNotePlaceholder')"
							/>
						</div>
					</div>
				</div>
			</div>

			<!-- Buttons -->
			<div class="flex justify-end gap-3 pt-4">
				<button
					type="submit"
					:disabled="submitting"
					class="px-6 py-2 bg-plaza text-white rounded-lg hover:bg-plaza transition-colors disabled:opacity-50"
				>
					{{ submitting ? t('common.loading') : t('common.save') }}
				</button>
			</div>
		</form>
	</div>
</template>

<script setup lang="ts">
import type { DayOfWeek, GeneralInfo } from '~~/shared/types'

definePageMeta({
	layout: 'cms',
	middleware: 'cms',
})

const { t } = useI18n()
const { secureFetch } = useCmsAuth()
const router = useRouter()

usePlazaSeo({
	title: t('cms.generalInfo.title'),
	noIndex: true,
})

// Days of week
const daysOfWeek: DayOfWeek[] = [
	'monday',
	'tuesday',
	'wednesday',
	'thursday',
	'friday',
	'saturday',
	'sunday',
]

// Form state
interface SpecialOpeningHoursForm {
	type: 'single' | 'range'
	date: string
	dateFrom: string
	dateTo: string
	open: string
	close: string
	closed: boolean
	note: string
}

const form = reactive({
	title: '',
	shortText: '',
	text: '',
	facebook: '',
	instagram: '',
	gallery: [] as string[],
	openingHours: daysOfWeek.map((day) => ({
		day,
		open: '09:00',
		close: '21:00',
		closed: false,
	})),
	specialOpeningHours: [] as SpecialOpeningHoursForm[],
})

const submitting = ref(false)
const flash = useFlashMessages()
const { errors, generalError, clearErrors, handleApiError } = useFormErrors()

// Fetch existing data
const { data, pending } = await useFetch<GeneralInfo>('/api/general-info')

// Populate form when data is loaded
watch(
	data,
	(info) => {
		if (info) {
			form.title = info.title || ''
			form.shortText = info.shortText || ''
			form.text = info.text || ''
			form.facebook = info.facebook || ''
			form.instagram = info.instagram || ''
			form.gallery = info.gallery || []

			if (info.openingHours?.length) {
				form.openingHours = daysOfWeek.map((day) => {
					const entry = info.openingHours?.find((e) => e.day === day)
					return {
						day,
						open: entry?.open || '09:00',
						close: entry?.close || '21:00',
						closed: entry?.closed || false,
					}
				})
			}

			if (info.specialOpeningHours?.length) {
				form.specialOpeningHours = info.specialOpeningHours.map((entry) => ({
					type: (entry.date ? 'single' : 'range') as 'single' | 'range',
					date: entry.date ? String(entry.date).split('T')[0] : '',
					dateFrom: entry.dateFrom ? String(entry.dateFrom).split('T')[0] : '',
					dateTo: entry.dateTo ? String(entry.dateTo).split('T')[0] : '',
					open: entry.open || '09:00',
					close: entry.close || '21:00',
					closed: entry.closed || false,
					note: entry.note || '',
				})) as SpecialOpeningHoursForm[]
			}
		}
	},
	{ immediate: true },
)

// Special opening hours helpers
const addSpecialOpeningHours = () => {
	form.specialOpeningHours.push({
		type: 'single',
		date: '',
		dateFrom: '',
		dateTo: '',
		open: '09:00',
		close: '21:00',
		closed: false,
		note: '',
	})
}

const removeSpecialOpeningHours = (index: number) => {
	form.specialOpeningHours.splice(index, 1)
}

const handleSubmit = async () => {
	clearErrors()
	submitting.value = true

	try {
		// Prepare data
		const data: Record<string, unknown> = {
			title: form.title?.trim() || '',
			shortText: form.shortText?.trim() || '',
			text: form.text?.trim() || '',
			facebook: form.facebook?.trim() || '',
			instagram: form.instagram?.trim() || '',
			gallery: form.gallery || [],
		}

		// Opening hours
		const openingHours = form.openingHours.map((entry) => ({
			day: entry.day,
			open: entry.open,
			close: entry.close,
			closed: entry.closed,
		}))
		data.openingHours = openingHours

		// Special opening hours
		const specialOpeningHours = form.specialOpeningHours
			.filter((entry) =>
				entry.type === 'single' ? entry.date : entry.dateFrom && entry.dateTo,
			)
			.map((entry) => ({
				date: entry.type === 'single' ? entry.date : undefined,
				dateFrom: entry.type === 'range' ? entry.dateFrom : undefined,
				dateTo: entry.type === 'range' ? entry.dateTo : undefined,
				open: entry.closed ? undefined : entry.open,
				close: entry.closed ? undefined : entry.close,
				closed: entry.closed,
				note: entry.note || undefined,
			}))
		if (specialOpeningHours.length) data.specialOpeningHours = specialOpeningHours

		await secureFetch('/api/general-info', {
			method: 'PUT',
			body: data,
		})

		flash.success(t('cms.flash.generalInfoSaved'))
		router.push('/cms')
	} catch (e) {
		const errorMessage = handleApiError(e)
		flash.error(errorMessage || t('cms.flash.generalInfoSaveError'))
	} finally {
		submitting.value = false
	}
}
</script>
