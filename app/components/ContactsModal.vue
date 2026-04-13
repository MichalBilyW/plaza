<template>
	<UiModal v-model="isModalOpen" @update:model-value="handleClose">
		<div class="p-6 md:p-8">
			<!-- Loading state -->
			<div v-if="pending" class="flex justify-center py-8">
				<div
					class="w-8 h-8 border-4 border-plaza border-t-transparent rounded-full animate-spin"
				></div>
			</div>

			<ONasContactsSection v-else :contacts="generalInfo?.contacts" :pending="false" />
		</div>
	</UiModal>
</template>

<script setup lang="ts">
import type { GeneralInfo } from '@/shared/types'

const { isModalOpen, closeModal } = useContactsModal()

// Fetch general info when modal opens
const {
	data: generalInfo,
	pending,
	refresh,
} = useFetch<GeneralInfo>('/api/general-info', {
	key: 'contacts-modal',
	immediate: false,
})

// Watch for modal open to fetch data
watch(isModalOpen, (isOpen) => {
	if (isOpen) {
		refresh()
	}
})

const handleClose = (value: boolean) => {
	if (!value) {
		closeModal()
	}
}
</script>
