<template>
	<div class="p-4 sm:p-6 lg:p-8">
		<div
			class="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
		>
			<div>
				<h1 class="text-xl sm:text-2xl font-bold text-gray-900">
					{{ t('cms.news.title') }}
				</h1>
				<p class="text-plaza-dark mt-1 text-sm sm:text-base">
					{{ t('cms.news.subtitle') }}
				</p>
			</div>
			<NuxtLink
				to="/cms/novinky/nova"
				class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-cms-news-600 text-white rounded-lg hover:bg-cms-news-700 transition-colors text-sm sm:text-base"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 4v16m8-8H4"
					/>
				</svg>
				{{ t('cms.news.addNews') }}
			</NuxtLink>
		</div>

		<!-- Filters -->
		<div class="mb-6 flex flex-col sm:flex-row gap-4">
			<div class="flex-1">
				<input
					v-model="search"
					type="text"
					:placeholder="t('cms.news.searchPlaceholder')"
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-news-500 focus:border-transparent"
				/>
			</div>
			<select
				v-model="activeFilter"
				class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-news-500 focus:border-transparent"
			>
				<option value="">{{ t('cms.news.allStatus') }}</option>
				<option value="true">{{ t('cms.news.activeOnly') }}</option>
				<option value="false">{{ t('cms.news.inactiveOnly') }}</option>
			</select>
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
		<div v-else-if="!news.length" class="bg-white rounded-xl shadow-sm p-8 text-center">
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
					d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
				/>
			</svg>
			<p class="text-plaza-dark">{{ t('cms.news.noNews') }}</p>
		</div>

		<!-- News Grid -->
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
						<svg
							class="w-4 h-4 text-plaza-dark"
							fill="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM8 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM14 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM14 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
							/>
						</svg>
					</div>
					<!-- Image -->
					<div class="aspect-square relative overflow-hidden bg-gray-100">
						<img
							v-if="item.image"
							:src="item.image"
							:alt="item.name"
							class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
									d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
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
						<div class="flex items-center justify-between gap-2">
							<h3 class="font-medium text-gray-900 truncate">{{ item.name }}</h3>
							<span
								class="inline-flex items-center justify-center text-xs min-w-6 w-6 h-6 rounded-full bg-cms-categories-100 text-cms-categories-800 font-medium"
								>{{ item.sortOrder }}</span
							>
						</div>

						<!-- Actions -->
						<div class="mt-3 flex items-center justify-between">
							<NuxtLink
								:to="`/cms/novinky/${item._id}`"
								class="text-cms-news-600 hover:text-cms-news-700 text-sm font-medium"
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
						{{ t('cms.news.deleteConfirmTitle') }}
					</h3>
					<p class="text-plaza-dark mb-6">
						{{ t('cms.news.deleteConfirmMessage', { name: deleteModal.item?.name }) }}
					</p>
					<div class="flex gap-3 justify-end">
						<button
							@click="deleteModal.show = false"
							class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
						>
							{{ t('common.cancel') }}
						</button>
						<button
							@click="deleteNews"
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
import type { News } from '~~/shared/types'

definePageMeta({
	layout: 'cms',
	middleware: 'cms',
})

usePlazaSeo({
	title: 'Novinky a akce centra',
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

// Fetch news
const {
	data: newsData,
	pending,
	error,
	refresh,
} = await useFetch<{ data: News[] }>('/api/news', {
	query: computed(() => ({
		limit: 100,
		search: debouncedSearch.value || undefined,
		isActive: activeFilter.value === '' ? undefined : activeFilter.value === 'true',
	})),
})
const news = computed(() => newsData.value?.data || [])

// Sortable items for drag & drop
const sortableItems = ref<News[]>([])

// Update sortableItems when news change
watch(
	news,
	(newNews) => {
		sortableItems.value = [...newNews].sort((a, b) => a.sortOrder - b.sortOrder)
	},
	{ immediate: true },
)

// Handle drag end - save new order
const onDragEnd = async () => {
	const ids = sortableItems.value.map((item) => item._id)
	try {
		await secureFetch('/api/news/reorder', {
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
		sortableItems.value = [...news.value].sort((a, b) => a.sortOrder - b.sortOrder)
	}
}

// Delete modal
const deleteModal = reactive({
	show: false,
	loading: false,
	item: null as News | null,
})

const confirmDelete = (item: News) => {
	deleteModal.item = item
	deleteModal.show = true
}

const deleteNews = async () => {
	if (!deleteModal.item) return

	deleteModal.loading = true
	try {
		await secureFetch(`/api/news/${deleteModal.item._id}`, {
			method: 'DELETE',
		})
		flash.success(t('cms.news.deleteSuccess'))
		deleteModal.show = false
		await refresh()
	} catch {
		flash.error(t('cms.news.deleteError'))
	} finally {
		deleteModal.loading = false
	}
}
</script>
