/**
 * Test pro ověření konzistence endpoints registry vs skutečné server route soubory
 *
 * Tento test zajišťuje, že všechny endpointy definované v shared/api/endpoints.ts
 * mají odpovídající implementaci v server/api/ složce.
 */

import { describe, it, expect } from 'vitest'
import { getAllEndpoints } from '../shared/api/endpoints'
import { readdirSync, statSync, existsSync } from 'fs'
import { join, resolve } from 'path'

// Mapování HTTP metod na přípony souborů Nitro
const methodToSuffix: Record<string, string> = {
	GET: '.get.ts',
	POST: '.post.ts',
	PUT: '.put.ts',
	PATCH: '.patch.ts',
	DELETE: '.delete.ts',
}

/**
 * Rekurzivně získá všechny TypeScript soubory v dané složce
 */
function getAllServerRouteFiles(dir: string, basePath = ''): string[] {
	const files: string[] = []

	if (!existsSync(dir)) {
		return files
	}

	const entries = readdirSync(dir)

	for (const entry of entries) {
		const fullPath = join(dir, entry)
		const relativePath = join(basePath, entry)

		if (statSync(fullPath).isDirectory()) {
			files.push(...getAllServerRouteFiles(fullPath, relativePath))
		} else if (entry.endsWith('.ts')) {
			files.push(relativePath)
		}
	}

	return files
}

/**
 * Konvertuje cestu endpointu na možné cesty k souborům
 * Např: /api/shops -> ['shops.get.ts', 'shops/index.get.ts']
 * Např: /api/shops/:id -> ['shops/[id].get.ts']
 */
function endpointPathToFilePaths(path: string, method: string): string[] {
	// Odstranit /api/ prefix
	let filePath = path.replace(/^\/api\//, '')

	// Konvertovat :param na [param]
	filePath = filePath.replace(/:(\w+)/g, '[$1]')

	// Přidat metodu jako příponu
	const suffix = methodToSuffix[method] || '.get.ts'

	// Pro kořenové endpointy (bez další cesty za modulem) vracíme obě varianty
	// shops -> shops.get.ts NEBO shops/index.get.ts
	const parts = filePath.split('/')
	if (parts.length === 1) {
		return [
			filePath + suffix, // shops.get.ts
			filePath + '/index' + suffix, // shops/index.get.ts
		]
	}

	return [filePath + suffix]
}

/**
 * Konvertuje cestu souboru na endpoint path
 * Např: shops/[id].get.ts -> /api/shops/:id (GET)
 * Např: shops/index.get.ts -> /api/shops (GET)
 */
function filePathToEndpoint(filePath: string): { path: string; method: string } | null {
	// Najít metodu
	let method = 'GET'
	let cleanPath = filePath

	for (const [m, suffix] of Object.entries(methodToSuffix)) {
		if (filePath.endsWith(suffix)) {
			method = m
			cleanPath = filePath.slice(0, -suffix.length)
			break
		}
	}

	// Pokud nemá žádnou metodu příponu, přeskočit
	if (cleanPath === filePath) {
		return null
	}

	// Odstranit /index z konce (Nitro konvence)
	if (cleanPath.endsWith('/index')) {
		cleanPath = cleanPath.slice(0, -6)
	}

	// Konvertovat [param] na :param
	cleanPath = cleanPath.replace(/\[(\w+)\]/g, ':$1')

	// Přidat /api/ prefix
	const path = '/api/' + cleanPath

	return { path, method }
}

describe('Endpoints Registry Consistency', () => {
	const serverApiDir = resolve(__dirname, '../server/api')
	const serverRouteFiles = getAllServerRouteFiles(serverApiDir)
	const registeredEndpoints = getAllEndpoints()

	it('should have implementation files for all registered endpoints', () => {
		const missingFiles: string[] = []

		for (const endpoint of registeredEndpoints) {
			const expectedFiles = endpointPathToFilePaths(endpoint.path, endpoint.method)
			const found = serverRouteFiles.some((file) => {
				// Normalizovat cesty pro porovnání
				const normalizedFile = file.replace(/\\/g, '/')
				return expectedFiles.some(
					(expected) => normalizedFile === expected.replace(/\\/g, '/'),
				)
			})

			if (!found) {
				missingFiles.push(
					`${endpoint.method} ${endpoint.path} -> ${expectedFiles.join(' nebo ')}`,
				)
			}
		}

		if (missingFiles.length > 0) {
			console.log('\n❌ Chybějící implementace pro registrované endpointy:')
			missingFiles.forEach((f) => console.log(`   - ${f}`))
		}

		expect(missingFiles, `Chybějící implementace: ${missingFiles.join(', ')}`).toHaveLength(0)
	})

	it('should have all implemented endpoints registered in endpoints registry', () => {
		const unregisteredEndpoints: string[] = []

		for (const file of serverRouteFiles) {
			const endpoint = filePathToEndpoint(file)

			if (!endpoint) {
				continue // Přeskočit soubory bez metody
			}

			const found = registeredEndpoints.some(
				(e) => e.path === endpoint.path && e.method === endpoint.method,
			)

			if (!found) {
				unregisteredEndpoints.push(`${endpoint.method} ${endpoint.path} (${file})`)
			}
		}

		if (unregisteredEndpoints.length > 0) {
			console.log('\n⚠️ Neregistrované endpointy (existují soubory, ale nejsou v registry):')
			unregisteredEndpoints.forEach((e) => console.log(`   - ${e}`))
		}

		expect(
			unregisteredEndpoints,
			`Neregistrované endpointy: ${unregisteredEndpoints.join(', ')}`,
		).toHaveLength(0)
	})

	it('should have valid HTTP methods for all endpoints', () => {
		const validMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
		const invalidEndpoints: string[] = []

		for (const endpoint of registeredEndpoints) {
			if (!validMethods.includes(endpoint.method)) {
				invalidEndpoints.push(`${endpoint.method} ${endpoint.path}`)
			}
		}

		expect(invalidEndpoints).toHaveLength(0)
	})

	it('should have unique endpoint paths for each method', () => {
		const seen = new Set<string>()
		const duplicates: string[] = []

		for (const endpoint of registeredEndpoints) {
			const key = `${endpoint.method} ${endpoint.path}`
			if (seen.has(key)) {
				duplicates.push(key)
			}
			seen.add(key)
		}

		expect(duplicates, `Duplicitní endpointy: ${duplicates.join(', ')}`).toHaveLength(0)
	})

	it('should have paths starting with /api/', () => {
		const invalidPaths = registeredEndpoints
			.filter((e) => !e.path.startsWith('/api/'))
			.map((e) => e.path)

		expect(invalidPaths, `Cesty nezačínající /api/: ${invalidPaths.join(', ')}`).toHaveLength(0)
	})
})
