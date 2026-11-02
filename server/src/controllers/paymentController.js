import { Payment } from '../models/Payment.js'
import { Appointment } from '../models/Appointment.js'

// Helper to generate Invoice number
const generateInvoiceNo = () => {
  const random = Math.floor(1000 + Math.random() * 9000)
  return `INV-${random}`
}

// GET /api/payments
export const getPayments = async (req, res) => {
  try {
    const { status, method, search } = req.query
    const filter = {}

    if (status && status !== 'all') {
      filter.status = status
    }
    if (method && method !== 'all') {
      filter.method = method
    }
    if (search) {
      const q = search.trim()
      filter.$or = [
        { invoiceNo: { $regex: q, $options: 'i' } },
        { customerName: { $regex: q, $options: 'i' } },
        { serviceName: { $regex: q, $options: 'i' } },
        { staffName: { $regex: q, $options: 'i' } },
      ]
    }

    const payments = await Payment.find(filter).sort({ createdAt: -1 })
    res.json({
      success: true,
      count: payments.length,
      payments,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payments',
      error: error.message,
    })
  }
}

// POST /api/payments
export const createPayment = async (req, res) => {
  try {
    const {
      appointmentId,
      appointmentRef,
      customerName,
      customerPhone,
      serviceName,
      staffName,
      amount,
      totalAmount,
      amountPaid,
      method,
      notes,
    } = req.body

    const finalTotal = Number(totalAmount !== undefined ? totalAmount : (amount !== undefined ? amount : 0))
    const finalPaid = Number(amountPaid !== undefined ? amountPaid : (amount !== undefined ? amount : 0))
    const finalOutstanding = Math.max(0, finalTotal - finalPaid)

    if (!customerName || !serviceName || finalTotal < 0 || finalPaid < 0) {
      return res.status(400).json({
        success: false,
        message: 'Customer name, service name, and valid amounts are required.',
      })
    }

    const invoiceNo = generateInvoiceNo()
    const today = new Date().toISOString().slice(0, 10)

    let paymentStatus = 'paid'
    if (finalPaid <= 0) {
      paymentStatus = 'pending'
    } else if (finalPaid < finalTotal) {
      paymentStatus = 'partial'
    } else {
      paymentStatus = 'paid'
    }

    const payment = await Payment.create({
      invoiceNo,
      appointmentId: appointmentId || null,
      appointmentRef: appointmentRef || '',
      customerName: customerName.trim(),
      customerPhone: customerPhone ? customerPhone.trim() : '',
      serviceName: serviceName.trim(),
      staffName: staffName ? staffName.trim() : 'Specialist',
      totalAmount: finalTotal,
      amountPaid: finalPaid,
      outstandingAmount: finalOutstanding,
      amount: finalPaid,
      method: method || 'Cash',
      status: paymentStatus,
      date: today,
      notes: notes || '',
    })

    // If linked to an appointment, update appointment payment status
    if (appointmentId) {
      const apptPaymentStatus = paymentStatus === 'paid' ? 'paid' : (paymentStatus === 'partial' ? 'partial' : 'unpaid')
      await Appointment.findByIdAndUpdate(appointmentId, {
        paymentStatus: apptPaymentStatus,
        paymentMethod: method || 'Cash',
      })
    }

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      payment,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to record payment',
      error: error.message,
    })
  }
}

// POST /api/payments/:id/refund
export const processRefund = async (req, res) => {
  try {
    const { amount, reason } = req.body
    const refundAmount = Number(amount)

    if (!refundAmount || refundAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid refund amount greater than 0 is required.',
      })
    }

    const payment = await Payment.findById(req.params.id)
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' })
    }

    const currentRefunded = (payment.refunds || []).reduce((sum, r) => sum + (r.amount || 0), 0)
    const paid = Number(payment.amountPaid || payment.amount || 0)
    const maxRefundable = paid - currentRefunded

    if (refundAmount > maxRefundable) {
      return res.status(400).json({
        success: false,
        message: `Refund of PKR ${refundAmount} exceeds maximum refundable amount (PKR ${maxRefundable}).`,
      })
    }

    payment.refunds.push({
      amount: refundAmount,
      reason: reason || 'Customer requested refund',
      date: new Date().toISOString().slice(0, 10),
    })

    const newTotalRefunded = currentRefunded + refundAmount
    if (newTotalRefunded >= paid) {
      payment.status = 'refunded'
    } else {
      payment.status = 'partially_paid'
    }

    await payment.save()

    // Update associated appointment finances if linked
    if (payment.appointmentId) {
      const appt = await Appointment.findById(payment.appointmentId)
      if (appt) {
        appt.amountPaid = Math.max(0, (appt.amountPaid || 0) - refundAmount)
        appt.outstandingAmount = Math.max(0, (appt.price || 0) - appt.amountPaid)
        if (appt.amountPaid === 0) {
          appt.paymentStatus = 'refunded'
        } else if (appt.amountPaid < (appt.price || 0)) {
          appt.paymentStatus = 'partially_paid'
        } else {
          appt.paymentStatus = 'paid'
        }
        await appt.save()
      }
    }

    res.json({
      success: true,
      message: `Refund of PKR ${refundAmount.toLocaleString()} recorded successfully`,
      payment,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to process refund',
      error: error.message,
    })
  }
}

// PUT /api/payments/:id/status
export const updatePaymentStatus = async (req, res) => {
  try {
    const { status, notes } = req.body
    const payment = await Payment.findById(req.params.id)

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' })
    }

    payment.status = status
    if (notes) payment.notes = (payment.notes ? payment.notes + ' · ' : '') + notes
    await payment.save()

    res.json({
      success: true,
      message: `Payment status updated to ${status}`,
      payment,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: error.message,
    })
  }
}

