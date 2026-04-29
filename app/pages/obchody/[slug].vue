<template>
	<div class="min-h-screen bg-white">
		<!-- Error state -->
		<div v-if="error" class="container pt-[150px] lg:pt-[180px] pb-20 text-center">
			<h1 class="text-2xl font-bold text-plaza-dark mb-4">{{ t('shopDetail.notFound') }}</h1>
			<p class="text-plaza-gray mb-8">{{ t('shopDetail.notFoundDescription') }}</p>
			<NuxtLink
				to="/obchody"
				class="inline-flex items-center justify-center px-6 py-2 bg-plaza text-white font-sans font-semibold rounded-[5px_20px_5px_5px]"
			>
				{{ t('home.sections.shopsList') }}
			</NuxtLink>
		</div>

		<template v-else>
			<!-- Hidden H1 for SEO -->
			<h1 class="sr-only hidden visibility-hidden absolute -top-[9999px] -left-[9999px]">
				{{ shop?.name }}
			</h1>

			<!-- Hero Section -->
			<ShopHeroShopSection v-if="shop" :shop="shop" :pending="shopPending" />

			<!-- Shop Description Section -->
			<div v-if="hasDescription" class="px-4 my-20">
				<div class="container max-w-4xl">
					<div
						class="prose prose-lg max-w-none text-plaza-dark [&_img]:max-w-full [&_img]:h-auto"
						v-html="sanitize(shop?.description)"
					></div>
				</div>
			</div>

			<!-- Shop Events Section (Akce a slevy) -->
			<div class="my-20">
				<HomepageUpcomingEvents
					v-if="shopEvents.length > 0 || eventsPending"
					:events="shopEvents"
					:pending="eventsPending"
				/>
			</div>

			<!-- Map Section - zobrazit mapu s označeným obchodem -->
			<div v-if="shop?.floorId" class="my-20">
				<div v-if="mapFloorName" class="z-20 relative container flex justify-end transform translate-y-20 -translate-x-4 md:-translate-x-16">
					<div class="flex items-center gap-2 md:gap-3">
						<span
							class="px-4 md:px-5 py-2 md:py-2.5 rounded-[5px_20px_5px_5px] md:text-xl whitespace-nowrap transition-all duration-300 ease-out bg-primary-600 bg-plaza !text-white md:scale-105 shadow-lg"
						>
							{{ mapFloorName }}
						</span>
					</div>
				</div>
				<MapSection
					class="z-10 relative"
					:locked-floor-id="shop.floorId"
					:highlight-shop-name="shop.name"
					hide-full-map-link
				/>
			</div>

			<!-- Related Shops Section -->
			<div v-if="availableCategories.length" class="px-4 my-20">
				<ShopRelatedShops
					v-if="availableCategories.length > 0"
					:shops="relatedShops"
					:categories="availableCategories"
					:category-id="selectedCategoryId"
					:pending="relatedPending"
					@category-change="onCategoryChange"
				/>
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
import type { Shop, Event, Category } from '@/shared/types'

const { t } = useI18n()
const route = useRoute()
const { sanitize } = useSanitizeHtml()

// === Fetch shop detail ===
const {
	data: shop,
	error,
	pending: shopPending,
} = await useFetch<Shop>(`/api/shops/${route.params.slug}`, {
	key: `shop-${route.params.slug}`,
})

// === Check if description has actual content (not just empty HTML tags) ===
const hasDescription = computed(() => {
	const desc = shop.value?.description
	if (!desc) return false
	// Strip HTML tags and check if there's actual text
	const textContent = desc.replace(/<[^>]*>/g, '').trim()
	return textContent.length > 0
})

const mapFloorName = computed(() => {
	return shop.value?.floor?.name || shop.value?.floors?.[0]?.name || ''
})

// === SEO ===
const seoTitle = computed(() => shop.value?.seoTitle || shop.value?.name || t('shops.title'))
usePlazaSeo({
	title: seoTitle.value,
	description: shop.value?.seoDescription,
	image: shop.value?.gallery?.[0] || shop.value?.logo,
})

// === JSON-LD: Store + BreadcrumbList ===
const runtimeConfig = useRuntimeConfig()
const baseUrl = runtimeConfig.public.siteUrl || 'https://ocplazaliberec.cz'

if (shop.value) {
	const s = shop.value
	const shopUrl = `${baseUrl}/obchody/${s.slug}`
	const openingSpec = openingHoursToSchemaSpec(s.openingHours)

	const storeJsonLd: Record<string, unknown> = {
		'@context': 'https://schema.org',
		'@type': 'Store',
		'@id': shopUrl,
		name: s.name,
		url: shopUrl,
		description: s.shortDescription || s.seoDescription,
	}
	if (s.logo) storeJsonLd.logo = s.logo.startsWith('http') ? s.logo : `${baseUrl}${s.logo}`
	if (s.gallery?.length) {
		storeJsonLd.image = s.gallery.map((img) =>
			img.startsWith('http') ? img : `${baseUrl}${img}`,
		)
	}
	if (s.phone) storeJsonLd.telephone = s.phone
	if (s.email) storeJsonLd.email = s.email
	if (s.website) storeJsonLd.sameAs = [s.website]
	if (openingSpec) storeJsonLd.openingHours = openingSpec

	storeJsonLd.containedInPlace = {
		'@type': 'ShoppingCenter',
		name: 'OC Plaza Liberec',
		url: baseUrl,
		address: {
			'@type': 'PostalAddress',
			streetAddress: 'Palachova 1404/2',
			addressLocality: 'Liberec',
			postalCode: '460 01',
			addressCountry: 'CZ',
		},
	}

	useJsonLd([
		storeJsonLd,
		buildBreadcrumbList([
			{ name: 'Domů', url: baseUrl },
			{ name: t('shops.title'), url: `${baseUrl}/obchody` },
			{ name: s.name, url: shopUrl },
		]),
	])
}

// === Fetch all categories ===
const { data: categoriesData } = await useFetch<{ data: Category[] }>('/api/categories', {
	key: 'all-categories',
	query: {
		limit: 100,
		isActive: 'true',
		withShopsOnly: 'true',
	},
})

const availableCategories = computed(() => categoriesData.value?.data ?? [])

// Get only the categories this shop belongs to
const shopCategories = computed(() => {
	const shopCategoryIds = shop.value?.categoryIds ?? []
	return availableCategories.value.filter((c) => shopCategoryIds.includes(c._id))
})

// === Fetch shop events ===
const { data: eventsData, pending: eventsPending } = await useFetch<{ data: Event[] }>(
	'/api/events',
	{
		key: `shop-events-${route.params.slug}`,
		query: {
			shopId: shop.value?._id,
			isActive: true,
			notExpired: true,
			limit: 10,
		},
		watch: [() => shop.value?._id],
		immediate: !!shop.value?._id,
	},
)

const shopEvents = computed(() => eventsData.value?.data ?? [])

// === Related shops with category switching ===
const selectedCategoryId = ref(shop.value?.categoryIds?.[0] ?? '')

// Keep the selected category aligned with the categories available for this shop.
watch(
	[availableCategories, shopCategories],
	([newAvailableCategories, newShopCategories]) => {
		if (newAvailableCategories.length === 0) {
			selectedCategoryId.value = ''
			return
		}

		if (!newAvailableCategories.some((category) => category._id === selectedCategoryId.value)) {
			selectedCategoryId.value =
				newShopCategories[0]?._id || newAvailableCategories[0]?._id || ''
		}
	},
	{ immediate: true },
)

const onCategoryChange = (categoryId: string) => {
	if (availableCategories.value.some((category) => category._id === categoryId)) {
		selectedCategoryId.value = categoryId
	}
}

// === Fetch related shops (selected category) ===
const relatedShopsKey = computed(
	() => `related-shops-${String(route.params.slug)}-${selectedCategoryId.value || 'none'}`,
)

const { data: relatedData, pending: relatedPending } = await useAsyncData<{ data: Shop[] }>(
	relatedShopsKey,
	() => {
		if (!selectedCategoryId.value) {
			return Promise.resolve({ data: [] })
		}

		return $fetch('/api/shops', {
			query: {
				categoryId: selectedCategoryId.value,
				isActive: true,
				limit: 20,
			},
		})
	},
	{
		default: () => ({ data: [] }),
		watch: [selectedCategoryId],
	},
)

// Filter out current shop from related shops
const relatedShops = computed(() => {
	const shops = relatedData.value?.data ?? []
	return shops.filter((s) => s._id !== shop.value?._id)
})

// DataLayer - shop_view
const { trackShopView } = useDataLayer()
watch(
	shop,
	(newShop) => {
		if (newShop) trackShopView(newShop)
	},
	{ immediate: true },
)
</script>
