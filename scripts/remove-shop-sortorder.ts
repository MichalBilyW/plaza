/**
 * Script pro odstranění sortOrder z obchodů v databázi
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/plaza'

async function main() {
	console.log('Connecting to MongoDB...')
	await mongoose.connect(MONGODB_URI)
	console.log('Connected!')

	const db = mongoose.connection.db
	if (!db) {
		throw new Error('Database connection not established')
	}
	const shopsCollection = db.collection('shops')

	// Remove sortOrder field from all shops
	const result = await shopsCollection.updateMany(
		{ sortOrder: { $exists: true } },
		{ $unset: { sortOrder: '' } },
	)

	console.log(`Updated ${result.modifiedCount} shops (removed sortOrder field)`)

	await mongoose.disconnect()
	console.log('Done!')
}

main().catch(console.error)
