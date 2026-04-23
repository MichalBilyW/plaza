/**
 * Floor Model - Patra centra
 */

import type { Document, Model } from 'mongoose'
import mongoose, { Schema } from 'mongoose'

// ==========================================
// INTERFACE
// ==========================================

export interface IFloor {
	name: string
	level: number
	mapImage?: string
	/** SVG mapa patra - cesta k souboru */
	svgMap?: string
	/** Kódy jednotek obsazených soukromými nájemci */
	privateOccupiedUnitCodes?: string[]
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
		level: {
			type: Number,
			required: true,
			index: true,
		},
		mapImage: String,
		/** SVG mapa patra */
		svgMap: String,
		privateOccupiedUnitCodes: [
			{
				type: String,
				trim: true,
				maxlength: 20,
			},
		],
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

// level a slug mají index: true přímo ve schématu
floorSchema.index({ isActive: 1, sortOrder: 1 })

// ==========================================
// MODEL
// ==========================================

export const Floor: Model<IFloorDocument> =
	mongoose.models.Floor || mongoose.model<IFloorDocument>('Floor', floorSchema)
