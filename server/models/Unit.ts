/**
 * Unit Model - Jednotky na mapě
 */

import mongoose, { Schema, Document, Model, Types } from 'mongoose'

// ==========================================
// INTERFACE
// ==========================================

export interface IMapPosition {
  x: number
  y: number
  width: number
  height: number
}

export interface IUnit {
  code: string
  floorId: Types.ObjectId
  mapPosition?: IMapPosition
  mapPolygon?: string
  shopId?: Types.ObjectId
  area?: number
  isActive: boolean
  isVacant: boolean
}

export interface IUnitDocument extends IUnit, Document {
  createdAt: Date
  updatedAt: Date
}

// ==========================================
// SUB-SCHEMA
// ==========================================

const mapPositionSchema = new Schema(
  {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
  },
  { _id: false }
)

// ==========================================
// SCHEMA
// ==========================================

const unitSchema = new Schema<IUnitDocument>(
  {
    code: {
      type: String,
      required: [true, 'Kód jednotky je povinný'],
      trim: true,
      maxlength: 20,
      index: true,
    },
    floorId: {
      type: Schema.Types.ObjectId,
      ref: 'Floor',
      required: [true, 'Patro je povinné'],
      index: true,
    },
    mapPosition: mapPositionSchema,
    mapPolygon: String,
    shopId: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      index: true,
    },
    area: {
      type: Number,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVacant: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret._id = ret._id.toString()
        if (ret.floorId) ret.floorId = ret.floorId.toString()
        if (ret.shopId) ret.shopId = ret.shopId.toString()
        delete ret.__v
        return ret
      },
    },
  }
)

// ==========================================
// INDEXES
// ==========================================

unitSchema.index({ floorId: 1, code: 1 }, { unique: true })
unitSchema.index({ floorId: 1, isActive: 1 })
unitSchema.index({ shopId: 1 })
unitSchema.index({ isVacant: 1, isActive: 1 })

// ==========================================
// MODEL
// ==========================================

export const Unit: Model<IUnitDocument> =
  mongoose.models.Unit || mongoose.model<IUnitDocument>('Unit', unitSchema)
