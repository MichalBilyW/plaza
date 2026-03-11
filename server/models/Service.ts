/**
 * Service Model - Služby pro návštěvníky
 */

import type { Document, Model, Types } from 'mongoose';
import mongoose, { Schema } from 'mongoose'

// ==========================================
// INTERFACE
// ==========================================

export interface IService {
	name: string
	slug: string
	description: string
	shortDescription?: string
	icon?: string
	image?: string
	location?: string
	floorId?: Types.ObjectId
	phone?: string
	email?: string
	isActive: boolean
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
		name: {
			type: String,
			required: [true, 'Název služby je povinný'],
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
			required: [true, 'Popis je povinný'],
			maxlength: 2000,
		},
		shortDescription: {
			type: String,
			maxlength: 300,
		},
		icon: String,
		image: String,
		location: {
			type: String,
			maxlength: 200,
		},
		floorId: {
			type: Schema.Types.ObjectId,
			ref: 'Floor',
		},
		phone: String,
		email: {
			type: String,
			lowercase: true,
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
				if (ret.floorId) ret.floorId = ret.floorId.toString()
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
serviceSchema.index({ name: 'text', description: 'text' })

// ==========================================
// MODEL
// ==========================================

export const Service: Model<IServiceDocument> =
	mongoose.models.Service || mongoose.model<IServiceDocument>('Service', serviceSchema)
