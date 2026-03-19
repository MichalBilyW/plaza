<template>
	<div class="space-y-2">
		<!-- Label -->
		<label v-if="label" class="block text-sm font-medium text-gray-700">
			{{ label }}
		</label>

		<!-- Hint -->
		<p v-if="hint" class="text-xs text-gray-500">{{ hint }}</p>

		<!-- Gallery grid -->
		<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
			<!-- Existing images with drag support -->
			<div
				v-for="(image, index) in modelValue"
				:key="image"
				draggable="true"
				:class="[
					'relative group cursor-move',
					dragOverIndex === index && 'ring-2 ring-plaza-500 ring-offset-2',
					draggingIndex === index && 'opacity-50',
				]"
				@dragstart="handleImageDragStart($event, index)"
				@dragend="handleImageDragEnd"
				@dragover.prevent="handleImageDragOver($event, index)"
				@dragleave="handleImageDragLeave"
				@drop.prevent="handleImageDrop($event, index)"
			>
				<img :src="image" class="w-full h-24 object-cover rounded-lg bg-gray-100" alt="" />
				<!-- Order badge -->
				<span
					class="absolute top-1 left-1 w-5 h-5 bg-gray-900/70 text-white text-xs rounded-full flex items-center justify-center"
				>
					{{ index + 1 }}
				</span>
				<!-- Drag handle indicator -->
				<div
					class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center"
				>
					<svg
						class="w-6 h-6 text-white opacity-0 group-hover:opacity-70 transition-opacity drop-shadow"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 8h16M4 16h16"
						/>
					</svg>
				</div>
				<button
					type="button"
					@click.stop="removeImage(index)"
					class="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<!-- Upload area -->
			<div
				v-if="canAddMore"
				ref="dropZone"
				:class="[
					'relative border-2 border-dashed rounded-lg transition-colors cursor-pointer h-24 flex items-center justify-center',
					isDragging
						? 'border-primary-500 bg-primary-50'
						: 'border-gray-300 hover:border-gray-400',
					disabled && 'opacity-50 cursor-not-allowed',
				]"
				@click="openFilePicker"
				@dragover.prevent="handleUploadDragOver"
				@dragleave.prevent="handleUploadDragLeave"
				@drop.prevent="handleUploadDrop"
			>
				<div v-if="uploading" class="flex flex-col items-center gap-1">
					<svg class="w-6 h-6 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
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
					<span class="text-xs text-gray-500">{{ uploadProgress }}</span>
				</div>
				<div v-else class="text-center p-2">
					<svg
						class="mx-auto w-6 h-6 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 4v16m8-8H4"
						/>
					</svg>
					<p class="mt-1 text-xs text-gray-500">{{ t('cms.gallery.addImages') }}</p>
				</div>
			</div>
		</div>

		<!-- Hidden file input -->
		<input
			ref="fileInput"
			type="file"
			accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
			multiple
			class="hidden"
			:disabled="disabled || uploading"
			@change="handleFileSelect"
		/>

		<!-- Error message -->
		<p v-if="error" class="text-sm text-red-600">{{ error }}</p>

		<!-- Count and drag hint -->
		<div class="flex justify-between text-xs text-gray-500">
			<span>{{ modelValue.length }}/{{ max }} {{ t('cms.gallery.images') }}</span>
			<span v-if="modelValue.length > 1">{{ t('cms.gallery.dragToReorder') }}</span>
		</div>
	</div>
</template>

<script setup lang="ts">
interface Props {
	modelValue: string[]
	label?: string
	hint?: string
	disabled?: boolean
	max?: number
}

const props = withDefaults(defineProps<Props>(), {
	label: '',
	hint: '',
	disabled: false,
	max: 10,
})

const emit = defineEmits<{
	'update:modelValue': [value: string[]]
}>()

const { t } = useI18n()
const { secureFetch } = useCmsAuth()

const fileInput = ref<HTMLInputElement | null>(null)
const dropZone = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const uploading = ref(false)
const error = ref('')
const uploadProgress = ref('')

// Drag and drop reordering state
const draggingIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

const canAddMore = computed(() => props.modelValue.length < props.max)

function openFilePicker() {
	if (props.disabled || uploading.value) return
	fileInput.value?.click()
}

// Image reordering drag handlers
function handleImageDragStart(e: DragEvent, index: number) {
	if (props.disabled) return
	draggingIndex.value = index
	e.dataTransfer!.effectAllowed = 'move'
	e.dataTransfer!.setData('text/plain', String(index))
}

function handleImageDragEnd() {
	draggingIndex.value = null
	dragOverIndex.value = null
}

function handleImageDragOver(e: DragEvent, index: number) {
	if (props.disabled || draggingIndex.value === null) return
	e.dataTransfer!.dropEffect = 'move'
	dragOverIndex.value = index
}

function handleImageDragLeave() {
	dragOverIndex.value = null
}

function handleImageDrop(e: DragEvent, targetIndex: number) {
	if (props.disabled) return

	const sourceIndex = draggingIndex.value
	if (sourceIndex === null || sourceIndex === targetIndex) {
		draggingIndex.value = null
		dragOverIndex.value = null
		return
	}

	// Reorder images
	const newImages = [...props.modelValue]
	const [movedImage] = newImages.splice(sourceIndex, 1)
	if (movedImage) {
		newImages.splice(targetIndex, 0, movedImage)
		emit('update:modelValue', newImages)
	}

	draggingIndex.value = null
	dragOverIndex.value = null
}

// Upload area drag handlers
function handleUploadDragOver(e: DragEvent) {
	// Ignore if it's an image reorder drag
	if (draggingIndex.value !== null) return
	if (props.disabled || uploading.value) return
	isDragging.value = true
}

function handleUploadDragLeave(e: DragEvent) {
	isDragging.value = false
}

async function handleUploadDrop(e: DragEvent) {
	isDragging.value = false
	// Ignore if it's an image reorder drag
	if (draggingIndex.value !== null) {
		draggingIndex.value = null
		dragOverIndex.value = null
		return
	}
	if (props.disabled || uploading.value) return

	const files = e.dataTransfer?.files
	if (files && files.length > 0) {
		await uploadFiles(Array.from(files))
	}
}

async function handleFileSelect(e: Event) {
	const target = e.target as HTMLInputElement
	const files = target.files
	if (files && files.length > 0) {
		await uploadFiles(Array.from(files))
	}
	// Reset input value to allow re-selecting same files
	target.value = ''
}

async function uploadFiles(files: File[]) {
	error.value = ''

	// Filter to allowed types
	const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
	const maxSize = 5 * 1024 * 1024

	const validFiles = files.filter((file) => {
		if (!allowedTypes.includes(file.type)) {
			return false
		}
		if (file.size > maxSize) {
			return false
		}
		return true
	})

	if (validFiles.length === 0) {
		error.value = t('cms.upload.invalidType')
		return
	}

	// Limit number of files
	const remaining = props.max - props.modelValue.length
	const filesToUpload = validFiles.slice(0, remaining)

	if (filesToUpload.length === 0) {
		error.value = t('cms.gallery.maxReached')
		return
	}

	uploading.value = true
	const newUrls: string[] = []

	try {
		for (let i = 0; i < filesToUpload.length; i++) {
			const file = filesToUpload[i]
			if (!file) continue

			uploadProgress.value = `${i + 1}/${filesToUpload.length}`

			const formData = new FormData()
			formData.append('file', file)

			const result = await secureFetch<{ url: string }>('/api/upload', {
				method: 'POST',
				body: formData,
			})

			newUrls.push(result.url)
		}

		emit('update:modelValue', [...props.modelValue, ...newUrls])
	} catch (e: unknown) {
		const errorMessage = e instanceof Error ? e.message : t('cms.upload.uploadError')
		error.value = errorMessage

		// Still emit partial results if any uploaded successfully
		if (newUrls.length > 0) {
			emit('update:modelValue', [...props.modelValue, ...newUrls])
		}
	} finally {
		uploading.value = false
		uploadProgress.value = ''
	}
}

function removeImage(index: number) {
	const newImages = [...props.modelValue]
	newImages.splice(index, 1)
	emit('update:modelValue', newImages)
}
</script>
