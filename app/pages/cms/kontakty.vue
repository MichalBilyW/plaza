<template>
	<div class="p-4 sm:p-6 lg:p-8">
		<div
			class="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
		>
			<div>
				<h1 class="text-xl sm:text-2xl font-bold text-gray-900">
					{{ t('cms.contacts.title') }}
				</h1>
				<p class="text-plaza-dark mt-1 text-sm sm:text-base">
					{{ t('cms.contacts.subtitle') }}
				</p>
			</div>
			<button
				v-if="contacts.length < 30"
				type="button"
				class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-cms-shops-600 text-white rounded-lg hover:bg-cms-shops-700 transition-colors text-sm sm:text-base"
				@click="openAddModal"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 4v16m8-8H4"
					/>
				</svg>
				{{ t('cms.contacts.addContact') }}
			</button>
		</div>

		<!-- Loading state -->
		<div v-if="pending" class="bg-white rounded-xl shadow-sm p-8 text-center text-plaza-dark">
			{{ t('common.loading') }}
		</div>

		<!-- Empty state -->
		<div
			v-else-if="contacts.length === 0"
			class="bg-white rounded-xl shadow-sm p-8 text-center"
		>
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
					d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
				/>
			</svg>
			<p class="text-plaza-dark">{{ t('cms.contacts.noContacts') }}</p>
		</div>

		<!-- Contacts Table -->
		<div v-else class="bg-white rounded-xl shadow-sm overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-gray-50 border-b border-gray-200">
						<tr>
							<th
								class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								{{ t('cms.contacts.table.title') }}
							</th>
							<th
								class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								{{ t('cms.contacts.table.name') }}
							</th>
							<th
								class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								{{ t('cms.contacts.table.phone') }}
							</th>
							<th
								class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								{{ t('cms.contacts.table.email') }}
							</th>
							<th
								class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								{{ t('cms.contacts.table.actions') }}
							</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200">
						<tr
							v-for="(contact, index) in contacts"
							:key="index"
							class="hover:bg-gray-50"
						>
							<td class="px-4 py-3 text-sm text-gray-900">
								{{ contact.title || '—' }}
							</td>
							<td class="px-4 py-3 text-sm text-gray-900">
								{{ contact.name || '—' }}
							</td>
							<td class="px-4 py-3 text-sm text-gray-900">
								<a
									v-if="contact.phone"
									:href="`tel:${formatPhoneForLink(contact.phone)}`"
									class="text-plaza hover:underline"
								>
									{{ contact.phone }}
								</a>
								<span v-else>—</span>
							</td>
							<td class="px-4 py-3 text-sm text-gray-900">
								<a
									v-if="contact.email"
									:href="`mailto:${contact.email}`"
									class="text-plaza hover:underline"
								>
									{{ contact.email }}
								</a>
								<span v-else>—</span>
							</td>
							<td class="px-4 py-3 text-sm text-right">
								<div class="flex items-center justify-end gap-2">
									<button
										type="button"
										class="text-cms-shops-600 hover:text-cms-shops-700 p-1"
										:title="t('common.edit')"
										@click="openEditModal(index)"
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
									</button>
									<button
										type="button"
										class="text-red-500 hover:text-red-700 p-1"
										:title="t('common.delete')"
										@click="confirmDelete(index)"
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
					</tbody>
				</table>
			</div>
			<div class="px-4 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
				{{ t('cms.contacts.maxContactsHint', { count: contacts.length, max: 30 }) }}
			</div>
		</div>

		<!-- Add/Edit Modal -->
		<Teleport to="body">
			<div
				v-if="modal.show"
				class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
			>
				<div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
					<h3 class="text-lg font-semibold text-gray-900 mb-4">
						{{
							modal.editIndex !== null
								? t('cms.contacts.editContact')
								: t('cms.contacts.addContact')
						}}
					</h3>

					<form class="space-y-4" @submit.prevent="saveContact">
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1">
								{{ t('cms.contacts.contactTitle') }}
							</label>
							<input
								v-model="modal.form.title"
								type="text"
								maxlength="100"
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-shops-500 focus:border-transparent"
								:placeholder="t('cms.contacts.contactTitlePlaceholder')"
							/>
						</div>

						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1">
								{{ t('cms.contacts.contactName') }}
							</label>
							<input
								v-model="modal.form.name"
								type="text"
								maxlength="100"
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-shops-500 focus:border-transparent"
								:placeholder="t('cms.contacts.contactNamePlaceholder')"
							/>
						</div>

						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1">
								{{ t('cms.contacts.contactPhone') }}
							</label>
							<input
								v-model="modal.form.phone"
								type="tel"
								maxlength="30"
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-shops-500 focus:border-transparent"
								:placeholder="t('cms.contacts.contactPhonePlaceholder')"
							/>
						</div>

						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1">
								{{ t('cms.contacts.contactEmail') }}
							</label>
							<input
								v-model="modal.form.email"
								type="email"
								maxlength="100"
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-shops-500 focus:border-transparent"
								:placeholder="t('cms.contacts.contactEmailPlaceholder')"
							/>
						</div>

						<div class="flex gap-3 justify-end pt-4">
							<button
								type="button"
								class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
								@click="modal.show = false"
							>
								{{ t('common.cancel') }}
							</button>
							<button
								type="submit"
								:disabled="submitting"
								class="px-4 py-2 bg-cms-shops-600 text-white rounded-lg hover:bg-cms-shops-700 transition-colors disabled:opacity-50"
							>
								{{ submitting ? t('common.saving') : t('common.save') }}
							</button>
						</div>
					</form>
				</div>
			</div>
		</Teleport>

		<!-- Delete confirmation modal -->
		<Teleport to="body">
			<div
				v-if="deleteModal.show"
				class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
			>
				<div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
					<h3 class="text-lg font-semibold text-gray-900 mb-2">
						{{ t('cms.contacts.deleteConfirmTitle') }}
					</h3>
					<p class="text-plaza-dark mb-6">
						{{ t('cms.contacts.deleteConfirmMessage') }}
					</p>
					<div class="flex gap-3 justify-end">
						<button
							type="button"
							class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
							@click="deleteModal.show = false"
						>
							{{ t('common.cancel') }}
						</button>
						<button
							type="button"
							:disabled="submitting"
							class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
							@click="deleteContact"
						>
							{{ submitting ? t('common.deleting') : t('common.delete') }}
						</button>
					</div>
				</div>
			</div>
		</Teleport>
	</div>
</template>

<script setup lang="ts">
import type { Contact, GeneralInfo } from '~~/shared/types'

definePageMeta({
	layout: 'cms',
	middleware: 'cms',
})

const { t } = useI18n()
const { secureFetch } = useCmsAuth()

usePlazaSeo({
	title: t('cms.contacts.title'),
	noIndex: true,
})

interface ContactForm {
	title: string
	name: string
	phone: string
	email: string
}

const contacts = ref<Contact[]>([])
const submitting = ref(false)
const flash = useFlashMessages()

// Fetch data
const { data, pending, refresh } = await useFetch<GeneralInfo>('/api/general-info')

watch(
	data,
	(info) => {
		contacts.value = info?.contacts || []
	},
	{ immediate: true },
)

// Add/Edit Modal
const modal = reactive({
	show: false,
	editIndex: null as number | null,
	form: {
		title: '',
		name: '',
		phone: '',
		email: '',
	} as ContactForm,
})

const openAddModal = () => {
	modal.editIndex = null
	modal.form = { title: '', name: '', phone: '', email: '' }
	modal.show = true
}

const openEditModal = (index: number) => {
	const contact = contacts.value[index]
	modal.editIndex = index
	modal.form = {
		title: contact.title || '',
		name: contact.name || '',
		phone: contact.phone || '',
		email: contact.email || '',
	}
	modal.show = true
}

const saveContact = async () => {
	submitting.value = true

	try {
		const newContacts = [...contacts.value]
		const contactData: Contact = {
			title: modal.form.title?.trim() || undefined,
			name: modal.form.name?.trim() || undefined,
			phone: modal.form.phone?.trim() || undefined,
			email: modal.form.email?.trim() || undefined,
		}

		// Skip if all fields are empty
		if (!contactData.title && !contactData.name && !contactData.phone && !contactData.email) {
			modal.show = false
			return
		}

		if (modal.editIndex !== null) {
			newContacts[modal.editIndex] = contactData
		} else {
			newContacts.push(contactData)
		}

		await secureFetch('/api/general-info', {
			method: 'PUT',
			body: { contacts: newContacts },
		})

		flash.success(t('cms.flash.contactsSaved'))
		modal.show = false
		await refresh()
	} catch (e) {
		flash.error(t('cms.flash.contactsSaveError'))
	} finally {
		submitting.value = false
	}
}

// Delete Modal
const deleteModal = reactive({
	show: false,
	index: null as number | null,
})

const confirmDelete = (index: number) => {
	deleteModal.index = index
	deleteModal.show = true
}

const deleteContact = async () => {
	if (deleteModal.index === null) return

	submitting.value = true

	try {
		const newContacts = contacts.value.filter((_, i) => i !== deleteModal.index)

		await secureFetch('/api/general-info', {
			method: 'PUT',
			body: { contacts: newContacts },
		})

		flash.success(t('cms.flash.contactsSaved'))
		deleteModal.show = false
		await refresh()
	} catch (e) {
		flash.error(t('cms.flash.contactsSaveError'))
	} finally {
		submitting.value = false
	}
}

// Helper for phone links
const formatPhoneForLink = (phone: string): string => {
	return phone.replace(/\s+/g, '')
}
</script>
