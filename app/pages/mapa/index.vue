<template>
	<div class="min-h-screen">
		<!-- Dark header -->
		<div class="bg-gradient-to-b from-[#131313] to-[#1A1A1A] pt-20 pb-12">
			<h1
				class="text-center text-white font-heading font-black text-3xl md:text-4xl uppercase"
			>
				{{ t('mapPage.inProgress') }}
			</h1>
		</div>
	</div>
</template>

<script setup lang="ts">
const { t } = useI18n()

usePlazaSeo({
	title: t('seo.map.title'),
	description: t('seo.map.description'),
})
</script>
