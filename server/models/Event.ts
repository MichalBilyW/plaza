/**
 * Event Model - Akce/Slevy
 * Jednoduchý model pro akce vázané na obchody
 */

import type { Document, Model, Types } from 'mongoose'
import mongoose, { Schema } from 'mongoose'

// ==========================================
// INTERFACE
// ==========================================

export interface IEvent {
	/** Interní název akce (jen pro CMS, nezobrazuje se na webu) */
	name: string
	/** Čtvercový obrázek akce */
	image: string
	/** Obsah akce (WYSIWYG) - volitelné */
	content?: string
	/** Vazba na obchod */
	shopId: Types.ObjectId
	/** Pořadí pro řazení */
	sortOrder: number
	/** Je akce aktivní */
	isActive: boolean
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
		name: {
			type: String,
			required: [true, 'Název akce je povinný'],
			trim: true,
			maxlength: 200,
		},
		image: {
			type: String,
			required: [true, 'Obrázek akce je povinný'],
		},
		content: {
			type: String,
			maxlength: 50000,
		},
		shopId: {
			type: Schema.Types.ObjectId,
			ref: 'Shop',
			required: [true, 'Obchod je povinný'],
			index: true,
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
	},
	{
		timestamps: true,
		toJSON: {
			transform: (_doc: unknown, ret: Record<string, unknown>) => {
				ret._id = String(ret._id)
				if (ret.shopId) ret.shopId = String(ret.shopId)
				delete ret.__v
				return ret
			},
		},
	},
)

// ==========================================
// INDEXES
// ==========================================

eventSchema.index({ name: 'text' })
eventSchema.index({ isActive: 1, sortOrder: 1 })
eventSchema.index({ shopId: 1, isActive: 1 })

// ==========================================
// MODEL
// ==========================================

export const Event: Model<IEventDocument> =
	mongoose.models.Event || mongoose.model<IEventDocument>('Event', eventSchema)
