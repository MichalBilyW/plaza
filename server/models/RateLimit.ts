/**
 * RateLimit Model - perzistentní rate limiting přes MongoDB
 *
 * Nahrazuje in-memory store. Záznamy jsou automaticky mazány
 * TTL indexem po vypršení blokace/okna.
 */

import type { Document, Model } from 'mongoose'
import mongoose, { Schema } from 'mongoose'

// ==========================================
// INTERFACE
// ==========================================

export interface IRateLimit {
	key: string
	count: number
	resetAt: Date
	blockedUntil: Date | null
	expiresAt: Date
}

export interface IRateLimitDocument extends IRateLimit, Document {}

// ==========================================
// SCHEMA
// ==========================================

const rateLimitSchema = new Schema<IRateLimitDocument>({
	key: {
		type: String,
		required: true,
		unique: true,
		index: true,
	},
	count: {
		type: Number,
		required: true,
		default: 1,
	},
	resetAt: {
		type: Date,
		required: true,
	},
	blockedUntil: {
		type: Date,
		default: null,
	},
	expiresAt: {
		type: Date,
		required: true,
	},
})

// TTL index – MongoDB automaticky smaže záznam po expiresAt
rateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

// ==========================================
// MODEL
// ==========================================

export const RateLimit: Model<IRateLimitDocument> =
	mongoose.models.RateLimit || mongoose.model<IRateLimitDocument>('RateLimit', rateLimitSchema)
