/**
 * Category Model - Kategorie obchodů
 */

import mongoose, { Schema, Document, Model } from 'mongoose'

// ==========================================
// INTERFACE
// ==========================================

export interface ICategory {
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  sortOrder: number
  isActive: boolean
}

export interface ICategoryDocument extends ICategory, Document {
  createdAt: Date
  updatedAt: Date
}

// ==========================================
// SCHEMA
// ==========================================

const categorySchema = new Schema<ICategoryDocument>(
  {
    name: {
      type: String,
      required: [true, 'Název kategorie je povinný'],
      trim: true,
      maxlength: 50,
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
      maxlength: 500,
    },
    icon: {
      type: String,
    },
    color: {
      type: String,
      match: /^#[0-9A-Fa-f]{6}$/,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret._id = ret._id.toString()
        delete ret.__v
        return ret
      },
    },
  }
)

// ==========================================
// INDEXES
// ==========================================

categorySchema.index({ sortOrder: 1 })
categorySchema.index({ isActive: 1, sortOrder: 1 })

// ==========================================
// MODEL
// ==========================================

export const Category: Model<ICategoryDocument> =
  mongoose.models.Category || mongoose.model<ICategoryDocument>('Category', categorySchema)
