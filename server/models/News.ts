/**
 * News Model - Novinky a akce centra
 * Model pro novinky centra (nezávislé na obchodech)
 */

import type { Document, Model } from 'mongoose'
import mongoose, { Schema } from 'mongoose'

// ==========================================
// INTERFACE
// ==========================================

export interface INews {
	/** Interní název (jen pro CMS, nezobrazuje se na webu) */
	name: string
	/** Čtvercový obrázek */
	image: string
	/** Obsah novinky (HTML) - zobrazuje se v modalu */
	content?: string
	/** Pořadí pro řazení */
	sortOrder: number
	/** Je novinka aktivní */
	isActive: boolean
	/** Datum, do kterého se novinka zobrazuje na webu (včetně). Po tomto datu se na webu skryje. */
	displayUntil?: Date | null
}

export interface INewsDocument extends INews, Document {
	createdAt: Date
	updatedAt: Date
}

// ==========================================
// SCHEMA
// ==========================================

const newsSchema = new Schema<INewsDocument>(
	{
		name: {
			type: String,
			required: [true, 'Název novinky je povinný'],
			trim: true,
			maxlength: 200,
		},
		image: {
			type: String,
			required: [true, 'Obrázek novinky je povinný'],
		},
		content: {
			type: String,
			default: '',
		},
		sortOrder: {
			type: Number,
			default: 0,
		},
		isActive: {
			type: Boolean,
			default: true,
			index: true,
		},
		displayUntil: {
			type: Date,
			default: null,
			index: true,
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

newsSchema.index({ name: 'text' })
newsSchema.index({ isActive: 1, sortOrder: 1 })

// ==========================================
// MODEL
// ==========================================

export const News: Model<INewsDocument> =
	mongoose.models.News || mongoose.model<INewsDocument>('News', newsSchema)
