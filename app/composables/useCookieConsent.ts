export const useCookieConsent = () => {
	const hasConsent = (cookieType: string): boolean => {
		if (import.meta.client) {
			const consent = localStorage.getItem(`silktideCookieChoice_${cookieType}`)
			return consent === 'true'
		}
		return false
	}

	const hasGivenInitialConsent = (): boolean => {
		if (import.meta.client) {
			return !!localStorage.getItem('silktideCookieBanner_InitialChoice')
		}
		return false
	}

	const openCookieSettings = () => {
		if (import.meta.client && window.silktideCookieBannerManager) {
			const modal = document.querySelector('#silktide-modal')
			if (modal) {
				;(modal as HTMLElement).style.display = 'flex'
				const backdrop = document.querySelector('#silktide-backdrop')
				if (backdrop) {
					;(backdrop as HTMLElement).style.display = 'block'
				}
				if (typeof dataLayer !== 'undefined') {
					dataLayer.push({
						event: 'cookie_settings_opened',
						interaction_type: 'cookie_preferences',
					})
				}
			}
		}
	}

	const revokeAllConsent = () => {
		if (import.meta.client) {
			const cookieTypes = ['analytick', 'reklamn_a_personaliza_n']
			cookieTypes.forEach((type) => {
				localStorage.removeItem(`silktideCookieChoice_${type}`)
			})
			localStorage.removeItem('silktideCookieBanner_InitialChoice')

			if (typeof dataLayer !== 'undefined') {
				dataLayer.push({
					event: 'cookie_consent_revoked',
					consent_action: 'revoke_all',
				})
			}
			if (typeof gtag !== 'undefined') {
				gtag('consent', 'update', {
					analytics_storage: 'denied',
					ad_storage: 'denied',
					ad_user_data: 'denied',
					ad_personalization: 'denied',
				})
			}
			window.location.reload()
		}
	}

	const trackConsentInteraction = (action: string, consentType?: string) => {
		if (import.meta.client && typeof dataLayer !== 'undefined') {
			dataLayer.push({
				event: 'cookie_consent_interaction',
				consent_action: action,
				consent_type: consentType || 'unknown',
			})
		}
	}

	return {
		hasConsent,
		hasGivenInitialConsent,
		openCookieSettings,
		revokeAllConsent,
		trackConsentInteraction,
	}
}
