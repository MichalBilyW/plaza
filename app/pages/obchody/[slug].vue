<template>
	<div class="min-h-screen bg-white">
		<!-- Error state -->
		<div v-if="error" class="container py-20 text-center">
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
			<h1 class="sr-only">{{ shop?.name }}</h1>

			<!-- Hero Section -->
			<ShopHeroShopSection v-if="shop" :shop="shop" :pending="shopPending" />

			<!-- Shop Events Section (Akce a slevy) -->
			<div class="my-20">
				<HomepageUpcomingEvents
					v-if="shopEvents.length > 0 || eventsPending"
					:events="shopEvents"
					:pending="eventsPending"
				/>
			</div>

			<!-- Related Shops Section -->
			<div class="my-20">
				<ShopRelatedShops
					v-if="shop?.category && categories.length > 0"
					:shops="relatedShops"
					:categories="categories"
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

// === Fetch shop detail ===
const {
	data: shop,
	error,
	pending: shopPending,
} = await useFetch<Shop>(`/api/shops/${route.params.slug}`, {
	key: `shop-${route.params.slug}`,
})

// === SEO ===
const seoTitle = computed(() => shop.value?.seoTitle || shop.value?.name || t('shops.title'))
usePlazaSeo({
	title: seoTitle.value,
	description: shop.value?.seoDescription || shop.value?.shortDescription,
	image: shop.value?.gallery?.[0] || shop.value?.logo,
})

// === Fetch all categories ===
const { data: categoriesData } = await useFetch<{ data: Category[] }>('/api/categories', {
	key: 'all-categories',
})
const categories = computed(() => categoriesData.value?.data ?? [])

// === Fetch shop events ===
const { data: eventsData, pending: eventsPending } = await useFetch<{ data: Event[] }>(
	'/api/events',
	{
		key: `shop-events-${route.params.slug}`,
		query: {
			shopId: shop.value?._id,
			isActive: true,
			limit: 10,
		},
		watch: [() => shop.value?._id],
		immediate: !!shop.value?._id,
	},
)

const shopEvents = computed(() => eventsData.value?.data ?? [])

// === Related shops with category switching ===
const selectedCategoryId = ref(shop.value?.categoryId ?? '')

// Watch for shop changes to update selected category
watch(
	() => shop.value?.categoryId,
	(newCategoryId) => {
		if (newCategoryId) {
			selectedCategoryId.value = newCategoryId
		}
	},
	{ immediate: true },
)

const onCategoryChange = (categoryId: string) => {
	selectedCategoryId.value = categoryId
}

// === Fetch related shops (selected category) ===
const { data: relatedData, pending: relatedPending } = await useFetch<{ data: Shop[] }>(
	'/api/shops',
	{
		key: `related-shops-${route.params.slug}`,
		query: computed(() => ({
			categoryId: selectedCategoryId.value,
			isActive: true,
			limit: 20,
		})),
		watch: [selectedCategoryId],
		immediate: !!selectedCategoryId.value,
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
