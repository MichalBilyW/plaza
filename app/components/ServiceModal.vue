<template>
	<UiModal v-model="isModalOpen" @update:model-value="handleClose">
		<div v-if="selectedService" class="flex flex-col items-center p-6 md:p-8">
			<!-- Service icon -->
			<div class="w-32 h-32 mb-4 flex items-center justify-center">
				<img
					:src="selectedService.icon"
					:alt="selectedService.shortDescription"
					class="max-w-full max-h-full object-contain"
				/>
			</div>

			<!-- Content -->
			<div
				v-if="selectedService.description"
				class="prose prose-sm max-w-none text-plaza-gray w-full"
				v-html="sanitizedContent"
			></div>
		</div>
	</UiModal>
</template>

<script setup lang="ts">
const { isModalOpen, selectedService, closeModal } = useServiceModal()
const { sanitize } = useSanitizeHtml()

const handleClose = (value: boolean) => {
	if (!value) {
		closeModal()
	}
}

// Sanitizovaný obsah
const sanitizedContent = computed(() => sanitize(selectedService.value?.description))
</script>
