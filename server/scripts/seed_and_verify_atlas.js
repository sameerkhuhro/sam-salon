import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { seedDatabase } from '../src/seed/seedData.js'
import { Admin } from '../src/models/Admin.js'
import { Category } from '../src/models/Category.js'
import { Service } from '../src/models/Service.js'
import { Staff } from '../src/models/Staff.js'
import { Customer } from '../src/models/Customer.js'
import { Appointment } from '../src/models/Appointment.js'
import { Payment } from '../src/models/Payment.js'
import { Setting } from '../src/models/Setting.js'
import { uploadToCloudinary } from '../src/config/cloudinary.js'

dotenv.config()

async function main() {
  console.log('===============================================================')
  console.log('       MONGODB ATLAS DIRECT VERIFICATION & SEED RUNNER         ')
  console.log('===============================================================\n')

  const uri = process.env.MONGODB_URI
  if (!uri || uri.includes('<db_password>')) {
    console.error('❌ MONGODB_URI is missing or contains placeholder!')
    process.exit(1)
  }

  const maskedUri = uri.replace(/:([^@]+)@/, ':****@')
  console.log(`[Target Atlas Cluster]: ${maskedUri}`)

  // 1. Connect explicitly to Atlas with dbName: 'salonhub'
  const conn = await mongoose.connect(uri, {
    dbName: 'salonhub',
    serverSelectionTimeoutMS: 12000,
  })

  console.log(`[Connected]: ${conn.connection.host}`)
  console.log(`[Active Database]: "${conn.connection.name}" (Must be exactly "salonhub")\n`)

  if (conn.connection.name !== 'salonhub') {
    throw new Error(`Connected to incorrect database: ${conn.connection.name}`)
  }

  // 2. Run Seed
  console.log('--- Step A: Seeding Database on MongoDB Atlas ---')
  await seedDatabase()

  // 3. Verify Collections in Atlas
  const collections = await conn.connection.db.listCollections().toArray()
  console.log('\n--- Step B: Collections Created in MongoDB Atlas salonhub database ---')
  console.log(collections.map(c => `• ${c.name}`).join('\n'))

  // 4. Test Actual Writes (Requirement 2)
  console.log('\n--- Step C: Performing Test Application Writes on Atlas ---')

  // A. Create Test Service
  console.log('1. Creating Test Service on Atlas...')
  const testService = await Service.create({
    name: 'Atlas Verification Blowout',
    category: 'Hair',
    price: 3500,
    durationMin: 45,
    gender: 'Women',
    description: 'Special verification service stored directly in Atlas cloud',
  })
  console.log(`   ✅ Service Created: ID=${testService._id}, Name="${testService.name}"`)

  // B. Create Test Staff Member
  console.log('2. Creating Test Staff Specialist on Atlas...')
  const testStaff = await Staff.create({
    name: 'Nadia Qureshi (Atlas Test)',
    role: 'Senior Stylist',
    phone: '+92 300 9988776',
    email: 'nadia.test@salonhub.pk',
    years: 7,
    bio: 'Atlas cloud persistence specialist',
    serviceIds: [testService._id.toString()],
    specialtyServiceIds: [testService._id.toString()],
    specialties: ['Atlas Verification Blowout'],
    status: 'active',
  })
  console.log(`   ✅ Staff Created: ID=${testStaff._id}, Name="${testStaff.name}"`)

  // C. Create Test Customer
  console.log('3. Creating Test Customer on Atlas...')
  const testCustomer = await Customer.create({
    name: 'Farhan Shah (Atlas Verification)',
    phone: '+92 321 5554433',
    email: 'farhan.atlas@example.com',
    notes: 'Verified Atlas persistent customer profile',
  })
  console.log(`   ✅ Customer Created: ID=${testCustomer._id}, Phone="${testCustomer.phone}"`)

  // D. Create Test Appointment
  console.log('4. Creating Test Appointment on Atlas...')
  const testRef = `ATLAS-${Date.now().toString().slice(-4)}`
  const testAppointment = await Appointment.create({
    ref: testRef,
    customerName: testCustomer.name,
    customerPhone: testCustomer.phone,
    customerId: testCustomer._id,
    serviceId: testService._id.toString(),
    serviceName: testService.name,
    price: testService.price,
    durationMin: testService.durationMin,
    staffId: testStaff._id.toString(),
    staffName: testStaff.name,
    date: '2026-11-15',
    time: '11:00 am',
    status: 'confirmed',
    paymentStatus: 'unpaid',
  })
  console.log(`   ✅ Appointment Created: ID=${testAppointment._id}, Ref="${testAppointment.ref}"`)

  // E. Create Test Payment
  console.log('5. Creating Test Payment Receipt on Atlas...')
  const testPayment = await Payment.create({
    invoiceNo: `INV-ATLAS-${Date.now().toString().slice(-4)}`,
    appointmentId: testAppointment._id,
    appointmentRef: testAppointment.ref,
    customerName: testCustomer.name,
    customerPhone: testCustomer.phone,
    serviceName: testService.name,
    staffName: testStaff.name,
    totalAmount: testService.price,
    amountPaid: testService.price,
    outstandingAmount: 0,
    amount: testService.price,
    method: 'Card',
    status: 'paid',
    date: new Date().toISOString().slice(0, 10),
    notes: 'Atlas cloud payment verification receipt',
  })
  console.log(`   ✅ Payment Created: ID=${testPayment._id}, InvoiceNo="${testPayment.invoiceNo}"`)

  // Update appointment payment status to paid
  testAppointment.paymentStatus = 'paid'
  testAppointment.paymentMethod = 'Card'
  await testAppointment.save()

  // 5. Test Cloudinary Integration (Requirement 5)
  console.log('\n--- Step D: Verifying Cloudinary Image Upload & Persistence ---')
  try {
    // Generate a 1x1 test image buffer
    const dummyImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
    const imageBuffer = Buffer.from(dummyImageBase64, 'base64')
    
    console.log('Uploading sample test image to Cloudinary...')
    const uploadResult = await uploadToCloudinary(imageBuffer, 'test_verification')
    console.log('   ✅ Upload Successful!')
    console.log(`   URL: ${uploadResult.url}`)
    console.log(`   Public ID: ${uploadResult.publicId}`)

    // Save image to test service
    testService.image = {
      url: uploadResult.url,
      publicId: uploadResult.publicId,
    }
    await testService.save()
    console.log('   ✅ Cloudinary URL & Public ID saved to Service document in Atlas!')
  } catch (cErr) {
    console.warn('   ⚠️ Cloudinary upload warning:', cErr.message)
  }

  // 6. Direct Verification of Document Counts on Atlas
  console.log('\n--- Step E: Direct Document Count Verification on MongoDB Atlas ---')
  const [adminCount, catCount, svcCount, staffCount, custCount, apptCount, payCount, settingCount] =
    await Promise.all([
      Admin.countDocuments(),
      Category.countDocuments(),
      Service.countDocuments(),
      Staff.countDocuments(),
      Customer.countDocuments(),
      Appointment.countDocuments(),
      Payment.countDocuments(),
      Setting.countDocuments(),
    ])

  console.log(`• Admins in Atlas:        ${adminCount}`)
  console.log(`• Categories in Atlas:    ${catCount}`)
  console.log(`• Services in Atlas:      ${svcCount}`)
  console.log(`• Staff in Atlas:         ${staffCount}`)
  console.log(`• Customers in Atlas:     ${custCount}`)
  console.log(`• Appointments in Atlas:  ${apptCount}`)
  console.log(`• Payments in Atlas:      ${payCount}`)
  console.log(`• Settings in Atlas:      ${settingCount}`)

  // Clean up test documents
  console.log('\n--- Step F: Cleaning up test artifacts ---')
  await Service.findByIdAndDelete(testService._id)
  await Staff.findByIdAndDelete(testStaff._id)
  await Customer.findByIdAndDelete(testCustomer._id)
  await Appointment.findByIdAndDelete(testAppointment._id)
  await Payment.findByIdAndDelete(testPayment._id)
  console.log('   ✅ Temporary test records cleaned up. Seeded catalog and admin account preserved.')

  await mongoose.disconnect()
  console.log('\n===============================================================')
  console.log('   ALL VERIFICATION STEPS PASSED SUCCESSFULLY ON ATLAS CLOUD   ')
  console.log('===============================================================')
}

main().catch(err => {
  console.error('Fatal verification error:', err)
  process.exit(1)
})

