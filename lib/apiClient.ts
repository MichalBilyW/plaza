/**
 * Centrální API Client
 *
 * Všechny API volání z FE jdou přes tento client.
 * NIKDY nepoužívejte přímé $fetch('/api/...') v komponentách!
 *
 * Použití:
 * - V composables: const { data } = await useAsyncData(() => apiClient.shops.list())
 * - V akcích: await apiClient.shops.create(shopData)
 */

import { endpoints, type EndpointDefinition, type HttpMethod } from '@/shared/api/endpoints'
import type {
	Shop,
	Event,
	Service,
	Floor,
	User,
	Page,
	Banner,
	PaginatedResponse,
	LoginResponse,
	AuthUser,
} from '@/shared/types'
import type {
	ShopCreateInput,
	ShopUpdateInput,
	ShopFilterQueryInput,
	EventCreateInput,
	EventUpdateInput,
	EventFilterQueryInput,
	ServiceCreateInput,
	ServiceUpdateInput,
	FloorCreateInput,
	FloorUpdateInput,
	UserCreateInput,
	UserUpdateInput,
	PageCreateInput,
	PageUpdateInput,
	BannerCreateInput,
	BannerUpdateInput,
	LoginInput,
} from '@/shared/schemas'

// ==========================================
// TYPES
// ==========================================

interface ApiClientOptions {
	/** Přidat auth header automaticky */
	withAuth?: boolean
}

interface FetchOptions<T = unknown> {
	method?: HttpMethod
	body?: T
	query?: Record<string, unknown>
	headers?: Record<string, string>
}

// ==========================================
// HELPERS
// ==========================================

/**
 * Nahrazení :param v cestě skutečnými hodnotami
 */
function replacePath(path: string, params: Record<string, string | number> = {}): string {
	let result = path
	for (const [key, value] of Object.entries(params)) {
		result = result.replace(`:${key}`, String(value))
	}
	return result
}

/**
 * Získání auth tokenu z cookie
 */
function getAuthToken(): string | null {
	if (import.meta.server) {
		// Server-side: token z requestu
		const event = useRequestEvent()
		const cookie = event?.node.req.headers.cookie || ''
		const match = cookie.match(/auth_token=([^;]+)/)
		return match ? match[1] : null
	} else {
		// Client-side: token z cookie
		const cookie = useCookie('auth_token')
		return cookie.value || null
	}
}

/**
 * Základní fetch wrapper s error handlingem
 */
async function apiFetch<TResponse, TBody = unknown>(
	endpoint: EndpointDefinition,
	params: Record<string, string | number> = {},
	options: FetchOptions<TBody> = {},
	clientOptions: ApiClientOptions = {},
): Promise<TResponse> {
	const path = replacePath(endpoint.path, params)

	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...options.headers,
	}

	// Přidat auth header pokud je vyžadováno nebo endpoint vyžaduje auth
	if (clientOptions.withAuth || endpoint.auth) {
		const token = getAuthToken()
		if (token) {
			headers['Authorization'] = `Bearer ${token}`
		}
	}

	try {
		const response = await $fetch<TResponse>(path, {
			method: endpoint.method as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
			body: options.body as Record<string, unknown> | undefined,
			query: options.query,
			headers,
		})

		return response
	} catch (error: unknown) {
		// Re-throw s lepším error message
		if (error && typeof error === 'object' && 'data' in error) {
			const fetchError = error as { data?: { message?: string; code?: string } }
			throw createError({
				statusCode: (error as { statusCode?: number }).statusCode || 500,
				message: fetchError.data?.message || 'Nastala chyba při komunikaci s API',
				data: fetchError.data,
			})
		}
		throw error
	}
}

// ==========================================
// API CLIENT IMPLEMENTACE
// ==========================================

export const apiClient = {
	// ------------------------------------------
	// AUTH
	// ------------------------------------------
	auth: {
		async login(data: LoginInput): Promise<LoginResponse> {
			return apiFetch<LoginResponse, LoginInput>(endpoints.auth.login, {}, { body: data })
		},

		async logout(): Promise<void> {
			await apiFetch(endpoints.auth.logout, {}, {}, { withAuth: true })
		},

		async me(): Promise<AuthUser> {
			return apiFetch<AuthUser>(endpoints.auth.me, {}, {}, { withAuth: true })
		},
	},

	// ------------------------------------------
	// SHOPS
	// ------------------------------------------
	shops: {
		async list(query?: ShopFilterQueryInput): Promise<PaginatedResponse<Shop>> {
			return apiFetch<PaginatedResponse<Shop>>(
				endpoints.shops.list,
				{},
				{ query: query as Record<string, unknown> },
			)
		},

		async detail(id: string): Promise<Shop> {
			return apiFetch<Shop>(endpoints.shops.detail, { id })
		},

		async create(data: ShopCreateInput): Promise<Shop> {
			return apiFetch<Shop, ShopCreateInput>(
				endpoints.shops.create,
				{},
				{ body: data },
				{ withAuth: true },
			)
		},

		async update(id: string, data: ShopUpdateInput): Promise<Shop> {
			return apiFetch<Shop, ShopUpdateInput>(
				endpoints.shops.update,
				{ id },
				{ body: data },
				{ withAuth: true },
			)
		},

		async delete(id: string): Promise<void> {
			await apiFetch(endpoints.shops.delete, { id }, {}, { withAuth: true })
		},
	},

	// ------------------------------------------
	// EVENTS
	// ------------------------------------------
	events: {
		async list(query?: EventFilterQueryInput): Promise<PaginatedResponse<Event>> {
			return apiFetch<PaginatedResponse<Event>>(
				endpoints.events.list,
				{},
				{ query: query as Record<string, unknown> },
			)
		},

		async detail(id: string): Promise<Event> {
			return apiFetch<Event>(endpoints.events.detail, { id })
		},

		async create(data: EventCreateInput): Promise<Event> {
			return apiFetch<Event, EventCreateInput>(
				endpoints.events.create,
				{},
				{ body: data },
				{ withAuth: true },
			)
		},

		async update(id: string, data: EventUpdateInput): Promise<Event> {
			return apiFetch<Event, EventUpdateInput>(
				endpoints.events.update,
				{ id },
				{ body: data },
				{ withAuth: true },
			)
		},

		async delete(id: string): Promise<void> {
			await apiFetch(endpoints.events.delete, { id }, {}, { withAuth: true })
		},

		async publish(id: string): Promise<Event> {
			return apiFetch<Event>(endpoints.events.publish, { id }, {}, { withAuth: true })
		},

		async unpublish(id: string): Promise<Event> {
			return apiFetch<Event>(endpoints.events.unpublish, { id }, {}, { withAuth: true })
		},
	},

	// ------------------------------------------
	// SERVICES
	// ------------------------------------------
	services: {
		async list(): Promise<Service[]> {
			const response = await apiFetch<{ data: Service[] }>(endpoints.services.list)
			return response.data
		},

		async detail(id: string): Promise<Service> {
			return apiFetch<Service>(endpoints.services.detail, { id })
		},

		async create(data: ServiceCreateInput): Promise<Service> {
			return apiFetch<Service, ServiceCreateInput>(
				endpoints.services.create,
				{},
				{ body: data },
				{ withAuth: true },
			)
		},

		async update(id: string, data: ServiceUpdateInput): Promise<Service> {
			return apiFetch<Service, ServiceUpdateInput>(
				endpoints.services.update,
				{ id },
				{ body: data },
				{ withAuth: true },
			)
		},

		async delete(id: string): Promise<void> {
			await apiFetch(endpoints.services.delete, { id }, {}, { withAuth: true })
		},
	},

	// ------------------------------------------
	// FLOORS
	// ------------------------------------------
	floors: {
		async list(): Promise<Floor[]> {
			const response = await apiFetch<{ data: Floor[] }>(endpoints.floors.list)
			return response.data
		},

		async detail(id: string): Promise<Floor> {
			return apiFetch<Floor>(endpoints.floors.detail, { id })
		},

		async create(data: FloorCreateInput): Promise<Floor> {
			return apiFetch<Floor, FloorCreateInput>(
				endpoints.floors.create,
				{},
				{ body: data },
				{ withAuth: true },
			)
		},

		async update(id: string, data: FloorUpdateInput): Promise<Floor> {
			return apiFetch<Floor, FloorUpdateInput>(
				endpoints.floors.update,
				{ id },
				{ body: data },
				{ withAuth: true },
			)
		},

		async delete(id: string): Promise<void> {
			await apiFetch(endpoints.floors.delete, { id }, {}, { withAuth: true })
		},
	},

	// ------------------------------------------
	// USERS (CMS only)
	// ------------------------------------------
	users: {
		async list(): Promise<User[]> {
			const response = await apiFetch<{ data: User[] }>(
				endpoints.users.list,
				{},
				{},
				{ withAuth: true },
			)
			return response.data
		},

		async detail(id: string): Promise<User> {
			return apiFetch<User>(endpoints.users.detail, { id }, {}, { withAuth: true })
		},

		async create(data: UserCreateInput): Promise<User> {
			return apiFetch<User, UserCreateInput>(
				endpoints.users.create,
				{},
				{ body: data },
				{ withAuth: true },
			)
		},

		async update(id: string, data: UserUpdateInput): Promise<User> {
			return apiFetch<User, UserUpdateInput>(
				endpoints.users.update,
				{ id },
				{ body: data },
				{ withAuth: true },
			)
		},

		async delete(id: string): Promise<void> {
			await apiFetch(endpoints.users.delete, { id }, {}, { withAuth: true })
		},
	},

	// ------------------------------------------
	// PAGES
	// ------------------------------------------
	pages: {
		async list(): Promise<Page[]> {
			const response = await apiFetch<{ data: Page[] }>(endpoints.pages.list)
			return response.data
		},

		async detail(slug: string): Promise<Page> {
			return apiFetch<Page>(endpoints.pages.detail, { slug })
		},

		async create(data: PageCreateInput): Promise<Page> {
			return apiFetch<Page, PageCreateInput>(
				endpoints.pages.create,
				{},
				{ body: data },
				{ withAuth: true },
			)
		},

		async update(id: string, data: PageUpdateInput): Promise<Page> {
			return apiFetch<Page, PageUpdateInput>(
				endpoints.pages.update,
				{ id },
				{ body: data },
				{ withAuth: true },
			)
		},

		async delete(id: string): Promise<void> {
			await apiFetch(endpoints.pages.delete, { id }, {}, { withAuth: true })
		},
	},

	// ------------------------------------------
	// BANNERS
	// ------------------------------------------
	banners: {
		async list(): Promise<Banner[]> {
			const response = await apiFetch<{ data: Banner[] }>(endpoints.banners.list)
			return response.data
		},

		async active(): Promise<Banner[]> {
			const response = await apiFetch<{ data: Banner[] }>(endpoints.banners.active)
			return response.data
		},

		async create(data: BannerCreateInput): Promise<Banner> {
			return apiFetch<Banner, BannerCreateInput>(
				endpoints.banners.create,
				{},
				{ body: data },
				{ withAuth: true },
			)
		},

		async update(id: string, data: BannerUpdateInput): Promise<Banner> {
			return apiFetch<Banner, BannerUpdateInput>(
				endpoints.banners.update,
				{ id },
				{ body: data },
				{ withAuth: true },
			)
		},

		async delete(id: string): Promise<void> {
			await apiFetch(endpoints.banners.delete, { id }, {}, { withAuth: true })
		},
	},
}

// Export type pro použití v composables
export type ApiClient = typeof apiClient
