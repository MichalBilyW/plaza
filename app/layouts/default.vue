<template>
	<div class="min-h-screen">
		<!-- Skip navigation -->
		<a href="#main-content" class="skip-link">{{ $t('common.skipToContent') }}</a>

		<!-- Header -->
		<LayoutTheHeader
			:opening-hours="generalInfo?.openingHours"
			:special-opening-hours="generalInfo?.specialOpeningHours"
		/>

		<!-- Main content -->
		<main id="main-content" class="w-full pt-[60px] lg:pt-[90px]">
			<slot></slot>
		</main>

		<!-- Footer -->
		<LayoutTheFooter />
	</div>
</template>

<script setup lang="ts">
import type { OpeningHoursEntry, SpecialOpeningHours } from '@/shared/types'

// Načtení obecných informací (otevírací doba)
const { data: generalInfo } = useFetch<{
	openingHours?: OpeningHoursEntry[]
	specialOpeningHours?: SpecialOpeningHours[]
}>('/api/general-info')
</script>
