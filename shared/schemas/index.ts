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

/** Slug validátor */
export const slugSchema = z
  .string()
  .min(2, 'Slug musí mít alespoň 2 znaky')
  .max(100, 'Slug může mít maximálně 100 znaků')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug může obsahovat pouze malá písmena, čísla a pomlčky')

/** Email validátor */
export const emailSchema = z.string().email('Neplatný email')

/** Phone validátor */
export const phoneSchema = z
  .string()
  .regex(/^\+?[0-9\s-]{9,}$/, 'Neplatné telefonní číslo')
  .optional()

/** URL validátor */
export const urlSchema = z.string().url('Neplatná URL adresa').optional()

/** Čas ve formátu HH:mm */
export const timeSchema = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Čas musí být ve formátu HH:mm')

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

export const specialOpeningHoursSchema = z.object({
  date: z.string().datetime(),
  open: timeSchema.optional(),
  close: timeSchema.optional(),
  closed: z.boolean().optional(),
  note: z.string().max(200).optional(),
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
// SHOP SCHÉMATA
// ==========================================

export const shopCreateSchema = z.object({
  name: z.string().min(2, 'Název musí mít alespoň 2 znaky').max(100),
  slug: slugSchema.optional(), // Automaticky generováno pokud není zadáno
  description: z.string().max(5000).optional(),
  shortDescription: z.string().max(300).optional(),
  logo: z.string().optional(),
  coverImage: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  phone: phoneSchema,
  email: emailSchema.optional(),
  website: urlSchema,
  socialLinks: z
    .object({
      facebook: urlSchema,
      instagram: urlSchema,
      twitter: urlSchema,
    })
    .optional(),
  floorId: objectIdSchema.optional(),
  unitIds: z.array(objectIdSchema).optional(),
  openingHours: z.array(openingHoursEntrySchema).optional(),
  specialOpeningHours: z.array(specialOpeningHoursSchema).optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
})

export const shopUpdateSchema = shopCreateSchema.partial()

export const shopFilterQuerySchema = paginationQuerySchema.extend({
  floorId: objectIdSchema.optional(),
  search: z.string().max(100).optional(),
  isActive: z.coerce.boolean().optional(),
})

export type ShopCreateInput = z.infer<typeof shopCreateSchema>
export type ShopUpdateInput = z.infer<typeof shopUpdateSchema>
export type ShopFilterQueryInput = z.input<typeof shopFilterQuerySchema>

// ==========================================
// EVENT SCHÉMATA
// ==========================================

export const publishStatusSchema = z.enum(['draft', 'published', 'archived'])

export const eventCreateSchema = z.object({
  title: z.string().min(3, 'Název musí mít alespoň 3 znaky').max(200),
  slug: slugSchema.optional(),
  content: z.string().min(10, 'Obsah musí mít alespoň 10 znaků'),
  excerpt: z.string().max(500).optional(),
  coverImage: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  status: publishStatusSchema.default('draft'),
  scheduledAt: z.string().datetime().optional(),
  eventStartDate: z.string().datetime().optional(),
  eventEndDate: z.string().datetime().optional(),
  shopIds: z.array(objectIdSchema).optional(),
  isHighlighted: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
})

export const eventUpdateSchema = eventCreateSchema.partial()

export const eventFilterQuerySchema = paginationQuerySchema.extend({
  status: publishStatusSchema.optional(),
  shopId: objectIdSchema.optional(),
  search: z.string().max(100).optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
})

export type EventCreateInput = z.infer<typeof eventCreateSchema>
export type EventUpdateInput = z.infer<typeof eventUpdateSchema>
export type EventFilterQueryInput = z.input<typeof eventFilterQuerySchema>

// ==========================================
// SERVICE SCHÉMATA
// ==========================================

export const serviceCreateSchema = z.object({
  name: z.string().min(2).max(100),
  slug: slugSchema.optional(),
  description: z.string().min(10).max(2000),
  shortDescription: z.string().max(300).optional(),
  icon: z.string().optional(),
  image: z.string().optional(),
  location: z.string().max(200).optional(),
  floorId: objectIdSchema.optional(),
  phone: phoneSchema,
  email: emailSchema.optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
})

export const serviceUpdateSchema = serviceCreateSchema.partial()

export type ServiceCreateInput = z.infer<typeof serviceCreateSchema>
export type ServiceUpdateInput = z.infer<typeof serviceUpdateSchema>

// ==========================================
// FLOOR SCHÉMATA
// ==========================================

export const floorCreateSchema = z.object({
  name: z.string().min(1).max(50),
  slug: slugSchema.optional(),
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
// UNIT SCHÉMATA
// ==========================================

export const unitCreateSchema = z.object({
  code: z.string().min(1).max(20),
  floorId: objectIdSchema,
  mapPosition: z
    .object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
    })
    .optional(),
  mapPolygon: z.string().optional(),
  shopId: objectIdSchema.optional(),
  area: z.number().positive().optional(),
  isActive: z.boolean().default(true),
  isVacant: z.boolean().default(true),
})

export const unitUpdateSchema = unitCreateSchema.partial()

export const unitFilterQuerySchema = paginationQuerySchema.extend({
  floorId: objectIdSchema.optional(),
  shopId: objectIdSchema.optional(),
  isVacant: z.coerce.boolean().optional(),
})

export type UnitCreateInput = z.infer<typeof unitCreateSchema>
export type UnitUpdateInput = z.infer<typeof unitUpdateSchema>
export type UnitFilterQueryInput = z.input<typeof unitFilterQuerySchema>

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

export const userUpdateSchema = userCreateSchema.partial().omit({ password: true }).extend({
  password: z.string().min(8).optional(),
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

export const pageCreateSchema = z.object({
  title: z.string().min(2).max(200),
  slug: slugSchema.optional(),
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
