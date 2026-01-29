/**
 * Sdílené typy pro celou aplikaci
 */

// ==========================================
// ZÁKLADNÍ TYPY
// ==========================================

/** Role uživatele v CMS */
export type UserRole = 'admin' | 'editor'

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
  date: string // ISO date string
  open?: string
  close?: string
  closed?: boolean
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
// SHOP (OBCHOD)
// ==========================================
export interface Shop extends BaseEntity {
  name: string
  slug: string
  description?: string
  shortDescription?: string
  logo?: string
  coverImage?: string
  gallery?: string[]
  categoryId: string
  category?: Category

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
  floorId?: string
  floor?: Floor
  unitIds?: string[]
  units?: Unit[]

  // Otevírací doby
  openingHours?: OpeningHoursEntry[]
  specialOpeningHours?: SpecialOpeningHours[]

  // Metadata
  isActive: boolean
  sortOrder: number
  seoTitle?: string
  seoDescription?: string
}

// ==========================================
// CATEGORY (KATEGORIE)
// ==========================================
export interface Category extends BaseEntity {
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  sortOrder: number
  isActive: boolean
}

// ==========================================
// EVENT (AKCE/NOVINKA)
// ==========================================
export interface Event extends BaseEntity {
  title: string
  slug: string
  content: string
  excerpt?: string
  coverImage?: string
  gallery?: string[]

  // Publikace
  status: PublishStatus
  publishedAt?: string
  scheduledAt?: string // Pro naplánované publikování

  // Časové rozmezí akce
  eventStartDate?: string
  eventEndDate?: string

  // Vazby
  shopIds?: string[]
  shops?: Shop[]

  // Metadata
  isHighlighted: boolean
  sortOrder: number
  seoTitle?: string
  seoDescription?: string

  // Autor
  authorId: string
  author?: User
}

// ==========================================
// SERVICE (SLUŽBA)
// ==========================================
export interface Service extends BaseEntity {
  name: string
  slug: string
  description: string
  shortDescription?: string
  icon?: string
  image?: string

  // Lokace
  location?: string
  floorId?: string
  floor?: Floor

  // Kontakt
  phone?: string
  email?: string

  // Metadata
  isActive: boolean
  sortOrder: number
}

// ==========================================
// FLOOR (PATRO)
// ==========================================
export interface Floor extends BaseEntity {
  name: string // např. "1. patro", "Přízemí"
  slug: string
  level: number // číselné pořadí (-1 = podzemí, 0 = přízemí, 1 = 1. patro)
  description?: string
  mapImage?: string // SVG nebo obrázek mapy patra
  isActive: boolean
  sortOrder: number
}

// ==========================================
// UNIT (JEDNOTKA NA MAPĚ)
// ==========================================
export interface Unit extends BaseEntity {
  code: string // Identifikátor jednotky např. "A101"
  floorId: string
  floor?: Floor

  // Umístění na mapě (SVG coordinates nebo polygon)
  mapPosition?: {
    x: number
    y: number
    width: number
    height: number
  }
  mapPolygon?: string // SVG path data

  // Přiřazený obchod (může být null = volná jednotka)
  shopId?: string
  shop?: Shop

  // Metadata
  area?: number // m²
  isActive: boolean
  isVacant: boolean
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
  categoryId?: string
  floorId?: string
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
