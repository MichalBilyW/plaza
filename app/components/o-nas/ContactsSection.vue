<template>
	<section v-if="!pending && contacts && contacts.length > 0" class="py-12">
		<div class="container-small px-4">
			<!-- Nadpis -->
			<h2
				class="font-heading font-black text-2xl md:text-4xl text-plaza-dark mb-8 text-center uppercase"
			>
				{{ t('aboutPage.contactsSection.title') }}
			</h2>

			<!-- Skeleton -->
			<div v-if="pending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				<div
					v-for="i in 3"
					:key="i"
					class="h-[130px] skeleton-shimmer rounded-[5px_20px_5px_5px]"
				></div>
			</div>

			<!-- Grid kontaktů -->
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
				<div
					v-for="(contact, index) in contacts"
					:key="index"
					class="w-full max-w-[280px] bg-white rounded-[5px_20px_5px_5px] shadow-lg p-5"
				>
					<!-- Název kontaktu -->
					<p v-if="contact.title" class="font-medium text-plaza-dark mb-3">
						{{ contact.title }}
					</p>

					<!-- Jméno -->
					<p v-if="contact.name" class="text-plaza-dark">
						{{ contact.name }}
					</p>

					<!-- Telefon -->
					<a
						v-if="contact.phone"
						:href="`tel:${formatPhoneForLink(contact.phone)}`"
						class="block text-plaza hover:underline"
					>
						{{ contact.phone }}
					</a>

					<!-- Email -->
					<a
						v-if="contact.email"
						:href="`mailto:${contact.email}`"
						class="block text-plaza hover:underline"
					>
						{{ contact.email }}
					</a>
				</div>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import type { Contact } from '@/shared/types'

const { t } = useI18n()

defineProps<{
	contacts?: Contact[] | null
	pending: boolean
}>()

/**
 * Formátuje telefonní číslo pro tel: link - odebere mezery a pomlčky
 */
const formatPhoneForLink = (phone: string): string => {
	return phone.replace(/[\s-]/g, '')
}
</script>
