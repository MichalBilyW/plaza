import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const NOINDEX_ROBOTS = 'noindex, nofollow, noarchive, nosnippet, noimageindex'

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
			siteName: 'Obchodní centrum Plaza Liberec',
			siteDescription:
				'Prohlédněte si obchody a služby v OC Plaza Liberec, interaktivní mapu centra, možnosti parkování, aktuální akce a novinky i další informace o centru.',
			defaultLocale: process.env.NUXT_PUBLIC_DEFAULT_LOCALE || 'cs',
			gtmId: process.env.NUXT_PUBLIC_GTM_ID || 'GTM-WB3N3SCX',
		},
	},

	// Modules
	modules: [
		'@nuxtjs/tailwindcss',
		'@formkit/nuxt',
		'@nuxtjs/i18n',
		'@nuxt/eslint',
		'@nuxt/fonts',
		'@nuxtjs/sitemap',
	],

	// Sitemap configuration
	site: {
		url: process.env.NUXT_PUBLIC_SITE_URL || 'https://ocplazaliberec.cz',
		name: 'OC Plaza Liberec',
	},

	sitemap: {
		// Dynamické URL z API
		sources: ['/api/__sitemap__/urls'],
		// Vyloučit CMS stránky
		exclude: ['/cms', '/cms/**', '/api/**', '/cookies'],
		// Statické stránky s prioritou
		defaults: {
			changefreq: 'weekly',
			priority: 0.5,
		},
		urls: [
			{ loc: '/', priority: 1.0, changefreq: 'daily' },
			{ loc: '/obchody', priority: 0.9, changefreq: 'daily' },
			{ loc: '/akce', priority: 0.8, changefreq: 'daily' },
			{ loc: '/o-nas', priority: 0.7, changefreq: 'monthly' },
			{ loc: '/mapa', priority: 0.7, changefreq: 'monthly' },
		],
		// Automatická cache - 1 den (sitemap se obnoví při každém požadavku po vypršení)
		cacheMaxAgeSeconds: 86400,
	},

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
			'#shared': resolve(__dirname, 'shared'),
		},
	},

	// Vite configuration - aliasy pro klientskou stranu
	vite: {
		resolve: {
			alias: {
				'@/shared': resolve(__dirname, 'shared'),
				'#shared': resolve(__dirname, 'shared'),
			},
		},
		optimizeDeps: {
			include: ['swiper/vue', 'swiper/modules', '@panzoom/panzoom'],
		},
	},

	// Build configuration
	build: {
		transpile: ['@panzoom/panzoom'],
	},

	// Aliasy pro TypeScript a Vue komponenty
	alias: {
		'@/shared': resolve(__dirname, 'shared'),
		'#shared': resolve(__dirname, 'shared'),
	},

	// App configuration
	app: {
		head: {
			htmlAttrs: {
				lang: 'cs',
			},
			title: 'Obchodní centrum Plaza Liberec',
			meta: [
				{ charset: 'utf-8' },
				{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
				{
					name: 'description',
					content:
						'Prohlédněte si obchody a služby v OC Plaza Liberec, interaktivní mapu centra, možnosti parkování, aktuální akce a novinky i další informace o centru.',
				},
				{ name: 'format-detection', content: 'telephone=no' },
				{ name: 'theme-color', content: '#ffffff' },
				{ name: 'msapplication-TileColor', content: '#ffffff' },
				{ name: 'msapplication-TileImage', content: '/favicon/ms-icon-144x144.png' },
				{ name: 'author', content: 'MichalBily.cz' },
				{
					name: 'google-site-verification',
					content: '97Bewc0cGPXZE89j7Eg1kqjy3acJ8y8xK2N0aLyfvyU',
				},
				{ property: 'og:type', content: 'website' },
				{ property: 'og:site_name', content: 'Obchodní centrum Plaza Liberec' },
				{ property: 'og:locale', content: 'cs_CZ' },
				{ property: 'og:image', content: '/images/og.jpg' },
				{ property: 'og:image:type', content: 'image/jpeg' },
				{ property: 'og:image:width', content: '1200' },
				{ property: 'og:image:height', content: '630' },
				{ property: 'og:image:alt', content: 'Obchodní centrum Plaza Liberec' },
				{ name: 'twitter:card', content: 'summary_large_image' },
				{ name: 'twitter:image', content: '/images/og.jpg' },
			],
			link: [
				{ rel: 'apple-touch-icon', sizes: '57x57', href: '/favicon/apple-icon-57x57.png' },
				{ rel: 'apple-touch-icon', sizes: '60x60', href: '/favicon/apple-icon-60x60.png' },
				{ rel: 'apple-touch-icon', sizes: '72x72', href: '/favicon/apple-icon-72x72.png' },
				{ rel: 'apple-touch-icon', sizes: '76x76', href: '/favicon/apple-icon-76x76.png' },
				{
					rel: 'apple-touch-icon',
					sizes: '114x114',
					href: '/favicon/apple-icon-114x114.png',
				},
				{
					rel: 'apple-touch-icon',
					sizes: '120x120',
					href: '/favicon/apple-icon-120x120.png',
				},
				{
					rel: 'apple-touch-icon',
					sizes: '144x144',
					href: '/favicon/apple-icon-144x144.png',
				},
				{
					rel: 'apple-touch-icon',
					sizes: '152x152',
					href: '/favicon/apple-icon-152x152.png',
				},
				{
					rel: 'apple-touch-icon',
					sizes: '180x180',
					href: '/favicon/apple-icon-180x180.png',
				},
				{
					rel: 'icon',
					type: 'image/png',
					sizes: '192x192',
					href: '/favicon/android-icon-192x192.png',
				},
				{
					rel: 'icon',
					type: 'image/png',
					sizes: '32x32',
					href: '/favicon/favicon-32x32.png',
				},
				{
					rel: 'icon',
					type: 'image/png',
					sizes: '96x96',
					href: '/favicon/favicon-96x96.png',
				},
				{
					rel: 'icon',
					type: 'image/png',
					sizes: '16x16',
					href: '/favicon/favicon-16x16.png',
				},
				{ rel: 'icon', type: 'image/x-icon', href: '/favicon/favicon.ico' },
				{ rel: 'manifest', href: '/favicon/manifest.json' },
			],
			noscript: [
				{
					innerHTML: `<iframe src="https://www.googletagmanager.com/ns.html?id=${process.env.NUXT_PUBLIC_GTM_ID || 'GTM-WB3N3SCX'}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
					tagPosition: 'bodyOpen',
				},
			],
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

		// Legacy URL redirects (starý web ocplazaliberec.cz → nový web)
		// 301 redirecty pro zachování SEO hodnoty zaindexovaných URL
		'/obchody-s2': { redirect: { to: '/obchody', statusCode: 301 } },
		'/parking-s5': { redirect: { to: '/o-nas#parkovani', statusCode: 301 } },
		'/map': { redirect: { to: '/mapa', statusCode: 301 } },
		'/restaurace-a-kavarny-c6': {
			redirect: { to: '/obchody?kategorie=restaurace-a-kavarny', statusCode: 301 },
		},
		'/zabava-a-sluzby-c3': { redirect: { to: '/obchody', statusCode: 301 } },
		'/oteviraci-doba-pasaze-oc-plaza-liberec-n158': {
			redirect: { to: '/o-nas#oteviraci-doba', statusCode: 301 },
		},
		'/oninky-s1': { redirect: { to: '/akce', statusCode: 301 } },
		'/prehled-otevrenych-obchodu-n645': { redirect: { to: '/obchody', statusCode: 301 } },
		'/petcenter-n25': { redirect: { to: '/obchody', statusCode: 301 } },
		'/kontakt-s4': { redirect: { to: '/o-nas#kontakt', statusCode: 301 } },

		// CMS routes - private, never index
		'/cms': {
			ssr: true,
			headers: {
				'X-Robots-Tag': NOINDEX_ROBOTS,
			},
		},
		'/cms/**': {
			ssr: true,
			headers: {
				'X-Robots-Tag': NOINDEX_ROBOTS,
			},
		},

		// API routes
		'/api/**': { cors: true },
	},
})
