#!/usr/bin/env node
/**
 * Post-Deploy Health Check
 *
 * Spustí se po deployi a ověří, že produkce funguje.
 * Použití: npm run health-check -- --url https://ocplazaliberec.cz
 */

const ENDPOINTS = [
	{ path: '/api/health', expected: { status: 'ok' } },
	{ path: '/api/shops', checkArray: 'data' },
	{ path: '/api/categories', checkArray: 'data' },
	{ path: '/api/floors', checkArray: 'data' },
	{ path: '/api/events', checkArray: 'data' },
	{ path: '/api/services', checkArray: 'data' },
]

const PAGES = ['/', '/obchody', '/mapa', '/o-nas']

async function checkEndpoint(baseUrl, endpoint) {
	const url = `${baseUrl}${endpoint.path}`
	try {
		const response = await fetch(url, { timeout: 10000 })

		if (!response.ok) {
			return { success: false, error: `HTTP ${response.status}` }
		}

		const data = await response.json()

		// Kontrola očekávaných hodnot
		if (endpoint.expected) {
			for (const [key, value] of Object.entries(endpoint.expected)) {
				if (data[key] !== value) {
					return { success: false, error: `Expected ${key}=${value}, got ${data[key]}` }
				}
			}
		}

		// Kontrola, že pole existuje
		if (endpoint.checkArray && !Array.isArray(data[endpoint.checkArray])) {
			return { success: false, error: `Expected array at ${endpoint.checkArray}` }
		}

		return { success: true }
	} catch (error) {
		return { success: false, error: error.message }
	}
}

async function checkPage(baseUrl, path) {
	const url = `${baseUrl}${path}`
	try {
		const response = await fetch(url, { timeout: 10000 })

		if (!response.ok) {
			return { success: false, error: `HTTP ${response.status}` }
		}

		const html = await response.text()

		// Základní kontrola, že stránka obsahuje HTML
		if (!html.includes('<!DOCTYPE html>') && !html.includes('<html')) {
			return { success: false, error: 'Invalid HTML response' }
		}

		return { success: true }
	} catch (error) {
		return { success: false, error: error.message }
	}
}

async function main() {
	// Parse URL z argumentů
	const args = process.argv.slice(2)
	const urlIndex = args.indexOf('--url')
	const baseUrl =
		urlIndex !== -1 && args[urlIndex + 1]
			? args[urlIndex + 1]
			: process.env.SITE_URL || 'http://localhost:3000'

	console.log(`\n🔍 Health Check: ${baseUrl}\n`)

	let allPassed = true

	// Check API endpoints
	console.log('📡 API Endpoints:')
	for (const endpoint of ENDPOINTS) {
		const result = await checkEndpoint(baseUrl, endpoint)
		const icon = result.success ? '✅' : '❌'
		console.log(`  ${icon} ${endpoint.path}${result.error ? ` - ${result.error}` : ''}`)
		if (!result.success) allPassed = false
	}

	// Check pages
	console.log('\n📄 Pages:')
	for (const path of PAGES) {
		const result = await checkPage(baseUrl, path)
		const icon = result.success ? '✅' : '❌'
		console.log(`  ${icon} ${path}${result.error ? ` - ${result.error}` : ''}`)
		if (!result.success) allPassed = false
	}

	console.log('')

	if (allPassed) {
		console.log('✅ All health checks passed!\n')
		process.exit(0)
	} else {
		console.log('❌ Some health checks failed!\n')
		process.exit(1)
	}
}

main()
