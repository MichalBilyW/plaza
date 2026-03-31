<template>
	<div class="p-4 sm:p-6 lg:p-8">
		<div
			class="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
		>
			<div>
				<h1 class="text-xl sm:text-2xl font-bold text-gray-900">
					{{ t('cms.floors.title') }}
				</h1>
				<p class="text-plaza-dark mt-1 text-sm sm:text-base">
					{{ t('cms.floors.subtitle') }}
				</p>
			</div>
			<NuxtLink
				to="/cms/patra/novy"
				class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 4v16m8-8H4"
					/>
				</svg>
				{{ t('cms.floors.addFloor') }}
			</NuxtLink>
		</div>

		<!-- Loading state -->
		<div v-if="pending" class="bg-white rounded-xl shadow-sm p-8 text-center text-plaza-dark">
			{{ t('common.loading') }}
		</div>

		<!-- Error state -->
		<div v-else-if="error" class="bg-white rounded-xl shadow-sm p-8 text-center text-red-500">
			{{ t('common.error') }}: {{ error.message }}
		</div>

		<!-- Empty state -->
		<div v-else-if="!floors.length" class="bg-white rounded-xl shadow-sm p-8 text-center">
			<svg
				class="w-12 h-12 mx-auto text-gray-400 mb-4"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
				/>
			</svg>
			<p class="text-plaza-dark">{{ t('cms.floors.noFloors') }}</p>
		</div>

		<!-- Desktop: Table -->
		<div v-else class="hidden lg:block bg-white rounded-xl shadow-sm overflow-x-auto">
			<table class="w-full min-w-[600px]">
				<thead class="bg-gray-50 border-b">
					<tr>
						<th
							class="px-4 py-3 text-left text-xs font-medium text-plaza-dark uppercase tracking-wider w-12"
						></th>
						<th
							class="px-4 py-3 text-center text-xs font-medium text-plaza-dark uppercase tracking-wider w-12"
						>
							#
						</th>
						<th
							class="px-4 py-3 text-left text-xs font-medium text-plaza-dark uppercase tracking-wider w-20"
						>
							{{ t('cms.floors.level') }}
						</th>
						<th
							class="px-4 py-3 text-left text-xs font-medium text-plaza-dark uppercase tracking-wider"
						>
							{{ t('cms.floors.name') }}
						</th>
						<th
							class="px-4 py-3 text-left text-xs font-medium text-plaza-dark uppercase tracking-wider"
						>
							{{ t('cms.floors.slug') }}
						</th>
						<th
							class="px-4 py-3 text-center text-xs font-medium text-plaza-dark uppercase tracking-wider w-24"
						>
							{{ t('cms.floors.shopCount') }}
						</th>
						<th
							class="px-4 py-3 text-left text-xs font-medium text-plaza-dark uppercase tracking-wider w-24"
						>
							{{ t('cms.floors.status') }}
						</th>
						<th
							class="px-4 py-3 text-right text-xs font-medium text-plaza-dark uppercase tracking-wider w-24"
						>
							{{ t('common.actions') }}
						</th>
					</tr>
				</thead>
				<draggable
					v-model="sortableItems"
					tag="tbody"
					item-key="_id"
					handle=".drag-handle"
					:animation="200"
					class="divide-y divide-gray-200"
					@end="onDragEnd"
				>
					<template #item="{ element: floor }">
						<tr class="hover:bg-gray-50">
							<td class="px-4 py-3">
								<div
									class="drag-handle cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded inline-flex"
								>
									<svg
										class="w-5 h-5 text-gray-400"
										fill="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM8 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM14 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM14 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
										/>
									</svg>
								</div>
							</td>
							<td class="px-4 py-3 text-center text-sm text-plaza-dark">
								{{ floor.sortOrder + 1 }}
							</td>
							<td class="px-4 py-3">
								<span
									class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 font-medium"
									>{{ floor.level }}</span
								>
							</td>
							<td class="px-4 py-3">
								<NuxtLink
									:to="`/cms/patra/${floor._id}`"
									class="text-gray-900 hover:text-indigo-600 font-medium"
								>
									{{ floor.name }}
								</NuxtLink>
							</td>
							<td class="px-4 py-3 text-sm text-plaza-dark">
								{{ floor.slug }}
							</td>
							<td class="px-4 py-3 text-center">
								<span
									class="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 text-sm font-medium rounded-full bg-gray-100 text-gray-800"
								>
									{{ floor.shopCount ?? 0 }}
								</span>
							</td>
							<td class="px-4 py-3">
								<span
									:class="
										floor.isActive
											? 'bg-green-100 text-green-800'
											: 'bg-gray-100 text-gray-800'
									"
									class="inline-flex px-2 py-0.5 text-xs font-medium rounded-full"
								>
									{{
										floor.isActive
											? t('cms.floors.active')
											: t('cms.floors.inactive')
									}}
								</span>
							</td>
							<td class="px-4 py-3 text-right">
								<div class="flex items-center justify-end gap-1">
									<NuxtLink
										:to="`/cms/patra/${floor._id}`"
										class="text-indigo-600 hover:text-indigo-700 p-1"
										:title="t('common.edit')"
									>
										<svg
											class="w-5 h-5"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
											/>
										</svg>
									</NuxtLink>
									<button
										@click="confirmDelete(floor)"
										class="text-red-600 hover:text-red-700 p-1"
										:title="t('common.delete')"
									>
										<svg
											class="w-5 h-5"
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
							</td>
						</tr>
					</template>
				</draggable>
			</table>
		</div>

		<!-- Mobile/Tablet: Cards -->
		<draggable
			v-if="floors.length"
			v-model="sortableItems"
			item-key="_id"
			handle=".drag-handle-mobile"
			:animation="200"
			class="lg:hidden space-y-3"
			@end="onDragEnd"
		>
			<template #item="{ element: floor }">
				<div class="bg-white rounded-xl shadow-sm p-3">
					<div class="flex items-center gap-3">
						<div
							class="drag-handle-mobile cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded flex-shrink-0"
						>
							<svg
								class="w-5 h-5 text-gray-400"
								fill="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM8 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM14 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM14 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
								/>
							</svg>
						</div>
						<NuxtLink
							:to="`/cms/patra/${floor._id}`"
							class="flex-1 min-w-0 flex items-center gap-3"
						>
							<span
								class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-800 font-medium flex-shrink-0"
								>{{ floor.level }}</span
							>
							<div class="flex-1 min-w-0">
								<div class="flex items-center justify-between gap-2">
									<h3 class="font-medium text-gray-900 truncate">
										{{ floor.name }}
									</h3>
									<span
										:class="
											floor.isActive
												? 'bg-green-100 text-green-800'
												: 'bg-gray-100 text-gray-800'
										"
										class="inline-flex px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0"
									>
										{{
											floor.isActive
												? t('cms.floors.active')
												: t('cms.floors.inactive')
										}}
									</span>
								</div>
								<div class="flex items-center gap-2 mt-0.5">
									<p class="text-sm text-plaza-dark truncate">
										{{ floor.slug }}
									</p>
									<span class="text-sm text-plaza-dark">•</span>
									<span class="text-sm text-plaza-dark">
										{{ floor.shopCount ?? 0 }}
										{{ t('cms.floors.shopCount').toLowerCase() }}
									</span>
								</div>
							</div>
							<svg
								class="w-5 h-5 text-gray-400 flex-shrink-0"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 5l7 7-7 7"
								/>
							</svg>
						</NuxtLink>
					</div>
				</div>
			</template>
		</draggable>

		<!-- Delete confirmation modal -->
		<div
			v-if="deleteModal.show"
			class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
		>
			<div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
				<h3 class="text-lg font-semibold text-gray-900 mb-2">
					{{ t('cms.floors.deleteConfirmTitle') }}
				</h3>
				<p class="text-plaza-dark mb-6">
					{{ t('cms.floors.deleteConfirmMessage', { name: deleteModal.floor?.name }) }}
				</p>
				<div class="flex gap-3 justify-end">
					<button
						@click="deleteModal.show = false"
						class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
					>
						{{ t('common.cancel') }}
					</button>
					<button
						@click="deleteFloor"
						:disabled="deleteModal.loading"
						class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
					>
						{{ deleteModal.loading ? t('common.loading') : t('common.delete') }}
					</button>
				</div>
			</div>
		</div>

		<!-- Sekce pro SVG okolí (staticAroundMap) -->
		<div class="mt-8 bg-white rounded-xl shadow-sm p-6">
			<div class="flex items-center justify-between mb-4">
				<div>
					<h2 class="text-lg font-semibold text-gray-900">
						{{ t('cms.floors.staticAroundTitle') }}
					</h2>
					<p class="text-sm text-plaza-dark mt-1">
						{{ t('cms.floors.staticAroundDescription') }}
					</p>
				</div>
			</div>

			<div class="flex items-center gap-4">
				<!-- Aktuální stav -->
				<div class="flex items-center gap-2">
					<span v-if="staticAroundMap" class="text-green-600 flex items-center gap-1">
						<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
								clip-rule="evenodd"
							/>
						</svg>
						{{ t('cms.floors.hasStaticAround') }}
					</span>
					<span v-else class="text-gray-400 flex items-center gap-1">
						<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
								clip-rule="evenodd"
							/>
						</svg>
						{{ t('cms.floors.noStaticAround') }}
					</span>
				</div>

				<!-- Upload button -->
				<p v-if="!isSuperAdmin" class="text-sm text-amber-700">
					{{ t('cms.floors.superAdminOnlySvg') }}
				</p>
				<label
					v-if="isSuperAdmin"
					for="static-around-upload"
					class="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
						/>
					</svg>
					{{
						staticAroundMap
							? t('cms.floors.changeStaticAround')
							: t('cms.floors.uploadStaticAround')
					}}
				</label>
				<input
					v-if="isSuperAdmin"
					id="static-around-upload"
					type="file"
					accept=".svg,image/svg+xml"
					class="hidden"
					@change="handleStaticAroundUpload"
				/>

				<!-- Remove button -->
				<button
					v-if="staticAroundMap && isSuperAdmin"
					type="button"
					@click="removeStaticAround"
					class="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
						/>
					</svg>
					{{ t('cms.floors.removeStaticAround') }}
				</button>
			</div>

			<!-- Náhled -->
			<div v-if="staticAroundMap" class="mt-4 p-4 bg-gray-50 rounded-lg">
				<p class="text-sm text-plaza-dark mb-2">{{ t('cms.floors.preview') }}:</p>
				<div class="bg-white p-2 rounded border max-h-48 overflow-hidden">
					<img
						:src="staticAroundMap"
						alt="SVG okolí"
						class="max-w-full h-auto max-h-44 mx-auto block"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable'
import type { Floor, PaginatedResponse } from '@/shared/types'

definePageMeta({
	layout: 'cms',
	middleware: 'cms',
})

const { t } = useI18n()
const { secureFetch, isSuperAdmin, fetchUser } = useCmsAuth()
const flash = useFlashMessages()

if (import.meta.client) {
	await fetchUser()
}

usePlazaSeo({
	title: t('cms.floors.title'),
	noIndex: true,
})

// Load floors
const {
	data: floorsData,
	pending,
	error,
	refresh,
} = await useFetch<PaginatedResponse<Floor>>('/api/floors', {
	query: { limit: 100 },
})
const floors = computed(() => floorsData.value?.data || [])

// Load general info for staticAroundMap
const { data: generalInfo, refresh: refreshGeneralInfo } = await useFetch<{
	staticAroundMap?: string
}>('/api/general-info')
const staticAroundMap = computed(() => generalInfo.value?.staticAroundMap || null)

// Sortable items for drag & drop
const sortableItems = ref<Floor[]>([])

// Update sortableItems when floors change
watch(
	floors,
	(newFloors) => {
		sortableItems.value = [...newFloors].sort((a, b) => a.sortOrder - b.sortOrder)
	},
	{ immediate: true },
)

// Handle drag end - save new order
const onDragEnd = async () => {
	const ids = sortableItems.value.map((item) => item._id)
	try {
		await secureFetch('/api/floors/reorder', {
			method: 'PUT',
			body: { ids },
		})
		// Update local sortOrder values after successful save
		sortableItems.value.forEach((item, index) => {
			item.sortOrder = index
		})
	} catch {
		flash.error(t('common.error'))
		// Revert to original order on error
		sortableItems.value = [...floors.value].sort((a, b) => a.sortOrder - b.sortOrder)
	}
}

// Delete modal
const deleteModal = reactive({
	show: false,
	floor: null as Floor | null,
	loading: false,
})

const confirmDelete = (floor: Floor) => {
	deleteModal.floor = floor
	deleteModal.show = true
}

const deleteFloor = async () => {
	if (!deleteModal.floor) return

	deleteModal.loading = true
	try {
		await secureFetch(`/api/floors/${deleteModal.floor._id}`, { method: 'DELETE' })
		flash.success(t('cms.flash.floorDeleted'))
		deleteModal.show = false
		deleteModal.floor = null
		refresh()
	} catch (e) {
		// Extrahovat zprávu z API odpovědi
		const fetchError = e as { data?: { message?: string } }
		const errorMessage = fetchError?.data?.message || t('cms.flash.floorDeleteError')
		flash.error(errorMessage)
		console.error('Failed to delete floor:', e)
	} finally {
		deleteModal.loading = false
	}
}

// Static around SVG upload
const handleStaticAroundUpload = async (event: Event) => {
	if (!isSuperAdmin.value) {
		flash.error(t('cms.floors.superAdminOnlySvg'))
		return
	}

	const input = event.target as HTMLInputElement
	const file = input.files?.[0]
	if (!file) return

	// Validate file type
	if (!file.type.includes('svg') && !file.name.endsWith('.svg')) {
		flash.error(t('cms.floors.svgInvalidFormat'))
		input.value = ''
		return
	}

	try {
		// Upload file
		const formData = new FormData()
		formData.append('file', file)

		const uploadResponse = await secureFetch<{ url: string }>('/api/upload', {
			method: 'POST',
			body: formData,
		})

		// Update general info with new staticAroundMap
		await secureFetch('/api/general-info', {
			method: 'PUT',
			body: { staticAroundMap: uploadResponse.url },
		})

		flash.success(t('cms.floors.staticAroundUploaded'))
		refreshGeneralInfo()
	} catch (e) {
		flash.error(t('cms.floors.staticAroundUploadError'))
		console.error('Failed to upload static around SVG:', e)
	} finally {
		input.value = ''
	}
}

const removeStaticAround = async () => {
	if (!isSuperAdmin.value) {
		flash.error(t('cms.floors.superAdminOnlySvg'))
		return
	}

	try {
		await secureFetch('/api/general-info', {
			method: 'PUT',
			body: { staticAroundMap: '' },
		})
		flash.success(t('cms.floors.staticAroundRemoved'))
		refreshGeneralInfo()
	} catch (e) {
		flash.error(t('cms.floors.staticAroundRemoveError'))
		console.error('Failed to remove static around SVG:', e)
	}
}
</script>
