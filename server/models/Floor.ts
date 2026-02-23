/**
 * Floor Model - Patra centra
 */

import mongoose, { Schema, Document, Model } from 'mongoose'

// ==========================================
// INTERFACE
// ==========================================

export interface IFloor {
  name: string
  slug: string
  level: number
  description?: string
  mapImage?: string
  isActive: boolean
  sortOrder: number
}

export interface IFloorDocument extends IFloor, Document {
  createdAt: Date
  updatedAt: Date
}

// ==========================================
// SCHEMA
// ==========================================

const floorSchema = new Schema<IFloorDocument>(
  {
    name: {
      type: String,
      required: [true, 'Název patra je povinný'],
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
    level: {
      type: Number,
      required: true,
      index: true,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    mapImage: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
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

// level a slug mají index: true přímo ve schématu
floorSchema.index({ isActive: 1, sortOrder: 1 })

// ==========================================
// MODEL
// ==========================================

export const Floor: Model<IFloorDocument> =
  mongoose.models.Floor || mongoose.model<IFloorDocument>('Floor', floorSchema)
