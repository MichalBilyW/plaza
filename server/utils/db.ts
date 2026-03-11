/**
 * MongoDB Connection Utility
 *
 * Implementuje connection pooling a caching pro serverless/SSR prostředí.
 * V development modu cachuje připojení globálně.
 */

import mongoose from 'mongoose'

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
