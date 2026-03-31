<template>
	<div class="p-4 sm:p-6 lg:p-8">
		<CmsBreadcrumbs />
		<div class="mb-8">
			<h1 class="text-xl sm:text-2xl font-bold text-gray-900">
				{{ t('cms.shops.newShop') }}
			</h1>
		</div>

		<!-- General error -->
		<div
			v-if="generalError"
			class="max-w-4xl mb-4 p-4 bg-red-50 border border-red-200 rounded-lg"
		>
			<p class="text-sm text-red-600">{{ generalError }}</p>
		</div>

		<form @submit.prevent="handleSubmit" class="space-y-8">
			<!-- Základní informace -->
			<div class="bg-white rounded-xl shadow-sm p-6">
				<h2
					class="text-lg font-semibold mb-6 text-cms-shops-700 border-b border-cms-shops-100 pb-2"
				>
					{{ t('cms.shops.basicInfo') }}
				</h2>

				<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<!-- Název -->
					<div>
						<label for="name" class="block text-sm font-medium text-gray-700 mb-1">
							{{ t('cms.shops.name') }} *
						</label>
						<input
							id="name"
							v-model="form.name"
							type="text"
							required
							maxlength="200"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-shops-500 focus:border-transparent"
							:placeholder="t('cms.shops.namePlaceholder')"
						/>
						<p v-if="errors.name" class="mt-1 text-sm text-red-600">
							{{ errors.name }}
						</p>
					</div>

					<!-- Slug -->
					<div>
						<label for="slug" class="block text-sm font-medium text-gray-700 mb-1">
							{{ t('cms.shops.slug') }}
						</label>
						<input
							id="slug"
							v-model="form.slug"
							type="text"
							maxlength="100"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-shops-500 focus:border-transparent"
							:placeholder="t('cms.shops.slugPlaceholder')"
						/>
						<p class="mt-1 text-xs text-plaza-dark">{{ t('cms.shops.slugHint') }}</p>
					</div>

					<!-- Popis obchodu (WYSIWYG) -->
					<div class="lg:col-span-2">
						<CmsWysiwyg
							v-model="form.description"
							:label="t('cms.shops.shopDescription')"
						/>
					</div>
				</div>
			</div>

			<!-- Umístění -->
			<div class="bg-white rounded-xl shadow-sm p-6">
				<h2
					class="text-lg font-semibold mb-6 text-cms-shops-700 border-b border-cms-shops-100 pb-2"
				>
					{{ t('cms.shops.location') }}
				</h2>

				<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<!-- Kategorie -->
					<div>
						<label
							for="categoryId"
							class="block text-sm font-medium text-gray-700 mb-1"
						>
							{{ t('cms.shops.category') }}
						</label>
						<select
							id="categoryId"
							v-model="form.categoryId"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-shops-500 focus:border-transparent"
						>
							<option value="">{{ t('cms.shops.selectCategory') }}</option>
							<option
								v-for="category in categories"
								:key="category._id"
								:value="category._id"
							>
								{{ category.name }}
							</option>
						</select>
					</div>

					<!-- Patro -->
					<div>
						<label for="floorId" class="block text-sm font-medium text-gray-700 mb-1">
							{{ t('cms.shops.floor') }}
						</label>
						<select
							id="floorId"
							v-model="form.floorId"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-shops-500 focus:border-transparent"
						>
							<option value="">{{ t('cms.shops.selectFloor') }}</option>
							<option v-for="floor in floors" :key="floor._id" :value="floor._id">
								{{ floor.name }}
							</option>
						</select>
					</div>

					<!-- Kód jednotky -->
					<div>
						<label for="unitCode" class="block text-sm font-medium text-gray-700 mb-1">
							{{ t('cms.shops.units') }}
						</label>
						<select
							id="unitCode"
							v-model="form.unitCode"
							:disabled="!form.floorId"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-shops-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
						>
							<option value="">
								{{
									form.floorId
										? t('cms.shops.selectUnit')
										: t('cms.shops.selectFloorFirst')
								}}
							</option>
							<option
								v-for="unit in availableUnits"
								:key="unit.unitCode"
								:value="unit.unitCode"
								:disabled="unit.isOccupied"
							>
								{{ unit.unitCode
								}}{{ unit.isOccupied ? ` (${unit.shopName})` : '' }}
							</option>
						</select>
						<p class="mt-1 text-xs text-plaza-dark">{{ t('cms.shops.unitHint') }}</p>
					</div>
				</div>
			</div>

			<!-- Kontakt -->
			<div class="bg-white rounded-xl shadow-sm p-6">
				<h2
					class="text-lg font-semibold mb-6 text-cms-shops-700 border-b border-cms-shops-100 pb-2"
				>
					{{ t('cms.shops.contactInfo') }}
				</h2>

				<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<!-- Telefon -->
					<div>
						<label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
							{{ t('cms.shops.phone') }}
						</label>
						<input
							id="phone"
							v-model="form.phone"
							type="tel"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-shops-500 focus:border-transparent"
							placeholder="+420 123 456 789"
						/>
					</div>

					<!-- Email -->
					<div>
						<label for="email" class="block text-sm font-medium text-gray-700 mb-1">
							{{ t('cms.shops.email') }}
						</label>
						<input
							id="email"
							v-model="form.email"
							type="email"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-shops-500 focus:border-transparent"
							placeholder="obchod@example.cz"
						/>
					</div>

					<!-- Web -->
					<div>
						<label for="website" class="block text-sm font-medium text-gray-700 mb-1">
							{{ t('cms.shops.website') }}
						</label>
						<input
							id="website"
							v-model="form.website"
							type="url"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-shops-500 focus:border-transparent"
							placeholder="https://www.example.cz"
						/>
					</div>
				</div>

				<!-- Sociální sítě -->
				<div class="mt-6">
					<h3 class="text-sm font-medium text-gray-700 mb-3">
						{{ t('cms.shops.socialLinks') }}
					</h3>
					<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
						<div>
							<label for="facebook" class="block text-xs text-plaza-dark mb-1"
								>Facebook</label
							>
							<input
								id="facebook"
								v-model="form.socialLinks.facebook"
								type="url"
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-shops-500 focus:border-transparent text-sm"
								placeholder="https://facebook.com/..."
							/>
						</div>
						<div>
							<label for="instagram" class="block text-xs text-plaza-dark mb-1"
								>Instagram</label
							>
							<input
								id="instagram"
								v-model="form.socialLinks.instagram"
								type="url"
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-shops-500 focus:border-transparent text-sm"
								placeholder="https://instagram.com/..."
							/>
						</div>
						<div>
							<label for="twitter" class="block text-xs text-plaza-dark mb-1"
								>Twitter / X</label
							>
							<input
								id="twitter"
								v-model="form.socialLinks.twitter"
								type="url"
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-shops-500 focus:border-transparent text-sm"
								placeholder="https://twitter.com/..."
							/>
						</div>
					</div>
				</div>
			</div>

			<!-- Média -->
			<div class="bg-white rounded-xl shadow-sm p-6">
				<h2
					class="text-lg font-semibold mb-6 text-cms-shops-700 border-b border-cms-shops-100 pb-2"
				>
					{{ t('cms.shops.media') }}
				</h2>

				<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<!-- Logo -->
					<CmsImageUpload
						v-model="form.logo"
						:label="t('cms.shops.logo')"
						:hint="t('cms.shops.logoHint')"
						preview-class="w-24 h-24"
					/>

					<!-- Galerie -->
					<CmsGalleryUpload
						v-model="form.gallery"
						:label="t('cms.shops.gallery')"
						:hint="t('cms.shops.galleryHint')"
					/>
				</div>
			</div>

			<!-- Otevírací doba -->
			<div class="bg-white rounded-xl shadow-sm p-6">
				<h2
					class="text-lg font-semibold mb-6 text-cms-shops-700 border-b border-cms-shops-100 pb-2"
				>
					{{ t('cms.shops.openingHours') }}
				</h2>

				<div class="space-y-3">
					<div
						v-for="entry in form.openingHours"
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
								class="w-4 h-4 text-cms-shops-600 rounded focus:ring-cms-shops-500"
							/>
							<span class="text-sm text-gray-600">{{ t('cms.shops.closed') }}</span>
						</label>

						<div v-if="!entry.closed" class="flex items-center gap-2 shrink-0">
							<input
								v-model="entry.open"
								type="time"
								class="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-shops-500 focus:border-transparent text-sm"
							/>
							<span class="text-gray-400">–</span>
							<input
								v-model="entry.close"
								type="time"
								class="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-shops-500 focus:border-transparent text-sm"
							/>
						</div>
					</div>
				</div>
			</div>

			<!-- Speciální otevírací doba -->
			<div class="bg-white rounded-xl shadow-sm p-6">
				<div class="flex items-center justify-between mb-6">
					<h2
						class="text-lg font-semibold text-cms-shops-700 border-b border-cms-shops-100 pb-2 flex-1"
					>
						{{ t('cms.shops.specialOpeningHours') }}
					</h2>
					<button
						type="button"
						@click="addSpecialOpeningHours"
						class="ml-4 px-3 py-1.5 text-sm bg-cms-shops-100 text-cms-shops-700 rounded-lg hover:bg-cms-shops-200 transition-colors"
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
								<!-- Typ: den nebo období -->
								<select
									v-model="entry.type"
									class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cms-shops-500"
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
									class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cms-shops-500"
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
										class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cms-shops-500"
									/>
								</div>
								<div>
									<label class="block text-xs text-plaza-dark mb-1">{{
										t('cms.shops.dateTo')
									}}</label>
									<input
										v-model="entry.dateTo"
										type="date"
										class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cms-shops-500"
									/>
								</div>
							</template>

							<!-- Zavřeno checkbox -->
							<div class="flex items-end pb-1">
								<label class="inline-flex items-center gap-2">
									<input
										type="checkbox"
										v-model="entry.closed"
										class="w-4 h-4 text-cms-shops-600 rounded focus:ring-cms-shops-500"
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
											class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cms-shops-500"
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
											class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cms-shops-500"
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
								class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cms-shops-500"
								:placeholder="t('cms.shops.specialNotePlaceholder')"
							/>
						</div>
					</div>
				</div>
			</div>

			<!-- SEO -->
			<div class="bg-white rounded-xl shadow-sm p-6">
				<h2
					class="text-lg font-semibold mb-6 text-cms-shops-700 border-b border-cms-shops-100 pb-2"
				>
					{{ t('cms.shops.seo') }}
				</h2>

				<div class="space-y-6">
					<div>
						<label for="seoTitle" class="block text-sm font-medium text-gray-700 mb-1">
							{{ t('cms.shops.seoTitle') }}
						</label>
						<input
							id="seoTitle"
							v-model="form.seoTitle"
							type="text"
							maxlength="60"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-shops-500 focus:border-transparent"
							:placeholder="t('cms.shops.seoTitlePlaceholder')"
						/>
						<p class="mt-1 text-xs text-plaza-dark">
							{{ form.seoTitle?.length || 0 }}/60
						</p>
					</div>

					<div>
						<label
							for="seoDescription"
							class="block text-sm font-medium text-gray-700 mb-1"
						>
							{{ t('cms.shops.seoDescription') }}
						</label>
						<textarea
							id="seoDescription"
							v-model="form.seoDescription"
							rows="2"
							maxlength="160"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-shops-500 focus:border-transparent"
							:placeholder="t('cms.shops.seoDescriptionPlaceholder')"
						></textarea>
						<p class="mt-1 text-xs text-plaza-dark">
							{{ form.seoDescription?.length || 0 }}/160
						</p>
					</div>
				</div>
			</div>

			<!-- Nastavení -->
			<div class="bg-white rounded-xl shadow-sm p-6">
				<h2
					class="text-lg font-semibold mb-6 text-cms-shops-700 border-b border-cms-shops-100 pb-2"
				>
					{{ t('cms.shops.settings') }}
				</h2>

				<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<!-- Je aktivní -->
					<div class="flex items-center">
						<label class="inline-flex items-center gap-3 cursor-pointer">
							<input
								type="checkbox"
								v-model="form.isActive"
								class="w-4 h-4 text-cms-shops-600 rounded focus:ring-cms-shops-500"
							/>
							<span class="text-sm font-medium text-gray-700">{{
								t('cms.shops.isActive')
							}}</span>
						</label>
					</div>

					<!-- Datum zveřejnění -->
					<div>
						<label
							for="publishDate"
							class="block text-sm font-medium text-gray-700 mb-1"
						>
							{{ t('cms.shops.publishDate') }}
						</label>
						<div class="relative">
							<input
								id="publishDate"
								v-model="form.publishDate"
								type="date"
								class="peer w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-shops-500 focus:border-transparent focus:text-gray-900"
								:class="{ 'text-transparent': !form.publishDate }"
							/>
							<span
								v-if="!form.publishDate"
								class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none peer-focus:hidden"
							>
								{{ t('cms.shops.publishDateEmpty') }}
							</span>
						</div>
						<p class="mt-1 text-xs text-plaza-dark">
							{{ t('cms.shops.publishDateHint') }}
						</p>
						<button
							v-if="form.publishDate"
							type="button"
							@click="form.publishDate = ''"
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
							{{ t('cms.shops.clearPublishDate') }}
						</button>
					</div>
				</div>
			</div>

			<!-- Buttons -->
			<div class="flex justify-end gap-3 pt-4">
				<NuxtLink
					to="/cms/obchody"
					class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
				>
					{{ t('common.cancel') }}
				</NuxtLink>
				<button
					type="submit"
					:disabled="submitting"
					class="px-6 py-2 bg-cms-shops-600 text-white rounded-lg hover:bg-cms-shops-700 transition-colors disabled:opacity-50"
				>
					{{ submitting ? t('common.loading') : t('common.create') }}
				</button>
			</div>
		</form>
	</div>
</template>

<script setup lang="ts">
import type { Floor, DayOfWeek, Category } from '~~/shared/types'
import type { FloorUnitsResponse } from '~~/shared/map/units'

definePageMeta({
	layout: 'cms',
	middleware: 'cms',
})

const { t } = useI18n()
const router = useRouter()
const { secureFetch } = useCmsAuth()

usePlazaSeo({
	title: t('cms.shops.newShop'),
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
	name: '',
	slug: '',
	description: '',
	logo: '',
	gallery: [] as string[],
	phone: '',
	email: '',
	website: '',
	socialLinks: {
		facebook: '',
		instagram: '',
		twitter: '',
	},
	floorId: '',
	categoryId: '',
	unitCode: '',
	openingHours: daysOfWeek.map((day) => ({
		day,
		open: '09:00',
		close: '21:00',
		closed: false,
	})),
	specialOpeningHours: [] as SpecialOpeningHoursForm[],
	isActive: true,
	publishDate: '',
	seoTitle: '',
	seoDescription: '',
})

// Speciální otevírací doba - pomocné funkce
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

const submitting = ref(false)
const flash = useFlashMessages()
const {
	errors,
	generalError,
	clearErrors,
	handleApiError,
	hasError: _hasError,
	getError: _getError,
	scrollToFirstError,
} = useFormErrors()

// Fetch floors
const { data: floorsData } = await useFetch<{ data: Floor[] }>('/api/floors', {
	query: { limit: 100 },
})
const floors = computed(() => floorsData.value?.data || [])

// Fetch categories
const { data: categoriesData } = await useFetch<{ data: Category[] }>('/api/categories', {
	query: { limit: 100 },
})
const categories = computed(() => categoriesData.value?.data || [])

// Fetch map units with occupancy
const { data: mapData } = await useFetch<{
	floors: FloorUnitsResponse[]
}>('/api/map/units')

// Computed: available units for selected floor
const availableUnits = computed(() => {
	if (!form.floorId) return []

	// Find floor data from API
	const floorData = mapData.value?.floors?.find((f) => f.floorId === form.floorId)
	if (!floorData) return []

	return floorData.units.map((unit) => {
		const isOccupied = !!unit.shop
		return {
			unitCode: unit.unitCode,
			isOccupied,
			shopName: unit.shop?.name || '',
		}
	})
})

// Clear unitCode when floor changes
watch(
	() => form.floorId,
	() => {
		form.unitCode = ''
	},
)

const handleSubmit = async () => {
	clearErrors()

	// Validate
	if (!form.name.trim()) {
		errors.value.name = t('forms.required')
		scrollToFirstError()
		return
	}

	submitting.value = true

	try {
		// Prepare data - filter out empty values
		const data: Record<string, unknown> = {
			name: form.name.trim(),
			isActive: form.isActive,
		}

		if (form.slug) data.slug = form.slug.trim()
		if (form.publishDate) data.publishDate = new Date(form.publishDate).toISOString()
		if (form.description) data.description = form.description.trim()
		if (form.logo) data.logo = form.logo.trim()
		if (form.gallery.length) data.gallery = form.gallery
		if (form.phone) data.phone = form.phone.trim()
		if (form.email) data.email = form.email.trim()
		if (form.website) data.website = form.website.trim()
		if (form.floorId) data.floorId = form.floorId
		if (form.categoryId) data.categoryId = form.categoryId
		if (form.unitCode) data.unitCode = form.unitCode.trim()
		if (form.seoTitle) data.seoTitle = form.seoTitle.trim()
		if (form.seoDescription) data.seoDescription = form.seoDescription.trim()

		// Social links - only include if any is set
		const socialLinks: Record<string, string> = {}
		if (form.socialLinks.facebook) socialLinks.facebook = form.socialLinks.facebook.trim()
		if (form.socialLinks.instagram) socialLinks.instagram = form.socialLinks.instagram.trim()
		if (form.socialLinks.twitter) socialLinks.twitter = form.socialLinks.twitter.trim()
		if (Object.keys(socialLinks).length) data.socialLinks = socialLinks

		// Opening hours - filter out closed days or format properly
		const openingHours = form.openingHours
			.filter((entry) => !entry.closed && entry.open && entry.close)
			.map((entry) => ({
				day: entry.day,
				open: entry.open,
				close: entry.close,
				closed: false,
			}))
		if (openingHours.length) data.openingHours = openingHours

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

		await secureFetch<{ _id: string }>('/api/shops', {
			method: 'POST',
			body: data,
		})

		// Flash message a redirect
		flash.success(t('cms.flash.shopCreated'))
		router.push('/cms/obchody')
	} catch (e) {
		const errorMessage = handleApiError(e)
		flash.error(errorMessage || t('cms.flash.shopSaveError'))
		scrollToFirstError()
	} finally {
		submitting.value = false
	}
}
</script>
