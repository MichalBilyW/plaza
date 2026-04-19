/**
 * Sdílené typy pro celou aplikaci
 */

// ==========================================
// ZÁKLADNÍ TYPY
// ==========================================

/** Role uživatele v CMS */
export type UserRole = 'superadmin' | 'admin' | 'editor'

/** Stav publikace obsahu */
export type PublishStatus = 'draft' | 'published' | 'archived'

/** Den v týdnu */
export type DayOfWeek =
	| 'monday'
	| 'tuesday'
	| 'wednesday'
	| 'thursday'
	| 'friday'
	| 'saturday'
	| 'sunday'

// ==========================================
// OTEVÍRACÍ DOBY
// ==========================================
export interface OpeningHoursEntry {
	day: DayOfWeek
	open: string // HH:mm format
	close: string // HH:mm format
	closed?: boolean
}

export interface SpecialOpeningHours {
	/** Jednotlivý den - použij date NEBO období (dateFrom + dateTo) */
	date?: string // ISO date string
	/** Začátek období */
	dateFrom?: string // ISO date string
	/** Konec období */
	dateTo?: string // ISO date string
	/** Hodina otevření */
	open?: string
	/** Hodina zavření */
	close?: string
	/** Je zavřeno */
	closed?: boolean
	/** Popisek (např. "Sila vánoce", "Státní svátek") */
	note?: string
}

// ==========================================
// ENTITY - BASE
// ==========================================
export interface BaseEntity {
	_id: string
	createdAt: string
	updatedAt: string
}

// ==========================================
// CATEGORY (KATEGORIE OBCHODŮ)
// ==========================================
export interface Category extends BaseEntity {
	name: string
	slug: string
	isActive: boolean
	sortOrder: number
	shopCount?: number // Virtuální pole - počet obchodů v kategorii
}

// ==========================================
// SHOP (OBCHOD)
// ==========================================
export interface Shop extends BaseEntity {
	name: string
	slug: string
	description?: string
	shortDescription?: string
	logo?: string
	gallery?: string[]

	// Kontakty
	phone?: string
	email?: string
	website?: string

	// Sociální sítě
	socialLinks?: {
		facebook?: string
		instagram?: string
		twitter?: string
	}

	// Umístění
	/** @deprecated Použij floorIds */
	floorId?: string
	/** @deprecated Použij floors */
	floor?: Floor
	/** Patra, kde se obchod nachází (může být na více patrech) */
	floorIds?: string[]
	/** Populovaná patra */
	floors?: Floor[]
	categoryIds?: string[]
	categories?: Category[]
	/** @deprecated Použij unitCodes */
	unitCode?: string
	/** Kódy jednotek na mapě (obchod může zabírat více jednotek) */
	unitCodes?: string[]
	mapPosition?: {
		x: number
		y: number
		width: number
		height: number
	}
	mapPolygon?: string

	// Otevírací doby
	openingHours?: OpeningHoursEntry[]
	specialOpeningHours?: SpecialOpeningHours[]

	// Metadata
	isActive: boolean
	/** Datum plánovaného zveřejnění obchodu */
	publishDate?: string
	sortOrder: number
	seoTitle?: string
	seoDescription?: string
}

// ==========================================
// EVENT (AKCE)
// ==========================================
export interface Event extends BaseEntity {
	/** Interní název akce (jen pro CMS) */
	name: string
	/** Čtvercový obrázek akce */
	image: string
	/** Obsah akce (WYSIWYG) */
	content?: string
	/** Vazba na obchod */
	shopId: string
	shop?: Shop
	/** Pořadí pro řazení */
	sortOrder: number
	/** Je akce aktivní */
	isActive: boolean
}

// ==========================================
// NEWS (NOVINKY A AKCE CENTRA)
// ==========================================
export interface News extends BaseEntity {
	/** Interní název novinky (jen pro CMS) */
	name: string
	/** Čtvercový obrázek */
	image: string
	/** Obsah novinky (HTML) - zobrazuje se v modalu */
	content?: string
	/** Pořadí pro řazení */
	sortOrder: number
	/** Je novinka aktivní */
	isActive: boolean
}

// ==========================================
// SERVICE (SLUŽBA)
// ==========================================
export interface Service extends BaseEntity {
	/** Ikona služby (SVG nebo PNG) */
	icon: string
	/** Popisek služby (max 120 znaků) */
	shortDescription: string
	/** Popis služby (nepovinný) */
	description?: string
	/** Je služba aktivní */
	isActive: boolean
	/** Pořadí pro řazení */
	sortOrder: number
}

// ==========================================
// FLOOR (PATRO)
// ==========================================
export interface Floor extends BaseEntity {
	name: string // např. "1. patro", "Přízemí"
	level: number // číselné pořadí (-1 = podzemí, 0 = přízemí, 1 = 1. patro)
	mapImage?: string // obrázek mapy patra (náhled)
	svgMap?: string // SVG mapa patra pro interaktivní zobrazení
	isActive: boolean
	sortOrder: number
}

// ==========================================
// USER (UŽIVATEL CMS)
// ==========================================
export interface User extends BaseEntity {
	email: string
	name: string
	role: UserRole
	isActive: boolean
	lastLoginAt?: string
	// password je pouze na serveru, nikdy se neposílá na FE
}

// ==========================================
// PAGE (OBSAHOVÁ STRÁNKA)
// ==========================================
export interface Page extends BaseEntity {
	title: string
	slug: string
	content: string
	excerpt?: string
	status: PublishStatus
	publishedAt?: string
	seoTitle?: string
	seoDescription?: string
	sortOrder: number
}

// ==========================================
// BANNER
// ==========================================
export interface Banner extends BaseEntity {
	title: string
	image: string
	link?: string
	linkText?: string
	position: 'hero' | 'sidebar' | 'inline'
	startDate?: string
	endDate?: string
	isActive: boolean
	sortOrder: number
}

// ==========================================
// API RESPONSE TYPY
// ==========================================

/** Stránkovaná odpověď */
export interface PaginatedResponse<T> {
	data: T[]
	pagination: {
		page: number
		limit: number
		total: number
		totalPages: number
	}
}

/** API Error odpověď */
export interface ApiErrorResponse {
	code: string
	message: string
	statusCode: number
	fields?: Record<string, string>
}

/** Query parametry pro stránkování */
export interface PaginationQuery {
	page?: number
	limit?: number
	sort?: string
	order?: 'asc' | 'desc'
}

/** Query parametry pro filtrování obchodů */
export interface ShopFilterQuery extends PaginationQuery {
	floorId?: string
	categoryId?: string
	search?: string
	isActive?: boolean
}

/** Query parametry pro filtrování akcí */
export interface EventFilterQuery extends PaginationQuery {
	status?: PublishStatus
	shopId?: string
	search?: string
	fromDate?: string
	toDate?: string
}

// ==========================================
// CONTACT (DŮLEŽITÝ KONTAKT)
// ==========================================
export interface Contact {
	/** Název kontaktu (např. "Kontaktní email") */
	title?: string
	/** Jméno osoby */
	name?: string
	/** Telefonní číslo */
	phone?: string
	/** E-mail */
	email?: string
}

// ==========================================
// GENERAL INFO (OBECNÉ INFORMACE O CENTRU)
// ==========================================
export interface GeneralInfo extends BaseEntity {
	title?: string
	shortText?: string
	text?: string
	openingHours?: OpeningHoursEntry[]
	specialOpeningHours?: SpecialOpeningHours[]
	facebook?: string
	instagram?: string
	gallery?: string[]
	parkingContent?: string
	parkingImage?: string
	parkingOtherInfo?: string
	contacts?: Contact[]
}

// ==========================================
// HOMEPAGE (NASTAVENÍ HLAVNÍ STRÁNKY)
// ==========================================
export interface Homepage extends BaseEntity {
	heroImage?: string
	showHeroBorder?: boolean
}

// ==========================================
// AUTH TYPY
// ==========================================
export interface LoginRequest {
	email: string
	password: string
}

export interface LoginResponse {
	user: Omit<User, 'password'>
	accessToken: string
}

export interface AuthUser {
	id: string
	email: string
	name: string
	role: UserRole
}
