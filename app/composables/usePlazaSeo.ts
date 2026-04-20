/**
 * SEO Composable pro jednoduchou správu meta tagů
 */

interface SeoConfig {
	title: string
	description?: string
	image?: string
	url?: string
	type?: 'website' | 'article'
	noIndex?: boolean
}

export const usePlazaSeo = (config: SeoConfig) => {
	const runtimeConfig = useRuntimeConfig()
	const route = useRoute()

	const baseUrl = runtimeConfig.public.siteUrl || 'https://ocplazaliberec.cz'
	const siteName = 'OC Plaza Liberec'

	const fullTitle = config.title === siteName ? siteName : `${config.title} | ${siteName}`

	const fullUrl = config.url || `${baseUrl}${route.path}`

	// Nastavit SEO meta tagy
	useSeoMeta({
		title: fullTitle,
		ogTitle: fullTitle,
		description: config.description || 'Nákupní centrum v srdci Liberce',
		ogDescription: config.description || 'Nákupní centrum v srdci Liberce',
		ogImage: config.image || `${baseUrl}/images/og.jpg`,
		ogUrl: fullUrl,
		ogType: config.type || 'website',
		ogSiteName: siteName,
		twitterCard: 'summary_large_image',
		twitterTitle: fullTitle,
		twitterDescription: config.description || 'Nákupní centrum v srdci Liberce',
		twitterImage: config.image || `${baseUrl}/images/og.jpg`,
		robots: config.noIndex ? 'noindex, nofollow' : 'index, follow',
	})

	// Nastavit canonical URL
	useHead({
		link: [{ rel: 'canonical', href: fullUrl }],
	})
}
