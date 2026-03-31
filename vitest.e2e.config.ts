import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

/**
 * Vitest config pro E2E testy
 * Spouští Nuxt server a testuje API endpointy
 */
export default defineConfig({
	test: {
		environment: 'node',
		include: ['tests/**/*.e2e.test.ts', 'tests/api-health.test.ts'],
		globals: true,
		testTimeout: 30000,
		hookTimeout: 30000,
	},
	resolve: {
		alias: {
			'@': resolve(__dirname, './'),
			'~': resolve(__dirname, './'),
		},
	},
})
