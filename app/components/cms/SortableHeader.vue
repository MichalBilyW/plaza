<script setup lang="ts">
const props = defineProps<{
	field: string
	sortIcon: 'asc' | 'desc' | null
	class?: string
}>()

const emit = defineEmits<{
	sort: [field: string]
}>()

const handleClick = () => {
	emit('sort', props.field)
}
</script>

<template>
	<th
		:class="[
			'px-4 py-3 text-left text-xs font-medium text-plaza-dark uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 transition-colors',
			props.class,
		]"
		@click="handleClick"
	>
		<div class="flex items-center gap-1">
			<slot ></slot>
			<span class="w-4 h-4 flex-shrink-0">
				<svg
					v-if="sortIcon === 'asc'"
					class="w-4 h-4 text-gray-700"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M5 15l7-7 7 7"
					/>
				</svg>
				<svg
					v-else-if="sortIcon === 'desc'"
					class="w-4 h-4 text-gray-700"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 9l-7 7-7-7"
					/>
				</svg>
				<svg
					v-else
					class="w-4 h-4 text-gray-300"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
					/>
				</svg>
			</span>
		</div>
	</th>
</template>
