<template>
	<ClientOnly>
		<Teleport to="body">
			<div
				v-if="open"
				class="fixed inset-0 z-50 flex items-center justify-center p-4"
				@click.self="emitClose"
			>
				<div class="fixed inset-0 bg-black/50" @click="emitClose"></div>
				<div
					class="relative bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 z-10 max-h-[90vh] overflow-y-auto"
				>
					<button
						type="button"
						class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
						@click="emitClose"
					>
						<svg
							class="w-6 h-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>

					<h3 class="text-lg font-semibold text-gray-900 mb-1">
						{{ t('cms.map.export.title') }}
					</h3>
					<p class="text-sm text-plaza-dark mb-4">
						{{ floor?.floorName }}
					</p>

					<div class="space-y-5">
						<!-- Formát -->
						<fieldset>
							<legend class="block text-sm font-medium text-gray-700 mb-2">
								{{ t('cms.map.export.format') }}
							</legend>
							<div class="grid grid-cols-2 gap-2">
								<label
									v-for="opt in formatOptions"
									:key="opt.value"
									:class="[
										'flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors',
										format === opt.value
											? 'border-indigo-600 bg-indigo-50 text-indigo-700'
											: 'border-gray-200 hover:bg-gray-50 text-gray-700',
									]"
								>
									<input
										v-model="format"
										:value="opt.value"
										type="radio"
										name="export-format"
										class="sr-only"
									/>
									<span class="font-medium text-sm">{{ opt.label }}</span>
								</label>
							</div>
						</fieldset>

						<!-- PDF papír -->
						<fieldset v-if="format === 'pdf'">
							<legend class="block text-sm font-medium text-gray-700 mb-2">
								{{ t('cms.map.export.paper') }}
							</legend>
							<div class="flex gap-2">
								<label
									v-for="opt in paperOptions"
									:key="opt.value"
									:class="[
										'flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors',
										paperFormat === opt.value
											? 'border-indigo-600 bg-indigo-50 text-indigo-700'
											: 'border-gray-200 hover:bg-gray-50 text-gray-700',
									]"
								>
									<input
										v-model="paperFormat"
										:value="opt.value"
										type="radio"
										name="export-paper"
										class="sr-only"
									/>
									<span class="font-medium text-sm">{{ opt.label }}</span>
								</label>
							</div>
						</fieldset>

						<!-- Obsah -->
						<fieldset>
							<legend class="block text-sm font-medium text-gray-700 mb-2">
								{{ t('cms.map.export.content') }}
							</legend>

							<label
								class="flex items-start gap-3 px-3 py-2 rounded-lg border border-gray-200 mb-2 cursor-pointer hover:bg-gray-50"
							>
								<input
									v-model="options.mapOnly"
									type="checkbox"
									class="mt-0.5"
								/>
								<div>
									<div class="text-sm font-medium text-gray-900">
										{{ t('cms.map.export.mapOnly') }}
									</div>
									<div class="text-xs text-plaza-dark">
										{{ t('cms.map.export.mapOnlyHint') }}
									</div>
								</div>
							</label>

							<div :class="{ 'opacity-40 pointer-events-none': options.mapOnly }">
								<label
									v-for="item in contentItems"
									:key="item.key"
									class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer"
								>
									<input
										v-model="options[item.key]"
										type="checkbox"
									/>
									<span class="text-sm text-gray-800">{{ item.label }}</span>
								</label>
							</div>
						</fieldset>

						<!-- Info o kvalitě -->
						<div class="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
							{{ t('cms.map.export.qualityNote') }}
						</div>
					</div>

					<div class="mt-6 flex items-center justify-end gap-2">
						<button
							type="button"
							class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
							:disabled="busy"
							@click="emitClose"
						>
							{{ t('cms.map.export.cancel') }}
						</button>
						<button
							type="button"
							class="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
							:disabled="busy || !floor?.svgContent"
							@click="onExport"
						>
							<svg
								v-if="busy"
								class="animate-spin h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
									class="opacity-25"
								/>
								<path
									fill="currentColor"
									class="opacity-75"
									d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
								/>
							</svg>
							{{ busy ? t('cms.map.export.processing') : t('cms.map.export.download') }}
						</button>
					</div>
				</div>
			</div>
		</Teleport>
	</ClientOnly>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
	DEFAULT_EXPORT_OPTIONS,
	useMapExport,
	type ExportFormat,
	type MapExportOptions,
	type PdfPaperFormat,
} from '~/composables/useMapExport'
import type { FloorUnitsResponse } from '~~/shared/map/units'

const props = defineProps<{
	open: boolean
	floor: FloorUnitsResponse | null
	staticAroundMapContent: string | null
}>()

const emit = defineEmits<{
	(e: 'close'): void
}>()

const { t } = useI18n()
const { exportFloor } = useMapExport()
const flash = useFlashMessages()

const format = ref<ExportFormat>('pdf')
const paperFormat = ref<PdfPaperFormat>('a3')
const options = reactive<MapExportOptions>({ ...DEFAULT_EXPORT_OPTIONS })
const busy = ref(false)

watch(
	() => props.open,
	(isOpen) => {
		if (isOpen) {
			Object.assign(options, DEFAULT_EXPORT_OPTIONS)
			format.value = 'pdf'
			paperFormat.value = 'a3'
		}
	},
)

const formatOptions: Array<{ value: ExportFormat; label: string }> = [
	{ value: 'pdf', label: 'PDF' },
	{ value: 'svg', label: 'SVG' },
]

const paperOptions: Array<{ value: PdfPaperFormat; label: string }> = [
	{ value: 'a3', label: 'A3 (na šířku)' },
	{ value: 'a4', label: 'A4 (na šířku)' },
]

const contentItems = computed(() => [
	{ key: 'showPlazaLogo' as const, label: t('cms.map.export.optPlazaLogo') },
	{ key: 'showHeader' as const, label: t('cms.map.export.optHeader') },
	{ key: 'showShopList' as const, label: t('cms.map.export.optShopList') },
])

function emitClose() {
	if (busy.value) return
	emit('close')
}

async function onExport() {
	if (!props.floor) return
	busy.value = true
	try {
		await exportFloor({
			floor: props.floor,
			staticAroundMapContent: props.staticAroundMapContent,
			options: { ...options },
			format: format.value,
			paperFormat: paperFormat.value,
		})
		flash.success(t('cms.map.export.success'))
		emit('close')
	} catch (err) {
		console.error('[MapExport] error:', err)
		flash.error(t('cms.map.export.error'))
	} finally {
		busy.value = false
	}
}
</script>
