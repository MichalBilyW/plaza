<template>
	<UiModal v-model="isModalOpen" @update:model-value="handleClose">
		<div class="p-6 md:p-8">
			<h2
				class="font-heading font-black text-2xl md:text-3xl text-plaza-dark mb-8 text-center"
			>
				{{ t('aboutPage.openingHours') }}
			</h2>

			<!-- Loading state -->
			<div v-if="pending" class="flex justify-center py-8">
				<div
					class="w-8 h-8 border-4 border-plaza border-t-transparent rounded-full animate-spin"
				></div>
			</div>

			<template v-else-if="generalInfo">
				<!-- Běžná otevírací doba -->
				<div
					v-if="generalInfo.openingHours?.length"
					class="bg-white rounded-lg border border-gray-100 p-6 mb-6"
				>
					<div class="space-y-3">
						<div
							v-for="entry in generalInfo.openingHours"
							:key="entry.day"
							class="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
						>
							<span class="font-medium text-plaza-dark">
								{{ t(`aboutPage.days.${entry.day}`) }}
							</span>
							<span v-if="entry.closed" class="text-plaza">
								{{ t('aboutPage.closed') }}
							</span>
							<span v-else class="text-plaza-gray">
								{{ entry.open }} – {{ entry.close }}
							</span>
						</div>
					</div>
				</div>

				<!-- Speciální otevírací doba -->
				<div v-if="activeSpecialHours.length" class="bg-plaza-light/30 rounded-lg p-6">
					<h3 class="font-heading font-black text-lg text-plaza-dark mb-4">
						{{ t('aboutPage.specialOpeningHours') }}
					</h3>
					<div class="space-y-3">
						<div
							v-for="(entry, index) in activeSpecialHours"
							:key="index"
							class="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-200 last:border-0"
						>
							<div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
								<span class="font-medium text-plaza-dark">
									{{ formatSpecialDate(entry) }}
								</span>
								<span v-if="entry.note" class="text-sm text-plaza-gray">
									({{ entry.note }})
								</span>
							</div>
							<span v-if="entry.closed" class="text-plaza font-medium">
								{{ t('aboutPage.closed') }}
							</span>
							<span v-else class="text-plaza-gray">
								{{ entry.open }} – {{ entry.close }}
							</span>
						</div>
					</div>
				</div>
			</template>
		</div>
	</UiModal>
</template>

<script setup lang="ts">
import type { GeneralInfo, SpecialOpeningHours } from '@/shared/types'

const { t } = useI18n()
const { isModalOpen, closeModal } = useOpeningHoursModal()

// Fetch general info when modal opens
const {
	data: generalInfo,
	pending,
	refresh,
} = useFetch<GeneralInfo>('/api/general-info', {
	key: 'opening-hours-modal',
	immediate: false,
})

// Watch for modal open to fetch data
watch(isModalOpen, (isOpen) => {
	if (isOpen && !generalInfo.value) {
		refresh()
	}
})

// Filter active special opening hours (future or current)
const activeSpecialHours = computed(() => {
	if (!generalInfo.value?.specialOpeningHours) return []

	const today = new Date()
	today.setHours(0, 0, 0, 0)

	return generalInfo.value.specialOpeningHours.filter((entry) => {
		if (entry.date) {
			return new Date(entry.date) >= today
		}
		if (entry.dateTo) {
			return new Date(entry.dateTo) >= today
		}
		if (entry.dateFrom) {
			return new Date(entry.dateFrom) >= today
		}
		return false
	})
})

// Format special date for display
const formatSpecialDate = (entry: SpecialOpeningHours): string => {
	const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' }

	if (entry.date) {
		return new Date(entry.date).toLocaleDateString('cs-CZ', options)
	}

	if (entry.dateFrom && entry.dateTo) {
		const from = new Date(entry.dateFrom).toLocaleDateString('cs-CZ', options)
		const to = new Date(entry.dateTo).toLocaleDateString('cs-CZ', options)
		return `${from} – ${to}`
	}

	return ''
}

const handleClose = (value: boolean) => {
	if (!value) {
		closeModal()
	}
}
</script>
