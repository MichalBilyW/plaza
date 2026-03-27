<template>
	<!-- Upcoming shop - not clickable -->
	<div
		v-if="isUpcoming"
		class="upcoming-card relative flex flex-col justify-center items-center bg-white border border-gray-200 w-[173px] h-[173px] rounded-[5px_20px_5px_5px] p-5"
	>
		<!-- Opening date badge -->
		<span
			class="upcoming-badge absolute top-2 left-2 z-10 rounded-[5px_10px_5px_5px] bg-plaza px-2 py-0.5 text-[10px] font-semibold text-white shadow"
		>
			Otevíráme: {{ new Date(shop.publishDate!).toLocaleDateString('cs-CZ') }}
		</span>

		<!-- Logo -->
		<div class="flex items-center justify-center text-center h-full w-[70px] opacity-80">
			<img
				v-if="shop.logo"
				:src="shop.logo"
				:alt="shop.name"
				loading="lazy"
				class="max-w-full max-h-[100px] object-contain"
			/>
			<span v-else class="text-3xl font-bold text-plaza-gray">
				{{ shop.name.charAt(0) }}
			</span>
		</div>

		<div class="w-full max-w-[100px] h-0.5 bg-plaza-light mb-3 mt-2"></div>

		<!-- Category + Floor -->
		<div class="flex items-center justify-between w-full gap-3 text-sm text-plaza-gray">
			<span class="text-xs text-plaza/90" v-if="shop.category?.name">
				{{
					shop.category.name.length > 12
						? shop.category.name.slice(0, 12) + '...'
						: shop.category.name
				}}
			</span>
			<span class="text-xs opacity-90" v-if="shop.floor?.name">{{ shop.floor.name }}</span>
		</div>
	</div>

	<!-- Regular shop - clickable link -->
	<NuxtLink
		v-else
		:to="`/obchody/${shop.slug}`"
		class="relative flex flex-col justify-center items-center bg-white border border-gray-200 w-[173px] h-[173px] rounded-[5px_20px_5px_5px] p-5 transition-shadow hover:shadow-lg cursor-pointer"
		@click="trackShopClick(shop)"
	>
		<!-- Logo -->
		<div class="flex items-center justify-center text-center h-full w-[70px]">
			<img
				v-if="shop.logo"
				:src="shop.logo"
				:alt="shop.name"
				loading="lazy"
				class="max-w-full max-h-[100px] object-contain"
			/>
			<span v-else class="text-3xl font-bold text-plaza-gray">
				{{ shop.name.charAt(0) }}
			</span>
		</div>

		<div class="w-full max-w-[100px] h-0.5 bg-plaza-light mb-3 mt-2"></div>

		<!-- Category + Floor -->
		<div class="flex items-center justify-between w-full gap-3 text-sm text-plaza-gray">
			<span class="text-xs text-plaza/90" v-if="shop.category?.name">
				{{
					shop.category.name.length > 12
						? shop.category.name.slice(0, 12) + '...'
						: shop.category.name
				}}
			</span>
			<span class="text-xs opacity-90" v-if="shop.floor?.name">{{ shop.floor.name }}</span>
		</div>
	</NuxtLink>
</template>

<script setup lang="ts">
import type { Shop } from '@/shared/types'

const props = defineProps<{
	shop: Shop
}>()

const isUpcoming = computed(
	() => !!props.shop.publishDate && new Date(props.shop.publishDate) > new Date(),
)

const { trackShopClick } = useDataLayer()
</script>
