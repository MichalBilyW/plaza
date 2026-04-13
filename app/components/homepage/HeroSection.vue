<template>
	<div class="bg-gradient-to-b from-[#131313] to-[#1A1A1A] pt-[60px] lg:pt-[90px]">
		<!-- hero bg -->
		<div
			class="z-0 absolute top-0 left-0 w-full h-[450px] bg-gradient-to-b from-[#131313] to-[#1A1A1A]"
		></div>

		<!-- Hero section -->
		<section class="z-10 container relative transparent overflow-hidden" aria-label="Hero">
			<!-- Border overlay -->
			<div
				v-if="showBorder"
				class="absolute top-0 left-0 w-[calc(100%-16px)] h-[calc(240px-16px)] md:w-[calc(100%-32px)] md:h-[calc(400px-32px)] bg-transparent m-2 md:m-4 border md:border-2 border-white/70 rounded-[5px_20px_5px_5px] z-10 pointer-events-none"
				aria-hidden="true"
			></div>

			<!-- Hero skeleton -->
			<div v-if="pending" class="w-full h-[240px] md:h-[400px] skeleton-shimmer"></div>

			<!-- Hero image -->
			<img
				v-else
				:src="heroImage"
				:alt="t('home.heroImageAlt')"
				loading="eager"
				fetchpriority="high"
				class="w-full h-[240px] md:h-[400px] object-cover"
			/>
		</section>
	</div>
</template>

<script setup lang="ts">
import type { Homepage } from '@/shared/types'

const { t } = useI18n()

const props = defineProps<{
	homepage?: Homepage
	pending: boolean
}>()

const heroImage = computed(() => props.homepage?.heroImage || '/images/homepage/default-hero.jpg')
const showBorder = computed(() => props.homepage?.showHeroBorder ?? true)
</script>
