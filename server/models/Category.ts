/**
 * Category Model - Kategorie obchodů
 */

import type { Document, Model } from 'mongoose'
import mongoose, { Schema } from 'mongoose'

// ==========================================
// INTERFACE
// ==========================================

export interface ICategory {
	name: string
	slug: string
	isActive: boolean
	sortOrder: number
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
	},
)

// ==========================================
// INDEXES
// ==========================================

categorySchema.index({ isActive: 1, sortOrder: 1 })
categorySchema.index({ name: 'text' })

// ==========================================
// MODEL
// ==========================================

export const Category: Model<ICategoryDocument> =
	mongoose.models.Category || mongoose.model<ICategoryDocument>('Category', categorySchema)
