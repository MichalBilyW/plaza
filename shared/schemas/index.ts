/**
 * Zod schémata pro validaci vstupů
 *
 * Tyto schémata se používají pro:
 * 1. Validaci requestů na serveru
 * 2. Validaci formulářů na frontendu
 * 3. Odvození TypeScript typů
 */

import { z } from 'zod'

// ==========================================
// ZÁKLADNÍ SCHÉMATA
// ==========================================

/** MongoDB ObjectId validátor */
export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Neplatné ID')

/** Volitelný ObjectId - prázdný string nebo null = nezadáno (nullable) */
export const optionalObjectIdSchema = z.preprocess(
	(val) => (val === '' ? null : val),
	objectIdSchema.nullable().optional(),
)

/** Slug validátor - pro povinný slug */
export const slugSchema = z
	.string()
	.min(2, 'Slug musí mít alespoň 2 znaky')
	.max(100, 'Slug může mít maximálně 100 znaků')
	.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug může obsahovat pouze malá písmena, čísla a pomlčky')

/**
 * Volitelný slug - prázdný string nebo undefined znamená "generovat automaticky"
 * Pokud je slug zadán (neprázdný), musí splnit validaci
 */
export const optionalSlugSchema = z.preprocess(
	(val) => (val === '' ? undefined : val),
	slugSchema.optional(),
)

/** Email validátor */
export const emailSchema = z.string().email('Neplatný email')

/** Volitelný email - prázdný string = nezadáno */
export const optionalEmailSchema = z.preprocess(
	(val) => (val === '' ? undefined : val),
	emailSchema.optional(),
)

/** Phone validátor - prázdný string = nezadáno */
export const phoneSchema = z.preprocess(
	(val) => (val === '' ? undefined : val),
	z
		.string()
		.regex(/^\+?[0-9\s-]{9,}$/, 'Neplatné telefonní číslo')
		.optional(),
)

/** URL validátor - prázdný string = nezadáno */
export const urlSchema = z.preprocess(
	(val) => (val === '' ? undefined : val),
	z.string().url('Neplatná URL adresa').optional(),
)

/** Čas ve formátu HH:mm */
export const timeSchema = z
	.string()
	.regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Čas musí být ve formátu HH:mm')

// ==========================================
// OPENING HOURS SCHÉMATA
// ==========================================

export const dayOfWeekSchema = z.enum([
	'monday',
	'tuesday',
	'wednesday',
	'thursday',
	'friday',
	'saturday',
	'sunday',
])

export const openingHoursEntrySchema = z.object({
	day: dayOfWeekSchema,
	open: timeSchema,
	close: timeSchema,
	closed: z.boolean().optional(),
})

export const specialOpeningHoursSchema = z
	.object({
		/** Jednotlivý den */
		date: z.string().optional(),
		/** Začátek období */
		dateFrom: z.string().optional(),
		/** Konec období */
		dateTo: z.string().optional(),
		/** Hodina otevření */
		open: timeSchema.optional(),
		/** Hodina zavření */
		close: timeSchema.optional(),
		/** Je zavřeno */
		closed: z.boolean().optional(),
		/** Popisek */
		note: z.string().max(200).optional(),
	})
	.refine((data) => data.date || (data.dateFrom && data.dateTo), {
		message: 'Musí být zadáno datum nebo období',
	})

// ==========================================
// PAGINATION SCHÉMATA
// ==========================================

export const paginationQuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
	sort: z.string().optional(),
	order: z.enum(['asc', 'desc']).default('asc'),
})

export type PaginationQueryInput = z.input<typeof paginationQuerySchema>

// ==========================================
// CATEGORY SCHÉMATA
// ==========================================

export const categoryCreateSchema = z.object({
	name: z.string().min(2, 'Název musí mít alespoň 2 znaky').max(100),
	slug: optionalSlugSchema,
	description: z.string().max(500).optional(),
	isActive: z.boolean().default(true),
	sortOrder: z.number().int().default(0),
})

export const categoryUpdateSchema = categoryCreateSchema.partial()

export const categoryFilterQuerySchema = paginationQuerySchema.extend({
	search: z.string().max(100).optional(),
	isActive: z.preprocess((val) => {
		if (val === '' || val === undefined || val === null) return undefined
		if (val === 'true' || val === true) return true
		if (val === 'false' || val === false) return false
		return undefined
	}, z.boolean().optional()),
})

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>
export type CategoryFilterQueryInput = z.input<typeof categoryFilterQuerySchema>

// ==========================================
// SHOP SCHÉMATA
// ==========================================

export const shopCreateSchema = z.object({
	name: z.string().min(2, 'Název musí mít alespoň 2 znaky').max(100),
	slug: optionalSlugSchema, // Automaticky generováno pokud není zadáno
	description: z.string().max(5000).optional(),
	shortDescription: z.string().max(300).optional(),
	logo: z.string().optional(),
	gallery: z.array(z.string()).optional(),
	phone: phoneSchema,
	email: optionalEmailSchema,
	website: urlSchema,
	socialLinks: z
		.object({
			facebook: urlSchema,
			instagram: urlSchema,
			twitter: urlSchema,
		})
		.optional(),
	floorId: optionalObjectIdSchema,
	categoryId: optionalObjectIdSchema,
	unitCode: z.preprocess(
		(val) => (val === '' ? null : val),
		z.string().max(20).nullable().optional(),
	),
	mapPosition: z
		.object({
			x: z.number(),
			y: z.number(),
			width: z.number(),
			height: z.number(),
		})
		.optional(),
	mapPolygon: z.string().optional(),
	openingHours: z.array(openingHoursEntrySchema).optional(),
	specialOpeningHours: z.array(specialOpeningHoursSchema).optional(),
	isActive: z.boolean().default(true),
	publishDate: z.string().datetime().nullable().optional(),
	seoTitle: z.string().max(60).optional(),
	seoDescription: z.string().max(160).optional(),
})

export const shopUpdateSchema = shopCreateSchema.partial()

export const shopFilterQuerySchema = paginationQuerySchema.extend({
	floorId: objectIdSchema.optional(),
	categoryId: objectIdSchema.optional(),
	search: z.string().max(100).optional(),
	isActive: z.preprocess((val) => {
		if (val === '' || val === undefined || val === null) return undefined
		if (val === 'true' || val === true) return true
		if (val === 'false' || val === false) return false
		return undefined
	}, z.boolean().optional()),
})

export type ShopCreateInput = z.infer<typeof shopCreateSchema>
export type ShopUpdateInput = z.infer<typeof shopUpdateSchema>
export type ShopFilterQueryInput = z.input<typeof shopFilterQuerySchema>

// ==========================================
// EVENT SCHÉMATA
// ==========================================

export const eventCreateSchema = z.object({
	name: z.string().min(2, 'Název musí mít alespoň 2 znaky').max(200),
	image: z.string().min(1, 'Obrázek je povinný'),
	content: z.string().max(50000).optional(),
	shopId: objectIdSchema,
	sortOrder: z.number().int().default(0),
	isActive: z.boolean().default(true),
})

export const eventUpdateSchema = eventCreateSchema.partial()

export const eventFilterQuerySchema = paginationQuerySchema.extend({
	shopId: objectIdSchema.optional(),
	search: z.string().max(100).optional(),
	isActive: z.preprocess((val) => {
		if (val === '' || val === undefined || val === null) return undefined
		if (val === 'true' || val === true) return true
		if (val === 'false' || val === false) return false
		return undefined
	}, z.boolean().optional()),
})

export type EventCreateInput = z.infer<typeof eventCreateSchema>
export type EventUpdateInput = z.infer<typeof eventUpdateSchema>
export type EventFilterQueryInput = z.input<typeof eventFilterQuerySchema>

// ==========================================
// NEWS SCHÉMATA (Novinky a akce centra)
// ==========================================

export const newsCreateSchema = z.object({
	name: z.string().min(2, 'Název musí mít alespoň 2 znaky').max(200),
	image: z.string().min(1, 'Obrázek je povinný'),
	content: z.string().max(50000).optional(),
	sortOrder: z.number().int().default(0),
	isActive: z.boolean().default(true),
})

export const newsUpdateSchema = newsCreateSchema.partial()

export const newsFilterQuerySchema = paginationQuerySchema.extend({
	search: z.string().max(100).optional(),
	isActive: z.preprocess((val) => {
		if (val === '' || val === undefined || val === null) return undefined
		if (val === 'true' || val === true) return true
		if (val === 'false' || val === false) return false
		return undefined
	}, z.boolean().optional()),
})

export type NewsCreateInput = z.infer<typeof newsCreateSchema>
export type NewsUpdateInput = z.infer<typeof newsUpdateSchema>
export type NewsFilterQueryInput = z.input<typeof newsFilterQuerySchema>

// ==========================================
// SERVICE SCHÉMATA
// ==========================================

export const serviceCreateSchema = z.object({
	icon: z.string().min(1, 'Ikona je povinná'),
	shortDescription: z.string().min(1, 'Popisek je povinný').max(120, 'Popisek může mít max. 120 znaků'),
	description: z.string().max(2000).optional(),
	isActive: z.boolean().default(true),
	sortOrder: z.number().int().default(0),
})

export const serviceUpdateSchema = serviceCreateSchema.partial()

export const serviceFilterQuerySchema = paginationQuerySchema.extend({
	search: z.string().max(100).optional(),
	isActive: z.preprocess((val) => {
		if (val === '' || val === undefined || val === null) return undefined
		if (val === 'true' || val === true) return true
		if (val === 'false' || val === false) return false
		return undefined
	}, z.boolean().optional()),
})

export type ServiceCreateInput = z.infer<typeof serviceCreateSchema>
export type ServiceUpdateInput = z.infer<typeof serviceUpdateSchema>
export type ServiceFilterQueryInput = z.input<typeof serviceFilterQuerySchema>

// ==========================================
// FLOOR SCHÉMATA
// ==========================================

export const floorCreateSchema = z.object({
	name: z.string().min(1).max(50),
	slug: optionalSlugSchema,
	level: z.number().int(),
	description: z.string().max(500).optional(),
	mapImage: z.string().optional(),
	isActive: z.boolean().default(true),
	sortOrder: z.number().int().default(0),
})

export const floorUpdateSchema = floorCreateSchema.partial()

export type FloorCreateInput = z.infer<typeof floorCreateSchema>
export type FloorUpdateInput = z.infer<typeof floorUpdateSchema>

// ==========================================
// USER SCHÉMATA
// ==========================================

export const userRoleSchema = z.enum(['admin', 'editor'])

export const userCreateSchema = z.object({
	email: emailSchema,
	name: z.string().min(2).max(100),
	password: z.string().min(8, 'Heslo musí mít alespoň 8 znaků'),
	role: userRoleSchema.default('editor'),
	isActive: z.boolean().default(true),
})

export const userUpdateSchema = userCreateSchema
	.partial()
	.omit({ password: true })
	.extend({
		password: z.preprocess(
			(val) => (val === '' ? undefined : val),
			z.string().min(8, 'Heslo musí mít alespoň 8 znaků').optional(),
		),
	})

export type UserCreateInput = z.infer<typeof userCreateSchema>
export type UserUpdateInput = z.infer<typeof userUpdateSchema>

// ==========================================
// AUTH SCHÉMATA
// ==========================================

export const loginSchema = z.object({
	email: emailSchema,
	password: z.string().min(1, 'Heslo je povinné'),
})

export type LoginInput = z.infer<typeof loginSchema>

// ==========================================
// PAGE SCHÉMATA
// ==========================================

export const publishStatusSchema = z.enum(['draft', 'published'])
export type PublishStatus = z.infer<typeof publishStatusSchema>

export const pageCreateSchema = z.object({
	title: z.string().min(2).max(200),
	slug: optionalSlugSchema,
	content: z.string().min(10),
	excerpt: z.string().max(500).optional(),
	status: publishStatusSchema.default('draft'),
	seoTitle: z.string().max(60).optional(),
	seoDescription: z.string().max(160).optional(),
	sortOrder: z.number().int().default(0),
})

export const pageUpdateSchema = pageCreateSchema.partial()

export type PageCreateInput = z.infer<typeof pageCreateSchema>
export type PageUpdateInput = z.infer<typeof pageUpdateSchema>

// ==========================================
// BANNER SCHÉMATA
// ==========================================

export const bannerPositionSchema = z.enum(['hero', 'sidebar', 'inline'])

export const bannerCreateSchema = z.object({
	title: z.string().min(2).max(100),
	image: z.string().min(1, 'Obrázek je povinný'),
	link: urlSchema,
	linkText: z.string().max(50).optional(),
	position: bannerPositionSchema.default('hero'),
	startDate: z.string().datetime().optional(),
	endDate: z.string().datetime().optional(),
	isActive: z.boolean().default(true),
	sortOrder: z.number().int().default(0),
})

export const bannerUpdateSchema = bannerCreateSchema.partial()

export type BannerCreateInput = z.infer<typeof bannerCreateSchema>
export type BannerUpdateInput = z.infer<typeof bannerUpdateSchema>

// ==========================================
// QUERY SCHÉMATA PRO FILTROVÁNÍ A STRÁNKOVÁNÍ
// ==========================================

export const shopsQuerySchema = paginationQuerySchema.extend({
	floorId: objectIdSchema.optional(),
	search: z.string().optional(),
	active: z.coerce.boolean().optional(),
	featured: z.coerce.boolean().optional(),
})

export type ShopsQueryInput = z.input<typeof shopsQuerySchema>

export const eventsQuerySchema = paginationQuerySchema.extend({
	search: z.string().optional(),
	published: z.coerce.boolean().optional(),
	upcoming: z.coerce.boolean().optional(),
})

export type EventsQueryInput = z.input<typeof eventsQuerySchema>

// ==========================================
// GENERAL INFO SCHÉMATA
// ==========================================

export const generalInfoUpdateSchema = z.object({
	title: z.string().max(200).optional(),
	shortText: z.string().max(500).optional(),
	text: z.string().max(10000).optional(),
	openingHours: z.array(openingHoursEntrySchema).optional(),
	specialOpeningHours: z.array(specialOpeningHoursSchema).optional(),
	facebook: urlSchema,
	instagram: urlSchema,
	gallery: z.array(z.string()).max(10, 'Maximálně 10 fotek v galerii').optional(),
})

export type GeneralInfoUpdateInput = z.infer<typeof generalInfoUpdateSchema>

// ==========================================
// HOMEPAGE SCHÉMATA
// ==========================================

export const homepageUpdateSchema = z.object({
	heroImage: z.string().optional(),
})

export type HomepageUpdateInput = z.infer<typeof homepageUpdateSchema>
