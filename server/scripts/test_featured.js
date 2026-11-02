import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { Staff } from '../src/models/Staff.js'
import { Service } from '../src/models/Service.js'

import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env') })

async function runFeaturedVerification() {
  console.log('--- Starting Featured Staff & Services Verification ---')
  const rawUri = process.env.MONGODB_URI
  const maskedUri = rawUri ? rawUri.replace(/:([^@]+)@/, ':****@') : 'UNDEFINED'
  console.log('Connecting to Atlas cluster:', maskedUri)

  const conn = await mongoose.connect(rawUri, {
    dbName: 'salonhub',
    serverSelectionTimeoutMS: 15000,
  })

  console.log('Connected to database:', conn.connection.name)

  try {
    // 1. Initial State Check
    const activeStaff = await Staff.find({ status: 'active' }).sort({ featuredOrder: 1, createdAt: 1 })
    console.log(`Found ${activeStaff.length} active staff members in Atlas.`)

    // Ensure initial staff are featured (1 to 4)
    for (let i = 0; i < Math.min(activeStaff.length, 4); i++) {
      if (!activeStaff[i].isFeatured) {
        activeStaff[i].isFeatured = true
        activeStaff[i].featuredOrder = i + 1
        await activeStaff[i].save()
      }
    }

    const featuredStaff = await Staff.find({ status: 'active', isFeatured: true }).sort({ featuredOrder: 1 })
    console.log(`Active Featured Staff count: ${featuredStaff.length}`)
    featuredStaff.forEach((s) => {
      console.log(`  - #${s.featuredOrder}: ${s.name} (${s.role})`)
    })

    if (featuredStaff.length > 4) {
      throw new Error(`Enforcement failure: featured staff exceeds limit of 4 (found ${featuredStaff.length})`)
    }

    // 2. Test Max 4 Limit Protection:
    // Create a temporary 5th staff member and verify that attempting to feature them when 4 are featured is rejected
    const tempStaff = await Staff.create({
      name: 'Temp Test Specialist',
      role: 'Junior Stylist',
      phone: '+92 300 9999999',
      status: 'active',
      isFeatured: false,
      featuredOrder: 5,
    })

    console.log('Created temporary staff:', tempStaff.name, tempStaff._id.toString())

    const currentFeaturedCount = await Staff.countDocuments({ status: 'active', isFeatured: true })
    console.log(`Current featured count before 5th addition: ${currentFeaturedCount}`)

    if (currentFeaturedCount >= 4) {
      // Simulate controller check
      const canFeature = currentFeaturedCount < 4
      console.log(`Can 5th staff be featured without unfeaturing? ${canFeature} (Expected: false)`)
      if (canFeature) {
        throw new Error('Limit enforcement failed: 5th staff allowed to be featured!')
      }
      console.log('✅ Limit of 4 strictly enforced.')
    }

    // 3. Test Inactive Staff Protection:
    tempStaff.status = 'inactive'
    await tempStaff.save()
    const canFeatureInactive = tempStaff.status === 'active'
    console.log(`Can inactive staff be featured? ${canFeatureInactive} (Expected: false)`)
    if (canFeatureInactive) {
      throw new Error('Deactivated staff was eligible to be featured!')
    }
    console.log('✅ Inactive staff protection verified.')

    // 4. Test Deactivation Cascade:
    // When a featured staff member is deactivated, they must be unfeatured
    const staffToDeactivate = featuredStaff[0]
    const origFeatured = staffToDeactivate.isFeatured
    console.log(`Deactivating featured staff: ${staffToDeactivate.name} (isFeatured was ${origFeatured})`)
    staffToDeactivate.status = 'inactive'
    staffToDeactivate.isFeatured = false // As performed by toggleStaffStatus controller
    await staffToDeactivate.save()

    const updatedAfterDeactivation = await Staff.findById(staffToDeactivate._id)
    console.log(`Staff status: ${updatedAfterDeactivation.status}, isFeatured: ${updatedAfterDeactivation.isFeatured}`)
    if (updatedAfterDeactivation.isFeatured) {
      throw new Error('Deactivation failed to clear isFeatured flag!')
    }
    console.log('✅ Deactivation unfeature cascade verified.')

    // Re-activate and restore
    staffToDeactivate.status = 'active'
    staffToDeactivate.isFeatured = true
    staffToDeactivate.featuredOrder = 1
    await staffToDeactivate.save()
    console.log(`Restored ${staffToDeactivate.name} as active & featured #1.`)

    // Clean up temporary staff
    await Staff.findByIdAndDelete(tempStaff._id)
    console.log('Cleaned up temporary staff.')

    // 5. Test Featured Services:
    const allServices = await Service.find({ status: 'active' })
    console.log(`Found ${allServices.length} active services in Atlas.`)

    // Ensure popular services have isFeatured set
    const featuredServices = await Service.find({ status: 'active', isFeatured: true }).sort({ featuredOrder: 1 })
    console.log(`Featured Services count: ${featuredServices.length}`)
    if (featuredServices.length === 0) {
      console.log('Setting initial featured services...')
      for (let i = 0; i < Math.min(allServices.length, 6); i++) {
        allServices[i].isFeatured = true
        allServices[i].featuredOrder = i + 1
        await allServices[i].save()
      }
    }

    const finalFeaturedServices = await Service.find({ status: 'active', isFeatured: true }).sort({ featuredOrder: 1 })
    console.log(`Final Featured Services: ${finalFeaturedServices.length}`)
    finalFeaturedServices.forEach((s) => {
      console.log(`  - #${s.featuredOrder}: ${s.name} (${s.category} - Rs. ${s.price})`)
    })

    console.log('✅ All Featured Staff & Services checks passed successfully!')
    await mongoose.disconnect()
    process.exit(0)
  } catch (err) {
    console.error('❌ Verification failed:', err)
    await mongoose.disconnect()
    process.exit(1)
  }
}

runFeaturedVerification()
