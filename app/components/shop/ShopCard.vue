<template>
	<component
		:is="isUpcoming ? 'div' : 'NuxtLink'"
		v-bind="isUpcoming ? {} : { to: `/obchody/${shop.slug}` }"
		class="relative group rounded-[5px_20px_5px_5px] bg-white transition-shadow
			max-md:flex max-md:flex-col max-md:justify-center max-md:items-center max-md:border max-md:border-gray-200 max-md:p-4
			w-full aspect-square min-[375px]:w-[180px] min-[375px]:h-[180px] min-[375px]:aspect-auto md:w-auto md:h-auto md:aspect-auto
			md:overflow-hidden"
		:class="[
			{ 'hover:shadow-lg cursor-pointer': !isUpcoming },
			{ 'max-sm:max-h-[240px] max-sm:overflow-hidden': !compact },
			{ 'max-h-[240px] overflow-hidden': compact },
		]"
	>
		<!-- Opening date badge (mobile only) -->
		<span
			v-if="isUpcoming"
			class="md:hidden absolute top-2 left-2 z-10 rounded-[5px_10px_5px_5px] bg-plaza px-2 py-0.5 text-[10px] font-semibold text-white shadow"
		>
			Otevíráme: {{ new Date(shop.publishDate!).toLocaleDateString('cs-CZ') }}
		</span>

		<!-- MOBILE: kompaktní karta -->
		<div class="md:hidden flex items-center justify-center text-center flex-1 w-3/4">
			<img
				v-if="shop.logo"
				:src="shop.logo"
				:alt="shop.name"
				loading="lazy"
				class="max-w-full max-h-full object-contain"
			/>
			<span v-else class="text-2xl font-bold text-plaza-gray">
				{{ shop.name.charAt(0) }}
			</span>
		</div>
		<!-- Divider -->
		<div class="md:hidden w-full max-w-[100px] h-0.5 bg-plaza-light my-2"></div>
		<!-- Kategorie + Patro -->
		<div class="md:hidden flex items-center justify-between w-full gap-2">
			<span class="text-xs text-plaza/90" v-if="shop.category?.name">
				{{ shop.category.name.length > 10 ? shop.category.name.slice(0, 10) + '…' : shop.category.name }}
			</span>
			<span class="text-xs text-plaza-gray opacity-90" v-if="shop.floor?.name">{{ shop.floor.name }}</span>
		</div>

		<!-- DESKTOP: galerie + logo overlay + název + kategorie -->
		<!-- Gallery photo -->
		<div class="max-md:hidden relative h-[200px] w-full overflow-hidden bg-plaza-dark/90">
			<img
				v-if="shop.gallery?.[0]"
				:src="shop.gallery[0]"
				:alt="shop.name"
				class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
			/>
			<span
				v-else
				class="flex h-full w-full text-center p-4 items-center justify-center text-4xl font-bold text-white/90"
			>
				{{ shop.name.charAt(0) }}
			</span>
			<!-- Opening date badge desktop -->
			<span
				v-if="isUpcoming"
				class="absolute top-3 left-3 z-10 rounded-[5px_10px_5px_5px] bg-plaza px-3 py-1 text-xs font-semibold text-white shadow"
			>
				Otevíráme: {{ new Date(shop.publishDate!).toLocaleDateString('cs-CZ') }}
			</span>
		</div>

		<!-- Desktop logo overlay + text -->
		<div class="max-md:hidden flex flex-col items-center px-4 pb-5">
			<!-- Logo box -->
			<div
				class="-mt-[42px] relative z-10 flex h-[85px] w-[120px] items-center justify-center rounded-sm bg-white shadow-[0px_4px_4px_rgba(0,0,0,0.25)]"
			>
				<img
					v-if="shop.logo"
					:src="shop.logo"
					:alt="shop.name"
					class="max-h-[60px] max-w-[70px] object-contain"
				/>
				<span v-else class="text-2xl font-bold text-plaza-gray">
					{{ shop.name.charAt(0) }}
				</span>
			</div>

			<!-- Name -->
			<h3
				class="mt-3 text-center font-heading text-[22px] font-semibold leading-tight text-plaza-gray md:text-[26px]"
			>
				{{ shop.name }}
			</h3>

			<!-- Category & Floor -->
			<p
				v-if="shop.category || shop.floor"
				class="mt-1 text-center font-sans text-[15px] text-plaza-gray"
			>
				<span v-if="shop.category" class="text-plaza">{{ shop.category.name }}</span>
				<span v-if="shop.category && shop.floor"> · </span>
				<span v-if="shop.floor">{{ shop.floor.name }}</span>
			</p>
		</div>
	</component>
</template>

<script setup lang="ts">
import type { Shop } from '@/shared/types'

const props = withDefaults(
	defineProps<{
		shop: Shop
		compact?: boolean
	}>(),
	{
		compact: false,
	},
)

const isUpcoming = computed(
	() => !!props.shop.publishDate && new Date(props.shop.publishDate) > new Date(),
)
</script>
