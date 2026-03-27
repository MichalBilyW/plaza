<template>
	<UiModal v-model="isModalOpen" @update:model-value="handleClose">
		<div v-if="selectedEvent" class="p-6 md:p-8">
			<!-- Event image -->
			<div v-if="selectedEvent.image" class="mb-6 -mx-6 -mt-6 md:-mx-8 md:-mt-8">
				<img
					:src="selectedEvent.image"
					:alt="selectedEvent.name"
					class="w-full h-48 md:h-64 object-cover"
				/>
			</div>

			<!-- Shop info -->
			<div v-if="selectedEvent.shop" class="flex items-center gap-4 mb-6">
				<img
					v-if="selectedEvent.shop.logo"
					:src="selectedEvent.shop.logo"
					:alt="selectedEvent.shop.name"
					class="h-10 w-auto object-contain"
				/>
				<span class="font-heading font-bold text-lg text-plaza-dark">
					{{ selectedEvent.shop.name }}
				</span>
			</div>

			<!-- Content -->
			<div
				v-if="selectedEvent.content"
				class="prose prose-sm max-w-none text-plaza-gray"
				v-html="sanitizedContent"
			></div>
		</div>
	</UiModal>
</template>

<script setup lang="ts">
const { isModalOpen, selectedEvent, closeModal } = useEventModal()
const { sanitize } = useSanitizeHtml()

const handleClose = (value: boolean) => {
	if (!value) {
		closeModal()
	}
}

// Sanitizovaný obsah
const sanitizedContent = computed(() => sanitize(selectedEvent.value?.content))
</script>
