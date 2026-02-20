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
// EVENTS/NEWS (AKCE/NOVINKY) ENDPOINTS
// ==========================================
export const eventsEndpoints = {
  list: {
    method: 'GET',
    path: '/api/events',
    description: 'Seznam akcí/novinek s filtrováním',
    auth: false,
  },
  detail: {
    method: 'GET',
    path: '/api/events/:id',
    description: 'Detail akce/novinky',
    auth: false,
  },
  create: {
    method: 'POST',
    path: '/api/events',
    description: 'Vytvoření akce/novinky (jako draft)',
    auth: true,
    roles: ['admin', 'editor'],
  },
  update: {
    method: 'PUT',
    path: '/api/events/:id',
    description: 'Úprava akce/novinky',
    auth: true,
    roles: ['admin', 'editor'],
  },
  delete: {
    method: 'DELETE',
    path: '/api/events/:id',
    description: 'Smazání akce/novinky',
    auth: true,
    roles: ['admin'],
  },
  publish: {
    method: 'POST',
    path: '/api/events/:id/publish',
    description: 'Publikování akce/novinky',
    auth: true,
    roles: ['admin', 'editor'],
  },
  unpublish: {
    method: 'POST',
    path: '/api/events/:id/unpublish',
    description: 'Odpublikování akce/novinky',
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
} as const satisfies Record<string, EndpointDefinition>

// ==========================================
// UNITS (JEDNOTKY/MAP SLOTS) ENDPOINTS
// ==========================================
export const unitsEndpoints = {
  list: {
    method: 'GET',
    path: '/api/units',
    description: 'Seznam jednotek s filtrováním podle patra',
    auth: false,
  },
  detail: {
    method: 'GET',
    path: '/api/units/:id',
    description: 'Detail jednotky',
    auth: false,
  },
  create: {
    method: 'POST',
    path: '/api/units',
    description: 'Vytvoření jednotky',
    auth: true,
    roles: ['admin'],
  },
  update: {
    method: 'PUT',
    path: '/api/units/:id',
    description: 'Úprava jednotky (vč. přiřazení obchodu)',
    auth: true,
    roles: ['admin', 'editor'],
  },
  delete: {
    method: 'DELETE',
    path: '/api/units/:id',
    description: 'Smazání jednotky',
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
// EXPORTS (EXPORTY DAT) ENDPOINTS
// ==========================================
export const exportsEndpoints = {
  shopsList: {
    method: 'GET',
    path: '/api/exports/shops',
    description: 'Export seznamu obchodů (PDF/JSON)',
    auth: true,
    roles: ['admin', 'editor'],
  },
  floorMap: {
    method: 'GET',
    path: '/api/exports/floor/:id',
    description: 'Export mapy patra',
    auth: true,
    roles: ['admin', 'editor'],
  },
} as const satisfies Record<string, EndpointDefinition>

// ==========================================
// PAGES (OBSAHOVÉ STRÁNKY) ENDPOINTS
// ==========================================
export const pagesEndpoints = {
  list: {
    method: 'GET',
    path: '/api/pages',
    description: 'Seznam obsahových stránek',
    auth: false,
  },
  detail: {
    method: 'GET',
    path: '/api/pages/:slug',
    description: 'Detail stránky podle slugu',
    auth: false,
  },
  create: {
    method: 'POST',
    path: '/api/pages',
    description: 'Vytvoření stránky',
    auth: true,
    roles: ['admin'],
  },
  update: {
    method: 'PUT',
    path: '/api/pages/:id',
    description: 'Úprava stránky',
    auth: true,
    roles: ['admin', 'editor'],
  },
  delete: {
    method: 'DELETE',
    path: '/api/pages/:id',
    description: 'Smazání stránky',
    auth: true,
    roles: ['admin'],
  },
} as const satisfies Record<string, EndpointDefinition>

// ==========================================
// BANNERS (REKLAMNÍ BANNERY) ENDPOINTS
// ==========================================
export const bannersEndpoints = {
  list: {
    method: 'GET',
    path: '/api/banners',
    description: 'Seznam bannerů',
    auth: false,
  },
  active: {
    method: 'GET',
    path: '/api/banners/active',
    description: 'Aktivní bannery pro zobrazení',
    auth: false,
  },
  create: {
    method: 'POST',
    path: '/api/banners',
    description: 'Vytvoření banneru',
    auth: true,
    roles: ['admin', 'editor'],
  },
  update: {
    method: 'PUT',
    path: '/api/banners/:id',
    description: 'Úprava banneru',
    auth: true,
    roles: ['admin', 'editor'],
  },
  delete: {
    method: 'DELETE',
    path: '/api/banners/:id',
    description: 'Smazání banneru',
    auth: true,
    roles: ['admin'],
  },
} as const satisfies Record<string, EndpointDefinition>

// ==========================================
// AGREGOVANÝ OBJEKT VŠECH ENDPOINTŮ
// ==========================================
export const endpoints = {
  auth: authEndpoints,
  shops: shopsEndpoints,
  events: eventsEndpoints,
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
      moduleEndpoints as Record<string, EndpointDefinition>
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

