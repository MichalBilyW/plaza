/** @type {import('tailwindcss').Config} */
export default {
	future: {
		// Hover efekty pouze na zařízeních, která podporují hover (ne touch)
		hoverOnlyWhenSupported: true,
	},
	safelist: [
		// CMS section colors - ensure they're not purged
		{
			pattern: /bg-cms-(shops|events|news|services)-(50|100|200|300|400|500|600|700|800|900)/,
			variants: ['hover', 'focus'],
		},
		{
			pattern: /text-cms-(shops|events|news|services)-(50|100|200|300|400|500|600|700|800|900)/,
		},
		{
			pattern: /border-cms-(shops|events|news|services)-(50|100|200|300|400|500|600|700|800|900)/,
		},
		{
			pattern: /ring-cms-(shops|events|news|services)-(50|100|200|300|400|500|600|700|800|900)/,
			variants: ['focus'],
		},
	],
	content: [
		'./app/components/**/*.{js,vue,ts}',
		'./app/layouts/**/*.vue',
		'./app/pages/**/*.vue',
		'./app/plugins/**/*.{js,ts}',
		'./app/app.vue',
		'./app/error.vue',
	],
	theme: {
		screens: {
			xs: '475px',
			sm: '640px',
			md: '768px',
			lg: '1024px',
			xl: '1280px',
			'2xl': '1536px',
		},
		extend: {
			colors: {
				// Veřejná část webu - brand colors
				plaza: {
					DEFAULT: '#E20B1B', // primary red
					light: '#D9D9D9', // light gray
					'light-33': 'rgba(217, 217, 217, 0.33)', // 33% opacity
					dark: '#131313', // dark backgrounds
					gray: '#767676', // text gray
					success: '#35E217', // green
				},
				// CMS sekce - pevné barvy pro konzistentní UI
				'cms-shops': {
					50: '#eff6ff',
					100: '#dbeafe',
					200: '#bfdbfe',
					300: '#93c5fd',
					400: '#60a5fa',
					500: '#3b82f6',
					600: '#2563eb',
					700: '#1d4ed8',
					800: '#1e40af',
					900: '#1e3a8a',
				},
				'cms-events': {
					50: '#ecfdf5',
					100: '#d1fae5',
					200: '#a7f3d0',
					300: '#6ee7b7',
					400: '#34d399',
					500: '#10b981',
					600: '#059669',
					700: '#047857',
					800: '#065f46',
					900: '#064e3b',
				},
				'cms-services': {
					50: '#fff7ed',
					100: '#ffedd5',
					200: '#fed7aa',
					300: '#fdba74',
					400: '#fb923c',
					500: '#f97316',
					600: '#ea580c',
					700: '#c2410c',
					800: '#9a3412',
					900: '#7c2d12',
				},
				'cms-categories': {
					50: '#faf5ff',
					100: '#f3e8ff',
					200: '#e9d5ff',
					300: '#d8b4fe',
					400: '#c084fc',
					500: '#a855f7',
					600: '#9333ea',
					700: '#7e22ce',
					800: '#6b21a8',
					900: '#581c87',
				},
				'cms-news': {
					50: '#fdf2f8',
					100: '#fce7f3',
					200: '#fbcfe8',
					300: '#f9a8d4',
					400: '#f472b6',
					500: '#ec4899',
					600: '#db2777',
					700: '#be185d',
					800: '#9d174d',
					900: '#831843',
				},
			},
			fontFamily: {
				sans: ['Alata', 'system-ui', 'sans-serif'],
				heading: ['League Spartan', 'system-ui', 'sans-serif']
			},
		},
	},
	plugins: [],
}
