/**
 * MongoDB Connection Utility
 *
 * Implementuje connection pooling a caching pro serverless/SSR prostředí.
 * V development modu cachuje připojení globálně.
 */

import mongoose from 'mongoose'

// Import all models to ensure they're registered with mongoose
// This is critical for production builds where tree-shaking can remove unused imports
import { User } from '@/server/models/User'
import { Shop } from '@/server/models/Shop'
import { Event } from '@/server/models/Event'
import { News } from '@/server/models/News'
import { Floor } from '@/server/models/Floor'
import { Service } from '@/server/models/Service'
import { Session } from '@/server/models/Session'
import { GeneralInfo } from '@/server/models/GeneralInfo'
import { Category } from '@/server/models/Category'
import { Homepage } from '@/server/models/Homepage'

// Force models to be registered by accessing their modelName
const registeredModels = [
	User.modelName,
	Shop.modelName,
	Event.modelName,
	News.modelName,
	Floor.modelName,
	Service.modelName,
	Session.modelName,
	GeneralInfo.modelName,
	Category.modelName,
	Homepage.modelName,
]

// Globální cache pro development (HMR)
declare global {
	var mongooseCache: {
		conn: typeof mongoose | null
		promise: Promise<typeof mongoose> | null
	}
}

// Inicializace cache
if (!global.mongooseCache) {
	global.mongooseCache = { conn: null, promise: null }
}

const cache = global.mongooseCache

/**
 * Získání MongoDB připojení
 * Používá cache pro opakované volání
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
	const config = useRuntimeConfig()
	const mongoUri = config.mongoUri

	if (!mongoUri) {
		throw new Error('MONGO_URI is not defined in environment variables')
	}

	// Pokud už máme připojení, vrátíme ho
	if (cache.conn) {
		return cache.conn
	}

	// Pokud běží připojování, počkáme na něj
	if (cache.promise) {
		cache.conn = await cache.promise
		return cache.conn
	}

	// Nové připojení
	cache.promise = mongoose.connect(mongoUri, {
		bufferCommands: false,
		maxPoolSize: 10,
		serverSelectionTimeoutMS: 5000,
		socketTimeoutMS: 45000,
	})

	try {
		cache.conn = await cache.promise
		console.log('✅ MongoDB connected successfully')
		console.log('📦 Registered models:', registeredModels.join(', '))
		return cache.conn
	} catch (error) {
		cache.promise = null
		console.error('❌ MongoDB connection failed:', error)
		throw error
	}
}

/**
 * Odpojení od MongoDB (pro cleanup)
 */
export async function disconnectFromDatabase(): Promise<void> {
	if (cache.conn) {
		await mongoose.disconnect()
		cache.conn = null
		cache.promise = null
		console.log('MongoDB disconnected')
	}
}

/**
 * Helper pro použití v API routes
 * Automaticky zajistí připojení před provedením operace
 */
export function withDatabase<T>(handler: () => Promise<T>): Promise<T> {
	return connectToDatabase().then(() => handler())
}
