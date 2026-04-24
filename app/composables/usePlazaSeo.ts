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

const NOINDEX_ROBOTS = 'noindex, nofollow, noarchive, nosnippet, noimageindex'

export const usePlazaSeo = (config: SeoConfig) => {
	const runtimeConfig = useRuntimeConfig()
	const route = useRoute()
	const requestUrl = useRequestURL()

	const baseUrl = requestUrl.origin || runtimeConfig.public.siteUrl || 'https://ocplazaliberec.cz'
	const siteName = 'Obchodní centrum Plaza Liberec'

	const fullTitle = config.title === siteName ? siteName : `${config.title} | ${siteName}`

	const fullUrl = config.url || `${baseUrl}${route.path}`
	const isCmsRoute = route.path === '/cms' || route.path.startsWith('/cms/')
	const noIndex = config.noIndex || isCmsRoute

	// Nastavit SEO meta tagy
	useSeoMeta({
		title: fullTitle,
		ogTitle: fullTitle,
		description: config.description || 'Prohlédněte si obchody a služby v OC Plaza Liberec, interaktivní mapu centra, možnosti parkování, aktuální akce a novinky i další informace o centru.',
		ogDescription: config.description || 'Prohlédněte si obchody a služby v OC Plaza Liberec, interaktivní mapu centra, možnosti parkování, aktuální akce a novinky i další informace o centru.',
		ogImage: config.image || `${baseUrl}/images/og.jpg`,
		ogUrl: noIndex ? undefined : fullUrl,
		ogType: config.type || 'website',
		ogSiteName: siteName,
		twitterCard: 'summary_large_image',
		twitterTitle: fullTitle,
		twitterDescription: config.description || 'Prohlédněte si obchody a služby v OC Plaza Liberec, interaktivní mapu centra, možnosti parkování, aktuální akce a novinky i další informace o centru.',
		twitterImage: config.image || `${baseUrl}/images/og.jpg`,
		robots: noIndex ? NOINDEX_ROBOTS : 'index, follow',
	})

	// Nastavit canonical URL
	useHead({
		link: noIndex ? [] : [{ rel: 'canonical', href: fullUrl }],
		meta: noIndex ? [{ name: 'googlebot', content: NOINDEX_ROBOTS }] : [],
	})
}
