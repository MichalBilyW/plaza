/**
 * API Endpoints Registry - Single Source of Truth
 *
 * Tento soubor je JEDINÉ místo, kde jsou definovány všechny API endpointy.
 * Frontend NIKDY nepíše URL stringy ručně - vše jde přes apiClient.
 *
 * Konvence:
 * - list: GET bez ID (seznam)
 * - detail: GET s :id (detail záznamu)
 * - create: POST bez ID (vytvoření)
 * - update: PUT s :id (úprava)
 * - delete: DELETE s :id (smazání)
 * - publish: POST s :id a /publish (publikování draftu)
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export interface EndpointDefinition {
	method: HttpMethod
	path: string
	description?: string
	auth?: boolean // Vyžaduje autentizaci?
	roles?: ('admin' | 'editor')[] // Omezení na role
}

// ==========================================
// AUTH ENDPOINTS
// ==========================================
export const authEndpoints = {
	login: {
		method: 'POST',
		path: '/api/auth/login',
		description: 'Přihlášení do CMS',
		auth: false,
	},
	logout: {
		method: 'POST',
		path: '/api/auth/logout',
		description: 'Odhlášení z CMS',
		auth: true,
	},
	me: {
		method: 'GET',
		path: '/api/auth/me',
		description: 'Získání profilu přihlášeného uživatele',
		auth: true,
	},
	changePassword: {
		method: 'POST',
		path: '/api/auth/change-password',
		description: 'Změna hesla',
		auth: true,
	},
	refresh: {
		method: 'POST',
		path: '/api/auth/refresh',
		description: 'Obnovení session tokenu',
		auth: true,
	},
	sessionsList: {
		method: 'GET',
		path: '/api/auth/sessions',
		description: 'Seznam aktivních sessions',
		auth: true,
	},
	sessionsDelete: {
		method: 'DELETE',
		path: '/api/auth/sessions',
		description: 'Ukončení všech sessions',
		auth: true,
	},
	sessionDelete: {
		method: 'DELETE',
		path: '/api/auth/sessions/:id',
		description: 'Ukončení konkrétní session',
		auth: true,
	},
} as const satisfies Record<string, EndpointDefinition>

// ==========================================
// SHOPS (OBCHODY) ENDPOINTS
// ==========================================
export const shopsEndpoints = {
	list: {
		method: 'GET',
		path: '/api/shops',
		description: 'Seznam obchodů s filtrováním a stránkováním',
		auth: false,
	},
	detail: {
		method: 'GET',
		path: '/api/shops/:id',
		description: 'Detail obchodu',
		auth: false,
	},
	create: {
		method: 'POST',
		path: '/api/shops',
		description: 'Vytvoření nového obchodu',
		auth: true,
		roles: ['admin', 'editor'],
	},
	update: {
		method: 'PUT',
		path: '/api/shops/:id',
		description: 'Úprava obchodu',
		auth: true,
		roles: ['admin', 'editor'],
	},
	delete: {
		method: 'DELETE',
		path: '/api/shops/:id',
		description: 'Smazání obchodu',
		auth: true,
		roles: ['admin'],
	},
} as const satisfies Record<string, EndpointDefinition>

// ==========================================
// EVENTS (AKCE) ENDPOINTS
// ==========================================
export const eventsEndpoints = {
	list: {
		method: 'GET',
		path: '/api/events',
		description: 'Seznam akcí s filtrováním',
		auth: false,
	},
	detail: {
		method: 'GET',
		path: '/api/events/:id',
		description: 'Detail akce',
		auth: false,
	},
	create: {
		method: 'POST',
		path: '/api/events',
		description: 'Vytvoření akce',
		auth: true,
		roles: ['admin', 'editor'],
	},
	update: {
		method: 'PUT',
		path: '/api/events/:id',
		description: 'Úprava akce',
		auth: true,
		roles: ['admin', 'editor'],
	},
	delete: {
		method: 'DELETE',
		path: '/api/events/:id',
		description: 'Smazání akce',
		auth: true,
		roles: ['admin'],
	},
	reorder: {
		method: 'PUT',
		path: '/api/events/reorder',
		description: 'Změna pořadí akcí',
		auth: true,
		roles: ['admin', 'editor'],
	},
	publish: {
		method: 'POST',
		path: '/api/events/:id/publish',
		description: 'Publikování akce',
		auth: true,
		roles: ['admin', 'editor'],
	},
	unpublish: {
		method: 'POST',
		path: '/api/events/:id/unpublish',
		description: 'Zrušení publikování akce',
		auth: true,
		roles: ['admin', 'editor'],
	},
} as const satisfies Record<string, EndpointDefinition>

// ==========================================
// NEWS (NOVINKY) ENDPOINTS
// ==========================================
export const newsEndpoints = {
	list: {
		method: 'GET',
		path: '/api/news',
		description: 'Seznam novinek s filtrováním',
		auth: false,
	},
	detail: {
		method: 'GET',
		path: '/api/news/:id',
		description: 'Detail novinky',
		auth: false,
	},
	create: {
		method: 'POST',
		path: '/api/news',
		description: 'Vytvoření novinky',
		auth: true,
		roles: ['admin', 'editor'],
	},
	update: {
		method: 'PUT',
		path: '/api/news/:id',
		description: 'Úprava novinky',
		auth: true,
		roles: ['admin', 'editor'],
	},
	delete: {
		method: 'DELETE',
		path: '/api/news/:id',
		description: 'Smazání novinky',
		auth: true,
		roles: ['admin'],
	},
	reorder: {
		method: 'PUT',
		path: '/api/news/reorder',
		description: 'Změna pořadí novinek',
		auth: true,
		roles: ['admin', 'editor'],
	},
} as const satisfies Record<string, EndpointDefinition>

// ==========================================
// SERVICES (SLUŽBY) ENDPOINTS
// ==========================================
export const servicesEndpoints = {
	list: {
		method: 'GET',
		path: '/api/services',
		description: 'Seznam služeb pro návštěvníky',
		auth: false,
	},
	detail: {
		method: 'GET',
		path: '/api/services/:id',
		description: 'Detail služby',
		auth: false,
	},
	create: {
		method: 'POST',
		path: '/api/services',
		description: 'Vytvoření služby',
		auth: true,
		roles: ['admin', 'editor'],
	},
	update: {
		method: 'PUT',
		path: '/api/services/:id',
		description: 'Úprava služby',
		auth: true,
		roles: ['admin', 'editor'],
	},
	delete: {
		method: 'DELETE',
		path: '/api/services/:id',
		description: 'Smazání služby',
		auth: true,
		roles: ['admin'],
	},
	reorder: {
		method: 'PUT',
		path: '/api/services/reorder',
		description: 'Změna pořadí služeb',
		auth: true,
		roles: ['admin', 'editor'],
	},
} as const satisfies Record<string, EndpointDefinition>

// ==========================================
// CATEGORIES (KATEGORIE OBCHODŮ) ENDPOINTS
// ==========================================
export const categoriesEndpoints = {
	list: {
		method: 'GET',
		path: '/api/categories',
		description: 'Seznam kategorií obchodů',
		auth: false,
	},
	detail: {
		method: 'GET',
		path: '/api/categories/:id',
		description: 'Detail kategorie',
		auth: false,
	},
	create: {
		method: 'POST',
		path: '/api/categories',
		description: 'Vytvoření kategorie',
		auth: true,
		roles: ['admin', 'editor'],
	},
	update: {
		method: 'PUT',
		path: '/api/categories/:id',
		description: 'Úprava kategorie',
		auth: true,
		roles: ['admin', 'editor'],
	},
	delete: {
		method: 'DELETE',
		path: '/api/categories/:id',
		description: 'Smazání kategorie',
		auth: true,
		roles: ['admin'],
	},
	reorder: {
		method: 'PUT',
		path: '/api/categories/reorder',
		description: 'Změna pořadí kategorií',
		auth: true,
		roles: ['admin', 'editor'],
	},
} as const satisfies Record<string, EndpointDefinition>

// ==========================================
// FLOORS (PATRA) ENDPOINTS
// ==========================================
export const floorsEndpoints = {
	list: {
		method: 'GET',
		path: '/api/floors',
		description: 'Seznam pater centra',
		auth: false,
	},
	detail: {
		method: 'GET',
		path: '/api/floors/:id',
		description: 'Detail patra s jednotkami',
		auth: false,
	},
	create: {
		method: 'POST',
		path: '/api/floors',
		description: 'Vytvoření patra',
		auth: true,
		roles: ['admin'],
	},
	update: {
		method: 'PUT',
		path: '/api/floors/:id',
		description: 'Úprava patra',
		auth: true,
		roles: ['admin'],
	},
	delete: {
		method: 'DELETE',
		path: '/api/floors/:id',
		description: 'Smazání patra',
		auth: true,
		roles: ['admin'],
	},
	reorder: {
		method: 'PUT',
		path: '/api/floors/reorder',
		description: 'Změna pořadí pater',
		auth: true,
		roles: ['admin'],
	},
} as const satisfies Record<string, EndpointDefinition>

// ==========================================
// USERS (UŽIVATELÉ CMS) ENDPOINTS
// ==========================================
export const usersEndpoints = {
	list: {
		method: 'GET',
		path: '/api/users',
		description: 'Seznam uživatelů CMS',
		auth: true,
		roles: ['admin'],
	},
	detail: {
		method: 'GET',
		path: '/api/users/:id',
		description: 'Detail uživatele',
		auth: true,
		roles: ['admin'],
	},
	create: {
		method: 'POST',
		path: '/api/users',
		description: 'Vytvoření uživatele',
		auth: true,
		roles: ['admin'],
	},
	update: {
		method: 'PUT',
		path: '/api/users/:id',
		description: 'Úprava uživatele',
		auth: true,
		roles: ['admin'],
	},
	delete: {
		method: 'DELETE',
		path: '/api/users/:id',
		description: 'Smazání uživatele',
		auth: true,
		roles: ['admin'],
	},
} as const satisfies Record<string, EndpointDefinition>

// ==========================================
// GENERAL INFO (OBECNÉ INFORMACE) ENDPOINTS
// ==========================================
export const generalInfoEndpoints = {
	get: {
		method: 'GET',
		path: '/api/general-info',
		description: 'Získání obecných informací (otevírací doby apod.)',
		auth: false,
	},
	update: {
		method: 'PUT',
		path: '/api/general-info',
		description: 'Úprava obecných informací',
		auth: true,
		roles: ['admin'],
	},
} as const satisfies Record<string, EndpointDefinition>

// ==========================================
// HOMEPAGE (HLAVNÍ STRÁNKA) ENDPOINTS
// ==========================================
export const homepageEndpoints = {
	get: {
		method: 'GET',
		path: '/api/homepage',
		description: 'Získání obsahu hlavní stránky',
		auth: false,
	},
	update: {
		method: 'PUT',
		path: '/api/homepage',
		description: 'Úprava obsahu hlavní stránky',
		auth: true,
		roles: ['admin', 'editor'],
	},
} as const satisfies Record<string, EndpointDefinition>

// ==========================================
// UPLOAD (NAHRÁVÁNÍ SOUBORŮ) ENDPOINTS
// ==========================================
export const uploadEndpoints = {
	upload: {
		method: 'POST',
		path: '/api/upload',
		description: 'Nahrání obrázku/souboru',
		auth: true,
		roles: ['admin', 'editor'],
	},
} as const satisfies Record<string, EndpointDefinition>

// ==========================================
// MAP (MAPA CENTRA) ENDPOINTS
// ==========================================
export const mapEndpoints = {
	units: {
		method: 'GET',
		path: '/api/map/units',
		description: 'Seznam jednotek mapy s obsazeností',
		auth: false,
	},
} as const satisfies Record<string, EndpointDefinition>

// ==========================================
// AGREGOVANÝ OBJEKT VŠECH ENDPOINTŮ
// ==========================================
export const endpoints = {
	auth: authEndpoints,
	shops: shopsEndpoints,
	categories: categoriesEndpoints,
	events: eventsEndpoints,
	news: newsEndpoints,
	services: servicesEndpoints,
	floors: floorsEndpoints,
	users: usersEndpoints,
	generalInfo: generalInfoEndpoints,
	homepage: homepageEndpoints,
	upload: uploadEndpoints,
	map: mapEndpoints,
	health: {
		check: {
			method: 'GET',
			path: '/api/health',
			description: 'Healthcheck endpoint',
			auth: false,
		},
	} as const satisfies Record<string, EndpointDefinition>,
} as const

// Helper pro získání všech endpointů jako flat list (pro testování)
export function getAllEndpoints(): Array<EndpointDefinition & { name: string }> {
	const result: Array<EndpointDefinition & { name: string }> = []

	for (const [moduleName, moduleEndpoints] of Object.entries(endpoints)) {
		for (const [endpointName, endpoint] of Object.entries(
			moduleEndpoints as Record<string, EndpointDefinition>,
		)) {
			result.push({
				...endpoint,
				name: `${moduleName}.${endpointName}`,
			})
		}
	}

	return result
}

// Typy pro type-safe použití
export type EndpointsType = typeof endpoints
export type ModuleName = keyof EndpointsType
