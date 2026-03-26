/**
 * GeneralInfo Model - Obecné informace o centru (singleton)
 */

import type { Document, Model } from 'mongoose'
import mongoose, { Schema } from 'mongoose'
import type { DayOfWeek } from '@/shared/types'

// ==========================================
// INTERFACES
// ==========================================

export interface IOpeningHoursEntry {
	day: DayOfWeek
	open: string
	close: string
	closed?: boolean
}

export interface ISpecialOpeningHours {
	date?: Date
	dateFrom?: Date
	dateTo?: Date
	open?: string
	close?: string
	closed?: boolean
	note?: string
}

export interface IGeneralInfo {
	title?: string
	shortText?: string
	text?: string
	openingHours?: IOpeningHoursEntry[]
	specialOpeningHours?: ISpecialOpeningHours[]
	facebook?: string
	instagram?: string
	gallery?: string[]
}

export interface IGeneralInfoDocument extends IGeneralInfo, Document {
	createdAt: Date
	updatedAt: Date
}

// ==========================================
// SUB-SCHEMAS
// ==========================================

const openingHoursEntrySchema = new Schema(
	{
		day: {
			type: String,
			enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
			required: true,
		},
		open: { type: String, default: '09:00' },
		close: { type: String, default: '21:00' },
		closed: { type: Boolean, default: false },
	},
	{ _id: false },
)

const specialOpeningHoursSchema = new Schema(
	{
		date: { type: Date },
		dateFrom: { type: Date },
		dateTo: { type: Date },
		open: { type: String },
		close: { type: String },
		closed: { type: Boolean, default: false },
		note: { type: String, maxlength: 200 },
	},
	{ _id: false },
)

// ==========================================
// MAIN SCHEMA
// ==========================================

const generalInfoSchema = new Schema<IGeneralInfoDocument>(
	{
		title: {
			type: String,
			maxlength: 200,
			trim: true,
		},
		shortText: {
			type: String,
			maxlength: 500,
			trim: true,
		},
		text: {
			type: String,
			maxlength: 10000,
		},
		openingHours: [openingHoursEntrySchema],
		specialOpeningHours: [specialOpeningHoursSchema],
		facebook: {
			type: String,
			trim: true,
		},
		instagram: {
			type: String,
			trim: true,
		},
		gallery: [
			{
				type: String,
			},
		],
	},
	{
		timestamps: true,
	},
)

// ==========================================
// STATIC METHODS
// ==========================================

generalInfoSchema.statics.getOrCreate = async function () {
	let info = await this.findOne()
	if (!info) {
		info = await this.create({
			openingHours: [
				{ day: 'monday', open: '09:00', close: '21:00', closed: false },
				{ day: 'tuesday', open: '09:00', close: '21:00', closed: false },
				{ day: 'wednesday', open: '09:00', close: '21:00', closed: false },
				{ day: 'thursday', open: '09:00', close: '21:00', closed: false },
				{ day: 'friday', open: '09:00', close: '21:00', closed: false },
				{ day: 'saturday', open: '09:00', close: '21:00', closed: false },
				{ day: 'sunday', open: '09:00', close: '21:00', closed: false },
			],
		})
	}
	return info
}

// ==========================================
// MODEL
// ==========================================

interface IGeneralInfoModel extends Model<IGeneralInfoDocument> {
	getOrCreate(): Promise<IGeneralInfoDocument>
}

export const GeneralInfo =
	(mongoose.models.GeneralInfo as IGeneralInfoModel) ||
	mongoose.model<IGeneralInfoDocument, IGeneralInfoModel>('GeneralInfo', generalInfoSchema)
