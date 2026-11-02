import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

async function testAtlas() {
  console.log('Testing MongoDB connection from server/.env...')
  const rawUri = process.env.MONGODB_URI

  // Mask password for safety
  const maskedUri = rawUri ? rawUri.replace(/:([^@]+)@/, ':****@') : 'UNDEFINED'
  console.log('Target URI (masked):', maskedUri)

  try {
    const conn = await mongoose.connect(rawUri, {
      dbName: 'salonhub',
      serverSelectionTimeoutMS: 10000,
    })

    console.log('✅ Connection Successful!')
    console.log('Host:', conn.connection.host)
    console.log('Database Name:', conn.connection.name)

    // Check list of collections
    const collections = await conn.connection.db.listCollections().toArray()
    console.log('Existing Collections in', conn.connection.name, ':', collections.map(c => c.name))

    await mongoose.disconnect()
    console.log('Disconnected cleanly.')
    process.exit(0)
  } catch (err) {
    console.error('❌ Connection Failed:', err.message)
    process.exit(1)
  }
}

testAtlas()

