<template>
	<section class="py-12">
		<div class="container-small px-4">
			<!-- Nadpis -->
			<h2
				class="font-heading font-black text-2xl md:text-4xl text-plaza-dark mb-8 text-center uppercase"
			>
				{{ t('aboutPage.parkingSection.title') }}
			</h2>

			<!-- Skeleton -->
			<div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 gap-8">
				<div class="h-[300px] skeleton-shimmer rounded-[5px_20px_5px_5px]"></div>
				<div class="h-[300px] skeleton-shimmer rounded-[5px_20px_5px_5px]"></div>
			</div>

			<!-- Obsah: levý box + pravý obrázek -->
			<div
				v-else
				class="flex flex-col-reverse sm:flex-row gap-y-6 items-center justify-center"
			>
				<!-- Levý box: info o parkovišti -->
				<div
					class="z-10 sm:-mr-6 relative max-sm:-mt-20 max-sm:max-w-[290px] w-full sm:!w-1/2 lg:!w-1/3 bg-white rounded-[5px_20px_5px_5px] shadow-xl p-6 md:p-8 flex-shrink-0"
					:class="{
						'flex items-center justify-center min-h-[200px] text-plaza-dark text-sm italic':
							!generalInfo?.parkingContent,
					}"
				>
					<div
						v-if="generalInfo?.parkingContent"
						class="prose prose-sm max-w-none"
						v-html="sanitize(generalInfo.parkingContent)"
					></div>
					<span v-else>{{ t('aboutPage.parkingSection.noContent') }}</span>
				</div>

				<!-- Pravý obrázek s border overlay -->
				<div
					class="z-0 sm:-ml-6 relative !w-full sm:!w-1/2 lg:!w-2/3 overflow-hidden rounded-[5px_20px_5px_5px] flex-shrink-0 shadow-xl"
				>
					<!-- Border overlay (vzor HeroSection) -->
					<div
						class="absolute top-0 left-0 w-[calc(100%-16px)] h-[calc(100%-16px)] md:w-[calc(100%-32px)] md:h-[calc(100%-32px)] bg-transparent m-2 md:m-4 border md:border-2 border-white/70 rounded-[5px_20px_5px_5px] z-10 pointer-events-none"
						aria-hidden="true"
					></div>

					<img
						:src="parkingImage"
						:alt="t('aboutPage.parkingSection.imageAlt')"
						loading="lazy"
						class="w-full h-[280px] sm:h-[340px] md:h-[430px] object-cover"
					/>
				</div>
			</div>

			<!-- Ceník parkovného -->
			<div
				v-if="!pending && generalInfo?.parkingOtherInfo"
				class="mt-8 prose prose-sm max-w-none"
				v-html="sanitize(generalInfo.parkingOtherInfo)"
			></div>
		</div>
	</section>
</template>

<script setup lang="ts">
import type { GeneralInfo } from '@/shared/types'

const { t } = useI18n()
const { sanitize } = useSanitizeHtml()

const props = defineProps<{
	generalInfo?: GeneralInfo | null
	pending: boolean
}>()

const parkingImage = computed(
	() => props.generalInfo?.parkingImage || '/images/default-parking.jpg',
)
</script>
