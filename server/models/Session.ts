/**
 * Session Model - pro tracking a revokaci session
 */

import type { Document, Model } from 'mongoose'
import mongoose, { Schema } from 'mongoose'

// ==========================================
// INTERFACE
// ==========================================

export interface ISession {
	userId: mongoose.Types.ObjectId
	refreshToken: string
	userAgent?: string
	ipAddress?: string
	isValid: boolean
	expiresAt: Date
	lastActivityAt: Date
}

export interface ISessionDocument extends ISession, Document {
	createdAt: Date
	updatedAt: Date
}

// ==========================================
// SCHEMA
// ==========================================

const sessionSchema = new Schema<ISessionDocument>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},
		refreshToken: {
			type: String,
			required: true,
			unique: true,
			index: true,
		},
		userAgent: {
			type: String,
			default: null,
		},
		ipAddress: {
			type: String,
			default: null,
		},
		isValid: {
			type: Boolean,
			default: true,
			index: true,
		},
		expiresAt: {
			type: Date,
			required: true,
		},
		lastActivityAt: {
			type: Date,
			default: Date.now,
		},
	},
	{
		timestamps: true,
	},
)

// Compound index pro rychlé vyhledávání
sessionSchema.index({ userId: 1, isValid: 1 })
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }) // TTL index - automatické mazání

// ==========================================
// MODEL
// ==========================================

export const Session: Model<ISessionDocument> =
	mongoose.models.Session || mongoose.model<ISessionDocument>('Session', sessionSchema)
