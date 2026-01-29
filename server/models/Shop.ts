/**
 * Shop Model - Obchody/Nájemci
 */

import mongoose, { Schema, Document, Model, Types } from 'mongoose'
import type { DayOfWeek } from '@/shared/types'

// ==========================================
// INTERFACES
// ==========================================

export interface IOpeningHoursEntry {
  day: DayOfWeek
  open: string
  close: string
  closed?: boolean
}

export interface ISpecialOpeningHours {
  date: Date
  open?: string
  close?: string
  closed?: boolean
  note?: string
}

export interface ISocialLinks {
  facebook?: string
  instagram?: string
  twitter?: string
}

export interface IShop {
  name: string
  slug: string
  description?: string
  shortDescription?: string
  logo?: string
  coverImage?: string
  gallery?: string[]
  categoryId: Types.ObjectId
  phone?: string
  email?: string
  website?: string
  socialLinks?: ISocialLinks
  floorId?: Types.ObjectId
  unitIds?: Types.ObjectId[]
  openingHours?: IOpeningHoursEntry[]
  specialOpeningHours?: ISpecialOpeningHours[]
  isActive: boolean
  sortOrder: number
  seoTitle?: string
  seoDescription?: string
}

export interface IShopDocument extends IShop, Document {
  createdAt: Date
  updatedAt: Date
}

// ==========================================
// SUB-SCHEMAS
// ==========================================

const openingHoursEntrySchema = new Schema(
  {
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true,
    },
    open: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    close: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    closed: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
)

const specialOpeningHoursSchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    open: String,
    close: String,
    closed: Boolean,
    note: {
      type: String,
      maxlength: 200,
    },
  },
  { _id: false }
)

const socialLinksSchema = new Schema(
  {
    facebook: String,
    instagram: String,
    twitter: String,
  },
  { _id: false }
)

// ==========================================
// MAIN SCHEMA
// ==========================================

const shopSchema = new Schema<IShopDocument>(
  {
    name: {
      type: String,
      required: [true, 'Název obchodu je povinný'],
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      maxlength: 5000,
    },
    shortDescription: {
      type: String,
      maxlength: 300,
    },
    logo: String,
    coverImage: String,
    gallery: [String],
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Kategorie je povinná'],
      index: true,
    },
    phone: String,
    email: {
      type: String,
      lowercase: true,
    },
    website: String,
    socialLinks: socialLinksSchema,
    floorId: {
      type: Schema.Types.ObjectId,
      ref: 'Floor',
      index: true,
    },
    unitIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Unit',
      },
    ],
    openingHours: [openingHoursEntrySchema],
    specialOpeningHours: [specialOpeningHoursSchema],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    seoTitle: {
      type: String,
      maxlength: 60,
    },
    seoDescription: {
      type: String,
      maxlength: 160,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret._id = ret._id.toString()
        if (ret.categoryId) ret.categoryId = ret.categoryId.toString()
        if (ret.floorId) ret.floorId = ret.floorId.toString()
        if (ret.unitIds) ret.unitIds = ret.unitIds.map((id: Types.ObjectId) => id.toString())
        delete ret.__v
        return ret
      },
    },
  }
)

// ==========================================
// INDEXES
// ==========================================

shopSchema.index({ name: 'text', description: 'text' })
shopSchema.index({ isActive: 1, sortOrder: 1 })
shopSchema.index({ categoryId: 1, isActive: 1 })
shopSchema.index({ floorId: 1, isActive: 1 })

// ==========================================
// MODEL
// ==========================================

export const Shop: Model<IShopDocument> =
  mongoose.models.Shop || mongoose.model<IShopDocument>('Shop', shopSchema)
