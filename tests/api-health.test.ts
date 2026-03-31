/**
 * API Health & Smoke Tests
 *
 * Tyto testy ověřují základní funkčnost API endpointů.
 * Běží bez databáze - testují pouze strukturu odpovědí.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { setup, $fetch, createPage } from '@nuxt/test-utils/e2e'

describe('API Health Tests', async () => {
	await setup({
		server: true,
		browser: false,
	})

	describe('Health Endpoint', () => {
		it('GET /api/health returns 200', async () => {
			const response = await $fetch('/api/health')
			expect(response).toHaveProperty('status')
			expect(response.status).toBe('ok')
		})
	})

	describe('Public Endpoints Structure', () => {
		it('GET /api/shops returns valid structure', async () => {
			const response = await $fetch('/api/shops')
			expect(response).toHaveProperty('data')
			expect(response).toHaveProperty('pagination')
			expect(Array.isArray(response.data)).toBe(true)
		})

		it('GET /api/events returns valid structure', async () => {
			const response = await $fetch('/api/events')
			expect(response).toHaveProperty('data')
			expect(Array.isArray(response.data)).toBe(true)
		})

		it('GET /api/categories returns valid structure', async () => {
			const response = await $fetch('/api/categories')
			expect(response).toHaveProperty('data')
			expect(Array.isArray(response.data)).toBe(true)
		})

		it('GET /api/floors returns valid structure', async () => {
			const response = await $fetch('/api/floors')
			expect(response).toHaveProperty('data')
			expect(Array.isArray(response.data)).toBe(true)
		})

		it('GET /api/services returns valid structure', async () => {
			const response = await $fetch('/api/services')
			expect(response).toHaveProperty('data')
			expect(Array.isArray(response.data)).toBe(true)
		})
	})

	describe('Protected Endpoints (should require auth)', () => {
		it('POST /api/shops returns 401 without auth', async () => {
			try {
				await $fetch('/api/shops', { method: 'POST', body: {} })
				expect.fail('Should have thrown 401')
			} catch (error: any) {
				expect(error.statusCode).toBe(401)
			}
		})

		it('GET /api/auth/me returns 401 without auth', async () => {
			try {
				await $fetch('/api/auth/me')
				expect.fail('Should have thrown 401')
			} catch (error: any) {
				expect(error.statusCode).toBe(401)
			}
		})
	})
})
