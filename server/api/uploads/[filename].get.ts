/**
 * GET /api/uploads/[filename]
 * Servíruje nahrané soubory z uploads složky
 * Optimalizováno pro výkon s Nitro serveStatic
 */

import { existsSync, statSync } from 'fs'
import { join, extname } from 'path'
import { serveStatic, createError, setHeader } from 'h3'

// Povolené přípony (whitelist pro bezpečnost)
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'])

// Určit uploads adresář jednou při startu
const uploadsDir =
	process.env.NODE_ENV === 'production'
		? join(process.cwd(), '.output', 'public', 'uploads')
		: join(process.cwd(), 'public', 'uploads')

export default defineEventHandler(async (event) => {
	const filename = getRouterParam(event, 'filename')

	if (!filename) {
		throw createError({ statusCode: 400, statusMessage: 'Chybí název souboru' })
	}

	// Bezpečnostní kontroly
	// 1. Path traversal
	if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
		throw createError({ statusCode: 400, statusMessage: 'Neplatný název souboru' })
	}

	// 2. Whitelist přípon (zabrání servírování .js, .ts, .env atd.)
	const ext = extname(filename).toLowerCase()
	if (!ALLOWED_EXTENSIONS.has(ext)) {
		throw createError({ statusCode: 400, statusMessage: 'Nepodporovaný typ souboru' })
	}

	// 3. UUID formát (volitelné, ale přidává bezpečnost)
	const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-z]+$/i
	if (!uuidPattern.test(filename)) {
		throw createError({ statusCode: 400, statusMessage: 'Neplatný formát názvu' })
	}

	const filepath = join(uploadsDir, filename)

	if (!existsSync(filepath)) {
		throw createError({ statusCode: 404, statusMessage: 'Soubor nenalezen' })
	}

	// Cache headers - soubory mají UUID, takže immutable cache je bezpečná
	setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')

	// Nitro serveStatic - optimalizovanější než manuální streaming
	// Podporuje Range requests, ETag, Last-Modified automaticky
	return serveStatic(event, {
		getContents: () => import('fs').then((fs) => fs.promises.readFile(filepath)),
		getMeta: () => {
			const stats = statSync(filepath)
			return {
				size: stats.size,
				mtime: stats.mtimeMs,
			}
		},
	})
})
