import { MongoClient } from 'mongodb'

async function setFirstFloor() {
	const uri = 'mongodb+srv://plaza_admin:QmONpAcoV89CgnTt@ocplazaliberec.ifmcnz7.mongodb.net/ocplazaliberec-prod'
	const client = new MongoClient(uri)

	try {
		await client.connect()
		console.log('Připojeno k databázi')

		const db = client.db('ocplazaliberec-prod')
		const floors = db.collection('floors')
		const shops = db.collection('shops')

		// Najít 1. patro (level: 1)
		const firstFloor = await floors.findOne({ level: 1 })
		if (!firstFloor) {
			console.log('1. patro nenalezeno, hledám všechna patra...')
			const allFloors = await floors.find({}).toArray()
			console.log('Patra:', allFloors.map(f => ({ id: f._id.toString(), name: f.name, level: f.level })))
			return
		}
		console.log('1. patro:', firstFloor._id.toString(), firstFloor.name)

		// Nastavit všem obchodům floorId na 1. patro
		const result = await shops.updateMany(
			{},
			{ $set: { floorId: firstFloor._id } }
		)

		console.log('Aktualizováno obchodů:', result.modifiedCount)
		console.log('Hotovo!')
	} finally {
		await client.close()
	}
}

setFirstFloor()
