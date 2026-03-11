/**
 * User Model - CMS uživatelé
 */

import type { Document, Model } from 'mongoose';
import mongoose, { Schema } from 'mongoose'
import type { UserRole } from '@/shared/types'

// ==========================================
// INTERFACE
// ==========================================

export interface IUser {
	email: string
	password: string
	name: string
	role: UserRole
	isActive: boolean
	lastLoginAt?: Date
}

export interface IUserDocument extends IUser, Document {
	createdAt: Date
	updatedAt: Date
}

// ==========================================
// SCHEMA
// ==========================================

const userSchema = new Schema<IUserDocument>(
	{
		email: {
			type: String,
			required: [true, 'Email je povinný'],
			unique: true,
			lowercase: true,
			trim: true,
			index: true,
		},
		password: {
			type: String,
			required: [true, 'Heslo je povinné'],
			select: false, // Defaultně se nevrací
		},
		name: {
			type: String,
			required: [true, 'Jméno je povinné'],
			trim: true,
		},
		role: {
			type: String,
			enum: ['admin', 'editor'],
			default: 'editor',
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		lastLoginAt: {
			type: Date,
		},
	},
	{
		timestamps: true,
		toJSON: {
			transform: (_doc, ret) => {
				ret._id = ret._id.toString()
				delete ret.password
				delete ret.__v
				return ret
			},
		},
	},
)

// ==========================================
// INDEXES
// ==========================================

userSchema.index({ role: 1, isActive: 1 })

// ==========================================
// MODEL
// ==========================================

// Prevent model recompilation during HMR
export const User: Model<IUserDocument> =
	mongoose.models.User || mongoose.model<IUserDocument>('User', userSchema)
