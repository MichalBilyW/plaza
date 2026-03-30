<template>
	<div class="min-h-screen pt-[80px] md:pt-0 lg:pt-[40px]">
		<!-- Hidden header -->
		<div class="hidden visibility-hidden absolute -top-[9999px] -left-[9999px] opacity-0">
			<h1
				class="text-center text-white font-heading font-black text-3xl md:text-4xl uppercase"
			>
				{{ t('mapPage.title') }}
			</h1>
		</div>

		<!-- Mapa - stejná komponenta jako na homepage -->
		<Section hide-full-map-link />
	</div>
</template>

<script setup lang="ts">
import Section from '~/components/map/Section.vue'

const { t } = useI18n()

usePlazaSeo({
	title: t('seo.map.title'),
	description: t('seo.map.description'),
})
</script>
