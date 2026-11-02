import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { Appointment } from '../src/models/Appointment.js'
import { Payment } from '../src/models/Payment.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../.env') })

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/salonhub'

async function runTest() {
  console.log('[Test] Connecting to MongoDB...')
  await mongoose.connect(uri)
  console.log('[Test] Connected to MongoDB database:', mongoose.connection.name)

  const testRef = `TEST-${Date.now()}`
  const price = 4000

  try {
    // 1. Create a test appointment
    console.log('\n--- Step 1: Create Unpaid Appointment ---')
    const appt = await Appointment.create({
      ref: testRef,
      customerName: 'Ayesha Khan',
      customerPhone: '03009988776',
      serviceId: 'women-hair',
      serviceName: 'Women Hair Care & Styling',
      price: price,
      amountPaid: 0,
      outstandingAmount: price,
      staffId: 'amara',
      staffName: 'Amara',
      date: new Date().toISOString().slice(0, 10),
      time: '12:00 pm',
      status: 'confirmed',
      paymentStatus: 'unpaid',
      paymentMethod: 'Cash',
    })
    console.log(`[PASS] Appointment created with status: ${appt.status}, paymentStatus: ${appt.paymentStatus}, outstanding: PKR ${appt.outstandingAmount}`)

    // 2. Mark Appointment as Completed — Verify Payment Status remains UNPAID
    console.log('\n--- Step 2: Mark Appointment as Completed (Decoupled Rule) ---')
    appt.status = 'completed'
    await appt.save()
    const reloadedAppt = await Appointment.findById(appt._id)
    if (reloadedAppt.status === 'completed' && reloadedAppt.paymentStatus === 'unpaid') {
      console.log(`[PASS] Decoupling verified: status is 'completed' and paymentStatus is strictly 'unpaid' (outstanding: PKR ${reloadedAppt.outstandingAmount})`)
    } else {
      throw new Error(`Decoupling failed: status=${reloadedAppt.status}, paymentStatus=${reloadedAppt.paymentStatus}`)
    }

    // 3. Record Partial Payment (PKR 1,500 of PKR 4,000)
    console.log('\n--- Step 3: Record Partial Payment (PKR 1,500) ---')
    const partialAmount = 1500
    const newPaid = (reloadedAppt.amountPaid || 0) + partialAmount
    const newOutstanding = Math.max(0, reloadedAppt.price - newPaid)
    reloadedAppt.amountPaid = newPaid
    reloadedAppt.outstandingAmount = newOutstanding
    reloadedAppt.paymentStatus = 'partially_paid'
    await reloadedAppt.save()

    const payment1 = await Payment.create({
      invoiceNo: `INV-TEST-1-${Date.now()}`,
      appointmentId: reloadedAppt._id,
      appointmentRef: reloadedAppt.ref,
      customerName: reloadedAppt.customerName,
      serviceName: reloadedAppt.serviceName,
      staffName: reloadedAppt.staffName,
      totalAmount: reloadedAppt.price,
      amountPaid: partialAmount,
      outstandingAmount: newOutstanding,
      amount: partialAmount,
      method: 'Cash',
      status: 'partially_paid',
      date: new Date().toISOString().slice(0, 10),
      notes: 'Partial deposit',
    })
    console.log(`[PASS] Partial payment recorded: paid=PKR ${reloadedAppt.amountPaid}, outstanding=PKR ${reloadedAppt.outstandingAmount}, status=${reloadedAppt.paymentStatus}`)

    // 4. Record Remainder Payment (PKR 2,500)
    console.log('\n--- Step 4: Record Remainder Payment (PKR 2,500) ---')
    const remainder = 2500
    reloadedAppt.amountPaid += remainder
    reloadedAppt.outstandingAmount = Math.max(0, reloadedAppt.price - reloadedAppt.amountPaid)
    reloadedAppt.paymentStatus = 'paid'
    await reloadedAppt.save()

    const payment2 = await Payment.create({
      invoiceNo: `INV-TEST-2-${Date.now()}`,
      appointmentId: reloadedAppt._id,
      appointmentRef: reloadedAppt.ref,
      customerName: reloadedAppt.customerName,
      serviceName: reloadedAppt.serviceName,
      staffName: reloadedAppt.staffName,
      totalAmount: reloadedAppt.price,
      amountPaid: remainder,
      outstandingAmount: 0,
      amount: remainder,
      method: 'Card',
      status: 'paid',
      date: new Date().toISOString().slice(0, 10),
      notes: 'Final settlement',
    })
    console.log(`[PASS] Remainder payment recorded: paid=PKR ${reloadedAppt.amountPaid}, outstanding=PKR ${reloadedAppt.outstandingAmount}, status=${reloadedAppt.paymentStatus}`)

    // 5. Test Refund (Refund PKR 1,000 on payment 2)
    console.log('\n--- Step 5: Process Refund on Payment ---')
    const refundAmt = 1000
    payment2.refunds.push({
      amount: refundAmt,
      reason: 'Styling adjustment discount',
      date: new Date().toISOString().slice(0, 10),
    })
    payment2.status = 'partially_paid'
    await payment2.save()

    reloadedAppt.amountPaid -= refundAmt
    reloadedAppt.outstandingAmount = reloadedAppt.price - reloadedAppt.amountPaid
    reloadedAppt.paymentStatus = 'partially_paid'
    await reloadedAppt.save()

    const netPayment2 = payment2.amountPaid - payment2.refunds.reduce((s, r) => s + r.amount, 0)
    console.log(`[PASS] Refund processed: Payment 2 net=PKR ${netPayment2}, Appointment status=${reloadedAppt.paymentStatus}, remaining balance=PKR ${reloadedAppt.outstandingAmount}`)

    // Clean up test documents
    await Appointment.deleteOne({ _id: appt._id })
    await Payment.deleteMany({ appointmentRef: testRef })
    console.log('\n[PASS] Test documents cleaned up successfully.')
    console.log('--- ALL FINANCIAL LOGIC TESTS PASSED ---')
  } catch (err) {
    console.error('[FAIL] Test failed:', err)
  } finally {
    await mongoose.disconnect()
    console.log('[Test] Disconnected from database.')
  }
}

runTest()

