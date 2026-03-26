<template>
	<Teleport to="body">
		<Transition name="modal">
			<div
				v-if="modelValue"
				class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-8"
				@keydown="handleKeydown"
			>
				<!-- Overlay -->
				<div
					class="absolute inset-0 bg-black/50 backdrop-blur"
					aria-hidden="true"
					@click="close"
				></div>

				<!-- Modal content -->
				<div
					ref="modalRef"
					class="modal-scrollbar relative bg-white !rounded-[5px] overflow-x-hidden shadow-xl w-full max-w-[1024px] max-h-[90vh] overflow-y-auto"
					role="dialog"
					aria-modal="true"
					:aria-label="$t('common.more')"
					tabindex="-1"
				>
					<!-- Close button -->
					<button
						ref="closeButtonRef"
						type="button"
						class="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center text-plaza-dark hover:text-gray-700 transition-colors"
						:aria-label="$t('common.close')"
						@click="close"
					>
						<svg
							class="w-6 h-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							aria-hidden="true"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>

					<!-- Content slot -->
					<div class="container-small">
						<slot></slot>
					</div>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
	modelValue: boolean
}>()

const emit = defineEmits<{
	'update:modelValue': [value: boolean]
}>()

const modalRef = ref<HTMLElement | null>(null)
const closeButtonRef = ref<HTMLElement | null>(null)
let previouslyFocused: HTMLElement | null = null

const close = () => {
	emit('update:modelValue', false)
}

// Close on Escape key + trap focus inside modal
const handleKeydown = (e: KeyboardEvent) => {
	if (e.key === 'Escape') {
		close()
		return
	}

	// Focus trap
	if (e.key === 'Tab' && modalRef.value) {
		const focusable = modalRef.value.querySelectorAll<HTMLElement>(
			'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
		)
		const first = focusable[0]
		const last = focusable[focusable.length - 1]

		if (e.shiftKey) {
			if (document.activeElement === first) {
				e.preventDefault()
				last?.focus()
			}
		} else {
			if (document.activeElement === last) {
				e.preventDefault()
				first?.focus()
			}
		}
	}
}

// Lock body scroll when modal is open + manage focus
watch(
	() => props.modelValue,
	(isOpen) => {
		if (isOpen) {
			previouslyFocused = document.activeElement as HTMLElement | null
			document.body.style.overflow = 'hidden'
			nextTick(() => {
				closeButtonRef.value?.focus()
			})
		} else {
			document.body.style.overflow = ''
			nextTick(() => {
				previouslyFocused?.focus()
				previouslyFocused = null
			})
		}
	},
)

onUnmounted(() => {
	document.body.style.overflow = ''
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
	transition: opacity 0.2s ease;
}

.modal-enter-active > div:last-child,
.modal-leave-active > div:last-child {
	transition:
		transform 0.2s ease,
		opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
	opacity: 0;
}

.modal-enter-from > div:last-child,
.modal-leave-to > div:last-child {
	transform: scale(0.95);
	opacity: 0;
}

/* Scrollbar - Chrome, Safari, Opera */
.modal-scrollbar::-webkit-scrollbar {
	width: 10px;
	scrollbar-width: thin !important;
	scrollbar-color: #e20b1b transparent !important;
}
.modal-scrollbar::-webkit-scrollbar-track {
	background: transparent;
	margin-block: 20px 5px;
	scrollbar-width: thin !important;
	scrollbar-color: #e20b1b transparent !important;
}
.modal-scrollbar::-webkit-scrollbar-thumb {
	border-radius: 5px;
	scrollbar-width: thin !important;
	scrollbar-color: #e20b1b transparent !important;
}
.modal-scrollbar::-webkit-scrollbar-thumb:hover {
	scrollbar-width: thin !important;
	scrollbar-color: #e20b1b transparent !important;
}

/* Scrollbar - Firefox */
.modal-scrollbar {
	scrollbar-width: thin !important;
	scrollbar-color: #e20b1b transparent !important;
}
</style>
