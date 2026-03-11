/**
 * Seed script - vytvoří admin uživatele v databázi
 *
 * Spuštění: npx tsx scripts/seed-admin.ts
 */

import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import { config } from 'dotenv'

// Načti .env
config()

const MONGO_URI = process.env.NUXT_MONGO_URI

if (!MONGO_URI) {
	console.error('❌ NUXT_MONGO_URI není nastavena v .env')
	process.exit(1)
}

// Admin credentials - ZMĚŇTE PO PRVNÍM PŘIHLÁŠENÍ!
const ADMIN_EMAIL = 'admin@ocplaza.cz'
const ADMIN_PASSWORD = 'Plaza2026!' // Změňte po přihlášení!
const ADMIN_NAME = 'Administrátor'

// User schema (inline pro jednoduchost)
const userSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		password: {
			type: String,
			required: true,
		},
		name: {
			type: String,
			required: true,
			trim: true,
		},
		role: {
			type: String,
			enum: ['admin', 'editor', 'viewer'],
			default: 'viewer',
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
	},
)

const User = mongoose.model('User', userSchema)

async function seed() {
	console.log('🔄 Připojování k MongoDB Atlas...')

	try {
		await mongoose.connect(MONGO_URI)
		console.log('✅ Připojeno k MongoDB Atlas')

		// Zkontroluj zda admin už existuje
		const existingAdmin = await User.findOne({ email: ADMIN_EMAIL })

		if (existingAdmin) {
			console.log(`⚠️  Admin uživatel ${ADMIN_EMAIL} již existuje`)
			console.log(
				'   Pokud chcete resetovat heslo, smažte uživatele v Atlas a spusťte znovu.',
			)
		} else {
			// Hashuj heslo
			const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12)

			// Vytvoř admina
			const admin = await User.create({
				email: ADMIN_EMAIL,
				password: hashedPassword,
				name: ADMIN_NAME,
				role: 'admin',
				isActive: true,
			})

			console.log('✅ Admin uživatel vytvořen:')
			console.log(`   📧 Email: ${ADMIN_EMAIL}`)
			console.log(`   🔑 Heslo: ${ADMIN_PASSWORD}`)
			console.log(`   👤 Jméno: ${ADMIN_NAME}`)
			console.log(`   🆔 ID: ${admin._id}`)
			console.log('')
			console.log('⚠️  DŮLEŽITÉ: Změňte heslo po prvním přihlášení!')
		}
	} catch (error) {
		console.error('❌ Chyba:', error)
		process.exit(1)
	} finally {
		await mongoose.disconnect()
		console.log('👋 Odpojeno od MongoDB')
	}
}

seed()
