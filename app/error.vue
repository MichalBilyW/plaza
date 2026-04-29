<template>
	<div class="min-h-screen flex flex-col">
		<!-- Skip navigation -->
		<a href="#main-content" class="skip-link">{{ $t('common.skipToContent') }}</a>

		<!-- Header -->
		<LayoutTheHeader
			:opening-hours="generalInfo?.openingHours"
			:special-opening-hours="generalInfo?.specialOpeningHours"
		/>

		<!-- Error content -->
		<main
			id="main-content"
			class="flex-1 flex items-center justify-center px-4 pt-[60px] lg:pt-[90px] bg-gradient-to-b from-[#131313] to-[#1A1A1A]"
		>
			<div class="text-center py-20">
				<h1 class="text-8xl md:text-9xl font-heading font-black text-plaza mb-4">
					{{ error?.statusCode || 404 }}
				</h1>
				<h2 class="text-2xl md:text-3xl font-heading font-bold text-white mb-4">
					{{ errorTitle }}
				</h2>
				<p class="text-white/70 mb-8 max-w-md mx-auto">
					{{ errorDescription }}
				</p>
				<NuxtLink
					to="/"
					class="inline-flex items-center justify-center px-6 py-3 bg-plaza text-white font-sans font-semibold rounded-[5px_20px_5px_5px] hover:bg-plaza/90 transition-colors"
					@click="handleError"
				>
					{{ $t('errorPage.backToHome') }}
				</NuxtLink>
			</div>
		</main>

		<!-- Footer -->
		<LayoutTheFooter />
	</div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'
import type { OpeningHoursEntry, SpecialOpeningHours } from '@/shared/types'

const { t } = useI18n()

const props = defineProps<{
	error: NuxtError
}>()

// Nastavit správný HTTP status code pro SSR (kritické pro SEO — Google nesmí indexovat 404 jako 200)
if (import.meta.server) {
	const event = useRequestEvent()
	if (event) {
		setResponseStatus(event, props.error?.statusCode || 500)
	}
}

// Pokud je to 404, doplnit noindex + canonical zákaz pro tuto chybovou stránku
useHead({
	meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

// Načtení obecných informací (otevírací doba pro header)
const { data: generalInfo } = useFetch<{
	openingHours?: OpeningHoursEntry[]
	specialOpeningHours?: SpecialOpeningHours[]
}>('/api/general-info')

const errorTitle = computed(() => {
	const code = props.error?.statusCode || 404
	const key = `errorPage.title.${code}` as const
	const defaultKey = 'errorPage.title.default'

	// Zkusíme konkrétní kód, jinak default
	const translation = t(key)
	return translation !== key ? translation : t(defaultKey)
})

const errorDescription = computed(() => {
	const code = props.error?.statusCode || 404
	const key = `errorPage.description.${code}` as const
	const defaultKey = 'errorPage.description.default'

	// Zkusíme konkrétní kód, jinak default nebo message z chyby
	const translation = t(key)
	if (translation !== key) return translation
	return props.error?.message || t(defaultKey)
})

// Clear error on navigation
const handleError = () => clearError({ redirect: '/' })
</script>
