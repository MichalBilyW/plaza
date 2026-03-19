<template>
	<div class="min-h-screen mx-2 xs:mx-4">
		<!-- Header -->
		<LayoutTheHeader
			:opening-hours="generalInfo?.openingHours"
			:special-opening-hours="generalInfo?.specialOpeningHours"
		/>

		<!-- Main content -->
		<main class="w-full pt-[60px] lg:pt-[90px]">
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
