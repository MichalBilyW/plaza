<template>
	<div class="p-4 sm:p-6 lg:p-8">
		<div
			class="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
		>
			<div>
				<h1 class="text-xl sm:text-2xl font-bold text-gray-900">
					{{ t('cms.services.title') }}
				</h1>
				<p class="text-gray-500 mt-1 text-sm sm:text-base">
					{{ t('cms.services.subtitle') }}
				</p>
			</div>
			<NuxtLink
				to="/cms/sluzby/nova"
				class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-cms-services-600 text-white rounded-lg hover:bg-cms-services-700 transition-colors text-sm sm:text-base"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 4v16m8-8H4"
					/>
				</svg>
				{{ t('cms.services.addService') }}
			</NuxtLink>
		</div>

		<!-- Filters -->
		<div class="mb-6 flex flex-col sm:flex-row gap-4">
			<div class="flex-1">
				<input
					v-model="search"
					type="text"
					:placeholder="t('cms.services.searchPlaceholder')"
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-services-500 focus:border-transparent"
				/>
			</div>
			<select
				v-model="activeFilter"
				class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-services-500 focus:border-transparent"
			>
				<option value="">{{ t('cms.services.allStatus') }}</option>
				<option value="true">{{ t('cms.services.activeOnly') }}</option>
				<option value="false">{{ t('cms.services.inactiveOnly') }}</option>
			</select>
		</div>

		<!-- Loading state -->
		<div v-if="pending" class="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
			{{ t('common.loading') }}
		</div>

		<!-- Error state -->
		<div v-else-if="error" class="bg-white rounded-xl shadow-sm p-8 text-center text-red-500">
			{{ t('common.error') }}: {{ error.message }}
		</div>

		<!-- Empty state -->
		<div v-else-if="!services.length" class="bg-white rounded-xl shadow-sm p-8 text-center">
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
					d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
				/>
			</svg>
			<p class="text-gray-500">{{ t('cms.services.noServices') }}</p>
		</div>

		<!-- Services Grid -->
		<draggable
			v-else
			v-model="sortableItems"
			item-key="_id"
			handle=".drag-handle"
			:animation="200"
			class="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
			@end="onDragEnd"
		>
			<template #item="{ element: item }">
				<div class="bg-white rounded-xl shadow-sm overflow-hidden group relative">
					<!-- Drag handle -->
					<div
						class="drag-handle absolute top-2 left-2 z-10 cursor-grab active:cursor-grabbing p-1.5 bg-white/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
					>
						<svg class="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
							<path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM8 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM14 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM14 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
						</svg>
					</div>
					<!-- Icon -->
					<div class="aspect-square relative overflow-hidden bg-gray-100 p-6">
						<img
						v-if="item.icon"
						:src="item.icon"
						:alt="item.shortDescription"
						class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
					/>
					<div
						v-else
						class="w-full h-full flex items-center justify-center text-gray-400"
					>
						<svg
							class="w-16 h-16"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1"
								d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
							/>
						</svg>
					</div>
					<!-- Status badge -->
					<div class="absolute top-2 right-2">
						<span
							:class="item.isActive ? 'bg-green-500' : 'bg-gray-400'"
							class="inline-flex w-8 h-8 rounded-full"
						></span>
					</div>
				</div>

				<!-- Content -->
				<div class="p-4">
					<div class="flex items-start justify-between gap-2">
						<p class="font-medium text-gray-900 truncate">{{ item.shortDescription }}</p>
						<span class="inline-flex items-center justify-center text-xs min-w-6 w-6 h-6 rounded-full bg-cms-categories-100 text-cms-categories-800 font-medium">{{ item.sortOrder }}</span>
					</div>

					<!-- Actions -->
					<div class="mt-3 flex items-center justify-between">
						<NuxtLink
							:to="`/cms/sluzby/${item._id}`"
							class="text-cms-services-600 hover:text-cms-services-700 text-sm font-medium"
						>
							{{ t('common.edit') }}
						</NuxtLink>
						<button
							@click="confirmDelete(item)"
							class="text-red-500 hover:text-red-700 p-1"
							:title="t('common.delete')"
						>
							<svg
								class="w-4 h-4"
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
			</template>
		</draggable>

		<!-- Delete confirmation modal -->
		<Teleport to="body">
			<div
				v-if="deleteModal.show"
				class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
			>
				<div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
					<h3 class="text-lg font-semibold text-gray-900 mb-2">
						{{ t('cms.services.deleteConfirmTitle') }}
					</h3>
					<p class="text-gray-500 mb-6">
						{{ t('cms.services.deleteConfirmMessage') }}
					</p>
					<div class="flex gap-3 justify-end">
						<button
							@click="deleteModal.show = false"
							class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
						>
							{{ t('common.cancel') }}
						</button>
						<button
							@click="deleteService"
							:disabled="deleteModal.loading"
							class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
						>
							{{ deleteModal.loading ? t('common.loading') : t('common.delete') }}
						</button>
					</div>
				</div>
			</div>
		</Teleport>
	</div>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable'
import type { Service } from '~~/shared/types'

definePageMeta({
	layout: 'cms',
	middleware: 'cms',
})

usePlazaSeo({
	title: 'Služby',
	noIndex: true,
})

const { t } = useI18n()
const { secureFetch } = useCmsAuth()
const flash = useFlashMessages()

// Filters
const search = ref('')
const activeFilter = ref('')

// Debounced search
const debouncedSearch = ref('')
let debounceTimeout: ReturnType<typeof setTimeout> | null = null
watch(search, (newValue) => {
	if (debounceTimeout) clearTimeout(debounceTimeout)
	debounceTimeout = setTimeout(() => {
		debouncedSearch.value = newValue
	}, 300)
})

// Fetch services
const {
	data: servicesData,
	pending,
	error,
	refresh,
} = await useFetch<{ data: Service[] }>('/api/services', {
	query: computed(() => ({
		limit: 100,
		search: debouncedSearch.value || undefined,
		isActive: activeFilter.value === '' ? undefined : activeFilter.value === 'true',
	})),
})
const services = computed(() => servicesData.value?.data || [])

// Sortable items for drag & drop
const sortableItems = ref<Service[]>([])

// Update sortableItems when services change
watch(
	services,
	(newServices) => {
		sortableItems.value = [...newServices].sort((a, b) => a.sortOrder - b.sortOrder)
	},
	{ immediate: true },
)

// Handle drag end - save new order
const onDragEnd = async () => {
	const ids = sortableItems.value.map((item) => item._id)
	try {
		await secureFetch('/api/services/reorder', {
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
		sortableItems.value = [...services.value].sort((a, b) => a.sortOrder - b.sortOrder)
	}
}

// Delete modal
const deleteModal = reactive({
	show: false,
	loading: false,
	item: null as Service | null,
})

const confirmDelete = (item: Service) => {
	deleteModal.item = item
	deleteModal.show = true
}

const deleteService = async () => {
	if (!deleteModal.item) return

	deleteModal.loading = true
	try {
		await secureFetch(`/api/services/${deleteModal.item._id}`, {
			method: 'DELETE',
		})
		flash.success(t('cms.services.deleteSuccess'))
		deleteModal.show = false
		await refresh()
	} catch {
		flash.error(t('cms.services.deleteError'))
	} finally {
		deleteModal.loading = false
	}
}
</script>
