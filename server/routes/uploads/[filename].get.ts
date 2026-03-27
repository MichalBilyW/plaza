/**
 * GET /uploads/[filename]
 * Redirect na /api/uploads/[filename] pro zpětnou kompatibilitu
 */

export default defineEventHandler((event) => {
	const filename = getRouterParam(event, 'filename')
	return sendRedirect(event, `/api/uploads/${filename}`, 301)
})
