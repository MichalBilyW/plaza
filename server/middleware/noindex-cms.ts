const NOINDEX_ROBOTS = 'noindex, nofollow, noarchive, nosnippet, noimageindex'

export default defineEventHandler((event) => {
	const pathname = getRequestURL(event).pathname

	if (pathname === '/cms' || pathname.startsWith('/cms/')) {
		setResponseHeader(event, 'X-Robots-Tag', NOINDEX_ROBOTS)
	}
})
