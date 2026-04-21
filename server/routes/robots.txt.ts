/**
 * GET /robots.txt
 * Dynamický robots.txt - na testovacím serveru zakáže indexaci
 */

export default defineEventHandler((event) => {
	const config = useRuntimeConfig()
	const host = getRequestHost(event)
	const siteUrl = config.public.siteUrl as string

	// Produkční doména
	const productionHost = new URL(siteUrl).host

	// Pokud nejsme na produkci, zakázat indexaci
	const isProduction = host === productionHost

	setResponseHeader(event, 'Content-Type', 'text/plain')

	if (!isProduction) {
		// Testovací/staging server - zakázat vše
		return `# Test server - no indexing
User-Agent: *
Disallow: /
`
	}

	// Produkce - normální pravidla
	return `User-Agent: *
Disallow: /cms
Disallow: /cms/
Disallow: /api/

Sitemap: ${siteUrl}/sitemap.xml
`
})
