/**
 * Homepage Model - Nastavení hlavní stránky (singleton)
 */

import mongoose, { Schema, Document, Model } from 'mongoose'

// ==========================================
// INTERFACES
// ==========================================

export interface IHomepage {
  heroImage?: string
}

export interface IHomepageDocument extends IHomepage, Document {
  createdAt: Date
  updatedAt: Date
}

// ==========================================
// SCHEMA
// ==========================================

const homepageSchema = new Schema(
  {
    heroImage: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

// ==========================================
// STATIC METHODS
// ==========================================

homepageSchema.statics.getOrCreate = async function () {
  let homepage = await this.findOne()
  if (!homepage) {
    homepage = await this.create({})
  }
  return homepage
}

// ==========================================
// MODEL
// ==========================================

interface IHomepageModel extends Model<IHomepageDocument> {
  getOrCreate(): Promise<IHomepageDocument>
}

export const Homepage =
  (mongoose.models.Homepage as IHomepageModel) ||
  mongoose.model<IHomepageDocument, IHomepageModel>('Homepage', homepageSchema)
