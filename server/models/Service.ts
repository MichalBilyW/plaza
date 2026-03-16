/**
 * Service Model - Služby pro návštěvníky
 */

import type { Document, Model } from 'mongoose'
import mongoose, { Schema } from 'mongoose'

// ==========================================
// INTERFACE
// ==========================================

export interface IService {
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

export interface IServiceDocument extends IService, Document {
	createdAt: Date
	updatedAt: Date
}

// ==========================================
// SCHEMA
// ==========================================

const serviceSchema = new Schema<IServiceDocument>(
	{
		icon: {
			type: String,
			required: [true, 'Ikona je povinná'],
		},
		shortDescription: {
			type: String,
			required: [true, 'Popisek je povinný'],
			trim: true,
			maxlength: 120,
		},
		description: {
			type: String,
			maxlength: 2000,
		},
		isActive: {
			type: Boolean,
			default: true,
			index: true,
		},
		sortOrder: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
		toJSON: {
			transform: (_doc: unknown, ret: Record<string, unknown>) => {
				ret._id = String(ret._id)
				delete ret.__v
				return ret
			},
		},
	},
)

// ==========================================
// INDEXES
// ==========================================

serviceSchema.index({ isActive: 1, sortOrder: 1 })
serviceSchema.index({ shortDescription: 'text' })

// ==========================================
// MODEL
// ==========================================

export const Service: Model<IServiceDocument> =
	mongoose.models.Service || mongoose.model<IServiceDocument>('Service', serviceSchema)
