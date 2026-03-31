export default defineNuxtPlugin(() => {
	if (import.meta.client) {
		// Skip GTM on CMS pages
		const route = useRoute()
		if (route.path.startsWith('/cms')) return

		const config = useRuntimeConfig()
		const gtmId = config.public.gtmId as string

		if (!gtmId) return

		// Initialize dataLayer before GTM
		window.dataLayer = window.dataLayer || []

		// Default consent denied before GTM loads (Google Consent Mode v2)
		window.dataLayer.push({
			event: 'default_consent',
			analytics_storage: 'denied',
			ad_storage: 'denied',
			ad_user_data: 'denied',
			ad_personalization: 'denied',
			wait_for_update: 500,
		})

		// Load GTM
		window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' })

		const script = document.createElement('script')
		script.async = true
		script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`

		const firstScript = document.getElementsByTagName('script')[0]
		if (firstScript?.parentNode) {
			firstScript.parentNode.insertBefore(script, firstScript)
		} else {
			document.head.appendChild(script)
		}
	}
})
