import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2026-03-26',
	devtools: { enabled: true },

	future: {
		compatibilityVersion: 4,
	},

	// Runtime config for environment variables
	runtimeConfig: {
		// Server-only (private) - z ENV
		mongoUri: process.env.NUXT_MONGO_URI || 'mongodb://localhost:27017/plaza',
		jwtSecret: process.env.NUXT_JWT_SECRET || 'dev-secret-change-in-production',
		jwtExpiresIn: process.env.NUXT_JWT_EXPIRES_IN || '7d',

		// Public (exposed to client) - z ENV
		public: {
			siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
			siteName: 'OC Plaza Liberec',
			siteDescription:
				'Obchodní centrum Plaza Liberec - nakupování, zábava a služby na jednom místě',
			defaultLocale: process.env.NUXT_PUBLIC_DEFAULT_LOCALE || 'cs',
		},
	},

	// Modules
	modules: [
		'@nuxtjs/tailwindcss',
		'@formkit/nuxt',
		'@nuxtjs/i18n',
		'@nuxt/eslint',
		'@nuxt/fonts',
	],

	// Global CSS
	css: ['~/assets/css/main.css'],

	// Fonts configuration
	fonts: {
		families: [
			{
				name: 'League Spartan',
				weights: [400, 700],
			},
			{ name: 'Alata', weights: [400] },
		],
		// Přepsat metriky fontu pro lepší vertikální zarovnání
		experimental: {
			processCSSVariables: true,
		},
	},

	// FormKit configuration
	formkit: {
		autoImport: true,
		configFile: './formkit.config.ts',
	},

	// i18n configuration
	i18n: {
		locales: [
			{ code: 'cs', name: 'Čeština', file: 'cs.ts' },
			//   { code: 'en', name: 'English', file: 'en.ts' },
		],
		defaultLocale: 'cs',
		lazy: true,
		langDir: 'locales',
		strategy: 'prefix_except_default',
		detectBrowserLanguage: {
			useCookie: true,
			cookieKey: 'plaza_locale',
			redirectOn: 'root',
		},
	},

	// Nitro server configuration
	nitro: {
		preset: 'node-server',
		compressPublicAssets: true,
		alias: {
			'@/server': resolve(__dirname, 'server'),
			'@/shared': resolve(__dirname, 'shared'),
		},
	},

	// Vite configuration - aliasy pro klientskou stranu
	vite: {
		resolve: {
			alias: {
				'@/shared': resolve(__dirname, 'shared'),
			},
		},
		optimizeDeps: {
			include: ['swiper/vue', 'swiper/modules'],
		},
	},

	// Aliasy pro TypeScript a Vue komponenty
	alias: {
		'@/shared': resolve(__dirname, 'shared'),
	},

	// App configuration
	app: {
		head: {
			htmlAttrs: {
				lang: 'cs',
			},
			title: 'OC Plaza Liberec',
			meta: [
				{ charset: 'utf-8' },
				{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
				{
					name: 'description',
					content:
						'Obchodní centrum Plaza Liberec - nakupování, zábava a služby na jednom místě',
				},
				{ name: 'format-detection', content: 'telephone=no' },
				{ property: 'og:site_name', content: 'OC Plaza Liberec' },
				{ property: 'og:locale', content: 'cs_CZ' },
			],
			link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
		},
	},

	// TypeScript
	typescript: {
		strict: true,
		typeCheck: false, // Disable for faster builds, use npm run typecheck
	},

	// Route rules
	routeRules: {
		// Public pages - SSR (no cache = changes from CMS visible immediately)
		'/': { ssr: true },
		'/obchody': { ssr: true },
		'/obchody/**': { ssr: true },
		'/akce': { ssr: true },
		'/akce/**': { ssr: true },
		'/o-nas': { ssr: true },
		'/mapa': { ssr: true },

		// CMS routes - no cache, auth required
		'/cms/**': { ssr: true },

		// API routes
		'/api/**': { cors: true },
	},
})
