/**
 * Event Model - Akce/Novinky
 */

import mongoose, { Schema, Document, Model, Types } from 'mongoose'
import type { PublishStatus } from '@/shared/types'

// ==========================================
// INTERFACE
// ==========================================

export interface IEvent {
  title: string
  slug: string
  content: string
  excerpt?: string
  coverImage?: string
  gallery?: string[]
  status: PublishStatus
  publishedAt?: Date
  scheduledAt?: Date
  eventStartDate?: Date
  eventEndDate?: Date
  shopIds?: Types.ObjectId[]
  isHighlighted: boolean
  sortOrder: number
  seoTitle?: string
  seoDescription?: string
  authorId: Types.ObjectId
}

export interface IEventDocument extends IEvent, Document {
  createdAt: Date
  updatedAt: Date
}

// ==========================================
// SCHEMA
// ==========================================

const eventSchema = new Schema<IEventDocument>(
  {
    title: {
      type: String,
      required: [true, 'Název akce je povinný'],
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Obsah je povinný'],
    },
    excerpt: {
      type: String,
      maxlength: 500,
    },
    coverImage: String,
    gallery: [String],
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    publishedAt: {
      type: Date,
      index: true,
    },
    scheduledAt: {
      type: Date,
    },
    eventStartDate: {
      type: Date,
      index: true,
    },
    eventEndDate: {
      type: Date,
    },
    shopIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Shop',
      },
    ],
    isHighlighted: {
      type: Boolean,
      default: false,
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
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret._id = ret._id.toString()
        if (ret.authorId) ret.authorId = ret.authorId.toString()
        if (ret.shopIds) ret.shopIds = ret.shopIds.map((id: Types.ObjectId) => id.toString())
        delete ret.__v
        return ret
      },
    },
  }
)

// ==========================================
// INDEXES
// ==========================================

eventSchema.index({ title: 'text', content: 'text' })
eventSchema.index({ status: 1, publishedAt: -1 })
eventSchema.index({ status: 1, eventStartDate: 1 })
eventSchema.index({ isHighlighted: 1, status: 1, publishedAt: -1 })

// ==========================================
// MODEL
// ==========================================

export const Event: Model<IEventDocument> =
  mongoose.models.Event || mongoose.model<IEventDocument>('Event', eventSchema)
