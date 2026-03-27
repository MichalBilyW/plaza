export default defineNuxtPlugin(() => {
	// Inject CSS
	const cssLink = document.createElement('link')
	cssLink.rel = 'stylesheet'
	cssLink.id = 'silktide-consent-manager-css'
	cssLink.href = '/assets/silktide-cookie-bar/silktide-consent-manager.css'
	document.head.appendChild(cssLink)

	// Inject JavaScript
	const script = document.createElement('script')
	script.src = '/assets/silktide-cookie-bar/silktide-consent-manager.js'
	script.async = true

	script.onload = () => {
		// Initialize Google Consent Mode v2 with default denied state
		if (typeof gtag !== 'undefined') {
			gtag('consent', 'default', {
				analytics_storage: 'denied',
				ad_storage: 'denied',
				ad_user_data: 'denied',
				ad_personalization: 'denied',
				wait_for_update: 500,
			})
		}

		// Configure Silktide Cookie Banner
		if (window.silktideCookieBannerManager) {
			window.silktideCookieBannerManager.updateCookieBannerConfig({
				background: {
					showBackground: true,
				},
				cookieIcon: {
					position: 'bottomRight',
				},
				cookieTypes: [
					{
						id: 'nezbytn',
						name: 'Nezbytné',
						description:
							'<p>Tyto cookies jsou nutné pro správné fungování webu a není možné je vypnout. Zajišťují například přihlášení nebo uložení vašich preferencí ochrany soukromí.</p>',
						required: true,
						onAccept: function () {
							if (typeof dataLayer !== 'undefined') {
								dataLayer.push({
									event: 'cookie_consent_essential',
									consent_type: 'essential',
									consent_status: 'granted',
								})
							}
						},
					},
					{
						id: 'analytick',
						name: 'Analytické',
						description:
							'<p>Tyto cookies nám pomáhají zlepšovat naše stránky tím, že sledují, které stránky jsou nejnavštěvovanější a jak se návštěvníci po webu pohybují.</p>',
						required: false,
						defaultValue: false,
						onAccept: function () {
							if (typeof gtag !== 'undefined') {
								gtag('consent', 'update', {
									analytics_storage: 'granted',
								})
							}
							if (typeof dataLayer !== 'undefined') {
								dataLayer.push({
									event: 'cookie_consent_analytics',
									consent_type: 'analytics',
									consent_status: 'granted',
								})
							}
						},
						onReject: function () {
							if (typeof gtag !== 'undefined') {
								gtag('consent', 'update', {
									analytics_storage: 'denied',
								})
							}
							if (typeof dataLayer !== 'undefined') {
								dataLayer.push({
									event: 'cookie_consent_analytics',
									consent_type: 'analytics',
									consent_status: 'denied',
								})
							}
						},
					},
					{
						id: 'reklamn_a_personaliza_n',
						name: 'Reklamní a personalizační',
						description:
							'<p>Tyto cookies umožňují další funkce a personalizaci pro lepší uživatelský zážitek. Mohou je nastavovat my nebo naši partneři.</p>',
						required: false,
						defaultValue: false,
						onAccept: function () {
							if (typeof gtag !== 'undefined') {
								gtag('consent', 'update', {
									ad_storage: 'granted',
									ad_user_data: 'granted',
									ad_personalization: 'granted',
								})
							}
							if (typeof dataLayer !== 'undefined') {
								dataLayer.push({
									event: 'cookie_consent_advertising',
									consent_type: 'advertising',
									consent_status: 'granted',
								})
							}
						},
						onReject: function () {
							if (typeof gtag !== 'undefined') {
								gtag('consent', 'update', {
									ad_storage: 'denied',
									ad_user_data: 'denied',
									ad_personalization: 'denied',
								})
							}
							if (typeof dataLayer !== 'undefined') {
								dataLayer.push({
									event: 'cookie_consent_advertising',
									consent_type: 'advertising',
									consent_status: 'denied',
								})
							}
						},
					},
				],
				text: {
					banner: {
						description:
							'Na našem webu používáme soubory cookies ke zlepšení vašeho uživatelského zážitku, personalizaci obsahu a analýze návštěvnosti. <a href="/cookies" target="_blank">Více informací o cookies</a>.',
						acceptAllButtonText: 'Přijmout',
						acceptAllButtonAccessibleLabel: 'Přijmout všechny cookies',
						rejectNonEssentialButtonText: 'Přijmout nezbytné',
						rejectNonEssentialButtonAccessibleLabel: 'Přijmout pouze nezbytné cookies',
						preferencesButtonText: 'Nastavení cookies',
						preferencesButtonAccessibleLabel: 'Otevřít nastavení cookies',
					},
					preferences: {
						title: 'Nastavení cookies',
						description:
							'<p>Respektujeme vaše soukromí. Můžete si zvolit, jaké typy cookies na našem webu povolíte. Vaše volba se bude vztahovat na celý web.</p>',
						creditLinkText: '',
						creditLinkAccessibleLabel: '',
					},
				},
				position: {
					banner: 'bottomCenter',
				},
				onAcceptAll: () => {
					if (typeof dataLayer !== 'undefined') {
						dataLayer.push({
							event: 'cookie_consent_all',
							consent_action: 'accept_all',
						})
					}
				},
				onRejectAll: () => {
					if (typeof dataLayer !== 'undefined') {
						dataLayer.push({
							event: 'cookie_consent_all',
							consent_action: 'reject_all',
						})
					}
				},
			})
		}
	}

	document.head.appendChild(script)
})

// TypeScript declarations
declare global {
	interface Window {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		silktideCookieBannerManager: any
		dataLayer: Record<string, unknown>[]
		gtag: (...args: unknown[]) => void
	}
	function gtag(...args: unknown[]): void
	const dataLayer: Record<string, unknown>[]
}
