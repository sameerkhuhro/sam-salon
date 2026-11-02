import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { Setting } from '../src/models/Setting.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env') })

async function updateSalonSetting() {
  const rawUri = process.env.MONGODB_URI
  const maskedUri = rawUri ? rawUri.replace(/:([^@]+)@/, ':****@') : 'UNDEFINED'
  console.log('Connecting to Atlas cluster:', maskedUri)

  await mongoose.connect(rawUri, {
    dbName: 'salonhub',
    serverSelectionTimeoutMS: 15000,
  })

  let setting = await Setting.findOne()
  if (!setting) {
    setting = await Setting.create({
      salonName: 'SAM SALON',
      tagline: 'HAIR • BEAUTY • GROOMING',
      email: 'info@samsalon.pk',
      phone: '+92 300 1234567',
      address: "Mall Road, Near Clock Tower, Khairpur Mir's, Sindh, Pakistan",
    })
    console.log('Created setting document with SAM SALON.')
  } else {
    setting.salonName = 'SAM SALON'
    setting.tagline = 'HAIR • BEAUTY • GROOMING'
    setting.email = 'info@samsalon.pk'
    await setting.save()
    console.log('Updated setting document to SAM SALON:', setting.salonName, setting.tagline)
  }

  await mongoose.disconnect()
  console.log('Done.')
  process.exit(0)
}

updateSalonSetting().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})

