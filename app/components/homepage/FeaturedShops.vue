<template>
	<section class="py-16">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between items-center mb-8">
				<h2 class="text-2xl font-bold">{{ t('home.sections.shops') }}</h2>
				<NuxtLink to="/obchody" class="text-plaza hover:text-plaza/80 font-medium">
					{{ t('common.showAllArrow') }}
				</NuxtLink>
			</div>

			<!-- Shops skeleton -->
			<div v-if="pending" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
				<div v-for="i in 8" :key="i" class="bg-white rounded-xl p-6 shadow-sm">
					<div class="w-16 h-16 skeleton-shimmer rounded-lg mb-4"></div>
					<div class="h-5 skeleton-shimmer rounded w-2/3 mb-2"></div>
					<div class="h-4 skeleton-shimmer rounded w-1/2"></div>
				</div>
			</div>

			<!-- Shops with fade-in -->
			<TransitionGroup
				v-else
				name="fade-stagger"
				tag="div"
				class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
			>
				<NuxtLink
					v-for="shop in shops"
					:key="shop._id"
					:to="`/obchody/${shop.slug}`"
					class="bg-white rounded-xl p-6 hover:shadow-lg transition-shadow group"
				>
					<div
						class="w-16 h-16 bg-plaza-light rounded-lg mb-4 flex items-center justify-center overflow-hidden"
					>
						<img
							v-if="shop.logo"
							:src="shop.logo"
							:alt="shop.name"
							loading="lazy"
							class="w-full h-full object-contain"
						/>
						<span v-else class="text-2xl font-bold text-plaza-gray">
							{{ shop.name.charAt(0) }}
						</span>
					</div>
					<h3 class="font-semibold group-hover:text-plaza transition-colors">
						{{ shop.name }}
					</h3>
				</NuxtLink>
			</TransitionGroup>
		</div>
	</section>
</template>

<script setup lang="ts">
import type { Shop } from '@/shared/types'

const { t } = useI18n()

defineProps<{
	shops: Shop[]
	pending: boolean
}>()
</script>
