<template>
	<div class="space-y-2">
		<!-- Label -->
		<label v-if="label" class="block text-sm font-medium text-gray-700">
			{{ label }} <span v-if="required" class="text-red-500">*</span>
		</label>

		<!-- Upload area -->
		<div
			ref="dropZone"
			:class="[
				'relative border-2 border-dashed rounded-lg transition-colors cursor-pointer',
				isDragging
					? 'border-primary-500 bg-primary-50'
					: 'border-gray-300 hover:border-gray-400',
				disabled && 'opacity-50 cursor-not-allowed',
			]"
			@click="openFilePicker"
			@dragover.prevent="handleDragOver"
			@dragleave.prevent="handleDragLeave"
			@drop.prevent="handleDrop"
		>
			<!-- Preview when icon exists -->
			<div v-if="modelValue" class="p-4">
				<div class="relative group w-32 h-32 mx-auto">
					<img
						:src="modelValue"
						:alt="label || 'Nahraná ikona'"
						class="w-full h-full rounded-lg object-contain bg-gray-100 p-2"
					/>
					<!-- Overlay with actions -->
					<div
						class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2"
					>
						<button
							type="button"
							@click.stop="openFilePicker"
							class="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
							:title="t('cms.upload.changeImage')"
						>
							<svg
								class="w-5 h-5 text-gray-700"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
								/>
							</svg>
						</button>
						<button
							type="button"
							@click.stop="clearIcon"
							class="p-2 bg-white rounded-full hover:bg-red-100 transition-colors"
							:title="t('cms.upload.removeImage')"
						>
							<svg
								class="w-5 h-5 text-red-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
								/>
							</svg>
						</button>
					</div>
				</div>
			</div>

			<!-- Upload placeholder when no icon -->
			<div v-else class="p-6 text-center">
				<div v-if="uploading" class="flex flex-col items-center gap-2">
					<svg class="w-8 h-8 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
						<circle
							class="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							stroke-width="4"
						/>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						/>
					</svg>
					<span class="text-sm text-plaza-dark">{{ t('cms.upload.uploading') }}</span>
				</div>
				<template v-else>
					<svg
						class="mx-auto w-12 h-12 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
						/>
					</svg>
					<p class="mt-2 text-sm text-gray-600">
						{{ t('cms.upload.dragOrClick') }}
					</p>
					<p class="mt-1 text-xs text-gray-400">
						{{ t('cms.services.iconFormats') }}
					</p>
				</template>
			</div>
		</div>

		<!-- Hidden file input -->
		<input
			ref="fileInput"
			type="file"
			accept="image/svg+xml,image/png"
			class="hidden"
			:disabled="disabled || uploading"
			@change="handleFileSelect"
		/>

		<!-- Error message -->
		<p v-if="error" class="text-sm text-red-600">{{ error }}</p>

		<!-- Hint -->
		<p v-if="hint && !error" class="text-xs text-plaza-dark">{{ hint }}</p>
	</div>
</template>

<script setup lang="ts">
interface Props {
	modelValue?: string
	label?: string
	hint?: string
	disabled?: boolean
	required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: '',
	label: '',
	hint: '',
	disabled: false,
	required: false,
})

const emit = defineEmits<{
	'update:modelValue': [value: string]
}>()

const { t } = useI18n()
const { secureFetch } = useCmsAuth()

const fileInput = ref<HTMLInputElement | null>(null)
const dropZone = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const uploading = ref(false)
const error = ref('')

const ALLOWED_TYPES = ['image/svg+xml', 'image/png']

function openFilePicker() {
	if (props.disabled || uploading.value) return
	fileInput.value?.click()
}

function handleDragOver() {
	if (props.disabled || uploading.value) return
	isDragging.value = true
}

function handleDragLeave() {
	isDragging.value = false
}

async function handleDrop(e: DragEvent) {
	isDragging.value = false
	if (props.disabled || uploading.value) return

	const files = e.dataTransfer?.files
	if (files && files.length > 0 && files[0]) {
		await uploadFile(files[0])
	}
}

async function handleFileSelect(e: Event) {
	const target = e.target as HTMLInputElement
	const files = target.files
	if (files && files.length > 0 && files[0]) {
		await uploadFile(files[0])
	}
	// Reset input
	if (fileInput.value) {
		fileInput.value.value = ''
	}
}

async function uploadFile(file: File) {
	error.value = ''

	// Validate file type
	if (!ALLOWED_TYPES.includes(file.type)) {
		error.value = t('cms.services.iconInvalidFormat')
		return
	}

	// Validate file size (max 2MB)
	const maxSize = 2 * 1024 * 1024
	if (file.size > maxSize) {
		error.value = t('cms.upload.fileTooLarge')
		return
	}

	uploading.value = true

	try {
		const formData = new FormData()
		formData.append('file', file)

		const result = await secureFetch<{ url: string }>('/api/upload', {
			method: 'POST',
			body: formData,
		})

		emit('update:modelValue', result.url)
	} catch (err) {
		error.value = t('cms.upload.uploadError')
		console.error('Upload error:', err)
	} finally {
		uploading.value = false
	}
}

function clearIcon() {
	emit('update:modelValue', '')
}
</script>
